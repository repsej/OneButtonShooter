/** @format */

const MAX_YSPEED = .2;
const MAX_YPOWER = .1;
const DY_POWER = .001;

class Player extends EngineObject {
	constructor(pos) {
		super(pos, vec2(2, 1), spriteAtlas.playerPlane);

		this.drawSize = vec2(1.3);
		this.renderOrder = 10;
		this.alive = true;

		this.setCollision(true, true);

		this.gravityScale = .5; 
		this.xSpeed = .05;
		this.yPower = 0;
	}

	update() {
		if (!this.alive || gameState == GameState.GAME_OVER) return;

		if (inputJumpHeld())
		{
			this.yPower += DY_POWER;
		}
		else
		{
			this.yPower /= 1.5;
		}

		this.yPower = clamp(this.yPower, 0, MAX_YPOWER);

		this.velocity.y += this.yPower;


		this.angle = -this.velocity.y * 2;

		this.velocity.y = clamp(this.velocity.y, -MAX_YSPEED, MAX_YSPEED);

		this.velocity.x = this.xSpeed;

		super.update();
	}

	// render() {}

	kill(resetTime = false) {
		if (!this.alive) return;

		// gameLastDiedOnLevel = level;

		sound_splat.play(this.pos);
		makeBlood(this.pos, 100);

		// //sound_die.play(this.pos);

		this.alive = false;

		this.size = this.size.scale(0.5);
		
		this.setCollision(false, false);

		lives--;

		setTimeout(() => {
			if (lives == 0) {
				gameSetState(GameState.GAME_OVER);
				return;
			}

			levelSpawnPlayer();
			if (resetTime) levelStartTime = time;
		}, 1000);
	}

	collideWithTile(tile, pos) {
		console.log("Hit tile", tile, pos);

		this.kill(true);

		return true;
	}
}
