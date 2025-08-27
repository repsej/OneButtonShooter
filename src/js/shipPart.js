/** @format */

let shipHp = 5;
let shipParts = [];

function shipReset()
{
	shipHp = 5;
	shipParts = [];
}

class ShipPart extends Enemy {

	constructor(pos, tileIndex = 18) {
		super(pos, vec2(1,1), tile(tileIndex));

		this.deathTimeSecs = 10;

		this.setCollision(true, true, false);
		this.deathGravity = .01;
		shipParts.push(this);
	}

	update()
	{
		super.update();
		this.angle = 0;
		this.velocity.y = max(this.velocity.y, -.1);

		this.velocity.x = min(this.velocity.x, .1);


		if (shipHp <= 0) return;
	}

	hit(dam=1)
	{
		console.log(dam, shipHp)


		if (shipHp < 0){
			super.hit(this.hp);
			return;
		}

		for (const s of shipParts) {
			s.velocity = vec2(.05, 0);
		}

		shipHp -= dam;

		makeExplosion(this.pos, 1);

		if (shipHp < 0)
		{
			debugger;

			for (const s of shipParts) {
				s.hit(s.hp);
			}
		}
	}

}
