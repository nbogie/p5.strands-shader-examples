let myShader;
const palette = {
  bg: "#1a1a1a",
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
  ambientLight(40);
  directionalLight(230, 230, 230, 0.5, 0.5, -0.5);
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
  torus(80, 32, 64);
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
  let pos = sharedVec3();
  objectInputs.begin();
  pos = objectInputs.position;
  objectInputs.end();

  pixelInputs.begin();
  const f = 30;  // pattern frequency
  const a = 0.3; // pattern depth
  // Two orthogonal sine waves create a crosshatched ripple texture.
  pixelInputs.normal.x += sin(pos.y * f) * a;
  pixelInputs.normal.z += cos(pos.x * f) * a;
  pixelInputs.normal = normalize(pixelInputs.normal);
  pixelInputs.end();
}
