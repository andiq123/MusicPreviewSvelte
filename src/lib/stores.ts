import { writable } from 'svelte/store';
import { PlayStatus } from './types/play-status.enum';
import type { SongType } from './types/song.type';

export const currentSong = writable<SongType | null>(null);
export const playStatus = writable<PlayStatus>(PlayStatus.PAUSED);
