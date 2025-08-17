/** @format */

class Bullet extends EngineObject {
	constructor(pos, vel) {
		super(pos, vec2(.1));
		this.setCollision(true, false, true);
		this.velocity = vel;
		this.gravityScale = 0;
	}

	update() {
		super.update();
	}

	collideWithObject(o) {
		if (o == player) return false;

		this.destroy();

		makeCollectEffect(this.pos, 0.1);
		makeDebris(this.pos, new Color(0.5, 1, 1), randInt(5, 10), 0.05, 0.1, 0.05);

		return false;
	}
}
