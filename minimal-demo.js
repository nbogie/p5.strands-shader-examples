let outlineShader;

function setup() {
  createCanvas(700, 700, WEBGL);
  outlineShader = buildMaterialShader(outline);
}

function draw() {
  background("skyblue");
  strokeWeight(3);
  lights();
  push();
  rotateX(PI / 2);
  translate(0, 0, -200);
  ambientMaterial("#aaa");
  circle(0, 0, 5000);
  pop();
  orbitControl();
  drawOutlinedCube(createVector(-100, 0, 0));
  drawOutlinedCube(createVector(150, 50, 50));
}

function outline() {
  finalColor.begin();
  finalColor.set([0.2, 0.2, 0.2, 1]);
  finalColor.end();
}

function drawOutlinedCube(pos) {
  push();
  translate(pos);
  rotateX(-PI / 8);
  rotateY((0.1 * TWO_PI * millis()) / 1000);

  const gl = drawingContext;
  gl.enable(gl.CULL_FACE);

  //pass 1: inflated hull
  gl.cullFace(gl.BACK);
  push();
  shader(outlineShader);
  scale(1.1);
  box(150);
  pop();

  //pass 2 normal cube
  gl.cullFace(gl.FRONT);
  fill("lime");

  box(150);

  gl.disable(gl.CULL_FACE);
  pop();
}

/** More notes
 * This approach is called inflated hull, i think.
 *
 * On pass 1:
 * Pass 1 — outline: draw an inflated copy, but only its back-faces.
 * p5's projection flips the y-axis, which reverses triangle winding
 * in clip space, so we cull BACK here to remove the outside-facing
 * triangles. The inflated hull then contributes only where it sticks
 * out past the real silhouette.
  
 * Pass 2
 * fill: regular lit render. Cull FRONT (which, thanks to the
 * y-flip, is the inside-facing triangles). Depth test hides the outline
 * everywhere the real mesh is closer.
in graphics, a negative scale on any axis reverses triangle winding. p5 has y-down for consistency with 2D mode, and it implements that with a -y in the projection matrix — which has the side effect of inverting the meaning of FRONT/BACK relative to most graphics tutorials you'll find. If you ever see a sketch that needs face culling and the directions feel "backwards", that's why.
*/
