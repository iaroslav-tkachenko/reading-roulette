// Component-handler and SSR checks, not browser interaction/layout verification.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { checkPress } from './press-checks.mjs';
import { checkDrums } from './drum-checks.mjs';
import { checkKeys } from './key-checks.mjs';
import { checkWheels } from './wheel-checks.mjs';
import { checkPointers } from './pointer-checks.mjs';

const sourceDir=path.dirname(fileURLToPath(import.meta.url));
const dir=path.resolve(sourceDir,'../implementation-step10-v10');
const root=path.resolve(sourceDir,'../../..');
const ref=path.join(root,'docs/design/layered-v09-2026-10-11');
const checks=[];
const check=(name,condition)=>{assert.ok(condition,name);checks.push(name);};
const hash=data=>createHash('sha256').update(data).digest('hex');
const server=await createServer({root,server:{middlewareMode:true,hmr:false},appType:'custom'});
let html, MachineSettings, MachineScene, PromptSheet, initial, buildPrompt, languages, cefrLevels, textLengths, getTextLength, SpinControl, selectReadingCombination, topics, formats, angles, createPromptCopier, writePromptToClipboard, copyMessages, createSpinPress, createSpinPressHandlers;
let drumMotion, drumController, keyMotion, wheelMotion, pointerMotion, pointerGeometry, compatibility;
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
    server.ssrLoadModule('/src/motion/spinPress.ts'),
    server.ssrLoadModule('/src/motion/svgDrumMotion.ts'),
    server.ssrLoadModule('/src/motion/drumSpinController.ts'),
    server.ssrLoadModule('/src/motion/keyWaves.ts'),
    server.ssrLoadModule('/src/motion/wheelMotion.ts'),
    server.ssrLoadModule('/src/motion/pointerMotion.ts'),
    server.ssrLoadModule('/src/components/scene/pointerGeometry.ts'),
    server.ssrLoadModule('/src/random/compatibility.ts'),
  ]);
  html=renderToStaticMarkup(createElement(modules[0].default));
  ({MachineSettings}=modules[1]); ({MachineScene}=modules[2]); ({PromptSheet}=modules[3]);
  initial=modules[4]; ({buildPrompt}=modules[5]); ({languages}=modules[6]); ({cefrLevels}=modules[7]); ({textLengths,getTextLength}=modules[8]);
  ({SpinControl}=modules[9]); ({selectReadingCombination}=modules[10]); ({topics}=modules[11]); ({formats}=modules[12]); ({angles}=modules[13]);
  ({createPromptCopier,writePromptToClipboard,copyMessages}=modules[14]);
  ({createSpinPress,createSpinPressHandlers}=modules[15]);
  drumMotion=modules[16];drumController=modules[17];keyMotion=modules[18];wheelMotion=modules[19];
  pointerMotion=modules[20];pointerGeometry=modules[21];compatibility=modules[22];
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
const removeControlsAndRootDescription=markup=>withoutGroup(withoutGroup(withoutGroup(withoutGroup(withoutGroup(withoutGroup(withoutGroup(withoutGroup(markup,'mechanical-cradle'),'wheel-rim-left'),'wheel-rim-right'),'spin-mechanism'),'spin-button'),'spin-caption'),'drum-typography'),'settings-fields')
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
const paperArtwork=markup=>canonical(markup.split('<div class="paper-content">')[0].replace(/^<section[^>]*>/,''));
check('Paper texture, torn edge and slot shadow match v10',paperArtwork(paper)===paperArtwork(reference.match(/<section class="prompt-sheet"[\s\S]*?<\/section>/)[0]));
check('Initial canonical migration preserves travel/discovery and builds a valid prompt',initial.initialCombination.topic.id==='travel' && initial.initialCombination.format.id==='everyday-story' && initial.initialCombination.angle.id==='unexpected-discovery' && initial.initialPrompt===buildPrompt(initial.initialSettings,initial.initialCombination));
check('Three native selects and one SPIN overlay share SVG coordinates', [...html.matchAll(/<select\b/g)].length===3 && [...html.matchAll(/<foreignObject\b/g)].length===4);
check('Accessible SVG group does not hide its controls as a single image',machine.includes('role="group"') && !machine.includes('role="img"'));
for(const [id,label] of [['reading-language','language-label'],['reading-cefr','cefr-label'],['reading-length','length-label']]){
  check(`${id} has an accessible visible label`,html.includes(`id="${label}"`) && html.includes(`aria-labelledby="${label}"`));
}
check('Full catalogs preserve wheels, key waves, drums, mechanical SPIN and Copy while help stays static',html.includes('data-stage="full-catalogs"') && html.includes('data-spinning="false"') && [...html.matchAll(/<button\b/g)].length===2 && !/<dialog|<textarea|<iframe/.test(html));
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
  const valid=compatibility.checkCombination(settings,initial.initialCombination).valid;
  const combination=valid?initial.initialCombination:null;
  const markup=renderToStaticMarkup(createElement(MachineScene,{...initialMachineProps,settings,combination,onSettingsChange:change}));
  assert.equal(selectedValue(markup,'reading-language'),language.code);
  assert.equal(selectedValue(markup,'reading-cefr'),cefrLevel);
  assert.equal(selectedValue(markup,'reading-length'),textLength);
  const lengthDetails=getTextLength(settings);
  const helper=valid?lengthDetails.description:`${textLengths[textLength].label} · press SPIN to find a text`;
  assert.ok(markup.includes(`title="${helper}"`));
  assert.ok(markup.includes(`id="reading-word-range" class="sr-only">${helper}</span>`));
  for(const length of Object.keys(textLengths))assert.ok(markup.includes(`title="${valid?getTextLength({...settings,textLength:length},combination.format).description:`${textLengths[length].label} · press SPIN to find a text`}"`));
  assert.ok(markup.includes(`title="${language.name}"`));
  const prompt=valid?buildPrompt(settings,initial.initialCombination):'';
  if(!valid)assert.throws(()=>buildPrompt(settings,initial.initialCombination));
  if(valid){
    const paragraphs=prompt.split('\n\n');
    assert.equal(paragraphs[0],`Write an original reading text entirely in ${language.name} for a language learner.`);
    assert.equal(paragraphs[1],`Difficulty target: ${cefrLevel} (an internal tuning point around the standard CEFR levels, not a separate official CEFR level). ${cefrLevels[cefrLevel]}`);
    assert.equal(paragraphs[2],lengthDetails.instruction);
  }
  const instruction=lengthDetails.instruction;
  if(['ja','zh'].includes(language.code)){
    assert.equal(lengthDetails.wordRange,null);
    assert.ok(instruction.startsWith(`Length: ${textLengths[textLength].label} for difficulty ${cefrLevel}.`));
    assert.ok(instruction.includes(textLengths[textLength].structureHint));
    assert.ok(instruction.includes('rather than a numeric word or character target'));
    assert.ok(!/\d+[–-]\d+|approximately/.test(instruction));
    structuralCases++;
  } else {
    const expectedRange=documentedRanges.get(cefrLevel)[Object.keys(textLengths).indexOf(textLength)];
    assert.equal(lengthDetails.wordRange,expectedRange);
    assert.equal(instruction,`Length: approximately ${expectedRange} words.`);
    assert.equal(lengthDetails.description,`${textLengths[textLength].label} · ${expectedRange} words`);
    proseCases++;
  }
  if(valid)for(const field of ['topic','format','angle'])assert.ok(prompt.includes(`${field[0].toUpperCase()+field.slice(1)}: ${initial.initialCombination[field].label}.`));
  const sheet=renderToStaticMarkup(createElement(PromptSheet,{prompt,disabled:!valid}));
  assert.equal(decode(sheet.match(/<pre\b[^>]*>([\s\S]*?)<\/pre>/)[1]),prompt || 'Press SPIN to prepare a text for these settings.','Sheet contains the current prompt or explicit empty state');
  scenarios++;
}
check('All 495 settings pass real control handlers, values, volume rules and valid-prompt/empty-state checks',scenarios===495);
check('405 word-based cases match every approved profile/length range',proseCases===405);
check('90 Japanese and Mandarin cases use structure without invented numeric targets',structuralCases===90);
for(const id of ['reading-language','reading-cefr','reading-length']){
  let calls=0;
  findSelect(MachineSettings({settings:initial.initialSettings,onChange:()=>{calls++;}}),id).props.onChange({target:{value:'invalid'}});
  assert.equal(calls,0,'Unknown setting must not replace a valid value');
}
check('All three controls reject unknown values',true);

