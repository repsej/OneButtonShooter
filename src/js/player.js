/** @format */

const MAX_YSPEED = .2;
const MAX_YPOWER = .01;
const DY_POWER = .0005;
const PLAYER_GRAVITY = .4;
const X_FLYING_SPEED = 0.075;

const MAX_FLYING_HEIGHT = 20; // engine dies at this altitude ... not enough oxygen left up here ... qed


class Player extends EngineObject {
	constructor(pos) {
		super(pos, vec2(2, .5), spriteAtlas.playerPlane);

		this.drawSize = vec2(2.5,1.25);
		this.renderOrder = 10;
		this.alive = true;

		this.setCollision(true, true);
		cameraPos = this.pos.copy();

		// gameBottomText = "[Click to start]";

		this.yPower = 0;
		this.xSpeed = 0;
		this.gravityScale = 0;
		gameBlinkFrames = 15;

		this.deathFrame = undefined;
		this.deathAngle = undefined;

		musicTargetTempo = (level % 2 == 0) ? tempoMid : tempoFast;

		this.lastShotFrame = frame;
	}

	isPaused() {
		return this.gravityScale == 0;
	}

	startTransition() {
		if (!this.alive) return;

		this.renderOrder = 10000;

		this.setCollision(false, false, false);	
		gameSetState(GameState.TRANSITION);
	}


	update() {
		if (gameState == GameState.GAME_OVER || gameState == GameState.INTRO_STORY) return;

		super.update();
		cameraMicPos = this.pos;


		if (gameState== GameState.TITLE) {
			this.yPower = 0;
			this.velocity.x = X_FLYING_SPEED;
			this.gravityScale = .1;
			this.pos.y = levelSize.y * 2 / 3;
			this.setCollision(false, false, false);
			return;
		}


		//// Sound and particle effects
		if (frame % 17 == 0 )
		{
			sound_wind.play(this.pos, 2*(.01 + this.velocity.length() / 10));
		}

		if (frame % 13 == 0)
		{
			sound_engine.play(this.pos, .05 + this.yPower / (MAX_YPOWER * 2));
		}

		if (this.yPower > .0001 && frame % 2 == 0)	makeSmoke(this.pos, .01 + this.yPower / MAX_YPOWER);



		//// Transtition state
		if (gameState == GameState.TRANSITION )
		{
			this.angle -= .025;
			this.gravityScale = 0.0001;
			this.yPower = MAX_YPOWER;

			this.drawSize.x *= 1.005;
			this.drawSize.y *= 1.005;
			
			cameraScale -= .02;

			this.velocity = vec2().setAngle(this.angle - PI * 3 / 2, .2);
			this.velocity.y += 0.02;

			return;
		}



		this.angle = -this.velocity.y * 3;
		
		if (this.pos.y < 1)
		{
			if (this.deathAngle === undefined) this.deathAngle = this.angle;
			this.velocity = this.velocity.scale(.5);
			this.angle = this.deathAngle;
		}
		
		if (!this.alive){

			if (frame - this.deathFrame > 180) {
				return;
			}

			if (frame % 3 == 0){
				makeSmoke(this.pos, rand(1,4));
				if(rand() < 0.3) sound_explosion.play(this.pos, rand(0, 0.2));
			} 			

			while (rand() < 0.2) makeFire(this.pos.add(randInCircle(.2,0)), rand(.2,.5));


			return;
		} 

		if (this.gravityScale == 0)
		{
			if (inputButtonReleased()){
				musicPlayCrash(2);
				gameBlinkFrames = 10;

				gameBottomText = undefined;

				this.yPower = MAX_YPOWER / 2;
				this.gravityScale = PLAYER_GRAVITY; 
				this.xSpeed = X_FLYING_SPEED;
			}

			return;
		}


		if (inputButtonLastHeld() && inputButtonHeld() && this.pos.y < MAX_FLYING_HEIGHT)
		{
			this.yPower += DY_POWER;
		}
		else
		{
			this.yPower /= 1.4;
		}

		this.yPower = clamp(this.yPower, 0, MAX_YPOWER);
		this.velocity.y += this.yPower;
		this.velocity.x = this.xSpeed;

		this.velocity.y = clamp(this.velocity.y, -MAX_YSPEED, MAX_YSPEED);


		if (gameState == GameState.PLAY && (inputButtonPressed() || inputButtonReleased()))
		{
			if (frame - this.lastShotFrame >= 3){
				this.lastShotFrame = frame;

				// spawn bullet in front of plane
				let bulletSpeed = vec2(.25, 0).rotate(-this.angle);
				bulletSpeed = bulletSpeed.add(this.velocity)

				const bulletPos = this.pos.add(bulletSpeed.normalize(2));

				new Bullet(bulletPos, bulletSpeed.normalize(.4), this, 1.2, 1.3);
			} 
		}
	}

	render() {
		if (gameState == GameState.TITLE || gameState == GameState.INTRO_STORY) return;

		// blink before starting level
		if (this.gravityScale == 0 && (frame / 10) % 2 < 1) return;

		super.render();
	}

	hit(damage=1) {
		if (gameState == GameState.TITLE) return;
		
		if (!this.alive) return;

		makeExplosion(this.pos, 2);

		this.alive = false;
		this.setCollision(false, false);

		this.setCollision(false,false,false); // fall out of the screen

		this.deathFrame = frame;

		lives--;

		setTimeout(() => {
			if (lives <= 0) {
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
