/** @format */

class Bullet extends EngineObject {
	constructor(pos, vel, shooter) {
		super(pos, vec2(.15));
		this.setCollision(true, false, true);
		this.velocity = vel;
		this.gravityScale = 0;
		this.color = rgb(1, 1, 0);
		sound_shoot.play(this.pos, .5);
		this.shooter = shooter;
		this.renderOrder = 1500;

		this.outerShot = new EngineObject(vec2(0), vec2(0.25));
		this.outerShot.color = rgb(1, 0, 0);
		this.addChild(this.outerShot)

		makeFlash(this.pos, .3);
	}

	update() {
		// if ((frame/10)%2<1)
		// {
		// 	this.color= rgb(1, 1, 0);
		// }
		// else
		// {
		// 	this.color= rgb(1, 0, 0);
		// }

		super.update();
		if (this.pos.x < cameraPos.x - cameraSize.x/2 || this.pos.x > cameraPos.x + cameraSize.x/2	) 
			this.destroy();
	}

	collideWithTile(pos, layer) {
		sound_shoot.play(this.pos, .5, .3);
		makeSmoke(this.pos, rand(1,2));
		this.destroy();
		return false;
	}


	collideWithObject(o) {
		if (o == this.shooter) return false; // don't hit self

		if (o.hit) o.hit(1);

		sound_hit.play(this.pos, 1);
		sound_shoot.play(this.pos, .5, .3);
		makeHit(this.pos, 1);
		this.destroy();
		return false;
	}
}
