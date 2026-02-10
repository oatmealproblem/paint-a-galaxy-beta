import { Schema, Record } from 'effect';
import type { Step } from './step';
import type { Coordinate } from './coordinate';
import { CANVAS_BACKGROUND } from '$lib/constants';

export const ToolId = Schema.Literal(
	// paint
	'freehand_draw',
	'freehand_erase',
	'circle_draw',
	'circle_erase',
	// tweak
	'details_open',
	'hyperlane_toggle',
	// 'nebula_create',
	// 'nebula_delete',
	// 'solar_system_delete',
	// 'solar_system_toggle',
	// 'spawn_preferred_toggle',
	// 'spawn_toggle',
	// 'wormhole_toggle',
);
export type ToolId = typeof ToolId.Type;

export const ToolSettingId = Schema.Literal('size', 'blur', 'opacity');
export type ToolSettingId = typeof ToolSettingId.Type;

export const ToolSettings = Schema.Record({
	key: ToolSettingId,
	value: Schema.OptionFromNullishOr(Schema.Number, null),
});
export type ToolSettings = typeof ToolSettings.Type;

interface _Tool<
	Id extends ToolId,
	ActionType extends 'single_point' | 'double_point' | 'multi_point',
	Settings extends Partial<Record<ToolSettingId, number>>,
> {
	id: Id;
	name: string;
	description: string;
	step: Step;
	action_type: ActionType;
	default_settings: Settings;
	snap_to_solar_system: boolean;
	render: {
		type: 'line' | 'stroke' | 'none';
		color: string;
	};
}

const freehand_draw: _Tool<
	'freehand_draw',
	'multi_point',
	{ size: number; blur: number; opacity: number }
> = {
	id: 'freehand_draw',
	name: 'Draw',
	description: 'TODO',
	step: 'paint',
	action_type: 'multi_point',
	snap_to_solar_system: false,
	render: {
		type: 'stroke',
		color: 'white',
	},
	default_settings: {
		size: 25,
		blur: 0,
		opacity: 0.5,
	},
};

const freehand_erase: _Tool<
	'freehand_erase',
	'multi_point',
	{ size: number; blur: number; opacity: number }
> = {
	id: 'freehand_erase',
	name: 'Erase',
	description: 'TODO',
	step: 'paint',
	action_type: 'multi_point',
	snap_to_solar_system: false,
	render: {
		type: 'stroke',
		color: CANVAS_BACKGROUND,
	},
	default_settings: {
		size: 25,
		blur: 0,
		opacity: 0.5,
	},
};

const circle_draw: _Tool<
	'circle_draw',
	'double_point',
	{ blur: number; opacity: number }
> = {
	id: 'circle_draw',
	name: 'Circle',
	description: 'TODO',
	step: 'paint',
	action_type: 'double_point',
	snap_to_solar_system: false,
	render: {
		type: 'stroke',
		color: 'white',
	},
	default_settings: {
		blur: 0,
		opacity: 0.5,
	},
};

const circle_erase: _Tool<
	'circle_erase',
	'double_point',
	{ blur: number; opacity: number }
> = {
	id: 'circle_erase',
	name: 'Erase Circle',
	description: 'TODO',
	step: 'paint',
	action_type: 'double_point',
	snap_to_solar_system: false,
	render: {
		type: 'stroke',
		color: CANVAS_BACKGROUND,
	},
	default_settings: {
		blur: 0,
		opacity: 0.5,
	},
};

const details_open: _Tool<
	'details_open',
	'single_point',
	Record<string, never>
> = {
	id: 'details_open',
	name: 'Open Details',
	description: 'TODO',
	step: 'tweak',
	action_type: 'single_point',
	snap_to_solar_system: true,
	render: {
		type: 'none',
		color: 'var(--color-primary-500)',
	},
	default_settings: {},
};

const hyperlane_toggle: _Tool<
	'hyperlane_toggle',
	'double_point',
	Record<string, never>
> = {
	id: 'hyperlane_toggle',
	name: 'Toggle Hyperlane',
	description: 'TODO',
	step: 'tweak',
	action_type: 'double_point',
	snap_to_solar_system: true,
	render: {
		type: 'line',
		color: 'var(--color-primary-500)',
	},
	default_settings: {},
};

export type ToolActionTypePayload = {
	multi_point: Coordinate[];
	single_point: Coordinate;
	double_point: [Coordinate, Coordinate];
};

export const tools = {
	freehand_draw,
	freehand_erase,
	circle_draw,
	circle_erase,
	details_open,
	hyperlane_toggle,
} satisfies Record<
	ToolId,
	_Tool<
		ToolId,
		'single_point' | 'double_point' | 'multi_point',
		Record<never, number>
	>
>;

export type Tool = (typeof tools)[keyof typeof tools];
