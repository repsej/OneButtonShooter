/** @format */

///////////////////////////////////////////////////////////////////////////////
// sky with background gradient, stars, and planets
class Sky extends EngineObject {
	constructor() {
		super();

		this.renderOrder = -1e4;
		this.seed = randInt(1e9);

		this.skyTopColor = rgb(.1,.1,.1);
		this.skyMiddleColor = rgb(.2, .2, .2);
		this.skyBottomColor = rgb(.4, .4, .4);

		// Sun rise colors
		// this.skyTopColor = rgb(0, 0, .5);
		// this.skyMiddleColor = rgb(0, .25, .5);
		// this.skyBottomColor = rgb(1, 0.5, .5);

		this.cloudCount = mainCanvas.width / 100;

		//console.log(`xxx Cloud count: ${this.cloudCount}`);

		this.clouds = [];

		for (let i = 0; i < this.cloudCount; i++ ) {
			const cloud = new EngineObject();
			cloud.tileInfo = spriteAtlas.cloud;
			cloud.color = new Color(1,1,1,.9);
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
		gradient.addColorStop(0.8, this.skyMiddleColor);

		// @ts-ignore
		gradient.addColorStop(1, this.skyBottomColor);

		mainContext.save();
		mainContext.fillStyle = gradient;
		mainContext.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
		mainContext.globalCompositeOperation = "lighter";

		let starSize = mainCanvas.height/300;

		// draw stars
		const random = new RandomGenerator(this.seed);

		for (let i = 0; i < this.cloudCount * 5; i++ ) {

			const screenPos = vec2(
				mod(random.float(mainCanvas.width) - cameraPos.x, mainCanvas.width),
				random.float(mainCanvas.height) * random.float()
			);

			const color = new Color(1,1,1, random.float(.2, .6));

			// @ts-ignore
			mainContext.fillStyle = color;
			mainContext.fillRect(screenPos.x, screenPos.y, starSize, starSize);
		}


		mainContext.restore();

		// place clouds

		for (let i = 0; i < this.cloudCount; i++ ) {
			const size = random.float(1, 2) * random.float(.5, 1.5);
			
			//const size = random.float() * random.float() + 1.5;
			
			const w = mainCanvas.width * 2,
				h = mainCanvas.height / 8;

			let camMult = size;

			const screenPos = vec2(
				mod(random.float(w) - cameraPos.x * camMult * 10, w),
				h*1.5 - (size * h/2)
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
			cloud.renderOrder = size - 100;

			//drawTile(screenPos, vec2(size * random.float(0.8, 2), size), spriteAtlas.cloud, undefined, 0, undefined, undefined, true, true);
		}
		// mainContext.restore();
	}
}
