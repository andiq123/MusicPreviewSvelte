<script lang="ts">
	import type { SongType } from '../types/song.type';
	import { currentSong, playStatus } from '../stores';
	import { PlayStatus } from '$lib/types/play-status.enum';
	import agent from '$lib/agent';
	import { saveAs } from 'file-saver';
	const API_URL = import.meta.env.VITE_BASE_API;
	export let song: SongType;
	let iconStatus = 'fa-play';
	let isLoading = false;
	const MAX_LENGTH = 40;
	const trimIfTooLong = (str: string, limit: number) =>
		str.length > limit ? `${str.substring(0, limit)}...` : str;
	song = {
		...song,
		title: trimIfTooLong(song.title, MAX_LENGTH),
		artist: trimIfTooLong(song.artist, MAX_LENGTH)
	};

	//handle remote status change
	playStatus.subscribe((playStatus) => {
		if ($currentSong?.id !== song.id) {
			isLoading = false;
			iconStatus = 'fa-play';
			return;
		}
		switch (playStatus) {
			case PlayStatus.PLAYING:
				iconStatus = 'fa-pause';
				isLoading = false;
				break;
			case PlayStatus.PAUSED:
				iconStatus = 'fa-play';
				isLoading = false;
				break;
			case PlayStatus.LOADING:
				isLoading = true;
				break;
			default:
				iconStatus = 'fa-play';
				isLoading = false;
				break;
		}
	});

	const handleSong = () => {
		if ($currentSong?.id !== song.id) {
			isLoading = true;
			currentSong.set(song);
			return;
		}
		playStatus.update((prevState) => {
			switch (prevState) {
				case PlayStatus.PAUSED:
					return PlayStatus.PLAYING;
				case PlayStatus.PLAYING:
					return PlayStatus.PAUSED;
				default:
					return PlayStatus.PAUSED;
			}
		});
	};

	let isDownloading = false;
	const downloadFile = async () => {
		isDownloading = true;
		const data = await agent.songs.stream(song.streamUrl, song.artist);
		const downloadLink = API_URL + data.path;
		saveAs(downloadLink, song.artist + '.mp3');
		isDownloading = false;
	};
</script>

<div class="card w-full bg-base-300 my-1 rounded-none lg:rounded-xl">
	<div class="card-body flex flex-row py-1 px-4 text-xs">
		<button
			disabled={$playStatus === PlayStatus.LOADING}
			class="btn w-20 my-auto flex-row justify-center align-middle"
			on:click={handleSong}
			class:loading={isLoading}
		>
			{#if !isLoading}
				<i class="fa-solid {iconStatus}" />
			{/if}
		</button>
		<div class="flex flex-col">
			<div class="card-title">{song.title}</div>
			<p class="text-xs">{song.artist}</p>
		</div>
		<button class="btn ml-auto" class:loading={isDownloading} on:click={downloadFile}>
			<i class="fa-solid fa-download" />
		</button>
	</div>
</div>
