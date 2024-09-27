function MyTank(x, y)
{
	Tank.call(this, x, y, "myTank", 2 , 0);
	this.isGod = true;
	this.godTime = 600;
	this.dir = UP;
	this.score = 0;
	this.name = 0;
	
	this.live = 5;
	this.score = 0;
}

MyTank.prototype = new Tank();

MyTank.prototype.draw = function(canvas)
{
	var myCanvas = document.getElementById(canvas);
	var graphics = myCanvas.getContext("2d");
	var img = document.getElementById("tankAll");
	
	var tankx,tanky,shieldx,shieldy;
	
	shieldx = images["shield"][0];
	shieldy = images["shield"][1];
	
	if(this.name == 1) 
	{
		tankx = images["myTank"][0];
		tanky = images["myTank"][1]; 
	}
	
	else
	{
		tankx = images["myTank2"][0];
		tanky = images["myTank2"][1]; 
	}
	
	graphics.drawImage(img, 32 * this.dir + tankx, tanky, 32, 32, this.x + offerX, this.y + offerY, 32, 32) ;	
		
	
	if(this.isGod)
	{
		var fr = parseInt(this.godTime / 6 )% 2;
		graphics.drawImage(img, shieldx, fr * 32 + shieldy, 32, 32, this.x + offerX, this.y + offerY, 32, 32) ;
	}
		
	return;
};

MyTank.prototype.shot = function()
{
	if(!this.isShot)
	{	
		this.isShot = true;
		var bullet = new Bullet(this.x,this.y,this.type,this.dir,this.name);
		bullets.push(bullet);
		sound.play("attack");
	}
};

MyTank.prototype.updata = function()
{
	if(this.isShot) 
	{
		this.time++;
		if(this.time > this.shotSpeed)
		{
			this.time = 0;
			this.isShot = false;
		}
	}
	
	if(this.isGod) 
	{
		this.godTime --;		
		if(this.godTime == 0)	{this.isGod = false;}
	}
};

function Tank1(x, y)
{
	Tank.call(this, x, y, "tank1", 2, 1);
	this.score = 100;
}

Tank1.prototype = new Tank();



function Tank2(x, y)
{
	Tank.call(this, x, y, "tank2", 3, 1);
	this.score = 200;
}

Tank2.prototype = new Tank();


function Tank3(x, y)
{
	Tank.call(this, x, y, "tank3", 1, 1);
	this.life = 3;
	this.score = 400;
	return;
}

Tank3.prototype = new Tank();

Tank3.prototype.draw = function(canvas)
{
	var myCanvas = document.getElementById(canvas);
	var graphics = myCanvas.getContext("2d");
	var img = document.getElementById("tankAll");
	
	graphics.drawImage(img, 32 * this.dir +(3 - this.life) * 128 + images["tank3"][0], images["tank3"][1], 32, 32, this.x + offerX, this.y + offerY, 32, 32) ;	
};


MyTank.prototype.think = function (amap) {
    
    var x = Math.round(this.x / 16);
    var y = Math.round(this.y / 16);

    
    var target = findNearestEnemy(this);

    if (target) {
        var tx = Math.round(target.x / 16);
        var ty = Math.round(target.y / 16);

        
        var aux_map = [];
        for (var i = 0; i < 25; i++) {
            aux_map[i] = new Array(25).fill(0);
        }

        var nextStep = astar(x, y, tx, ty, amap, aux_map);

        
        if (nextStep) {
            if (x > nextStep.x) {
                this.dir = LEFT;
            } else if (x < nextStep.x) {
                this.dir = RIGHT;
            } else if (y > nextStep.y) {
                this.dir = UP;
            } else if (y < nextStep.y) {
                this.dir = DOWN;
            }

            
            this.move(this.dir);
        }

        // 
		var futurePosition = predictTargetPosition(target);
        if (canShootAt(this, futurePosition)) {
            this.shot();
        }
    } else {
        // 
        this.randomMove();
    }
};


function selectTarget(tank) {
    // Not ready
    if (isBaseUnderThreat()) {
        return getBaseThreat(); // 
    }

    //
    return findNearestEnemy(tank);
}



function findNearestEnemy(tank) {
    var minDistance = Infinity;
    var nearestEnemy = null;

    for (var i = 0; i < tanks.length; i++) {
        var otherTank = tanks[i];
        if (otherTank.type !== 0 && otherTank.live > 0) {
            var dx = tank.x - otherTank.x;
            var dy = tank.y - otherTank.y;
            var distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < minDistance) {
                minDistance = distance;
                nearestEnemy = otherTank;
            }
        }
    }
    return nearestEnemy;
}

function findNearestEnemy_V2(tank) {
    var minDistance = Infinity;
    var nearestEnemy = null;

    for (var i = 0; i < tanks.length; i++) {
        var otherTank = tanks[i];
        if (otherTank.live > 0 && otherTank.type !== 1 && otherTank !== tank) { // BUG, it always follow P1
            var dx = tank.x - otherTank.x;
            var dy = tank.y - otherTank.y;
            var distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < minDistance) {
                minDistance = distance;
                nearestEnemy = otherTank;
            }
        }
    }
    return nearestEnemy;
}

function selectTarget(tank) {
    // 
    if (isBaseUnderThreat()) {
        return getBaseThreat(); // 
    }

    //
    return findNearestEnemy(tank);
}


function canShootAt(tank, target) {
    //
    var x1 = Math.round(tank.x / 16);
    var y1 = Math.round(tank.y / 16);
    var x2 = Math.round(target.x / 16);
    var y2 = Math.round(target.y / 16);

    if (x1 === x2) {
        //
        if (!hasObstacleBetween(tank, target, 'vertical')) {
            return true;
        }
    } else if (y1 === y2) {
        // 
        if (!hasObstacleBetween(tank, target, 'horizontal')) {
            return true;
        }
    }
    return false;
}

function hasObstacleBetween(tank, target, direction) {
    var x1 = Math.round(tank.x / 16);
    var y1 = Math.round(tank.y / 16);
    var x2 = Math.round(target.x / 16);
    var y2 = Math.round(target.y / 16);

    if (direction === 'vertical') {
        var yStart = Math.min(y1, y2) + 1;
        var yEnd = Math.max(y1, y2);
        for (var y = yStart; y < yEnd; y++) {
            if (map[y][x1] !== 0) {
                return true; // 
            }
        }
    } else if (direction === 'horizontal') {
        var xStart = Math.min(x1, x2) + 1;
        var xEnd = Math.max(x1, x2);
        for (var x = xStart; x < xEnd; x++) {
            if (map[y1][x] !== 0) {
                return true; // 
            }
        }
    }
    return false;
}

MyTank.prototype.randomMove = function () {
    //
    if (Math.random() < 0.05) { //
        var directions = [UP, DOWN, LEFT, RIGHT];
        this.dir = directions[Math.floor(Math.random() * directions.length)];
    }
    //
    this.move(this.dir);
};


function predictTargetPosition(target) {
    // 根据目标的当前速度和方向，预测其未来位置
    var predictedX = target.x + target.speedX[target.dir] * predictionTime;
    var predictedY = target.y + target.speedY[target.dir] * predictionTime;
    return { x: predictedX, y: predictedY };
}
