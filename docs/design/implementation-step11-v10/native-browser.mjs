import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';

const dir=path.dirname(fileURLToPath(import.meta.url));
export async function openNativeBrowser() {
  const {chromium}=await import(process.env.READING_PLAYWRIGHT_MODULE?pathToFileURL(process.env.READING_PLAYWRIGHT_MODULE).href:'playwright');
  const profile=path.resolve(dir,'../../..','node_modules','.cache','reading-browser',`step11-native-${Date.now()}`);
  await fs.mkdir(profile,{recursive:true});
  const extension=path.join(dir,'zoom-extension');
  const child=spawn(chromium.executablePath(),[
    `--user-data-dir=${profile}`,'--remote-debugging-port=0','--no-first-run',
    '--no-default-browser-check','--disable-background-networking','--window-size=1366,1000',
    '--disable-features=CalculateNativeWinOcclusion','--disable-backgrounding-occluded-windows',
    `--disable-extensions-except=${extension}`,`--load-extension=${extension}`,'about:blank',
  ],{windowsHide:false,stdio:'ignore'});
  let spawnError;
  child.on('error',error=>{spawnError=error;});
  let port;
  for(let attempt=0;attempt<200;attempt++){
    if(spawnError)throw spawnError;
    if(child.exitCode!==null)throw new Error(`Test Chromium exited: ${child.exitCode}`);
    try{port=(await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0];break;}catch{}
    await new Promise(resolve=>setTimeout(resolve,50));
  }
  if(!port)throw new Error('Test Chromium did not expose its debugging port');
  // noDefaults preserves actual visibility/focus. Playwright normally forces pages visible.
  const browser=await chromium.connectOverCDP(`http://127.0.0.1:${port}`,{noDefaults:true});
  const context=browser.contexts()[0];
  const worker=context.serviceWorkers().find(worker=>worker.url().endsWith('/worker.js'))??await context.waitForEvent('serviceworker',{predicate:worker=>worker.url().endsWith('/worker.js')});
  return {browser,context,worker,async close(){
    const session=await browser.newBrowserCDPSession();
    await session.send('Browser.close').catch(()=>{});
    await browser.close().catch(()=>{});
  }};
}
