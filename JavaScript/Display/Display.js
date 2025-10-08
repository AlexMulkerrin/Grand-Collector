// Display class, handles rendering of application

// ---------- Constants ----------------------------------------------------- //
const colourID = {	background:"#bbbbbb", textDark:"#000000", 
					inventoryPanel:"#EAF2F0", panel:"#FFF3BA",
					
					cursor:"#77B3D1", highlight:"#AFCDCA",button:"#77B3D1", buttonLight:"#579B95", buttonShade:"#2B424D", 
					buttonSelect:"#E100FF",
					
					ocean:"#8296FF", grass:"#88AA79", tree:"#517C55", mushroom:"#C826FF", field:"#FFFAC1", bridgeBroken:"#B1EDE8", bridgeFixed:"#6A431A",
					
					castle:"#dddddd",woodcutter:"#B38F3E", chapel:"#B2190E",
					turnipFarmer:"#85F453", sheepFarmer:"#F2DEDF", 
					wheatFarmer:"#EFAA64", shipwright:"#4C44EA", ship:"#EFAA64",storm:"#D0DDE8",
					
					player:"#E6713E",
				};

// ---------- Display Module ------------------------------------------------ //
function Display(inSimulation, inControl) {
	this.targetSimulation = inSimulation;
	this.targetControl = inControl;

	this.c = document.getElementById("canvas");
	this.c.width = 770;//window.innerWidth-1;//
	this.c.height = 640;//window.innerHeight-1;//
	this.ctx = this.c.getContext("2d");
	
	this.ctx.imageSmoothingEnabled = false;
	this.scale = 4;
	this.sqSize = 64;
	
	this.displayWidth = Math.floor(this.c.width/(16*this.scale));
	this.displayHeight = Math.floor(this.c.height/(16*this.scale));
	this.playerOffsetX = Math.floor(this.displayWidth/2)-1;
	this.playerOffsetY = Math.floor(this.displayHeight/2);
	
	this.offsetX = 0;
	this.offsetY = 30;
	
	let t = this;
	this.tileset = new Image();
	this.tileset.src = "Tileset.png";
	this.tileset.onload = function(){t.tileset.isReady=true};
	
	this.sprites = new Image();
	this.sprites.src = "Sprites.png";
	this.sprites.onload = function(){t.sprites.isReady=true};
}
Display.prototype.refresh = function() {
	let sim = this.targetSimulation;
	
	this.ctx.fillStyle = colourID.background;
	this.ctx.fillRect(0,0,this.c.width,this.c.height);
	
	if (sim.gameState == gameStateID.startMenu) {
		this.drawInterface();
		this.drawButtons();
		this.drawCursor();
	} else {
	
		if (this.tileset.isReady == true) {
			this.drawTerrain();
			this.drawObjects();
		}
		//this.drawTerrainSimple();
		//this.drawObjectsSimple();
		
		
		if (this.sprites.isReady == true) {
			this.drawPlayer();
		}
		
		
		
		this.drawInventory();
		
		if (sim.gameState == gameStateID.inDialog) {
			this.drawDialog();
		}
		
		if (sim.flags.hasWon == true) {
			this.drawWinTimer();
		}
	}
	
	
	
}
Display.prototype.drawTerrain = function() {
	let sim = this.targetSimulation;
	let p = sim.player;
	
	let dx = p.x - p.oldX;
	let cameraX = dx*(p.animationDelay)/p.maxAnimationDelay;
	let dy = p.y - p.oldY;
	let cameraY = dy*(p.animationDelay)/p.maxAnimationDelay;
	
	for (let i=0; i<sim.width; i++) {
		for (let j=0; j<sim.height; j++) {
			let t = sim.terrain[i][j];
			
			let iAdj = i - sim.player.x + this.playerOffsetX;
			let jAdj = j - sim.player.y + this.playerOffsetY;
			
			let x = Math.floor((iAdj+cameraX)*16*this.scale+ this.offsetX);
			let y = Math.floor((jAdj+cameraY)*16*this.scale + this.offsetY);
			
			if (t.isExplored == true) {
				switch (t.type) {
					case terrainID.ocean:
						this.drawTile(x,y,0,0);
						break;
					case terrainID.grass:
						switch(t.variation) { // urgh a switch in another switch
							case 0:
								this.drawTile(x,y,0,4);
								break;
							case 1:
								this.drawTile(x,y,1,4);
								break;
							case 2:
								this.drawTile(x,y,2,4);
								break;
							case 3:
								this.drawTile(x,y,3,4);
								break;
							case 4:
								this.drawTile(x,y,1,0);
								break;
						}
						break;
					case terrainID.tree:
						this.drawTile(x,y,2,0);
						break;
					case terrainID.mushroom:
						this.drawTile(x,y,3,0);
						break;
					case terrainID.field:
						this.drawTile(x,y,0,1);
						break;
					case terrainID.bridgeBroken:
						this.drawTile(x,y,1,1);
						break;
					case terrainID.bridgeFixed:
						this.drawTile(x,y,2,1);
						break;
					default:
						this.ctx.fillStyle = "#ff00ff";
						this.ctx.fillRect(x, y, this.sqSize,this.sqSize);
						break;
				}
				
			} else {
				this.drawTile(x,y,3,1);
			}
		}
	}
}
Display.prototype.drawTerrainSimple = function() {
	let sim = this.targetSimulation;
	
	for (let i=0; i<sim.width; i++) {
		for (let j=0; j<sim.height; j++) {
			let t = sim.terrain[i][j];
			
			//if (t.isExplored == true) {
				switch (t.type) {
					case terrainID.ocean:
						this.ctx.fillStyle = colourID.ocean;
						break;
					case terrainID.grass:
						this.ctx.fillStyle = colourID.grass;
						break;
					case terrainID.tree:
						this.ctx.fillStyle = colourID.tree;
						break;
					case terrainID.mushroom:
						this.ctx.fillStyle = colourID.mushroom;
						break;
					case terrainID.field:
						this.ctx.fillStyle = colourID.field;
						break;
					case terrainID.bridgeBroken:
						this.ctx.fillStyle = colourID.bridgeBroken;
						break;
					case terrainID.bridgeFixed:
						this.ctx.fillStyle = colourID.bridgeFixed;
						break;
					default:
						this.ctx.fillStyle = "#ff00ff";
						break;
				}
				this.ctx.fillRect(i*this.sqSize+this.offsetX, j*this.sqSize+this.offsetY, this.sqSize,this.sqSize);
			//}
		}
	}
}
Display.prototype.drawTile = function(x,y,tx,ty) {
	this.ctx.drawImage(	this.tileset, tx*16, ty*16, 16, 16,
						x, y, 16*this.scale, 16*this.scale);
}
Display.prototype.drawObjects = function() {
	let sim = this.targetSimulation;
	let p = sim.player;
	
	let dx = p.x - p.oldX;
	let cameraX = dx*(p.animationDelay)/p.maxAnimationDelay;
	let dy = p.y - p.oldY;
	let cameraY = dy*(p.animationDelay)/p.maxAnimationDelay;
	
	for (let i=0; i<sim.object.length; i++) {
		let o = sim.object[i];
		if (o.isVisible) {
			let sx = o.x - sim.player.x + this.playerOffsetX;
			let sy = o.y - sim.player.y + this.playerOffsetY;

			if (sim.terrain[o.x][o.y].isExplored == true) {
		
				let x = Math.floor((sx+cameraX)*16*this.scale+ this.offsetX);
				let y = Math.floor((sy+cameraY)*16*this.scale + this.offsetY);
				
				switch (o.type) {
					case objectTypeID.castle:
						this.drawTile(x,y,0,2);
						break;
					case objectTypeID.woodcutter:
						this.drawTile(x,y,1,2);
						break;
					case objectTypeID.chapel:
						this.drawTile(x,y,2,2);
						break;
					case objectTypeID.turnipFarmer:
						this.drawTile(x,y,3,2);
						break;
					case objectTypeID.sheepFarmer:
						this.drawTile(x,y,0,3);
						break;
					case objectTypeID.wheatFarmer:
						this.drawTile(x,y,1,3);
						break;
					case objectTypeID.shipwright:
						this.drawTile(x,y,2,3);
						break;
					case objectTypeID.ship:
						if (p.isOnShip == false) {
							this.drawSprite(x,y,0,1)
						}
						//this.ctx.fillStyle = colourID.ship;
						break;
					case objectTypeID.storm: // it spins!
						if (o.animation%60>45) {
							this.drawTile(x,y,3,5);
						} else if (o.animation%60>30) {
							this.drawTile(x,y,2,5);
						} else if (o.animation%60>15) {
							this.drawTile(x,y,1,5);
						} else {
							this.drawTile(x,y,0,5);
						}
						break;
					default:
						this.ctx.fillStyle = "#ff00ff";
						this.ctx.fillRect(x+4, y+4, this.sqSize-8, this.sqSize-8);
						break;
				}
			
			}
			
		}
	}
}
Display.prototype.drawObjectsSimple = function() {
	let sim = this.targetSimulation;
	
	for (let i=0; i<sim.object.length; i++) {
		let o = sim.object[i];
		if (o.isVisible) {
			let x = o.x*this.sqSize + this.offsetX;
			let y = o.y*this.sqSize + this.offsetY;
			
			switch (o.type) {
				case objectTypeID.castle:
					this.ctx.fillStyle = colourID.castle;
					break;
				case objectTypeID.woodcutter:
					this.ctx.fillStyle = colourID.woodcutter;
					break;
				case objectTypeID.chapel:
					this.ctx.fillStyle = colourID.chapel;
					break;
				case objectTypeID.turnipFarmer:
					this.ctx.fillStyle = colourID.turnipFarmer;
					break;
				case objectTypeID.sheepFarmer:
					this.ctx.fillStyle = colourID.sheepFarmer;
					break;
				case objectTypeID.wheatFarmer:
					this.ctx.fillStyle = colourID.wheatFarmer;
					break;
				case objectTypeID.shipwright:
					this.ctx.fillStyle = colourID.shipwright;
					break;
				case objectTypeID.ship:
					this.ctx.fillStyle = colourID.ship;
					break;
				case objectTypeID.storm:
					this.ctx.fillStyle = colourID.storm;
					break;
				default:
					this.ctx.fillStyle = "#ff00ff";
					break;
			}
			
			
			this.ctx.fillRect(x+4, y+4, this.sqSize-8, this.sqSize-8);
		}
	}
}
Display.prototype.drawPlayer = function() {
	let p = this.targetSimulation.player;
	
	let x = this.playerOffsetX*this.sqSize+this.offsetX;
	let y = this.playerOffsetY*this.sqSize+this.offsetY;
	
	let frame = 0;
	if (p.stepAnimation%60>30) {
		frame = 1;
	}
	
	let type = 0;
	if (p.isOnShip) {
		type = 1;
	}
	 
	
	switch(p.facing) {
		case directionID.down:
			this.drawSprite(x,y,0+frame,type);
			break;
		case directionID.up:
			this.drawSprite(x,y,2+frame,type);
			break;
		case directionID.left:
			this.drawSprite(x,y,4+frame,type);
			break;
		case directionID.right:
			this.drawSprite(x,y,6+frame,type);
			break;		
	}
	
	//this.ctx.fillStyle = colourID.player;
	//this.ctx.fillRect(x, y, this.sqSize,this.sqSize);
}
Display.prototype.drawSprite = function(x,y,tx,ty) {
	this.ctx.drawImage(	this.sprites, tx*16, ty*16, 16, 16,
						x, y, 16*this.scale, 16*this.scale);
}
Display.prototype.drawInterface = function() {

	if (this.targetSimulation.gameState == gameStateID.startMenu) {
		this.drawIntro();
	}
}
Display.prototype.drawIntro = function() {

	this.ctx.fillStyle = colourID.panel;
	this.ctx.fillRect(100,150,570,320);
	
	this.ctx.font = "bold 16px Verdana";
	this.ctx.fillStyle = colourID.textDark;
	
	this.ctx.fillText("Welcome to Grand Collector",110,170);
	
	this.ctx.fillText("You are an aspiring collector wanting to gain the",110,210);
	
	this.ctx.fillText("title of Grand Collector.",110,230);
	
	this.ctx.fillText("Seek the king and follow his commands.",110,270);
	
	this.ctx.fillText("Game is played with WASD for movement and clearing",110,310);
	this.ctx.fillText("dialog boxes.",110,330);
	
	//this.ctx.fillText("Explore the chain of mana reactions and don't be afraid to",110,270);
	//this.ctx.fillText("retry if you run out of a critical ingredient.",110,290);
	
	//this.ctx.fillText("Hints:",110,330);
	//this.ctx.fillText("* white mana is found as gems",110,350);
	//this.ctx.fillText("* yellow mana lets you mine",110,370);
	//this.ctx.fillText("* most towers use the preceeding tower's mana",110,390);
	//this.ctx.fillText("* purple mana is general power source",110,410);
}
Display.prototype.drawButtons = function() {
	let sim = this.targetSimulation;
	let ctrl = this.targetControl;
	for (let i=0; i<ctrl.button.length; i++){
		let b = ctrl.button[i];
		
		this.ctx.fillStyle = colourID.buttonShade;
		this.ctx.fillRect(b.x, b.y, b.width, b.height);
		this.ctx.fillStyle = colourID.buttonLight;
		this.ctx.fillRect(b.x, b.y, b.width-2, b.height-2);
		
		
		if (ctrl.currentTool == i && sim.gameState == gameStateID.inGame){ // button depressed
			
			this.ctx.fillStyle = colourID.buttonLight;
			this.ctx.fillRect(b.x, b.y, b.width, b.height);
			this.ctx.fillStyle = colourID.buttonShade;
			this.ctx.fillRect(b.x, b.y, b.width-2, b.height-2);
		
			this.ctx.fillStyle = colourID.buttonSelect;
		} else { // button sticks out
			
			this.ctx.fillStyle = colourID.buttonShade;
			this.ctx.fillRect(b.x, b.y, b.width, b.height);
			this.ctx.fillStyle = colourID.buttonLight;
			this.ctx.fillRect(b.x, b.y, b.width-2, b.height-2);
			
			
			if (ctrl.mouse.hoveredButton == i) {
			this.ctx.fillStyle = colourID.highlight;
			} else {
				this.ctx.fillStyle = colourID.button;
			}
		}
		
		this.ctx.fillRect(b.x+2, b.y+2, b.width-4, b.height-4);
			
		if (b.text !== "") {
			let textSize = 24;//Math.floor(b.width/b.text.length);
			let textHeight = Math.floor((b.height-textSize)/2);
			this.ctx.font = "bold "+textSize+"px Verdana";
			this.ctx.fillStyle = colourID.textDark;
			this.ctx.fillText(b.text, b.x+16,b.y+textHeight+18);
		}
	}
}
Display.prototype.drawInventory = function() {
	let inv = this.targetSimulation.player.inventory;
	
	this.ctx.fillStyle = colourID.inventoryPanel;
	this.ctx.fillRect(0,0,120,inv.length*20+30);
	
	this.ctx.font = "bold 16px Verdana";
	this.ctx.fillStyle = colourID.textDark;
	
	this.ctx.fillText("Inventory:", 10,20);
	
	let y=0;
	for (let i=0; i<inv.length; i++) {
		let item = inv[i];
		let quantity = item.quantity;
		let name = itemTypes[item.type].name;
		
		let output = name;
		if (quantity > 0) {
			if (quantity != 1) {
				output += " x"+quantity;
			}
			this.ctx.fillText(output, 10,40+y*20);
			y++;
		}
	}
}

