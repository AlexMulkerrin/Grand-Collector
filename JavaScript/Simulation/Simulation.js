// Simulation class, contains state and handles updates

// ---------- Constants ----------------------------------------------------- //
const terrainID = {ocean:0, grass:1, tree:2, mushroom:3, field:4, bridgeBroken:5, bridgeFixed:6,};

const objectTypeID = {castle:0, woodcutter:1, chapel:2, turnipFarmer:3, sheepFarmer:4, wheatFarmer:5, shipwright:6, ship:7, storm:8};

const itemTypeID = {gold:0, axe:1, log:2, fireStone:3, mushroom:4, waterStone:5, wheat:6, sheep:7, earthStone:8, airStone:9,};
const itemTypes = [
	{name:"gold", description:"Lovely shiny stuff."},
	{name:"axe", description:"Will make short work of trees."},
	{name:"log", description:"Logs for building or burning."},
	{name:"fire stone", description:"The legendary artifact of fire."},
	{name:"mushroom", description:"Smells weird."},
	{name:"water stone", description:"The legendary artifact of water."},
	{name:"wheat", description:"This could make a whole lot of bread."},
	{name:"sheep", description:"Really needs shearing"},
	{name:"earth stone", description:"The legendary artifact of earth."},
	{name:"air stone", description:"The legendary artifact of air."},
];

const speakerID = {king:0, woodcutter:1, priest:2, turnipFarmer:3, sheepFarmer:4, wheatFarmer:5, shipwright:6, storm:7};

const speakers = [ "King", "Woodcutter", "Priest", "Turnip Farmer", "Shepherd", "Wheat Farmer", "Shipwright", "Narrator"];

const dialogs = [
	"As your king I order you to collect the 4 elemental stones. To that end collect 5 logs for me to heat my throne room. Go to the woodcutter to the east to collect them.", //0
	
	"Well have you collected the logs? I need 5 to keep the throne room cosy.", //1
	
	"Here to collect logs are you? I would do it myself if I hadn't thrown out my back. Here take this axe and collect them yourself.", //2
	
	"Collecting logs is tiring work. Make sure to sharpen that axe before bringing it back.", //3
	
	"Excellent work on collecting the logs. Now I don't need the fire stone to heat my castle. Next I want you to collect the water stone. The priest at the chapel to the south had it last.", //4
	
	"Did you find the priest? No doubt he has something he wants collected.", //5
	
	"Greetings young collector. May the great collector in the sky come down soon to collect us all.", //6
	
	"Ah you seek to collect the water stone. If you can help me with making this potion I can give it to you. I need you to collect 4 mushrooms to finish the potion.", //7
	
	"Oh yes, these mushrooms you collected will do nicely. Here have the water stone to add to your collection.", //8
	
	"Ah you have collected the water stone, yes? Let me see... Indeed, damp as usual. For the earth stone I recommend you ask the farmers in the far east.",//9
	
	"Farmers are always wanting something. Makes me want to collect more taxes from them.", //10 
	
	"G'day sir. I've collected a lot of lovely turnips with this here earth stone.", //11
	
	"Yes I have the earth stone, helps me collect in my turnip harvest. I can't be parting with it without something in return. How abouts getting me a sheep?", //12
	
	"That is one fluffy sheep you've collected. Here's the earth stone.", //13
	
	"All this wool I've collected will make nice sweaters for the turnips.", //14
	
	"I'll be collecting wool from my sheep soon.", //15
	
	"You're wanting one of my sheep to collect its wool eh? I'll need something in return. Collect 5 bushels of wheat for me and we'll have a deal.", //16
	
	"Here to collect a sheep then. Well you've brought the wheat so I can't complain.", //17
	
	"*collects thoughts* Morning sire.", //18
	
	"I would be harvesting my wheat but the bridge is out. If you can collect 10 logs I ought to be able to repair it.", //19
	
	"Great the bridge is fixed. Now don't stea- er, collect all my wheat you hear.", //20
	
	"Excellent work on collecting the earth stone. Shame it's so dirty. For the final stone, the air stone, I only know it is somewhere out at sea. Perhaps enquire with the shipwright on the southern coast.", //21
	
	"I'm not sure what the shipwright uses ships for. Collecting fish I suppose.", //22
	
	"Good day. All my ships are out collecting fish.", //23
	
	"Ah you wish to commision a ship. You'll need to collect a lot of logs to build a ship. 20 to be exact.", //24
	
	"Great you got the logs. Last little thing will be 20 gold for the collected sails and rigging", //25
	
	"Enjoy your new ship. May she collect many a fish for ye'.", //26
	
	"Inside the storm you spy the air stone. On collecting it the collected storm clouds dissipate.", //27
	
	"By jove you've collected all the elemental stones. In light of this act I pronounce you the Grand Collector! ...Now who is responsible for this bout of deforestation?", //28	
];

