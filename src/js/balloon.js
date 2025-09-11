/** @format */

class Balloon extends Enemy {

	constructor(pos) {
		super(pos, vec2(3,1.5), spriteAtlas.balloon);

		this.drawSize = vec2(4,2)

		this.setCollision(true, true, false);
		this.hp = 3;

		this.deathGravity = .2;
	}

	update()
	{
		super.update();

		if (this.hp <= 0){
			if (frame % 2 == 0) makeSmoke(this.pos, rand(1,2));

			while (rand() < 0.2) makeFire(this.pos.add(randInCircle(.5,0)), rand(.2,.5));

			return;
		} 

		// Kill player hitting the wire
		if (abs(player.pos.x - this.pos.x) < .5 && player.pos.y < this.pos.y)
		{
			player.hit(1);
		}

	}

	render()
	{
		if(this.pos.y > 1) drawLine(this.pos, vec2(this.pos.x, 2), .05, Colors.black);
		super.render();
	}
}
