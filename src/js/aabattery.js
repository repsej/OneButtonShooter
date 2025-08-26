/** @format */

class AABattery extends Enemy {

	constructor(pos) {
		super(pos, vec2(1), spriteAtlas.aaBattery);

		this.setCollision(true, true, false);
		this.hp = 1;

		this.framesToShoot = rand(50,100);
		this.frame = 0;
	}

	update() {
		super.update(); 

		if (this.pos.x < cameraPos.x + cameraSize.x/2 + 2 && this.hp > 0)
		{
			if(this.framesToShoot-- < 0 && this.pos.x > cameraPos.x)
			{
				this.framesToShoot = rand(50,150);
			
				let bulletSpeed = vec2(-.07,.07);
				const bulletPos = this.pos.add(bulletSpeed.normalize(1));
				new Bullet(bulletPos, bulletSpeed, this);
			}
		}
	}

}
