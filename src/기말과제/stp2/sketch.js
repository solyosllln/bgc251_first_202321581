// stp1
let video;
let greyChars = ' .:-=+*#%@';

function setup() {
  createCanvas(800, 600);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();
  video.size(64, 48);
  console.log(video);
  video.loadPixels();
  console.log(video.pixels.length);
}

function draw() {
  background(0);
  video.loadPixels();
  for (let idx = 0; idx < video.pixels.length / 4; idx++) {
    let column = idx % video.width; // 열 인덱스
    let row = floor(idx / video.width); // 행 인덱스
    let r = video.pixels[idx * 4];
    let g = video.pixels[idx * 4 + 1];
    let b = video.pixels[idx * 4 + 2];
    let a = video.pixels[idx * 4 + 3];
    // fill(r, g, b, a);
    // noStroke();
    // square(15 * column, 15 * row, 15);
    let c = color(r, g, b, a);
    let brightnessValue = brightness(c);
    fill(255);
    noStroke();
    // circle(15 * column, 15 * row, (50 * brightnessValue) / 255);
    let charIndex = floor(
      map(brightnessValue, 0, 255, 0, greyChars.length - 1)
    );
    let char = greyChars.charAt(charIndex);
    let charSize = 20;
    textSize(charSize);
    textAlign(CENTER, CENTER);
    text(
      char,
      charSize * column + 0.5 * charSize,
      charSize * row + 0.5 * charSize
    );
  }
  fill('red');
  circle(mouseX, mouseY, 50);
}
