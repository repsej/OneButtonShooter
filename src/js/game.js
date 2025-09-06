/** @format */

let spriteAtlas, score, level, cameraSize;

let GameState = {
	PLAY: 0,
	GAME_OVER: 1,
	WON: 2,
	TRANSITION: 3,
	TITLE: 4,
	INTRO_STORY: 5
};

let gameState = GameState.PLAY;
const LIVE_BONUS_SCORE = 5000;
const LIVES_START = 3;

const PLAYER_START_TILES_FROM_LEFT = 8;


let gameBottomText = undefined;
let lives = undefined;
let gameWasNewHiscore = undefined;
let gameWhiteBlinkFrames = 0;

const GAME_BLACK_ALPHA_NONE = 0;
const GAME_BLACK_ALPHA_MEDIUM = 0.4;
const GAME_BLACK_ALPHA_DARK = 0.7;

let gameBlackOverlayAlpha = 0, gameBlackOverlayAlphaTarget = 0;
let cameraShake = vec2();
let showHeight = 20;

let forcePause = false;

let moon = undefined;
let gameStateChangedTime = time;

let lifeBonus = 0
// let gameZoomFactor = 1, gameZoomFactorTarget = 1;

let introStory = [
	"=★=",
	"",
	"World War II",
	"PACIFIC THEATER, 1944",
	"",
	"As a pilot in a secret navy",
	"squadron your task is to sink",
	"enemy ships.",
	"",
	"Your aircraft is the old",
	"slow PBY Catalina.  Lightly",
	"armed, but painted matte",
	"black ... perfect for night",
	"operations.",
	"",	
	"You are part of the secret",
	"BLACK CAT SQUADRON",
	"",
	"Now give them hell!",
	"",
	"=★=",
];

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
		moon: tile(23)
	};

	// enable touch gamepad on touch devices
	touchGamepadEnable = true;
	gameWasNewHiscore = undefined;

	score = level = 0;
	gravity = -0.01;

	lives = LIVES_START;

	musicOn = true;

	levelBuild(level);
	musicInit(level);
	
	showHeight = levelSize.y * 1.2; // Show some more air above the level

	cameraSize = getCameraSize();

	if (isTouchDevice) particleEmitRateScale = 0.5;

	gameSetState(GameState.TITLE);
}

function gameSetState(newState) {

	inputReset();
	gameBottomText = undefined;

	gameState = newState;

	musicPlayCrash(2);
	gameWhiteBlinkFrames = 20;

	gameStateChangedTime = time;

	// gameZoomFactorTarget = 1;		

	switch (newState) {
		case GameState.TITLE:
			gameBlackOverlayAlphaTarget = GAME_BLACK_ALPHA_MEDIUM;
			player.velocity = vec2(.1,0);
			level = 6;
			levelBuild(level);
			break;
		
		case GameState.INTRO_STORY:
			gameBlackOverlayAlphaTarget = GAME_BLACK_ALPHA_DARK;
			scrollTextY = 1;
			break;

		case GameState.TRANSITION:
			//gameBlackOverlayAlphaTarget = GAME_BLACK_ALPHA_MEDIUM;
			break;

		case GameState.PLAY:
			gameBlackOverlayAlphaTarget = GAME_BLACK_ALPHA_NONE;
			break;

		case GameState.WON:
			lifeBonus = lives * 1000;
			addScore(lifeBonus, true);
			// fall through
		case GameState.GAME_OVER:
			gameBlackOverlayAlphaTarget = GAME_BLACK_ALPHA_DARK;
			gameWasNewHiscore = savefileHiscoreUpdate(score);
			break;
	}
}



function gameStartNextLevel()
{
	level++;
	if (level >= levelData.length) {
		gameSetState(GameState.WON);
		return;
	}

	levelBuild(level);
	gameSetState(GameState.PLAY);
}




