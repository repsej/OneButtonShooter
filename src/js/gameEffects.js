/** @format */

///////////////////////////////////////////////////////////////////////////////
// sound effects

const sound_wind = new Sound([,.01,500,.1,.3,,,0,,,,,,2,,,,,,,1e3]); // Random 6 - Mutation 3
const sound_engine =new Sound([2.1,,1e3,.1,.3,.03,1,.5,,,,.03,.06,.9,33,,,.54,,.37]); // Random 8

const sound_score = new Sound([1.04, 0, 2e3, , 0.02, 0.01, , 2.2, , , 50, , , , , , , 0.5, 0.01]); // Loaded Sound 1197
const sound_shoot =new Sound([2,,438,,,.08,3,1.2,-11,,,,,,,.5,.2,.55,.07,,208]); // Shoot 43

// prettier-ignore
const sound_explosion = new Sound([4,.5,802,.1,.05,.5,4,4.59,,,,,,1.2,,2,.21,.31,.1,.1]);



// const sound_rocketFly = new Sound([0.2, 0.1, 1e3, , 0.2, 2, , 0, -0.1, , , , , 0.3, , , , , 0.15]);

// // No getting fainter w range
// sound_rocketFly.range = 0;

function makeBlood(pos, amount) {
	let emitter = makeDebris(pos, hsl(0, 1, 0.5), amount, 0.2, 0);
	emitter.gravityScale = 1.2;
}

function makeDebris(pos, color = hsl(), amount = 50, size = 0.2, elasticity = 0.3, speed = 0.1) {
	const color2 = color.lerp(hsl(), 0.5);
	const fadeColor = color.copy();
	fadeColor.a = 0;

	const emitter = new ParticleEmitter(
		pos,
		0,
		1,
		0.1,
		amount / 0.1,
		PI,
		undefined,
		color,
		color2,
		fadeColor,
		fadeColor,
		3,
		size,
		size,
		speed / 10,
		0.05,
		1,
		0.95,
		0.5,
		PI,
		0, // random
		0.1,
		true
	);
	emitter.elasticity = elasticity;
	//emitter.particleDestroyCallback = persistentParticleDestroyCallback;
	return emitter;
}

function makeCollectEffect(pos, force = 1) {
	new ParticleEmitter(
		pos,
		0, // angle
		0.5, // eimtSize
		0.1, // emitTime
		100 * force, // emitRate
		PI / 2, // emitConeAngle
		undefined, // tileinfo
		rgb(1, 1, 1),
		rgb(1, 1, 1),
		rgb(0, 1, 1, 0),
		rgb(1, 1, 1, 0),
		0.5, // particleTime
		0.1, // sizeStart
		0.4, // sizeEnd
		0.01, // speed
		0.05, // damp
		0.9, // angledamp
		1, // angleDamp
		-0.2, // gravityScale
		PI, // particleConeAngle
		0.05, // fadeRate
		0.0, // randomness
		false, // col tile
		!isTouchDevice, // additive
		true, // linearColor
		5 // renderOrder
	);
}

function makeSmoke(pos, force = 1) {
	// smoke
	new ParticleEmitter(
		pos, // pos
		0, // angle
		0, // 0.1 * force, // radius / 2, // emitSize
		rand(0.2, 0.4), // emitTime
		rand(15, 30) * (force + 0.2), // emitRate
		PI / 2, // emiteCone
		spriteAtlas.blob,
		rgb(1, 1, 1, 1),
		rgb(0.5, 0.5, 0.5, 0.5),
		rgb(1, 1, 1),
		rgb(1, 1, 1),
		rand(0.1, 1), // time
		0.1 + 0.1 * force, // sizeStart
		0.01, // sizeEnd
		force * 0.001, // speed
		0.1, // angleSpeed
		0.8, // damp
		0.9, // angleDamp
		-0.2, // gravity
		PI, // particle cone
		0.5, // fade
		1, // randomness
		false, // collide
		false, // additive
		true, // colorLinear
		0 // renderOrder
	);
}

function makeExplosion(pos, force=1)
{
	// TODO: make force count !

	sound_explosion.play(pos, force);
	//makeBlood(pos, 100);

	// smoke
	for (let i = 0; i < 10*force; i++) {
		setTimeout( () => {
			makeSmoke(pos.add(randInCircle(.1)), rand(5,10)*force);

			// sparks
			makeDebris(pos, new Color(1, rand(1), 0), 1, rand(0.05, 0.15), 0, rand(0.2));
		}, i * 30);
	}

}