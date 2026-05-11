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
  directionalLight(230, 230, 230, 0.5, 0.1, -0.5);
  directionalLight(color("skyblue"), createVector(0, 1, 0));
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
  torus(80, 32, 40, 40);
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
  // Object-space position is shared from vertex stage so the bump pattern
  // is anchored to the mesh — it rotates with the object.
  let pos = sharedVec3();
  objectInputs.begin();
  pos = objectInputs.position;
  objectInputs.end();

  pixelInputs.begin();
  const f = 8;   // frequency — higher = finer bumps
  const a = 0.2;  // amplitude — higher = rougher surface
  // Three independent noise samples for the three normal-component shifts.
  const dx = noise(pos.x * f + 7, pos.y * f, pos.z * f) - 0.5;
  const dy = noise(pos.x * f, pos.y * f + 13, pos.z * f) - 0.5;
  const dz = noise(pos.x * f, pos.y * f, pos.z * f + 19) - 0.5;
  pixelInputs.normal.x += dx * a;
  pixelInputs.normal.y += dy * a;
  pixelInputs.normal.z += dz * a;
  pixelInputs.normal = normalize(pixelInputs.normal);
  pixelInputs.end();
}
