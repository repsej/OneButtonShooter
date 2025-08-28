/** @format */

let shipHp, shipParts, shipSailing = false;

function shipReset()
{
	shipHp = 20;
	shipParts = [];
	shipSailing = false;
}

class ShipPart extends Enemy {

	constructor(pos, tileIndex = 18, isAAGun = false, isChimney = false) {
		super(pos, vec2(1,1), tile(tileIndex));

		this.deathTimeSecs = 10;

		this.setCollision(true, true, false);
		this.deathGravity = .01;
		shipParts.push(this);

		this.isAAGun = isAAGun;
		this.xAccel = 0;

		this.isChimney = isChimney;
	}

	update() {
		super.update();

		if (this.pos.x < cameraPos.x + cameraSize.x/2) {
			musicTargetTempo = tempoFast;
		}

		if (this.pos.x < cameraPos.x + 5 && shipHp > 0 && !shipSailing)
		{
			// Tuuut tuuut ... start sailing !
			shipSailing = true;
			musicTargetTempo = tempoFast;

			for (const s of shipParts) {
				s.xAccel = .0004;
			}
		}

		if (this.isChimney && shipSailing)
		{
			if (rand()<.5)makeSmoke(this.pos.add(vec2(0, .8)), rand(1,2));
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

		makeExplosion(this.pos, this.isAAGun ? 2 : 1);

		if (this.isAAGun) this.size = vec2(0);

		this.isAAGun = false; // disable gun
		shipHp -= dam;


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
