// 4-band toon shader with per-object highlight size driven by shininess().
// Bands:
// * shadow  — from ambientMaterial()
// * mid     — half-mix between shadow and base
// * lit     — from fill()
// * highlight — from specularMaterial(), narrowed by pow(N·L, shininess)

let toonShader;
let palette = {
  bg: "#1a1a1a",
  red: "#e15147",
  green: "#4aad8b",
  yellow: "#f3b551",
  shadowColor: "#30022d",
  highlight: "#ffffff",
};

function setup() {
  createCanvas(700, 700, WEBGL);
  noStroke();
  toonShader = buildMaterialShader(prepToonShader);
}

function draw() {
  background(palette.bg);
  orbitControl();

  shader(toonShader);

  drawRotatingShapes();
}

function keyPressed() {
  const panel = document.getElementById("explanation");
  if (panel) panel.style.display = panel.style.display === "none" ? "" : "none";
}

function drawRotatingShapes() {
  ambientMaterial(palette.shadowColor);
  specularMaterial(palette.highlight);

  // Sphere shininess driven by mouseY: 1 (broad highlight) on the left
  // edge to 150 (pinprick) on the right edge.
  push();
  translate(-220, 0, 0);
  rotateY(frameCount * 0.01);
  shininess(map(mouseY, 0, height, 1, 150, true));
  fill(palette.red);
  sphere(110, 48, 32);
  pop();

  // Medium shininess = moderate highlight patch.
  push();
  translate(0, 0, 0);
  rotateY(frameCount * 0.013);
  rotateX(frameCount * 0.008);
  shininess(15);
  fill(palette.green);
  torus(80, 32);
  pop();
  
  // Low shininess = broad, soft highlight that covers most of the lit band.
  push();
  translate(220, 0, 0);
  rotateY(frameCount * 0.013);
  rotateX(frameCount * 0.008);
  // rotateZ(frameCount * 0.012);
  shininess(3);
  fill(palette.yellow);
  torus(80, 32);
  // cone(90, 180, 48);
  pop();
}

function prepToonShader() {
  let baseColor = sharedVec4();
  let shadowColor = sharedVec3();
  let specColor = sharedVec3();
  let shininessVal = sharedFloat();
  let factorDiff = sharedFloat();
  let factorSpec = sharedFloat();

  pixelInputs.begin();
  baseColor = pixelInputs.color;
  shadowColor = pixelInputs.ambientMaterial;
  specColor = pixelInputs.specularMaterial;
  shininessVal = pixelInputs.shininess;

  const n = normalize(pixelInputs.normal);
  const ndotl = max(n.x * 0.42 + n.y * -0.53 + n.z * 0.74, 0);

  // Diffuse bands fixed: shadow / mid / lit.
  const b1 = step(0.25, ndotl);
  const b2 = step(0.6, ndotl);
  factorDiff = 0.5 * b1 + 0.5 * b2;

  // Specular band narrowed by shininess. With shininess=1 this is
  // step(0.5, ndotl); higher values shrink the highlight toward a point.
  const ndotlPow = pow(ndotl, shininessVal);
  factorSpec = step(0.5, ndotlPow);
  pixelInputs.end();

  finalColor.begin();
  const invD = 1 - factorDiff;
  const dr = shadowColor.x * invD + baseColor.x * factorDiff;
  const dg = shadowColor.y * invD + baseColor.y * factorDiff;
  const db = shadowColor.z * invD + baseColor.z * factorDiff;
  const invS = 1 - factorSpec;
  finalColor.set([
    dr * invS + specColor.x * factorSpec,
    dg * invS + specColor.y * factorSpec,
    db * invS + specColor.z * factorSpec,
    baseColor.w,
  ]);
  finalColor.end();
}
