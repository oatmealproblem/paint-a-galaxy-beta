<script lang="ts">
	import { Icons } from '$lib/components/icons';
	import SectionHeader from '$lib/components/section_header.svelte';
	import Slider from '$lib/components/slider.svelte';
	import { get_editor } from '$lib/editor.svelte';
	import { Menu, Portal, Switch } from '@skeletonlabs/skeleton-svelte';

	const editor = get_editor();
	const settings = $derived(editor().project.generator_settings);

	function on_generate_option_selected({ value }: { value: string }) {
		editor().generate({
			solar_systems: value === 'all' || value === 'solar_systems',
			hyperlanes: value === 'all' || value === 'hyperlanes',
			spawns: value === 'all' || value === 'spawns',
			nebulas: value === 'all' || value === 'nebulas',
		});
	}
</script>

<form class="flex flex-col gap-4">
	<div class="input-group grid-cols-[auto_2.5rem]">
		<button
			class="ig-btn ps-14 preset-filled-primary-500"
			onclick={() => on_generate_option_selected({ value: 'all' })}
		>
			Generate
		</button>
		<Menu
			positioning={{ placement: 'bottom-end' }}
			onSelect={on_generate_option_selected}
		>
			<Menu.Trigger class="ig-btn px-0 preset-filled-primary-500">
				<Icons.ChevronDown />
			</Menu.Trigger>
			<Portal>
				<Menu.Positioner>
					<Menu.Content class="bg-surface-100-900">
						<Menu.Item value="all">
							<Menu.ItemText>Generate All</Menu.ItemText>
						</Menu.Item>
						<Menu.Item value="solar_systems">
							<Menu.ItemText>
								Systems Only
								<small class="block">(removes hyperlanes and spawns)</small>
							</Menu.ItemText>
						</Menu.Item>
						<Menu.Item value="hyperlanes">
							<Menu.ItemText>
								Hyperlanes Only
								<small class="block">(re-generating spawns recommended)</small>
							</Menu.ItemText>
						</Menu.Item>
						<Menu.Item value="spawns">
							<Menu.ItemText>Spawns Only</Menu.ItemText>
						</Menu.Item>
						<Menu.Item value="nebulas">
							<Menu.ItemText>Nebulas Only</Menu.ItemText>
						</Menu.Item>
					</Menu.Content>
				</Menu.Positioner>
			</Portal>
		</Menu>
	</div>
	<SectionHeader>Solar Systems</SectionHeader>
	<label class="label">
		<span class="label-text">Number of Systems</span>
		<input
			class="input bg-surface-100-900"
			type="number"
			min={0}
			step={1}
			bind:value={
				() => settings.number_of_systems,
				(value) => editor().update_generator_setting('number_of_systems', value)
			}
		/>
	</label>
	<Slider
		min={0}
		max={20}
		step={1}
		value={settings.min_distance_between_systems}
		on_value_change={(value) =>
			editor().update_generator_setting('min_distance_between_systems', value)}
	>
		{#snippet label()}Min Distance{/snippet}
	</Slider>
	<SectionHeader>Hyperlanes</SectionHeader>
	<Slider
		min={0}
		max={1}
		step={0.01}
		value={settings.hyperlane_connectivity}
		on_value_change={(value) =>
			editor().update_generator_setting('hyperlane_connectivity', value)}
	>
		{#snippet label()}Connectivity{/snippet}
		{#snippet output(value)}{Math.round(value * 100)}%{/snippet}
	</Slider>
	<Slider
		min={0}
		max={500}
		step={1}
		value={settings.hyperlane_max_distance}
		on_value_change={(value) =>
			editor().update_generator_setting('hyperlane_max_distance', value)}
	>
		{#snippet label()}Max Distance{/snippet}
	</Slider>
	<Switch
		checked={settings.allow_disconnected}
		onCheckedChange={(details) =>
			editor().update_generator_setting('allow_disconnected', details.checked)}
	>
		<Switch.Control>
			<Switch.Thumb />
		</Switch.Control>
		<Switch.Label>Allow Disconencted</Switch.Label>
		<Switch.HiddenInput />
	</Switch>
</form>
