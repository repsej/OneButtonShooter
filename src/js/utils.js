
/**
 *
 * @param {Vector2} pos
 * @param {Vector2} size
 * @param {Number} fraction
 * @param {Number} frameThickness
 */
function drawBar(pos, size, fraction, frameThickness = 0.1, barColor = Colors.white, screenSpace = false) {
	// Frame
	drawRect(pos, size, Colors.black, 0, undefined, screenSpace);

	let barSize = size.subtract(vec2(frameThickness));

	// Bar background
	drawRect(pos, barSize, Colors.black, 0, undefined, screenSpace);

	// Bar
	let barActiveSize = barSize.copy();
	barActiveSize.x *= fraction;

	let barPos = pos.copy();
	barPos.x -= barSize.x / 2;
	barPos.x += barActiveSize.x / 2;
	drawRect(barPos, barActiveSize, barColor, 0, undefined, screenSpace);
}


