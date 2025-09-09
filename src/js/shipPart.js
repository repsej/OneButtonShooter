/** @format */

let shipHpMax, shipHp, shipParts, shipX, shipSailing = false, xTotal = 0, barY = .5;

function shipReset()
{
	shipHp = shipHpMax = 10 + level * 5;

	shipParts = [];
	shipSailing = false;

	shipX = -1;
	xTotal = 0;
	barY = 0;
}



function shipDrawHealthBar(){
	if (shipHp <= 0 || shipParts.length <= 0) return;

	if (shipX == -1) shipX = xTotal / shipParts.length;

	shipX += shipParts[0].velocity.x;

	let healtBarPos = vec2(shipX, barY+2);
	let healtBarSize = vec2(shipHpMax / 5,.2);
	let healthPerc = shipHp / shipHpMax;

	drawBar(healtBarPos, healtBarSize, healthPerc, healtBarSize.x * .01, false);
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

		this.hp = 1;

		this.isChimney = isChimney;

		// shipHpMax += 1;
		// shipHp = shipHpMax;

		xTotal += this.pos.x;
		barY = max(barY, this.pos.y);
	}

	update() {
		super.update();

		if (this.isChimney && rand()<.5) makeSmoke(this.pos.add(vec2(0, .8)), shipSailing ? rand(1,3) : .5);

		if (player.isPaused()) return;

		if (this.pos.x < player.pos.x + 20 && shipHp > 0 && !shipSailing)
		{
			// Tuuut tuuut ... start sailing !
			shipSailing = true;

			for (const s of shipParts) {
				s.xAccel = .0004;
			}
		}

		this.angle = 0;
		this.velocity.y = max(this.velocity.y, -.01);

		this.velocity.x = min(this.velocity.x + this.xAccel, X_FLYING_SPEED - 0.007);

		if(shipHp <= 0 && this.pos.y > 1 && rand(1) < .004) makeExplosion(this.pos, rand(1,3));

		if (this.isAAGun) aaUpdateCannon(this);
	}

	superHit() {
		this.hp = 1;
		super.hit(1, true);
	}

	hit(dam=1) {
		if (shipHp <= 0) return;
		
		if (this.hp > 0){
			this.hp -= dam;
			if (this.hp <= 0){
				makeExplosion(this.pos, 1);

				if (this.isAAGun) this.size = vec2(0); // destroy gun

				this.isAAGun = false; // disable gun
			}
		}

		// Slow down ship a bit when hit
		// for (const s of shipParts) {
		// 	s.velocity.x /= 1.05;
		// }

		shipHp -= dam;
		if (shipHp <= 0)
		{
			gameShipBonus = ((level+1) * 100 * (1- gameLevelFraction) | 0) * 10;
			addScore(gameShipBonus, true);

			player.startTransition();

			for (const s of shipParts) {
				s.velocity.x = 0;
				s.xAccel = 0;

				s.superHit();
			}
		}
	}
}
