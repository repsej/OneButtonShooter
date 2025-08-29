/** @format */

class EnemyPlane extends Enemy {

	constructor(pos) {
		super(pos, vec2(2,1), spriteAtlas.enemyPlane);

		this.setCollision(true, true, false);
		this.hp = 1;

		this.framesToShoot = rand(50,100);
		this.frame = 0;
	}

	destroy(){
		// shoot just before leaving the screen
		if (this.framesToShoot < 0 && this.hp > 0) this.shoot();

		super.destroy();
	}


	update() {
		super.update(); 

		if (this.pos.x < cameraPos.x + cameraSize.x/2 + 2 && this.hp > 0)
		{
			if(this.framesToShoot-- < 0 && this.shootDistOk())
			{
				this.framesToShoot = rand(100,200);
			
				this.shoot();
			}

			this.velocity.x = -0.05;

			if (rand() < 0.05) {
				this.velocity.y = rand(-0.01, 0.01);
			}

			if (this.frame++ % 11 == 0) {
				sound_engine.play(this.pos, .2, 2);
			}
		}
	}


	shoot() {
		let bulletSpeed = player.pos.subtract(this.pos).normalize(.15);
		const bulletPos = this.pos.add(bulletSpeed.normalize(1));
		new Bullet(bulletPos, bulletSpeed, this);
	}
}
