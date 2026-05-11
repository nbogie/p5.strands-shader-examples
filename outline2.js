let outlineShader;

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    jellyShader = buildMaterialShader(prepJellyShader);
}

function draw() {
    const posns = [
        createVector(-150, 0, 200),
        createVector(150, 0, -1000),
        createVector(300, 0, -300),
    ];

    noStroke();
    background("skyblue");
    lights();

    drawGround();
    orbitControl();

    
    drawOutlinedShape(() => sphere(75), "lime", posns[0]);

    drawOutlinedShape(
        () => {
            translate(0, 100 * sin(frameCount / 100), 0);
            sphere(75);
        },
        "magenta",
        posns[1],
    );
    drawOutlinedShape(
        () => {
            rotateY(frameCount / 30);
            torus(75, 30);
        },
        "yellow",
        posns[2],
    );
}

function prepJellyShader() {
    cameraInputs.begin();
    // Component-wise writes — strands docs only show the per-component
    // pattern (worldInputs.position.y += ...), and the whole-vector form
    // appears to be a no-op. (0 - z) avoids unary minus on a strand node
    // which can be unreliable.
    const depth = (0 - cameraInputs.position.z) * 1;
    cameraInputs.position.x += cameraInputs.normal.x * depth;
    cameraInputs.position.y += cameraInputs.normal.y * depth;
    cameraInputs.position.z += cameraInputs.normal.z * depth;
    cameraInputs.end();

    finalColor.begin();
    finalColor.set([0.2, 0.2, 0.2, 1]);
    finalColor.end();
}
/**
 *
 * Draw given shape with constant-width outline
 * This works on smooth-normal meshes (sphere). It does NOT work on box()
 * because p5 boxes have per-face normals and the inflated faces
 * will separate into disjoint flaps instead of staying welded.
 * 
 * @param {Function} shapeFn - callback to draw your shape.  Will be called a couple of times during the process, but within push-pop confines.
 * @param {string} colour - colour of your shape
 * @param {*} pos - position of your shape
 */
function drawOutlinedShape(shapeFn, colour, pos) {
    push();
    translate(pos);

    const gl = drawingContext;
    gl.enable(gl.CULL_FACE);

    // pass 1: outline. the shader does the inflation in
    // **view** space, to give uniform outline size regardless of distance from camera.
    // We pass in the same geometry in both passes.
    //ONLY show back faces (p5 has this flipped (because +y is down?))
    gl.cullFace(gl.BACK);
    push();
    shader(jellyShader);
    shapeFn();
    pop();

    // pass 2: normal sphere
    //only show front faces
    gl.cullFace(gl.FRONT);
    ambientMaterial(colour);
    shapeFn();
    pop();
}

function drawGround() {
    push();
    rotateX(PI / 2);
    translate(0, 0, -200);
    ambientMaterial("#aaa");
    circle(0, 0, 5000);
    pop();
}

function keyPressed() {
  const panel = document.getElementById("explanation");
  if (panel) panel.style.display = panel.style.display === "none" ? "" : "none";
}
