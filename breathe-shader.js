let myShader;
const palette = {
  bg: "#1a1a1a",
  red: "#e15147",
  green: "#4aad8b",
};

function setup() {
  createCanvas(700, 700, WEBGL);
  noStroke();
  myShader = buildMaterialShader(prepShader);
}

function draw() {
  background(palette.bg);
  orbitControl();
  lights();
  shader(myShader);

  push();
  translate(-180, 0, 0);
  rotateY(frameCount * 0.01);
  fill(palette.red);
  sphere(110, 48, 32);
  pop();

  push();
  translate(180, 0, 0);
  rotateY(frameCount * 0.013);
  rotateX(frameCount * 0.008);
  fill(palette.green);
  torus(80, 32);
  pop()
}

function keyPressed() {
  const panel = document.getElementById("explanation");
  if (panel) panel.style.display = panel.style.display === "none" ? "" : "none";
}

function prepShader() {
  worldInputs.begin();
  const t = millis() / 1000;
  const amp = 2005 * (1+sin(t * 2.5));
  worldInputs.position.x += worldInputs.normal.x * amp;
  worldInputs.position.y += worldInputs.normal.y * amp;
  worldInputs.position.z += worldInputs.normal.z * amp;
  worldInputs.end();
}
