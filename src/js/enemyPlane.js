/** @format */

class EnemyPlane extends Enemy {

	constructor(pos) {
		super(pos, vec2(2,1), spriteAtlas.enemyPlane);

		this.setCollision(true, true, true);
		this.hp = 1;

		this.framesToShoot = rand(50,100);
		this.frame = 0;
	}

	// destroy(){
	// 	// shoot just before leaving the screen
	// 	if (this.framesToShoot < 0 && this.hp > 0) this.shoot();

	// 	super.destroy();
	// }


	update() {
		super.update(); 

		if (this.hp <= 0)
		{
			if (frame % 2 == 0) makeSmoke(this.pos, rand(1,2));
			return;
		}

		let startPosX = max(player.pos.x + 50, cameraPos.x + cameraSize.x/2 + 2);

		if (this.pos.x < startPosX )
		{
			if (this.velocity.x == 0) this.velocity.x = rand(-0.05, -0.1);

			if (rand() < 0.05) {
				this.velocity.y = rand(-0.01, 0.01);
			}

			if (this.frame++ % 11 == 0) {
				sound_engine.play(this.pos, .2, 2);
			}

			if (this.pos.x - player.pos.x < 40)
			{
				if(this.framesToShoot-- < 0 && this.shootOk())
				{
					this.framesToShoot = rand(100,200);
					this.shoot();
				}
			}
		}
	}

	collideWithTile(tileData, pos) {
		this.hit(this.hp);
		return false;
	}

	shoot() {
		let dist = this.pos.distance(player.pos);
		let targetPoint = player.pos.add(vec2(dist/3, 0)); // lead the target

		let bulletSpeed = targetPoint.subtract(this.pos).normalize(.15);
		const bulletPos = this.pos.add(bulletSpeed.normalize(1));
		new Bullet(bulletPos, bulletSpeed, this);
	}
}
