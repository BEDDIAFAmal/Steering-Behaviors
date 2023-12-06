
let leaderFollowingMode = "happy"; // Default is happy
let leader;
let separationSlider;
let target;
let obstacles = [];
let vehicles = [];

function setup() {
  createCanvas(800, 800);

  // Create a leader
  leader = new Vehicle(width / 2, height / 2);
  vehicles.push(leader);

  // Sliders for various parameters
  obstacleSizeSlider = createSlider(10, 100, 50);
  vehicleSpeedSlider = createSlider(1, 10, 6, 0.1);
  separationDistanceSlider = createSlider(10, 200, 60);

  // Position the sliders
  obstacleSizeSlider.position(810, 10);
  vehicleSpeedSlider.position(810, 70);
  separationDistanceSlider.position(810, 100);

  // Style the sliders
  obstacleSizeSlider.style('width', '80px');
  vehicleSpeedSlider.style('width', '80px');
  separationDistanceSlider.style('width', '80px');

  // Create an initial obstacle
  let obstacle = new Obstacle(width / 2, height / 2, 100);
  obstacles.push(obstacle);
}

function draw() {
  background(0, 150, 0, 100);

  // Draw leader glow

  // Set the target for the leader
  if (leaderFollowingMode === "happy") {
    leader.target = createVector(mouseX, mouseY); // Leader follows the mouse
  } else {
    leader.target = createVector(mouseX, mouseY); // All vehicles follow the same point
  }

  // Draw the target
  fill(255, 0, 0);
  noStroke();
  circle(leader.target.x, leader.target.y, 32);

  // Update values based on sliders
  let obstacleSize = obstacleSizeSlider.value();
  let vehicleSpeed = vehicleSpeedSlider.value();
  let separationDistance = separationDistanceSlider.value();

  // Update obstacle and vehicle properties
  for (let obstacle of obstacles) {
    obstacle.r = obstacleSize;
  }

 
  for (let vehicle of vehicles) {
    vehicle.maxSpeed = vehicleSpeed;
  }

  // Update separation distance for all vehicles
  for (let v of vehicles) {
    v.separationRadius = separationDistance;
  }

  // Draw the separation zone for the leader
  if (leaderFollowingMode === "samePointWithSeparationAndEvade") {
    let leaderAhead = leader.vel.copy();
    leaderAhead.setMag(40);
    leaderAhead.add(leader.pos);

    noFill();
    stroke(150);
    strokeWeight(2);
    ellipse(leaderAhead.x, leaderAhead.y, 80, 80);
  }

  // Draw the obstacles
  obstacles.forEach(o => {
    o.show();
  });

  // Handle spawning an obstacle when 'o' is pressed
  if (keyIsPressed && key === 'o') {
    let obstacle = new Obstacle(mouseX, mouseY, random(5, 60));
    obstacles.push(obstacle);
  }

 
  // Update and draw the vehicles
  for (let i = vehicles.length - 1; i >= 0; i--) {
    let targetPosition;
    if (leaderFollowingMode === "happy") {
      if (i === 0) {
        targetPosition = createVector(mouseX, mouseY); // First vehicle follows the mouse
      } else {
        targetPosition = vehicles[i - 1].pos.copy().sub(
          vehicles[i - 1].vel.copy().normalize().mult(30)
        );
      }
    } else {
      targetPosition = leader.target.copy(); // All vehicles follow the leader's target
    }

    if (i === 0) {
      vehicles[i].applyBehaviors(targetPosition, obstacles, vehicles);
    } else {
      let leaderAhead = leader.vel.copy();
      leaderAhead.setMag(40);
      leaderAhead.add(leader.pos);

      let evadePoint = findProjection(leaderAhead, leader.pos, targetPosition);

      if (leaderFollowingMode === "samePointWithSeparationAndEvade") {
        // Draw the evade zone for each following vehicle
        fill(150, 100);
        ellipse(leaderAhead.x, leaderAhead.y, 80, 80);
      }

      let distanceToEvadePoint = vehicles[i].pos.dist(evadePoint);
      if (distanceToEvadePoint < 40) {
        let evadeForce = vehicles[i].evade(leaderAhead);
        vehicles[i].applyForce(evadeForce);
      } else {
        vehicles[i].weightEvade = 0;
      }

      vehicles[i].applyBehaviors(targetPosition, obstacles, vehicles);
    }

    vehicles[i].update();
    vehicles[i].show();
    
  }
}



function keyPressed() {
  if (key == "v") {
    // Create a new vehicle on 'v' key press
    vehicles.push(new Vehicle(random(width), random(height)));
  } else if (key == "m") {
    // Toggle between leaderFollowingModes on 'm' key press
    if (leaderFollowingMode === "happy") {
      leaderFollowingMode = "samePointWithSeparationAndEvade";
    } else {
      leaderFollowingMode = "happy";
    }
    console.log("Leader Following Mode: " + leaderFollowingMode);
  }
  // Other key bindings...
}

function drawLeaderGlow() {
  let leaderGlowSize = 40;
  fill(255, 0, 0, 50); // Semi-transparent red color
  noStroke();
  ellipse(leader.pos.x, leader.pos.y, leaderGlowSize, leaderGlowSize);
}
