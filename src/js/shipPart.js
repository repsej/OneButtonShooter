/** @format */

let shipHp, shipParts;

function shipReset()
{
	shipHp = 10;
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
		this.xAccel = 0;
	}

	update() {
		super.update();

		if (this.pos.x < cameraPos.x + 5 && shipHp > 0)
		{
			// Tuuut tuuut ... start sailing !
			for (const s of shipParts) {
				s.xAccel = .0004;
			}
		}

		this.angle = 0;
		this.velocity.y = max(this.velocity.y, -.1);

		this.velocity.x = min(this.velocity.x + this.xAccel, .08);

		if(shipHp < 0 && this.pos.y > 1 && rand(1) < .007) makeExplosion(this.pos, 3);

		if (this.isAAGun) aaUpdateCannon(this);
	}

	superHit(dam) {
		super.hit(dam, true);
	}

	hit(dam=1) {
		if (this.hp < 0 || shipHp < 0){
			return;
		}

		this.isAAGun = false; // disable gun
		shipHp -= dam;

		makeExplosion(this.pos, 1);

		if (shipHp < 0)
		{
			for (const s of shipParts) {
				s.velocity.x = 0;
				s.xAccel = 0;

				s.superHit(s.hp);
			}
		}
	}
}
