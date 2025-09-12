/** @format */

class AAGun extends Enemy {
	constructor(pos, tileIndex) {
		super(pos, vec2(1), tile(tileIndex));

		this.setCollision(true, true, false);
		this.hp = 1;
		this.deathGravity = 0;
		this.deathTimeSecs = 60;
	}

	update() {
		super.update(); 
		aaUpdateCannon(this);
	}
}

/**
 * 
 * @param {Enemy} gun 
 * @returns 
 */
function aaUpdateCannon(gun) {
	if (player.isPaused()) return;

	if (gun.hp <= 0) {
		gun.tileInfo = spriteAtlas.wreck;

		if (rand() < 0.1) {
			makeSmoke(gun.pos, rand(.5, 1));
		}
		return;
	}

	if (gun.framesToShoot === undefined) gun.framesToShoot = rand(50,100);

	if (gun.pos.x < player.pos.x + 50 && gun.hp > 0) {
		if (gun.framesToShoot-- < 0 && gun.shootOk()) {
			gun.framesToShoot = rand(100, 200);

			let bulletSpeed = vec2(-.07, .07);
			const bulletPos = gun.pos.add(bulletSpeed.normalize(1));
			new Bullet(bulletPos, bulletSpeed, gun, 4);

			sound_explosion.play(gun.pos, .7, 1.5);
		}
	}
}