Display.prototype.drawDialog = function() {
	this.ctx.fillStyle = colourID.panel;
	this.ctx.fillRect(80,200,620,100);
	
	this.ctx.fillRect(80,160,150,30);
	
	this.ctx.font = "bold 16px Verdana";
	this.ctx.fillStyle = colourID.textDark;
	
	// display speaker ID
	let sim = this.targetSimulation;
	this.ctx.fillText(speakers[sim.currentSpeaker], 90,180);
	
	let text = dialogs[this.targetSimulation.currentDialog];
	let words = text.split(" ");
	let span = 50;
	let currentLength = 0;
	let i=0, k=0;
	
	while (currentLength<text.length) {
		let line = "";
		
		for (let j=0; j<span; ) {
			
			line += words[k]+" ";
			j = line.length;
			k++;
			if (k>= words.length) break;
		}
		currentLength += line.length;
		this.ctx.fillText(line, 100,225+i*20);
		i++;
	}
	//this.ctx.fillText(text, 30,220);
}

Display.prototype.drawWinTimer = function() {
	this.ctx.fillStyle = colourID.inventoryPanel;
	
	this.ctx.fillRect(150,70,450,30);
	
	this.ctx.font = "bold 16px Verdana";
	this.ctx.fillStyle = colourID.textDark;
	
	let sim = this.targetSimulation;
	let timeString = convertTimeToString(sim.endTime);
	this.ctx.fillText("You became Grand Collector in "+timeString+" !", 160,90);
}
Display.prototype.drawCursor = function() {
	let sim = this.targetSimulation;
	let m = this.targetControl.mouse;
	this.ctx.fillStyle = colourID.cursor;
	this.ctx.fillRect(m.x-2,m.y-2,4,4);
}
