let jellyShader;

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    jellyShader = buildMaterialShader(prepJellyShader);
}

function draw() {

    noStroke();
    background("skyblue");
    lights();

    drawGround();
    orbitControl();

    push()
    shader(jellyShader);
    
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

function prepJellyShader() {
    objectInputs.begin();
    const amp = 0.4;
    const noiseScale = 0.1;
    const speed = 0.15;

    const t = (speed * millis()) / 1000;
    objectInputs.position.x +=
        amp * centredNoise(objectInputs.position * noiseScale + t + 271);
    objectInputs.position.y +=
        amp * centredNoise(objectInputs.position * noiseScale + t + 1000);
    objectInputs.position.z +=
        amp * centredNoise(objectInputs.position * noiseScale + t + 777);

    objectInputs.end();

    function centredNoise(v) {
        return noise(v) - 0.5;
    }
}

function drawGround() {
    push();
    rotateX(PI / 2);
    translate(0, 0, -200);
    ambientMaterial("#aaa");
    circle(0, 0, 5000);
    pop();
}
