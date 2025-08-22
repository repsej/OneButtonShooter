/** @format */

class Balloon extends EngineObject {

	constructor(pos) {
		super(pos, vec2(3,1.5), spriteAtlas.balloon);

		this.drawSize = vec2(4,2)

		this.setCollision(true, true, false);
		this.hp = 3;
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
