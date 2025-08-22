/** @format */

class Bullet extends EngineObject {
	constructor(pos, vel, shooter) {
		super(pos, vec2(.2));
		this.setCollision(true, false, true);
		this.velocity = vel;
		this.gravityScale = 0;
		this.color = rgb(1, 1, 0);
		sound_shoot.play(this.pos, .5);
		this.life=80;
		this.shooter = shooter;
	}

	update() {
		super.update();
		this.life--;
		if (this.life <= 0) this.destroy();
	}

	collideWithTile(pos, layer) {
		sound_shoot.play(this.pos, .5, .3);
		makeSmoke(this.pos, rand(1,2));
		this.destroy();
		return false;
	}


	collideWithObject(o) {
		if (o == this.shooter) return false; // don't hit self

		if (o.hit) o.hit(this);

		sound_hit.play(this.pos, 1);
		sound_shoot.play(this.pos, .5, .3);
		makeHit(this.pos, 1);
		this.destroy();
		return false;
	}
}
