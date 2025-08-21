/** @format */

class Coin extends EngineObject {

	constructor(pos) {
		super(pos, vec2(1.5), spriteAtlas.coin);
		this.yOrig = pos.y;
		this.setCollision(true, false, false);
	}

	update(o) {
		//super.update(); // NO super update !

		this.pos.y = this.yOrig + Math.sin((time - levelStartTime) * 15) / 15;
	}

	collideWithObject(o) {
		if (o != player) return false;

		// check if player in range
		const d = this.pos.distanceSquared(player.pos);

		if (d > 2) return false;

		score += 10;

		sound_score.play(this.pos);

		this.destroy();

		makeCollectEffect(this.pos, 0.1);
		makeDebris(this.pos, new Color(0.5, 1, 1), randInt(5, 10), 0.05, 0.1, 0.05);

		return false;
	}
}
