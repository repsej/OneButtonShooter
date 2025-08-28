/** @format */

let spriteAtlas, score, level, transitionFrames, cameraSize;

let GameState = {
	PLAY: 0,
	GAME_OVER: 1,
	WON: 2,
	TRANSITION: 3,
};

let gameState = GameState.PLAY;
const TRANSITION_FRAMES = 240;
const LIVE_BONUS_SCORE = 5000;
const LIVES_START = 3;

let gameBottomText = undefined;
let lives = undefined;
let titleSize;
let gameNewHiscoreStatus = undefined;
let gameBlinkFrames = 0;
let cameraShake = vec2();
let gameLastDiedOnLevel = undefined;
let showHeight = 20;

let title;

///////////////////////////////////////////////////////////////////////////////
function gameInit() {
	// create a table of all sprites
	spriteAtlas = {
		bullet: tile(2),
		blob: tile(3),
		playerPlane: tile(vec2(0,0), vec2(32, 16)),
		cloud: tile(10),
		balloon: tile(11),
		enemyPlane: tile(vec2(12*16, 0), vec2(32, 16)),
		explosion: tile(14),
		aaGun: tile(15),

		//title: tile(vec2(48, 32), vec2(48, 32)),
	};

	// enable touch gamepad on touch devices
	touchGamepadEnable = true;
	gameNewHiscoreStatus = undefined;

	transitionFrames = score = level = 0;
	gravity = -0.01;
	gameState = GameState.PLAY;

	lives = LIVES_START;
	titleSize = 7;

	musicOn = true; // XXX For now

	levelBuild(level);
	musicInit(level);

	// title = new EngineObject(vec2(levelSize.x / 2, levelSize.y * 0.7), vec2(20, 9), spriteAtlas.title);
	// title.setCollision(false, false, false);
	// title.gravityScale = 0;

	// gameBottomText = undefined;
	// gameBottomTopText = undefined;
	// gameBlinkFrames = 15;

	
	showHeight = levelSize.y * 1.2; // Show some more air above the level

	cameraScale = mainCanvas.height / showHeight;

	if (isTouchDevice) particleEmitRateScale = 0.5;
}

function gameSetState(newState) {
	gameBottomText = undefined;
	//gameBottomTopText = undefined;

	gameState = newState;

	switch (newState) {
		case GameState.GAME_OVER:
			gameBlinkFrames = 15;
			break;

		case GameState.WON:
			// gameSkipToLevel(13);
			// level = 31;
			// musicInit(level);
			// // musicOn = true;
			//gameBonusSet("Lives bonus ", lives * LIVE_BONUS_SCORE, 2);
			break;

		case GameState.TRANSITION:
			transitionFrames = TRANSITION_FRAMES;
			break;

		default:
			break;
	}
}

function gameNextLevel() {
	if (transitionFrames > 0) return;

	//sound_exit.play(player.pos, 3);
	// player.jumpToNextLevel();

	gameBlinkFrames = 10;
	gameCameraShake();

	gameSetState(GameState.TRANSITION);
}

function gameUpdate() {
	inputUpdateXXX();

	musicUpdate();


	cameraSize = getCameraSize();

	// Camera follows the player
 	cameraPos = cameraPos.lerp(player.pos.add(vec2(cameraSize.x / 3, 0)), 0.05);

	// Clamp camera's y position downwards
	// cameraPos.y = max(cameraPos.y, cameraSize.y / 2);

	cameraPos.y = cameraSize.y / 2;

	// Clamp camera's x position
	cameraPos.x = clamp(cameraPos.x, cameraSize.x / 2, levelSize.x - cameraSize.x / 2);


	// gameBottomText = "camY=" +cameraPos.y.toFixed(2) + "    playerY=" + player.pos.y.toFixed(2);


	switch (gameState) {
		case GameState.WON:
			break;

		case GameState.GAME_OVER:
			musicTargetTempo = tempoSlow;
			if (inputButtonReleased(true)) gameInit();
			break;

		case GameState.TRANSITION:
			break;

		case GameState.PLAY:
			levelUpdate();
			break;
	}

	if (!IS_RELEASE) {
		// Toggle music on
		if (keyWasPressed("KeyM")) {
			musicOn = !musicOn;
		}

		// GAME OVER
		if (keyWasPressed("KeyG")) {
			lives = 1;
			player?.hit();
		}

		// WIN
		if (keyWasPressed("KeyW")) {
			level = 13;
			gameNextLevel();
		}

		// KILL
		if (keyWasPressed("KeyK")) player.hit();

		// Next level
		if (keyWasPressed("KeyN")) gameNextLevel();

		// Retry level
		if (keyWasPressed("KeyR")) gameSkipToLevel(level);
	}

	if (!IS_RELEASE || gameState == GameState.WON) {
		if (keyWasPressed("PageUp")) gameSkipToLevel(++level);
		if (keyWasPressed("PageDown")) gameSkipToLevel(--level);
	}

	cameraShake = cameraShake.scale(-0.9);
	cameraPos = cameraPos.add(cameraShake);
}

