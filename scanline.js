let myShader;
const palette = {
  bg: "#0a0a0a",
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
  let baseColor = sharedVec4();
  let viewY = sharedFloat();
  // diffuseIntensity is Lambertian shading 0..1 from a camera-relative light.
  let diffuseIntensity = sharedFloat();

  cameraInputs.begin();
  // View-space y is roughly screen-aligned for nearly-horizontal viewing,
  // so fract(viewY * k) gives roughly horizontal scanlines.
  viewY = cameraInputs.position.y;
  cameraInputs.end();

  pixelInputs.begin();
  baseColor = pixelInputs.color;
  const n = normalize(pixelInputs.normal);
  diffuseIntensity = max(n.x * 0.4 + n.y * -0.5 + n.z * 0.77, 0) * 0.7 + 0.3;
  pixelInputs.end();

  finalColor.begin();
  // rowMask is 0 on dark scanline rows, 1 on light rows.
  const rowMask = step(0.5, fract(viewY * 0.5));
  // scanlineTint is the brightness multiplier from scanlines: 0.55 dark, 1.0 light.
  const scanlineTint = 0.55 + 0.45 * rowMask;
  // phosphor desaturates the result toward green — classic CRT look.
  const phosphor = vec3(0.85, 1.0, 0.85);
  const c = baseColor.rgb * diffuseIntensity * scanlineTint * phosphor;
  finalColor.set([c.r, c.g, c.b, baseColor.a]);
  finalColor.end();
}
