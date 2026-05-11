let myShader;
const palette = { bg: "#1a1a1a" };
const SKY = [0.55, 0.75, 1.0];      // cool blue from above
const GROUND = [0.35, 0.18, 0.08];   // warm brown from below

function setup() {
  createCanvas(700, 700, WEBGL);
  noStroke();
  myShader = buildMaterialShader(prepShader);
}

function draw() {
  background(palette.bg);
  orbitControl();
  shader(myShader);

  push();
  translate(-220, 0, 0);
  rotateY(frameCount * 0.01);
  sphere(110, 48, 32);
  pop();

  push();
  translate(0, 0, 0);
  rotateY(frameCount * 0.013);
  rotateX(frameCount * 0.008);
  torus(80, 32);
  pop();

  push();
  translate(220, 0, 0);
  rotateY(frameCount * 0.01);
  box(160);
  pop();
}

function keyPressed() {
  const panel = document.getElementById("explanation");
  if (panel) panel.style.display = panel.style.display === "none" ? "" : "none";
}

function prepShader() {
  let factor = sharedFloat();

  pixelInputs.begin();
  const n = normalize(pixelInputs.normal);
  // p5 view space: +y is down. -n.y therefore means "facing up".
  // Map from [-1, 1] to [0, 1] for use as a mix factor (0 = ground, 1 = sky).
  factor = (0 - n.y) * 0.5 + 0.5;
  pixelInputs.end();

  finalColor.begin();
  // Order matters: strand node first, scalar second. The transpiler
  // rewrites `node * x` as node.mult(x); the reverse fails on numbers.
  const inv = 1 - factor;
  finalColor.set([
    inv * GROUND[0] + factor * SKY[0],
    inv * GROUND[1] + factor * SKY[1],
    inv * GROUND[2] + factor * SKY[2],
    1,
  ]);
  finalColor.end();
}
