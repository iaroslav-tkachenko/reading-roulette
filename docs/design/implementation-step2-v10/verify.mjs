// Component-handler and SSR checks, not browser interaction/layout verification.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

const dir=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(dir,'../../..');
const ref=path.join(root,'docs/design/layered-v09-2026-10-11');
const checks=[];
const check=(name,condition)=>{assert.ok(condition,name);checks.push(name);};
const hash=data=>createHash('sha256').update(data).digest('hex');
const server=await createServer({root,server:{middlewareMode:true},appType:'custom'});
let html, MachineSettings, MachineScene, PromptSheet, initial, buildPrompt, languages, cefrLevels, textLengths, getTextLength;
try {
  const modules=await Promise.all([
    server.ssrLoadModule('/src/App.tsx'),
    server.ssrLoadModule('/src/components/scene/MachineSettings.tsx'),
    server.ssrLoadModule('/src/components/scene/MachineScene.tsx'),
    server.ssrLoadModule('/src/components/scene/PromptSheet.tsx'),
    server.ssrLoadModule('/src/components/scene/initialReading.ts'),
    server.ssrLoadModule('/src/prompt/buildPrompt.ts'),
    server.ssrLoadModule('/src/data/languages.ts'),
    server.ssrLoadModule('/src/data/cefrLevels.ts'),
    server.ssrLoadModule('/src/data/textLengths.ts'),
  ]);
  html=renderToStaticMarkup(createElement(modules[0].default));
  ({MachineSettings}=modules[1]); ({MachineScene}=modules[2]); ({PromptSheet}=modules[3]);
  initial=modules[4]; ({buildPrompt}=modules[5]); ({languages}=modules[6]); ({cefrLevels}=modules[7]); ({textLengths,getTextLength}=modules[8]);
} finally { await server.close(); }

