<script lang="ts">
	import type { Step } from '$lib/models/step';
	import { tools, ToolSettingId } from '$lib/models/tool';
	import { get_editor } from '$lib/editor.svelte';
	import Slider from '$lib/components/slider.svelte';

	type Props = {
		step: Step;
	};
	const { step }: Props = $props();

	const editor = $derived(get_editor()());

	function on_value_change(setting: ToolSettingId) {
		return (value: number) => {
			editor.tool_settings = {
				...editor.tool_settings,
				[setting]: value,
			};
		};
	}
</script>

<!-- TODO button grid -->
<label class="label">
	<span class="label-text">Tool</span>
	<select class="select" bind:value={editor.tool_id}>
		{#each Object.values(tools).filter((tool) => tool.step === step) as tool (tool.id)}
			<option value={tool.id}>{tool.name}</option>
		{/each}
	</select>
</label>

{#if 'size' in editor.tool.default_settings}
	<Slider
		min={0}
		max={100}
		step={1}
		value={editor.tool_settings.size}
		on_value_change={on_value_change('size')}
	>
		{#snippet label()}Size{/snippet}
	</Slider>
{/if}

{#if 'opacity' in editor.tool.default_settings}
	<Slider
		min={0}
		max={1}
		step={0.01}
		value={editor.tool_settings.opacity}
		on_value_change={on_value_change('opacity')}
	>
		{#snippet label()}Strength{/snippet}
		{#snippet output(value)}{Math.round(value * 100)}%{/snippet}
	</Slider>
{/if}

{#if 'blur' in editor.tool.default_settings}
	<Slider
		min={0}
		max={2}
		step={0.1}
		value={editor.tool_settings.blur}
		on_value_change={on_value_change('blur')}
	>
		{#snippet label()}Blur{/snippet}
		{#snippet output(value)}{value}x{/snippet}
	</Slider>
{/if}
