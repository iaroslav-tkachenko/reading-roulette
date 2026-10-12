// Check the actual React output against the approved layers, plus production URLs.
// This is not browser layout, screenshot, font-loading or interaction verification.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createServer} from 'vite';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

const dir=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(dir,'../../..');
const ref=path.join(root,'docs/design/layered-v09-2026-10-11');
const reference=fs.readFileSync(path.join(ref,'index.html'),'utf8');
const manifest=JSON.parse(fs.readFileSync(path.join(ref,'layer-manifest.json'),'utf8'));
const checks=[];
function check(name,condition){assert.ok(condition,name);checks.push(name);}
const hash=data=>createHash('sha256').update(data).digest('hex');
const server=await createServer({root,server:{middlewareMode:true},appType:'custom'});
let html, initial;
try {
  const {default:App}=await server.ssrLoadModule('/src/App.tsx');
  initial=await server.ssrLoadModule('/src/components/scene/initialReading.ts');
  html=renderToStaticMarkup(createElement(App));
} finally {await server.close();}
fs.writeFileSync(path.join(dir,'react-markup.html'),html+'\n');

function svgAt(markup,viewBox){
  const start=markup.search(new RegExp('<svg\\b[^>]*viewBox="'+viewBox+'"'));
  assert.ok(start>=0,'Missing SVG '+viewBox);
  const tags=markup.slice(start).matchAll(/<svg\b[^>]*>|<\/svg>/g);
  let depth=0;
  for(const t of tags){depth+=t[0].startsWith('</')?-1:1;if(depth===0)return markup.slice(start,start+t.index+t[0].length);}
  throw new Error('Unclosed SVG '+viewBox);
}
const decode=s=>s.replaceAll('&quot;','"').replaceAll('&#x27;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&');
function canonical(markup){
  // Ignore formatting, attribute order, equivalent styles, and bundler URL prefixes.
  const result=[];
  markup=markup.replace(/<style>@font-face[\s\S]*?<\/style>/,'');
  for(const match of markup.matchAll(/<\/?[\w-]+\b[^>]*>|[^<]+/g)){
    const token=match[0];
    if(!token.startsWith('<')){if(token.trim())result.push(decode(token));continue;}
    const tag=token.match(/^<(\/?[\w-]+)/)[1];
    const attrs=[...token.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([,k,v])=>{
      v=decode(v);
      if(k==='href')v=path.posix.basename(v);
      if(k==='style')v=v.split(';').filter(Boolean).sort().join(';');
      return [k,v];
    }).sort(([a],[b])=>a.localeCompare(b));
    result.push([tag,attrs]);
    if(token.endsWith('/>'))result.push(['/'+tag,[]]);
  }
  return JSON.stringify(result);
}
check('Accepted v10 is the reference',manifest.revision===10);
const machine=svgAt(html,'0 64 1536 754');
const refMachine=fs.readFileSync(path.join(ref,'machine.svg'),'utf8');
check('Actual React machine preserves every SVG coordinate, label and layer',canonical(machine)===canonical(refMachine));
const room=html.match(/<div class="room-backdrop"[\s\S]*?<\/div>/)[0];
const refRoom=reference.match(/<div class="room-backdrop"[\s\S]*?<\/div>/)[0];
check('Actual React room preserves every decorative layer and coordinate',canonical(room)===canonical(refRoom));
const paper=html.match(/<section class="prompt-sheet"[\s\S]*?<\/section>/)[0];
const refPaper=reference.match(/<section class="prompt-sheet"[\s\S]*?<\/section>/)[0];
const paperForComparison=paper.replace('aria-labelledby="prompt-heading"','aria-label="Full generated prompt"').replace('<h2 id="prompt-heading">','<h1>').replace('</h2>','</h1>');
check('Actual React paper preserves texture, entry shadow, copy appearance and full text',canonical(paperForComparison)===canonical(refPaper));
check('Initial settings and combination match the accepted design',initial.initialSettings.language.code==='en' && initial.initialSettings.cefrLevel==='B1+' && initial.initialSettings.textLength==='medium' && initial.initialCombination.topic.id==='travel' && initial.initialCombination.format.id==='short-story' && initial.initialCombination.angle.id==='unexpected-discovery');
check('Full prompt comes from the existing generator and matches the reference',initial.initialPrompt===JSON.parse(fs.readFileSync(path.join(ref,'prompt-fixture.json'),'utf8')).prompt);
check('Scene is native React/SVG, with 42 raster instances and no iframe or flattened scene', [...html.matchAll(/<image\b/g)].length===42 && !/<iframe|<object|<embed/.test(html) && !html.includes('assembly-render'));
check('Individual keys, drums and wheels are retained',[...html.matchAll(/id="key-art-/g)].length===19 && [...html.matchAll(/id="drum-[123]"/g)].length===3 && html.includes('id="left-wheel"') && html.includes('id="right-wheel"'));
check('Stage 1 has no live controls or animation',!/<button|<select|<dialog|<textarea/.test(html) && !/\b(?:animation|transition)\s*:|position:\s*(?:fixed|sticky)/.test(fs.readFileSync(path.join(root,'src/App.css'),'utf8')));

const artworkFiles=[...new Set([...html.matchAll(/href="([^"]+\.png)"/g)].map(m=>path.posix.basename(m[1])))];
const hashes=[...artworkFiles,'EBGaramond-Bold.ttf','EBGaramond-OFL.txt'].map(file=>({file,sha256:hash(fs.readFileSync(path.join(root,'src/assets/reading-machine',file))),referenceSha256:hash(fs.readFileSync(path.join(ref,'assets',file)))}));
check('All 14 PNGs, local font and license are preserved byte for byte',artworkFiles.length===14 && hashes.every(p=>p.sha256===p.referenceSha256));
const css=fs.readFileSync(path.join(root,'src/App.css'),'utf8');
const indexCss=fs.readFileSync(path.join(root,'src/index.css'),'utf8');
check('Room and machine use one container width including with a scrollbar',indexCss.includes('container-type: inline-size') && css.includes('--machine-width:min(100cqw,1536px)') && css.includes('.scene-artboard{width:var(--machine-width)'));
check('Desk is tied to machine scale and page scrolling',css.includes('--wall-y:calc(var(--machine-width)*.38671875)') && css.includes('.room-backdrop{position:absolute;inset:0') && css.includes('.room-desk{top:var(--wall-y)'));
check('Paper width and slot reveal remain unchanged',css.includes('width:55.7291666667%;margin:-4.5572916667%') && html.includes('data-layer="paper-entry-shadow"'));
check('Prompt uses natural page scrolling',css.includes('white-space:pre-wrap') && css.includes('max-height:none') && !html.includes('<textarea'));
check('The local font is preloaded',fs.readFileSync(path.join(root,'index.html'),'utf8').includes('rel="preload" href="/src/assets/reading-machine/EBGaramond-Bold.ttf"'));

const dist=path.join(root,'dist');
const builtIndex=fs.readFileSync(path.join(dist,'index.html'),'utf8');
const builtFiles=fs.readdirSync(path.join(dist,'assets'));
check('Production includes all 14 matching PNGs and the local font',hashes.filter(p=>!p.file.endsWith('.txt')).every(p=>builtFiles.some(file=>hash(fs.readFileSync(path.join(dist,'assets',file)))===p.sha256)));
check('Production entry and assets use the GitHub Pages base',builtIndex.includes('/reading-roulette/assets/') && !builtIndex.includes('/src/'));
const productionCss=builtFiles.filter(f=>f.endsWith('.css')).map(f=>fs.readFileSync(path.join(dist,'assets',f),'utf8')).join('\n');
check('Production font URL also uses the Pages base',/url\([^)]*\/reading-roulette\/assets\/EBGaramond-Bold/.test(productionCss));

const urls=['http://127.0.0.1:5173/','http://127.0.0.1:5173/docs/design/layered-v09-2026-10-11/?v=10','http://127.0.0.1:5174/reading-roulette/',...builtFiles.map(file=>'http://127.0.0.1:5174/reading-roulette/assets/'+file)];
const http=await Promise.all(urls.map(async url=>{const r=await fetch(url);assert.equal(r.status,200,url);return {url,status:r.status,bytes:(await r.arrayBuffer()).byteLength};}));
const geometry=[1366,1536,1920,4608].flatMap(viewportWidth=>[0,17].map(scrollbarWidth=>{
  const availableWidth=viewportWidth-scrollbarWidth,machineWidth=Math.min(availableWidth,1536),scale=machineWidth/1536;
  return {viewportWidth,scrollbarWidth,availableWidth,machineWidth,wallY:594*scale,machineBottom:754*scale,paperTop:684*scale,paperWidth:856*scale,method:'CSS geometry calculation; not a browser measurement'};
}));
const report={date:'2026-10-11',stage:1,referenceRevision:10,url:'http://127.0.0.1:5173/',productionPreview:'http://127.0.0.1:5174/reading-roulette/',checksPassed:checks.length,checks,hashes,http,geometry,referenceHashes:['index.html','machine.svg','preview.css','layer-manifest.json'].map(file=>({file,sha256:hash(fs.readFileSync(path.join(ref,file)))})),browser:{status:'unverified',reason:'In-app Browser import failed with EPERM realpath browser-client.mjs. SSR equivalence, HTTP and SVG illustrations do not verify browser layout, zoom or font loading.'}};
fs.writeFileSync(path.join(dir,'verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({checksPassed:checks.length,httpResources:http.length,url:report.url,productionPreview:report.productionPreview,browser:report.browser.status},null,2));
