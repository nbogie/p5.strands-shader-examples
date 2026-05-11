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
  // skyAmount is 0 on surfaces facing the ground and 1 on surfaces
  // facing the sky — used as the mix weight between ground and sky.
  let skyAmount = sharedFloat();

  pixelInputs.begin();
  const n = normalize(pixelInputs.normal);
  // p5 view space: +y is down. -n.y therefore means "facing up".
  // Map from [-1, 1] to [0, 1].
  skyAmount = (0 - n.y) * 0.5 + 0.5;
  pixelInputs.end();

  finalColor.begin();
  const ground = vec3(GROUND[0], GROUND[1], GROUND[2]);
  const sky = vec3(SKY[0], SKY[1], SKY[2]);
  const c = mix(ground, sky, skyAmount);
  finalColor.set([c.r, c.g, c.b, 1]);
  finalColor.end();
}
