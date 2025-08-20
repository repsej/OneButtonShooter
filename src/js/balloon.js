/** @format */

class Balloon extends EngineObject {

	constructor(pos) {
		super(pos, vec2(3,1.5), spriteAtlas.balloon);

		this.drawSize = vec2(4,2)

		this.setCollision(true, true, false);
	}

	update(o) {
		//super.update(); // NO super update !

		//this.pos.y = this.yOrig + Math.sin(this.index / 5 + (time - levelStartTime) * 15) / 15;
	}

	render()
	{
		drawLine(this.pos, vec2(this.pos.x, 1), .05, new Color(0, 0, 0));
		super.render();
	}


	collideWithObject(o) {
		
		if (o == player) {
			o.kill();
			return;
		}

		if (o instanceof Bullet) {
			score += 10;
			sound_score.play(this.pos);

			this.destroy();
			makeExplosion(this.pos);

			new Coin(this.pos);
			return;
		}


		return false;
	}
}
