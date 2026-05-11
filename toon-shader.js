let toonShader;

function setup() {
  createCanvas(700, 700, WEBGL);
  noStroke();
  toonShader = buildMaterialShader(toon);
}

function draw() {
  background("#1a1a1a");
  orbitControl();

  shader(toonShader);

  push();
  translate(-220, 0, 0);
  rotateY(frameCount * 0.01);
  fill("#e15147");
  sphere(110, 48, 32);
  pop();

  push();
  translate(0, 0, 0);
  rotateY(frameCount * 0.013);
  rotateX(frameCount * 0.008);
  fill("#4aad8b");
  torus(80, 32);
  pop();

  push();
  translate(220, 0, 0);
  rotateZ(frameCount * 0.012);
  fill("#f3b551");
  cone(90, 180, 48);
  pop();
}

function toon() {
  // sharedVec4 / sharedFloat carry values from pixelInputs into finalColor.
  let baseColor = sharedVec4();
  let intensity = sharedFloat();

  pixelInputs.begin();
  baseColor = pixelInputs.color;

  // View-space normal — normalize since interpolation across faces denormalizes it.
  const n = normalize(pixelInputs.normal);

  // Hardcoded view-space light direction (normalized) — upper-front-right.
  // p5 view space: camera at origin looking down -z, +y points down.
  // The light stays anchored to the camera, so orbiting rotates the shading bands.
  const ndotl = max(n.x * 0.42 + n.y * -0.53 + n.z * 0.74, 0);

  // 3-band toon quantization: 0.35 (shadow), 0.7 (midtone), 1.0 (light).
  const b1 = step(0.25, ndotl);
  const b2 = step(0.65, ndotl);
  intensity = 0.35 + 0.35 * b1 + 0.3 * b2;
  pixelInputs.end();

  finalColor.begin();
  // Unpack into an array so strands emits a fresh vec4 constructor and
  // returns it from the hook (passing a single node directly to .set()
  // misses the return — known strands codegen quirk).
  finalColor.set([
    baseColor.x * intensity,
    baseColor.y * intensity,
    baseColor.z * intensity,
    baseColor.w,
  ]);
  finalColor.end();
}
