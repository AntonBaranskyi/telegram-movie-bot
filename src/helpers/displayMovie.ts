import TelegramBot from 'node-telegram-bot-api';
import { IMovieData } from '../types/IMovieData';
import { getGenres } from './getGenres';

type Props = {
  bot: TelegramBot;
  movieData: IMovieData;
  chatId: number;
  isCountable?: boolean;
  isFind?: boolean;
};

export const displayMovie = async ({
  bot,
  movieData,
  chatId,
  isCountable = false,
  isFind = false,
}: Props) => {
  const genres = movieData?.genres?.map((genreItem) => genreItem.name);
  const countries = movieData?.production_countries?.map(
    (prodCountry) => prodCountry.name
  );

  const serverGenres = await getGenres();

  let movieGenres = [];

  if (isCountable || isFind) {
    movieGenres = movieData?.genre_ids.map((genreId) => {
      const genre = serverGenres.find((genre) => genre.id === genreId);

      return genre ? genre.name : '';
    });
  }

  console.log(movieGenres);

  if (movieData) {
    return await bot.sendPhoto(
      chatId,
      `${process.env.POSTER_ULR}/${movieData?.poster_path}`,
      {
        caption: `<b>${movieData?.title}</b>\n\n🎞Genres: ${
          !isCountable && !isFind ? genres.join(', ') : movieGenres.join(', ')
        }${countries ? '\n🌍Countries:' : ''} ${
          countries ? countries.join(' ,') : ''
        }\n📅Year: ${movieData?.release_date.slice(
          0,
          4
        )}\n⭐️Rating IMDb: ${movieData?.vote_average.toFixed(
          1
        )}\n🔞Category: ${movieData.adult ? 'R' : 'G'}\n\n\n${
          movieData.overview
        }`,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: isCountable
            ? [[{ text: 'Continue', callback_data: 'continue' }]]
            : [],
        },
      }
    );
  }
};
