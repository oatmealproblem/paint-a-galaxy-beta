// canvas size (the html <canvas>, the overlayed <svg>, and the Stellaris map)
export const CANVAS_WIDTH = 1000;
export const CANVAS_HEIGHT = 1000;
export const CANVAS_BACKGROUND = '#000000';
// size of each "arm" of the plus sign marking the center of the canvas
export const CENTER_MARK_SIZE = 10;
// slider max for maximum connection (hyperlane) length
export const MAX_CONNECTION_LENGTH = Math.max(CANVAS_WIDTH, CANVAS_HEIGHT) / 2;
// search for empty circles to dynamically spawn FEs on game start
export const FALLEN_EMPIRE_SPAWN_RADIUS = 50;
// AI empires don't account for all spawns, so we need to have more spawn locations than allowed AI empires
export const SPAWNS_PER_MAX_AI_EMPIRE = 1.5;
// number of nebulas to generate when randomizing
export const NUM_RANDOM_NEBULAS = 6;
// min and max radius of random nebulas
export const RANDOM_NEBULA_MIN_RADIUS = 40;
export const RANDOM_NEBULA_MAX_RADIUS = 60;
// minimum distance between random nebulas (center to center)
export const RANDOM_NEBULA_MIN_DISTANCE = 150;
// min radius of custom nebulas
export const CUSTOM_NEBULA_MIN_RADIUS = 10;

export const ID = {
	new_project_dialog: 'new_project_dialog',
	delete_project_dialog: 'delete_project_dialog',
	rename_project_dialog: 'rename_project_dialog',
	upload_image_dialog: 'upload_image_dialog',
	canvas: 'canvas',
} as const;

export const CUSTOM_COMMAND = {
	reset_zoom: '--reset-zoom',
} as const;
