//generated with claude code

let toonShader;
let palette = {
  bg: "#1a1a1a",
  red: "#e15147",
  green: "#4aad8b",
  yellow: "#f3b551",
  shadowColor: "#30022d"
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

function drawRotatingShapes() {
  ambientMaterial(palette.shadowColor);
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

//toon shader. how it works:
// Accesses and stores from pixelInputs: 
// * .color - from fill(). For our purposes, the base colour.
// * .ambientMaterial. For our purposes, the shadow colour.
// finds N: view-space normal.
// computes a view-space dot(N,L) against a hard-coded light direction, L
// giving us intensity.
// quantizes intensity into 3 mix-weights: 0 (shadow), 0.5 (midtone), 1 (lit)
// finalColor = mix(shadowColor, baseColor, weight)
// note: if ambientMaterial isn't set, it defaults to the fill colour,
// so without calling ambientMaterial() the result is flat.
function prepToonShader() {
  let baseColor = sharedVec4();
  let shadowColor = sharedVec3();
  let factor = sharedFloat();

  pixelInputs.begin();
  baseColor = pixelInputs.color;
  shadowColor = pixelInputs.ambientMaterial;

  const n = normalize(pixelInputs.normal);
  const ndotl = max(n.x * 0.42 + n.y * -0.53 + n.z * 0.74, 0);

  const b1 = step(0.25, ndotl);
  const b2 = step(0.65, ndotl);
  factor = 0.5 * b1 + 0.5 * b2;
  pixelInputs.end();

  finalColor.begin();
  const inv = 1 - factor;
  finalColor.set([
    shadowColor.x * inv + baseColor.x * factor,
    shadowColor.y * inv + baseColor.y * factor,
    shadowColor.z * inv + baseColor.z * factor,
    baseColor.w,
  ]);
  finalColor.end();
}
