// 4-band toon shader. Bands map to:
// * shadow  — from ambientMaterial()
// * mid     — half-mix between shadow and base
// * lit     — from fill()
// * highlight — from specularMaterial(), drawn only at the brightest band

let toonShader;
let palette = {
  bg: "#1a1a1a",
  red: "#e15147",
  green: "#4aad8b",
  yellow: "#f3b551",
  shadowColor: "#30022d",
  highlight: "#ecd9d9",
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

function prepToonShader() {
  let baseColor = sharedVec4();
  let shadowColor = sharedVec3();
  let specColor = sharedVec3();
  let factorDiff = sharedFloat();
  let factorSpec = sharedFloat();

  pixelInputs.begin();
  baseColor = pixelInputs.color;
  shadowColor = pixelInputs.ambientMaterial;
  specColor = pixelInputs.specularMaterial;

  const n = normalize(pixelInputs.normal);
  const ndotl = max(n.x * 0.42 + n.y * -0.53 + n.z * 0.74, 0);

  // 3 thresholds → 4 bands: shadow, mid, lit, highlight.
  const b1 = step(0.25, ndotl);
  const b2 = step(0.6, ndotl);
  const b3 = step(0.88, ndotl);
  factorDiff = 0.5 * b1 + 0.5 * b2; // 0, 0.5, 1, 1
  factorSpec = b3;                  // 0, 0, 0, 1
  pixelInputs.end();

  finalColor.begin();
  // Two-step mix: shadow → base by factorDiff, then result → spec by factorSpec.
  const invD = 1 - factorDiff;
  const d = shadowColor * invD + baseColor.rgb * factorDiff;
  const invS = 1 - factorSpec;
  const c = d * invS + specColor * factorSpec;
  finalColor.set([c.r, c.g, c.b, baseColor.w]); 
  finalColor.end();
}
