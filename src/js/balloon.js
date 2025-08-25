/** @format */

class Balloon extends Enemy {

	constructor(pos) {
		super(pos, vec2(3,1.5), spriteAtlas.balloon);

		this.drawSize = vec2(4,2)

		this.setCollision(true, true, false);
		this.hp = 3;

		this.deathGravity = .3;
	}

	render()
	{
		if(this.pos.y > 1) drawLine(this.pos, vec2(this.pos.x, 1), .05, new Color(0, 0, 0));
		super.render();
	}
}
