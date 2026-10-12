// The wall/desk boundary is a document coordinate tied to the machine scale.
// It never depends on scroll position, prompt length or viewport height.
export const roomGeometry = { machineWidth:1536, referenceWidth:1612.8, wallY:594, sourceWallY:573 };

// The inner edges stay beside the machine. Additional painted width extends out.
export function architecturePlacements(assets) {
  return [
    {id:'study-window-wide',asset:'study-window-wide-v8',innerEdge:210,side:'left'},
    {id:'study-bookcase-wide',asset:'study-bookcase-wide-v8',innerEdge:1364,side:'right'}
  ].map(p=>{
    const a=assets[p.asset], [l,t,r,b]=a.boundsAboveAlpha8;
    const height=roomGeometry.wallY, width=height*(r-l)/(b-t);
    return {...p,asset:a.file,x:p.side==='left'?p.innerEdge-width:p.innerEdge,y:0,width,height,sourceBounds:[l,t,r,b],sourceSize:[a.width,a.height]};
  });
}

export function decorPlacements(assets) {
  return [
    {id:'desk-lamp-books',asset:'desk-lamp-books-v7',x:24,width:205,bottom:648},
    {id:'desk-books',asset:'desk-books-v7',x:8,width:225,bottom:925},
    {id:'desk-pen-cup',asset:'desk-pen-cup-v7',x:1394,width:114,bottom:744}
  ].map(p=>{
    const a=assets[p.asset], [l,t,r,b]=a.boundsAboveAlpha8;
    const height=p.width*(b-t)/(r-l);
    return {...p,asset:a.file,height,y:p.bottom-height,sourceBounds:[l,t,r,b],sourceSize:[a.width,a.height]};
  });
}

export function roomLayers(bg, assets, {html=false,width=1920,height=1000}={}) {
  const scale=Math.min(width,roomGeometry.machineWidth)/roomGeometry.machineWidth;
  // Decor follows the machine, including when browser zoom exposes a wide viewport.
  // A separate plain wall fills the remaining width without pushing props outward.
  const roomWidth=roomGeometry.referenceWidth*scale;
  const wallY=roomGeometry.wallY*scale, left=(width-roomWidth)/2;
  const image=`<image href="assets/${bg.file}" width="${bg.width}" height="${bg.height}"/>`;
  const tile=`<svg width="1000" height="392" viewBox="350 600 1000 392">${image}</svg>`;
  const row=tile+`<g transform="translate(2000 0) scale(-1 1)">${tile}</g>`;
  const floor=`<svg xmlns="http://www.w3.org/2000/svg" ${html?'class="desk-continuation" width="100%" height="100%"':`width="${width}" height="${height}"`} data-layer="desk-continuation"><defs><pattern id="desk-grain" width="2000" height="784" patternUnits="userSpaceOnUse">${row}<g transform="translate(0 784) scale(1 -1)">${row}</g></pattern></defs><rect width="100%" height="100%" fill="url(#desk-grain)"/></svg>`;
  const wallTile=`<svg width="622" height="594" viewBox="350 0 600 573">${image}</svg>`;
  const wallBase=`<svg xmlns="http://www.w3.org/2000/svg" ${html?'class="room-wall-base"':`width="${width}" height="${wallY}"`} data-layer="study-wall-base"><defs><pattern id="wall-grain" width="1244" height="594" patternUnits="userSpaceOnUse">${wallTile}<g transform="translate(1244 0) scale(-1 1)">${wallTile}</g></pattern></defs><rect width="100%" height="100%" fill="url(#wall-grain)"/></svg>`;
  const edgeMask='<defs><linearGradient id="room-edge-fade"><stop stop-color="black"/><stop offset=".045" stop-color="white"/><stop offset=".955" stop-color="white"/><stop offset="1" stop-color="black"/></linearGradient><mask id="room-edge-mask" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#room-edge-fade)"/></mask></defs>';
  const desk=`<svg xmlns="http://www.w3.org/2000/svg" ${html?'class="room-desk"':`x="${left}" y="${wallY}" width="${roomWidth}" height="${roomWidth*(bg.height-573)/bg.width}"`} viewBox="0 573 ${bg.width} ${bg.height-573}" data-layer="study-desk">${edgeMask}<defs><linearGradient id="desk-fade" x2="0" y2="1"><stop offset=".72" stop-color="white"/><stop offset="1" stop-color="black"/></linearGradient><mask id="desk-continuation-mask" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#desk-fade)"/></mask></defs><g mask="url(#room-edge-mask)"><g mask="url(#desk-continuation-mask)">${image}</g></g></svg>`;
  const architecture=architecturePlacements(assets).map(p=>{
    const [l,t,r,b]=p.sourceBounds;
    return `<svg x="${p.x}" y="${p.y}" width="${p.width}" height="${p.height}" viewBox="${l} ${t} ${r-l} ${b-t}" data-layer="${p.id}"><image href="assets/${p.asset}" width="${p.sourceSize[0]}" height="${p.sourceSize[1]}"/></svg>`;
  }).join('');
  const architectureLayer=`<svg xmlns="http://www.w3.org/2000/svg" ${html?'class="room-architecture"':`x="${(width-1536*scale)/2}" width="${1536*scale}" height="${1000*scale}"`} viewBox="0 0 1536 1000" overflow="visible" data-layer="complete-wall-architecture">${architecture}</svg>`;
  const props=decorPlacements(assets).map(p=>{
    const [l,t,r,b]=p.sourceBounds;
    return `<svg x="${p.x}" y="${p.y}" width="${p.width}" height="${p.height}" viewBox="${l} ${t} ${r-l} ${b-t}" data-layer="${p.id}"><image href="assets/${p.asset}" width="${p.sourceSize[0]}" height="${p.sourceSize[1]}"/></svg>`;
  }).join('');
  const propLayer=`<svg xmlns="http://www.w3.org/2000/svg" ${html?'class="room-props"':`x="${(width-1536*scale)/2}" width="${1536*scale}" height="${1000*scale}"`} viewBox="0 0 1536 1000" overflow="visible" data-layer="complete-tabletop-props">${props}</svg>`;
  return floor+wallBase+desk+architectureLayer+propLayer;
}
