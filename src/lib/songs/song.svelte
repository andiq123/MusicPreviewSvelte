<script lang="ts">
	import Fa from 'svelte-fa/src/fa.svelte';
	import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
	import type { SongType } from '../types/song.type';
	import { currentSong, playStatus } from '../stores';
	import { PlayStatus } from '$lib/types/play-status.enum';
	export let song: SongType;
	let iconStatus = faPlay;
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
			iconStatus = faPlay;
			return;
		}
		switch (playStatus) {
			case PlayStatus.PLAYING:
				iconStatus = faPause;
				isLoading = false;
				break;
			case PlayStatus.PAUSED:
				iconStatus = faPlay;
				isLoading = false;
				break;
			case PlayStatus.LOADING:
				isLoading = true;
				break;
			default:
				iconStatus = faPlay;
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
				<Fa icon={iconStatus} />
			{/if}
		</button>
		<div class="flex flex-col">
			<div class="card-title">{song.title}</div>
			<p class="text-xs">{song.artist}</p>
		</div>
	</div>
</div>
