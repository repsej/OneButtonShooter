/** @format */

class Player extends EngineObject {
	constructor(pos) {
		super(pos, vec2(2, 1), spriteAtlas.playerPlane);

		this.drawSize = vec2(1.3);
		this.renderOrder = 10;
		this.alive = true;

		this.setCollision(true, true);


		
		this.gravityScale = .5; 

		this.xSpeed = .05;
	}

	update() {
		if (!this.alive || gameState == GameState.GAME_OVER) return;


		if (inputJumpHeld())
		{
			this.velocity.y += this.gravityScale * .05;
		}

		this.angle = -this.velocity.y * 2;


		this.velocity.y = clamp(this.velocity.y, -1, 1);

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
