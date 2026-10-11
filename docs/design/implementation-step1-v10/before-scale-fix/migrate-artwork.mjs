// One-time migration of the accepted v10 artwork into native React components.
// The reference and the original PNGs remain untouched.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const reference=path.join(root,'docs/design/layered-v09-2026-10-11');
const target=path.join(root,'src/components/scene');
const page=fs.readFileSync(path.join(reference,'index.html'),'utf8');
const manifest=JSON.parse(fs.readFileSync(path.join(reference,'layer-manifest.json'),'utf8'));
const files=[...new Set([manifest.background.asset,'paper-v1.png',...manifest.placements.map(p=>p.asset),...manifest.decorPlacements.map(p=>p.asset),...manifest.architecturePlacements.map(p=>p.asset)])];
for(const file of [...files,'EBGaramond-Bold.ttf','EBGaramond-OFL.txt']) {
  fs.copyFileSync(path.join(reference,'assets',file),path.join(root,'src/assets/reading-machine',file));
}
fs.writeFileSync(path.join(target,'artwork.ts'),files.map((file,i)=>`import asset${i} from '../../assets/reading-machine/${file}'`).join('\n')+'\n\nexport const artwork = {\n'+files.map((file,i)=>`  '${file}': asset${i},`).join('\n')+'\n} as const\n');

const attributes={class:'className','clip-path':'clipPath','stop-color':'stopColor','stop-opacity':'stopOpacity','stroke-width':'strokeWidth','stroke-linecap':'strokeLinecap','stroke-linejoin':'strokeLinejoin','text-anchor':'textAnchor'};
function jsx(markup) {
  return markup.replace(/<style>@font-face[\s\S]*?<\/style>/,'')
    .replace(/<style>([\s\S]*?)<\/style>/g,(_,css)=>`<style>{${JSON.stringify(css)}}</style>`)
    .replace(/\bstyle="([^"]*)"/g,(_,styles)=>{
      const obj=Object.fromEntries(styles.split(';').filter(Boolean).map(entry=>{
        const colon=entry.indexOf(':');
        return [entry.slice(0,colon).replace(/-([a-z])/g,(_,c)=>c.toUpperCase()),entry.slice(colon+1)];
      }));
      return 'style={'+JSON.stringify(obj)+'}';
    })
    .replace(/\b(class|clip-path|stop-color|stop-opacity|stroke-width|stroke-linecap|stroke-linejoin|text-anchor)=/g,(_,attr)=>attributes[attr]+'=')
    .replace(/href="assets\/([^" ]+\.png)"/g,(_,file)=>`href={artwork['${file}']}`)
    .replace(/></g,'>\n<');
}

const machine=fs.readFileSync(path.join(reference,'machine.svg'),'utf8').trim();
const room=page.match(/<div class="room-backdrop"[\s\S]*?<\/div><main/)[0].replace(/<main$/,'');
const sheet=page.match(/<section class="prompt-sheet"[\s\S]*?<\/section>/)[0]
  .replace(/<pre([^>]*)>[\s\S]*?<\/pre>/,'<pre$1>{prompt}</pre>')
  .replace('<h1>Prompt preview','<h2 id="prompt-heading">Prompt preview').replace('</h1>','</h2>')
  .replace('aria-label="Full generated prompt"','aria-labelledby="prompt-heading"');

for(const [name,markup,props] of [['MachineScene',machine,''],['RoomBackdrop',room,''],['PromptSheet',sheet,'{prompt}: {prompt: string}']]) {
  fs.writeFileSync(path.join(target,name+'.tsx'),`import { artwork } from './artwork'\n\n// Geometry and layer order preserved from the accepted v10 reference.\nexport function ${name}(${props}) {\n  return (\n${jsx(markup)}\n  )\n}\n`);
}

let css=fs.readFileSync(path.join(reference,'preview.css'),'utf8').split('@font-face')[1];
css='@font-face'+css;
css=css.replaceAll('url("assets/EBGaramond-Bold.ttf")','url("./assets/reading-machine/EBGaramond-Bold.ttf")')
  .replaceAll('.review-scene','.reading-scene').replaceAll('.artboard','.scene-artboard').replaceAll('.paper-header h1','.paper-header h2')
  .replace('--machine-width:min(100vw,1536px)','--machine-width:min(100cqw,1536px)')
  .replace('min-height:100svh;background:#172126','min-height:100svh;padding-bottom:42px;background:#172126')
  .replace('width:min(100%,1536px);margin:0 auto','width:var(--machine-width);margin:0 auto')
  .replace(/\.reading-scene \.review-footer\{[^}]*\}/,'');
fs.writeFileSync(path.join(root,'src/App.css'),'/* Accepted v10 scene. The root container gives every layer the same available width. */\n'+css);
console.log(JSON.stringify({copiedArtworkFiles:files.length,components:['RoomBackdrop','MachineScene','PromptSheet'],referenceRevision:manifest.revision}));