const directionID = {up:0, down:1, left:2, right:3};

const gameStateID = {startMenu:0, inGame:1, inDialog:2};

const notes = {bonk:52, boardShip:54, dismountShip:53, collect:55, gift:57, victory:70};

// ---------- Simulation Module --------------------------------------------- //
function Simulation(inSoundSystem) {
	this.targetSoundSystem = inSoundSystem;
	this.targetControl;
	
	this.reset();
}
Simulation.prototype.reset = function() {
	this.timer = 0;
	this.endTime = 0;
	this.isRunning = false;
	
	this.inputDelay = 0;
	this.isBlockedByDialog = false;

	this.flags = new Flags();
	
	this.random = new PseudorandomGenerator();
	this.seed = 12;//Math.floor(Math.random()*9000);
	this.random.setSeed(this.seed);
	
	this.gameState = gameStateID.startMenu;
	//this.gameState = gameStateID.inDialog;
	this.currentDialog = 0;
	this.currentSpeaker = speakerID.king;
	
	this.width = 23;
	this.height = 15;
	this.terrain = [];
	this.generateTerrain();
	
	this.object = [];
	this.generateObjects();
	
	this.player = new Player(3,3);
	this.player.inventory.push( new Item(itemTypeID.gold,20) );
	this.exploreTiles();
	// debug!
	//this.player.inventory.push( new Item(itemTypeID.log,25) );
	
	// debug! add ship
	//this.player.shipIndex = this.object.length;
	//this.object.push( new TerrainObject(5,0,objectTypeID.ship));
	//this.flags.hasShip = true;
	
	
}
function Flags() {
	this.hasAxe = false;
	this.hasFireStone = false;
	this.hasWaterStone = false;
	this.hasEarthStone = false;
	//debug!
	//this.hasEarthStone = true;
	
	this.earthStoneTip = false;
	
	this.hasSheep = false;
	this.fixedBridge = false;
	this.hasAirStone = false;
	this.airStoneTip = false;
	
	this.hasShip = false;
	
	this.hasWon = false;
	//debug!
	//this.hasWon = true;
	
}

Simulation.prototype.generateTerrain = function() {
	for (let i=0; i<this.width; i++) {
		this.terrain[i] = [];
		for (let j=0; j<this.height; j++) {
			if (i==0 || i==this.width-1 || j==0 || j==this.height-1) {
				this.terrain[i][j] = new Tile( terrainID.ocean );
			} else {
				choice = this.random.integer(20);
				if (choice < 3) {
					this.terrain[i][j] = new Tile( terrainID.ocean );
				} else if (choice < 6) {
					this.terrain[i][j] = new Tile( terrainID.tree );
				} else {
					this.terrain[i][j] = new Tile( terrainID.grass );
				}
			}
			
		}
	}
	this.generateVariations();
	
	// add mushrooms
	this.terrain[6][13].type = terrainID.mushroom;
	this.terrain[2][13].type = terrainID.mushroom;
	this.terrain[1][8].type = terrainID.mushroom;
	this.terrain[10][9].type = terrainID.mushroom;
	
	// add river
	this.terrain[19][1].type = terrainID.ocean;
	this.terrain[21][5].type = terrainID.ocean;
	this.terrain[19][4].type = terrainID.ocean;
	this.terrain[19][2].type = terrainID.bridgeBroken;
	
	// add fields
	this.terrain[20][1].type = terrainID.field;
	this.terrain[21][1].type = terrainID.field;
	this.terrain[20][2].type = terrainID.field;
	this.terrain[21][2].type = terrainID.field;
	
	this.terrain[20][3].type = terrainID.field;
	this.terrain[21][3].type = terrainID.field;
	this.terrain[20][4].type = terrainID.field;
	this.terrain[21][4].type = terrainID.field;
		
}
Simulation.prototype.generateVariations = function() {
	for (let i=0; i<this.width; i++) {
		for (let j=0; j<this.height; j++) {
			let t = this.terrain[i][j];
			if (t.type == terrainID.grass) {
				t.variation = this.random.integer(4);
			} 
			
		}
	}
}
function Tile(inType) {
	this.type = inType;
	this.isExplored = false;
	this.isOccupied = false;
	
	this.variation = 0;
}

