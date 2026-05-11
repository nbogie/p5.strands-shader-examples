let jellyShader;
let buildings;

  // "name": "tsu_arcade",

const palette = [
  "#d1af84",
  "#cec8b8",
  "#f3b551",
  "#4aad8b",
  "#e15147",
  "#544e47",
  ];

// const palette = ["#596f7e", "#eae6c7", "#f4cb4c"];
// const palette = ["#64908a", "#e8caa4", "#cc2a41"];

const outlineColors = [
    // [1, 1, 1, 1], // white
    [0x40 / 255, 0x40 / 255, 0x40 / 255, 1], // #404040
];

function setup() {
    createCanvas(700, 700, WEBGL);
    noStroke();

    jellyShader = buildMaterialShader(outline);

    buildings = createBuildings();
}

function draw() {
    background("#0a0518");
    rotateX(-PI / 8);
    orbitControl();


    lights();
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
const SIZE_TIERS = {
    // Big has wide overlapping ranges so it's not always taller than wide.
    big:    { w: [140, 240], h: [140, 380], d: [120, 220] },
    medium: { w: [70, 110],  h: [120, 200], d: [70, 110] },
    small:  { w: [25, 45],   h: [40, 90],   d: [25, 45] },
};

function createRandomBuilding() {
    const pos = randomPos();
    const parts = [];

    // 1 big anchor at the building's origin.
    const big = createRandomBuildingPart("big");
    parts.push(big);

    // 2 medium parts, scattered across the big's footprint.
    for (let i = 0; i < 2; i++) {
        const medium = createRandomBuildingPart("medium", big);
        parts.push(medium);

        // 2 or 3 small parts clustered on top of each medium.
        const k = floor(random(2, 4));
        for (let j = 0; j < k; j++) {
            parts.push(createRandomBuildingPart("small", medium));
        }
    }

    return createBuilding(pos, parts, random(outlineColors));
}

function createRandomBuildingPart(tier, anchor) {
    const r = SIZE_TIERS[tier];
    // Snap to 10 for legible stepped sizes, then add sub-pixel jitter to
    // break coplanar faces and avoid z-fighting between parts.
    const dims = {
        w: snap(random(r.w[0], r.w[1]), 10) + random(-0.3, 0.3),
        h: snap(random(r.h[0], r.h[1]), 10) + random(-0.3, 0.3),
        d: snap(random(r.d[0], r.d[1]), 10) + random(-0.3, 0.3),
    };

    let pos;
    if (!anchor) {
        pos = createVector(0, 0, 0);
    } else {
        // Mediums spread further out (0.7) so the silhouette breaks up
        // and stops looking like a fridge. Smalls stay tighter on top.
        const spread = tier === "medium" ? 0.7 : 0.5;
        const yBias = tier === "small" ? -anchor.dims.h / 2 : 0;
        const offset = createVector(
            random(-anchor.dims.w * spread, anchor.dims.w * spread),
            yBias + random(-anchor.dims.h / 4, anchor.dims.h / 4),
            random(-anchor.dims.d * spread, anchor.dims.d * spread),
        );
        const grid = tier === "small" ? 10 : 20;
        pos = snapVec(p5.Vector.add(anchor.pos, offset), grid);
    }

    return { pos, dims, color: pickBiased2(palette) };
}

function createBuilding(pos, parts, outlineColor) {
    const b = {
        pos,
        targetPos: pos.copy(),
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

function pickBiased3(arr, biasNum = 2) {
  // Generalization of pickBiased2: product of `biasNum` uniforms.
  // biasNum=1 is uniform; higher integers push more weight onto arr[0].
  let r = 1;
  for (let i = 0; i < biasNum; i++) r *= random();
  return arr[floor(r * arr.length)];
}

function pickBiased4(arr, biasNum = 2) {
  // Continuous-bias variant: pow(random(), biasNum). biasNum can be any
  // positive real (try 1.5 or 0.5). Different distribution shape than
  // pickBiased3 — sharper spike at 0 for the same biasNum.
  return arr[floor(pow(random(), biasNum) * arr.length)];
}

function snap(val, inc) {
    return round(val / inc) * inc;
}

function snapVec(v, inc) {
    return createVector(snap(v.x, inc), snap(v.y, inc), snap(v.z, inc));
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
    shader(jellyShader);
    jellyShader.setUniform("outlineColor", b.outlineColor);
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
    for (const p of b.parts) {
        push();
        fill(p.color);
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
    // Passing oc directly to .set() emits a hook body with no return —
    // unpacking into an array forces strands to construct a new vec4
    // and emit `return vec4(...)`, which compiles cleanly.
    finalColor.set([oc.x, oc.y, oc.z, oc.w]);
    // finalColor.set(oc);


    finalColor.end();
}
