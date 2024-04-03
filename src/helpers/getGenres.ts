import axios from '../services/axios';
import { IGenre } from '../types/IGenre';

type Responce = {
  genres: IGenre[];
};

export const getGenres = async () => {
  try {
    const genres = await axios.get<Responce>('/genre/movie/list');

    return genres.data.genres;
  } catch (err) {
    console.log('Genres erroor ' + err);
  }
};
