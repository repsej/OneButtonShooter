/** @format */

class Enemy extends EngineObject {

	constructor(pos, size, sprite) {
		super(pos, size, sprite);
		this.setCollision(true, true, false);
		this.hp = 3;
	}

	hit(b) {
		if(this.hp <= 0) return;

		this.hp -= 1;
		if (this.hp <= 0) {
			score += 10;
			sound_score.play(this.pos);

			this.destroy();
			makeExplosion(this.pos, 1.5);

			new Coin(this.pos);
			return;
		}
	}

	collideWithObject(o) {		
		if(this.hp <= 0) return;

		if (o == player) {
			o.kill();
			return;
		}

		return false;
	}
}
