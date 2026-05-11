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
  rotateZ(frameCount * 0.012);
  fill(palette.yellow);
  cone(90, 180, 48);
  pop();
}

function keyPressed() {
  const panel = document.getElementById("explanation");
  if (panel) panel.style.display = panel.style.display === "none" ? "" : "none";
}

function prepShader() {
  let baseColor = sharedVec4();
  let intensity = sharedFloat();

  pixelInputs.begin();
  baseColor = pixelInputs.color;
  const n = normalize(pixelInputs.normal);
  const ndotl = n.x * 0.42 + n.y * -0.53 + n.z * 0.74;
  // Half-Lambert: map [-1,1] → [0,1] so back side still gets some light,
  // then square it to restore falloff contrast.
  intensity = pow(ndotl * 0.5 + 0.5, 2);
  pixelInputs.end();

  finalColor.begin();
  const c = baseColor.rgb * intensity;
  finalColor.set([c.r, c.g, c.b, baseColor.a]);
  finalColor.end();
}