const css=fs.readFileSync(path.join(root,'src/App.css'),'utf8');
const beforeCss=fs.readFileSync(path.join(sourceDir,'before/App.css'),'utf8');
check('Accepted scene CSS, keyboard spacing, controls and responsive scaling are preserved',beforeCss.split(/\r?\n/).filter(line=>line.trim()).every(line=>css.includes(line)));
check('Native controls retain visible keyboard focus and only drum tracks receive new transforms',css.includes('.machine-setting select:focus-visible{outline:2px solid #12343a') && css.includes('.drum-track{transform:translateY(0px)}'));
const pressScenarios=checkPress(createSpinPress,createSpinPressHandlers);
check('Press timing, hold, cancellation, keyboard, click, repeat, races and cleanup pass',pressScenarios.length===11);
const spinMarkup=renderToStaticMarkup(createElement('svg',null,createElement(SpinControl,{onSpin:()=>{}})));
check('SPIN starts released and keeps its native hit target at the accepted coordinates',spinMarkup.includes('data-pressed="false"') && spinMarkup.includes('<foreignObject x="635" y="605" width="298" height="87.638"') && spinMarkup.includes('<button id="spin-control" type="button"'));
check('Moving face contains both lettering and arrow, inside a stationary aperture',/clip-path="url\(#spin-face-aperture\)"[\s\S]*class="spin-face"[\s\S]*id="spin-caption"/.test(spinMarkup));
check('Fixed brass housing preserves the accepted image crop',spinMarkup.includes('<svg x="635" y="605" width="298" height="87.638" viewBox="88 77 1962 577" overflow="hidden">'));
check('Mechanical travel uses 60 ms down / 160 ms return without changing layout',css.includes('transform:translateY(3.5px) scaleY(.985)') && css.includes('transition:transform 160ms') && css.includes('transition-duration:60ms'));
check('Reduced motion removes travel and transitions while retaining pressed shading',css.includes('@media(prefers-reduced-motion:reduce){.spin-face,.spin-socket,.spin-face-shade{transition:none}.spin-mechanism[data-pressed="true"] .spin-face{transform:none}}'));
const pressHook=fs.readFileSync(path.join(root,'src/motion/useSpinPress.ts'),'utf8');
check('Hook binds outside release/blur/visibility and removes every listener on cleanup',['pointerup','pointercancel','keyup','blur','visibilitychange'].every(event=>pressHook.includes(`addEventListener('${event}'`) && pressHook.includes(`removeEventListener('${event}'`)) && pressHook.includes('press.dispose()'));
const drumChecks=await checkDrums({topics,formats,angles,initial,buildPrompt,createSpinPress,createSpinPressHandlers,...compatibility,...drumMotion,...drumController});
const keyScenarios=await checkKeys({...drumMotion,...keyMotion},drumChecks.run.drums);
const wheelScenarios=await checkWheels({...drumMotion,...wheelMotion},drumChecks.run.drums);
const pointerScenarios=await checkPointers({...drumMotion,...pointerMotion,...pointerGeometry},drumChecks.run.drums);
check('Five pointer scenarios cover slow hinged cycles, sequential stops, interruptions, failures and repeated setup',pointerScenarios.length===5);
check('Six pointer heads reuse the original PNG with fixed pins and the accepted frame coordinates',
  pointerGeometry.pointerDefinitions.every(pointer=>machine.includes(`data-drum-pointer="${pointer.id}"`) && machine.includes(`id="pointer-cut-${pointer.id}"`)) &&
  machine.includes('id="cradle-without-pointers"') && machine.includes('<svg x="294" y="333" width="950" height="256.202" viewBox="106 90 1943 524" overflow="hidden">') &&
  [...machine.matchAll(/href="[^"]*mechanism-v2.png"/g)].length===11 &&
  machine.includes('data-layer="drum-pointers" pointer-events="none" aria-hidden="true"') &&
  pointerGeometry.pointerMounts.every(mount=>machine.includes(`data-pointer-pin="${mount.id}"`)));
check('Every pointer region has a continuous background sampled below the heads, without triangular frame holes',
  pointerGeometry.pointerBackgroundPatches.length===4 &&
  pointerGeometry.pointerBackgroundPatches.every(patch=>machine.includes(`data-pointer-background="${patch.id}"`) &&
    machine.includes(`viewBox="${patch.x} ${patch.donorY} ${patch.width} ${patch.donorHeight}"`) && patch.donorY>439) &&
  !machine.match(/<mask id="cradle-without-pointers"[^>]*>[\s\S]*?<\/mask>/)[0].includes('<path') &&
  machine.includes('id="pointer-background-mask"'));
check('Six wheel scenarios cover speed, shared clock, interruption phase, failures and repeated cycles',wheelScenarios.length===6);
const wheelSource=fs.readFileSync(path.join(root,'src/components/scene/WheelRim.tsx'),'utf8');
check('Two masked treads reuse original brass texture, remain decorative and leave fixed PNG geometry intact',
  ['left','right'].every(side=>machine.includes(`id="wheel-rim-${side}-mask"`) && machine.includes(`data-wheel-tread="${side}"`)) &&
  wheelSource.includes('pointerEvents="none"') && wheelSource.includes("artwork['wheel-v1.png']") && wheelSource.includes('maskUnits="userSpaceOnUse"'));
check('Original wheel source and SVG crops remain unchanged apart from the interior tread layer',
  ['left','right'].every(side=>{
    const old=fs.readFileSync(path.join(ref,'machine.svg'),'utf8');
    const group=markup=>{
      const start=markup.indexOf(`<g id="${side}-wheel"`);
      return markup.slice(start,start+markup.length-withoutGroup(markup,`${side}-wheel`).length);
    };
    return canonical(withoutGroup(group(machine),`wheel-rim-${side}`))===canonical(group(old));
  }));
check('Seven secondary-motion scenarios cover timing, interruption, watchdog, failure and cleanup',keyScenarios.length===7);
const movingSource=fs.readFileSync(path.join(root,'src/components/scene/MovingDrums.tsx'),'utf8');
check('MovingDrums selects whole keys, wheel treads and pointers within its own SVG and shares one cleanup',movingSource.includes('ownerSVGElement') && movingSource.includes('g[data-layer="key-${letter}"]') && movingSource.includes('g[data-wheel-tread="${side}"]') && movingSource.includes('g[data-drum-pointer="${pointer.id}"]') && movingSource.includes('undefined, keys, run.id, wheels, pointers)') && movingSource.includes('playback.cancel()'));
check('Each animated key has both artwork and its matching letter in one existing group',keyMotion.decorativeKeyOrder.every(letter=>{
  const start=machine.indexOf(`<g id="key-${letter}"`);
  const length=machine.length-withoutGroup(machine,`key-${letter}`).length;
  const group=machine.slice(start,start+length);
  return group.includes(`data-layer="key-art-${letter}"`) && group.includes('key-v1.png') && new RegExp(`<text[^>]*class="key-letter"[^>]*>${letter}</text>`).test(group) && !/tabindex|<button|role="button"/.test(group);
}));
check('All 19 keys remain decorative and press in two waves before the last drum', [...machine.matchAll(/<g id="key-[A-Z]"/g)].length===19 && keyMotion.keyWaveDelay+keyMotion.keyWaveDuration<2440);
check('Every format participates in real-label transitions with exact prepared landing',drumChecks.transitions===44*44);
check('Ten playback/controller scenarios cover atomic commit, busy guards, fallback and cleanup',drumChecks.scenarios.length===10);
const busyMachine=renderToStaticMarkup(createElement(MachineScene,{...initialMachineProps,run:drumChecks.run,onSpinComplete:()=>{}}));
const busySheet=renderToStaticMarkup(createElement(PromptSheet,{prompt:initial.initialPrompt,disabled:true,spinning:true,revision:0}));
check('Busy scene has three independent masks and preserves old semantic result', [...busyMachine.matchAll(/id="drum-window-(topic|format|angle)"/g)].length===3 && [...busyMachine.matchAll(/class="drum-track"/g)].length===3 && busyMachine.includes(`Current combination: ${initial.initialCombination.topic.label}, ${initial.initialCombination.format.label}, ${initial.initialCombination.angle.label}.`));
check('Busy selects and Copy are natively disabled while SPIN retains focus with aria-disabled', [...busyMachine.matchAll(/<select\b[^>]*disabled=""/g)].length===3 && /<button class="copy-appearance"[^>]*disabled=""/.test(busySheet) && /<button id="spin-control"[^>]*aria-disabled="true"[^>]*aria-busy="true"/.test(busyMachine) && !/<button id="spin-control"[^>]* disabled=""/.test(busyMachine));
check('Old full prompt remains readable and copy status explains the busy state',decode(busySheet.match(/<pre\b[^>]*>([\s\S]*?)<\/pre>/)[1])===initial.initialPrompt && busySheet.includes('Roulette is spinning… Copy will be available when it stops.'));
for(const id of ['reading-language','reading-cefr','reading-length']){
  let calls=0;
  findSelect(MachineSettings({settings:initial.initialSettings,disabled:true,onChange:()=>calls++}),id).props.onChange({target:{value:id==='reading-language'?'ru':id==='reading-cefr'?'A1':'long'}});
  assert.equal(calls,0);
}
check('Disabled control handlers reject settings changes independently of native disabled',true);
const copyHook=fs.readFileSync(path.join(root,'src/clipboard/usePromptCopy.ts'),'utf8');
check('Copy is invalidated on spin start/end and identical-result revisions',copyHook.includes('if (disabled) { copier.cancel(); setStatus(\'idle\') }') && copyHook.includes('[copier, prompt, disabled, revision]'));
const spinHook=fs.readFileSync(path.join(root,'src/motion/useDrumSpin.ts'),'utf8');
check('Interrupt handlers bind and clean up visibility, width, orientation and reduced motion',['resize','orientationchange','visibilitychange','change'].every(event=>spinHook.includes(`addEventListener('${event}'`) && spinHook.includes(`removeEventListener('${event}'`)) && spinHook.includes('Math.abs(nextWidth - width) >= 2') && spinHook.includes('controller.dispose()'));
fs.writeFileSync(path.join(dir,'busy-markup.html'),busyMachine+busySheet+'\n');
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
// One valid representative of every format at C2, plus all catalog labels.
const fullSettings={...initial.initialSettings,cefrLevel:'C2',textLength:'medium'};
const allAllowed=compatibility.enumerateCombinations({...fullSettings,textLength:'short'});
for(const format of formats){
  const combination=allAllowed.find(c=>c.format.id===format.id);
  assert.ok(combination,`Uncovered format ${format.id}`);
  const settings={...fullSettings,textLength:format.lengths.includes('medium')?'medium':'short'};
  let activations=0;
  const onSpin=()=>activations++;
  const control=findComponent(MachineScene({...initialMachineProps,settings,combination,onSpin}),SpinControl);
  const handlers=createSpinPressHandlers(createSpinPress(()=>{}),control.props.onSpin);
  handlers.onClick();handlers.onClick();assert.equal(activations,2);
  const rendered=renderToStaticMarkup(createElement(MachineScene,{...initialMachineProps,settings,combination,onSpin}));
  for(const field of ['topic','format','angle']){
    const group=rendered.match(new RegExp(`<g data-drum-field="${field}" data-selected-value="([^"]+)">([\\s\\S]*?)</g>`));
    assert.equal(decode(group[1]),combination[field].label);
    const texts=[...group[2].matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)].map(m=>[...m[1].matchAll(/<tspan\b[^>]*>([^<]+)<\/tspan>/g)].map(m=>decode(m[1])).join(' '));
    assert.equal(texts[1],combination[field].label);
    assert.equal(texts.length,3);
  }
  const prompt=buildPrompt(settings,combination);
  const sheet=renderToStaticMarkup(createElement(PromptSheet,{prompt}));
  assert.equal(decode(sheet.match(/<pre\b[^>]*>([\s\S]*?)<\/pre>/)[1]),prompt);
  spinExamples.push({topic:combination.topic.id,format:format.id,angle:combination.angle.id});spinCases++;
}
const typography=await import('../implementation-step10-v10/label-checks.mjs');
const labelChecks=await typography.checkLabels(root,[...topics,...formats,...angles]);
check('All 100 catalog labels retain their words and fit two planned lines',labelChecks===100);
check('All 44 formats pass the real button wiring, selected labels and complete prompt',spinCases===44);
check('Repeated identical button activations remain accepted',spinExamples.length===44);
check('Settings use the shared compatibility predicate rather than preserving forbidden starter combinations',scenarios===495);
check('SPIN focus remains on a fixed native hit target',css.includes('.spin-control button:focus-visible{outline:3px solid #ffe7ba') && !/\btransform\s*:/.test(css.match(/\.spin-control button\{[^}]*\}/)[0]));
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
for(const cefrLevel of Object.keys(cefrLevels))for(const textLength of Object.keys(textLengths)){
  const settings={...initial.initialSettings,cefrLevel,textLength};
  const combinations=compatibility.enumerateCombinations(settings);
  for(const combination of formats.map(f=>combinations.find(c=>c.format.id===f.id)).filter(Boolean))for(const language of languages){
    const prompt=buildPrompt({...settings,language},combination);
    allPromptsCopier.reset(prompt);await allPromptsCopier.copy();assert.equal(writeCalls.at(-1),prompt);copiedPromptCases++;
  }
}
check('Clipboard async races, rejection, retry, duplicate activation, unmount and missing API pass',copyScenarios.length===9);
check('All available format/level/length/language representatives copy without truncation',copiedPromptCases>13365 && writeCalls.length===copiedPromptCases);
check('Production retains native control focus and responsive machine scaling',productionCss.includes('select:focus-visible') && /\.scene-artboard>svg\{[^}]*width:100%[^}]*height:auto/.test(productionCss));
check('Production uses the GitHub Pages base',builtIndex.includes('/reading-roulette/assets/') && !builtIndex.includes('/src/'));
check('Production preserves all image and font bytes',hashes.filter(item=>!item.file.endsWith('.txt')).every(item=>builtFiles.some(file=>hash(fs.readFileSync(path.join(dist,'assets',file)))===item.sha256)));
const urls=['http://127.0.0.1:5173/','http://127.0.0.1:5173/src/components/scene/MachineSettings.tsx','http://127.0.0.1:5173/src/App.css?direct','http://127.0.0.1:5174/reading-roulette/',...builtFiles.map(file=>'http://127.0.0.1:5174/reading-roulette/assets/'+file)];
const http=await Promise.all(urls.map(async url=>{const response=await fetch(url);assert.equal(response.status,200,url);return {url,status:response.status,bytes:(await response.arrayBuffer()).byteLength};}));
fs.writeFileSync(path.join(dir,'react-markup.html'),html+'\n');
const report={date:'2026-10-11',stage:10,mechanicalRegressionFromStage:9,skippedStage:3,checksPassed:checks.length,checks,pointerScenarios,wheelScenarios,keyScenarios,keyWave:{keys:keyMotion.decorativeKeyOrder,travel:keyMotion.keyTravel,firstDelay:keyMotion.keyWaveDelay,stagger:keyMotion.keyWaveStagger,lastEnd:keyMotion.keyWaveDelay+keyMotion.keyWaveDuration},drumScenarios:drumChecks.scenarios,drumTransitions:drumChecks.transitions,pressScenarios,copyScenarios,copiedPromptCases,spinCases,spinPromptCases,spinExamples,settingScenarios:scenarios,proseCases,structuralCases,languages:languages.length,cefrLevels:Object.keys(cefrLevels).length,lengths:Object.keys(textLengths).length,http,hashes,browser:{status:'unverified',reason:'In-app Browser failed with EPERM realpath browser-client.mjs. Motion tests use fake clocks and Animation objects; clipboard uses test writers and a stub navigator. Tests do not verify browser rendering/fps, native event dispatch, live React DOM updates, touch behavior, focus or system clipboard.'}};
fs.writeFileSync(path.join(dir,'mechanical-verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({checksPassed:checks.length,pointerScenarios:pointerScenarios.length,wheelScenarios:wheelScenarios.length,keyScenarios:keyScenarios.length,drumScenarios:drumChecks.scenarios.length,drumTransitions:drumChecks.transitions,pressScenarios:pressScenarios.length,copyScenarios:copyScenarios.length,copiedPromptCases,spinCases,settingScenarios:scenarios,httpResources:http.length,browser:report.browser.status},null,2));
