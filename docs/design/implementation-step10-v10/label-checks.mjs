import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

// Planned wrapping/SSR checks only. Font glyph widths and visual centering require Browser.
export async function checkLabels(root, catalog) {
 const server=await createServer({root,server:{middlewareMode:true,hmr:false},appType:'custom'})
 try {
  const {selectedLines}=await server.ssrLoadModule('/src/components/scene/drumData.ts')
  const {DrumLabel}=await server.ssrLoadModule('/src/components/scene/DrumLabel.tsx')
  for(const item of catalog){
   const lines=selectedLines(item.label)
   assert.ok(lines.length<=2,item.label)
   assert.equal(lines.join(' '),item.label)
   assert.ok(lines.every(line=>line.length<=18),item.label)
   for(const selected of [true,false]){
    const html=renderToStaticMarkup(createElement(DrumLabel,{label:item.label,x:777,y:489,selected}))
    assert.ok(html.includes('aria-label='))
    assert.ok(!html.includes('textLength=') && !html.includes('lengthAdjust='))
   }
  }
  return catalog.length
 } finally {await server.close()}
}
