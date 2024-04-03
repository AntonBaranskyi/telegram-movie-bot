import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import axios from './src/services/axios';
import commands from './src/helpers/commands';
import { IMovieData, IResponce } from './src/types/IMovieData';
import { getGenres } from './src/helpers/getGenres';
import { displayMovie } from './src/helpers/displayMovie';

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
      let movieData: IMovieData | null = null;

      while (!movieData) {
        console.log('Enter');
        const randomMovieId = Math.floor(Math.random() * 999) + 1;

        try {
          const responce = await axios.get<IMovieData>(
            `/movie/${randomMovieId}`
          );

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

      displayMovie({ bot, movieData, chatId });
    }

    if (msg.text === '⭐️ About us') {
      await bot.sendPhoto(chatId, './src/assets/me.jpg', {
        caption: 'Course work made by <b>Anton Baranskyi</b>',
        parse_mode: 'HTML',
      });
    }

    if (msg.text === '⭐️ Popular film') {
    }

    if (msg.text === '⭐️ Find movie') {
      await bot.sendMessage(chatId, 'Please write movie name');

      isFindingMovie = true;

      if (isFindingMovie) {
        console.log('Find');

        const responce = await axios.get(`/search/movie?query=${msg.text}`);

        console.log(responce.data);
      }
    }

    if (msg.text === '⭐️ Film genres') {
      const genres = await getGenres();

      const buttons = genres.map((genre) => [
        { text: genre.name, callback_data: genre.id.toString() },
      ]);

      await bot.sendMessage(chatId, 'Choose your movie genre', {
        reply_markup: {
          inline_keyboard: buttons,
        },
      });
    }
  } catch (error) {
    console.log(error.message);
  }
});

let currentIndex = 0;
let movies: IMovieData[] = [];

bot.on('callback_query', async (callback) => {
  try {
    const { data } = callback;
    const chatId = callback.message.chat.id;

    if (data === 'continue') {
      currentIndex += 1;

      if (currentIndex >= movies.length) {
        currentIndex = 0;
      }
    } else {
      const genres = await getGenres();
      const movieWithGenres = await axios.get<IResponce>(
        `/discover/movie?with_genres=${data}`
      );

      const currentGenre = genres.find((genre) => genre.id === +data).name;

      await bot.sendMessage(chatId, `You choose ${currentGenre}`);

      movies = movieWithGenres.data.results;
      currentIndex = 0;
    }

    displayMovie({
      bot,
      movieData: movies[currentIndex],
      chatId,
      isCountable: true,
    });
  } catch (err) {
    console.log(err);
  }
});

bot.setMyCommands(commands);
