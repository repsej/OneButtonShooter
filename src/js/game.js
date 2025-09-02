/** @format */

let spriteAtlas, score, level, transitionFrames, cameraSize;

let GameState = {
	PLAY: 0,
	GAME_OVER: 1,
	WON: 2,
	TRANSITION: 3,
	TITLE: 4,
	INTRO_STORY: 5
};

let gameState = GameState.PLAY;
const TRANSITION_FRAMES = 240;
const LIVE_BONUS_SCORE = 5000;
const LIVES_START = 3;

let gameBottomText = undefined;
let lives = undefined;
let gameNewHiscoreStatus = undefined;
let gameBlinkFrames = 0;
let cameraShake = vec2();
let showHeight = 20;

let forcePause = false;

let moon = undefined;


let introStory = [
	"⸻  =★=  ⸻",
	"",
	"World War II",
	"PACIFIC THEATER, 1944",
	"",
	"A secret navy squadron",
	"hunted enemy ships,",
	"rescued downed pilots, and",
	"scouted behind enemy lines —",
	"all under the cover of darkness.",
	"",
	"Their aircraft was the",
	"slow PBY Catalina — lightly",
	"armed, but painted matte",
	"black for night operations.",
	"",	
	"They were known as the ",
	"“Black Cats.”",
	"",
	"This is their game.",
	"",
	"⸻  =★=  ⸻",
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
	gameNewHiscoreStatus = undefined;

	transitionFrames = score = level = 0;
	gravity = -0.01;

	lives = LIVES_START;

	musicOn = true;

	levelBuild(level);
	musicInit(level);
	
	showHeight = levelSize.y * 1.2; // Show some more air above the level

	// cameraScale = mainCanvas.height / showHeight;

	if (isTouchDevice) particleEmitRateScale = 0.5;

	gameSetState(GameState.TITLE);
}

function gameSetState(newState) {

	inputReset();
	gameBottomText = undefined;

	gameState = newState;

	musicPlayCrash(2);
	gameBlinkFrames = 20;

	switch (newState) {
		case GameState.TITLE:
			player.velocity = vec2(.1,0);
			level = 6;
			levelBuild(level);
			break;
		
		case GameState.INTRO_STORY:
			scrollTextY = 1;
			break;

		case GameState.TRANSITION:
			transitionFrames = TRANSITION_FRAMES;
			break;
	}
}

function gameNextLevel() {
	if (transitionFrames > 0) return;

	gameBlinkFrames = 10;
	gameCameraShake();

	player.startTransition();
}



function gameUpdate() {
	cameraScale = mainCanvas.height / showHeight;

	inputUpdateXXX();
	musicUpdate();

	cameraSize = getCameraSize();

	if (gameState == GameState.TRANSITION) {
 		let followPos = vec2(player.pos.x, player.pos.y /2);
		cameraPos = cameraPos.lerp(followPos, 0.03);

		// Clamp camera's y position downwards (dont see below the sea)
		cameraPos.y = max(cameraPos.y, cameraSize.y / 1.99); 

	} else {
	 	cameraPos = cameraPos.lerp(player.pos.add(vec2(11, 0)), 0.1);
		cameraPos.y = cameraSize.y / 2;
	}

	// Clamp camera's x position
	cameraPos.x = clamp(cameraPos.x, cameraSize.x / 2, levelSize.x - cameraSize.x / 2);

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

			if (inputButtonReleased(true)){
				level = 0;
				levelBuild(level);
				gameSetState(GameState.INTRO_STORY);
			} 	
			break;

		case GameState.INTRO_STORY:
			scrollTextY -= .001;

			if (inputButtonReleased(true)){
				levelBuild(level);
				gameSetState(GameState.PLAY);
			} 	
			break;

		case GameState.WON:
			if (inputButtonReleased(true)){
				gameSetState(GameState.TITLE);
			} 	
			break;

		case GameState.GAME_OVER:
			musicTargetTempo = tempoSlow;
			if (inputButtonReleased(true)) gameInit();
			break;

		case GameState.TRANSITION:
			if (--transitionFrames <= 0) {
				level++;
				if (level >= levelData.length) {
					gameSetState(GameState.WON);
					break;
				}

				levelBuild(level);
				gameSetState(GameState.PLAY);
			}
				
			break;

		case GameState.PLAY:
			levelUpdate();
			if (player.pos.x > levelSize.x - cameraSize.x / 2) {
				gameNextLevel();
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
	gameBlinkFrames = 15;

	level = mod(newLevel, levelData.length);
	levelBuild(level);

	transitionFrames = 0;

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
		gameDrawHudText("Turn screen to play", overlayCanvas.width / 2, overlayCanvas.height * 0.6, .5);

		drawRect(mainCanvasSize.scale(0.5), mainCanvasSize, new Color(0,0,0,.8), 0, undefined, true);

		mainContext.drawImage(overlayCanvas, 0, 0);
		return;
	}

	switch (gameState) {
		case GameState.TITLE:
			gameDrawHudText("BLACK CAT", overlayCanvas.width / 2, overlayCanvas.height * 0.3, 4);
			gameDrawHudText("SQUADRON", overlayCanvas.width / 2, overlayCanvas.height * 0.5, 4);
			gameDrawHudText("Tap to start", overlayCanvas.width / 2, overlayCanvas.height * 0.8, 1);
			break;

		case GameState.INTRO_STORY:
			gameDrawHudTextMultilines(introStory, overlayCanvas.width / 2, overlayCanvas.height * scrollTextY, 1.5);
			break			

		case GameState.TRANSITION:
			gameDrawHudText("Level cleared", overlayCanvas.width / 2, overlayCanvas.height * 0.4, 2);
			// fall-thru !

		case GameState.PLAY:
			gameDrawHudText("Level " + (level+1) + " / 8", (overlayCanvas.width * 1) / 4, ySpacing);
			gameDrawHudText("Score " + score, (overlayCanvas.width * 2) / 4, ySpacing);
			gameDrawHudText("Lives " + lives, (overlayCanvas.width * 3) / 4, ySpacing);

			if (player.isPaused())
			{
				gameDrawHudText(levelTexts[level], overlayCanvas.width / 2, overlayCanvas.height * 0.4, 2);
				gameDrawHudText("Get ready", overlayCanvas.width / 2, overlayCanvas.height * 0.8, 1);
			
				// gameDrawHudText("BLACK CAT", overlayCanvas.width / 2, overlayCanvas.height * 0.4, 4);
				// gameDrawHudText("SQUARDRON", overlayCanvas.width / 2, overlayCanvas.height * 0.6, 4);
			}

			shipDrawHealthBar();

			break;

		case GameState.GAME_OVER:
			gameDrawScoreStuff(ySpacing);

			gameDrawHudText("GAME OVER", overlayCanvas.width / 2, overlayCanvas.height * 0.5, 4);

			break;

		case GameState.WON:
			gameDrawScoreStuff(ySpacing);

			gameDrawHudText("CONGRATULATIONS", overlayCanvas.width / 2, overlayCanvas.height - ySpacing * 8, 3);
			gameDrawHudText("YOU SANK ALL SHIPS", overlayCanvas.width / 2, overlayCanvas.height - ySpacing * 5, 2);

			break;
	}

	if (gameBottomText) gameDrawHudText(gameBottomText, overlayCanvas.width * 0.5, overlayCanvas.height - ySpacing * 3);

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


engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, ["tiles.png"]);