Simulation.prototype.generateObjects = function() {
	this.object.push( new TerrainObject(3,2,objectTypeID.castle));
	
	this.object.push( new TerrainObject(8,2,objectTypeID.woodcutter));
	
	this.object.push( new TerrainObject(4,10,objectTypeID.chapel));
	
	// add farms
	this.object.push( new TerrainObject(13,3,objectTypeID.turnipFarmer));
	this.object.push( new TerrainObject(15,7,objectTypeID.sheepFarmer));
	this.object.push( new TerrainObject(18,3,objectTypeID.wheatFarmer));
	
	// add shipwright
	this.object.push( new TerrainObject(15,13,objectTypeID.shipwright));
	
	// add storm
	this.object.push( new TerrainObject(10,0,objectTypeID.storm));
	
	
}
function TerrainObject(inX, inY, inType) {
	this.x = inX;
	this.y = inY;
	this.type = inType;
	
	this.isVisible = true;
	this.animation = 0;
}

function Player(inX, inY) {
	this.x = inX;
	this.y = inY;
	
	this.inventory = [];
	
	this.isOnShip = false;
	this.shipIndex = NONE;
	
	this.oldX = inX;
	this.oldY = inY;

	this.animationDelay = 0;
	this.maxAnimationDelay = 15;
	
	this.stepAnimation = 0;
	this.facing = directionID.down;
}
Player.prototype.hasInInventory = function(inItemType, inQuantity) {
	let inv = this.inventory
	
	let found = false;
	for (let i=0; i<inv.length; i++) {
		let itemSlot = inv[i];
		if (itemSlot.type == inItemType) {
			if (itemSlot.quantity >= inQuantity) {
				found = true;
				break;
			}
		}
	}
	
	return found;
}
Player.prototype.addItem = function(inItem) {
	let inv = this.inventory
	
	let found = false;
	for (let i=0; i<inv.length; i++) {
		let itemSlot = inv[i];
		if (itemSlot.type == inItem.type) {
			itemSlot.quantity += inItem.quantity;
			found = true;
			break;
		}
	}
	
	if (found == false) {
		inv.push(inItem);
	}
}
Player.prototype.removeFromInventory = function(inItemType, inQuantity) {
	let inv = this.inventory
	
	let found = false;
	for (let i=0; i<inv.length; i++) {
		let itemSlot = inv[i];
		if (itemSlot.type == inItemType) {
			if (itemSlot.quantity >= inQuantity) {
				itemSlot.quantity -= inQuantity;
				found = true;
				break;
			}
		}
	}
	
	if (found == false) {
		console.log("couldn't find enough of the item");
	}
}
function Item(inType, inQuantity) {
	this.type = inType;
	this.quantity = inQuantity;
}

