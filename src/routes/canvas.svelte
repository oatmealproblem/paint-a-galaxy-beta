<script lang="ts">
	import {
		CANVAS_BACKGROUND,
		CANVAS_HEIGHT,
		CANVAS_WIDTH,
		CENTER_MARK_SIZE,
		CUSTOM_COMMAND,
		ID,
	} from '$lib/constants';
	import { get_editor } from '$lib/editor.svelte';
	import { Coordinate } from '$lib/models/coordinate';
	import { select } from 'd3-selection';
	import { zoom, zoomIdentity, type D3ZoomEvent } from 'd3-zoom';
	import { Match, Option } from 'effect';

	const editor = $derived(get_editor()());
	const project = $derived(editor.project);
	const current_tool = $derived(
		editor.step === editor.tool.step ? editor.tool : null,
	);

	let mouse_coordinates = $state.raw<
		Option.Option<{
			container: Coordinate;
			viewbox: Coordinate;
			canvas: Coordinate;
			stellaris: Coordinate;
		}>
	>(Option.none());

	let tool_active = $state(false);
	let tool_points = $state<Coordinate[]>([]);
	let stroke_path = $derived(
		tool_points.length > 1 ? editor.calculate_path(tool_points) : '',
	);

	let canvas = $state<HTMLCanvasElement>();
	let ctx = $derived(canvas?.getContext('2d'));
	$effect(() => {
		createImageBitmap(project.canvas).then((bitmap) => {
			ctx?.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
			ctx?.drawImage(bitmap, 0, 0);
		});
	});

	let container = $state<HTMLElement>();
	let container_height = $state(0);

	let svg = $state<SVGSVGElement>();
	let transform = $state({ k: 1, x: 0, y: 0 });
	const zoom_behavior = zoom<SVGSVGElement, unknown>()
		.extent([
			[0, 0],
			[CANVAS_WIDTH, CANVAS_HEIGHT],
		])
		.scaleExtent([0.5, 8])
		.translateExtent([
			[-CANVAS_WIDTH, -CANVAS_HEIGHT],
			[CANVAS_WIDTH * 2, CANVAS_HEIGHT * 2],
		])
		.filter((event: PointerEvent) => {
			if (
				event.type === 'mousedown' &&
				(event.button === 0 || event.button === 2)
			)
				return false;
			return true;
		})
		.on('zoom', (e: D3ZoomEvent<SVGSVGElement, unknown>) => {
			transform = e.transform;
		});
	$effect(() => {
		if (svg) select(svg).call(zoom_behavior);
	});

	function get_mouse_coordinates(event: MouseEvent) {
		if (container == null) throw new Error('null canvas container');
		const bbox = container.getBoundingClientRect();
		const container_coordinate = Coordinate.make({
			x: event.clientX - bbox.x,
			y: event.clientY - bbox.y,
		});
		// this is the transform done automatically by the SVG, regardless of the d3-zoom transform
		const base_transform =
			bbox.width > bbox.height ?
				{
					k: bbox.height / CANVAS_HEIGHT,
					y: 0,
					x: (bbox.width - bbox.height) / 2,
				}
			:	{
					k: bbox.width / CANVAS_WIDTH,
					x: 0,
					y: (bbox.height - bbox.width) / 2,
				};
		// apply transform to to mouse event coordinate, to get the viewbox coordinate
		const viewbox_coordinate = Coordinate.make({
			x: (container_coordinate.x - base_transform.x) / base_transform.k,
			y: (container_coordinate.y - base_transform.y) / base_transform.k,
		});
		// apply the d3 zoom
		const canvas_coordinate = Coordinate.make({
			x: Math.round((viewbox_coordinate.x - transform.x) / transform.k),
			y: Math.round((viewbox_coordinate.y - transform.y) / transform.k),
		});
		return {
			container: container_coordinate,
			viewbox: viewbox_coordinate,
			canvas: canvas_coordinate,
			canvas_rounded: canvas_coordinate.to_rounded(),
			stellaris: canvas_coordinate.to_stellaris_coordinate(),
		};
	}
</script>

<svelte:document
	onmouseup={() => {
		if (ctx && tool_active) {
			if (editor.tool.action_type === 'single_point' && tool_points[0]) {
				editor.apply_tool([tool_points[0]], ctx);
			} else if (tool_points.length > 1) {
				editor.apply_tool(tool_points, ctx);
			}
			tool_active = false;
			tool_points = [];
		}
	}}
/>
<main
	id={ID.canvas}
	bind:this={container}
	bind:clientHeight={container_height}
	class="canvas h-full w-full overflow-hidden"
	style:width={CANVAS_WIDTH}
	style:height={CANVAS_HEIGHT}
	style:background={CANVAS_BACKGROUND}
	{...{
		// svelte does not yet have type defs for command events and listeners
		// spreading an object bypasses the strict type checking
		oncommand: (e: { command: string }) => {
			if (e.command === CUSTOM_COMMAND.reset_zoom) {
				if (svg) zoom_behavior.transform(select(svg), zoomIdentity);
			}
		},
	}}
	onmousedown={(e) => {
		if (current_tool != null) {
			tool_active = true;
			tool_points = [get_mouse_coordinates(e).canvas];
		}
	}}
	onmousemove={(e) => {
		const coordinates = get_mouse_coordinates(e);
		mouse_coordinates = Option.some(coordinates);
		if (tool_active) {
			Match.value(current_tool?.action_type).pipe(
				Match.when('single_point', () => {
					tool_points = [coordinates.canvas];
				}),
				Match.when('double_point', () => {
					if (tool_points.length === 0) {
						tool_points = [coordinates.canvas];
					} else if (tool_points.length === 1) {
						tool_points.push(coordinates.canvas);
					} else {
						tool_points[1] = coordinates.canvas;
					}
				}),
				Match.when('multi_point', () => {}),
				Match.when(undefined, () => {}), // no tool, do nothing
				Match.exhaustive,
			);
			tool_points.push(coordinates.canvas);
		}
	}}
	onmouseleave={() => {
		mouse_coordinates = Option.none();
	}}
