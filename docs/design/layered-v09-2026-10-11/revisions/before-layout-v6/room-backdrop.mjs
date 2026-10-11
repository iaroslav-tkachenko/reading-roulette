// The wall/desk boundary is a document coordinate tied to the machine scale.
// It never depends on scroll position, prompt length or viewport height.
export const roomGeometry = { machineWidth:1536, referenceWidth:1920, wallY:594, sourceWallY:573 };

export function roomLayers(bg, {html=false,width=1920,height=1000}={}) {
  const scale=Math.min(width,roomGeometry.machineWidth)/roomGeometry.machineWidth;
  const roomWidth=Math.max(width,roomGeometry.referenceWidth*scale);
  const wallY=roomGeometry.wallY*scale, left=(width-roomWidth)/2;
  const image=`<image href="assets/${bg.file}" width="${bg.width}" height="${bg.height}"/>`;
  const tile=`<svg width="1920" height="752.64" viewBox="350 600 1000 392">${image}</svg>`;
  const floor=`<svg xmlns="http://www.w3.org/2000/svg" ${html?'class="desk-continuation" width="100%" height="100%"':`width="${width}" height="${height}"`} data-layer="desk-continuation"><defs><pattern id="desk-grain" width="1920" height="1505.28" patternUnits="userSpaceOnUse">${tile}<g transform="translate(0 1505.28) scale(1 -1)">${tile}</g></pattern></defs><rect width="100%" height="100%" fill="url(#desk-grain)"/></svg>`;
  const wall=`<svg xmlns="http://www.w3.org/2000/svg" ${html?'class="room-wall"':`x="${left}" width="${roomWidth}" height="${wallY}"`} viewBox="0 0 ${bg.width} 573" preserveAspectRatio="xMidYMax slice" data-layer="study-wall">${image}</svg>`;
  const desk=`<svg xmlns="http://www.w3.org/2000/svg" ${html?'class="room-desk"':`x="${left}" y="${wallY}" width="${roomWidth}" height="${roomWidth*(bg.height-573)/bg.width}"`} viewBox="0 573 ${bg.width} ${bg.height-573}" data-layer="study-desk"><defs><linearGradient id="desk-fade" x2="0" y2="1"><stop offset=".72" stop-color="white"/><stop offset="1" stop-color="black"/></linearGradient><mask id="desk-continuation-mask" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#desk-fade)"/></mask></defs><g mask="url(#desk-continuation-mask)">${image}</g></svg>`;
  return floor+wall+desk;
}
