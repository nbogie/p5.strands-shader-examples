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
  sphere(110, 48, 32);
  pop();
}

function keyPressed() {
  const panel = document.getElementById("explanation");
  if (panel) panel.style.display = panel.style.display === "none" ? "" : "none";
}

function prepShader() {
  let baseColor = sharedVec4();
  let rim = sharedFloat();

  pixelInputs.begin();
  baseColor = pixelInputs.color;
  const n = normalize(pixelInputs.normal);
  // n.z near 1 = facing camera, near 0 = silhouette. Invert + power for crisp rim.
  rim = pow(max(1 - n.z, 0), 3);
  pixelInputs.end();

  finalColor.begin();
  finalColor.set([
    baseColor.r + rim,
    baseColor.g + rim,
    baseColor.b + rim,
    baseColor.a,
  ]);
  finalColor.end();
}
