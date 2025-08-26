/** @format */

class Enemy extends EngineObject {

	constructor(pos, size, sprite) {
		super(pos, size, sprite);
		this.setCollision(true, true, false);
		this.gravityScale = 0;
		this.hp = 3;
		this.deathGravity = 1;
	}

	update()
	{
		if (this.pos.x < cameraPos.x - cameraSize.x/2 - 2)
		{
			this.destroy();
		}

		if (this.hp <= 0)
		{
			if (frame % 2 == 0) makeSmoke(this.pos, rand(1,2));
		}

		this.angle = 3*this.velocity.y;
		super.update();
	}


	hit(damage=1) {
		if(this.hp <= 0) return;

		this.hp -= damage;
		if (this.hp <= 0) {


			score += 10;
			sound_score.play(this.pos);

			this.setCollision(false, false, false);

			this.gravityScale = this.deathGravity;

			setTimeout(() => this.destroy(), 2000 );

			makeExplosion(this.pos, 1);

			// new Coin(this.pos);
			return;
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
