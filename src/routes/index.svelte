<script context="module" lang="ts">
	/**
	 * @type {import('@sveltejs/kit').Load}
	 */
	export async function load({ url }) {
		const query = url.searchParams.get('query');
		const page = url.searchParams.get('page') || 1;

		let pagedResult: PagedResult<SongType[]>;

		try {
			if (query) {
				pagedResult = await agent.songs.search(query, page);
			} else {
				pagedResult = await agent.songs.getMainTracks();
			}
			return {
				props: {
					pagedResult
				}
			};
		} catch (error) {
			return {
				status: 200,
				props: {
					noMusic: true
				}
			};
		}
	}
</script>

<script lang="ts">
	import { page } from '$app/stores';
	import agent from '$lib/agent';
	import Pagination from '$lib/pagination/pagination.svelte';
	import Player from '$lib/player/player.svelte';
	import Search from '$lib/searchForm/search.svelte';
	import Song from '$lib/songs/song.svelte';
	import { currentSong, playStatus } from '$lib/stores';
	import type { PagedResult } from '$lib/types/paged-result.type';
	import { PlayStatus } from '$lib/types/play-status.enum';
	import type { SongType } from '$lib/types/song.type';
	import { replaceStateWithQuery } from '$lib/utils/utils';
	import { fly } from 'svelte/transition';
	export let noMusic = null;

	let loadingSearch = false;
	const handleSearch = async ({ detail: searchValue }) => {
		try {
			loadingSearch = true;
			if (searchValue) {
				pagedResult = await agent.songs.search(searchValue, 1);
			} else {
				pagedResult = await agent.songs.getMainTracks();
			}

			noMusic = null;
			loadingSearch = false;
			replaceStateWithQuery({ query: searchValue, page: '1' });
		} catch (error: any) {
			loadingSearch = false;
			noMusic = true;
		}
	};

	const handlePageChanged = async ({ detail }) => {
		try {
			loadingSearch = true;
			const searchValue = $page.url.searchParams.get('query');
			pagedResult = await agent.songs.search(searchValue, detail);
			noMusic = null;
			loadingSearch = false;
			replaceStateWithQuery({ query: searchValue, page: detail });
		} catch (error) {
			loadingSearch = false;
			noMusic = true;
		}
	};

	export let pagedResult: PagedResult<SongType[]>;
</script>

<svelte:head>
	{#if !$currentSong}
		<title>Search Songs!</title>
	{:else if $playStatus === PlayStatus.LOADING}
		<title>Loading...</title>
	{:else if $playStatus === PlayStatus.PLAYING}
		<title>Current Listening to {$currentSong.artist}</title>
	{:else}
		<title>{$currentSong.artist}</title>
	{/if}
</svelte:head>
<main>
	<Search on:onSearch={handleSearch} loading={loadingSearch} />

	<div class="mx-auto my-5 lg:w-3/5 w-full">
		{#if noMusic}
			<div class="card mt-2 bg-base-300 rounded-none lg:rounded-xl lg:mx-auto lg:w-fit w-full">
				<div class="card-body">
					<p>No music found with this criteria</p>
				</div>
			</div>
		{:else}
			{#each pagedResult.items as songItem (songItem.id)}
				{#key pagedResult.items}
					<div in:fly={{ y: 30 }}>
						<Song song={songItem} />
					</div>
				{/key}
			{/each}

			{#if pagedResult.totalPages > 0}
				<Pagination
					on:page={handlePageChanged}
					totalPages={pagedResult.totalPages}
					activePage={pagedResult.pageNumber}
				/>
			{/if}
		{/if}

		<Player />
	</div>
</main>
