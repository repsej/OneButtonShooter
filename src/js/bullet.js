/** @format */

class Bullet extends EngineObject {
	constructor(pos, vel) {
		super(pos, vec2(.2));
		this.setCollision(true, false, true);
		this.velocity = vel;
		this.gravityScale = 0;
		this.color = rgb(1, 1, 0);
		sound_shoot.play(this.pos, 1);
	}

	update() {
		super.update();
	}

	destroy() {
		super.destroy();

		sound_shoot.play(this.pos, .5, .3);
		makeSmoke(this.pos, rand(1,2));
		
		//makeDebris(this.pos, new Color(0.5, 1, 1), randInt(5, 10), 0.05, 0.1, 0.05);		
	}

	collideWithTile(pos, layer) {
		this.destroy();
		return false;
	}

	collideWithObject(o) {
		if (o == player) return false;
		this.destroy();
		return false;
	}
}
