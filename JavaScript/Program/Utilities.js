// various helper functions and classes

// ---------- Constants ----------------------------------------------------- //
const NONE = -1;

// ---------- Utility functions --------------------------------------------- //
function convertTimeToString(time) {
	let timeInSeconds = Math.floor(time/60);
	let string = "";
	let minutes = Math.floor(timeInSeconds/60);
	string += minutes+" min ";
	
	let seconds = timeInSeconds%60;
	string += seconds+" s";
	
	return string;
}

function PseudorandomGenerator() {
	this.seed;
	// variables for multiply with carry method
	this.mw;
	this.mz;
}
PseudorandomGenerator.prototype.setSeed = function(seed) {
	this.seed = seed;
	this.mw = seed;
	this.mz = 987654321;
}
PseudorandomGenerator.prototype.getNext = function() {
	let result;
	let mask = 0xffffffff;
	this.mz = (36969 * (this.mz & 65535) + (this.mz >> 16)) & mask;
	this.mw = (18000 * (this.mw & 65535) + (this.mw >> 16)) & mask;
	result =((this.mz << 16) + this.mw) & mask;
	result /= 4294967296;
	return result + 0.5;
}
PseudorandomGenerator.prototype.integer = function(max) {
	return Math.floor(this.getNext()*max);
}

function getNoteFrequency(noteID) {
	return Math.pow(2, ((noteID - 49)/12)) * 440;
}