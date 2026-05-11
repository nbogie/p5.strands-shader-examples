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
  // Sample noise on the 3D object-space position rather than the 2D UV.
  // texCoord-based sampling creates a visible seam on the sphere (where
  // u wraps from 1 back to 0) and stretches badly at the poles. A 3D
  // position is continuous everywhere, so no seams and no stretching;
  // and using objectInputs ties the pattern to the mesh so it rotates
  // with the object.
  let baseColor = sharedVec4();
  let pos = sharedVec3();

  objectInputs.begin();
  pos = objectInputs.position;
  objectInputs.end();

  pixelInputs.begin();
  baseColor = pixelInputs.color;
  pixelInputs.end();

  finalColor.begin();
  // Object-space coords are unit-sized for p5 primitives (~[-0.5, 0.5]),
  // so higher frequencies than the UV version to get equivalent detail.
  const wash = noise(pos.x * 6, pos.y * 6, pos.z * 6);
  const grain = noise(pos.x * 24 + 50, pos.y * 24, pos.z * 24);
  const tint = 0.4 + 0.5 * wash + 0.2 * grain;
  finalColor.set([
    baseColor.x * tint,
    baseColor.y * tint,
    baseColor.z * tint,
    baseColor.w,
  ]);
  finalColor.end();
}
