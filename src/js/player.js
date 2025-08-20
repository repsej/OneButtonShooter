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

		gameBottomText = "[Click to start flying]";

		this.gravityScale = 0;
		gameBlinkFrames = 15;
	}

	update() {
		super.update();
		this.angle = -this.velocity.y * 3;
		
		if (!this.alive || gameState == GameState.GAME_OVER){
			if (frame % 3 == 0) makeSmoke(this.pos, rand(1,4));
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

			const bulletPos = this.pos.add(bulletSpeed);

			new Bullet(bulletPos, bulletSpeed.normalize(.3), this);
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

	kill() {
		if (!this.alive) return;

		makeExplosion(this.pos);
		this.alive = false;
		this.setCollision(false, false);

		lives--;

		setTimeout(() => {
			if (lives == 0) {
				gameSetState(GameState.GAME_OVER);
				return;
			}

			levelSpawnPlayer();
		}, 2000);
	}

	collideWithTile(tile, pos) {
		console.log("Hit tile", tile, pos);

		this.kill();

		return true;
	}
}
