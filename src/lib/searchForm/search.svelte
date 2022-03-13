<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	const dispatch = createEventDispatcher();
	export let loading: boolean;
	let searchValue = '';
	let input: HTMLInputElement | null = null;
	onMount(() => {
		input?.focus();
	});
</script>

<div class="card mt-2 bg-base-300 rounded-none lg:rounded-xl lg:mx-auto lg:w-fit w-full ">
	<div class="card-body">
		<form
			class="flex lg:flex-row flex-col lg:gap-10 gap-5"
			on:submit|preventDefault={() => dispatch('onSearch', searchValue)}
		>
			<input
				bind:this={input}
				type="text"
				placeholder="Type here"
				class="input input-bordered w-full lg:w-52"
				bind:value={searchValue}
			/>
			<button class="btn w-full lg:w-fit" class:loading>Search</button>
		</form>
	</div>
</div>
