let myShader;
const palette = { bg: "#1a1a1a" };

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
  let n = sharedVec3();
  pixelInputs.begin();
  n = normalize(pixelInputs.normal);
  pixelInputs.end();

  finalColor.begin();
  // Map each normal component from [-1, 1] to [0, 1] for display.
  finalColor.set([n.x * 0.5 + 0.5, n.y * 0.5 + 0.5, n.z * 0.5 + 0.5, 1]);
  finalColor.end();
}
