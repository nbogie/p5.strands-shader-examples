let myShader;

const palette = {
  bg: "#1a1a1a",
  green: "#1f4f44",
};

function setup() {
  createCanvas(700, 700, WEBGL);
  noStroke();
  myShader = buildMaterialShader(prepFresnelShader);
}

function draw() {
  background(palette.bg);
  push();
  translate(0, 0, 0);
  rotateY(frameCount * 0.012);
  rotateX(0.4);
  shader(myShader);
  fill(palette.green);
  torus(80, 28, 60, 40);
  pop();
}

function keyPressed() {
  const panel = document.getElementById("explanation");
  if (panel)
    panel.style.display = panel.style.display === "none" ? "" : "none";
}

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
