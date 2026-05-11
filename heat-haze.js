let toonShader;
let hazeFilter;

const palette = {
  sky: "#f4d8a4",        // hazy peach sky
  sand: "#d4a574",       // warm sand horizon
  shadowSand: "#7a4d24", // sand-shadow tone
  terracotta: "#c84a2d",
  ochre: "#d18a3b",
  olive: "#7a7838",
  shadowWarm: "#3a1a08",
};

function setup() {
  createCanvas(700, 700, WEBGL);
  noStroke();
  // A toon shader (3-band, fill + ambientMaterial — same shape as toon2)
  // gives the scene crisp silhouettes for the haze to wobble.
  toonShader = buildMaterialShader(prepToonShader);
  hazeFilter = buildFilterShader(prepHazeFilter);
}

function draw() {
  background(palette.sky);
  orbitControl();

  shader(toonShader);

  // Ground plane / horizon — laid flat far below the shapes.
  push();
  rotateX(PI / 2);
  translate(0, 0, 220);
  ambientMaterial(palette.shadowSand);
  fill(palette.sand);
  plane(4000, 2400);
  pop();

  ambientMaterial(palette.shadowWarm);

  push();
  translate(-220, -50, 0);
  rotateY(frameCount * 0.01);
  fill(palette.terracotta);
  sphere(110, 48, 32);
  pop();

  push();
  translate(0, -50, 0);
  rotateY(frameCount * 0.013);
  rotateX(frameCount * 0.008);
  fill(palette.olive);
  torus(80, 32);
  pop();

  push();
  translate(220, -80, 0);
  rotateY(frameCount * 0.01);
  fill(palette.ochre);
  cone(75, 220, 24);
  pop();

  // Apply the heat-haze distortion to the rendered frame.
  filter(hazeFilter);
}

function keyPressed() {
  const panel = document.getElementById("explanation");
  if (panel) panel.style.display = panel.style.display === "none" ? "" : "none";
}

// Toon shader — duplicated from toon2.js so this sketch is self-contained
// (we promised not to modify toon2 itself).
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
  const c = shadowColor * inv + baseColor.rgb * factor;
  finalColor.set([c.r, c.g, c.b, baseColor.a]);
  finalColor.end();
}

function prepHazeFilter() {
  filterColor.begin();
  const t = millis() * 0.001;
  const uv = filterColor.texCoord;

  // Heat strength: ramps up toward the bottom of the canvas. pow > 1
  // keeps the top half nearly undistorted and the bottom shimmering.
  const heatStrength = pow(uv.y, 1.5);

  // Two noise samples scroll upward over time (subtracting t from y).
  // High x-frequency gives narrow vertical ripple bands; lower y-frequency
  // makes the ripples elongate vertically, like rising heat columns.
  const dx = (noise(uv.x * 30, uv.y * 8 - t * 2) - 0.5) * 0.02 * heatStrength;
  const dy = (noise(uv.x * 30 + 50, uv.y * 8 - t * 2) - 0.5) * 0.006 * heatStrength;

  const sampleUV = vec2(uv.x + dx, uv.y + dy);
  const result = getTexture(filterColor.canvasContent, sampleUV);

  filterColor.set(result);
  filterColor.end();
}