function gameCameraShake(strength = 1) {
	strength /= 2;
	cameraShake = cameraShake.add(randInCircle(strength, strength / 2));
}

function gameUpdatePost() {

	if (!IS_RELEASE)
	{
		if (keyWasPressed("KeyP")) {
			paused = !paused;
		}
	}
}

function gameSkipToLevel(newLevel) {
	// gameBottomText = undefined;
	// gameBottomTopText = undefined;

	// if (gameState == GameState.WON) {
	// 	musicInit(level);
	// 	return;
	// }

	// gameBlinkFrames = 15;

	// if (newLevel == 14) {
	// 	gameSetState(GameState.WON);
	// 	return;
	// }

	// level = mod(newLevel, levelData.length);
	// levelBuild(level);
	// musicInit(level);
	// //musicOn = true;

	// transitionFrames = 0;
	// bonusText = undefined;

	// gameSetState(GameState.PLAY);
	// inputReset();

	//playMusic();
}

function gameDrawHudText(
	text,
	x,
	y,
	sizeFactor = 1,
	fontName = "monospace",
	fillColor = "#fff",
	outlineColor = "#000"
) {
	let fontSize = overlayCanvas.height / 20;

	fontSize = clamp(fontSize, 5, 40);
	fontSize *= sizeFactor;

	let outlineWidth = fontSize / 10;

	overlayContext.textAlign = "center";
	overlayContext.textBaseline = "middle";
	overlayContext.font = fontSize + "px " + fontName;

	let dShadow = fontSize / 10;

	// drop shadow
	overlayContext.fillStyle = outlineColor;
	overlayContext.lineWidth = outlineWidth;
	overlayContext.strokeStyle = outlineColor;
	overlayContext.strokeText(text, x + dShadow, y + dShadow);
	overlayContext.fillText(text, x + dShadow, y + dShadow);

	// text
	overlayContext.fillStyle = fillColor;
	overlayContext.lineWidth = outlineWidth;
	overlayContext.strokeStyle = outlineColor;
	overlayContext.strokeText(text, x, y);
	overlayContext.fillText(text, x, y);
}

function gameRender() {}