>
	<svg
		bind:this={svg}
		class="w-full h-full"
		viewBox="0 0 {CANVAS_WIDTH} {CANVAS_HEIGHT}"
		width={CANVAS_WIDTH}
		height={CANVAS_HEIGHT}
	>
		<g transform="translate({transform.x},{transform.y}) scale({transform.k})">
			<foreignObject x="0" y="0" width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
				<canvas
					bind:this={canvas}
					width={CANVAS_WIDTH}
					height={CANVAS_HEIGHT}
					style:opacity={editor.step === 'paint' ? '100%' : '50%'}
				></canvas>
			</foreignObject>
			{#if current_tool?.render.type === 'stroke'}
				<path
					d={stroke_path}
					fill={current_tool.render.color}
					opacity={editor.tool_settings.opacity}
				/>
			{/if}
			{#if editor.view_settings.show_center_mark}
				<path
					d="M {CANVAS_WIDTH / 2} {CANVAS_HEIGHT / 2 - CENTER_MARK_SIZE}
					   L {CANVAS_WIDTH / 2} {CANVAS_HEIGHT / 2 + CENTER_MARK_SIZE}
					   M {CANVAS_WIDTH / 2 - CENTER_MARK_SIZE} {CANVAS_HEIGHT / 2}
					   L {CANVAS_WIDTH / 2 + CENTER_MARK_SIZE} {CANVAS_HEIGHT / 2}"
					fill="none"
					class="stroke-secondary-500"
					stroke-width="1"
				/>
			{/if}
			{#if editor.view_settings.show_map_limit}
				{@const pattern_size = 20}
				{@const stripe_size = 5}
				<pattern
					id="map_limit_pattern"
					patternUnits="userSpaceOnUse"
					patternTransform="rotate(-45)"
					height={pattern_size}
					width={pattern_size}
				>
					<rect height={pattern_size} width={pattern_size} />
					<rect
						height={stripe_size}
						width={pattern_size}
						class="fill-error-500/25"
					/>
				</pattern>
				<path
					d="M -1000000 -1000000
					   H 1000000
					   V 1000000
					   H-1000000
					   Z
					   M -1 -1
					   v {CANVAS_HEIGHT + 2}
					   h {CANVAS_WIDTH + 2}
					   v-{CANVAS_HEIGHT + 2}
					   Z"
					class="stroke-error-500"
					fill="url(#map_limit_pattern)"
					stroke-width="2"
				/>
			{/if}
			{#each project.nebulas as nebula (nebula.key)}
				<circle
					cx={nebula.coordinate.x}
					cy={nebula.coordinate.y}
					r={nebula.radius}
					fill="var(--color-tertiary-500)"
					fill-opacity="0.25"
					stroke="var(--color-tertiary-500)"
					stroke-width="1"
					stroke-opacity="0.5"
				/>
			{/each}
			{#each project.hyperlanes as connection (connection.key)}
				{@const from = project.get_solar_system(connection.a).coordinate}
				{@const to = project.get_solar_system(connection.b).coordinate}
				<line
					x1={from.x}
					y1={from.y}
					x2={to.x}
					y2={to.y}
					stroke={CANVAS_BACKGROUND}
					stroke-opacity="0.5"
					stroke-width="3"
				/>
				<line
					x1={from.x}
					y1={from.y}
					x2={to.x}
					y2={to.y}
					stroke="#FFFFFF"
					stroke-opacity="0.5"
					stroke-width="1"
				/>
			{/each}
			{#each project.wormholes as connection (connection.key)}
				{@const from = project.get_solar_system(connection.a).coordinate}
				{@const to = project.get_solar_system(connection.b).coordinate}
				<line
					x1={from.x}
					y1={from.y}
					x2={to.x}
					y2={to.y}
					stroke="#FF00FF"
					stroke-opacity="1"
					stroke-width="1"
					stroke-dasharray="3"
				/>
			{/each}
			{#each project.solar_systems as solar_system (solar_system.id)}
				<!-- {#if step === Step.SPAWNS && preferred_home_stars.current.includes([x, y].toString())}
				<circle
					cx={x}
					cy={y}
					r="5"
					fill="none"
					stroke="var(--color-primary-500)"
					stroke-width="2"
				/>
			{/if} -->
				<circle
					cx={solar_system.coordinate.x}
					cy={solar_system.coordinate.y}
					r={2.5}
					fill={solar_system.spawn_type === 'disabled' ?
						'var(--color-surface-50)'
					:	'var(--color-primary-500)'}
					stroke="var(--color-surface-950)"
					stroke-width="1"
				/>
			{/each}
		</g>
	</svg>
	{#if Option.isSome(mouse_coordinates)}
		{@const coordinates = Option.getOrThrow(mouse_coordinates)}
		<div
			class={[
				'absolute bottom-0 bg-surface-50/75 text-surface-950 px-1 pointer-events-none',
				{
					'right-0':
						coordinates.container.x < 100 &&
						coordinates.container.y > container_height - 24,
				},
			]}
		>
			{Math.round(coordinates.stellaris.x)}, {Math.round(
				coordinates.stellaris.y,
			)}
		</div>
	{/if}
</main>

<style>
	.canvas {
		position: relative;
		align-self: start;

		svg {
			position: absolute;
			top: 0;
			left: 0;
		}
	}
</style>