function gameUpdate() {
	// gameZoomFactor = gameZoomFactor * 0.95 + gameZoomFactorTarget * 0.05;
	// console.log("gameZoomFactor", gameZoomFactor);
	// cameraScale = gameZoomFactor * mainCanvas.height / showHeight;

	cameraScale = mainCanvas.height / showHeight;

	inputUpdateXXX();
	musicUpdate();

	// Clamp camera's y position downwards (dont see below the sea)
	
	if (gameState == GameState.TRANSITION || gameState == GameState.WON) {
 		let followPos = vec2(player.pos.x, player.pos.y);
		cameraPos = cameraPos.lerp(followPos, 0.05);

		// dont show below sea level
		cameraPos.y = max(cameraPos.y, cameraSize.y / 1.99); 
	} else {
		// Player should always be placed a set number of tiles in from the left side of the screen
		cameraPos = cameraPos.lerp(player.pos.add(vec2(cameraSize.x/2-PLAYER_START_TILES_FROM_LEFT, 0)), 0.1);
	}

	if (gameState != GameState.WON) 
	{
		cameraPos.y = cameraSize.y / 2;

		// Clamp camera's x position
		cameraPos.x = clamp(cameraPos.x, cameraSize.x / 2, levelSize.x - cameraSize.x / 2);
	}

	if (!moon || moon.destroyed) {
		moon = new EngineObject(vec2(1), vec2(2), spriteAtlas.moon);
		moon.setCollision(false, false, false);
		moon.gravityScale = 0;
	}

	moon.pos = cameraPos.add(vec2(cameraSize.x/3 - cameraPos.x / 20, cameraSize.y/3));

	switch (gameState) {
		case GameState.TITLE:
			levelUpdate();
			if (player.pos.x > levelSize.x - cameraSize.x / 2) {
				levelBuild(level);
			}

			if (inputButtonReleased()){
				gameStartGame(0);
			} 	
			break;

		case GameState.INTRO_STORY:
			scrollTextY -= .001;

			if (inputButtonReleased()){
				levelBuild(level);
				gameSetState(GameState.PLAY);
			} 	
			break;

		case GameState.WON:
			if (inputButtonReleased()){
				gameSetState(GameState.TITLE);
			} 	
			break;


		case GameState.GAME_OVER:
			if (time - gameStateChangedTime < 10){
				if (inputButtonReleased()) gameStartGame(level)
			}
			else
			{
				gameSetState(GameState.TITLE);
			}
			break;

		case GameState.TRANSITION:
			// nop
		 	break;

		case GameState.PLAY:
			levelUpdate();
			if (player.pos.x > levelSize.x - 100) {
				player.startTransition();
			}
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

		// KILL
		if (keyWasPressed("KeyK")) player.hit();

		// Next level
		if (keyWasPressed("KeyN")) player.startTransition();

		// Retry level
		if (keyWasPressed("KeyR")) gameSkipToLevel(level);

		// Win
		if (keyWasPressed("KeyW")){
			gameSkipToLevel(levelData.length-1);
			player.startTransition();
		}
	}

	if (!IS_RELEASE || gameState == GameState.WON) {
		if (keyWasPressed("PageUp")) gameSkipToLevel(++level);
		if (keyWasPressed("PageDown")) gameSkipToLevel(--level);
	}

	cameraShake = cameraShake.scale(-0.9);
	cameraPos = cameraPos.add(cameraShake);
}

function gameStartGame(startLevel) {
	level = startLevel;
	score = 0;
	lives = LIVES_START;
	levelBuild(level);
	if (level == 0) {
		gameSetState(GameState.INTRO_STORY);
	} else {
		gameSetState(GameState.PLAY);
	}
}


function gameCameraShake(strength = 1) {
	strength /= 2;
	cameraShake = cameraShake.add(randInCircle(strength, strength / 2));
}

function gameUpdatePost() {

	cameraSize = getCameraSize();

	// Pause when not in landscape mode
	paused = window.innerHeight > window.innerWidth

	if (forcePause) paused = true;

	if (!IS_RELEASE)
	{
		if (keyWasPressed("KeyP")) {
			forcePause = !forcePause;
		}
	}
}

function gameSkipToLevel(newLevel) {
	gameBottomText = undefined;
	gameWhiteBlinkFrames = 15;

	level = mod(newLevel, levelData.length);
	levelBuild(level);

	gameSetState(GameState.PLAY);
}