Simulation.prototype.movePlayer = function(dx, dy) {
	let p = this.player;
	
	
	let playedSound = false;
	
	if (dx == -1) {
		p.facing = directionID.left;
	} else if (dx == 1) {
		p.facing = directionID.right;
	}  else if (dy == -1) {
		p.facing = directionID.up;
	} else if (dy == 1) {
		p.facing = directionID.down;
	}

	if (this.gameState == gameStateID.inDialog) {
		this.gameState = gameStateID.inGame;
	} else if (p.isOnShip == false) {
		
		
		let newX = p.x + dx;
		let newY = p.y + dy;
		
		let isBlocked = false;
		if (newX>=0 && newX<this.width && newY>=0 && newY<this.height) {
			if (this.terrain[newX][newY].type == terrainID.ocean){
					isBlocked = true;
			} else if (this.terrain[newX][newY].type == terrainID.bridgeBroken){
					isBlocked = true;
			} else if (this.terrain[newX][newY].type == terrainID.tree) {
				isBlocked = true;
				if (this.flags.hasAxe) {
					this.terrain[newX][newY].type = terrainID.grass;
					this.terrain[newX][newY].variation = 4;
					this.player.addItem( new Item(itemTypeID.log,1) );
					this.handleSound(notes.collect,0.1);
					playedSound = true;
					
				}
			} else if (this.terrain[newX][newY].type == terrainID.mushroom) {
				isBlocked = true;
				this.terrain[newX][newY].type = terrainID.grass;
				this.player.addItem( new Item(itemTypeID.mushroom,1) );
				this.handleSound(notes.collect,0.1);
					playedSound = true;
				
			} else if (this.terrain[newX][newY].type == terrainID.field) {
				isBlocked = true;
				this.terrain[newX][newY].type = terrainID.grass;
				this.player.addItem( new Item(itemTypeID.wheat,1) );
				this.handleSound(notes.collect,0.1);
					playedSound = true;
				
			}
		} else {
			isBlocked = true;
		}
		
		// kludge for detecting ship
		if (this.flags.hasShip) {
			let s = this.object[p.shipIndex];
			if (newX == s.x && newY == s.y) {
				isBlocked = false;
				p.isOnShip = true;
				this.handleSound(notes.boardShip,0.1);
				
			}
		}
		
		if (isBlocked == false) {
			p.oldX = p.x;
			p.oldY = p.y;
		
			p.x = newX;
			p.y = newY;
			this.exploreTiles();
			
			p.animationDelay = p.maxAnimationDelay;
			
			
			
			this.checkObjectCollisions();
		} else {
			//play bonk sound
			if (playedSound == false) {
				this.handleSound(notes.bonk,0.1);
			}
		}
	} else { // on ship
		let newX = p.x + dx;
		let newY = p.y + dy;
		
		let isBlocked = false;
		if (newX>=0 && newX<this.width && newY>=0 && newY<this.height) {
			if (this.terrain[newX][newY].type == terrainID.ocean){
					isBlocked = false;
			} else if (this.terrain[newX][newY].type == terrainID.bridgeBroken){
					isBlocked = true;
			} else if (this.terrain[newX][newY].type == terrainID.tree) {
				isBlocked = true;
			} else if (this.terrain[newX][newY].type == terrainID.mushroom) {
				isBlocked = true;
			} else if (this.terrain[newX][newY].type == terrainID.field) {
				isBlocked = true;
				
				
			} else if (this.terrain[newX][newY].type == terrainID.grass) {
				p.isOnShip = false; // dismount ship
				this.handleSound(notes.dismountShip,0.1);
			}
		} else {
			isBlocked = true;
		}
		
		if (isBlocked == false) {
			p.oldX = p.x;
			p.oldY = p.y;
		
			p.x = newX;
			p.y = newY;
			this.exploreTiles();
			
			p.animationDelay = p.maxAnimationDelay;
			
			this.checkObjectCollisions();
			
			if (p.isOnShip == false) {
				// leave ship where it was
			} else {
				// move ship
				let s = this.object[p.shipIndex];
				s.x = p.x;
				s.y = p.y;
				
			}
		} else {
			//play bonk sound
			if (playedSound == false) {
				this.handleSound(notes.bonk,0.1);
			}
		}
	}
}
Simulation.prototype.exploreTiles = function() {
	for (let i=-2; i<=2; i++) {
		for (let j=-2; j<=2; j++) {
			let x = i+this.player.x;
			let y = j+this.player.y;
			if (x>=0 && x<this.width && y>=0 && y<this.height) {
				this.terrain[x][y].isExplored = true;
			}
		}
	}
}
Simulation.prototype.checkObjectCollisions = function() {
	let p = this.player;
	
	for (let i=0; i<this.object.length; i++) {
		let o = this.object[i];
		if (p.x == o.x && p.y == o.y) {
			this.doInteraction(i);
		}
	}
}
// The HORRIBLE conditional logic function
Simulation.prototype.doInteraction = function(index) {
	let o = this.object[index];
	let p = this.player;
	let f = this.flags;
	
	switch (o.type) {
		case objectTypeID.castle:
			if (f.hasFireStone == false ) {
				if (p.hasInInventory(itemTypeID.log, 5) ) {
					p.inventory.push( new Item(itemTypeID.fireStone,1) );
					this.handleSound(notes.gift,0.1);
					p.removeFromInventory(itemTypeID.log, 5);
					f.hasFireStone = true;
					this.setDialog(4,speakerID.king);
				} else {
					this.setDialog(1,speakerID.king);
				}
			} else if (f.hasWaterStone == false) {
				this.setDialog(5,speakerID.king);
			} else if (f.hasEarthStone == false) {
				if (f.earthStoneTip == false) {
					this.setDialog(9,speakerID.king);
					f.earthStoneTip = true;
				} else {
					this.setDialog(10,speakerID.king);
				}
			} else if (f.hasAirStone == false) {
				if (f.airStoneTip == false) {
					this.setDialog(21,speakerID.king);
					f.airStoneTip = true;
				} else {
					this.setDialog(22,speakerID.king);
				}
			} else {
				this.setDialog(28,speakerID.king);
				this.handleSound(notes.victory,0.1);
				if (f.hasWon == false) {
					this.endTime = this.timer;
					f.hasWon = true;
				}
			}
			break;
		case objectTypeID.woodcutter:
			if (f.hasAxe == false) {
				p.inventory.push( new Item(itemTypeID.axe,1) );
				this.handleSound(notes.gift,0.1);
				f.hasAxe = true;
				this.setDialog(2,speakerID.woodcutter);
			} else {
				this.setDialog(3,speakerID.woodcutter);
			}
			break;
		case objectTypeID.chapel:
			if (f.hasFireStone == false) {
				this.setDialog(6,speakerID.priest);
			} else if (f.hasWaterStone == false) {
				if (p.hasInInventory(itemTypeID.mushroom, 4) ) {
					p.inventory.push( new Item(itemTypeID.waterStone,1) );
					this.handleSound(notes.gift,0.1);
					p.removeFromInventory(itemTypeID.mushroom, 4);
					f.hasWaterStone = true;
					this.setDialog(8,speakerID.priest);
				} else {
					this.setDialog(7,speakerID.priest);
				}
				
			} else {
				this.setDialog(6,speakerID.priest);
			}
			break;
		case objectTypeID.turnipFarmer:
			if (f.hasWaterStone == false) {
				this.setDialog(11,speakerID.turnipFarmer);
			} else if (f.hasEarthStone == false) {
				if (p.hasInInventory(itemTypeID.sheep, 1) ) {
					p.inventory.push( new Item(itemTypeID.earthStone,1) );
					this.handleSound(notes.gift,0.1);
					p.removeFromInventory(itemTypeID.sheep, 1);
					f.hasEarthStone = true;
					this.setDialog(13,speakerID.turnipFarmer);
				} else {
					this.setDialog(12,speakerID.turnipFarmer);
				}
				
			} else {
				this.setDialog(14,speakerID.turnipFarmer);
			}
			break;
		case objectTypeID.sheepFarmer:
			if (f.hasWaterStone == false) {
				this.setDialog(15,speakerID.sheepFarmer);
			} else if (f.hasSheep == false) {
				if (p.hasInInventory(itemTypeID.wheat, 5) ) {
					p.inventory.push( new Item(itemTypeID.sheep,1) );
					this.handleSound(notes.gift,0.1);
					p.removeFromInventory(itemTypeID.wheat, 5);
					f.hasSheep = true;
					this.setDialog(17,speakerID.sheepFarmer);
				} else {
					this.setDialog(16,speakerID.sheepFarmer);
				}
				
			} else {
				this.setDialog(15,speakerID.sheepFarmer);
			}
			break;
		case objectTypeID.wheatFarmer:
			if (f.hasWaterStone == false) {
				this.setDialog(18,speakerID.wheatFarmer);
			} else if (f.fixedBridge == false) {
				if (p.hasInInventory(itemTypeID.log, 10) ) {
					this.terrain[19][2].type = terrainID.bridgeFixed;
					this.handleSound(notes.gift,0.1);
					p.removeFromInventory(itemTypeID.log, 10);
					f.fixedBridge = true;
					this.setDialog(20,speakerID.wheatFarmer);
				} else {
					this.setDialog(19,speakerID.wheatFarmer);
				}
				
			} else {
				this.setDialog(20,speakerID.wheatFarmer);
			}
			break;
		case objectTypeID.shipwright:
			if (f.hasEarthStone == false) {
				this.setDialog(23,speakerID.shipwright);
			} else if (f.hasShip == false) {
				if (p.hasInInventory(itemTypeID.log, 20) ) {
					p.shipIndex = this.object.length;
					this.object.push( 
						new TerrainObject(14,14,objectTypeID.ship));
					this.handleSound(notes.gift,0.1);
					p.removeFromInventory(itemTypeID.log, 20);
					p.removeFromInventory(itemTypeID.gold, 20);
					
					f.hasShip = true;
					this.setDialog(25,speakerID.shipwright);
				} else {
					this.setDialog(24,speakerID.shipwright);
				}
				
			} else {
				this.setDialog(26,speakerID.shipwright);
			}
			break;
		case objectTypeID.ship:
			p.isOnShip = true;
			break;
		case objectTypeID.storm:
			if (f.hasAirStone == false) {
				p.inventory.push( new Item(itemTypeID.airStone,1) );
				this.handleSound(notes.gift,0.1);
				f.hasAirStone = true;
				o.isVisible = false;
				this.setDialog(27,speakerID.storm);
			}
			break;
		default:
				console.log("unknown terrain object: "+o.type);
				break;
			
	}
}
Simulation.prototype.setDialog = function(index, speaker) {
	this.gameState = gameStateID.inDialog;
	this.currentDialog = index;
	this.currentSpeaker = speaker;

	this.isBlockedByDialog = true;
}

