/** @format */

const tempoSlow = 4;
const tempoMid = 5;
const tempoFast = 6;

let tempo = tempoSlow; 
let musicVol = .3;

let musicTargetTempo = tempo; // set to change tempo

let patterns = [[]];

let musicSongLength = 0;

let instrumentList = [];

let instrumentParams = [
	[1, 0, 43, 0.05, 0.5, 0.5, , 0.5], // 0 bass
	[10, 0, 170, 0.003, , 0.008, , 0.97, -35, 53, , , , , , 0.1], // 1 bass drum
	[0.6, 0, 270, , , 0.12, 3, 1.65, -2, , , , , 4.5, , 0.02], // 2 snare
	[1.5, 0, 130, .1, .2,
	 .2, 2, 1.4, , , 
	 , , , .3, , 
	 .2, .18, .7, .14, ,922], // 3 melody lead
	[1, , 400, , , 0.5, 2, 0.1, , 1, , , , 2.5, , 0.5, , 0.5, 0.1], // 4 crash
];

	//[1.1, .05, 77, , 0.3, 0.9, 2, 0.41, , , , , , , , 0.1], // 3 melody lead


    // volume = 1, randomness = .05, frequency = 220, attack = 0, sustain = 0,  	  // 5 
    // release = .1, shape = 0, shapeCurve = 1, slide = 0, deltaSlide = 0,			  // 5
    // pitchJump = 0, pitchJumpTime = 0, repeatTime = 0, noise = 0, modulation = 0,   // 5
    // bitCrush = 0, delay = 0, sustainVolume = 1, decay = 0, tremolo = 0, filter = 0 // 6

function unfoldPattern(instrument, pan, startnode, pattern, starts, altPattern=undefined, altIndex=0) {
	let nodes = [];
	nodes.push(instrument);
	nodes.push(pan);

	for (let i = 0; i < starts.length; i++) {
		const s = starts[i];

		let p = pattern;
		if (altPattern && i == altIndex) {
			p = altPattern;
		}

		for (const b of p) {
			nodes.push(startnode + b + s);
		}
	}

	return nodes;
}


function createMusic(level) {
	const p = undefined;
	const root = 19; // 19 = G


	createInstruments();

	// prettier-ignore
	let chordStartsMel = [
		p, p, p, p, p, p, 0, 0, 5, 0, 7, 0,
	];

	let chordStartsBass = [
		0, 0, 5, 0, 7, 0, 0, 0, 5, 0, 7, 0,
	];


	patterns = [[], []];

	//// Melody

	let melPattern = [
		0, 3, 7, 0, 
		3, 7, 0, 3, 
		7, 0, 3, 7, 
		p, 7, p, p]; // in the mood melody (minor version)

	let altMelPattern = [
		0, 0, 0, 0, 
		0, 0, 0, 0, 
		0, 0, p, 0, 
		p, p, p, p]; // in the mood melody


	let altMelPattern2 = [
		12, 12, 12, 12, 
		12, 12, 12, 12, 
		12, 12, p, 12, 
		p, p, p, p]; // in the mood melody

	let melNodes = unfoldPattern(3, -0.5, root + 12 + .2, melPattern, chordStartsMel, altMelPattern, 11);
	patterns[0].push(melNodes);

	melNodes = unfoldPattern(3, 0.5, root + 24 - .2, melPattern, chordStartsMel, altMelPattern2, 11);
	patterns[0].push(melNodes);

	//// Bass

	// major pent: 0, 2, 4, 7, 9
	// minor pent: 0, 3, 5, 7, 10

//	let bassPattern = [0, p, 4, p, 7, p, 9, p, 10, p, 9, p, 7, p, 4, p]; // in the mood bass
	let bassPattern = [0, p, 3, p, 7, p, 9, p, 10, p, 9, p, 7, p, 3, p]; // in the mood bass (minor version)


	let bassNodes = unfoldPattern(0, -0.1, root - .1, bassPattern, chordStartsBass);
	patterns[0].push(bassNodes);

	bassNodes = unfoldPattern(0, 0.1, root + 7.1, bassPattern, chordStartsBass);
	patterns[0].push(bassNodes);

	musicSongLength = bassNodes.length - 2;

	//// Drums

	let bdStarts = Array(chordStartsMel.length).fill(0);
	let snareStarts = Array(chordStartsMel.length / 2).fill(0);

	let bdPattern = [0, p, p, p, 0, p, p, p];
	let snarePattern = [
		p, p, 0, p,
		p, p, 0, p,
		p, p, 0, p,
		p, p, 0, 0,
	];

	patterns[0].push(unfoldPattern(1, 0, 7, bdPattern, bdStarts));
	patterns[0].push(unfoldPattern(2, 0.1, 7, snarePattern, snareStarts));
}

let musicOn = true;

let musicStartTime = 0;

function musicInit(level) {
	createMusic(level);
	musicStartTime = time;
	musicLastPlayedBeat = -1;
}



let musicLastPlayedBeat = -1;
let musicTempo = tempo;

let beatFloat = 0;

function musicUpdate() {
	tempo = tempo * .9 + musicTargetTempo * .1;

	beatFloat += musicTempo / 60;

	let beat = Math.floor(beatFloat) % musicSongLength;

	// Swing it baby !
	if (beat % 2 == 0) {
		musicTempo = tempo;
	} else {
		musicTempo = tempo * 3/2;
	}

	if (beat == musicLastPlayedBeat) return;

	musicLastPlayedBeat = beat;

	if (!musicOn) return;

	// if (beat == 0) musicPlayCrash(2);

	for (const pat of patterns[0]) {
		let instrument = instrumentList[pat[0]];
		let pan = pat[1];
		let semitone = pat[(beat % (pat.length - 2)) + 2];

		let vol = rand(musicVol*.8, musicVol*1.2);

		if (beat % 4 == 2) vol = 1.5 * musicVol; // accentuate the off beats !

		if (typeof semitone == "number" && !isNaN(semitone)) {
			instrument.playNotePure(semitone - 12, pan, vol);
		}
	}
}

function createInstruments() {
	for (let k in instrumentParams) {
		instrumentList[k] = new Sound(instrumentParams[k]);
	}
}

function musicPlayCrash(strength = 2) {
	instrumentList[4].playNotePure(12, 0, musicVol * strength);
}
