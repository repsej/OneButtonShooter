/** @format */

let shipHp = 5;
let shipParts = [];

function shipReset()
{
	shipHp = 5;
	shipParts = [];
}

class ShipPart extends Enemy {

	constructor(pos, tileIndex = 18, isAAGun = false) {
		super(pos, vec2(1,1), tile(tileIndex));

		this.deathTimeSecs = 10;

		this.setCollision(true, true, false);
		this.deathGravity = .01;
		shipParts.push(this);

		this.isAAGun = isAAGun;
	}

	update() {
		super.update();
		this.angle = 0;
		this.velocity.y = max(this.velocity.y, -.1);

		this.velocity.x = min(this.velocity.x, .1);

		if (this.isAAGun) aaUpdateCannon(this);
	}

	superHit(dam) {
		super.hit(dam);
	}

	hit(dam=1) {
		if (this.hp < 0 || shipHp < 0){
			return;
		}

		for (const s of shipParts) {
			s.velocity = vec2(.01, 0);
		}

		shipHp -= dam;

		makeExplosion(this.pos, 1);

		if (shipHp < 0)
		{
			for (const s of shipParts) {
				s.velocity.x = 0;
				s.superHit(s.hp);
			}
		}
	}
}
