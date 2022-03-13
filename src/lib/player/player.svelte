<script lang="ts">
	import Fa from 'svelte-fa/src/fa.svelte';
	import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
	import { playStatus, currentSong } from '../stores';
	import { PlayStatus } from '$lib/types/play-status.enum';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import agent from '$lib/agent';
	let audio: HTMLAudioElement | null;
	let timer = 0;
	let maxTime = 0;

	currentSong.subscribe((song) => {
		if (!song && !audio) return;
		playStatus.set(PlayStatus.LOADING);
		const { streamUrl, title } = $currentSong;
		getPathAudio(streamUrl, title)
			.then((path) => {
				path = import.meta.env.VITE_BASE_API + path;
				audio.src = path;
			})
			.catch((err) => {
				playStatus.set(PlayStatus.PAUSED);
			});
	});

	//handle remote playStatus
	playStatus.subscribe((playStatus) => {
		switch (playStatus) {
			case PlayStatus.PLAYING:
				audio?.play();
				break;
			case PlayStatus.LOADING:
			case PlayStatus.PAUSED:
				audio?.pause();
				break;
			default:
				audio?.pause();
				break;
		}
	});

	const getPathAudio = async (url: string, title: string) => {
		const { path } = await agent.songs.stream(url, title);
		return path;
	};

	onMount(() => {
		audio!.oncanplay = () => {
			maxTime = audio.duration;
			playStatus.set(PlayStatus.PLAYING);
		};

		audio!.ontimeupdate = (e: any) => {
			timer = e.target.currentTime;
		};

		audio!.onended = (e: any) => {
			playStatus.set(PlayStatus.PAUSED);
		};
	});

	const handlePlay = () => {
		playStatus.update((prevState) => {
			if (prevState === PlayStatus.PLAYING) {
				return PlayStatus.PAUSED;
			}
			return PlayStatus.PLAYING;
		});
	};

	const convertTime = (time: number) => {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
	};
</script>

<audio bind:this={audio} hidden />
{#if $currentSong && audio}
	<div
		class="w-full left-0 fixed bottom-0 flex justify-center pointer-events-none"
		transition:fly={{ y: 30, duration: 300 }}
	>
		<div
			class:pointer-events-none={$playStatus === PlayStatus.LOADING}
			class="card lg:w-2/4 lg:rounded-xl w-full bg-neutral-focus rounded-none pointer-events-auto"
		>
			<div class="card-body w-full h-fit flex lg:flex-row flex-col">
				<button
					class="btn my-auto lg:w-20 w-full flex-row justify-center align-middle"
					class:loading={$playStatus === PlayStatus.LOADING}
					on:click={handlePlay}
				>
					{#if $playStatus === PlayStatus.PLAYING}
						<Fa icon={faPause} />
					{:else if $playStatus === PlayStatus.PAUSED}
						<Fa icon={faPlay} />
					{/if}
				</button>
				<div class="flex flex-col w-full">
					<div>
						<h2>{$currentSong.title}</h2>
						<h2>{$currentSong.artist}</h2>
					</div>
					<div class="flex lg:flex-row flex-col-reverse">
						<input
							class="range range-primary"
							type="range"
							bind:value={timer}
							max={maxTime}
							on:input={(e) => (audio.currentTime = e.target['value'])}
						/>
						<div class="flex px-5 mx-auto w-fit">
							<p>{convertTime(timer)}</p>
							/
							<p>{convertTime(maxTime)}</p>
						</div>
					</div>
				</div>
				<div class="hidden lg:block">
					<span>Volume</span>
					<input
						class="range range-primary"
						type="range"
						step="0.1"
						max="1"
						on:input={(e) => (audio.volume = e.target['value'])}
					/>
				</div>
			</div>
		</div>
	</div>
{/if}
