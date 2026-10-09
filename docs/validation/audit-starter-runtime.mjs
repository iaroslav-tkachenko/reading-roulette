import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const require = createRequire(path.join(root, 'package.json'));
const ts = require('typescript');
const cache = new Map();
function moduleUrl(file) {
  file = path.resolve(root, file);
  if (cache.has(file)) return cache.get(file);
  const result = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2023 },
  });
  const output = result.outputText.replace(/from\s+(['"])(\.[^'"]+)\1/g, (_, quote, specifier) => {
    const target = path.resolve(path.dirname(file), `${specifier}.ts`);
    return `from ${quote}${moduleUrl(target)}${quote}`;
  });
  const url = `data:text/javascript;base64,${Buffer.from(output).toString('base64')}`;
  cache.set(file, url);
  return url;
}
const load = file => import(moduleUrl(file));
const { topics } = await load('src/data/topics.ts');
const { formats } = await load('src/data/formats.ts');
const { angles } = await load('src/data/angles.ts');
const { languages } = await load('src/data/languages.ts');
const { cefrLevels } = await load('src/data/cefrLevels.ts');
const { textLengths } = await load('src/data/textLengths.ts');
const { selectReadingCombination } = await load('src/random/selectReadingCombination.ts');
const { buildPrompt } = await load('src/prompt/buildPrompt.ts');
for (const catalog of [topics, formats, angles]) {
  assert.equal(new Set(catalog.map(item => item.id)).size, catalog.length);
  assert(catalog.every(item => item.id && item.label && item.promptHint));
}

let combinations = 0;
let prompts = 0;
for (let t = 0; t < topics.length; t++) {
  for (let f = 0; f < formats.length; f++) {
    const format = formats[f];
    assert(format.angleIds.length > 0);
    assert.equal(new Set(format.angleIds).size, format.angleIds.length);
    for (let a = 0; a < format.angleIds.length; a++) {
      const samples = [(t + .5) / topics.length, (f + .5) / formats.length, (a + .5) / format.angleIds.length];
      let draws = 0;
      const selected = selectReadingCombination(() => samples[draws++]);
      assert.equal(draws, 3);
      assert.equal(selected.topic, topics[t]);
      assert.equal(selected.format, format);
      assert.equal(selected.angle.id, format.angleIds[a]);
      assert(!('tone' in selected));
      combinations++;
      for (const language of languages) for (const cefrLevel of Object.keys(cefrLevels)) for (const textLength of Object.keys(textLengths)) {
        const prompt = buildPrompt({ language, cefrLevel, textLength }, selected);
        assert(prompt.includes(`Topic: ${selected.topic.label}. ${selected.topic.promptHint}`));
        assert(prompt.includes(`Format: ${selected.format.label}. ${selected.format.promptHint}`));
        assert(prompt.includes(`Angle: ${selected.angle.label}. ${selected.angle.promptHint}`));
        assert(prompt.includes(`entirely in ${language.name}`));
        assert(prompt.includes(`Difficulty target: ${cefrLevel} (`));
        assert(prompt.includes(textLengths[textLength].wordRange));
        assert(!/^Tone:/m.test(prompt));
        prompts++;
      }
    }
  }
}
for (const sample of [0, 1 - Number.EPSILON]) {
  const selected = selectReadingCombination(() => sample);
  assert(selected.format.angleIds.includes(selected.angle.id));
  assert.deepEqual(selectReadingCombination(() => sample), selected);
}
for (const invalid of [NaN, Infinity, -1, 1, undefined]) for (let position = 0; position < 3; position++) {
  let draws = 0;
  assert.throws(() => selectReadingCombination(() => draws++ === position ? invalid : 0), /Random source/);
}
for (let i = 0; i < 500; i++) {
  const selected = selectReadingCombination();
  assert(selected.format.angleIds.includes(selected.angle.id));
}
// Mutations below affect only this disposable process, not repository files.
const savedIds = [...formats[0].angleIds];
formats[0].angleIds[0] = 'missing-angle';
assert.throws(() => selectReadingCombination(() => 0), /Unknown angle/);
formats[0].angleIds.splice(0);
assert.throws(() => selectReadingCombination(() => 0), /empty compatible angle/);
formats[0].angleIds.push(...savedIds);

const documents = ['README.md', 'PROJECT.md'];
function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) visit(file);
    else if (file.endsWith('.md')) documents.push(path.relative(root, file));
  }
}
visit(path.join(root, 'docs'));
let links = 0;
for (const document of documents) {
  const file = path.join(root, document);
  const content = fs.readFileSync(file, 'utf8');
  assert(!/^.*[\t ]+$/m.test(content), `Trailing whitespace in ${document}`);
  for (const match of content.matchAll(/\[[^\]]*\]\(([^\s)]+)\)/g)) {
    const target = match[1];
    if (/^[a-z]+:|^#/i.test(target)) continue;
    assert(fs.existsSync(path.resolve(path.dirname(file), target.split('#')[0])), `Broken link in ${document}: ${target}`);
    links++;
  }
}
const result = { date: '2026-10-09', scope: 'Current starter runtime only; HTTP and browser interactions excluded', runtimeCounts: { topics: topics.length, formats: formats.length, angles: angles.length, languages: languages.length, levels: Object.keys(cefrLevels).length, lengths: Object.keys(textLengths).length }, combinations, prompts, randomSelections: 500, invalidSamples: 15, brokenReferencesAndEmptySets: 'passed', documents: documents.length, localLinks: links };
fs.writeFileSync(path.join(root, 'docs/validation/runtime-audit-2026-10-09.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));