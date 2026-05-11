import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..", "..");

const targetFile = process.argv[2] ?? "variant-demo.html";
const targetUrl = pathToFileURL(path.join(projectRoot, targetFile)).href;
const waitMs = Number(process.argv[3] ?? 1500);

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

const logs = [];
page.on("console", (msg) => {
  logs.push({ type: msg.type(), text: msg.text() });
});
page.on("pageerror", (err) => {
  logs.push({ type: "pageerror", text: err.message });
});

await page.goto(targetUrl);
await page.waitForTimeout(waitMs);

const screenshotPath = path.join(__dirname, "screenshot.png");
await page.screenshot({ path: screenshotPath, fullPage: false });

await browser.close();

for (const { type, text } of logs) {
  process.stdout.write(`--- [${type}]\n${text}\n\n`);
}