const decode=s=>s.replaceAll('&quot;','"').replaceAll('&#x27;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&');
function canonical(markup){
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
const removeControlsAndRootDescription=markup=>markup
  .replace(/^<svg\b[^>]*>/,'<svg>')
  .replace(/<title id="scene-title">[\s\S]*?<\/desc>/,'')
  .replace(/<g id="settings-fields"[\s\S]*?<\/g>/,'');
const machine=renderToStaticMarkup(createElement(MachineScene,{settings:initial.initialSettings,onSettingsChange:()=>{}}));
check('All machine artwork, coordinates and typography outside the live settings match v10',
  canonical(removeControlsAndRootDescription(machine))===canonical(removeControlsAndRootDescription(fs.readFileSync(path.join(ref,'machine.svg'),'utf8'))));
const reference=fs.readFileSync(path.join(ref,'index.html'),'utf8');
const room=markup=>markup.match(/<div class="room-backdrop"[\s\S]*?<\/div>/)[0];
check('Every room and desk layer matches the accepted v10 reference',canonical(room(html))===canonical(room(reference)));
const paper=html.match(/<section class="prompt-sheet"[\s\S]*?<\/section>/)[0];
const paperForComparison=paper.replace('aria-labelledby="prompt-heading"','aria-label="Full generated prompt"').replace('<h2 id="prompt-heading">','<h1>').replace('</h2>','</h1>');
check('Initial paper, slot shadow and complete prompt match v10',canonical(paperForComparison)===canonical(reference.match(/<section class="prompt-sheet"[\s\S]*?<\/section>/)[0]));
check('Initial prompt still matches the accepted fixture',initial.initialPrompt===JSON.parse(fs.readFileSync(path.join(ref,'prompt-fixture.json'),'utf8')).prompt);
check('Exactly three native selects replace the drawn values', [...html.matchAll(/<select\b/g)].length===3 && [...html.matchAll(/<foreignObject\b/g)].length===3);
check('Accessible SVG group does not hide its controls as a single image',machine.includes('role="group"') && !machine.includes('role="img"'));
for(const [id,label] of [['reading-language','language-label'],['reading-cefr','cefr-label'],['reading-length','length-label']]){
  check(`${id} has an accessible visible label`,html.includes(`id="${label}"`) && html.includes(`aria-labelledby="${label}"`));
}
check('Only settings are interactive in stage 2',html.includes('data-stage="settings"') && !/<button|<dialog|<textarea|<iframe/.test(html));

function findSelect(node,id){
  if(!node || typeof node!=='object')return undefined;
  if(node.type==='select' && node.props.id===id)return node;
  return [node.props?.children].flat(Infinity).map(child=>findSelect(child,id)).find(Boolean);
}
function selectedValue(markup,id){
  const select=markup.match(new RegExp(`<select\\b[^>]*id="${id}"[^>]*>([\\s\\S]*?)</select>`));
  assert.ok(select,`Missing ${id}`);
  const selected=select[1].match(/<option\b[^>]*value="([^"]*)"[^>]*selected=""/);
  assert.ok(selected,`Missing selected value in ${id}`);
  return decode(selected[1]);
}
let scenarios=0;
const expectedLanguages=[['en','English'],['es','Spanish'],['fr','French'],['ja','Japanese'],['de','German'],['ko','Korean'],['it','Italian'],['zh','Chinese (Mandarin)'],['ru','Russian'],['pt','Portuguese'],['sr','Serbian']];
check('All eleven recovered languages are present once, in the original order',JSON.stringify(languages.map(({code,name})=>[code,name]))===JSON.stringify(expectedLanguages));
check('The language control contains the entire catalog',expectedLanguages.every(([code])=>html.includes(`value="${code}"`)));
// Derive expected prose ranges from the approved document, not the implementation.
const documentedRanges=new Map();
for(const line of fs.readFileSync(path.join(root,'docs/LEVELS_LENGTH.md'),'utf8').split(/\r?\n/)){
  if(!line.startsWith('| '))continue;
  const cells=line.split('|').slice(1,-1).map(cell=>cell.trim());
  if(!/^\d+–\d+ слов$/.test(cells[2]??''))continue;
  for(const level of cells[1].split(/,\s*/))documentedRanges.set(level,cells.slice(2).map(cell=>cell.replace(' слов','')));
}
check('Approved length matrix covers every CEFR choice',documentedRanges.size===15 && Object.keys(cefrLevels).every(level=>documentedRanges.has(level)));
let proseCases=0,structuralCases=0;
for(const language of languages)for(const cefrLevel of Object.keys(cefrLevels))for(const textLength of Object.keys(textLengths)){
  let settings={...initial.initialSettings};
  const change=value=>{settings=value;};
  for(const [id,value,expected] of [
    ['reading-language',language.code,{...settings,language}],
    ['reading-cefr',cefrLevel,{...settings,language,cefrLevel}],
    ['reading-length',textLength,{language,cefrLevel,textLength}],
  ]){
    const select=findSelect(MachineSettings({settings,onChange:change}),id);
    select.props.onChange({target:{value}});
    assert.deepEqual(settings,expected,'Changing one control must preserve the other settings');
  }
  const markup=renderToStaticMarkup(createElement(MachineScene,{settings,onSettingsChange:change}));
  assert.equal(selectedValue(markup,'reading-language'),language.code);
  assert.equal(selectedValue(markup,'reading-cefr'),cefrLevel);
  assert.equal(selectedValue(markup,'reading-length'),textLength);
  const lengthDetails=getTextLength(settings);
  assert.ok(markup.includes(`title="${lengthDetails.description}"`));
  assert.ok(markup.includes(`id="reading-word-range" class="sr-only">${lengthDetails.description}</span>`));
  for(const length of Object.keys(textLengths))assert.ok(markup.includes(`title="${getTextLength({...settings,textLength:length}).description}"`));
  assert.ok(markup.includes(`title="${language.name}"`));
  const prompt=buildPrompt(settings,initial.initialCombination);
  const paragraphs=prompt.split('\n\n');
  assert.equal(paragraphs[0],`Write an original reading text entirely in ${language.name} for a language learner.`);
  assert.equal(paragraphs[1],`Difficulty target: ${cefrLevel} (an internal tuning point around the standard CEFR levels, not a separate official CEFR level). ${cefrLevels[cefrLevel]}`);
  if(['ja','zh'].includes(language.code)){
    assert.equal(lengthDetails.wordRange,null);
    assert.ok(paragraphs[2].startsWith(`Length: ${textLengths[textLength].label} for difficulty ${cefrLevel}.`));
    assert.ok(paragraphs[2].includes(textLengths[textLength].structureHint));
    assert.ok(paragraphs[2].includes('rather than a numeric word or character target'));
    assert.ok(!/\d+[–-]\d+|approximately/.test(paragraphs[2]));
    structuralCases++;
  } else {
    const expectedRange=documentedRanges.get(cefrLevel)[Object.keys(textLengths).indexOf(textLength)];
    assert.equal(lengthDetails.wordRange,expectedRange);
    assert.equal(paragraphs[2],`Length: approximately ${expectedRange} words.`);
    assert.equal(lengthDetails.description,`${textLengths[textLength].label} · ${expectedRange} words`);
    proseCases++;
  }
  assert.deepEqual(paragraphs.slice(3),initial.initialPrompt.split('\n\n').slice(3),'Settings must preserve the topic, format, angle and remaining instructions');
  const sheet=renderToStaticMarkup(createElement(PromptSheet,{prompt}));
  assert.equal(decode(sheet.match(/<pre\b[^>]*>([\s\S]*?)<\/pre>/)[1]),prompt,'The readable sheet must contain the complete current prompt');
  scenarios++;
}
check('All 495 setting combinations pass real control handlers, selected values and full prompt checks',scenarios===495);
check('405 word-based cases match every approved profile/length range',proseCases===405);
check('90 Japanese and Mandarin cases use structure without invented numeric targets',structuralCases===90);
for(const id of ['reading-language','reading-cefr','reading-length']){
  let calls=0;
  findSelect(MachineSettings({settings:initial.initialSettings,onChange:()=>{calls++;}}),id).props.onChange({target:{value:'invalid'}});
  assert.equal(calls,0,'Unknown setting must not replace a valid value');
}
check('All three controls reject unknown values',true);

