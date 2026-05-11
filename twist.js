let twistShader;

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    twistShader = buildMaterialShader(prepTwistShader);
}

function draw() {

    noStroke();
    background("skyblue");
    lights();

    drawGround();
    orbitControl();

    push();
    shader(twistShader);

    // High detailY is what makes the spiral readable — without
    // intermediate rings of vertices the shape just shears between top
    // and bottom instead of spiraling.

    // Hex prism — flat sides spiral up the y axis like a barber pole.
    push();
    translate(-250, -50, 0);
    fill("magenta");
    cylinder(70, 320, 6, 24);
    pop();

    // 4-sided pyramid — square cross-section gives clear corner spirals.
    push();
    translate(0, -50, 0);
    fill("yellow");
    cone(90, 320, 5, 24);
    pop();

    // 3-sided pyramid — different cross-section, same spiral effect.
    push();
    translate(250, -50, 0);
    fill("lime");
    box(100, 100, 100, 5, 5)
    pop();

    pop();
}

function prepTwistShader() {
    objectInputs.begin();
    // Rotate position.xz around the y axis by an angle proportional to y.
    // Capture x and z first so we don't read a partially-rewritten position.
    //
    // Note: p5's built-in primitives have unit-sized object-space coords
    // (y ∈ [-0.5, 0.5]) — the dimensions you pass to box()/cylinder()/etc.
    // are applied later via the model matrix. So the twist factor here is
    // in radians per unit-y, not per pixel-y; ~5 gives a dramatic spiral.
    const speed = 2;
    const t = speed * millis() / 1000;
    const x = objectInputs.position.x;
    const z = objectInputs.position.z;
    const angle = sin(t) * objectInputs.position.y * 5;
    const c = cos(angle);
    const s = sin(angle);
    objectInputs.position.x = x * c - z * s;
    objectInputs.position.z = x * s + z * c;
    objectInputs.end();
}

function drawGround() {
    push();
    rotateX(PI / 2);
    translate(0, 0, -200);
    ambientMaterial("#aaa");
    circle(0, 0, 5000);
    pop();
}
