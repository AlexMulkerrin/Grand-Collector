// Control class, handles input

// ---------- Control Module ------------------------------------------------ //
function Control(inSimulation) {
	this.c = document.getElementById("canvas");
	this.targetSimulation = inSimulation;
	this.targetDisplay = {};
	
	this.button = [];
	this.createButtons();
	
	this.mouse = new Mouse();

	this.key = {};
	
	let t = this;
	
	window.addEventListener("mousemove", function(e){t.handleMouseMove(e)});
	window.addEventListener("mousedown", function(e){t.handleMouseDown(e)});
	window.addEventListener("mouseleave", function(e){t.handleMouseLeave(e)});
	
	window.addEventListener("keydown", function(e){t.handleKeyDown(e)});
	window.addEventListener("keyup", function(e){t.handleKeyUp(e)});
}
function Mouse() {
	this.x = -100;
	this.y = -100;
	this.isOverGrid = false;
	this.isClicked = false;
	this.whichButton = NONE;
	
	this.gridX = 0;
	this.gridY = 0;
	this.hoveredButton = NONE;
}
Control.prototype.createButtons = function() {
	let sim = this.targetSimulation;

	this.button = [];
	
	
	if (sim.gameState == gameStateID.startMenu) {
		this.button.push(new Button(556, 400, 108,64, "begin", "begin","begin",0));
	
	}
}
function Button( inX, inY, inWidth, inHeight, inText, inTooltip, inFunction, inFuncArgs) {
	this.x = inX;
	this.y = inY;
	this.width = inWidth;
	this.height = inHeight;
	
	this.text = inText;
	this.tooltip = inTooltip;
	this.function = inFunction;
	this.functionArguments = inFuncArgs;
	
}
Button.prototype.mouseIsInBounds = function(x, y) {
	if (x >= this.x && x <= this.x+this.width &&
		y >= this.y && y <= this.y+this.height) {
			return true;
		} else {
			return false;
		}
}

Control.prototype.handleMouseMove = function(event) {
	let m = this.mouse;

	m.x = event.layerX;
	m.y = event.layerY;
	
	this.mouse.hoveredButton = NONE;
	for (let i=0; i<this.button.length; i++) {
		let b = this.button[i];
		if (b.mouseIsInBounds(this.mouse.x, this.mouse.y)) {
			this.mouse.hoveredButton = i;
		}
	}
}
Control.prototype.handleMouseDown = function(event) {
	let sim = this.targetSimulation;
	let m = this.mouse;
	m.isClicked = true;
	m.whichButton = event.which;
	
	if (this.mouse.hoveredButton > NONE) {
		let b = this.button[this.mouse.hoveredButton];
		this[b.function](b.functionArguments);
	
	}
}
Control.prototype.handleMouseLeave = function(event) {
	let m = this.mouse;
	
	m.x = -100;
	m.y = -100;
	m.isOverGrid = false;
}
Control.prototype.handleKeyDown = function(event) {
	let sim = this.targetSimulation;
	let code = event.code;

	this.key[code] = true;
	
	/*
	switch (code) {
		case "KeyA":
			sim.movePlayer(-1,0);
			break;
		case "KeyD":
			sim.movePlayer(1,0);
			break;
		case "KeyW":
			sim.movePlayer(0,-1);
			break;
		case "KeyS":
			sim.movePlayer(0,1);
			break;
		case 37: // left arrow
			this.targetSimulation.movePlayer(-1,0);
			event.preventDefault();
			break; 
	} */
}
Control.prototype.handleKeyUp = function(event) {
	let code = event.code;

	this.key[code] = false;

	let sim = this.targetSimulation;
	sim.isBlockedByDialog = false;
}

Control.prototype.begin = function(value) {
	let sim = this.targetSimulation;
	sim.gameState = gameStateID.inDialog;
	sim.isRunning = true;
	sim.handleSound(55,0.1);
	
	
	this.createButtons();
	this.mouse.hoveredButton = NONE;
}