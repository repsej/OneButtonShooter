/** @format */

class Enemy extends EngineObject {

	constructor(pos, size, sprite) {
		super(pos, size, sprite);
		this.setCollision(true, true, false);
		this.gravityScale = 0;
		this.hp = 3;
		this.deathGravity = .5;
		this.deathTimeSecs = 2;
	}

	shootOk() {
		if (!player || !player.alive || gameState == GameState.TRANSITION) return false;

		return abs(this.pos.x - player.pos.x) > 15;
	}

	update() {
		if (this.pos.x < cameraPos.x - cameraSize.x/2 - 2 || this.pos.y < -2 ) {
			this.destroy();
		}

		this.angle = 3*this.velocity.y;
		super.update();
	}

	hit(damage=1, noExplosion=false) {
		if(this.hp <= 0) return;

		this.hp -= damage;
		if (this.hp <= 0) {
			addScore(10);
			
			this.setCollision(false, false, false);

			this.gravityScale = this.deathGravity;

			setTimeout(() => this.destroy(), this.deathTimeSecs * 1000);

			if (!noExplosion) makeExplosion(this.pos, 1);
		}
	}

	collideWithObject(o) {		
		if(this.hp <= 0) return;

		if (o == player) {
			o.hit();
			this.hit(this.hp)
			return;
		}

		return false;
	}
}
