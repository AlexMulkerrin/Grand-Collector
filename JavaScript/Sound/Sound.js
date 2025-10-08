// Sound class, handles audio generation and management

// ---------- Sound Module -------------------------------------------------- //
function SoundSystem() {
	this.isActive = false;
	this.ctx = {};//new AudioContext();
	this.tone = [];
	this.isMuted = false;	
}
SoundSystem.prototype.activate = function() {
	this.ctx = new AudioContext();
	this.isActive = true;
}
SoundSystem.prototype.update = function() {
	if (this.isMuted == false && this.isActive == true) {
		this.updateTones();
	}
}
SoundSystem.prototype.updateTones = function() {
	for (let i=0; i<this.tone.length; i++) {
		if (this.tone[i].isPlaying) {
			this.tone[i].timeSpent += 0.2;
			if (this.tone[i].timeSpent > this.tone[i].duration) {
				this.tone[i].fade();
			}
		}
	}
	let newTone = [];
	for (let i=0; i<this.tone.length; i++) {
		if (this.tone[i].isPlaying) {
			newTone.push(this.tone[i]);
		}
	}
	this.tone = newTone;
}
SoundSystem.prototype.createTone = function(noteID, duration) {
	this.tone.push(new Tone( this.ctx, noteID, duration));
}
function Tone(audioContext, noteID, duration) {
	this.duration = duration || 0;
	this.timeSpent = 0;

	this.oscillator = audioContext.createOscillator();
	this.oscillator.type = "sine";
	this.oscillator.frequency.value = getNoteFrequency(noteID);
	this.oscillator.start();
	
	this.gainNode = audioContext.createGain();
	this.gainNode.gain.value = 0.2;
	this.oscillator.connect(this.gainNode);
	this.gainNode.connect(audioContext.destination);
	this.isPlaying = true;
}
Tone.prototype.fade = function() {
	this.gainNode.gain.value /= 1.2;
	if (this.gainNode.gain.value < 0.0001) {
		this.isPlaying = false;
		this.gainNode.disconnect();
	}
}
