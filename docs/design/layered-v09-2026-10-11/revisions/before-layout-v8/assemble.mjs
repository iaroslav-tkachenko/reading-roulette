import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPromptFixture } from './prompt-fixture.mjs';
import { finishLayout } from './layout-v2.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const inspected = JSON.parse(fs.readFileSync(path.join(dir, 'asset-inspection.json'), 'utf8')).assets;
const assets = Object.fromEntries(inspected.map(a => [a.file.replace('.png', ''), a]));
const placements = [];
const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const text = (x, y, content, attrs = '') => `<text x="${x}" y="${y}" ${attrs}>${esc(content)}</text>`;
const layer = (id, title, content) => `<g id="${id}" data-layer="${id}"><title>${esc(title)}</title>${content}</g>`;
function artwork(id, asset, x, y, width, { mirror = false } = {}) {
  const a = assets[asset];
  const [left, top, right, bottom] = a.boundsAboveAlpha8;
  const w = right - left, h = bottom - top, height = +(width * h / w).toFixed(3);
  placements.push({ id, asset: a.file, x, y, width, height, mirror, sourceBounds: a.boundsAboveAlpha8 });
  const image = `<svg x="${x}" y="${y}" width="${width}" height="${height}" viewBox="${left} ${top} ${w} ${h}" overflow="hidden"><image href="assets/${a.file}" width="${a.width}" height="${a.height}"/></svg>`;
  return layer(id, id, mirror ? `<g transform="translate(${2*x+width} 0) scale(-1 1)">${image}</g>` : image);
}

let scene = `<defs>
  <linearGradient id="field" x2="0" y2="1"><stop stop-color="#fff8ed" stop-opacity=".92"/><stop offset="1" stop-color="#fff1da" stop-opacity=".7"/></linearGradient>
  <linearGradient id="card" x2="0" y2="1"><stop stop-color="#ffefd8"/><stop offset="1" stop-color="#f3dab9"/></linearGradient>
  <filter id="shadow" x="-20%" y="-50%" width="140%" height="210%"><feGaussianBlur stdDeviation="15"/></filter>
  <clipPath id="drum-area"><rect x="360" y="400" width="840" height="184" rx="20"/></clipPath>
  <style>text{font-family:Georgia,'Times New Roman',serif;fill:#10262b}.label{font-size:15px;font-weight:700;letter-spacing:.6px}.value{font-size:24px}.neighbor{font-size:22px;fill:#987a65}.selected{font-size:29px;font-weight:700}.column-title{font-size:19px;font-weight:700;fill:#ffe29a;letter-spacing:3px}.key-letter{font-size:23px;font-weight:700;fill:#302015;text-anchor:middle}.paper-copy{font-family:Consolas,'Courier New',monospace;font-size:18px}</style>
</defs>`;
scene += layer('contact-shadow', 'Contact shadow beneath the assembled machine', '<ellipse cx="770" cy="863" rx="572" ry="38" fill="#160b08" opacity=".68" filter="url(#shadow)"/>');
scene += artwork('chassis', 'chassis-v3', 195, 523, 1145);
scene += artwork('settings-panel', 'settings-v2', 313, 258, 910);

scene += layer('settings-fields', 'Separate drawn fields and selectable text; static appearance', [
  [390, 'LANGUAGE', 'English', 228], [680, 'CEFR LEVEL', 'B1+', 211], [957, 'TEXT LENGTH', 'Medium', 202]
].map(([x, label, value, width]) => text(x+12, 296, label, 'class="label"') + `<rect x="${x}" y="310" width="${width}" height="40" rx="11" fill="url(#field)" stroke="#c99e79"/>` + text(x+20, 338, value, 'class="value"') + `<path d="M${x+width-29} 326h14l-7 10z" fill="#12343a"/>`).join('') + '<path d="M648 277v74 M924 277v74" stroke="#b88b68" opacity=".65"/>');

scene += layer('drum-paper', 'Three independent parchment cylinders behind the metal cradle', '<g clip-path="url(#drum-area)">' + [365,638,910].map((x,i) => artwork('drum-'+(i+1), 'drum-v1', x, 395, 282)).join('') + '</g>');
scene += layer('drum-typography', 'Independent neighboring rows and selected content', [
  {x:505,top:'Nature',value:['Travel'],bottom:'Daily life'},
  {x:777,top:'Dialogue',value:['Short story'],bottom:'Letter'},
  {x:1048,top:'An overlooked detail',value:['Unexpected','discovery'],bottom:'A change of plans'}
].map(({x,top,value,bottom}) => text(x,427,top,'class="neighbor" text-anchor="middle"' + (top.length>18?' style="font-size:17px"':'')) + value.map((s,i)=>text(x, value.length===1?489:475+i*30,s,'class="selected" text-anchor="middle"' + (value.length>1?' style="font-size:26px"':''))).join('') + text(x,546,bottom,'class="neighbor" text-anchor="middle"' + (bottom.length>16?' style="font-size:18px"':''))).join(''));
scene += artwork('left-wheel', 'wheel-v1', 250, 343, 62);
scene += artwork('right-wheel', 'wheel-v1', 1224, 343, 62, { mirror:true });
scene += artwork('mechanical-cradle', 'mechanism-v2', 294, 333, 950);
scene += layer('column-titles', 'Live text on the burgundy label strip', [text(505,390,'TOPIC','class="column-title" text-anchor="middle"'),text(777,390,'FORMAT','class="column-title" text-anchor="middle"'),text(1048,390,'ANGLE','class="column-title" text-anchor="middle"')].join(''));

