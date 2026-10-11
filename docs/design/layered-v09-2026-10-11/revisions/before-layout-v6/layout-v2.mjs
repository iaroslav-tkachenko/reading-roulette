import fs from 'node:fs';
import path from 'node:path';
import {roomLayers,roomGeometry} from './room-backdrop.mjs';
const esc = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const paperImage = '<image href="assets/paper-v1.png" width="2132" height="738"/>';

// Reuse the blank paper's middle texture and original torn edge independently.
// The grain repeats at its natural scale; the sheet does not stretch a short bitmap vertically.
function surface(id) {
  return `<svg xmlns="http://www.w3.org/2000/svg" class="paper-fill" data-layer="paper-texture" aria-hidden="true"><defs><pattern id="${id}" width="1200" height="300" patternUnits="userSpaceOnUse"><svg width="1200" height="300" viewBox="600 250 1000 250">${paperImage}</svg></pattern></defs><rect width="100%" height="100%" fill="url(#${id})"/></svg><svg xmlns="http://www.w3.org/2000/svg" class="paper-tear" data-layer="paper-torn-edge" viewBox="38 525 2052 67" aria-hidden="true">${paperImage}</svg>`;
}
function wrap(prompt, columns=82) {
  return prompt.split('\n').flatMap(paragraph=>{
    if(!paragraph) return [''];
    const lines=[]; let line='';
    for(const word of paragraph.split(' ')) { if(line && line.length+word.length+1>columns) {lines.push(line);line=word;} else line+=(line?' ':'')+word; }
    if(line)lines.push(line);return lines;
  });
}

