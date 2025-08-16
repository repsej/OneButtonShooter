/** @format */

class Player extends EngineObject {
	constructor(pos) {
		super(pos, vec2(2, 1), tile());

		this.drawSize = vec2(1.3);
		this.renderOrder = 10;
		this.alive = true;

		this.setCollision(true, true);

		this.gravityScale = .1; // default gravity

		this.xSpeed = 1;
	}

	update() {
		if (gameState == GameState.GAME_OVER) return;

		// if (!this.alive) {
		// 	this.walkFrame = 0;
		// 	this.velocity.x *= 0.9;
		// 	this.angle = PI * 0.1 + this.angle * 0.9;
		// 	return super.update();
		// }

		// this.angle = this.velocity.x / 2;

		// if (this.jumpingOffScreen) {
		// 	player.angle /= 2; // turn towards upwards
		// 	super.update();
		// 	return;
		// }

		// this.gravityScale = 1; // default gravity

		// this.jumpButtonDown = inputJumpHeld();
		// this.jumpButtonPressed = inputJumpPressed();
		// this.jumpButtonReleased = inputJumpReleased();

		// if (this.groundObject) {
		// 	this.jumpTime = -1; // Not jumping
		// 	this.jumpBreaked = false;
		// 	this.groundTime = time;
		// 	this.doFlap = false;

		// 	this.velocity.y = 0;

		// 	if (this.jumpButtonPressed) this.jump();

		// 	// acceleration
		// 	this.velocity.x += this.mirror ? -this.xAccelGround : this.xAccelGround;

		// 	// update walk cycle
		// 	const speed = this.velocity.length();
		// 	this.walkCyclePercent += speed * 0.5;
		// 	this.walkCyclePercent = speed > 0.01 ? mod(this.walkCyclePercent) : 0;
		// 	this.walkFrame = (2 * this.walkCyclePercent) | 0;

		// 	if (this.walkFrame != this.walkFrameLastFrame && this.walkFrame == 1) {
		// 		sound_walk.play(this.pos, rand(0.5), rand(0.5, 1));
		// 		makeSmoke(this.pos.add(vec2(0, -0.45)), rand(0.2));
		// 	}

		// 	this.walkFrameLastFrame = this.walkFrame;

		// 	if (!this.onGroundLastFrame && this.velocityLastFrame.y < -0.1) {
		// 		// Land
		// 		let landingStrength = abs(this.velocityLastFrame.y) * 5;
		// 		sound_dodge.play(this.pos, landingStrength);
		// 		makeSmoke(this.pos.add(vec2(0, -0.5)));
		// 	}
		// } else {
		// 	// If walked off a ledge
		// 	if (this.jumpTime == -1) {
		// 		let timeSinceGround = time - this.groundTime;

		// 		const EXTRA_JUMPTIME = 0.1;
		// 		if (timeSinceGround < EXTRA_JUMPTIME) {
		// 			if (this.jumpButtonPressed) this.jump();
		// 		} else {
		// 			// convert to being in a jump (can flap, etc)
		// 			this.jumpTime = time - EXTRA_JUMPTIME;
		// 		}
		// 	}

		// 	// In a jump
		// 	if (this.jumpTime > 0) {
		// 		if (time - this.hitWallTime < 0.1) {
		// 			if (this.jumpButtonDown) this.jump(true);
		// 		}

		// 		let timeInJump = time - this.jumpTime;

		// 		if (this.jumpBreaked) {
		// 			if (abs(this.velocity.x) > 0.1) this.velocity.x *= 0.96;
		// 		} else {
		// 			if (this.jumpButtonReleased) {
		// 				sound_dodge.play(this.pos);

		// 				// stop upwards movement
		// 				if (this.velocity.y > 0) this.velocity.y = 0;

		// 				this.gravityScale = 1.5;
		// 				this.jumpBreaked = true;
		// 			}
		// 		}

		// 		// Glide / flap
		// 		if (timeInJump > 0.25) {
		// 			if (this.jumpButtonPressed || this.doFlap) {
		// 				sound_squark.play(this.pos, rand(0.5, 1));

		// 				this.jumpTime = time;
		// 				this.jumpBreaked = false;

		// 				this.velocity.y = 0.12;

		// 				this.velocity.x += this.mirror ? -0.2 : 0.2;

		// 				this.gravityScale = 1;

		// 				sound_dodge.play(this.pos);
		// 				makeSmoke(this.pos);

		// 				this.doFlap = false;
		// 			}
		// 		} else {
		// 			if (timeInJump > 0.1 && this.jumpButtonPressed) this.doFlap = true;
		// 		}
		// 	}
		// }

		// this.velocity.x = clamp(this.velocity.x, -this.maxXSpeed, this.maxXSpeed);

		// this.xSpeed = this.velocity.x;

		// this.onGroundLastFrame = this.groundObject;
		// this.jumpButtonDownLastFrame = this.jumpButtonDown;
		// this.velocityLastFrame = this.velocity.copy();

		// // this.speedMaxX = max(this.speedMaxX, abs(this.velocity.x));
		// // this.speedMaxY = max(this.speedMaxY, abs(this.velocity.y));
		// // console.log(this.speedMaxX, this.speedMaxY);

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
		this.kill(true);

		return true;
	}
}
