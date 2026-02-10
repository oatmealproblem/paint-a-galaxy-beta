<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};
	const { children }: Props = $props();
</script>

<div class="relative py-3 mt-2">
	<hr class="border-t border-surface-200-800" />
	<h2
		class="small-caps text-surface-700-300 bg-surface-50-950 absolute top-0 left-1/2 -translate-x-1/2 px-2"
		style:font-variant="small-caps"
	>
		{@render children()}
	</h2>
</div>
