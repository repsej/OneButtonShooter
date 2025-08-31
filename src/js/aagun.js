/** @format */

class AAGun extends Enemy {
	constructor(pos, tileIndex) {
		super(pos, vec2(1), tile(tileIndex));

		this.setCollision(true, true, false);
		this.hp = 2;
		this.deathGravity = 0;
		this.deathTimeSecs = 0;
	}

	update() {
		super.update(); 
		aaUpdateCannon(this);
	}
}

function aaUpdateCannon(gun) {
	if (gun.framesToShoot === undefined) gun.framesToShoot = rand(50,100);

	if (gun.pos.x < cameraPos.x + cameraSize.x / 2 + 2 && gun.hp > 0) {
		if (gun.framesToShoot-- < 0 && gun.shootDistOk()) {
			gun.framesToShoot = rand(100, 150);

			let bulletSpeed = vec2(-.07, .07);
			const bulletPos = gun.pos.add(bulletSpeed.normalize(1));
			new Bullet(bulletPos, bulletSpeed, gun, 4);
		}
	}
}

