/** @format */

class EnemyPlane extends Enemy {

	constructor(pos) {
		super(pos, vec2(2,1), spriteAtlas.enemyPlane);

		this.setCollision(true, true, false);
		this.hp = 1;

		this.framesToShoot = rand(50,100);

	}

	update() {
		if (this.pos.x < cameraPos.x + cameraSize.x/2)
		{
			if(this.framesToShoot-- < 0 && this.hp > 0)
			{
				this.framesToShoot = rand(100,200);
			
				let bulletSpeed = player.pos.subtract(this.pos).normalize(.15);
				const bulletPos = this.pos.add(bulletSpeed);
				new Bullet(bulletPos, bulletSpeed, this);
			}

			this.velocity.x = -0.05;
		}

		if (this.pos.x < cameraPos.x - cameraSize.x/2 - 2)
		{
			this.destroy();
		}

		super.update(); 
	}

}
