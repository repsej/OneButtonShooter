/** @format */

class Bullet extends EngineObject {
	constructor(pos, vel, shooter, size = 2) {
		super(pos, vec2(.25), spriteAtlas.bullet);

		this.drawSize = vec2(.5*size);

		if (player.isPaused()){
			this.destroy();
			return;
		}

		this.setCollision(true, false, true);
		this.velocity = vel;
		this.gravityScale = 0;
		sound_shoot.play(this.pos, .5);
		this.shooter = shooter;
		this.renderOrder = 1500;

		makeFire(this.pos, .5, 50);
	}

	update() {
		super.update();
		if (this.pos.x < cameraPos.x - cameraSize.x/2 - 2 || this.pos.x > cameraPos.x + cameraSize.x/2 + 2) 
			this.destroy();
	}

	collideWithTile(pos, layer) {
		sound_shoot.play(this.pos, .5, .3);

		makeFire(this.pos, .5, 100);
		makeSmoke(this.pos, rand(1,2));
		this.destroy();
		return false;
	}


	collideWithObject(o) {
		if (o.constructor == this.shooter.constructor) return false; // don't hit own type

		if (o.hit) o.hit(1);

		makeHitEffect(this.pos, 1);
		this.destroy();
		return false;
	}
}
