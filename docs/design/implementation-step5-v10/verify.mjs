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
let html, MachineSettings, MachineScene, PromptSheet, initial, buildPrompt, languages, cefrLevels, textLengths, getTextLength, SpinControl, selectReadingCombination, topics, formats, angles, createPromptCopier, writePromptToClipboard, copyMessages;
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
    server.ssrLoadModule('/src/components/scene/SpinControl.tsx'),
    server.ssrLoadModule('/src/random/selectReadingCombination.ts'),
    server.ssrLoadModule('/src/data/topics.ts'),
    server.ssrLoadModule('/src/data/formats.ts'),
    server.ssrLoadModule('/src/data/angles.ts'),
    server.ssrLoadModule('/src/clipboard/promptCopier.ts'),
  ]);
  html=renderToStaticMarkup(createElement(modules[0].default));
  ({MachineSettings}=modules[1]); ({MachineScene}=modules[2]); ({PromptSheet}=modules[3]);
  initial=modules[4]; ({buildPrompt}=modules[5]); ({languages}=modules[6]); ({cefrLevels}=modules[7]); ({textLengths,getTextLength}=modules[8]);
  ({SpinControl}=modules[9]); ({selectReadingCombination}=modules[10]); ({topics}=modules[11]); ({formats}=modules[12]); ({angles}=modules[13]);
  ({createPromptCopier,writePromptToClipboard,copyMessages}=modules[14]);
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
function withoutGroup(markup,id){
  const start=markup.indexOf(`<g id="${id}"`);
  if(start<0)return markup;
  let depth=0;
  for(const match of markup.slice(start).matchAll(/<g\b[^>]*>|<\/g>/g)){
    depth+=match[0].startsWith('</')?-1:1;
    if(depth===0)return markup.slice(0,start)+markup.slice(start+match.index+match[0].length);
  }
  throw new Error('Unclosed group '+id);
}
const removeControlsAndRootDescription=markup=>withoutGroup(withoutGroup(markup,'drum-typography'),'settings-fields')
  .replace(/^<svg\b[^>]*>/,'<svg>')
  .replace(/<title id="scene-title">[\s\S]*?<\/desc>/,'')
  .replace(/<foreignObject\b[^>]*data-layer="spin-control"[\s\S]*?<\/foreignObject>/,'');
const initialMachineProps={settings:initial.initialSettings,combination:initial.initialCombination,onSettingsChange:()=>{},onSpin:()=>{}};
const machine=renderToStaticMarkup(createElement(MachineScene,initialMachineProps));
check('All artwork, coordinates and typography outside live settings/results match v10',
  canonical(removeControlsAndRootDescription(machine))===canonical(removeControlsAndRootDescription(fs.readFileSync(path.join(ref,'machine.svg'),'utf8'))));
const reference=fs.readFileSync(path.join(ref,'index.html'),'utf8');
const room=markup=>markup.match(/<div class="room-backdrop"[\s\S]*?<\/div>/)[0];
check('Every room and desk layer matches the accepted v10 reference',canonical(room(html))===canonical(room(reference)));
const paper=html.match(/<section class="prompt-sheet"[\s\S]*?<\/section>/)[0];
const paperForComparison=paper.replace('aria-labelledby="prompt-heading"','aria-label="Full generated prompt"').replace('<h2 id="prompt-heading">','<h1>').replace('</h2>','</h1>').replace(' id="reading-prompt"','')
  .replace(/<button class="copy-appearance"[^>]*>/,'<span class="copy-appearance">').replace('</button>','</span>')
  .replace(/<p id="copy-status"[\s\S]*?<\/p>/,'')
  .replace('</pre>','</pre><p class="paste-hint">Paste into your preferred AI chat.</p>');
