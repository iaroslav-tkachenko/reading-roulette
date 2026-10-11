// Real DOM/event/layout checks in headless Chromium, including emulated touch.
// Set READING_PLAYWRIGHT_MODULE to an installed playwright or playwright-core entrypoint.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir=path.dirname(fileURLToPath(import.meta.url));
const modulePath=process.env.READING_PLAYWRIGHT_MODULE;
const {chromium}=await import(modulePath?pathToFileURL(modulePath).href:'playwright');
const url=process.env.READING_TEST_URL??'http://127.0.0.1:5173/';
const browser=await chromium.launch({headless:true});
const checks=[];
const errors=[];
const layouts=[];
const check=(name,condition)=>{assert.ok(condition,name);checks.push(name);};
const recordErrors=page=>{
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
};
async function load(page){
  recordErrors(page);
  await page.goto(url);
  await page.evaluate(()=>document.fonts.ready);
  await page.getByRole('button',{name:'How to use',exact:true}).waitFor();
}
const readScene=page=>page.evaluate(()=>({
  boxes:['.scene-artboard','.scene-artboard>svg','.prompt-sheet','#settings-panel','#chassis'].map(selector=>{
    const rect=document.querySelector(selector).getBoundingClientRect();
    return [selector,rect.x,rect.y,rect.width,rect.height];
  }),
  scroll:[scrollX,scrollY],
  settings:[...document.querySelectorAll('select')].map(select=>select.value),
  prompt:document.querySelector('#reading-prompt').textContent,
}));
async function assertClosed(page,name){
  await page.getByRole('dialog').waitFor({state:'hidden'});
  // Native dialog.close() queues its close event; wait for the controlled UI to settle.
  await page.waitForFunction(()=>document.querySelector('#help-button').getAttribute('aria-expanded')==='false' && document.activeElement?.id==='help-button');
  check(`${name}: focus returns to How to use`,await page.evaluate(()=>document.activeElement?.id==='help-button'));
  check(`${name}: expanded state resets`,await page.locator('#help-button').getAttribute('aria-expanded')==='false');
  check(`${name}: scroll lock is removed`,await page.evaluate(()=>document.documentElement.style.overflow===''));
}
async function checkLayout(page,width,height){
  const layout=await page.evaluate(()=>{
    const card=document.querySelector('.how-to-card');
    const content=document.querySelector('.how-to-content');
    const close=document.querySelector('.how-to-close');
    return {card:card.getBoundingClientRect().toJSON(),close:close.getBoundingClientRect().toJSON(),content:{width:content.clientWidth,scrollWidth:content.scrollWidth,height:content.clientHeight,scrollHeight:content.scrollHeight},viewport:{width:innerWidth,height:innerHeight}};
  });
  check(`${width}x${height}: card fits inside viewport`,layout.card.left>=0 && layout.card.top>=0 && layout.card.right<=width+.5 && layout.card.bottom<=height+.5);
  check(`${width}x${height}: instructions have no horizontal overflow`,layout.content.scrollWidth<=layout.content.width+1);
  check(`${width}x${height}: fact values fit their columns`,await page.locator('.how-to-facts').evaluate(element=>[...element.querySelectorAll('dd')].every(value=>value.scrollWidth<=value.clientWidth+1)));
  check(`${width}x${height}: close target is at least 44px`,layout.close.width>=44 && layout.close.height>=44);
  await page.locator('.how-to-content').evaluate(element=>{element.scrollTop=element.scrollHeight;});
  check(`${width}x${height}: final step can be reached`,await page.evaluate(()=>{
    const content=document.querySelector('.how-to-content');
    const step=document.querySelector('.how-to-steps li:last-child').getBoundingClientRect();
    const rect=content.getBoundingClientRect();
    return step.bottom<=rect.bottom+1 && step.top>=rect.top-1;
  }));
  check(`${width}x${height}: close remains visible while content scrolls`,await page.getByRole('button',{name:'Close instructions'}).isVisible());
  layouts.push(layout);
}

