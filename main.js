var gridSpaceSize = 70;
var halfGridSpaceSize = gridSpaceSize/2;

function drawX(context, x, y) {
    context.beginPath();
    context.lineWidth = "5";
    context.strokeStyle = "blue";
    context.moveTo(x - halfGridSpaceSize, y - halfGridSpaceSize);
    context.lineTo(x + halfGridSpaceSize, y +  halfGridSpaceSize);
    context.stroke();

    context.moveTo(x + halfGridSpaceSize, y - halfGridSpaceSize);
    context.lineTo(x - halfGridSpaceSize, y + halfGridSpaceSize);
    context.stroke();
}

class Vector2 {
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
    up(){
        return new Vector2(this.x, this.y - 1);
    }
    down(){
        return new Vector2(this.x, this.y + 1);
    }
    left(){
        return new Vector2(this.x - 1, this.y);
    }
    right(){
        return new Vector2(this.x + 1, this.y);
    }
    min(){
        return Math.min(this.x, this.y);
    }
}

class Vector3 {
    constructor(x,y,z){
        this.x = x;
        this.y = y;
        this.z = z;
    }
    back(){
        return new Vector3(this.x, this.y, this.z - 1);
    }
    down(){
        return new Vector3(this.x, this.y - 1, this.z);
    }
    forward(){
        return new Vector3(this.x, this.y, this.z + 1);
    }
    left(){
        return new Vector3(this.x - 1, this.y, this.z);
    }
    right(){
        return new Vector3(this.x + 1, this.y, this.z);
    }
    up(){
        return new Vector3(this.x, this.y + 1, this.z);
    }
    toVector2(){
        return new Vector2(this.x, this.y);
    }
    min(){
        return Math.min(this.x, this.y, this.z);
    }
}

class Grid2D {
    constructor({size = new Vector2(0,0), components = []} = {}){
        this.size = size;
        this.components = components;
        this.validateComponents();
    }
    validateComponents(){
        this.components.forEach(item => {
            if(item.position.x < 0 || item.position.y < 0 || item.position.x > this.size.x || item.position.y > this.size.y){
                console.error("Component Position out of Bounds.");
            }
        });
    }
}

class Grid3D {
    constructor({size = new Vector3(1,1,1), gridLayers = []} = {}){
        this.size = size;
        if(gridLayers.length > 0){
            this.gridLayers = gridLayers;
        }
        else if(this.size.z > 0){
            this.gridLayers = [];
            for(i = 0; i < this.size.z; i++){
                this.gridLayers.push(new Grid2D({size: new Vector2(this.size.x, this.size.y)})); 
            }
        }
        this.validateComponents();
    }
    validateComponents(){
        if(this.size.z != this.gridLayers.length){
            console.error("Grid Layers mistmatch, the vertical size and number of layers are not equal.");
        }
        this.gridLayers.forEach(item => {
            if(item.size.x < 1 || item.size.y < 1 || item.size.x > this.size.x || item.size.y > this.size.y){
                console.error("Grid2D size error, grid sizes must be greater than zero and match Grid3D size.");
            }
        });
    }
}

