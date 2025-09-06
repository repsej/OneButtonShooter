/** @format */

function savefileGetNumber(key, defaultValue = 0.0) {
	let retVal = localStorage.getItem(key);

	if (retVal == null) {
		return defaultValue;
	} else {
		return Number(retVal);
	}
}

// Returns if number was bigger
function savefileUpdateNumber(key, value, defaultValue = 0.0) {
	let diff = value - savefileGetNumber(key, defaultValue);

	if (diff > 0) {
		localStorage.setItem(key, value);
		return true;
	} else {
		return false;
	}
}

function savefileHiscoreGet() {
	return savefileGetNumber("bcsqr", 0);
}

function savefileHiscoreUpdate(score) {
	return savefileUpdateNumber("bcsqr", score);
}

// function savefileSet(key, val) {
// 	localStorage.setItem(key, JSON.stringify(val));
// }

// function savefileGet(key) {
// 	return JSON.parse(localStorage.getItem(key));
// }

// function savefileExist(key) {
// 	return localStorage.getItem(key) != null;
// }