export function finishLayout({dir,machineSVG,assets,placements,fixture,selected}) {
  const bg=assets['study-clear-v3'];
  const copyIcon='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="8" width="17" height="17" rx="3"/><path d="M9 3h14q3 0 3 3v14"/></g></svg>';
  const scrollPath='<path d="M12 4v16m-6-6 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
  const scrollCue=`<svg xmlns="http://www.w3.org/2000/svg" class="prompt-scroll-cue" data-layer="prompt-scroll-cue" viewBox="0 0 24 24" aria-hidden="true">${scrollPath}</svg>`;
  const header = `<div class="paper-header"><h1>Prompt preview${scrollCue}</h1><span class="copy-appearance">${copyIcon}Copy prompt</span></div>`;
  const sheet = `<section class="prompt-sheet" data-layer="output-paper" aria-label="Full generated prompt">${surface('html-paper-grain')}<div class="paper-content">${header}<pre class="real-prompt" data-layer="real-prompt">${esc(fixture.prompt)}</pre><p class="paste-hint">Paste into your preferred AI chat.</p></div></section>`;
  const page = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reading Roulette — исправленная послойная сборка</title><link rel="stylesheet" href="preview.css?v=5"></head><body class="review-scene"><div class="room-backdrop" data-layer="study-background" aria-hidden="true">${roomLayers(bg,{html:true})}</div><main class="artboard">${machineSVG}${sheet}</main><footer class="review-footer"><span>Статичная сборка · полный промпт</span><a href="layers.html">Все отдельные слои</a><a href="real-prompt.txt">Текст промпта</a><a href="../references/reading-roulette-evening-study-v09.png">Исходный v09</a></footer></body></html>\n`;
  fs.writeFileSync(path.join(dir,'index.html'),page);
  fs.writeFileSync(path.join(dir,'machine.svg'),machineSVG+'\n');
  fs.appendFileSync(path.join(dir,'preview.css'),`
@font-face{font-family:"EB Garamond";src:url("assets/EBGaramond-Bold.ttf") format("truetype");font-weight:700;font-display:block}
.review-scene{--machine-width:min(100vw,1536px);--room-width:max(100vw,calc(var(--machine-width)*1.25));--wall-y:calc(var(--machine-width)*.38671875);position:relative;isolation:isolate;min-height:100svh;background:#172126}
.room-backdrop{position:absolute;inset:0;z-index:-1;overflow:hidden;pointer-events:none}
.desk-continuation{position:absolute;inset:0;width:100%;height:100%}
.room-wall,.room-desk{position:absolute;left:50%;transform:translateX(-50%);width:var(--room-width);display:block}
.room-wall{top:0;height:var(--wall-y)}
.room-desk{top:var(--wall-y);height:auto}
.review-scene .artboard{width:min(100%,1536px);margin:0 auto;position:relative}
.review-scene .artboard>svg{position:relative;z-index:1}
.prompt-sheet{position:relative;z-index:2;width:59.765625%;margin:-5.14323% auto 48px;color:#10262b;filter:drop-shadow(0 12px 15px #160b0845)}
.paper-fill{position:absolute;inset:0;width:100%;height:calc(100% - 18px);background:#f9e7ce;clip-path:polygon(3% 0,97% 0,100% 100%,0 100%);pointer-events:none}
.paper-tear{position:absolute;bottom:0;left:0;width:100%;height:auto;display:block;pointer-events:none}
.paper-content{position:relative;padding:28px 5.6645% 42px}
.paper-header{display:flex;align-items:center;justify-content:space-between;gap:18px;min-height:52px}
.paper-header h1{display:flex;align-items:center;gap:12px;font-family:"EB Garamond",Georgia,serif;font-weight:700;font-size:clamp(25px,2.1vw,32px);line-height:1.15;color:#741d1c;margin:0}
.prompt-scroll-cue{display:block;width:24px;height:24px;flex-shrink:0;color:#741d1c}
.copy-appearance{display:inline-flex;align-items:center;gap:10px;flex-shrink:0;min-height:52px;padding:10px 15px;border:2px solid #7d2925;border-radius:14px;color:#741d1c;font:700 clamp(14px,1.3vw,20px)/1.2 Georgia,serif}
.copy-appearance svg{width:24px;height:24px;flex-shrink:0}
.real-prompt{margin:22px 0 24px;white-space:pre-wrap;overflow-wrap:anywhere;overflow:visible;max-height:none;font:clamp(14px,1.172vw,18px)/1.5 Consolas,"Courier New",monospace;color:#10262b}
.paste-hint{margin:0;font:clamp(13px,1.04vw,16px)/1.5 Consolas,monospace;color:#9b7e69}
.review-scene .review-footer{position:relative;background:#172126d9}

@media(max-width:700px){.prompt-sheet{width:90%;margin-top:-5.14323%;margin-bottom:28px}.paper-content{padding:24px 7% 36px}.paper-header{align-items:flex-start;flex-wrap:wrap;gap:12px}.copy-appearance{min-height:40px;padding:7px 10px;border-radius:10px}.copy-appearance svg{width:20px;height:20px}.real-prompt{margin-top:18px}}
`);

  // Offline illustration of the same machine and complete fixture. HTML text reflows
  // naturally in a real browser; this SVG uses nominal desktop line wrapping for QA.
  const lines=wrap(fixture.prompt), paperHeight=28+52+22+lines.length*27+24+24+42;
  const paperTop=726, originY=64, fullHeight=paperTop+paperHeight+48;
  const machineContent='<g transform="translate(0 -64)">'+machineSVG.replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'')+'</g>';
  const background=roomLayers(bg);
  const longPaper=`<g id="output-paper" data-layer="output-paper" transform="translate(312 ${paperTop})"><defs><pattern id="svg-paper-grain" width="1200" height="300" patternUnits="userSpaceOnUse"><svg width="1200" height="300" viewBox="600 250 1000 250">${paperImage}</svg></pattern></defs><path d="M27 0H891L918 ${paperHeight-18}H0Z" fill="url(#svg-paper-grain)"/><svg y="${paperHeight-30}" width="918" height="30" viewBox="38 525 2052 67">${paperImage}</svg><text x="52" y="65" style="font-family:'EB Garamond';font-weight:700;font-size:32px;fill:#741d1c">Prompt preview</text><g transform="translate(286 43)" color="#741d1c" data-layer="prompt-scroll-cue">${scrollPath}</g><rect x="666" y="28" width="199" height="52" rx="14" fill="none" stroke="#7d2925" stroke-width="2"/><g fill="none" stroke="#7d2925" stroke-width="2"><rect x="686" y="46" width="17" height="17" rx="3"/><path d="M691 41h14q3 0 3 3v14"/></g><text x="718" y="61" style="font-family:Georgia;font-size:20px;font-weight:700;fill:#741d1c">Copy prompt</text>${lines.map((line,i)=>`<text x="52" y="${120+i*27}" class="paper-copy">${esc(line)}</text>`).join('')}<text x="52" y="${paperHeight-42}" style="font-family:Consolas;font-size:16px;fill:#9b7e69">Paste into your preferred AI chat.</text></g>`;
  const foreground=`<g transform="translate(192 0)">${machineContent}${longPaper}</g>`;
  const fullSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 ${fullHeight}" width="1920" height="${fullHeight}">${roomLayers(bg,{height:fullHeight})}${foreground}</svg>`;
  fs.writeFileSync(path.join(dir,'scene.svg'),fullSVG+'\n');
  fs.writeFileSync(path.join(dir,'viewport.svg'),`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1000" width="1920" height="1000">${background}${foreground}</svg>\n`);
  const manifest={revision:5,machineArtboard:[1536,805],machineViewBox:[0,64,1536,805],illustrationArtboard:[1920,fullHeight],viewportIllustration:[1920,1000],background:{asset:bg.file,width:bg.width,height:bg.height,placement:'Absolute document backdrop; wall/desk boundary scales with machine; all layers scroll together',geometry:roomGeometry,frontDeskEdge:false},uniqueRuntimePngs:selected.length,machineRasterInstances:placements.length,paperRasterInstances:2,backgroundRasterInstances:4,totalArtworkInstances:placements.length+6,prompt:{source:fixture.source,characters:fixture.characters,paragraphs:fixture.paragraphs,behavior:'Full HTML text; natural wrapping and page scrolling; no textarea or internal scroll area'},changes:{compositionLift:originY,helpPopupVisible:false,sourceDeckFrontRimY:748,keyRowsY:[623,663],keyLetterBaselineOffset:25,keyLetterFontSize:21,spinAsset:'spin-button-v3.png',settingsPanelY:258,settingsLabelBaseline:296,settingsFieldTop:310,promptScrollCue:true,subtitleBaseline:225},placements};
  fs.writeFileSync(path.join(dir,'layer-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  let gallery=fs.readFileSync(path.join(dir,'layers.html'),'utf8');
  gallery=gallery.replace('<h2>Размещение деталей</h2>','<p><a href="generation-prompts-v3.json">Запросы для новых корпуса и фона</a></p><h2>Размещение деталей</h2>').replace('10 самостоятельных растровых деталей.','9 самостоятельных растровых деталей.').replace('ободок и вставка SPIN','единая согласованная деталь SPIN').replace('Общая система координат 1536 × 1024.','Система координат машины: viewBox 0 64 1536 805. Верхний пустой отступ сокращён на 64 единицы. Стол и стена прокручиваются вместе с машиной, длинный лист подстраивается под полный текст промпта.').replace('<strong>11. Текст и иконки</strong>','<strong>10. Текст и иконки</strong>').replace('SVG всей сборки','SVG иллюстрации с полным промптом').replace('<h2>Размещение деталей</h2>','<p><a href="real-prompt.txt">Полный реальный промпт</a> · <a href="prompt-fixture.json">Параметры генератора</a></p><h2>Размещение деталей</h2>');
  fs.writeFileSync(path.join(dir,'layers.html'),gallery);
  console.log(JSON.stringify({revision:5,machineRasterInstances:placements.length,uniqueRuntimePngs:selected.length,promptCharacters:fixture.characters,promptParagraphs:fixture.paragraphs,fullIllustrationHeight:fullHeight}));
}
