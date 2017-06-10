/**********************
	Global Settings
**********************/
var particles = [];
var numParticles = 2500;
var radius = 10;
var prob = .4;
var popFrequency = 10;
var disco = false;
var r = 255; var g = 125; var b = 0;   // Orange
// var r = 255; var g = 255; var b = 255; // White
// var r = 0; var g = 100; var b = 255; // Blue

/*********************/

// Get HTML elements
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var W = 1500; var H = 600;
canvas.width = W;
canvas.height = H;

var running;

// Create a number of particles and distribute their locations
createParticles(numParticles);

// Run main every 1 ms
running = setInterval(main, 1);

var counter = 0;
var step = 1;

function main() {
	// Increment counter between 0 and popFrequency
	counter += step;
	counter %= popFrequency;

	// Empty canvas
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, W, H);

	// Redraw
	decayParticles();
	if (counter < step) { popParticles(); }
	drawParticles();
}


// Helper functions

// Particle class
function Particle(x, y) {
	this.x = x;
	this.y = y;
	this.r = r;
	this.g = g;
	this.b = b;
}

// Create particles and assign x,y position
function createParticles(numParticles) {
	rows = Math.sqrt(numParticles);
	for (var i = 0; i < numParticles; i++) {
		var x = W / (rows * i)
		particles.push(new Particle(((i % rows) * radius * 2) + radius, (Math.floor(i / rows) * radius * 2) + radius));
	}
}

// Draw each particle using the particle.draw prototype method
function drawParticles() {
	for (var i = 0; i < particles.length; i++) {
		particles[i].draw(ctx);
	}
}

// Make each particle 1 rgb value closer to black
function decayParticles() {
	for (var i = 0; i < particles.length; i++) {
		particles[i].r = Math.max(0, particles[i].r - 1);
		particles[i].g = Math.max(0, particles[i].g - 1);
		particles[i].b = Math.max(0, particles[i].b - 1);
	}
}

// Brighten particles randomly
function popParticles() {
	for (var i = 0; i < particles.length; i++) {
		if (prob > Math.random()) {
			if (disco) {
				particles[i].r = Math.floor(Math.random() * 255);
				particles[i].g = Math.floor(Math.random() * 255);
				particles[i].b = Math.floor(Math.random() * 255);
			} else {
				particles[i].r = r;
				particles[i].g = g;
				particles[i].b = b;
			}
		}
	}
}

// Draw prototype function,
Particle.prototype.draw = function (ctx) {
//  ctx.fillStyle = "rgb(" + this.r + ", " + this.g + ", " + this.b + ")";

	var grd = ctx.createRadialGradient(this.x + radius/2, this.y + radius/2, radius/2, this.x - radius/2, this.y - radius/2, radius * 2);
	ctx.fillStyle = grd;
	grd.addColorStop(0, "rgb(" + this.r + ", " + this.g + ", " + this.b + ")");
	grd.addColorStop(.75, "black");
	ctx.beginPath();
	ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI, false);
	ctx.fill();
}