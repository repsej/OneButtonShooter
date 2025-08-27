/** @format */

let patterns = [[]];

let musicSongLength = 0;

let instrumentList = [];

let instrumentParams = [
	[1, 0, 43, 0.01, 0.5, 0.5, , 0.5], // 0 bass
	[20, 0, 170, 0.003, , 0.008, , 0.97, -35, 53, , , , , , 0.1], // 1 bass drum
	[0.8, 0, 270, , , 0.12, 3, 1.65, -2, , , , , 4.5, , 0.02], // 2 snare
	[1.1, 0, 77, , 0.3, 0.7, 2, 0.41, , , , , , , , 0.06], // 3 melody lead
	[1.5, , 400, , , 0.5, 2, 0.1, , 1, , , , 2.5, , 0.5, , 0.5, 0.1], // 4 crash
];


let songData = [
	instrumentList,
	patterns, // patterns
	[1], // sequence (NOT USED)
	80, // BPM
];

function unfoldPattern(instrument, pan, startnode, pattern, starts) {
	let nodes = [];
	nodes.push(instrument);
	nodes.push(pan);

	for (const s of starts) {
		for (const b of pattern) {
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
	let chordStarts = [
		, 0, 0, 5, 0, 7, 0, ,
	];

	patterns = [[], []];

	//// Melody

	let melPattern = [
		0, 4, 7, 0, 
		4, 7, 0, 4, 
		7, 0, 4, 7, 
		p, 7, p, p]; // in the mood melody

	let melNodes = unfoldPattern(3, -0.2, root + 12, melPattern, chordStarts);
	patterns[0].push(melNodes);

	let melNodes2 = unfoldPattern(3, 0.2, root + 12 + 12, melPattern, chordStarts);
	patterns[0].push(melNodes2);


	//// Bass

	let bassPattern = [0, p, 4, p, 7, p, 9, p, 10, p, 9, p, 7, p, 4, p]; // in the mood bass

	let bassNodes = unfoldPattern(0, -0.1, root, bassPattern, chordStarts);
	patterns[0].push(bassNodes);

	let bassNodes2 = unfoldPattern(0, 0.1, root + 7, bassPattern, chordStarts);
	patterns[0].push(bassNodes2);

	musicSongLength = bassNodes.length - 2;

	// Drums

	let bdStarts = Array(chordStarts.length).fill(0);
	let snareStarts = Array(chordStarts.length / 2).fill(0);

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

let vol = .5;
let musicOn = true;

let musicStartTime = 0;

function musicInit(level) {
	createMusic(level);
	musicStartTime = time;
	musicLastPlayedBeat = -1;
}

const tempo = 6;


let musicLastPlayedBeat = -1;
let musicTempo = tempo;

let beatFloat = 0;

function musicUpdate() {
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

	//console.log("beat", beat);

	// crashes
	if (beat % (musicSongLength / 4) == 0) musicPlayCrash(beat == 0 ? 2.5 : 1);

	for (const pat of patterns[0]) {
		let instrument = instrumentList[pat[0]];
		let pan = pat[1];
		let semitone = pat[(beat % (pat.length - 2)) + 2];

		if (typeof semitone == "number" && !isNaN(semitone)) {
			// console.log("semi", semitone);

			//instrument.playNote(semitone - 12, vec2(cameraPos.x + pan, cameraPos.y), vol);
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
	instrumentList[4].playNotePure(12, 0, vol * strength);
}