check('Initial paper, slot shadow and complete prompt match v10',canonical(paperForComparison)===canonical(reference.match(/<section class="prompt-sheet"[\s\S]*?<\/section>/)[0]));
check('Initial prompt still matches the accepted fixture',initial.initialPrompt===JSON.parse(fs.readFileSync(path.join(ref,'prompt-fixture.json'),'utf8')).prompt);
check('Three native selects and one SPIN overlay share SVG coordinates', [...html.matchAll(/<select\b/g)].length===3 && [...html.matchAll(/<foreignObject\b/g)].length===4);
check('Accessible SVG group does not hide its controls as a single image',machine.includes('role="group"') && !machine.includes('role="img"'));
for(const [id,label] of [['reading-language','language-label'],['reading-cefr','cefr-label'],['reading-length','length-label']]){
  check(`${id} has an accessible visible label`,html.includes(`id="${label}"`) && html.includes(`aria-labelledby="${label}"`));
}
check('Stage 5 enables SPIN and Copy while help stays static',html.includes('data-stage="copy"') && [...html.matchAll(/<button\b/g)].length===2 && !/<dialog|<textarea|<iframe/.test(html));
check('SPIN is a native labeled button associated with the prompt',html.includes('id="spin-control" type="button" aria-label="SPIN" aria-controls="reading-prompt"') && html.includes('id="reading-prompt"'));
check('Results have an initially empty polite atomic announcement',html.includes('role="status" aria-live="polite" aria-atomic="true"></p>'));

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
  const markup=renderToStaticMarkup(createElement(MachineScene,{...initialMachineProps,settings,onSettingsChange:change}));
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
const removeControlCss=styles=>styles.replace(/^\.(?:copy-appearance\{appearance|copy-appearance:focus-visible|copy-appearance\[aria-disabled|copy-feedback)[^\n]*\n/gm,'');
check('Existing composition, SPIN, selects and responsive scaling CSS are unchanged',removeControlCss(css)===beforeCss);
check('Native controls have visible keyboard focus and no motion',css.includes('.machine-setting select:focus-visible{outline:2px solid #12343a') && !/\b(?:animation|transition)\s*:/.test(css));
check('Field frames stay at the accepted SVG coordinates',[
  '<rect x="390" y="310" width="228" height="40" rx="11" fill="url(#field)" stroke="#c99e79"',
  '<rect x="680" y="310" width="211" height="40" rx="11" fill="url(#field)" stroke="#c99e79"',
  '<rect x="957" y="310" width="202" height="40" rx="11" fill="url(#field)" stroke="#c99e79"',
].every(rect=>machine.includes(rect)));

function findComponent(node,type){
  if(!node || typeof node!=='object')return undefined;
  if(node.type===type)return node;
  return [node.props?.children].flat(Infinity).map(child=>findComponent(child,type)).find(Boolean);
}
let spinCases=0, spinPromptCases=0;
const spinExamples=[];
for(const [topicIndex,topic] of topics.entries())for(const [formatIndex,format] of formats.entries())for(const [angleIndex,angleId] of format.angleIds.entries()){
  const samples=[(topicIndex+.5)/topics.length,(formatIndex+.5)/formats.length,(angleIndex+.5)/format.angleIds.length];
  let draws=0, activations=0, combination=initial.initialCombination;
  const settings={language:languages[(spinCases+1)%languages.length],cefrLevel:Object.keys(cefrLevels)[spinCases%15],textLength:Object.keys(textLengths)[spinCases%3]};
  const settingsBefore=JSON.stringify(settings);
  const onSpin=()=>{combination=selectReadingCombination(()=>samples[draws++ % 3]);activations++;};
  const sceneElement=MachineScene({...initialMachineProps,settings,onSpin});
  const control=findComponent(sceneElement,SpinControl);
  assert.ok(control,'MachineScene must wire the real SpinControl');
  const button=SpinControl(control.props).props.children;
  assert.equal(button.type,'button');
  button.props.onClick();
  assert.equal(draws,3,'One activation must use exactly three random draws');
  assert.equal(activations,1);
  assert.equal(combination.topic.id,topic.id);
  assert.equal(combination.format.id,format.id);
  assert.equal(combination.angle.id,angleId);
  assert.equal(JSON.stringify(settings),settingsBefore);
  const rendered=renderToStaticMarkup(createElement(MachineScene,{...initialMachineProps,settings,combination,onSpin}));
  for(const field of ['topic','format','angle']){
    const group=rendered.match(new RegExp(`<g data-drum-field="${field}" data-selected-value="([^"]+)">([\\s\\S]*?)</g>`));
    assert.equal(decode(group[1]),combination[field].label);
    const selected=group[2].match(/<text\b[^>]*class="selected"[^>]*>([\s\S]*?)<\/text>/)[1];
    const lines=[...selected.matchAll(/<tspan\b[^>]*>([^<]+)<\/tspan>/g)].map(match=>decode(match[1]));
    assert.equal(lines.join(' '),combination[field].label,'Visible lines must preserve the full selected label');
    assert.ok(lines.length<=2,'Current catalog labels must fit in two lines');
    if(field==='angle')assert.ok(lines.every(line=>line.length<=14));
    const neighbors=[...group[2].matchAll(/<text\b[^>]*class="neighbor"[^>]*>([^<]+)<\/text>/g)].map(match=>decode(match[1]));
    const options=field==='topic'?topics.toReversed():field==='format'?formats.toReversed():format.angleIds.map(id=>angles.find(angle=>angle.id===id));
    const index=options.findIndex(option=>option.id===combination[field].id);
    assert.deepEqual(neighbors,[options[(index-1+options.length)%options.length].label,options[(index+1)%options.length].label]);
  }
  const prompt=buildPrompt(settings,combination);
  const sheet=renderToStaticMarkup(createElement(PromptSheet,{prompt}));
  assert.equal(decode(sheet.match(/<pre\b[^>]*>([\s\S]*?)<\/pre>/)[1]),prompt);
  for(const field of ['topic','format','angle'])assert.ok(prompt.includes(`${field[0].toUpperCase()+field.slice(1)}: ${combination[field].label}. ${combination[field].promptHint}`));
  button.props.onClick();
  assert.equal(draws,6);
  assert.equal(activations,2,'Repeating the exact same result must still accept another activation');
  assert.deepEqual(combination,{topic,format,angle:angles.find(angle=>angle.id===angleId)});
  for(const language of languages)for(const cefrLevel of Object.keys(cefrLevels))for(const textLength of Object.keys(textLengths)){
    const updatedSettings={language,cefrLevel,textLength};
    const changedPrompt=buildPrompt(updatedSettings,combination);
    assert.ok(changedPrompt.includes(`entirely in ${language.name}`));
    assert.ok(changedPrompt.includes(getTextLength(updatedSettings).instruction));
    assert.deepEqual(changedPrompt.split('\n\n').slice(3),prompt.split('\n\n').slice(3));
    spinPromptCases++;
  }
  spinExamples.push({topic:topic.id,format:format.id,angle:angleId,settings,drawsPerActivation:3});
  spinCases++;
}
check('All 27 combinations pass the real button wiring, selected labels, compatible neighbors and complete prompt',spinCases===27);
check('Every activation selects once; identical repeated results remain valid',spinExamples.every(example=>example.drawsPerActivation===3));
check('Settings preserve all 27 selected results across 13365 prompts',spinPromptCases===13365);
check('SPIN focus is visible without added movement',css.includes('.spin-control button:focus-visible{outline:3px solid #ffe7ba') && !/\b(?:animation|transition)\s*:/.test(css));
const assets=fs.readdirSync(path.join(root,'src/assets/reading-machine'));
const hashes=assets.map(file=>({file,sha256:hash(fs.readFileSync(path.join(root,'src/assets/reading-machine',file)))}));
check('Every artwork and font file remains byte-identical to v10',hashes.every(item=>item.sha256===hash(fs.readFileSync(path.join(ref,'assets',item.file)))));
const dist=path.join(root,'dist');
const builtIndex=fs.readFileSync(path.join(dist,'index.html'),'utf8');
const builtFiles=fs.readdirSync(path.join(dist,'assets'));
const productionCss=builtFiles.filter(file=>file.endsWith('.css')).map(file=>fs.readFileSync(path.join(dist,'assets',file),'utf8')).join('\n');
check('Copy is a native named button linked to readable prompt and live feedback', /<button class="copy-appearance" type="button"[^>]*aria-controls="reading-prompt"[^>]*aria-describedby="copy-status"/.test(html) && html.includes('</svg>Copy prompt</button>'));
check('Copy feedback appears between the heading and prompt, reserves space and announces politely',html.indexOf('id="prompt-heading"') < html.indexOf('id="copy-status"') && html.indexOf('id="copy-status"') < html.indexOf('id="reading-prompt"') && html.includes('id="copy-status" class="paste-hint copy-feedback" role="status" aria-live="polite" aria-atomic="true"') && html.includes('class="copy-feedback-reserve" aria-hidden="true"') && html.includes(copyMessages.error) && css.includes('.copy-feedback>span{grid-area:1/1;overflow-wrap:anywhere}') && !css.includes('user-select:none'));
check('Copy focus and feedback styles are included in production',productionCss.includes('.copy-appearance:focus-visible') && productionCss.includes('.copy-feedback-reserve{visibility:hidden}'));

const deferred=()=>{let resolve,reject;const promise=new Promise((res,rej)=>{resolve=res;reject=rej;});return {promise,resolve,reject};};
const copyScenarios=[];
const copied=[];
const statuses=[];
let gate=deferred();
const copier=createPromptCopier(status=>statuses.push(status),text=>{copied.push(text);return gate.promise;});
const original=initial.initialPrompt;
copier.reset(original);
const pendingCopy=copier.copy();
assert.equal(copied[0],original);
assert.deepEqual(statuses,['idle','copying']);
await copier.copy();
assert.equal(copied.length,1,'A duplicate activation while pending must not start another write');
gate.resolve(); await pendingCopy;
assert.deepEqual(statuses,['idle','copying','success']);
copyScenarios.push('Full exact prompt; copying before settlement; success only after resolution; duplicate suppressed');

gate=deferred(); const failed=copier.copy(); gate.reject(new Error('NotAllowedError')); await failed;
assert.equal(statuses.at(-1),'error');
gate=deferred(); const retry=copier.copy(); gate.resolve(); await retry;
assert.equal(statuses.at(-1),'success');
copyScenarios.push('Permission rejection is caught and a later retry succeeds');

for(const outcome of ['resolve','reject']){
  gate=deferred(); const oldGate=gate; const old=copier.copy();
  copier.reset('New prompt — 日本語\n\nRussian: русский.');
  assert.equal(statuses.at(-1),'idle');
  const before=statuses.length;
  oldGate[outcome](outcome==='reject'?new Error('Late rejection'):undefined); await old;
  assert.equal(statuses.length,before,'Old reply must not change feedback for a new prompt');
  copyScenarios.push('Prompt change ignores old '+outcome);
}

gate=deferred(); const oldGate=gate; const old=copier.copy();
copier.reset(original);
gate=deferred(); const currentGate=gate; const current=copier.copy();
assert.equal(copied.at(-1),original);
oldGate.resolve(); await old;
assert.equal(statuses.at(-1),'copying','Old completion must not clear a new request');
const writesBefore=copied.length; await copier.copy(); assert.equal(copied.length,writesBefore);
currentGate.resolve(); await current; assert.equal(statuses.at(-1),'success');
copyScenarios.push('Old completion cannot clear the busy state of a newer request');

gate=deferred(); const abaGate=gate; const aba=copier.copy();
copier.reset('B'); copier.reset(original);
const beforeAba=statuses.length; abaGate.resolve(); await aba; assert.equal(statuses.length,beforeAba);
copyScenarios.push('A → B → A invalidates old success even when text matches again');

gate=deferred(); const unmountGate=gate; const unmount=copier.copy();
copier.cancel(); const beforeUnmount=statuses.length; unmountGate.resolve(); await unmount;
assert.equal(statuses.length,beforeUnmount); await copier.copy(); assert.equal(statuses.length,beforeUnmount);
copier.reset(original); gate=deferred(); const remount=copier.copy(); gate.resolve(); await remount; assert.equal(statuses.at(-1),'success');
copyScenarios.push('Unmount invalidates replies; setup after cleanup works for StrictMode');

const syncFailureStatuses=[];
const syncFailure=createPromptCopier(status=>syncFailureStatuses.push(status),()=>{throw new Error('Clipboard unavailable');});
syncFailure.reset(original); await syncFailure.copy(); assert.deepEqual(syncFailureStatuses,['idle','copying','error']);
copyScenarios.push('Synchronous clipboard failure is caught');

// Test the production API adapter against a stub navigator in this Node process.
// No system clipboard is accessed by these tests.
const originalNavigator=Object.getOwnPropertyDescriptor(globalThis,'navigator');
try {
  Object.defineProperty(globalThis,'navigator',{value:{},configurable:true});
  assert.throws(()=>writePromptToClipboard(original),/Clipboard unavailable/);
  const apiCalls=[];
  const clipboard={writeText(text){assert.equal(this,clipboard);apiCalls.push(text);return Promise.resolve();}};
  Object.defineProperty(globalThis,'navigator',{value:{clipboard},configurable:true});
  await writePromptToClipboard(original);
  assert.deepEqual(apiCalls,[original]);
} finally {
  if(originalNavigator)Object.defineProperty(globalThis,'navigator',originalNavigator);else delete globalThis.navigator;
}
copyScenarios.push('Production adapter detects absent API and writes full text with the correct Clipboard receiver');

let copiedPromptCases=0;
const writeCalls=[];
const allPromptsCopier=createPromptCopier(()=>{},text=>{writeCalls.push(text);return Promise.resolve();});
for(const topic of topics)for(const format of formats)for(const angleId of format.angleIds){
  const combination={topic,format,angle:angles.find(angle=>angle.id===angleId)};
  for(const language of languages)for(const cefrLevel of Object.keys(cefrLevels))for(const textLength of Object.keys(textLengths)){
    const prompt=buildPrompt({language,cefrLevel,textLength},combination);
    allPromptsCopier.reset(prompt); await allPromptsCopier.copy();
    assert.equal(writeCalls.at(-1),prompt,'Copied text must match the full current generated prompt exactly');
    copiedPromptCases++;
  }
}
check('Clipboard async races, rejection, retry, duplicate activation, unmount and missing API pass',copyScenarios.length===9);
check('All 13365 current prompts are passed to the writer without truncation or transformation',copiedPromptCases===13365 && writeCalls.length===13365);
check('Production retains native control focus and responsive machine scaling',productionCss.includes('select:focus-visible') && /\.scene-artboard>svg\{[^}]*width:100%[^}]*height:auto/.test(productionCss));
check('Production uses the GitHub Pages base',builtIndex.includes('/reading-roulette/assets/') && !builtIndex.includes('/src/'));
check('Production preserves all image and font bytes',hashes.filter(item=>!item.file.endsWith('.txt')).every(item=>builtFiles.some(file=>hash(fs.readFileSync(path.join(dist,'assets',file)))===item.sha256)));
const urls=['http://127.0.0.1:5173/','http://127.0.0.1:5173/src/components/scene/MachineSettings.tsx','http://127.0.0.1:5173/src/App.css?direct','http://127.0.0.1:5174/reading-roulette/',...builtFiles.map(file=>'http://127.0.0.1:5174/reading-roulette/assets/'+file)];
const http=await Promise.all(urls.map(async url=>{const response=await fetch(url);assert.equal(response.status,200,url);return {url,status:response.status,bytes:(await response.arrayBuffer()).byteLength};}));
fs.writeFileSync(path.join(dir,'react-markup.html'),html+'\n');
const report={date:'2026-10-11',stage:5,skippedStage:3,checksPassed:checks.length,checks,copyScenarios,copiedPromptCases,spinCases,spinPromptCases,spinExamples,settingScenarios:scenarios,proseCases,structuralCases,languages:languages.length,cefrLevels:Object.keys(cefrLevels).length,lengths:Object.keys(textLengths).length,http,hashes,browser:{status:'unverified',reason:'In-app Browser failed with EPERM realpath browser-client.mjs. Clipboard uses test writers and a stub navigator, not the system clipboard. Tests do not verify paste into another application, live React DOM updates, keyboard activation or visual layout.'}};
fs.writeFileSync(path.join(dir,'verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({checksPassed:checks.length,copyScenarios:copyScenarios.length,copiedPromptCases,spinCases,settingScenarios:scenarios,httpResources:http.length,browser:report.browser.status},null,2));
