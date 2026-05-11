//generated with claude code

let config = {
  rotationsPerSec: 0.04,
};
let planetShader;
let cloudShader;
let palette = {
  bgLight: "linen",
  bg: "#1a1a1a",
  red: "#e15147",
  green: "#4aad8b",
  yellow: "#92703a",
};
function setup() {
  createCanvas(700, 700, WEBGL);
  noStroke();
  planetShader = buildMaterialShader(prepPlanetShader);
  cloudShader = buildMaterialShader(prepCloudShader);
}

function draw() {
  background(palette.bg);
  orbitControl();

  push();
  translate(-130, 0, 0);
  drawPlanet({
    radius: 110,
    seaColor: "turquoise",
    landColor: "green",
    cloudColor: "white",
    nSeed: 321
  });
  pop();

  push();
  translate(130, 0, 0);
  drawPlanet({
    radius: 90,
    seaColor: "orange",
    landColor: "brown",
    cloudColor: "pink",
    nSeed: 123
  });
  pop();
}

function drawPlanet({ radius, seaColor, landColor, cloudColor, nSeed }) {
  //TODO: pass in different noise seed
  push();
  ambientMaterial(seaColor);
  translate(0, 0, 0);
  rotateY((config.rotationsPerSec * TWO_PI * millis()) / 1000);
  fill(landColor);
  shader(planetShader);

  planetShader.setUniform("nSeed", nSeed)

  sphere(radius, 48, 64);
  shader(cloudShader);
  cloudShader.setUniform("nSeed", nSeed)
  sphere(radius * 1.05, 48, 64);
  pop();
}

function prepPlanetShader() {
  let baseColor = sharedVec4();
  let seaColor = sharedVec3();
  let factor = sharedFloat();
  let nSeed = uniformFloat("nSeed")
  let highLandColor = [1, 1, 1];

  let objPos = sharedVec3();
  objectInputs.begin();
  noiseDetail(5);
  objPos = objectInputs.position;
  let ampTerra = 0.2;
  let noiseScaleTerra = 0.9;
  let noiseValTerra = noise(nSeed + objPos * noiseScaleTerra);
  let landHeight = ampTerra * (noiseValTerra - 0.5);
  landHeight = max(landHeight, 0);
  objectInputs.normal;
  objectInputs.position += objectInputs.normal * 1 * landHeight;
  objectInputs.end();

  //just to get base (fill) and sea (ambient material) colours from obj.
  pixelInputs.begin();
  baseColor = pixelInputs.color;
  seaColor = pixelInputs.ambientMaterial;
  pixelInputs.end();

  const isSea = step(landHeight, 0);
  const t = clamp(landHeight * 20, 0, 1);
  const land = mix(baseColor.rgb, highLandColor, t);
  const terrainColor = mix(land, seaColor, isSea);

  finalColor.begin();
  finalColor.set([terrainColor, baseColor.a]);
  finalColor.end();
}

function prepCloudShader() {
  let baseColor = sharedVec4();
  let shadowColor = sharedVec3();
  let nSeed = uniformFloat("nSeed")
  let factor = sharedFloat();

  //question: do we want to change the cloud heights to fit to our ridiculous terrain heights?
  //calc terrain height again (but we are scaled)
  let objPos = sharedVec3();
  objectInputs.begin();
  noiseDetail(5);
  objPos = objectInputs.position;
  let ampTerra = 0.2;
  let noiseScaleTerra = 0.9;
  let noiseValTerra = noise(nSeed + objPos * noiseScaleTerra);
  let landHeight = ampTerra * (noiseValTerra - 0.5);
  landHeight = max(landHeight, 0);
  objectInputs.normal;
  objectInputs.position += objectInputs.normal * 1 * landHeight;

  let amp = 3;
  noiseDetail(5);
  let noiseScale = 1.2;
  let nVal = amp * (noise(nSeed + objPos * noiseScale) - 0.5);
  objectInputs.end();

  finalColor.begin();
  let c = vec3(1);
  let alph = nVal;
  finalColor.set([c.r, c.g, c.b, nVal]);
  finalColor.end();
}

function keyPressed() {
  const panel = document.getElementById("explanation");
  if (panel)
    panel.style.display = panel.style.display === "none" ? "" : "none";
}
