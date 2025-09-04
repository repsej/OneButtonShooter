/** @format */

let inputButton = 0;
let inputButtonLast = 0;

function inputReset() {
	inputButton = 0;
	inputButtonLast = 0;
}

function inputButtonHeld() {
	return inputButton & 1;
}

function inputButtonLastHeld() {
	return inputButtonLast & 1;
}

function inputButtonPressed() {
	return inputButton == 3;
}

function inputButtonReleased() {
	return inputButton == 4;
}

function inputReadRealInput() {
	let space = inputData[0]["Space"];
	let gamepadButton = inputData[1] && inputData[1][0];
	let mouseButton = inputData[0][0];

	return space | gamepadButton | mouseButton;
}

// Name chosed to not collide with littlejs
function inputUpdateXXX() { 
	inputButton = inputReadRealInput();
	inputButtonLast = inputButton;
}
