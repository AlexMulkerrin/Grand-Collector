// Program class, root of whole application

// ---------- Global -------------------------------------------------------- //
var program;
// ---------- Program Module ------------------------------------------------ //
function loadProgram() {
	program = new Program();
}
function Program() {
	this.soundSystem = new SoundSystem();
	this.simulation = new Simulation(this.soundSystem);
	this.control = new Control(this.simulation);
	this.simulation.targetControl = this.control;
	this.display = new Display(this.simulation, this.control);
	this.control.targetDisplay = this.display;
	
	this.update();
}
Program.prototype.update = function() {
	this.simulation.update();	
	this.display.refresh();
	this.soundSystem.update();

	let t = this;
	window.requestAnimationFrame( function(){t.update();} );
}