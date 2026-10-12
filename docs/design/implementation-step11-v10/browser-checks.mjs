// Real Chromium DOM, Web Animations, pointer/keyboard and emulated touch checks.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';

const dir=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(dir,'../../..');
const outputDir=process.env.READING_TEST_OUTPUT_DIR?path.resolve(process.env.READING_TEST_OUTPUT_DIR):dir;
fs.mkdirSync(outputDir,{recursive:true});
const url=process.env.READING_TEST_URL??'http://127.0.0.1:5173/';
const {chromium}=await import(process.env.READING_PLAYWRIGHT_MODULE?pathToFileURL(process.env.READING_PLAYWRIGHT_MODULE).href:'playwright');
const checks=[],errors=[],layouts=[];
const check=(name,condition)=>{assert.ok(condition,name);checks.push(name);};
const browser=await chromium.launch({headless:true});
const record=page=>{
 page.on('pageerror',error=>errors.push(error.message));
 page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
};
async function load(page){record(page);await page.goto(url);await page.evaluate(()=>document.fonts.ready);}
const spin=page=>page.locator('#spin-control');
const idle=page=>page.waitForFunction(()=>document.querySelector('.reading-scene').dataset.spinning==='false');
async function consistent(page,name){
 const state=await page.evaluate(()=>({
  spinning:document.querySelector('.reading-scene').dataset.spinning,
  values:[...document.querySelectorAll('[data-drum-field]')].map(e=>[e.dataset.drumField,e.dataset.selectedValue]),
  prompt:document.querySelector('#reading-prompt').textContent,
  copy:document.querySelector('.copy-appearance').disabled,
  settings:[...document.querySelectorAll('select')].every(e=>!e.disabled),
  busy:document.querySelector('#spin-control').getAttribute('aria-busy'),
  animations:document.getAnimations().filter(a=>a.effect?.target?.closest('svg') && !a.effect.target.closest('.spin-mechanism')).length,
 }));
 check(`${name}: one complete result matches the prompt`,state.values.length===3 && state.values.every(([field,value])=>state.prompt.includes(`${field[0].toUpperCase()+field.slice(1)}: ${value}.`)));
 check(`${name}: controls and animations reset`,state.spinning==='false' && !state.copy && state.settings && state.busy==='false' && state.animations===0);
 return state;
}
async function layout(page,name){
 // A resize returns before the matchMedia change event and React commit necessarily run.
 await page.waitForFunction(() => !!document.querySelector('.compact-machine') === window.matchMedia('(max-width: 900px)').matches);
 const state=await page.evaluate(()=>{
  const sheet=document.querySelector('.prompt-sheet'),prompt=document.querySelector('#reading-prompt');
  const rect=e=>e.getBoundingClientRect().toJSON();
  return {viewport:{width:innerWidth,height:innerHeight},documentWidth:document.documentElement.scrollWidth,
   sheet:rect(sheet),body:rect(document.querySelector('.paper-body')),tear:rect(document.querySelector('.paper-tear')),
   prompt:{width:prompt.clientWidth,scrollWidth:prompt.scrollWidth,font:parseFloat(getComputedStyle(prompt).fontSize),line:parseFloat(getComputedStyle(prompt).lineHeight)},
   controls:[...document.querySelectorAll('select,#spin-control,.copy-appearance,#help-button')].map(e=>({id:e.id||e.className,...rect(e)})),
   compact:!!document.querySelector('.compact-machine'),
   ids:[...document.querySelectorAll('[id]')].map(e=>e.id),
  };
 });
 check(`${name}: page and prompt have no horizontal overflow`,state.documentWidth<=state.viewport.width+1 && state.prompt.scrollWidth<=state.prompt.width+1);
 check(`${name}: prompt is at least 16px with readable line spacing`,state.prompt.font>=16 && state.prompt.line>=state.prompt.font*1.5);
 check(`${name}: paper body and torn edge share their width`,Math.abs(state.body.width-state.tear.width)<.1 && Math.abs(state.body.left-state.tear.left)<.1 && Math.abs(state.tear.top-state.body.bottom+8)<.2);
 check(`${name}: each live control is within the page width`,state.controls.every(r=>r.left>=0 && r.right<=state.viewport.width+.5));
 check(`${name}: controls have unique IDs`,new Set(state.ids).size===state.ids.length);
 check(`${name}: compact layout follows the available width`,state.compact===(state.viewport.width<=900));
 if(state.compact)check(`${name}: all compact controls have 44px touch targets`,state.controls.every(r=>r.height>=44));
 layouts.push({name,...state});
}

