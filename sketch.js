let myOutlineShader;

function setup() {
  createCanvas(700, 700, WEBGL);
  
  myOutlineShader = buildMaterialShader(callback);
}

function draw() {
  background(30);
  rotateX(-PI / 8);
  rotateY(0.1 * TWO_PI * millis() / 1000);
  lights()
  push()
  shader(myOutlineShader);
  box(150)
  pop()
  box(150)
}

function callback() {
  worldInputs.begin();
  const p = worldInputs.position;
  const toCentre = p - [0, 0, 0];
  const offset = normalize(toCentre) * 100;
  const noiseScale = 0.01;
  const noiseAmp = 100;
  // worldInputs.position.x += noiseAmp* noise(p.x*noiseScale, p.y*noiseScale, p.z*noiseScale);

  worldInputs.position += offset;
  worldInputs.end();

  finalColor.begin();
  finalColor.set([1, 0, 0, 1])
  finalColor.end();


}