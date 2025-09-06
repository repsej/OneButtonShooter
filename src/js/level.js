/** @format */

const tileType_empty = 0;
const tileType_ground = 1;

// create table for tiles in the level tilemap
const tileLookup = {
	empty: 0,
	player: 1,
	water: 5,
	island_ground: 7,

	palm_top: 9,
	palm_bottom: 10,

	balloon: 12,
	enemyPlane: 13,
	aaGun: 16,

	shipStern: 17,
	shipMid: 18,
	shipBow: 19,
	shipRadio: 20,
	shipBuilding: 21,
	shipChimney: 22,
	shipAAGun: 23,
};

/** @type Player */
let player;

/** @type Vector2 */
let playerStartPos;

let tileData, tileLayers, sky;
let levelSize;
let levelStartTime = -1;

const levelSetTileData = (pos, layer, data) =>
	pos.arrayCheck(tileCollisionSize) && (tileData[layer][((pos.y | 0) * tileCollisionSize.x + pos.x) | 0] = data);

const levelGetTileData = (pos, layer) =>
	pos.arrayCheck(tileCollisionSize) ? tileData[layer][((pos.y | 0) * tileCollisionSize.x + pos.x) | 0] : 0;

let levelFramesUntilNextWave;

function levelBuild(level) {
	tileData = undefined;
	tileLayers = undefined;
	sky = undefined;

	shipReset();
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

	tileData = [];
	tileLayers = [];
	playerStartPos = vec2(7, levelSize.y * 3 / 4);
	const layerData = tileMapData.d;
	const tileLayer = new TileLayer(vec2(), levelSize, tile(0, 16));
	tileLayer.renderOrder = -1e3;
	tileLayers[0] = tileLayer;
	tileData[0] = [];

	for (let y = levelSize.y; y--; ) {
		for (let x = levelSize.x; x--; ) {
			const pos = vec2(x, levelSize.y - 1 - y);
			const t = layerData[y * levelSize.x + x];
			const objectPos = pos.add(vec2(0.5));

			// Create objects
			switch (t) {
				case tileLookup.empty:
					break;

				case tileLookup.water:
					levelSetTileData(pos, 0, tile);
					setTileCollisionData(pos, tileType_ground);
					let water = new EngineObject(pos.add(vec2(0.5)), vec2(1), tile(t-1));
					water.update = () => {}; // static !
					water.renderOrder = 2500;
					break;

				case tileLookup.balloon:
					new Balloon(objectPos);
					break;

				case tileLookup.player:
					playerStartPos = objectPos;
					break;

				case tileLookup.aaGun:
					new AAGun(objectPos, t-1);
					break;

				case tileLookup.shipAAGun:
					new ShipPart(objectPos, t-1, true);
					break;

				case tileLookup.shipStern:
				case tileLookup.shipMid:
				case tileLookup.shipBow:
				case tileLookup.shipRadio:
				case tileLookup.shipBuilding:
				case tileLookup.shipChimney:
					new ShipPart(objectPos, t-1, false, t == tileLookup.shipChimney);
					break;

				default: // Stuff with collision
					levelSetTileData(pos, 0, t);
					setTileCollisionData(pos, tileType_ground);

					let direction = 0, mirror = 0;
					if (t == tileLookup.island_ground) {
						direction = randInt(4);
						//mirror = randInt(2);
					}

					if (t == tileLookup.palm_top || t == tileLookup.palm_bottom) {
						mirror = randInt(2);
					}

					tileLayer.setData(pos, new TileLayerData(t - 1, direction, !!mirror));
					// tileLayer.setData(pos, new TileLayerData(t - 1));
			}
		}
	}
	tileLayer.redraw();
}


function levelUpdate()
{
	if (!player || player.isPaused()) return;

	if (levelFramesUntilNextWave-- < 0)
	{
		levelFramesUntilNextWave = rand(200,500);

		const enemyCount = rand(1, 3);
		for (let i = 0; i < enemyCount; i++) {
			const spawnPos = vec2(cameraPos.x + cameraSize.x/2 + rand(5,10), rand(10, levelSize.y));
			new EnemyPlane(spawnPos);
		}
	}

}