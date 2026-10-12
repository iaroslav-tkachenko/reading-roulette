// Offline SVG artwork render, not a browser screenshot or interaction test.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const toolingDir = process.argv[2];
if (!toolingDir) throw new Error('Pass an isolated tooling directory containing @resvg/resvg-js. Project dependencies are not changed.');
const require = createRequire(path.resolve(toolingDir, 'package.json'));
const { Resvg } = require('@resvg/resvg-js');
const source = fs.readFileSync(path.join(dir, 'scene.svg'), 'utf8');
const embedded = source.replace(/href="(assets\/[^" ]+\.png)"/g, (_, file) => `href="data:image/png;base64,${fs.readFileSync(path.join(dir, file)).toString('base64')}"`);
const render = new Resvg(embedded, { font: { loadSystemFonts: true, fontFiles: [path.join(dir,'assets/EBGaramond-Bold.ttf')], defaultFontFamily: 'Georgia' } });
const result = render.render();
fs.writeFileSync(path.join(dir, 'assembly-render.png'), result.asPng());
console.log(JSON.stringify({method:'Offline resvg SVG render; not browser QA',width:result.width,height:result.height,file:'assembly-render.png'}));
