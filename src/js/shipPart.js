/** @format */

let shipHpMax, shipHp, shipParts, shipX, shipSailing = false, xTotal = 0, barY = .5;

function shipReset()
{
	shipHp = -1;
	shipHpMax = 5;
	shipParts = [];
	shipSailing = false;

	shipX = -1;
	xTotal = 0;
	barY = 0;
}


/**
 *
 * @param {Vector2} pos
 * @param {Vector2} size
 * @param {Number} fraction
 * @param {Number} frameThickness
 */
function drawBar(pos, size, fraction, frameThickness = 0.1, barColor = Colors.white, screenSpace = false) {
	// Frame
	drawRect(pos, size, Colors.black, 0, undefined, screenSpace);

	let barSize = size.subtract(vec2(frameThickness));

	// Bar background
	drawRect(pos, barSize, Colors.black, 0, undefined, screenSpace);

	// Bar
	let barActiveSize = barSize.copy();
	barActiveSize.x *= fraction;

	let barPos = pos.copy();
	barPos.x -= barSize.x / 2;
	barPos.x += barActiveSize.x / 2;
	drawRect(barPos, barActiveSize, barColor, 0, undefined, screenSpace);
}


function shipDrawHealthBar(){
	if (shipHp <= 0 || shipParts.length <= 0) return;

	if (shipX == -1) shipX = xTotal / shipParts.length;

	shipX += shipParts[0].velocity.x;

	let healtBarPos = vec2(shipX, barY+2);
	let healtBarSize = vec2(3,.2);
	let healthPerc = shipHp / shipHpMax;

	drawBar(healtBarPos, healtBarSize, healthPerc, healtBarSize.x * .01, new Color( 1-healthPerc, healthPerc*.5, .2), false);
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

		shipHpMax += 1;
		shipHp = shipHpMax;

		musicTargetTempo = tempoFast;

		xTotal += this.pos.x;
		barY = max(barY, this.pos.y);
	}

	update() {
		super.update();

		if (this.isChimney && rand()<.5) makeSmoke(this.pos.add(vec2(0, .8)), shipSailing ? rand(1,3) : .5);

		if (player.isPaused()) return;

		if (this.pos.x < cameraPos.x + 5 && shipHp > 0 && !shipSailing)
		{
			// Tuuut tuuut ... start sailing !
			shipSailing = true;

			for (const s of shipParts) {
				s.xAccel = .0004;
			}
		}

		this.angle = 0;
		this.velocity.y = max(this.velocity.y, -.01);

		this.velocity.x = min(this.velocity.x + this.xAccel, .08);

		if(shipHp <= 0 && this.pos.y > 1 && rand(1) < .004) makeExplosion(this.pos, rand(1,3));

		if (this.isAAGun) aaUpdateCannon(this);
	}

	superHit(dam) {
		super.hit(dam, true);
	}

	hit(dam=1) {
		if (this.hp < 0 || shipHp <= 0){
			return;
		}

		makeExplosion(this.pos, this.isAAGun ? 2 : 1);

		if (this.isAAGun) this.size = vec2(0);

		this.isAAGun = false; // disable gun
		shipHp -= dam;

		if (shipHp <= 0)
		{
			setTimeout( () => {
				gameSetState(GameState.TRANSITION);
			}, 1000);
			
			for (const s of shipParts) {
				s.velocity.x = 0;
				s.xAccel = 0;

				s.superHit(s.hp);
			}
		}
	}
}
