let myShader;
const palette = { bg: "#1a1a1a" };
const COLOURS = ["#e15147", "#f3b551", "#4aad8b", "#64908a", "#d1af84"];

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

  for (let i = -2; i <= 2; i++) {
    push();
    translate(i * 100, 0, 0);
    fill(COLOURS[i + 2]);
    sphere(40, 32, 24);
    pop();
  }
}

function keyPressed() {
  const panel = document.getElementById("explanation");
  if (panel) panel.style.display = panel.style.display === "none" ? "" : "none";
}

function prepShader() {
  worldInputs.begin();
  const t = millis() / 1000;
  // position.x and amplitude are in world units. Frequency 0.02 means
  // ~one wavelength per ~315 world units (2π / 0.02).
  worldInputs.position.y += 30 * sin(t * 2 + worldInputs.position.x * 0.02);
  worldInputs.end();
}