// Arial (sans-serif)
// Verdana (sans-serif)
// Tahoma (sans-serif)
// Trebuchet MS (sans-serif)
// Times New Roman (serif)
// Georgia (serif)
// Garamond (serif)
// Courier New (monospace)
// Brush Script MT (cursive)

function gameDrawHudTextMultilines( 
	texts, x, y, 
	sizeFactor = 1, 
	fontName="Courier New", 
	lineSpacing = 1, 
	fillColor = "#fff", 
	outlineColor = "#000"
) {
	for (let i = 0; i < texts.length; i++) {
		gameDrawHudText(texts[i], x, y + i * (overlayCanvas.height / 20) * lineSpacing * sizeFactor, sizeFactor, fontName, fillColor, outlineColor);
	}

}

function gameDrawHudText(
	text,
	x,
	y,
	sizeFactor = 1,
	fontName = "Courier New",
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

function gameDrawHudTextBlink(
	text,
	x,
	y,
	sizeFactor = 1,
	fontName = "Courier New",
	fillColor = "#fff",
	outlineColor = "#000"
){
	if ((time * 4) % 2 < 1) {
		gameDrawHudText(text, x, y, sizeFactor, fontName, fillColor, outlineColor);
	}
}


function gameRender() {}

let levelTexts = [
	"Enemy fighters ahead!",
	"Sink the cargo ship!",

	"Mountain ahead!",
	"Sink the transport ship!",

	"AA guns ahead!",
	"Sink the destroyer!",

	"Barrage balloons ahead!",
	"Sink the battleship!",
];

let scrollTextY = 1;

function gameRenderPost() {
	let ySpacing = overlayCanvas.height / 20;

	if (paused && !forcePause)
	{
		gameDrawHudText("PAUSED", overlayCanvas.width / 2, overlayCanvas.height * 0.4, 1);
		gameDrawHudText("⟲", overlayCanvas.width / 2, overlayCanvas.height * 0.5, 3);		
		gameDrawHudText("Rotate phone to play", overlayCanvas.width / 2, overlayCanvas.height * 0.6, .5);

		drawRect(mainCanvasSize.scale(0.5), mainCanvasSize, new Color(0,0,0,.8), 0, undefined, true);
		
		mainContext.drawImage(overlayCanvas, 0, 0);
		return;
	}

	switch (gameState) {
		case GameState.TITLE:
			gameDrawScoreStuff(ySpacing); 

			gameDrawHudText("BLACK CAT", overlayCanvas.width / 2, overlayCanvas.height * 0.3, 4);
			gameDrawHudText("SQUADRON", overlayCanvas.width / 2, overlayCanvas.height * 0.5, 4);
			gameDrawHudText("Tap to start", overlayCanvas.width / 2, overlayCanvas.height * 0.8, 1);

			gameDrawHudText("a Js13kGames 2025 entry by Jesper Rasmussen", overlayCanvas.width / 2, overlayCanvas.height * 0.9, .5);
			break;

		case GameState.INTRO_STORY:
			gameDrawHudTextMultilines(introStory, overlayCanvas.width / 2, overlayCanvas.height * scrollTextY, 1.5);
			break			

		case GameState.TRANSITION:
			gameDrawHudText("Level cleared!", overlayCanvas.width / 2, overlayCanvas.height * 0.4, 2);
			drawTopLineUI();
			break;

		case GameState.PLAY:
			drawTopLineUI();

			if (level % 2 == 0)
			{
				let distToTarget = (levelSize.x - 100 - player.pos.x) | 0;
				drawBar(vec2(overlayCanvas.width / 2, ySpacing * 2), 
					vec2(overlayCanvas.width / 4, ySpacing / 5), 
					1 - (levelSize.x - 100 - player.pos.x) / (levelSize.x - 100 - PLAYER_START_TILES_FROM_LEFT),
					2, 
					true);

				//gameDrawHudText("To target " + distToTarget, overlayCanvas.width /2, overlayCanvas.height - ySpacing);
			}

			if (player.isPaused())
			{
				gameDrawHudText(levelTexts[level], overlayCanvas.width / 2, overlayCanvas.height * 0.4, 2);
				gameDrawHudText("Tap when ready", overlayCanvas.width / 2, overlayCanvas.height * 0.8, 1);
			}

			shipDrawHealthBar();

			break;

		case GameState.GAME_OVER:
			gameDrawScoreStuff(ySpacing);

			gameDrawHudText("GAME OVER", overlayCanvas.width / 2, overlayCanvas.height * 0.3, 4);

			let t = time - gameStateChangedTime;

			if (t <= 10){
				gameDrawHudText("Timer", overlayCanvas.width / 2, overlayCanvas.height * 0.5, 2);
				gameDrawHudText((10 - t|0), overlayCanvas.width / 2, overlayCanvas.height * 0.6, 3);

				gameDrawHudText("Tap to continue", overlayCanvas.width / 2, overlayCanvas.height * 0.8, 1);
			}

			break;

		case GameState.WON:
			gameDrawScoreStuff(ySpacing);

			gameDrawHudText("CONGRATULATIONS", overlayCanvas.width / 2, overlayCanvas.height * .2, 2.5);
			gameDrawHudText("All missions completed", overlayCanvas.width / 2, overlayCanvas.height * .7, 1.5);

			gameDrawHudText("Life bonus "+lifeBonus, overlayCanvas.width / 2, overlayCanvas.height * .9, 1);

			break;
	}

	if (gameBottomText) gameDrawHudText(gameBottomText, overlayCanvas.width * 0.5, overlayCanvas.height - ySpacing * 3);

	//// Black overlay
	if (gameBlackOverlayAlpha != gameBlackOverlayAlphaTarget){

		if (gameBlackOverlayAlphaTarget > gameBlackOverlayAlpha) {
			gameBlackOverlayAlpha += 0.02;
			gameBlackOverlayAlpha = clamp(gameBlackOverlayAlpha, 0, gameBlackOverlayAlphaTarget);
		} else {
			gameBlackOverlayAlpha -= 0.02;
			gameBlackOverlayAlpha = clamp(gameBlackOverlayAlpha, gameBlackOverlayAlphaTarget, 1);
		}
	}
	
	//gameBlackOverlayAlpha = gameBlackOverlayAlpha * 0.95 + gameBlackOverlayAlphaTarget * 0.05;
	
	if (gameBlackOverlayAlpha > 0.02) {
		drawRect(mainCanvasSize.scale(0.5), mainCanvasSize, new Color(0, 0, 0, gameBlackOverlayAlpha), 0, undefined, true);
	}

	// Overlay w texts
	mainContext.drawImage(overlayCanvas, 0, 0);

	if (gameState == GameState.TRANSITION || gameState == GameState.WON) player.render(); // Render player on top during transition

	//// White flash
	if (gameWhiteBlinkFrames > 0) {
		gameWhiteBlinkFrames--;
		let alpha = 0.2 + gameWhiteBlinkFrames / 10;
		alpha -= gameBlackOverlayAlpha; // Reduce white flash when black overlay is on
		alpha = clamp(alpha, 0, .9);

		drawRect(mainCanvasSize.scale(0.5), mainCanvasSize, new Color(1, 1, 1, alpha), 0, undefined, true);
	}

	function drawTopLineUI() {
		gameDrawHudText("Level " + (level + 1) + " / 8", (overlayCanvas.width * 1) / 4, ySpacing);
		gameDrawHudText("Score " + score, (overlayCanvas.width * 2) / 4, ySpacing);
		gameDrawHudText("Lives " + lives, (overlayCanvas.width * 3) / 4, ySpacing);
	}
}

function blinkScreenWhite(frames) {
	gameWhiteBlinkFrames /= 3;
	gameWhiteBlinkFrames += frames;
}

function gameDrawScoreStuff(halfTile) {
	let scoreText = "Score " + score;
	if (savefileHiscoreGet()) {
		scoreText += "          Hiscore " + savefileHiscoreGet();
	}

	if (gameWasNewHiscore) {
		gameDrawHudTextBlink(scoreText, overlayCanvas.width / 2, halfTile);
	}
	else
	{
		gameDrawHudText(scoreText, overlayCanvas.width / 2, halfTile);
	}
}


engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, ["tiles.png"]);