function gameRenderPost() {
	let ySpacing = overlayCanvas.height / 20;

	switch (gameState) {
		case GameState.TRANSITION:
			// let bestTime = savefileTimeGet(level);
			// if (bestTime > 0) {
			// 	let bestText = undefined;

			// 	console.log("best, diff: ", bestTime, gameBestTimeBonusDiff);

			// 	if (gameBestTimeBonusDiff != undefined) {
			// 		// let bonusDiffAsTime =
			// 		// 	Math.floor(Math.abs(gameBestTimeBonusDiff) / 100) + "." + (Math.abs(gameBestTimeBonusDiff) % 100);

			// 		let bonusDiffAsTime = Math.abs(gameBestTimeBonusDiff).toString().padStart(4, "0");
			// 		bonusDiffAsTime = bonusDiffAsTime.slice(0, 2) + "." + bonusDiffAsTime.slice(2);

			// 		if (gameBestTimeBonusDiff == 0) {
			// 			bestText = "Best tied";
			// 		} else if (gameBestTimeBonusDiff > 0) {
			// 			bestText = (time * 2) % 2 > 1 ? "NEW BEST +" + bonusDiffAsTime : "";
			// 		} else {
			// 			bestText = "Best -" + bonusDiffAsTime;
			// 		}
			// 	}

			// 	if (bestText) gameDrawHudText(bestText, (overlayCanvas.width * 3) / 4, halfTile * 2, 0.7);
			// }

		// fall-thru !

		case GameState.PLAY:
			gameDrawHudText("Lives " + lives, (overlayCanvas.width * 1) / 4, ySpacing);
			gameDrawHudText("Score " + score, (overlayCanvas.width * 2) / 4, ySpacing);
			gameDrawHudText("Level " + (level+1), (overlayCanvas.width * 3) / 4, ySpacing);

			if (player.isPaused())
			{
				gameDrawHudText("BLACK CAT", overlayCanvas.width / 2, overlayCanvas.height * 0.4, 4);
				gameDrawHudText("SQUARDRON", overlayCanvas.width / 2, overlayCanvas.height * 0.6, 4);
			}


			//if (bonusText) gameDrawHudText(bonusText + bonusAmmount, overlayCanvas.width / 2, ySpacing * 3, 0.7);

			break;

		case GameState.GAME_OVER:
			gameDrawScoreStuff(ySpacing);

			gameDrawHudText("GAME OVER", overlayCanvas.width / 2, overlayCanvas.height * 0.5, 4);
			// gameDrawHudText("Beware the danger of 13 !", overlayCanvas.width / 2, overlayCanvas.height * 0.3, 2);

			break;

		case GameState.WON:
			gameDrawScoreStuff(ySpacing);

			gameDrawHudText("FREEBIRD", overlayCanvas.width / 2, overlayCanvas.height - ySpacing * 8, 4);
			gameDrawHudText("YOU TAEK-WON-DODO", overlayCanvas.width / 2, overlayCanvas.height - ySpacing * 5, 2);

			if (!isTouchDevice) {
				gameDrawHudText(
					"[Page up/down to change music.  Chamber " + level + "]",
					(overlayCanvas.width * 2) / 4,
					overlayCanvas.height - ySpacing * 3
				);
			}

			break;
	}

	if (gameBottomText) gameDrawHudText(gameBottomText, overlayCanvas.width * 0.5, overlayCanvas.height - ySpacing * 3);


	// if (gameBottomTopText)
	// 	gameDrawHudText(gameBottomTopText, overlayCanvas.width * 0.5, overlayCanvas.height - halfTile * 3);

	// if (player) player.renderTop(); // On top of everything !

	// if (inputPlaybackDemo) {
	// 	if ((time * 2) % 2 > 1) {
	// 		gameDrawHudText("DEMO PLAYBACK", overlayCanvas.width / 4, overlayCanvas.height - halfTile);
	// 	} else {
	// 		gameDrawHudText("[Jump to quit]", (overlayCanvas.width * 3) / 4, overlayCanvas.height - halfTile);
	// 	}
	// }

	mainContext.drawImage(overlayCanvas, 0, 0);

	// if (player) player.renderTop(); // On top of everything !

	if (gameBlinkFrames > 0) {
		gameBlinkFrames--;
		let alpha = 0.2 + gameBlinkFrames / 10;
		alpha = min(alpha, .9);

		drawRect(mainCanvasSize.scale(0.5), mainCanvasSize, new Color(1, 1, 1, alpha), 0, undefined, true);
	}
}

function blinkScreen(frames) {
	gameBlinkFrames /= 3;
	gameBlinkFrames += frames;
}

function gameDrawScoreStuff(halfTile) {
	let scoreText = "Score " + score;
	if (savefileHiscoreGet()) {
		scoreText += "          Hiscore " + savefileHiscoreGet();
	}
	gameDrawHudText(scoreText, overlayCanvas.width / 2, halfTile);

	return scoreText;
}

// BONUS STUFF

// function gameBonusSet(text, ammount, initPause = 1) {
// 	bonusText = text;
// 	bonusAmmount = ammount;
// }

// // Returns true on the frame it is done counting
// function gameBonusUpdate() {
// 	if (time - bonusGivenTime > 5) bonusText = undefined;
// 	if (time - bonusGivenTime < 0) return false; // Intial pause
// 	if (bonusAmmount <= 0) return false;

// 	if (transitionFrames % 2 == 0) {
// 		sound_score.play();

// 		if (bonusAmmount > TIME_BONUS_SCORE) {
// 			score += TIME_BONUS_SCORE;
// 			bonusAmmount -= TIME_BONUS_SCORE;
// 		} else {
// 			score += bonusAmmount;
// 			bonusAmmount = 0;
// 			return true;
// 		}
// 	}

// 	return false;
// }

engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, ["tiles.png"]);