try {
 const page=await browser.newPage({viewport:{width:1366,height:900}});await load(page);
 for(const [width,height] of [[320,568],[390,844],[768,1024],[900,700],[901,700],[1024,768],[1366,900],[1536,864],[1920,1080],[2560,1080],[844,390]]){
  await page.setViewportSize({width,height});await layout(page,`${width}x${height}`);
 }
 for(const width of [390,1366]){
  await page.setViewportSize({width,height:900});
  await page.goto(url);await page.evaluate(()=>document.fonts.ready);
  for(const id of ['help-button','reading-language','reading-cefr','reading-length','spin-control']){
   await page.locator(`#${id}`).focus();
   // Tab then Shift+Tab makes the focus modality unambiguously keyboard-driven.
   await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
   check(`${width}: ${id} has a visible keyboard outline`,await page.locator(`#${id}`).evaluate(e=>e.matches(':focus-visible') && parseFloat(getComputedStyle(e).outlineWidth)>=2));
  }
  const before=await page.locator('#reading-prompt').textContent();
  const box=await spin(page).boundingBox();
  await spin(page).click();
  check(`${width}: SPIN starts real animations`,await page.evaluate(()=>document.querySelector('.reading-scene').dataset.spinning==='true' && document.getAnimations().length>=3));
  const targets=await page.locator('.drum-track').evaluateAll(nodes=>nodes.map(n=>n.dataset.targetValue));
  check(`${width}: prompt waits for the complete spin`,await page.locator('#reading-prompt').textContent()===before && await page.locator('.copy-appearance').isDisabled());
  for(let n=0;n<12;n++)await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
  await idle(page);
  let state=await consistent(page,`${width} rapid clicks`);
  check(`${width}: rapid clicks prepare exactly one spin`,await page.locator('main>p[role="status"]').innerText().then(text=>text.startsWith('Spin 1:')));
  check(`${width}: all prepared targets land together`,JSON.stringify(state.values.map(([,value])=>value))===JSON.stringify(targets));
  await spin(page).focus();await page.keyboard.down('Enter');
  for(let n=0;n<8;n++)await page.keyboard.down('Enter');
  await page.keyboard.up('Enter');await idle(page);
  check(`${width}: held Enter prepares one additional spin`,await page.locator('main>p[role="status"]').innerText().then(text=>text.startsWith('Spin 2:')));
  await consistent(page,`${width} held Enter`);
  await page.locator('#reading-prompt').focus();await page.keyboard.press('Control+a');
  check(`${width}: manual selection covers exactly the prompt`,await page.evaluate(()=>getSelection().toString()===document.querySelector('#reading-prompt').textContent));
  await page.keyboard.press('ArrowRight');
  await page.getByRole('button',{name:'How to use',exact:true}).click();
  await page.keyboard.press('Escape');
  check(`${width}: help restores focus without losing controls`,await page.locator('#help-button').evaluate(e=>document.activeElement===e));
 }

 for(const [name,from,to] of [['height only',[1366,900],[1366,700]],['desktop to compact',[1366,900],[390,844]],['compact to desktop',[390,844],[1366,900]],['orientation',[390,844],[844,390]]]){
  await page.setViewportSize({width:from[0],height:from[1]});await spin(page).click();
  const targets=await page.locator('.drum-track').evaluateAll(nodes=>nodes.map(n=>n.dataset.targetValue));
  await page.setViewportSize({width:to[0],height:to[1]});await idle(page);
  const state=await consistent(page,`${name} interruption`);
  check(`${name}: resize keeps the prepared result`,JSON.stringify(state.values.map(([,value])=>value))===JSON.stringify(targets));
  await page.waitForFunction(()=>document.activeElement?.id==='spin-control');
  check(`${name}: keyboard focus stays on SPIN`,await page.locator('#spin-control').evaluate(e=>document.activeElement===e));
 }
 await page.emulateMedia({reducedMotion:'reduce'});await spin(page).click();await idle(page);
 await consistent(page,'Reduced motion from the start');
 check('Reduced motion creates no mechanical animations',await page.locator('.drum-track').count()===0 && await page.evaluate(()=>document.getAnimations().length===0));
 await page.emulateMedia({reducedMotion:'no-preference'});await spin(page).click();
 await page.emulateMedia({reducedMotion:'reduce'});await idle(page);await consistent(page,'Reduced motion enabled mid-spin');
 await page.emulateMedia({reducedMotion:'no-preference'});

 await page.evaluate(()=>{window.originalAnimate=SVGElement.prototype.animate;SVGElement.prototype.animate=function(){throw new Error('Test animation failure');};});
 await spin(page).click();await idle(page);await consistent(page,'Animation API failure');
 await page.evaluate(()=>{SVGElement.prototype.animate=window.originalAnimate;});
 await page.evaluate(()=>{SVGElement.prototype.animate=function(...args){const animation=window.originalAnimate.apply(this,args);animation.pause();return animation;};});
 await spin(page).click();await idle(page);await consistent(page,'Real watchdog with paused animations');
 await page.evaluate(()=>{SVGElement.prototype.animate=window.originalAnimate;delete window.originalAnimate;});

 // Render every real catalog label with the actual component; measure real glyphs.
 const server=await createServer({root,server:{middlewareMode:true,hmr:false},appType:'custom'});
 let markup;
 try {
  const [{DrumLabel},{topics},{formats},{angles}]=await Promise.all([
   server.ssrLoadModule('/src/components/scene/DrumLabel.tsx'),server.ssrLoadModule('/src/data/topics.ts'),
   server.ssrLoadModule('/src/data/formats.ts'),server.ssrLoadModule('/src/data/angles.ts'),
  ]);
  markup=[...topics,...formats,...angles].flatMap(item=>[true,false].map(selected=>renderToStaticMarkup(createElement(DrumLabel,{label:item.label,x:505,y:489,selected,angle:angles.includes(item)})))).join('');
 } finally {await server.close();}
 const widths=await page.evaluate(markup=>{
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('style','position:absolute;left:0;top:0;visibility:hidden;font-family:Georgia,"Times New Roman",serif');
  svg.innerHTML=markup;document.body.append(svg);
  for(const e of svg.querySelectorAll('.selected'))e.style.fontWeight='700';
  const widths=[...svg.querySelectorAll('text')].map(e=>({label:e.getAttribute('aria-label'),selected:e.classList.contains('selected'),width:e.getBBox().width}));svg.remove();return widths;
 },markup);
 check('All 100 catalog labels fit the real 234px drum windows',widths.length===200 && widths.every(item=>item.width<=214));
 fs.writeFileSync(path.join(outputDir,'label-widths.json'),JSON.stringify(widths,null,2)+'\n');

 const touch=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
 const phone=await touch.newPage();await load(phone);
 await phone.locator('#spin-control').tap();await idle(phone);await consistent(phone,'Emulated phone tap');
 await phone.getByRole('button',{name:'How to use',exact:true}).tap();
 await phone.getByRole('button',{name:'Close instructions'}).tap();
 check('Emulated touch can open and close help',await phone.locator('#help-button').getAttribute('aria-expanded')==='false');
 await phone.locator('#reading-language').selectOption('ru');
 check('Touch layout uses the updated prompt',await phone.locator('#reading-prompt').textContent().then(text=>text.includes('entirely in Russian')));
 await layout(phone,'390 touch');await phone.screenshot({path:path.join(outputDir,'mobile-390.png'),fullPage:true});
 await phone.setViewportSize({width:320,height:568});await layout(phone,'320 touch');await phone.screenshot({path:path.join(outputDir,'mobile-320.png'),fullPage:true});
 await phone.screenshot({path:path.join(outputDir,'mobile-320-top.png')});
 await touch.close();

 await page.setViewportSize({width:1536,height:1000});await page.goto(url);await page.evaluate(()=>document.fonts.ready);
 await page.screenshot({path:path.join(outputDir,'desktop-1536.png'),fullPage:true});
 await page.screenshot({path:path.join(outputDir,'desktop-top.png')});
 await page.locator('.paper-tear').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(outputDir,'paper-bottom.png')});
 await page.locator('#reading-cefr').selectOption('A1');
 check('An incompatible setting clears the result and disables Copy',await page.locator('.copy-appearance').isDisabled() && await page.locator('[data-selected-value="Press SPIN"]').count()===3);
 await spin(page).click();await idle(page);await consistent(page,'Recovery after invalid settings');
 check('No browser console or page errors',errors.length===0);
 const report={date:'2026-10-12',url,browser:'Headless Chromium',version:browser.version(),checksPassed:checks.length,checks,layouts,errors,nativeChecks:'native-verification.json',limits:['Emulated phone, not a physical device','Native tab visibility, browser zoom and Windows clipboard are checked separately in the headed test browser']};
 fs.writeFileSync(path.join(outputDir,'browser-verification.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({checksPassed:checks.length,layouts:layouts.length,errors:errors.length,version:browser.version()},null,2));
} finally {await browser.close();}
