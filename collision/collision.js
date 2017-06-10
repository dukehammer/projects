// Get HTML elements
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var debugOutput = document.getElementById("debugOutput");

// Set constants and variables
var W = 1500; var H = 600;
var showCollisionColors = false;
var showVelocityIndicators = false;
var velocityIndicatorMag = 50;
var accelerationIndicatorMag = 50000;
var autoRun = true;
var running;
var edgeWrap = true;
var elastic = true;
var logarithmicRadius = false;
var applyGravity = false;
var particles = [];
var debugLog = "";
var gravConst = 6.673 * Math.pow(10, -.2);
var maxSpeed = 5;

// Create particles
// createTwo();
createRandom(10);

if (autoRun) { running = setInterval(main, 1); }

function changeAutoRun () {

	if (autoRun) {
		autoRun = false;
		clearInterval(running);
	}

	else {
		autoRun = true;
		running = setInterval(main, 1);
	}
}

//============================================
//===========   Creation Helpers   ===========
//============================================

// Two jQuery functions for creating a particle with velocity
var startPosX = 0;
var startPosY = 0;
var endPosX = 0;
var endPosY = 0;
var drawing = false;

$('#canvas').mousedown(function (e) {

	startPosX = e.pageX - $(this).offset().left;
	startPosY = e.pageY - $(this).offset().top;

	drawing = true;
});

$('#canvas').mousemove(function (e) {

	endPosX = e.pageX - $(this).offset().left;
	endPosY = e.pageY - $(this).offset().top;
});

$('#canvas').mouseup(function (e) {

	drawing = false;
	particles.push(new particle(startPosX, startPosY, (endPosX - startPosX) / 100, (endPosY - startPosY) / 100, 0, 0, Math.random() * 1000000 + 1, "white"));
});

function drawLine() {

	ctx.fillStyle = "white";
	ctx.beginPath();
	ctx.arc(startPosX, startPosY, 10, 0, 2 * Math.PI, false);
	ctx.fill();

	ctx.beginPath();
	ctx.moveTo(startPosX, startPosY);
	ctx.lineTo(endPosX, endPosY);
	ctx.strokeStyle = "lightblue";
	ctx.stroke();
}

function createTwo() {

	//particles.push(new particle(500, 100, .726483, 0, 0, 0, 1000, "blue"));
	particles.push(new particle(500, 300, 0, 0, 0, 0, 100000000, "white"));
	//particles.push(new particle(120, 140, 0, 0, 0, 0, 1000, "white"));
}

function createRandom(num) {

	for (i = 0; i < num; i++) {

		// Random position
		var x = Math.random() * W;
		var y = Math.random() * H;

		// Random velocity
		var vx = Math.random() * 2 - 1;
		var vy = Math.random() * 2 - 1;

		// Random mass
		var mass = Math.random() * 1000000 + 1;

		// Random color
		var r = Math.random() * 255 >> 0;
		var g = Math.random() * 255 >> 0;
		var b = Math.random() * 255 >> 0;

		particles.push(new particle(x, y, vx, vy, 0, 0, mass, "rgb(" + r + ", " + g + ", " + b + ")"));
	}
}

function calculateRadius(p) {

	if (!logarithmicRadius) {

		return Math.pow(3 * (p.mass / (4 * Math.PI)), 1 / 3);
	}

	else {

		return Math.log(p.mass);
	}
}


//============================================
//==============   Main  Loop   ==============
//============================================

function main() {

	debugLog = "";

	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, W, H);

	// Clear all bounding and colliding flags and acceleration
	for (var i = 0; i < particles.length; i++) {


		var p = particles[i];

		p.isBounding = false;
		p.isCollided = false;
		p.acceleration.x = 0;
		p.acceleration.y = 0;
		p.capSpeed();
	}

	// Detect all collisions
	for (var i = 0; i < particles.length; i++) {

		var p = particles[i];

		for (var j = i + 1; j < particles.length; j++) {

			var q = particles[j];

			if (applyGravity) {

				p.gravitationalForce(q);
				p.capSpeed();
				q.capSpeed();
			}

			// Axis-Aligned Bounding Box check
			if (p.bounding(q)) {

				// Boxes intersect, now check if circles intersect.
				if (p.colliding(q)) {

					// Change velocity of both particles
					if (elastic) {
						p.elasticCollision(q);
						p.capSpeed();
						q.capSpeed();
					}

					else {

						p.inelasticCollision(q);
						p.capSpeed();

						// Remove the particle from the array.
						particles.splice(j, 1);
					}
				}
			}
		}
	}

	// Draw all particles
	for (var i = 0; i < particles.length; i++) {

		var p = particles[i];

		p.draw(ctx);
	}

	if (drawing) { drawLine(); }

	debugOutput.innerHTML = debugLog;
}



