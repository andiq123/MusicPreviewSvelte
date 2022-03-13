import axios, { type AxiosResponse } from 'axios';
import type { PagedResult } from './types/paged-result.type';
import type { SongType } from './types/song.type';
axios.defaults.baseURL = import.meta.env.VITE_BASE_API + '/api/';

const resposne = (res: AxiosResponse) => res.data;

const requests = {
	get: (url: string) => axios.get(url).then(resposne),
	post: (url: string, body: {}) => axios.post(url, body).then(resposne)
};

const songs = {
	search: (query: string, page = 1): Promise<PagedResult<SongType[]>> =>
		requests.get(`search?query=${query}&page=${page}`),
	getMainTracks: (): Promise<PagedResult<SongType[]>> => requests.get('search/main'),
	stream: (url: string, name: string) => requests.post('stream', { url, name })
};

const agent = {
	songs
};

export default agent;
