let godraysFilter;

const palette = {
  sky: "#0a1224",        // dark sky so the sun reads bright
  sun: "#fff2cc",        // pale warm sun
  silhouette: "#080a14", // near-black occluders
};

function setup() {
  createCanvas(700, 700, WEBGL);
  noStroke();
  godraysFilter = buildFilterShader(prepGodraysFilter);
}

function draw() {
  background(palette.sky);

  // Sun: a bright disc drawn first, far back.
  push();
  translate(0, -180, -400);
  fill(palette.sun);
  sphere(85, 40, 24);
  pop();

  // Dark foreground silhouettes — drawn closer so they occlude the sun.
  fill(palette.silhouette);

  push();
  translate(-110, 60, 100);
  rotateY(frameCount * 0.012);
  box(120, 320, 120);
  pop();

  push();
  translate(150, 20, 80);
  rotateY(frameCount * 0.01);
  rotateX(frameCount * 0.006);
  torus(85, 22, 30, 16);
  pop();

  push();
  translate(-290, 170, 150);
  rotateY(frameCount * 0.009);
  sphere(90, 24, 18);
  pop();

  // Apply screen-space godrays.
  filter(godraysFilter);
}

function keyPressed() {
  const panel = document.getElementById("explanation");
  if (panel) panel.style.display = panel.style.display === "none" ? "" : "none";
}

// Crepuscular rays / "godrays" via radial accumulation in screen space.
//
// Classic post-process technique (popularised by Crytek / Kenny Mitchell):
// - Pick a light position in UV space (where the sun is on screen).
// - For each output pixel, step from itself TOWARD the light, sampling
//   the already-rendered canvas at each step.
// - Sum the samples with a decaying weight so closer-to-source samples
//   count more than distant ones.
// - Add that accumulated brightness back on top of the original pixel.
//
// Why this naturally gives crepuscular rays: the sum along a line toward
// the sun is HIGH where the line passes through the bright sun, and LOW
// where it's blocked by dark foreground geometry. So bright streaks
// emanate from the sun and naturally cut off behind silhouetted objects
// — exactly what you'd see looking at sunlight through trees or clouds.
//
// Knobs:
//   samples  — more = smoother + heavier
//   density  — how far each pixel reaches toward the light (0..1)
//   decay    — per-step fadeoff (1 = no decay, <1 = closer samples weight more)
//   weight   — per-sample contribution
//   exposure — how much accumulated light is added on top of the base
function prepGodraysFilter() {
  filterColor.begin();
  const uv = filterColor.texCoord;
  // Sun position in UV space, matched to where the bright source is drawn.
  const lightUV = vec2(0.5, 0.22);

  const samples = 32;
  const density = 0.9;
  const decay = 0.96;
  const weight = 0.45;
  const exposure = 0.22;

  // Step vector from this pixel toward the light, split into `samples` steps.
  const dx = (uv.x - lightUV.x) * (density / samples);
  const dy = (uv.y - lightUV.y) * (density / samples);

  let coord = uv;
  let illumDecay = 1;             // plain JS scalar — decays per iteration
  let accum = vec3(0, 0, 0);

  for (let i = 0; i < samples; i++) {
    coord = vec2(coord.x - dx, coord.y - dy);
    const s = getTexture(filterColor.canvasContent, coord);
    accum = accum + vec3(s.r, s.g, s.b) * (weight * illumDecay);
    illumDecay = illumDecay * decay;
  }

  const base = getTexture(filterColor.canvasContent, uv);
  const out = vec3(base.r, base.g, base.b) + accum * exposure;
  filterColor.set([out.r, out.g, out.b, 1]);
  filterColor.end();
}
