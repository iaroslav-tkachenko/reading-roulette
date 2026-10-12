// User-authorized, separate headed Chromium: native zoom, visibility and Windows clipboard.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {openNativeBrowser} from './native-browser.mjs';
const dir=path.dirname(fileURLToPath(import.meta.url));
const url=process.env.READING_TEST_URL??'http://127.0.0.1:5173/';
const native=await openNativeBrowser();
const {browser,context,worker}=native;
context.setDefaultTimeout(15000);
const checks=[],errors=[],zoom=[],clipboard=[];
const check=(name,condition)=>{assert.ok(condition,name);checks.push(name);};
const normal=text=>text.replaceAll('\r\n','\n');
const idle=page=>page.waitForFunction(()=>document.querySelector('.reading-scene').dataset.spinning==='false',null,{polling:50,timeout:6000});
async function ready(page,name){
 const state=await page.evaluate(()=>({
  values:[...document.querySelectorAll('[data-drum-field]')].map(e=>[e.dataset.drumField,e.dataset.selectedValue]),
  prompt:document.querySelector('#reading-prompt').textContent,
  settings:[...document.querySelectorAll('select')].every(e=>!e.disabled),
  copy:document.querySelector('.copy-appearance').disabled,
  busy:document.querySelector('#spin-control').getAttribute('aria-busy'),
  animations:document.getAnimations().filter(a=>a.effect?.target?.closest('svg') && !a.effect.target.closest('.spin-mechanism')).length,
 }));
 check(`${name}: coherent result and prompt`,state.values.length===3 && state.values.every(([field,value])=>state.prompt.includes(`${field[0].toUpperCase()+field.slice(1)}: ${value}.`)));
 check(`${name}: all controls recover`,state.settings && !state.copy && state.busy==='false' && state.animations===0);
}
function systemClipboard(){
 const result=spawnSync('powershell.exe',['-NoProfile','-NonInteractive','-STA','-Command','[Console]::OutputEncoding=[System.Text.Encoding]::UTF8; $text=Get-Clipboard -Raw; [Console]::Write($text)'],{encoding:'utf8',windowsHide:true});
 assert.equal(result.status,0,result.stderr);return normal(result.stdout);
}
async function copyAndCheck(page,name){
 const expected=await page.locator('#reading-prompt').textContent();
 await page.getByRole('button',{name:'Copy prompt',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('#copy-status').dataset.copyStatus==='success');
 const actual=systemClipboard();
 check(`${name}: real Windows clipboard contains the full prompt`,actual===normal(expected));
 clipboard.push({name,characters:expected.length,sha256:createHash('sha256').update(normal(actual)).digest('hex'),windowsClipboardMatched:true});
}
try {
 const page=context.pages()[0]??await context.newPage();
 page.on('pageerror',error=>errors.push(error.message));
 page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
 await page.goto(url);await page.evaluate(()=>document.fonts.ready);
 const tab=await worker.evaluate(async url=>(await chrome.tabs.query({})).find(tab=>tab.url===url),url);
 assert.ok(tab?.id,'The isolated application tab exists');
 await worker.evaluate(id=>chrome.windows.update(id,{state:'normal',focused:true}),tab.windowId);
 await page.bringToFront();
 const cdp=await context.newCDPSession(page);
 for(const factor of [.8,1,1.25,1.5,2]){
  await worker.evaluate(id=>chrome.windows.update(id,{state:'normal',focused:true}),tab.windowId);
  await worker.evaluate(async({id,factor})=>{await chrome.tabs.setZoom(id,factor);},{id:tab.id,factor});
  await page.bringToFront();
  await page.waitForFunction(()=>!!document.querySelector('.compact-machine')===window.matchMedia('(max-width: 900px)').matches,null,{polling:50});
  const actual=await worker.evaluate(id=>chrome.tabs.getZoom(id),tab.id);
  await page.waitForFunction(()=>document.fonts.status==='loaded');
  const state=await page.evaluate(()=>{
   const prompt=document.querySelector('#reading-prompt');
   return {width:innerWidth,height:innerHeight,dpr:devicePixelRatio,documentWidth:document.documentElement.scrollWidth,
    compact:!!document.querySelector('.compact-machine'),promptWidth:prompt.clientWidth,promptScrollWidth:prompt.scrollWidth,
    controls:[...document.querySelectorAll('select,#spin-control,.copy-appearance,#help-button')].map(e=>e.getBoundingClientRect().toJSON())};
  });
  check(`${factor*100}%: native browser zoom is applied`,Math.abs(actual-factor)<.001);
  check(`${factor*100}%: page and prompt reflow without horizontal overflow`,state.documentWidth<=state.width+1 && state.promptScrollWidth<=state.promptWidth+1);
  check(`${factor*100}%: the responsive scene follows the real viewport`,state.compact===(state.width<=900));
  check(`${factor*100}%: controls stay inside the viewport`,state.controls.every(r=>r.left>=0 && r.right<=state.width+.5));
  await page.bringToFront();
  await page.locator('#spin-control').click({force:true});await idle(page);await ready(page,`${factor*100}% SPIN`);
  zoom.push({factor,actual,...state});
  console.log(`Native zoom ${factor*100}% passed`);
  if(factor===2)await page.screenshot({path:path.join(dir,'native-zoom-200.png')});
 }
 await worker.evaluate(id=>chrome.tabs.setZoom(id,1),tab.id);
 await page.locator('#spin-control').click();
 check('Native tab switch starts during real SPIN',await page.locator('.drum-track').count()===3);
 const targets=await page.locator('.drum-track').evaluateAll(nodes=>nodes.map(n=>n.dataset.targetValue));
 const other=await worker.evaluate(async tab=>await chrome.tabs.create({windowId:tab.windowId,url:'about:blank',active:true}),tab);
 await page.waitForFunction(()=>document.hidden,null,{polling:50});
 await idle(page);
 check('A real inactive tab produces document.hidden',await page.evaluate(()=>document.visibilityState==='hidden'));
 await worker.evaluate(id=>chrome.tabs.update(id,{active:true}),tab.id);
 await page.waitForFunction(()=>!document.hidden,null,{polling:50});await ready(page,'Return from hidden tab');
 check('Hidden-tab finish preserves all prepared targets',JSON.stringify(await page.locator('[data-drum-field]').evaluateAll(nodes=>nodes.map(n=>n.dataset.selectedValue)))===JSON.stringify(targets));
 await worker.evaluate(id=>chrome.tabs.remove(id),other.id);
 await page.locator('#spin-control').click();await idle(page);await ready(page,'Spin after returning to the tab');

 await copyAndCheck(page,'Current English prompt');
 await page.locator('#reading-language').selectOption('ru');
 check('Changing settings clears the previous Copy-success',await page.locator('#copy-status').getAttribute('data-copy-status')==='idle');
 await copyAndCheck(page,'Updated Russian prompt');
 // Paste through the operating system into a separate native tab.
 const pastePage=await context.newPage();await pastePage.setContent('<label for="paste">Clipboard paste check</label><textarea id="paste"></textarea>');
 await pastePage.bringToFront();await pastePage.locator('#paste').focus();await pastePage.keyboard.press('Control+v');
 check('Actual Ctrl+V pastes the complete copied prompt',normal(await pastePage.locator('#paste').inputValue())===normal(await page.locator('#reading-prompt').textContent()));
 await pastePage.close();await worker.evaluate(id=>chrome.tabs.update(id,{active:true}),tab.id);
 await page.locator('#reading-cefr').selectOption('C2');await page.locator('#reading-length').selectOption('long');
 await page.locator('#spin-control').click();await idle(page);await copyAndCheck(page,'Long C2 prompt after SPIN');

 // Native permission denial exercises the product's manual-copy fallback.
 await cdp.send('Browser.setPermission',{permission:{name:'clipboard-write'},setting:'denied',origin:new URL(url).origin});
 await page.getByRole('button',{name:'Copy prompt',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('#copy-status').dataset.copyStatus==='error');
 check('Denied Clipboard API reports a manual-copy fallback',await page.locator('#copy-status').textContent().then(text=>text.includes('Select the prompt')));
 await page.locator('#reading-prompt').focus();await page.keyboard.press('Control+a');await page.keyboard.press('Control+c');
 check('Keyboard fallback copies exactly the prompt to Windows',systemClipboard()===normal(await page.locator('#reading-prompt').textContent()));
 await page.keyboard.press('ArrowRight');
 await cdp.send('Browser.setPermission',{permission:{name:'clipboard-write'},setting:'granted',origin:new URL(url).origin});
 await copyAndCheck(page,'Retry after clipboard permission recovery');

 check('No native browser console or page errors',errors.length===0);
 const report={date:'2026-10-12',url,browser:'Isolated headed Chromium',version:browser.version(),checksPassed:checks.length,checks,zoom,clipboard,errors,visibility:'Actual native tab switch, no document.hidden override or synthetic visibility event',zoomMethod:'chrome.tabs.setZoom; confirmed with getZoom and actual viewport/DPR',clipboardMethod:'Native button click -> navigator.clipboard.writeText -> Windows Get-Clipboard; real Ctrl+V into another tab; only CRLF normalized',limits:['Windows Chromium only','Physical mobile devices, Safari and screen-reader reading are not covered']};
 fs.writeFileSync(path.join(dir,'native-verification.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({checksPassed:checks.length,zoom:zoom.map(z=>z.factor),clipboardCases:clipboard.length,errors:errors.length,version:browser.version()},null,2));
} catch(error) {
 console.error('Completed native checks:',checks);
 const page=context.pages().find(page=>page.url()===url);
 if(page)console.error('Native page state:',await page.evaluate(()=>({hidden:document.hidden,focus:document.hasFocus(),width:innerWidth,height:innerHeight,button:document.querySelector('#spin-control')?.getBoundingClientRect().toJSON()})).catch(()=>null));
 throw error;
} finally {await native.close();}
