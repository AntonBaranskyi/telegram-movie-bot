import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import axios from './src/services/axios';
import commands from './src/helper/commands';

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

let isFindingMovie = false;

bot.on('message', async (msg) => {
  try {
    const chatId = msg.chat.id;
    console.log(msg);
    if (msg.text === '/start') {
      await bot.sendMessage(chatId, `Привіт, брадок ${msg.chat.first_name}.`);
    }

    if (msg.text === '/menu') {
      await bot.sendMessage(chatId, 'Bot menu', {
        reply_markup: {
          keyboard: [
            [{ text: '⭐️ Random movie' }, { text: '⭐️ Popular film' }],
            [
              { text: '⭐️ Film genres' },
              { text: '⭐️ About us' },
              { text: '⭐️ Find movie' },
            ],
            [{ text: '❌ Close menu' }],
          ],
          resize_keyboard: true,
        },
      });
    }

    if (msg.text === '❌ Close menu') {
      await bot.sendMessage(chatId, 'Menu is closed', {
        reply_markup: {
          remove_keyboard: true,
        },
      });
    }

    if (msg.text === '⭐️ Random movie') {
      let movieData = null;

      while (!movieData) {
        console.log('Enter');
        const randomMovieId = Math.floor(Math.random() * 999) + 1;

        try {
          const responce = await axios(`/movie/${randomMovieId}`);

          if (responce.status === 200) {
            movieData = responce.data;
          }
        } catch (error) {
          if (error.response.status === 404) {
            console.log('Movie not found. Retrying...');
          } else {
            throw error;
          }
        }
      }

      const genres = movieData.genres.map((genreItem) => genreItem.name);
      const countries = movieData.production_countries.map(
        (prodCountry) => prodCountry.name
      );

      await bot.sendPhoto(
        chatId,
        `${process.env.POSTER_ULR}/${movieData.poster_path}`,
        {
          caption: `<b>${movieData.title}</b>\n\n🎞Genres: ${genres.join(
            ', '
          )}\n🌍Countries: ${countries.join(
            ' ,'
          )}\n📅Year: ${movieData.release_date.slice(
            0,
            4
          )}\n⭐️Rating IMDb: ${movieData.vote_average.toFixed(
            1
          )}\n🔞Category: ${movieData.adult ? 'R' : 'G'}\n\n\n${
            movieData.overview
          }`,
          parse_mode: 'HTML',
        }
      );
    }

    if (msg.text === '⭐️ About us') {
      await bot.sendPhoto(chatId, './src/assets/me.jpg', {
        caption: 'Course work made by <b>Anton Baranskyi</b>',
        parse_mode: 'HTML',
      });
    }

    if (msg.text === '⭐️ Popular film') {
      isFindingMovie = true;

      if (isFindingMovie) {
        const responce = await axios.get(`/search/movie?query=${msg.text}`);
      }
    }

    if (msg.text === '⭐️ Find movie') {
      await bot.sendMessage(chatId, 'Please write movie name');
    }
  } catch (error) {
    console.log(error.message);
  }
});

bot.setMyCommands(commands);