const keyboard = [
  ['QWERT', 302, 603], ['ASDFG', 324, 643], ['YUIOP', 951, 603], ['HJKL', 982, 643]
];
scene += layer('keyboard', 'Nineteen separate keycap instances, each with its own text', keyboard.map(([letters,x,y]) => [...letters].map((letter,i)=>layer('key-'+letter, 'Key '+letter, artwork('key-art-'+letter,'key-v1',x+i*63,y,47) + text(x+i*63+23.5,y+25,letter,'class="key-letter" style="font-size:21px"'))).join('')).join(''));
scene += artwork('spin-button','spin-button-v3',635,605,298);
scene += layer('spin-caption', 'Separate SPIN lettering and refresh arrow', '<g transform="translate(710 644) scale(.8) translate(-710 -664)"><path d="M725 652a17 17 0 1 0 2 17 M725 644v10h-11" fill="none" stroke="#ffe7ba" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g>' + text(756,655,'SPIN','style="font-size:40px;font-weight:700;fill:#ffe7ba;letter-spacing:3px"'));

scene += layer('page-heading', 'Independent heading, ornament and subtitle',
  text(784,162,'Reading Roulette','text-anchor="middle" style="font-family:\'EB Garamond\',Georgia,serif;font-size:90px;font-weight:700;fill:#fff0d9"') +
  '<g stroke="#e4c492" fill="none"><path d="M647 185h128 M815 185h127"/><path d="m782 184 9-5 9 5-9 5z M777 178l-4-3 M777 190l-4 3 M805 178l4-3 M805 190l4 3"/></g>' +
  text(784,225,'Try your luck. Find your next great read.','text-anchor="middle" style="font-size:26px;font-style:italic;fill:#ffebca"'));
scene += layer('help-button', 'Static help button illustration', '<rect x="1361" y="80" width="153" height="41" rx="10" fill="#182629" stroke="#f4dfc0" stroke-width="2"/><circle cx="1387" cy="100" r="9" fill="none" stroke="#f4dfc0" stroke-width="2"/>' + text(1387,106,'?','text-anchor="middle" style="font-size:16px;fill:#fff0d9"') + text(1408,107,'How to use','style="font-size:19px;fill:#fff0d9"'));

scene = '<style>@font-face{font-family:"EB Garamond";src:url("assets/EBGaramond-Bold.ttf") format("truetype");font-weight:700;font-style:normal;font-display:block}</style>' + scene;
const chassisPlacement=placements.find(p=>p.id==='chassis');
const machineHeight=Math.ceil(chassisPlacement.y+chassisPlacement.height-64);
scene=scene.replace('cy="863"','cy="'+(machineHeight+58)+'"');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 64 1536 ${machineHeight}" width="1536" height="${machineHeight}" role="img" aria-labelledby="scene-title scene-desc"><title id="scene-title">Reading Roulette — static layered v09 reconstruction</title><desc id="scene-desc">An illustrated reading machine assembled from individual transparent artwork layers, nineteen individual keys, three parchment cylinders and independent SVG typography. No functionality or animation.</desc>${scene}</svg>`;
fs.writeFileSync(path.join(dir,'scene.svg'),svg+'\n');
const css = `*{box-sizing:border-box}html{background:#172126;color:#f5e5ce;font:14px/1.5 system-ui,sans-serif}body{margin:0}.artboard{width:min(100%,1536px,calc((100svh - 42px)*1.5));margin-inline:auto}.artboard>svg{display:block;width:100%;height:auto}.review-footer{min-height:42px;padding:10px 20px;display:flex;justify-content:center;gap:20px;flex-wrap:wrap;background:#172126}a{color:#f1d4a4}main.gallery{max-width:1250px;padding:28px;margin:auto}h1{font-family:Georgia,serif}p{max-width:80ch}.parts{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}.part{margin:0;padding:16px;background:#26343a;border:1px solid #55605c;border-radius:10px}.transparency{background-color:#eee9dc;background-image:linear-gradient(45deg,#d4d0c6 25%,transparent 25%),linear-gradient(-45deg,#d4d0c6 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#d4d0c6 75%),linear-gradient(-45deg,transparent 75%,#d4d0c6 75%);background-size:20px 20px;background-position:0 0,0 10px,10px -10px,-10px 0}.part img{display:block;width:100%;height:190px;object-fit:contain}.part figcaption{padding-top:12px}.part a{display:inline-block;margin-right:12px}code{overflow-wrap:anywhere}.wide{grid-column:1/-1}table{border-collapse:collapse;width:100%;font-size:13px}th,td{padding:9px;border-bottom:1px solid #55605c;text-align:left}.table-wrap{overflow:auto}@media(max-width:600px){.review-footer{gap:10px;font-size:12px}main.gallery{padding:16px}}`;
fs.writeFileSync(path.join(dir,'preview.css'),css+'\n.part .transparency>svg{display:block;width:100%;height:190px}\n');
fs.writeFileSync(path.join(dir,'index.html'),`<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reading Roulette — послойная сборка v09</title><link rel="stylesheet" href="preview.css"></head><body><main class="artboard">${svg}</main><footer class="review-footer"><span>Статичная сборка · без анимации и функционала</span><a href="layers.html">Все отдельные слои</a><a href="../references/reading-roulette-evening-study-v09.png">Исходный v09</a></footer></body></html>\n`);

