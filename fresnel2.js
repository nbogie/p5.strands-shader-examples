let myShader;
const palette = {
  bg: "#1a1a1a",
  red: "#7c2230",
  green: "#1f4f44",
  yellow: "#5a4a1c",
};


function setup() {
  createCanvas(700, 700, WEBGL);
  noStroke();
  myShader = buildMaterialShader(prepFresnelShader);
}

function draw() {
  background(palette.bg);
  background(palette.bg);

  shader(myShader);

  const separation =140
  push();
  translate(-separation, 0, 0);
  rotateY(frameCount * 0.01);
  fill(palette.red);
  sphere(110, 48, 32);
  pop();


  push();
  translate(separation, 0, 0);
  rotateY(frameCount * 0.012);
  rotateX(0.4);
  fill(palette.green);
  torus(80, 28, 60, 40);
  pop();

}

function keyPressed() {
  const panel = document.getElementById("explanation");
  if (panel)
    panel.style.display = panel.style.display === "none" ? "" : "none";
}

// Fresnel rim-light shader.
//
// What it does: brightens each pixel by an amount that depends on how
// edge-on the surface is to the camera. The result is a glow at the
// silhouettes — the look of a "rim light" or backlit object.
//
// How it works: in view space, a surface facing the camera has its
// normal pointing along +z (i.e. n.z ≈ 1). At the silhouette, the
// normal is perpendicular to the view, so n.z ≈ 0. Therefore:
//   rim = pow(max(1 - n.z, 0), power)
// is ~0 in the centre and ~1 at the edges; raising to a power
// sharpens the band. The rim value is then added to the base colour,
// scaled by intensityMult.
//
// Two parameters are driven by mouse position (mouseX / mouseY are
// auto-uniforms in strands — no setUniform plumbing needed):
//   - power: 1..11 across the canvas width. Higher = tighter rim.
//   - intensityMult: 0..3 across the canvas height. Higher = brighter.
function prepFresnelShader() {
  let baseColor = sharedVec4();
  // rimIntensity is ~0 on camera-facing surfaces, ~1 at the silhouette.
  let rimIntensity = sharedFloat();

  const power = 10 * (mouseX / width) + 1;
  const intensityMult = 3 * (mouseY / height)

  pixelInputs.begin();
  baseColor = pixelInputs.color;
  const n = normalize(pixelInputs.normal);
  rimIntensity = pow(max(1 - n.z, 0), power);
  pixelInputs.end();

  finalColor.begin();
  const c = baseColor.rgb + rimIntensity * intensityMult;
  finalColor.set([c.r, c.g, c.b, baseColor.a]);
  finalColor.end();
}

