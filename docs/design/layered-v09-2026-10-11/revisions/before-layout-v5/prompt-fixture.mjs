import fs from 'node:fs';
import path from 'node:path';
import { stripTypeScriptTypes } from 'node:module';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '../../..');
// Build-time only: run the repository's actual pure generator, with its actual catalogs.
// No JavaScript is added to the static review page.
function source(file) {
  return stripTypeScriptTypes(fs.readFileSync(path.join(root,file),'utf8'))
    .replace(/^import .*$/gm,'').replace(/^export /gm,'');
}
function data(file, name) { return new Function(source(file) + `\nreturn ${name};`)(); }
export function createPromptFixture() {
  const cefrLevels = data('src/data/cefrLevels.ts','cefrLevels');
  const textLengths = data('src/data/textLengths.ts','textLengths');
  const languages = data('src/data/languages.ts','languages');
  const topics = data('src/data/topics.ts','topics');
  const formats = data('src/data/formats.ts','formats');
  const angles = data('src/data/angles.ts','angles');
  const buildPrompt = new Function('cefrLevels','textLengths',source('src/prompt/buildPrompt.ts') + '\nreturn buildPrompt;')(cefrLevels,textLengths);
  const settings = {language:languages.find(l=>l.code==='en'),cefrLevel:'B1+',textLength:'medium'};
  const combination = {topic:topics.find(t=>t.id==='travel'),format:formats.find(f=>f.id==='short-story'),angle:angles.find(a=>a.id==='unexpected-discovery')};
  const prompt = buildPrompt(settings,combination);
  const fixture = {source:'src/prompt/buildPrompt.ts',settings,combination,prompt,characters:prompt.length,paragraphs:prompt.split('\n\n').length};
  fs.writeFileSync(path.join(dir,'prompt-fixture.json'),JSON.stringify(fixture,null,2)+'\n');
  fs.writeFileSync(path.join(dir,'real-prompt.txt'),prompt+'\n');
  return fixture;
}
