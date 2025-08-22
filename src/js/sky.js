/** @format */

///////////////////////////////////////////////////////////////////////////////
// sky with background gradient, stars, and planets
class Sky extends EngineObject {
	constructor() {
		super();

		this.renderOrder = -1e4;
		this.seed = randInt(1e9);


		this.skyTopColor = rgb(0, 0, 1);
		this.skyMiddleColor = rgb(0, .5, 1);
		this.skyBottomColor = rgb(1, 0.5, .5);

		// Sun rise colors
		// this.skyTopColor = rgb(0, 0, .5);
		// this.skyMiddleColor = rgb(0, .25, .5);
		// this.skyBottomColor = rgb(1, 0.5, .5);

		this.cloudCount = mainCanvas.width / 150;
		this.clouds = [];

		for (let i = 0; i < this.cloudCount; i++ ) {
			const cloud = new EngineObject();
			cloud.tileInfo = spriteAtlas.cloud;
			this.clouds.push(cloud);
		}

		//drawTile(screenPos, vec2(size * random.float(0.8, 2), size), spriteAtlas.cloud, undefined, 0, undefined, undefined, true, true);
	}

	render() {
		// fill background with a gradient
		const gradient = mainContext.createLinearGradient(0, 0, 0, mainCanvas.height);

		// @ts-ignore
		gradient.addColorStop(0, this.skyTopColor);

		// @ts-ignore
		gradient.addColorStop(0.5, this.skyMiddleColor);

		// @ts-ignore
		gradient.addColorStop(1, this.skyBottomColor);

		// let horizon = 0.8;
		// let islandThickness = 0.05;
		// let islandTop = horizon - islandThickness;

		// gradient.addColorStop(0, "#0148d6"); // sky top
		// gradient.addColorStop(islandTop, "#2b6dce"); // sky bottom
		// gradient.addColorStop(islandTop + 0.01, "#3b6363"); // island top

		// gradient.addColorStop(horizon, "#011a57"); // island bottom

		// gradient.addColorStop(horizon + 0.001, "#002a88"); // sea top
		// gradient.addColorStop(0.95, "#00e5d8"); // sea bottom
		// gradient.addColorStop(1, "#f1eedd"); // w sand

		mainContext.save();
		mainContext.fillStyle = gradient;
		mainContext.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
		mainContext.globalCompositeOperation = "lighter";
		mainContext.restore();


		// draw clouds
		const random = new RandomGenerator(this.seed);

		for (let i = 0; i < this.cloudCount; i++ ) {
			const size = random.float(1, 2) ** 2;
			const speed = 0; // random.float() < 0.95 ? 0 : random.float(-99, 99);
			const w = mainCanvas.width * 2,
				h = mainCanvas.height / 10;

			let camMult = size;

			const screenPos = vec2(
				mod(random.float(w) + time * speed - cameraPos.x * camMult * 10, w),
				random.float(h) + time * abs(speed) * random.float() + cameraPos.y * camMult - size
			);

			//screenPos.y -= mainCanvas.height * 0.5;
			screenPos.x -= mainCanvas.width * 0.5;

			// @ts-ignore
			// mainContext.fillStyle = color;
			// mainContext.fillRect(screenPos.x, screenPos.y, size, size);


			// drawRect(mainCanvasSize.scale(0.5), mainCanvasSize, new Color(1, 1, 1, alpha), 0, undefined, true);
			//drawRect(screenPos, vec2(size, size), new Color(1, 1, 1, .1), 0, undefined, true);

			let cloud = this.clouds[i];
			cloud.pos = screenToWorld(screenPos);
			cloud.size = vec2(size * random.float(0.8, 2), size);
			cloud.renderOrder = size;

			//drawTile(screenPos, vec2(size * random.float(0.8, 2), size), spriteAtlas.cloud, undefined, 0, undefined, undefined, true, true);

			// reflection
			// mainContext.fillRect(
			// 	screenPos.x,
			// 	mainCanvas.height * (2 * islandTop + islandThickness) - screenPos.y,
			// 	size,
			// 	size
			// );
		}
		// mainContext.restore();
	}
}