const selected = ['study-shell-v7','chassis-v3','settings-v2','drum-v1','mechanism-v2','wheel-v1','key-v1','spin-button-v3','paper-v1','desk-lamp-books-v7','desk-books-v7','desk-pen-cup-v7'];
const names = ['Кабинет без настольных предметов','Компактная площадка клавиатуры и щель выдачи','Панель настроек без текста','Пустой бумажный цилиндр × 3','Открытая механическая рама','Боковое колесо × 2','Клавиша без буквы × 19','SPIN с согласованной перспективой','Бумага для длинного промпта','Цельная лампа с книгами','Цельная стопка книг и перо','Цельный стакан с ручками'];
for(const id of selected){const a=assets[id];const [l,t,r,b]=a.boundsAboveAlpha8;fs.writeFileSync(path.join(dir,'assets',id+'.svg'),`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${l} ${t} ${r-l} ${b-t}"><image href="${a.file}" width="${a.width}" height="${a.height}"/></svg>\n`);}
const parts = selected.map((id,i) => {
  const a = assets[id]; const [l,t,r,b] = a.boundsAboveAlpha8;
  const thumb = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${l} ${t} ${r-l} ${b-t}" role="img" aria-label="${names[i]}"><image href="assets/${a.file}" width="${a.width}" height="${a.height}"/></svg>`;
  return `<figure class="part"><div class="transparency">${thumb}</div><figcaption><strong>${i+1}. ${names[i]}</strong><p><code>${a.file}</code></p><a href="assets/${id}.png">PNG</a><a href="assets/${id}.svg">Слой без пустых полей</a></figcaption></figure>`;
}).join('');
fs.writeFileSync(path.join(dir,'layers.html'),`<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reading Roulette — отдельные слои</title><link rel="stylesheet" href="preview.css"></head><body><main class="gallery"><a href="index.html">← Собранный дизайн</a><h1>Из чего собрана сцена</h1><p>10 самостоятельных растровых деталей. Пустой корпус, отдельная рама с прозрачными окнами, отдельные бумажные цилиндры, 19 клавиш, два колеса, ободок и вставка SPIN, выходной лист. Текст и иконки размещены поверх как SVG-элементы. Фон содержит только кабинет и стол.</p><p>Изображения перерисованы ImageGen по оригиналу v09. Это реконструкция, а не точное извлечение исходных пикселей. Перспектива и материалы требуют визуальной оценки в общей сборке. У каждой детали сохранена исходная прозрачность. В самой сборке нет единой плоской картинки интерфейса.</p><div class="parts">${parts}<figure class="part wide"><figcaption><strong>11. Текст и иконки</strong><p>Заголовок, подписи настроек, Topic / Format / Angle, три строки каждого барабана, буквы клавиш, SPIN, prompt preview, Copy и небольшая кнопка справки — отдельные текстовые и векторные элементы в DOM.</p><a href="scene.svg">SVG всей сборки</a> <a href="layer-manifest.json">Координаты и порядок слоёв</a> <a href="generation-prompts.json">Промпты ImageGen</a></figcaption></figure></div><h2>Размещение деталей</h2><p>Общая система координат 1536 × 1024. Каждая растровая деталь масштабируется пропорционально. Прозрачные внешние поля исключены через viewBox без изменения PNG.</p><div class="table-wrap"><table><thead><tr><th>Слой</th><th>Файл</th><th>x / y</th><th>Ширина × высота</th></tr></thead><tbody>${placements.map(p=>`<tr><td>${p.id}</td><td>${p.asset}</td><td>${p.x} / ${p.y}</td><td>${p.width} × ${p.height}</td></tr>`).join('')}</tbody></table></div></main></body></html>\n`);
fs.writeFileSync(path.join(dir,'layer-manifest.json'),JSON.stringify({artboard:[1536,1024],method:'Individual PNG layers in inline SVG; uniform scale, source alpha, separate SVG text. No browser JavaScript, events or animation.',uniqueRuntimePngs:selected.length,rasterInstances:placements.length,placements},null,2)+'\n');
console.log(`Assembled ${selected.length} unique PNG assets, ${placements.length} raster instances; 19 keys, 3 drums. Static HTML and SVG written.`);
finishLayout({dir,machineSVG:svg,assets,placements,fixture:createPromptFixture(),selected});
