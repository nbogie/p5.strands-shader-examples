//generated with claude code

let config = {
  rotationsPerSec: 0.04
}
let planetShader;
let cloudShader;
let palette = {
  bgLight: "linen",
  bg: "#1a1a1a",
  red: "#e15147",
  green: "#4aad8b",
  yellow: "#f3b551",
  // shadowColor: "#30022d"
  shadowColor: "#584156",
  seaColor: "#185cab"
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

  shader(planetShader);
  const planetSize = 110;
  ambientMaterial(palette.seaColor);
  push();
  translate(0, 0, 0);
  push()
  rotateY(config.rotationsPerSec * TWO_PI * millis() / 1000);
  fill(palette.green);
  sphere(planetSize, 48, 64);
  // fill(255,  101);
  shader(cloudShader)
  sphere(planetSize * 1.05, 48, 64);
  pop();


}


function prepPlanetShader() {
  let baseColor = sharedVec4();
  let shadowColor = sharedVec3();
  let factor = sharedFloat();

  let highLandColor = "#dbdbdb";
  let lowLandColor = "#368925";


  let objPos = sharedVec3();
  objectInputs.begin();
  noiseDetail(5)
  objPos = objectInputs.position;
  let ampTerra = 0.2;
  let noiseScaleTerra = 0.9;
  let noiseValTerra = noise(objPos * noiseScaleTerra)
  let landHeight = ampTerra * (noiseValTerra - 0.5);
  landHeight = max(landHeight, 0)
  objectInputs.normal
  objectInputs.position += objectInputs.normal * 1 * landHeight;
  objectInputs.end();
  


  pixelInputs.begin();
  baseColor = pixelInputs.color;
  shadowColor = pixelInputs.ambientMaterial;

  pixelInputs.end();

  finalColor.begin();
  const c = mix(shadowColor, baseColor.rgb,  landHeight*10)
  // const inv = 1 - factor;
  // const c = shadowColor * inv + baseColor.rgb * factor;
  finalColor.set([vec3(c), baseColor.a]);
  finalColor.end();
}



function prepCloudShader() {
  let baseColor = sharedVec4();
  let shadowColor = sharedVec3();
  let factor = sharedFloat();

  
//question: do we want to change the cloud heights to fit to our ridiculous terrain heights?
  //calc terrain height again (but we are scaled)
  let objPos = sharedVec3();
  objectInputs.begin();
  noiseDetail(5)
  objPos = objectInputs.position;
  let ampTerra = 0.2;
  let noiseScaleTerra = 0.9;
  let noiseValTerra = noise(objPos * noiseScaleTerra)
  let landHeight = ampTerra * (noiseValTerra - 0.5);
  landHeight = max(landHeight, 0)
  objectInputs.normal
  objectInputs.position += objectInputs.normal * 1 * landHeight;
  
  let amp = 3;
  noiseDetail(5)
  let noiseScale = 1.2;
  let nVal = amp * (noise(objPos * noiseScale) - 0.5);
  objectInputs.end();
  
  
  finalColor.begin();
  let c = vec3(1)
  let alph = nVal;
  finalColor.set([c.r, c.g, c.b, nVal]);
  finalColor.end();
}


function keyPressed() {
  const panel = document.getElementById("explanation");
  if (panel) panel.style.display = panel.style.display === "none" ? "" : "none";
}