try{
  const page=await browser.newPage({viewport:{width:1366,height:900}});
  await load(page);
  const help=page.getByRole('button',{name:'How to use',exact:true});
  const close=page.getByRole('button',{name:'Close instructions'});
  check('Instructions start closed',await page.getByRole('dialog').count()===0);
  const initial=await readScene(page);
  await help.click();
  await page.getByRole('dialog',{name:'Read with confidence'}).waitFor();
  check('Opening focuses the close button',await close.evaluate(element=>element===document.activeElement));
  check('Opening preserves all scene boxes, settings, prompt and scroll position',JSON.stringify(initial)===JSON.stringify(await readScene(page)));
  const text=await page.locator('.how-to-content').innerText();
  check('Reading introduction retains all four exams', ['IELTS','Goethe-Zertifikat','DELE','DELF'].every(value=>text.includes(value)));
  check('Facts retain their values and labels',JSON.stringify(await page.locator('.how-to-facts>div').allTextContents())===JSON.stringify(['Languages11','LevelsA1 to C2','Reading ideas4,300+']));
  check('How to use labels the three steps',await page.getByRole('heading',{name:'How to use',level:3}).count()===1 && await page.locator('.how-to-steps li').count()===3);
  check('Introduction uses regular weight',await page.locator('.how-to-lead').evaluate(element=>getComputedStyle(element).fontWeight)==='400');
  check('Fact labels use regular weight and fit their columns',await page.locator('.how-to-facts').evaluate(element=>[...element.querySelectorAll('dt')].every(label=>getComputedStyle(label).fontWeight==='400') && [...element.querySelectorAll('dd')].every(value=>value.scrollWidth<=value.clientWidth+1)));
  check('Copy has no links or long dashes',await page.locator('dialog a').count()===0 && !/[\u2013\u2014]/.test(text));
  await page.keyboard.press('Tab');
  check('Tab reaches the scrollable instructions',await page.locator('.how-to-content').evaluate(element=>element===document.activeElement));
  await page.keyboard.press('Tab');
  check('Tab wraps to the close button',await close.evaluate(element=>element===document.activeElement));
  await page.keyboard.press('Shift+Tab');
  check('Shift+Tab wraps back to the instructions',await page.locator('.how-to-content').evaluate(element=>element===document.activeElement));
  await page.locator('#reading-language').evaluate(element=>element.focus());
  check('Native modal prevents focus entering background controls',await page.evaluate(()=>document.activeElement?.closest('dialog')!==null));
  await page.locator('.how-to-lead').click();
  check('Clicking inside the card keeps it open',await page.locator('dialog').evaluate(element=>element.open));
  const card=await page.locator('.how-to-card').boundingBox();
  await page.mouse.move(card.x+50,card.y+130);
  await page.mouse.down();
  await page.mouse.move(3,3,{steps:6});
  await page.mouse.up();
  check('Dragging from the card to the backdrop does not dismiss it',await page.locator('dialog').evaluate(element=>element.open));
  await page.evaluate(()=>getSelection()?.removeAllRanges());
  await page.keyboard.press('Escape');
  await assertClosed(page,'Escape');
  check('Escape preserves the scene and reading state',JSON.stringify(initial)===JSON.stringify(await readScene(page)));
  await help.click();await close.click();await assertClosed(page,'Cross');
  await help.click();await page.mouse.click(4,4);await assertClosed(page,'Backdrop');
  await help.focus();await page.keyboard.press('Enter');await close.waitFor();
  check('Enter opens the instructions',await page.locator('dialog').evaluate(element=>element.open));
  await page.keyboard.press('Enter');await assertClosed(page,'Keyboard close');
  await page.keyboard.press('Space');await close.waitFor();
  check('Space opens the instructions',await page.locator('dialog').evaluate(element=>element.open));
  await page.keyboard.press('Escape');await assertClosed(page,'Space then Escape');
  for(let i=0;i<5;i++){await help.click();await close.click();}
  await assertClosed(page,'Repeated open/close');
  await help.click();await page.locator('dialog').evaluate(element=>element.close());
  await assertClosed(page,'Native close event');

  // Opening with keyboard while the long prompt is scrolled must preserve that position.
  await page.evaluate(()=>{scrollTo(0,400);document.querySelector('#help-button').focus({preventScroll:true});});
  const scrolled=await readScene(page);
  await page.keyboard.press('Enter');await close.waitFor();
  check('Opening at a scrolled position preserves geometry and scroll',JSON.stringify(scrolled)===JSON.stringify(await readScene(page)));
  await page.keyboard.press('Escape');await assertClosed(page,'Scrolled close');
  check('Closing restores the same scrolled position',JSON.stringify(scrolled)===JSON.stringify(await readScene(page)));
  await page.evaluate(()=>scrollTo(0,0));

  await page.getByRole('button',{name:'SPIN',exact:true}).click();
  await help.click();
  check('Help can open during a spin',await page.locator('dialog').evaluate(element=>element.open));
  await page.locator('[data-spinning="false"]').waitFor();
  check('Spin completes while help is open',await page.locator('#reading-prompt').innerText()!=='' && await page.locator('dialog').evaluate(element=>element.open));
  await close.click();await assertClosed(page,'Help during SPIN');
  check('SPIN and Copy are available after closing',await page.getByRole('button',{name:'Copy prompt',exact:true}).isEnabled() && await page.getByRole('button',{name:'SPIN',exact:true}).getAttribute('aria-disabled')!=='true');

  for(const [width,height] of [[1366,900],[1536,864],[1920,1080],[768,1024],[390,844],[320,568],[844,390],[640,400]]){
    await page.setViewportSize({width,height});
    await page.evaluate(()=>scrollTo(0,0));
    const before=await readScene(page);
    await help.click();
    check(`${width}x${height}: opening causes no scene shift`,JSON.stringify(before)===JSON.stringify(await readScene(page)));
    await checkLayout(page,width,height);
    if(width===1366 || width===390)await page.screenshot({path:path.join(dir,`how-to-${width}.png`)});
    await close.click();await assertClosed(page,`${width}x${height} close`);
    check(`${width}x${height}: closing causes no scene shift`,JSON.stringify(before)===JSON.stringify(await readScene(page)));
  }

  const mobile=await browser.newPage({viewport:{width:390,height:667},isMobile:true,hasTouch:true,deviceScaleFactor:2});
  await load(mobile);
  await mobile.evaluate(()=>scrollTo(0,280));
  const beforeTouch=await readScene(mobile);
  const mobileHelp=mobile.getByRole('button',{name:'How to use',exact:true});
  check('Mobile trigger has a 44px touch target',await mobileHelp.evaluate(element=>element.getBoundingClientRect().height>=44));
  await mobileHelp.tap();
  await mobile.getByRole('dialog').waitFor();
  check('Touch opening preserves the scrolled scene',JSON.stringify(beforeTouch)===JSON.stringify(await readScene(mobile)));
  await checkLayout(mobile,390,667);
  await mobile.getByRole('button',{name:'Close instructions'}).tap();await assertClosed(mobile,'Touch cross');
  check('Touch close preserves the scrolled scene',JSON.stringify(beforeTouch)===JSON.stringify(await readScene(mobile)));
  await mobileHelp.tap();await mobile.touchscreen.tap(4,4);await assertClosed(mobile,'Touch backdrop');
  await mobile.setViewportSize({width:667,height:390});
  await mobileHelp.tap();await checkLayout(mobile,667,390);
  await mobile.locator('.how-to-content').evaluate(element=>{element.scrollTop=0;});
  await mobile.locator('.how-to-content').focus();
  await mobile.keyboard.press('End');
  await mobile.waitForFunction(()=>{const element=document.querySelector('.how-to-content');return element.scrollTop>0;});
  check('Keyboard can scroll short-screen instructions',await mobile.locator('.how-to-content').evaluate(element=>element.scrollTop>0));
  await mobile.screenshot({path:path.join(dir,'how-to-landscape.png')});
  await mobile.getByRole('button',{name:'Close instructions'}).tap();await assertClosed(mobile,'Landscape touch cross');
  check('No browser page errors or error console messages',errors.length===0);
  const report={date:'2026-10-11',url,browser:'Headless Chromium',version:browser.version(),checksPassed:checks.length,checks,layouts,errors,limitations:['In-app Browser connection failed with EPERM.','Mobile checks use Chromium viewport and touch emulation, not a physical phone or Safari.','System clipboard, screen reader output and visual motion acceptance are outside these help checks.']};
  fs.writeFileSync(path.join(dir,'browser-verification.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({checksPassed:checks.length,layouts:layouts.length,browser:report.browser,version:report.version,errors},null,2));
}finally{await browser.close();}
