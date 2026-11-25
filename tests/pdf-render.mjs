import { chromium } from "playwright-core";
import path from "path"; import { fileURLToPath, pathToFileURL } from "url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const b = await chromium.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const p = await b.newPage();
await p.goto(pathToFileURL(path.join(HERE, "..", "pdf", "propuesta.html")).href);
await p.waitForLoadState("networkidle"); await p.evaluate(() => document.fonts.ready);
await p.pdf({ path: path.join(HERE, "..", "pdf", "Asesoria-Facil-Gestion-Portal-Demo.pdf"), format: "A4", printBackground: true, preferCSSPageSize: true });
await b.close(); console.log("pdf ok");
