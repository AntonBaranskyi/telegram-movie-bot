import axios from 'axios';

const instanse = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
});

instanse.interceptors.request.use((config) => {
  config.headers.Authorization = process.env.API_KEY;

  return config;
});

export default instanse;