//============================================
//============   Particle Class   ============
//============================================

function particle(x, y, vx, vy, ax, ay, mass, color) {

	this.position = new vector(x, y);
	this.velocity = new vector(vx, vy);
	this.acceleration = new vector(ax, ay);
	this.mass = mass;
	this.radius = calculateRadius(this);
	this.color = color;
	this.isBounding = false;
	this.isCollided = false;
}

particle.prototype.draw = function (ctx) {

	ctx.fillStyle = (!showCollisionColors ? this.color : (this.isCollided ? "red" : (this.isBounding ? "yellow" : "white")));
	ctx.beginPath();
	ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
	ctx.fill();

	if (showVelocityIndicators) {
		ctx.beginPath();
		ctx.moveTo(this.position.x, this.position.y);
		ctx.lineTo(this.position.x + (velocityIndicatorMag * this.velocity.x), this.position.y + (velocityIndicatorMag * this.velocity.y));
		ctx.strokeStyle = "lightblue";
		ctx.stroke();

		if (applyGravity) {

			ctx.beginPath();
			ctx.moveTo(this.position.x, this.position.y);
			ctx.lineTo(this.position.x + (accelerationIndicatorMag * this.acceleration.x), this.position.y + (accelerationIndicatorMag * this.acceleration.y));
			ctx.strokeStyle = "red";
			ctx.stroke();
		}
	}

	this.step();
}

particle.prototype.step = function () {

	if (edgeWrap) {

		// Wrap around the edges of the canvas.
		if(this.position.x < -25) { this.position.x = W + 25; }
		if(this.position.y < -25) { this.position.y = H + 25; }
		if(this.position.x > W + 25) { this.position.x = -25; }
		if(this.position.y > H + 25) { this.position.y = -25; }
	}

	else {

		// Bounce off the edges of the canvas.
		if (this.position.x - this.radius < 0) { this.position.x = 0 + this.radius; this.velocity.x *= -1; }
		if (this.position.x + this.radius > W) { this.position.x = W - this.radius; this.velocity.x *= -1; }
		if (this.position.y - this.radius < 0) { this.position.y = 0 + this.radius; this.velocity.y *= -1; }
		if (this.position.y + this.radius > H) { this.position.y = H - this.radius; this.velocity.y *= -1; }
	}

	this.velocity.x += this.acceleration.x;
	this.velocity.y += this.acceleration.y;

	this.position.x += this.velocity.x;
	this.position.y += this.velocity.y;
}

particle.prototype.capSpeed = function () {

	this.velocity.x = (this.velocity.x > 0 ? Math.min(this.velocity.x, maxSpeed) : Math.max(this.velocity.x, -maxSpeed));
	this.velocity.y = (this.velocity.y > 0 ? Math.min(this.velocity.y, maxSpeed) : Math.max(this.velocity.y, -maxSpeed));
	this.acceleration.x = (this.acceleration.x > 0 ? Math.min(this.acceleration.x, maxSpeed) : Math.max(this.acceleration.x, -maxSpeed));
	this.acceleration.y = (this.acceleration.y > 0 ? Math.min(this.acceleration.y, maxSpeed) : Math.max(this.acceleration.y, -maxSpeed));
}

particle.prototype.bounding = function (other) {

	if (this.position.x - this.radius <= other.position.x + other.radius
		&& this.position.x + this.radius >= other.position.x - other.radius
		&& this.position.y - this.radius <= other.position.y + other.radius
		&& this.position.y + this.radius >= other.position.y - other.radius) {

		this.isBounding = true;
		other.isBounding = true;

		return true;
	}

	else { return false; }
}

particle.prototype.colliding = function (other) {

	if (this.distanceTo(other) <= Math.pow(this.radius + other.radius, 2)) {

		this.isCollided = true;
		other.isCollided = true;

		return true;
	}

	else { return false; }
}

particle.prototype.distanceTo = function (other) {

	// var distance = Math.sqrt(((this.position.x - other.position.x) * (this.position.x - other.position.x)) + ((this.position.y - other.position.y) * (this.position.y - other.position.y)));
	var distance = ((this.position.x - other.position.x) * (this.position.x - other.position.x)) + ((this.position.y - other.position.y) * (this.position.y - other.position.y));

	if (distance < 0) { distance = distance * -1; }

	return distance;
}

