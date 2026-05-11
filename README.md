# p5.strands-outline-shader

Experiments with shaders using p5.strands, mostly written with claude code.

## Claude

### Headless shader-source / screenshot harness

Strands compiles its JS-style shader functions into GLSL at runtime, which makes diagnostics painful — bugs show up as terse `'HOOK_getFinalColor' : Function does not return a value` errors with no easy way to see what was emitted. To shorten that loop, there's a Playwright harness that opens a sketch in headless Chromium, captures everything written to `console`, and saves a screenshot.

**Location:** `tools/dump-shaders/`

**Setup (already done — only needed if you re-clone):**
```sh
cd tools/dump-shaders
npm install
npx playwright install chromium
```

**Usage:**
```sh
cd tools/dump-shaders
node dump.mjs <html-file> [waitMs]
```

- `<html-file>` — path relative to the project root (default `variant-demo.html`)
- `waitMs` — milliseconds to wait after page load before capturing (default `1500`). Bump this if your sketch's `setup()` is slow or hits async work.

**Output:**
- All `console.log` / `console.error` / page errors are printed to stdout, prefixed with `--- [type]`
- A screenshot of the page is written to `tools/dump-shaders/screenshot.png`

**Examples:**
```sh
node dump.mjs variant-demo.html         # capture default sketch
node dump.mjs minimal-demo.html 3000    # wait longer for setup to complete
```

To inspect the GLSL strands generated for a hook, add the relevant log to your sketch's `setup()`:

```js
console.log(outlineShader.vertSrc());
console.log(outlineShader.fragSrc());
```

…then run the harness. The compiled vertex/fragment source comes back through the captured logs.

The screenshot is also useful for diagnosing rendering issues that aren't in the shader source itself — e.g. the inverted-hull outline failing on cubes is immediately obvious in a screenshot (disjointed flaps rather than a clean rim), which would be hard to pin down from logs alone.