const css=fs.readFileSync(path.join(root,'src/App.css'),'utf8');
const beforeCss=fs.readFileSync(path.join(dir,'before/App.css'),'utf8');
const removeControlCss=styles=>styles.replace(/^\.machine-setting[^\n]*\n/gm,'');
check('Existing composition and responsive scaling CSS are unchanged',removeControlCss(css)===beforeCss);
check('Native controls have visible keyboard focus and no motion',css.includes('.machine-setting select:focus-visible{outline:2px solid #12343a') && !/\b(?:animation|transition)\s*:/.test(css));
check('Field frames stay at the accepted SVG coordinates',[
  '<rect x="390" y="310" width="228" height="40" rx="11" fill="url(#field)" stroke="#c99e79"',
  '<rect x="680" y="310" width="211" height="40" rx="11" fill="url(#field)" stroke="#c99e79"',
  '<rect x="957" y="310" width="202" height="40" rx="11" fill="url(#field)" stroke="#c99e79"',
].every(rect=>machine.includes(rect)));
const assets=fs.readdirSync(path.join(root,'src/assets/reading-machine'));
const hashes=assets.map(file=>({file,sha256:hash(fs.readFileSync(path.join(root,'src/assets/reading-machine',file)))}));
check('Every artwork and font file remains byte-identical to v10',hashes.every(item=>item.sha256===hash(fs.readFileSync(path.join(ref,'assets',item.file)))));
const dist=path.join(root,'dist');
const builtIndex=fs.readFileSync(path.join(dist,'index.html'),'utf8');
const builtFiles=fs.readdirSync(path.join(dist,'assets'));
const productionCss=builtFiles.filter(file=>file.endsWith('.css')).map(file=>fs.readFileSync(path.join(dist,'assets',file),'utf8')).join('\n');
check('Production retains native control focus and responsive machine scaling',productionCss.includes('select:focus-visible') && /\.scene-artboard>svg\{[^}]*width:100%[^}]*height:auto/.test(productionCss));
check('Production uses the GitHub Pages base',builtIndex.includes('/reading-roulette/assets/') && !builtIndex.includes('/src/'));
check('Production preserves all image and font bytes',hashes.filter(item=>!item.file.endsWith('.txt')).every(item=>builtFiles.some(file=>hash(fs.readFileSync(path.join(dist,'assets',file)))===item.sha256)));
const urls=['http://127.0.0.1:5173/','http://127.0.0.1:5173/src/components/scene/MachineSettings.tsx','http://127.0.0.1:5173/src/App.css?direct','http://127.0.0.1:5174/reading-roulette/',...builtFiles.map(file=>'http://127.0.0.1:5174/reading-roulette/assets/'+file)];
const http=await Promise.all(urls.map(async url=>{const response=await fetch(url);assert.equal(response.status,200,url);return {url,status:response.status,bytes:(await response.arrayBuffer()).byteLength};}));
fs.writeFileSync(path.join(dir,'react-markup.html'),html+'\n');
const report={date:'2026-10-11',stage:2,checksPassed:checks.length,checks,settingScenarios:scenarios,proseCases,structuralCases,languages:languages.length,cefrLevels:Object.keys(cefrLevels).length,lengths:Object.keys(textLengths).length,http,hashes,browser:{status:'unverified',reason:'In-app Browser failed with EPERM realpath browser-client.mjs. Component handlers and SSR do not verify live React DOM updates, native menus, keyboard behavior or visual layout.'}};
fs.writeFileSync(path.join(dir,'verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({checksPassed:checks.length,settingScenarios:scenarios,httpResources:http.length,browser:report.browser.status},null,2));
