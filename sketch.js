let outlineShader;

function setup() {
  createCanvas(700, 700, WEBGL);
  outlineShader = buildMaterialShader(outline);
}

function draw() {
  background("pink");

  rotateX(-PI / 8);
  rotateY(0.1 * TWO_PI * millis() / 1000);

  const gl = drawingContext;
  gl.enable(gl.CULL_FACE);

  // Pass 1 — outline: draw an inflated copy, but only its back-faces.
  // p5's projection flips the y-axis, which reverses triangle winding
  // in clip space, so we cull BACK here to remove the outside-facing
  // triangles. The inflated hull then contributes only where it sticks
  // out past the real silhouette.
  gl.cullFace(gl.BACK);
  push();
  shader(outlineShader);
  scale(1.1);
  box(150);
  pop();

  // Pass 2 — fill: regular lit render. Cull FRONT (which, thanks to the
  // y-flip, is the inside-facing triangles). Depth test hides the outline
  // everywhere the real mesh is closer.
  gl.cullFace(gl.FRONT);
  lights();
  fill('lime')

  box(150);

  gl.disable(gl.CULL_FACE);
}

function outline() {
  finalColor.begin();
  finalColor.set([0.2,0.2, 0.2,1]);
  finalColor.end();
}