Simulation.prototype.handleSound = function(note, duration) {
	let sound = this.targetSoundSystem;

	if (sound.isActive == false) {
		sound.activate();
	} else {
		sound.createTone(note,duration);
	}
}

Simulation.prototype.update = function() {
	
	if (this.isRunning == true) {
		this.timer++;
		let p = this.player;
		
		if (p.animationDelay>0) {
			p.animationDelay--;
		}
		
		p.stepAnimation++;
		
		this.updateObjects();
	}

	this.handleInput(); // should this be after or before general updating
}
Simulation.prototype.handleInput = function() {
	let ctrl = this.targetControl;

	if (this.inputDelay>0) {
		this.inputDelay--;
	} else if (this.isBlockedByDialog == false) {
		if (ctrl.key["KeyW"]) {
			this.movePlayer(0,-1);
			this.inputDelay = 15;
		} else if (ctrl.key["KeyA"]) {
			this.movePlayer(-1,0);
			this.inputDelay = 15;
		} else if (ctrl.key["KeyS"]) {
			this.movePlayer(0,1);
			this.inputDelay = 15;
		} else if (ctrl.key["KeyD"]) {
			this.movePlayer(1,0);
			this.inputDelay = 15;
		}
	}
}
Simulation.prototype.updateObjects = function() {
	for (let i=0; i<this.object.length; i++) {
		let o = this.object[i];
		
		if (o.type == objectTypeID.storm) {
			o.animation++;
		}
	}
}