class Dungeon {
    constructor({rooms = [], corridors = [], walls = [new WallSegment()]} = {}){
        this.rooms = rooms;
        this.corridors = corridors;
    }
    GetObjectAtLocation(targetLocation){
        let tempArray = this.rooms.concat(this.corridors);
        if(targetLocation.z != null){
            return tempArray.filter(item => item.position.x == targetLocation.x && item.position.y == targetLocation.y && item.position.z == targetLocation.z);
        }
        else {
            return tempArray.filter(item => item.position.x == targetLocation.x && item.position.y == targetLocation.y);
        }
    }
    DrawDungeon(context){
        this.rooms.forEach(room => {
            let roomPosX = room.position.x * gridSpaceSize;
            let roomPosY = room.position.y * gridSpaceSize;
            context.fillStyle = "#FF0000";
            context.beginPath();
            context.fillRect(roomPosX, roomPosY, room.size.x * gridSpaceSize, room.size.y * gridSpaceSize);
            context.stroke();
            room.doorways.forEach(doorway => {
                context.fillStyle = "#00FF00";
                context.beginPath();
                context.fillRect((doorway.position.x*gridSpaceSize)+roomPosX, (doorway.position.y*gridSpaceSize)+roomPosY, doorway.size.x*gridSpaceSize, doorway.size.y*gridSpaceSize);
                context.stroke();
            });
            room.traps.forEach(trap =>{
                drawX(context,((trap.position.x) * gridSpaceSize) + roomPosX + halfGridSpaceSize, ((trap.position.y)*gridSpaceSize) + roomPosY + halfGridSpaceSize);
            });
        });
        this.corridors.forEach(corridor => {
            context.fillStyle = "#FFFF00";
            let corridorPosX = corridor.position.x * gridSpaceSize;
            let corridorPosY = corridor.position.y * gridSpaceSize;
            let corridorWidth = corridor.size.x * gridSpaceSize;
            let corridorHeight = corridor.size.y * gridSpaceSize;
            context.beginPath();
            context.fillRect(corridorPosX, corridorPosY, corridorWidth, corridorHeight);
            context.stroke();
            corridor.doorways.forEach(doorway => {
                context.fillStyle = "#00FF00";
                context.beginPath();
                context.fillRect((doorway.position.x * gridSpaceSize) + corridorPosX, (doorway.position.y * gridSpaceSize) + corridorPosY, doorway.size.x * gridSpaceSize, doorway.size.y * gridSpaceSize);
                context.stroke();
            });
            corridor.traps.forEach(trap => {
                drawX(context,(trap.position.x*gridSpaceSize) + corridorPosX + halfGridSpaceSize, (trap.position.y*gridSpaceSize) + corridorPosY + halfGridSpaceSize, trap.size.y, trap.size.x);
            });
        });
    }
    DetermineBounds2D(){
        let xArray = [];
        let yArray = [];
        this.rooms.forEach(room => {
            xArray.push(room.position.x);
            xArray.push(room.position.x + room.size.x);
            yArray.push(room.position.y + (room.size.y > 1 ? room.size.y : 0));
        });
        this.corridors.forEach(corridor => {
            xArray.push(corridor.position.x);
            xArray.push(corridor.position.x + corridor.size.x);
            yArray.push(corridor.position.y + (corridor.size.y > 1 ? corridor.size.y : 0));
        });
        let returnObject = {
            minX: Math.min(...xArray),
            maxX: Math.max(...xArray),
            minY: Math.min(...yArray),
            maxY: Math.max(...yArray)
        };
        if(returnObject != null){
            return returnObject;
        }
        return {};
    }
}

class Room {
    constructor({size = new Vector3(1,1,1), position = new Vector2(0,0), traps = [], doorways = []} = {}){
        this.size = size;
        this.position = position;
        this.traps = traps;
        this.doorways = doorways;
    }
}

class Corridor {
    constructor({size = new Vector3(1,1,1), position = new Vector2(0,0), traps = [], doorways = []} = {}){
        this.size = size;
        this.position = position;
        this.traps = traps;
        this.doorways = doorways;
    }
}

class Trap {
    constructor({size = new Vector3(1,1,1), position = new Vector2(0,0)} = {}){
        this.size = size;
        this.position = position;
    }
}

class Doorway {
    constructor({size = new Vector3(1,1,1), position = new Vector2(0,0), type = "Door", material = "Wood", locked = false} = {}){
        this.size = size;
        this.position = position;
        this.type = type;
        this.material = material;
        this.locked = locked;
    }
}

class WallSegment {
    constructor({points = [new Vector2(0,0), new Vector2(1,1)]} = {}){
        this.points = points;
    }
}



var dunJSON = {
    rooms: [
        {
            size: new Vector3(2,2,1), 
            position: new Vector2(0,0), 
            traps: [], 
            doorways: [{
                size: new Vector3(1,1,1),
                position: new Vector2(1,0)
            }]
        },
        {
            size: new Vector3(2,2,1), 
            position: new Vector2(4,0), 
            traps: [{
                size: new Vector3(2,2,1),
                position: new Vector2(1,0)
            }], 
            doorways: [{
                size: new Vector3(1,1,1),
                position: new Vector2(1,0)
            }]
        }
    ],
    corridors: [
        {
            size: new Vector3(2,1,1), 
            position: new Vector2(2,0), 
            traps: [], 
            doorways: [{
                size: new Vector3(1,1,1),
                position: new Vector2(0,0)
            }]
        },
        {
            size: new Vector3(2,1,1), 
            position: new Vector2(6,0), 
            traps: [], 
            doorways: []
        },
        {
            size: new Vector3(1,4,1), 
            position: new Vector2(8,0), 
            traps: [], 
            doorways: []
        }
    ]
};

var returnedDungeon = Object.assign( new Dungeon(), dunJSON);

var bounds = returnedDungeon.DetermineBounds2D();

var c = document.getElementById("myCanvas");
var height = bounds.maxY;
var width = bounds.maxX;
c.height = height*gridSpaceSize;
c.width = width*gridSpaceSize;



var columns = height;
var rows = width;
var ctx = c.getContext("2d");

//draw grid
for (let y = 0; y < columns; y++) {
	for (let x = 0; x < rows; x++) {
    	ctx.beginPath();
        ctx.rect(x*gridSpaceSize, y*gridSpaceSize, gridSpaceSize, gridSpaceSize);
        ctx.stroke();
	}
}

returnedDungeon.DrawDungeon(ctx);