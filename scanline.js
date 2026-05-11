let myShader;
const palette = {
  bg: "#0a0a0a",
  red: "#e15147",
  green: "#4aad8b",
  yellow: "#f3b551",
};

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
  fill(palette.red);
  sphere(110, 48, 32);
  pop();

  push();
  translate(0, 0, 0);
  rotateY(frameCount * 0.013);
  rotateX(frameCount * 0.008);
  fill(palette.green);
  torus(80, 32);
  pop();

  push();
  translate(220, 0, 0);
  rotateY(frameCount * 0.01);
  fill(palette.yellow);
  box(160);
  pop();
}

function keyPressed() {
  const panel = document.getElementById("explanation");
  if (panel) panel.style.display = panel.style.display === "none" ? "" : "none";
}

function prepShader() {
  let baseColor = sharedVec4();
  let viewY = sharedFloat();
  let lit = sharedFloat();

  cameraInputs.begin();
  // View-space y is roughly screen-aligned for nearly-horizontal viewing,
  // so fract(viewY * k) gives roughly horizontal scanlines.
  viewY = cameraInputs.position.y;
  cameraInputs.end();

  pixelInputs.begin();
  baseColor = pixelInputs.color;
  // Quick Lambertian lighting from a camera-relative direction.
  const n = normalize(pixelInputs.normal);
  lit = max(n.x * 0.4 + n.y * -0.5 + n.z * 0.77, 0) * 0.7 + 0.3;
  pixelInputs.end();

  finalColor.begin();
  const line = step(0.5, fract(viewY * 0.5));   // alternating on/off rows
  const scan = 0.55 + 0.45 * line;               // dark rows at 0.55, light at 1.0
  // Slight green phosphor tint + desaturation toward green.
  finalColor.set([
    baseColor.r * lit * scan * 0.85,
    baseColor.g * lit * scan * 1.0,
    baseColor.b * lit * scan * 0.85,
    baseColor.a,
  ]);
  finalColor.end();
}
