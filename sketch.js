let outlineShader;
let buildings;

const palette = ["#596f7e", "#eae6c7", "#f4cb4c"];
// const palette = ["#64908a", "#e8caa4", "#cc2a41"];

const outlineColors = [
    // [1, 1, 1, 1], // white
    [0x40 / 255, 0x40 / 255, 0x40 / 255, 1], // #404040
];

function setup() {
    createCanvas(700, 700, WEBGL);
    noStroke();

    outlineShader = buildMaterialShader(outline);

    buildings = createBuildings();
}

function draw() {
    background("#e67300");
    // background("#64908a");
    rotateX(-PI / 8);
    lights();
    orbitControl();

    updateBuildings();
    drawBuildings();
}

function createBuildings() {
    let arr = [];
    for (let i = 0; i < 25; i++) {
        arr.push(createRandomBuilding());
    }
    return arr;
}
function randomPos() {
    const r = Math.cbrt(random());
    return p5.Vector.random3D().mult(r * 1000);
}
function createRandomBuilding() {
    const pos = randomPos();
    const n = floor(random(2, 5)); // 2..4 cubes
    const parts = [];
    for (let i = 0; i < n; i++) {
        parts.push(createRandomBuildingPart());
    }
    return createBuilding(pos, parts, pickBiased(palette), random(outlineColors));
}

function createRandomBuildingPart() {
    return {
        pos: snapVec(
            createVector(
                random(-40, 40),
                random(-120, 120),
                random(-40, 40),
            ),
            20,
        ),
        dims: {
            w: random(60, 100),
            h: random(120, 200),
            d: random(60, 100),
        },
    };
}

function createBuilding(pos, parts, color, outlineColor) {
    const b = {
        pos,
        targetPos: pos.copy(),
        color,
        outlineColor,
        rotation: 0,
        rotationSpeed: (random() < 0.5 ? -1 : 1) * random(0.003, 0.008),
        parts,
    };
    return b;
}

function pickBiased(arr) {
  // Half-Gaussian with sigma = arr.length / 2, clamped to last index.
  // Bias toward index 0; ~5% of picks fall on the clamped tail.
  const i = min(arr.length - 1, floor(abs(randomGaussian()) * arr.length / 2));
  return arr[i];
}

function pickBiased2(arr) {
  // Product of two uniforms — clusters near 0, monotonic decay.
  return arr[floor(random() * random() * arr.length)];
}

function snapVec(v, inc) {
    return createVector(
        round(v.x / inc) * inc,
        round(v.y / inc) * inc,
        round(v.z / inc) * inc,
    );
}

function pickTarget(b) {
    b.targetPos = randomPos();
}

function updateBuilding(b) {
    b.rotation += b.rotationSpeed;
    b.pos.lerp(b.targetPos, 0.01);
    if (p5.Vector.dist(b.pos, b.targetPos) < 1 && random() < 0.01) {
        pickTarget(b);
    }
}

function updateBuildings() {
    for (const b of buildings) updateBuilding(b);
}

function drawBuilding(b) {
    const gl = drawingContext;
    gl.enable(gl.CULL_FACE);

    push();
    translate(b.pos.x, b.pos.y, b.pos.z);
    rotateY(b.rotation);

    // Pass 1 — every cube in this building, drawn inflated, outline-only.
    // push/pop scopes the outline shader to this block.
    push();
    shader(outlineShader);
    outlineShader.setUniform("outlineColor", b.outlineColor);
    gl.cullFace(gl.BACK);
    for (const p of b.parts) {
        push();
        translate(p.pos.x, p.pos.y, p.pos.z);
        scale(1.1);
        box(p.dims.w, p.dims.h, p.dims.d);
        pop();
    }
    pop();

    // Pass 2 — every cube again, normal lit fill on top.
    // Fills cover any internal outlines between adjacent cubes, so the
    // outline only survives at the building's exterior silhouette.
    gl.cullFace(gl.FRONT);
    fill(b.color);
    for (const p of b.parts) {
        push();
        translate(p.pos.x, p.pos.y, p.pos.z);
        box(p.dims.w, p.dims.h, p.dims.d);
        pop();
    }

    pop();
    gl.disable(gl.CULL_FACE);
}

function drawBuildings() {
    for (const b of buildings) drawBuilding(b);
}

function outline() {
    const oc = uniformVec4("outlineColor");
    finalColor.begin();
    finalColor.set([0.2, 0.2, 0.2, 1]);

    finalColor.end();
}
