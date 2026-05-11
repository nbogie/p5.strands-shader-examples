# Shader ideas

20 strands shaders that should be small to implement and pedagogically clear. Roughly sorted from simplest hook (`finalColor`-only) to most involved (vertex displacement). #13 (Toon) is already implemented in `toon-shader.js`.

## Fragment-only filters (`finalColor` alone)

The smallest possible strands shaders — they just rewrite the pixel.

1. **Grayscale** — `gray = dot(color.rgb, vec3(0.299, 0.587, 0.114))`, set rgb to gray. Standard luminance weights.

2. **Sepia** — multiply rgb through a fixed warm 3×3 matrix; e.g. `r' = 0.39r + 0.77g + 0.19b`. Looks like an old photo.

3. **Invert** — `finalColor.set([1 - c.r, 1 - c.g, 1 - c.b, c.a])`. One-liner.

4. **Posterize** — `floor(c * n) / n` per channel with `n` around 4–8. Quantizes each color channel into stepped values.

5. **Channel swap** — reorder rgb components, e.g. `[c.g, c.b, c.r, c.a]`. Surreal but instant.

## UV patterns (`pixelInputs.texCoord` → `finalColor`)

Use UV coordinates to generate procedural patterns. The shared-variable trick from `nebula()` and `toon()` applies.

6. **Vertical gradient** — `mix(colorA, colorB, uv.y)`. The most basic possible UV use.

7. **Stripes** — `step(0.5, fract(uv.x * freq))` toggles between 0 and 1 across the surface.

8. **Checkerboard** — `mod(floor(uv.x * freq) + floor(uv.y * freq), 2)`.

9. **Polka dots** — `step(length(fract(uv * freq) - 0.5), radius)` for a dot-or-not pattern.

10. **Concentric rings** — `sin(length(uv - 0.5) * freq)`, optionally `step`-quantized for hard rings.

11. **Noise wash** — `noise(uv * freq)` used as a tint or as a `mix` factor between two colors. Layer two frequencies for a wispy marble look.

## Lighting riffs (`pixelInputs.normal` + `finalColor`)

Compute lighting from scratch — no `lights()` call needed.

12. **Normal viewer** — `finalColor.set([n.x*0.5+0.5, n.y*0.5+0.5, n.z*0.5+0.5, 1])`. Diagnostic, but always pretty. Useful as a starting point before designing any other normal-based shader.

13. **Toon** *(done — see `toon-shader.js`)* — quantize `dot(N, L)` to a few bands.

14. **Rim / Fresnel** — `pow(1 - max(dot(N, viewDir), 0), k)` is bright at the silhouette. Add it as an additive overlay on the base color for a stylized highlight. Note: `viewDir` in view-space is just `normalize(-position)`.

15. **Half-Lambert** — `pow(dot(N, L) * 0.5 + 0.5, 2)`. A fake diffuse that wraps to the dark side; gentler than pure Lambert, classic Valve trick.

16. **Hemisphere lighting** — `mix(groundColor, skyColor, n.y * 0.5 + 0.5)`. Cheap "global" lighting in one line, no light setup required.

## Vertex displacement (`cameraInputs`, `worldInputs`, or `objectInputs`)

Move vertices around for animation or geometric effects.

17. **Wave** — `position.y += A * sin(t + position.x * freq)` in `worldInputs`. Classic flag/ocean look.

18. **Breathe** — `position += normal * A * sin(t)` in `worldInputs`. Inflate-deflate cycle. Smooth-normal meshes only (same caveat as the constant-width outline in `variant-demo`).

19. **Twist** — in `objectInputs`, rotate `position.xz` around y by an angle proportional to `position.y`. Wring-out-a-towel look. Two lines of trig (rotation matrix in 2D).

20. **Jelly** — `position += noise(position * freq + t) * A`. Organic, wiggly motion. `noise()` is a strands built-in so this is essentially free.

---

**Tips that apply to most of these:**
- Time-dependent shaders (#17–20): declare `const t = uniformFloat(() => millis() * 0.001)` so JS supplies the clock.
- Anything using `pixelInputs.normal` should `normalize()` it first — interpolation across face vertices denormalizes.
- Anything pushing vertices along the normal will tear on `box()` because p5 boxes have per-face normals. Test on `sphere()` or `torus()` first.
- Passing a single uniform / strand node directly into `finalColor.set(node)` may emit broken GLSL (no return statement). Unpack into an array literal as a workaround: `finalColor.set([c.x, c.y, c.z, c.w])`.
