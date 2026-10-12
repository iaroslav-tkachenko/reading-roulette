import { createServer } from 'vite'
export async function loadRuntime() {
 const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'})
 const paths=['data/topics','data/formats','data/angles','data/languages','data/cefrLevels','data/textLengths','data/readingFamilies','random/compatibility','random/selectReadingCombination','prompt/buildPrompt','motion/drumSpinController','clipboard/promptCopier','prompt/promptUpdateFeedback']
 try {
  const api=Object.assign({},...await Promise.all(paths.map(p=>server.ssrLoadModule(`/src/${p}.ts`))))
  api.initial=await server.ssrLoadModule('/src/components/scene/initialReading.ts')
  return api
 } finally { await server.close() }
}
