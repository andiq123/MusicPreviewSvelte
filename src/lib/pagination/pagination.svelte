<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	export let totalPages: number;
	export let activePage: number;
	const pages = new Array(totalPages).fill(1).map((_, i) => i + 1);
</script>

<div class="btn-group w-fit mx-auto mt-10 lg:mb-36 mb-56">
	{#each pages as pageNumber (pageNumber)}
		<btn
			class="btn"
			on:click={() => dispatch('page', pageNumber)}
			class:btn-active={pageNumber === activePage}>{pageNumber}</btn
		>
	{/each}
</div>
