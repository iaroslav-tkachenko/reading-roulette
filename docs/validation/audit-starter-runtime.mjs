// Legacy entry point retained; validates the full runtime since step 10.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadRuntime } from './load-runtime.mjs'
import { auditRuntime } from '../design/implementation-step10-v10/runtime-checks.mjs'

const root=fileURLToPath(new URL('../../',import.meta.url))
const result=await auditRuntime(await loadRuntime())
const documents=['README.md','PROJECT.md']
function visit(directory){
 for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
  const file=path.join(directory,entry.name)
  if(entry.isDirectory())visit(file)
  else if(file.endsWith('.md'))documents.push(path.relative(root,file))
 }
}
visit(path.join(root,'docs'))
let links=0
for(const document of documents){
 const file=path.join(root,document),content=fs.readFileSync(file,'utf8')
 assert(!/^.*[\t ]+$/m.test(content),`Trailing whitespace in ${document}`)
 for(const match of content.matchAll(/\[[^\]]*\]\(([^\s)]+)\)/g)){
  const target=match[1]
  if(/^[a-z]+:|^#/i.test(target))continue
  assert(fs.existsSync(path.resolve(path.dirname(file),target.split('#')[0])),`Broken link in ${document}: ${target}`)
  links++
 }
}
Object.assign(result,{date:'2026-10-11',scope:'Full approved runtime; seeded exhaustive algorithm/prompt/state checks, not browser rendering or system clipboard',documents:documents.length,localLinks:links})
fs.writeFileSync(path.join(root,'docs/design/implementation-step10-v10/runtime-verification.json'),JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({...result,matrix:result.matrix.length+' settings'},null,2))
