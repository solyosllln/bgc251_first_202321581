// module aliases
const Engine = Matter.Engine,
  Runner = Matter.Runner,
  Bodies = Matter.Bodies,
  Composite = Matter.Composite;

let engine;
let boxA;
let boxB;
let ground;
let runner;

function setup() {
  createCanvas(800, 600);
  background('black');

  // create an engine
  engine = Engine.create();

  // create two boxes and a ground
  boxA = Bodies.rectangle(width * 0.5, height * 0.5, 80, 80);
  boxB = Bodies.rectangle(width * 0.5 + 50, height * 0.5 - 100, 80, 80);
  ground = Bodies.rectangle(width * 0.5, height, width + 20, 60, {
    isStatic: true,
  });

  // add all of the bodies to the world
  Composite.add(engine.world, [boxA, boxB, ground]);

  // create runner
  runner = Runner.create();

  // run the engine
  Runner.run(runner, engine);
}

function drawMatterBody(body) {
  beginShape();
  for (let idx = 0; idx < body.vertices.length; idx++) {
    vertex(body.vertices[idx].x, body.vertices[idx].y);
  }
  endShape(CLOSE);
}

function draw() {
  background('black');
  console.log(boxA);

  // noFill();
  stroke('white');
  fill('red');
  drawMatterBody(boxA);
  fill('blue');
  drawMatterBody(boxB);
  fill('green');
  drawMatterBody(ground);
}
