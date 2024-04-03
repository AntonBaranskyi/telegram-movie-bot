import { IGenre } from './IGenre';

interface IProduction {
  iso_3166_1: string;
  name: string;
}

export interface IMovieData {
  adult: boolean;
  genres: IGenre[];
  overview: string;
  poster_path: string;
  release_date: string;
  title: string;
  vote_average: number;
  production_countries: IProduction[];
  genre_ids? : number[]
}

export interface IResponce {
  results: IMovieData[];
}
