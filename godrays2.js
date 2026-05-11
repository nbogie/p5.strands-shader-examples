let godraysFilter;

const palette = {
  sky: "#1a2244",
  sun: "#ffe9a8",
  shape1: "#3a4878",
  shape2: "#5a3a44",
};

function setup() {
  createCanvas(700, 700, WEBGL);
  noStroke();
  godraysFilter = buildFilterShader(prepGodraysOverlayFilter);
}

function draw() {
  background(palette.sky);

  push();
  translate(0, -180, -400);
  fill(palette.sun);
  sphere(85, 40, 24);
  pop();

  fill(palette.shape1);
  push();
  translate(-150, 80, 100);
  rotateY(frameCount * 0.011);
  box(120, 280, 120);
  pop();

  fill(palette.shape2);
  push();
  translate(160, 30, 80);
  rotateY(frameCount * 0.013);
  rotateX(frameCount * 0.007);
  torus(85, 22, 30, 16);
  pop();

  filter(godraysFilter);
}

function keyPressed() {
  const panel = document.getElementById("explanation");
  if (panel) panel.style.display = panel.style.display === "none" ? "" : "none";
}

// Procedural sun-ray overlay — angular wedges from a fixed UV point.
//
// Pure screen-space pattern, no scene awareness:
// - For each pixel compute angle and distance from the sun's UV.
// - sin(angle * N) gives N alternating bright/dark bands radiating outward.
// - A noise(angle, t) term shifts the band phase slowly so the rays
//   appear to breathe / fan instead of being static stripes.
// - pow() sharpens the bands so most pixels are dark and only the band
//   centres stand out as crisp rays.
// - Fade with distance so the rays don't reach the corners.
// - Tint warm and ADD (not multiply) onto the base image.
//
// Compared with godrays 1: this is much cheaper — no multi-sample blur,
// no canvas re-sampling per ray — but it has no idea where the geometry
// is, so rays slice straight through foreground objects. Good as a
// stylised flourish, not as physical light scattering.
function prepGodraysOverlayFilter() {
  filterColor.begin();
  const uv = filterColor.texCoord;
  const t = millis() * 0.0002;
  const sunUV = vec2(0.5, 0.22);

  const dx = uv.x - sunUV.x;
  const dy = uv.y - sunUV.y;
  const angle = atan(dy, dx);
  const dist = sqrt(dx * dx + dy * dy);

  // Wobble the band phase slowly via noise of the angle and time.
  const wobble = (noise(angle * 2, t) - 0.5) * 4;
  // 14 alternating bands around the sun.
  const rays = sin(angle * 14 + wobble) * 0.5 + 0.5;
  // sharpen + radial falloff
  const intensity = pow(rays, 5) * max(1 - dist * 1.5, 0);

  const base = getTexture(filterColor.canvasContent, uv);
  const tint = vec3(1.0, 0.88, 0.6);
  const out = vec3(base.r, base.g, base.b) + tint * (intensity * 0.55);
  filterColor.set([out.r, out.g, out.b, 1]);
  filterColor.end();
}
