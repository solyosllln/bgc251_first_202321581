let video;
let faceModel;
let faceBox = null;
let detecting = false;

let umbrellas = [];
let particles = [];
let lastUmbrellaTime = 0;
let gameOver = true;
let gameStarted = false;
let startTime = 0;
let score = 0;

let umbrellaImg;
let hitSound;

function preload() {
  umbrellaImg = loadImage('umbrella.png');
  hitSound = loadSound('띠링.mp3');
}

async function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  faceModel = await blazeface.load();
  console.log('✅ Face model loaded');

  setupButtons();
  setInterval(detectFace, 150);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function setupButtons() {
  document.getElementById('startBtn').onclick = () => {
    fullscreen(true); // 전체화면으로 전환
    startGame();
    document.getElementById('restartBtn').disabled = false;
    document.getElementById('saveBtn').disabled = false;
  };
  document.getElementById('restartBtn').onclick = startGame;
  document.getElementById('saveBtn').onclick = () => {
    saveCanvas(`score-${score}`, 'png');
  };
}

function startGame() {
  gameStarted = true;
  gameOver = false;
  score = 0;
  umbrellas = [];
  particles = [];
  faceBox = null;
  startTime = millis();
  loop();
}

function draw() {
  if (gameOver) {
    background(0);
    image(video, 0, 0, width, height);
    fill(0, 180);
    rect(0, 0, width, height);

    fill('white');
    textAlign(CENTER, CENTER);
    textSize(60);
    text('💀 Game Over!', width / 2, height / 2 - 40);
    textSize(30);
    text(`최종 점수: ${score}`, width / 2, height / 2 + 10);
    textSize(20);
    text('🔁 Restart 버튼을 누르세요', width / 2, height / 2 + 50);

    for (let i = particles.length - 1; i >= 0; i--) {
      let p = particles[i];
      p.update();
      p.display();
      if (p.isDead()) particles.splice(i, 1);
    }

    noLoop();
    return;
  }

  background(230);
  image(video, 0, 0, width, height);

  if (!gameStarted) {
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(30);
    text('얼굴을 캠에 비추고 Start 버튼을 누르세요!', width / 2, height / 2);
    return;
  }

  if (faceBox) {
    noFill();
    stroke('red');
    strokeWeight(2);
    rect(faceBox.x, faceBox.y, faceBox.w, faceBox.h);
  }

  score = floor((millis() - startTime) / 1000);
  fill(0);
  noStroke();
  textSize(24);
  text(`Score: ${score}`, width - 150, 30);

  if (millis() - lastUmbrellaTime > 1000) {
    const size = random(60, 120);
    umbrellas.push({
      x: random(0, width),
      y: -30,
      speed: random(2, 4),
      size: size,
      angle: random(0, TWO_PI),
      rotateSpeed: random(-0.1, 0.1),
    });
    lastUmbrellaTime = millis();
  }

  for (let u of umbrellas) {
    u.y += u.speed;
    u.angle += u.rotateSpeed;

    push();
    translate(u.x, u.y);
    rotate(u.angle);
    imageMode(CENTER);
    image(umbrellaImg, 0, 0, u.size, u.size);
    pop();

    if (faceBox) {
      let fx = faceBox.x + faceBox.w / 2;
      let fy = faceBox.y + faceBox.h / 2;
      let distToFace = dist(u.x, u.y, fx, fy);
      if (distToFace < u.size / 2 + max(faceBox.w, faceBox.h) / 4) {
        if (!gameOver) {
          triggerCollisionEffect(fx, fy);
          if (hitSound && hitSound.isLoaded()) hitSound.play();
          gameOver = true;
          gameStarted = false;
          faceBox = null;
          umbrellas = [];
        }
        break;
      }
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.update();
    p.display();
    if (p.isDead()) particles.splice(i, 1);
  }
}

function triggerCollisionEffect(x, y) {
  for (let i = 0; i < 20; i++) {
    particles.push(new Particle(x, y));
  }
}

class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(1, 5));
    this.alpha = 255;
    this.size = random(5, 10);
    this.color = color(random(255), random(255), random(255));
  }
  update() {
    this.pos.add(this.vel);
    this.vel.mult(0.95);
    this.alpha -= 5;
  }
  display() {
    noStroke();
    fill(
      this.color.levels[0],
      this.color.levels[1],
      this.color.levels[2],
      this.alpha
    );
    ellipse(this.pos.x, this.pos.y, this.size);
  }
  isDead() {
    return this.alpha <= 0;
  }
}

async function detectFace() {
  if (detecting || !faceModel || !video.elt || gameOver || !gameStarted) return;
  detecting = true;
  const predictions = await faceModel.estimateFaces(video.elt, false);
  if (predictions.length > 0) {
    const p = predictions[0].topLeft;
    const q = predictions[0].bottomRight;
    const x = map(p[0], 0, video.width, 0, width);
    const y = map(p[1], 0, video.height, 0, height);
    const x2 = map(q[0], 0, video.width, 0, width);
    const y2 = map(q[1], 0, video.height, 0, height);
    faceBox = { x, y, w: x2 - x, h: y2 - y };
  } else {
    faceBox = null;
  }
  detecting = false;
}
