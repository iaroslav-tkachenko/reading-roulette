import assert from 'node:assert/strict'
import fs from 'node:fs'
import { performance } from 'node:perf_hooks'

const rows = file => fs.readFileSync(file,'utf8').split(/\r?\n/).filter(x=>x.startsWith('| ')).map(x=>x.split('|').slice(1,-1).map(x=>x.trim()))
const tuple = c => [c.topic.id,c.format.id,c.angle.id].join('/')
const close = (actual,expected) => assert.ok(Math.abs(actual-expected)<1e-12,`${actual} != ${expected}`)
export async function auditRuntime(api) {
 const {topics,formats,angles,languages,cefrLevels,textLengths,getTextLength,contentProfiles,buildPrompt,selectReadingCombination,checkCombination,getSelectionPool,enumerateCombinations,validateCatalogs,readingCatalogs,familyWeights,readingFamilies,initial,createDrumSpinController,createPromptCopier,createPromptUpdateFeedback,promptUpdateDuration} = api
 const levels = Object.keys(cefrLevels), lengths = Object.keys(textLengths)
 const rank = {A1:0,A2:1,B1:2,B2:3,'C1+':4}
 const expectedCounts = [26,44,30,11,15,3]
 assert.deepEqual([topics.length,formats.length,angles.length,languages.length,levels.length,lengths.length],expectedCounts)
 validateCatalogs()
 for (const [name,catalog,count] of [['TOPICS',topics,26],['FORMATS',formats,44],['ANGLES',angles,30]]) {
  const source = rows(`docs/${name}.md`).filter(r=>r[3] in rank)
  assert.equal(source.length,count)
  assert.deepEqual(catalog.map(x=>[x.id,x.label,x.minProfile]),source.map(r=>[r[0],r[2],r[3]]))
  assert.equal(new Set(catalog.map(x=>x.id)).size,count)
 }
 const documentedLengths = rows('docs/LEVELS_LENGTH.md').filter(r=>r.length===6 && formats.some(x=>x.id===r[0]))
 const documentedStatuses = rows('docs/CONTENT_STATUS.md')
 for (const format of formats) {
  const row = documentedLengths.find(r=>r[0]===format.id)
  assert.equal(format.volumeModel,row[2])
  assert.deepEqual(format.lengths,lengths.filter((_,i)=>row[i+3]==='Да'))
  assert.equal(format.contentStatus,documentedStatuses.find(r=>r[0]===format.id)[1])
  assert.ok(format.angleIds.length && format.topicIds.length && format.registerHint)
 }
 assert.deepEqual(readingFamilies.map(f=>formats.filter(x=>x.family===f).length),[6,8,6,6,11,7])
 const expectedWeights = new Map()
 for (const row of rows('docs/READING_FAMILIES.md').filter(r=>r.length===7 && r[1].endsWith('%'))) for (const level of row[0].split(/,\s*/)) expectedWeights.set(level,row.slice(1).map(x=>parseInt(x)))
 assert.equal(expectedWeights.size,15)
 const documentedProfiles = new Map(), ranges = new Map()
 for (const row of rows('docs/LEVELS_LENGTH.md').filter(r=>r[0] in rank && /слов/.test(r[2]))) for (const level of row[1].split(/,\s*/)) { documentedProfiles.set(level,row[0]); ranges.set(level,row.slice(2).map(x=>x.replace(' слов',''))) }
 const settings = (cefrLevel='B1+',textLength='medium',language=languages[0])=>({cefrLevel,textLength,language})
 const combination = (t,f,a)=>({topic:topics.find(x=>x.id===t),format:formats.find(x=>x.id===f),angle:angles.find(x=>x.id===a)})
 const coveredFormats = new Set(), coveredAngles = new Set(), coveredTopics = new Set()
 const matrix = [], exhaustive = {accepted:0,rejected:0,prompts:0,uniformBranches:0}
 let seed = 0x51a10
 const random = ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32}
 const started=performance.now()
 for (const level of levels) for (const length of lengths) {
  const s=settings(level,length)
  assert.equal(contentProfiles[level],documentedProfiles.get(level))
  const before=performance.now(), pools=getSelectionPool(s), elapsed=performance.now()-before
  const allowed=enumerateCombinations(s), keys=new Set(allowed.map(tuple))
  assert.equal(keys.size,allowed.length)
  const expected=expectedWeights.get(level)
  assert.deepEqual(readingFamilies.map(f=>familyWeights(level)[f]),expected)
  const total=pools.reduce((sum,p)=>sum+expected[readingFamilies.indexOf(p.family)],0)
  close(pools.reduce((sum,p)=>sum+p.probability,0),1)
  let previousWeight=0
  for (const pool of pools) {
   assert.ok(pool.weight>0)
   close(pool.probability,expected[readingFamilies.indexOf(pool.family)]/total)
   let familyProbability=0
   // Enumerate every hierarchical branch and drive the actual selector to the
   // center of each interval. This proves the implemented partition directly.
   for (const [fi,{format,topics:ts}] of pool.formats.entries()) for (const [ti,{topic,angles:as}] of ts.entries()) for (const [ai,angle] of as.entries()) {
    const draws=[(previousWeight+pool.weight/2)/total,(fi+.5)/pool.formats.length,(ti+.5)/ts.length,(ai+.5)/as.length]
    let index=0
    assert.deepEqual(selectReadingCombination(s,()=>draws[index++]),{topic,format,angle})
    assert.equal(index,4)
    familyProbability+=pool.probability/pool.formats.length/ts.length/as.length
    exhaustive.uniformBranches++
   }
   close(familyProbability,pool.probability)
   for (const familySample of [previousWeight/total,(previousWeight+pool.weight-1e-10)/total]) {
    let index=0
    const chosen=selectReadingCombination(s,()=>index++===0?familySample:0)
    assert.equal(chosen.format.family,pool.family)
   }
   previousWeight+=pool.weight
  }
  // All 26 × 44 × 30 tuples cross-check the pool against the shared predicate.
  // buildPrompt rejection is exercised explicitly in the boundary cases below.
  for (const topic of topics) for (const format of formats) for (const angle of angles) {
   const c={topic,format,angle}, checked=checkCombination(s,c)
   assert.equal(checked.valid,keys.has(tuple(c)))
   if (!checked.valid) { exhaustive.rejected++; continue }
   exhaustive.accepted++
   coveredFormats.add(format.id);coveredTopics.add(topic.id);coveredAngles.add(angle.id)
   for (const language of languages) {
    const ls={...s,language}, prompt=buildPrompt(ls,c), volume=getTextLength(ls,format)
    assert.ok(prompt.includes(`entirely in ${language.name}`))
    assert.ok(prompt.includes(`Difficulty target: ${level} (`))
    for (const [field,item] of Object.entries(c)) assert.ok(prompt.includes(`${field[0].toUpperCase()+field.slice(1)}: ${item.label}. ${item.promptHint}`))
    assert.ok(prompt.includes(topic.disclosures[contentProfiles[level]]))
    if(['A1','A2'].includes(contentProfiles[level]))assert.ok(prompt.includes(`Concrete task: ${angle.simpleAction.replace('{focus}',topic.simpleFocus)}`))
    assert.ok(prompt.includes(volume.instruction) && volume.instruction)
    assert.ok(prompt.includes(`Content status: ${format.contentStatus}.`))
    assert.ok(prompt.includes(format.registerHint))
    assert.ok(!/^Tone:|Return only the reading text/m.test(prompt))
    const vocabulary=prompt.split('\n\n').at(-1)
    assert.ok(vocabulary.startsWith('Vocabulary support: After the reading material and any required Sources block'))
    assert.ok(vocabulary.includes('final section titled "Useful vocabulary"') && vocabulary.includes('actually appear in the reading material'))
    assert.ok(vocabulary.includes(`a ${level} learner may find unfamiliar`) && vocabulary.includes(`original ${language.name} word or expression as used in the text`))
    assert.ok(vocabulary.includes('Write these meanings in English, the language of this prompt'))
    if(language.code==='en') assert.ok(vocabulary.includes('simple English definition') && vocabulary.includes('familiar synonym') && !vocabulary.includes('English translation'))
    else assert.ok(vocabulary.includes('English translation of its meaning in this context') && !vocabulary.includes('simple English definition'))
    assert.ok(vocabulary.includes('If no reading material can be produced, omit this section') && vocabulary.includes('fewer for very short or simple material'))
    assert.ok(prompt.includes('vocabulary section is excluded from reading volume and field/item counts, including for visual formats'))
    assert.ok(!prompt.includes('Do not add translations'))
    if (['form-fields','list-items'].includes(format.volumeModel)) {assert.equal(volume.wordRange,null);assert.ok(!/approximately \d/.test(volume.instruction))}
    else if (language.lengthUnit==='structure') {assert.equal(volume.wordRange,null);assert.ok(!/\d+[–-]\d+/.test(volume.instruction))}
    else assert.equal(volume.wordRange,format.volumeModel==='compact-message'?'20–60':ranges.get(level)[lengths.indexOf(length)])
    if (format.contentStatus==='sourced') assert.ok(prompt.includes('Sources block') && prompt.includes('actually found and read') && prompt.includes('publication dates') && prompt.includes('never substitute a fictional event'))
    if (format.family==='visual') assert.ok(prompt.includes('Create and display') && prompt.includes('explicitly label the result as partial') && prompt.includes('all accompanying text together') === (format.volumeModel!=='visual-report'))
    if (format.volumeModel==='form-fields') assert.ok(volume.instruction.includes('4–8'))
    if (format.volumeModel==='list-items') assert.ok(volume.instruction.includes({short:'4–6',medium:'8–12',long:'16–24'}[length]))
    exhaustive.prompts++
   }
  }
  for(let i=0;i<30;i++)assert.ok(checkCombination(s,selectReadingCombination(s,random)).valid)
  matrix.push({level,length,profile:contentProfiles[level],formats:new Set(allowed.map(c=>c.format.id)).size,combinations:allowed.length,coldPoolMs:+elapsed.toFixed(2),probabilities:Object.fromEntries(readingFamilies.map(f=>[f,pools.find(p=>p.family===f)?.probability??0]))})
 }
 assert.equal(coveredFormats.size,44);assert.equal(coveredTopics.size,26);assert.equal(coveredAngles.size,30)
 for (const [level,length,divisor] of [['A2-','short',95],['A2','long',95],['A2+','long',95],['B1-','long',90]]) {
  const row=matrix.find(r=>r.level===level&&r.length===length)
  assert.equal(row.probabilities.opinion,0)
  const w=familyWeights(level)
  for (const family of readingFamilies.filter(f=>f!=='opinion'))close(row.probabilities[family],w[family]/divisor)
 }
 close(matrix.find(r=>r.level==='A1'&&r.length==='long').probabilities.visual,.3)
 const boundaries = [
  ['A1','long','philosophy-ethics','argumentative-essay','difficult-choice',false],
  ['A2','long','city-life','news-brief','what-changed',false],
  ['A1','short','city-life','map-guide','spatial-orientation',false],
  ['B1-','short','money-personal-finance','chart-description','noticeable-pattern',false],
  ['B2-','medium','business-entrepreneurship','visual-report','noticeable-pattern',false],
  ['C1-','medium','business-entrepreneurship','visual-report','noticeable-pattern',true],
  ['A1','long','home-household','picture-story','everyday-routine',true],
  ['A2','short','food-cooking','menu','special-occasion',true],
  ['A1','short','learning-education','sample-form','first-introduction',true],
  ['B1','medium','work-careers','it-meeting-follow-up','decisions-and-next-steps',true],
  ['B2','short','city-life','written-debate','difficult-choice',false],
  ['C2','medium','philosophy-ethics','menu','difficult-choice',false],
  ['C2','medium','family-relationships','map-guide','spatial-orientation',false],
  ['A2-','long','money-personal-finance','everyday-story','unexpected-discovery',false],
 ]
 for(const level of ['B1','B2-','B2','C1-','C1','C2']){
  const c=combination('philosophy-ethics','explainer','comparing-two-options')
  const prompt=buildPrompt(settings(level),c)
  assert.equal(prompt.includes('Philosophical schools, theoretical approaches and metaethics are permitted'),['C1','C2'].includes(level))
  assert.equal(prompt.includes('Exclude philosophical schools, metaethics and abstract theoretical disputes'),['B1','B2-'].includes(level))
 }
 for (const [l,len,t,f,a,valid] of boundaries) {
  const s=settings(l,len),c=combination(t,f,a)
  assert.equal(checkCombination(s,c).valid,valid,`${l}/${len}/${t}/${f}/${a}`)
  if(!valid)assert.throws(()=>buildPrompt(s,c))
 }
 for (const field of ['topic','format','angle'])assert.throws(()=>buildPrompt(settings(),{...initial.initialCombination,[field]:{...initial.initialCombination[field],id:'unknown'}}),/Unknown catalog ID/)
 for (const invalid of [NaN,Infinity,-1,1,undefined])for(let position=0;position<4;position++){let i=0;assert.throws(()=>selectReadingCombination(settings(),()=>i++===position?invalid:0),/Random source/)}
 for (const value of [0,1-Number.EPSILON])assert.ok(checkCombination(settings(),selectReadingCombination(settings(),()=>value)).valid)
 assert.throws(()=>getSelectionPool(settings(),{topics:[],formats:[],angles:[]}),/No compatible/)
 const broken=structuredClone(readingCatalogs);broken.formats[0].angleIds[0]='missing-angle'
 assert.throws(()=>selectReadingCombination(settings(),()=>0,broken),/Unknown angle/)
 const empty=structuredClone(readingCatalogs);for(const f of empty.formats)f.angleIds=[]
 for(const f of empty.formats)f.shortAngleIds=[]
 assert.throws(()=>getSelectionPool(settings(),empty),/No compatible/)
 const duplicate=structuredClone(readingCatalogs);duplicate.topics.push(duplicate.topics[0]);assert.throws(()=>validateCatalogs(duplicate),/Duplicate/)

 // Actual state controller, settings preservation/reset and explicit recovery.
 const changes=[]
 const snapshot={settings:initial.initialSettings,combination:initial.initialCombination,prompt:initial.initialPrompt,revision:0,spinCount:0}
 let selections=0
 const controller=createDrumSpinController(snapshot,s=>changes.push(s),s=>{selections++;return selectReadingCombination(s,()=>0)})
 controller.changeSettings({...snapshot.settings,language:languages.find(l=>l.code==='ja')})
 assert.deepEqual(controller.getState().snapshot.combination,snapshot.combination)
 assert.ok(controller.getState().snapshot.prompt.includes('Japanese'))
 assert.equal(controller.getState().snapshot.updateCount,1)
 const unchanged=controller.getState().snapshot;controller.changeSettings(unchanged.settings);assert.equal(controller.getState().snapshot,unchanged)
 controller.changeSettings({...snapshot.settings,cefrLevel:'A1'})
 assert.equal(controller.getState().snapshot.combination,null);assert.equal(controller.getState().snapshot.prompt,'');assert.ok(controller.getState().error.includes('Press SPIN'))
 controller.changeSettings(snapshot.settings)
 assert.equal(controller.getState().snapshot.combination,null);assert.equal(selections,0)
 controller.start();assert.equal(selections,1);assert.ok(controller.getState().run);controller.finishCurrent()
 assert.equal(controller.getState().snapshot.updateCount,1,'SPIN must not trigger settings-update feedback or rewind its counter')
 assert.ok(checkCombination(controller.getState().snapshot.settings,controller.getState().snapshot.combination).valid)
 const note=combination('travel','personal-note','request-for-help')
 const noteController=createDrumSpinController({settings:settings('A1','short'),combination:note,prompt:buildPrompt(settings('A1','short'),note),revision:0,spinCount:0},()=>{})
 noteController.changeSettings(settings('A1','medium'));assert.equal(noteController.getState().snapshot.prompt,'');assert.match(noteController.getState().error,/unavailable for Medium/)
 const kept=controller.getState().snapshot
 for(const field of ['language','cefrLevel','textLength']){
  const s={...kept.settings,[field]:field==='language'?languages.find(x=>x.code==='ru'):field==='cefrLevel'?'C2':'long'}
  const c=createDrumSpinController(kept,()=>{});c.changeSettings(s)
  assert.deepEqual(c.getState().snapshot.combination,kept.combination);assert.equal(c.getState().snapshot.prompt,buildPrompt(s,kept.combination))
 }
 const failed=createDrumSpinController(snapshot,()=>{},()=>{throw new Error('No compatible set')})
 failed.start();assert.equal(failed.getState().run,null);assert.equal(failed.isBusy(),false);assert.ok(failed.getState().error)
 // Copy gets exactly the new text and epochs reject a stale A -> B -> A reply.
 let resolve;const statuses=[],writes=[]
 const copier=createPromptCopier(s=>statuses.push(s),p=>{writes.push(p);return new Promise(r=>{resolve=r})})
 copier.reset(snapshot.prompt);const pending=copier.copy(),completeOld=resolve
 const fresh=buildPrompt({...snapshot.settings,language:languages.find(x=>x.code==='ru')},snapshot.combination)
 copier.reset(fresh);assert.equal(statuses.at(-1),'idle');const before=statuses.length;completeOld();await pending;assert.equal(statuses.length,before)
 const current=copier.copy();assert.equal(writes.at(-1),fresh);resolve();await current;assert.equal(statuses.at(-1),'success')
 const stale=copier.copy(),old=resolve;copier.reset('B');copier.reset(fresh);const count=statuses.length;old();await stale;assert.equal(statuses.length,count)
 copier.cancel();const n=writes.length;await copier.copy();assert.equal(writes.length,n)
 // Feedback: one restartable timer, stale callbacks, spin/reset and disposal.
 let timer=0;const tasks=new Map(),visible=[]
 const feedback=createPromptUpdateFeedback(v=>visible.push(v),{schedule:(fn,delay)=>{assert.equal(delay,1600);tasks.set(++timer,fn);return timer},clear:id=>tasks.delete(id)})
 assert.equal(promptUpdateDuration,1600);feedback.show();const staleTimer=tasks.get(1);feedback.show();assert.equal(tasks.size,1);staleTimer();assert.equal(visible.at(-1),true)
 const fire=tasks.get(2);tasks.delete(2);fire();assert.equal(visible.at(-1),false);feedback.show();feedback.cancel();assert.equal(tasks.size,0);feedback.show();feedback.dispose();assert.equal(tasks.size,0)
 return {counts:{topics:26,formats:44,angles:30,languages:11,levels:15,lengths:3},exhaustive,matrix,boundaries:boundaries.length,randomSeed:'0x51a10',invalidRandomSamples:20,coverage:{topics:coveredTopics.size,formats:coveredFormats.size,angles:coveredAngles.size},durationMs:Math.round(performance.now()-started),stateAndClipboard:'passed',feedback:'passed',browser:'unverified: in-app Browser EPERM; no external browser launched'}
}
