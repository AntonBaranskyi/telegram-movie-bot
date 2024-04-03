export const callBackQueryGenres = async (callback) => {
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
  }