particle.prototype.elasticCollision = function (other) {

	var collisionAngle = Math.atan2((this.position.y - other.position.y), (this.position.x - other.position.x));

	var magBall1 = this.velocity.magnitude();
	var magBall2 = other.velocity.magnitude();

	var angleBall1 = this.velocity.angle();
	var angleBall2 = other.velocity.angle();

	var xSpeedBall1 = magBall1 * Math.cos(angleBall1 - collisionAngle);
	var ySpeedBall1 = magBall1 * Math.sin(angleBall1 - collisionAngle);
	var xSpeedBall2 = magBall2 * Math.cos(angleBall2 - collisionAngle);
	var ySpeedBall2 = magBall2 * Math.sin(angleBall2 - collisionAngle);

	var finalxSpeedBall1 = ((this.mass - other.mass) * xSpeedBall1 + (other.mass + other.mass) * xSpeedBall2) / (this.mass + other.mass);
	var finalxSpeedBall2 = ((this.mass + this.mass) * xSpeedBall1 + (other.mass - this.mass) * xSpeedBall2) / (this.mass + other.mass);
	var finalySpeedBall1 = ySpeedBall1;
	var finalySpeedBall2 = ySpeedBall2;

	this.velocity.x = Math.cos(collisionAngle) * finalxSpeedBall1 + Math.cos(collisionAngle + Math.PI / 2) * finalySpeedBall1;
	this.velocity.y = Math.sin(collisionAngle) * finalxSpeedBall1 + Math.sin(collisionAngle + Math.PI / 2) * finalySpeedBall1;
	other.velocity.x = Math.cos(collisionAngle) * finalxSpeedBall2 + Math.cos(collisionAngle + Math.PI / 2) * finalySpeedBall2;
	other.velocity.y = Math.sin(collisionAngle) * finalxSpeedBall2 + Math.sin(collisionAngle + Math.PI / 2) * finalySpeedBall2;

	while (this.distanceTo(other) < Math.pow(this.radius + other.radius, 2)) {

		this.position.x += (other.mass / (this.mass + other.mass)) * Math.cos(collisionAngle);
		this.position.y += (other.mass / (this.mass + other.mass)) * Math.sin(collisionAngle);
		other.position.x -= (this.mass / (this.mass + other.mass)) * Math.cos(collisionAngle);
		other.position.y -= (this.mass / (this.mass + other.mass)) * Math.sin(collisionAngle);
	}
}

particle.prototype.inelasticCollision = function (other) {

	this.velocity.x = (this.mass * this.velocity.x + other.mass * other.velocity.x) / (this.mass + other.mass);
	this.velocity.y = (this.mass * this.velocity.y + other.mass * other.velocity.y) / (this.mass + other.mass);

	this.position.x = (this.mass * this.position.x + other.mass * other.position.x) / (this.mass + other.mass);
	this.position.y = (this.mass * this.position.y + other.mass * other.position.y) / (this.mass + other.mass);

	if (other.mass > this.mass) { this.color = other.color; }

	this.mass += other.mass;

	this.radius = calculateRadius(this);
}

particle.prototype.gravitationalForce = function (other) {

	// Apply gravity to each particle
	var collisionAngle = Math.atan2((this.position.y - other.position.y), (this.position.x - other.position.x));
	var distance = this.distanceTo(other);

	var xForce = gravConst * (this.mass * other.mass) / Math.max(distance * distance, .00001) * Math.cos(collisionAngle);
	var yForce = gravConst * (this.mass * other.mass) / Math.max(distance * distance, .00001) * Math.sin(collisionAngle);

	this.acceleration.x -= xForce / this.mass;
	this.acceleration.y -= yForce / this.mass;

	other.acceleration.x += xForce / other.mass;
	other.acceleration.y += yForce / other.mass;
}

//============================================
//=============   Vector Class   =============
//============================================

function vector(x, y) {

	this.x = x;
	this.y = y;
}

vector.prototype.dot_product = function (other) {

	return this.x * other.x + this.y * other.y;
}

vector.prototype.squared = function () {

	return this.dot_product(this);
}

vector.prototype.magnitude = function () {

	return Math.sqrt( this.squared() );
}

vector.prototype.angle = function () {

	return Math.atan2(this.y, this.x);
}