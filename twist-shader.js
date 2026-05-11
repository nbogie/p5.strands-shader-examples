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

    push()
    shader(twistShader);
    
    push();
    translate(-150, 0, 200);
    fill("lime");
    sphere(75);
    pop();

    push();
    translate(50, 0, 0);
    translate(0, 100 * sin(frameCount / 100), 0);
    fill("magenta");
    sphere(75);
    pop();

    push();
    translate(300, -100, -300);
    rotateY(-frameCount / 45);
    fill("yellow");
    torus(75, 30);
    pop();

    push();
    translate(200, 100, 0);
    push();
    fill("cyan");
    rotateY(frameCount / 100);
    cylinder(75, 102, 24, 16);
    pop();
    fill("dodgerblue");
    translate(-400, 0, -500);
    box(200);
    pop();
    pop();
}

function prepTwistShader() {
    objectInputs.begin();
    // Rotate position.xz around the y axis by an angle proportional to y.
    // Capture x and z first so we don't read a partially-rewritten position.
    const x = objectInputs.position.x;
    const z = objectInputs.position.z;
    const angle = objectInputs.position.y * 0.02;
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
