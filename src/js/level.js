/** @format */

const tileType_empty = 0;
const tileType_ground = 1;
const tileType_spike = 2;


let player, playerStartPos, tileData, tileLayers, sky;
let levelSize;
let levelStartTime = -1;

const levelSetTileData = (pos, layer, data) =>
	pos.arrayCheck(tileCollisionSize) && (tileData[layer][((pos.y | 0) * tileCollisionSize.x + pos.x) | 0] = data);

const levelGetTileData = (pos, layer) =>
	pos.arrayCheck(tileCollisionSize) ? tileData[layer][((pos.y | 0) * tileCollisionSize.x + pos.x) | 0] : 0;

function levelBuild(level) {

	playerStartPos = undefined;
	tileData = undefined;
	tileLayers = undefined;
	sky = undefined;

	levelLoad(level);
	sky = new Sky();
	levelSpawnPlayer();
	levelStartTime = time;

	levelFramesUntilNextWave = rand(100,200);
}

function levelSpawnPlayer() {
	//if (gameState == GameState.GAME_OVER) return;

	if (player) player.destroy();

	player = new Player(playerStartPos);
}

function levelLoad(levelNumber) {
	engineObjectsDestroy();

	const tileMapData = levelData[levelNumber];
	levelSize = vec2(tileMapData.w, tileMapData.h);
	initTileCollision(levelSize);

	// create table for tiles in the level tilemap
	const tileLookup = {
		empty: 0,
		player: 1,
		water: 5,
		ground: 6,

		// islandBeachLeft: 7,
		// islandSandPalmLower: 8,
		// islandSand: 9,
		// islandBeachRight: 10,
		// palmUpper: 11,

		balloon: 12,
		enemyPlane: 13,
		aaBattery: 16,
	};

	// set all level data tiles
	tileData = [];
	tileLayers = [];
	playerStartPos = vec2(1, levelSize.y);
	// const layerCount = tileMapData.layers.length;
	// for (let layer = layerCount; layer--; ) {
	const layerData = tileMapData.d;
	const tileLayer = new TileLayer(vec2(), levelSize, tile(0, 16));
	tileLayer.renderOrder = -1e3;
	tileLayers[0] = tileLayer;
	tileData[0] = [];

	for (let x = levelSize.x; x--; )
		for (let y = levelSize.y; y--; ) {
			const pos = vec2(x, levelSize.y - 1 - y);
			const tile = layerData[y * levelSize.x + x];
			const objectPos = pos.add(vec2(0.5));

			// Create objects
			switch (tile) {
				case tileLookup.empty:
					break;

				case tileLookup.balloon:
					new Balloon(objectPos);
					break;

				case tileLookup.player:
					playerStartPos = objectPos;
					break;

				case tileLookup.aaBattery:
					new AABattery(objectPos);
					break;

				// case tileLookup.enemyPlane:
				// 	new EnemyPlane(objectPos);
				// 	break;

				default: // Stuff with collision
					levelSetTileData(pos, 0, tile);
					setTileCollisionData(pos, tileType_ground);

					let direction = 0, mirror = 0;

					// if (tile == tileLookup.ground) {
					// 	direction = randInt(4);
					// 	mirror = randInt(2);
					// }

					tileLayer.setData(pos, new TileLayerData(tile - 1, direction, !!mirror));
			}
		}
	tileLayer.redraw();
}


let levelFramesUntilNextWave;

function levelUpdate()
{
	if (!player || player.isPaused()) return;

	if (levelFramesUntilNextWave-- < 0)
	{
		levelFramesUntilNextWave = rand(200,400);

		const enemyCount = rand(1, 3);
		for (let i = 0; i < enemyCount; i++) {
			const spawnPos = vec2(cameraPos.x + cameraSize.x/2 + rand(5,10), rand(10, levelSize.y));
			new EnemyPlane(spawnPos);
		}
	}

}