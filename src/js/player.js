/** @format */

const MAX_YSPEED = .2;
const MAX_YPOWER = .01;
const DY_POWER = .0005;
const PLAYER_GRAVITY = .4;

const MAX_FLYING_HEIGHT = 20; // engine dies at this altitude ... not enough oxygen left up here ... qed


class Player extends EngineObject {
	constructor(pos) {
		super(pos, vec2(2, .5), spriteAtlas.playerPlane);

		this.drawSize = vec2(2,1);
		this.renderOrder = 10;
		this.alive = true;

		this.setCollision(true, true);
		cameraPos = this.pos.copy();

		gameBottomText = "[Click to start]";

		this.gravityScale = 0;
		gameBlinkFrames = 15;

		this.deathFrame = undefined;
		this.deathAngle = undefined;
	}

	isPaused() {
		return this.gravityScale == 0;
	}

	update() {

		cameraMicPos = this.pos;

		super.update();
		this.angle = -this.velocity.y * 3;
		
		
		if (!this.alive || gameState == GameState.GAME_OVER){

			if (frame - this.deathFrame > 180) {
				return;
			}


			if (frame % 3 == 0){
				makeSmoke(this.pos, rand(1,4));
				if(rand() < 0.3) sound_explosion.play(this.pos, rand(0, 0.2));
			} 			

			while (rand() < 0.2) makeFire(this.pos.add(randInCircle(.2,0)), rand(.2,.5));

			if (this.pos.y < 1)
			{
				if (this.deathAngle === undefined) this.deathAngle = this.angle;
				this.velocity = this.velocity.scale(.5);
				this.angle = this.deathAngle;
			}

			return;
		} 

		if (this.gravityScale == 0)
		{
			if (inputJumpPressed()){
				gameBottomText = undefined;

				this.yPower = MAX_YPOWER / 2;
				this.gravityScale = PLAYER_GRAVITY; 
				this.xSpeed = .075;
			}

			return;
		}


		if (inputJumpHeld() && this.pos.y < MAX_FLYING_HEIGHT)
		{
			this.yPower += DY_POWER;
		}
		else
		{
			this.yPower /= 1.4;
		}

		this.yPower = clamp(this.yPower, 0, MAX_YPOWER);
		this.velocity.y += this.yPower;

		this.velocity.y = clamp(this.velocity.y, -MAX_YSPEED, MAX_YSPEED);
		this.velocity.x = this.xSpeed;


		if (inputJumpPressed() || inputJumpReleased())
		{
			// spawn bullet in front of plane
			let bulletSpeed = vec2(.25, 0).rotate(-this.angle);
			bulletSpeed = bulletSpeed.add(this.velocity)

			const bulletPos = this.pos.add(bulletSpeed.normalize(1.5));

			new Bullet(bulletPos, bulletSpeed.normalize(.3), this, 1.2);
		}

		if (frame % 17 == 0 )
		{
			sound_wind.play(this.pos, 2*(.01 + this.velocity.length() / 10));
		}

		if (frame % 13 == 0)
		{
			sound_engine.play(this.pos, .05 + this.yPower / (MAX_YPOWER * 2));
		}

		if (this.yPower > .0001 && frame % 2 == 0)	makeSmoke(this.pos, .01 + this.yPower / MAX_YPOWER);
	}

	render() {

		// blink before starting level
		if (this.gravityScale == 0 && (frame / 10) % 2 < 1) return;

		super.render();
	}

	hit(damage=1) {
		if (!this.alive) return;

		makeExplosion(this.pos, 2);

		this.alive = false;
		this.setCollision(false, false);

		this.setCollision(false,false,false); // fall out of the screen

		this.deathFrame = frame;

		lives--;

		setTimeout(() => {
			if (lives == 0) {
				gameSetState(GameState.GAME_OVER);
				return;
			}

			levelBuild(level);
		}, 3000);
	}

	collideWithTile(tile, pos) {
		this.hit();
		return true;
	}
}
