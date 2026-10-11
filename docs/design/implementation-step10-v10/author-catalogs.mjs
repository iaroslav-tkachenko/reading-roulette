// One-time/repeatable authoring tool. The app imports only the generated static TS.
// Approved IDs, labels, thresholds, models and statuses come directly from Markdown.
import fs from 'node:fs'
import assert from 'node:assert/strict'
const read = file => fs.readFileSync(file, 'utf8')
const rows = file => read(file).split(/\r?\n/).filter(x => x.startsWith('| ')).map(x => x.split('|').slice(1, -1).map(c => c.trim()))
const rank = { A1: 0, A2: 1, B1: 2, B2: 3, 'C1+': 4 }
const entries = file => rows(file).filter(r => r[3] in rank)
const topicRows = entries('docs/TOPICS.md')
const angleRows = entries('docs/ANGLES.md')
const formatRows = entries('docs/FORMATS.md')
const all = topicRows.map(r => r[0])
const ids = text => text.split(' ')
// Each anchor includes the topic's concrete scope AND exclusions at its minimum.
const topicHints = [
 ['Rooms, furniture and simple household chores; exclude leases, building regulations and technical systems.', 'Home routines, arranging a room and sharing chores; exclude legal or engineering detail.'],
 ['Foods, dishes, tastes and simple cooking actions; exclude nutritional biochemistry and specialist techniques.', 'Preparing a familiar meal and comparing simple cooking choices; no specialist food science.'],
 ['Goods, prices, quantities and a simple order; exclude credit terms, contracts and legal disputes.', 'A concrete purchase, delivery or return with simple conditions; no credit or legal theory.'],
 [null, 'A personal weekly budget, ordinary expenses or saving for a purchase; exclude investment, tax and financial models.'],
 ['Nearby places, their positions and simple city amenities; exclude urban policy and infrastructure management.', 'Using a neighborhood service or public space and a concrete change to it; no urban governance theory.'],
 ['A familiar vehicle, departure time, stop and simple route; exclude logistics, tariff policy and transport systems.', 'A familiar journey, route choice or timetable change; exclude complex logistics and tariff policy.'],
 ['A destination, lodging and simple traveler actions; exclude visas, legal conditions and complex itineraries.', 'One manageable trip, accommodation or sightseeing plan; exclude immigration and complex legal procedures.'],
 ['Family roles, shared activities, simple requests and feelings; exclude psychological theories, hidden motives and complex conflicts.', 'A familiar relationship, a clear misunderstanding or a shared decision with explicit reasons; no psychological theory.'],
 ['A job, workplace and simple duties; exclude management strategy, employment contracts and organizational conflict.', 'A concrete team task, job search or everyday work decision; no management strategy or employment law.'],
 ['School subjects, a timetable and simple learning actions; exclude education policy and methodological disputes.', 'A study habit, course or practical skill and straightforward reasons; no education-policy or methodological theory.'],
 ['Sleep, rest and simple descriptions of wellbeing; exclude diagnosis, treatment and medical mechanisms.', 'Sleep, rest and everyday wellbeing habits with simple reasons; no diagnoses, treatment plans or medical mechanisms.'],
 ['A sport, players, venue and basic actions; exclude detailed regulations, sports medicine and complex tactics.', 'A familiar training session or match and a simple comparison; exclude sports medicine and complex tactics.'],
 ['A favorite pastime, its objects and basic actions; exclude specialist techniques and complex game rules.', 'A concrete hobby activity or simple project with understandable steps; no specialist techniques.'],
 ['A work of art, its characters and simple impressions; exclude artistic theory, symbolism and cultural criticism.', 'A familiar film, book, song or exhibition with concrete features and simple reasons; no abstract art theory.'],
 [null, 'Familiar words, learning a language or one concrete communication misunderstanding; exclude linguistic theory.'],
 [null, 'One concrete custom, celebration or etiquette practice; exclude national-character generalizations and cultural theory.'],
 [null, 'One simple historical episode, supported biographical fact or comparison of daily life then and now; no complex historical causation.'],
 ['Visible features of animals and plants, habitats, weather and simple actions; exclude genetics, complex ecosystems and scientific mechanisms.', 'Observing a familiar animal, plant or natural place with simple connections; no genetics or complex ecosystem models.'],
 [null, 'Everyday actions involving water, energy or waste; exclude climate models and political mechanisms.'],
 [null, 'One observable process or simple experiment and a short concrete explanation; exclude formulas and specialist theories.'],
 ['A familiar device and its basic functions; exclude algorithms, system architecture and digital policy.', 'A familiar app or device and one concrete use or change; no algorithms, system architecture or digital policy.'],
 [null, 'A familiar public rule, service or form of participation; exclude political systems and complex legal issues.'],
 [null, 'Sky observation, basic celestial-body facts or an astronaut action; exclude astrophysics and orbital calculations.'],
 [null, 'A small familiar business, product, customer, order or simple work organization; exclude strategy, corporate finance and company law.'],
 ['Color, shape, size and arrangement of an object or building; exclude design theory, architectural movements and engineering calculations.', 'A concrete object or space and a simple design choice; exclude architectural theory and engineering calculations.'],
 [null, null],
]
const broader = [
 'Housing, domestic routines and arranging living spaces; keep building design within the separate architecture topic.',
 'Ingredients, cooking processes and tastes; keep purchasing and service transactions within shopping.',
 'Products, orders, delivery, returns and service quality; keep personal budgeting within finance.',
 'Personal budgeting, spending, saving and financial habits; company finance belongs to business.',
 'Neighborhoods, public spaces, amenities and community life; institutions belong to society.',
 'Vehicles, everyday journeys, routes and transport operations; traveler experiences belong to travel.',
 'Destinations, lodging, sights and traveler experiences.',
 'Family, friendship, partnership, support and interactions between people.',
 'Professions, tasks, teams, job seeking and career choices; founding and managing companies belongs to business.',
 'Study habits, skills and educational systems; language structure belongs to languages and communication.',
 'Sleep, rest, wellbeing and everyday health care; distinguish general information from personal medical advice.',
 'Sports, training, competitions, teams and sporting experience.',
 'Personal leisure, games, collecting and crafts; works and cultural industries belong to arts.',
 'Music, films, literature, theatre, exhibitions and works of art; designing spaces belongs to design.',
 'Words, translation, language differences, learning and language use; a conversation alone does not establish this topic.',
 'Customs, celebrations, etiquette and cultural practices; historical analysis belongs to history; avoid stereotypes.',
 'Past periods, supported events, historical change and life in the past; distinguish evidence and interpretation.',
 'Animals, plants, habitats, seasons and observation; human environmental impact belongs to environment.',
 'Human impacts, resources, waste and conservation choices.',
 'Observable phenomena, research and experiments; astronomy and applied devices have separate topics.',
 'Devices, software, internet use, digital habits and technological change.',
 'Public rules, rights, institutions and collective decisions; abstract values belong to philosophy.',
 'Celestial bodies, sky observation, space exploration and the universe; science-fiction genre alone does not establish this topic.',
 'Starting and operating a business, products, customers and commercial decisions.',
 'Appearance and function of objects, buildings and spaces; ordinary household chores belong to home.',
 'Values, fairness, responsibility and reasons for choices; ordinary politeness alone belongs to relationships.',
]
const simpleFocus = [
 'the rooms, objects and shared chores in one home', 'preparing one familiar meal', 'one ordinary shop order and its goods and prices',
 'one person\'s weekly spending and savings', 'one neighborhood library and its familiar public space', 'one familiar bus route and its stops and times',
 'one simple visit and its guesthouse arrangements', 'shared activities and support in one family or friendship', 'one team\'s concrete everyday work task',
 'one learner\'s course timetable and study habit', 'one person\'s sleep and rest routine', 'one familiar team\'s practice session', 'one simple hobby project',
 'one book or film and its concrete characters and features', 'learning and using a few familiar words in another language', 'preparing for one familiar local celebration',
 'one supported example of ordinary daily life in the past', 'observing one familiar animal in its habitat', 'saving water or sorting waste in one household',
 'one observable experiment such as ice melting', 'one familiar phone app and its basic use', 'using one familiar public service and its simple rules',
 'observing the Moon and its visible features', 'a small shop, its customers and ordinary orders', 'the colors, shapes and arrangement in one room or building',
 'an everyday choice involving honesty and fairness',
]
const topics = topicRows.map((r, i) => ({
 id: r[0], label: r[2], minProfile: r[3], promptHint: broader[i],
 simpleFocus: simpleFocus[i],
 disclosures: Object.fromEntries(Object.keys(rank).filter(p => rank[p] >= rank[r[3]]).map(p => [p,
  p === 'A1' ? topicHints[i][0] : p === 'A2' ? topicHints[i][1] : i === 25 ? (
   p === 'B1' ? 'One everyday dilemma about honesty, fairness or responsibility, with explicit reasons. Exclude philosophical schools, metaethics and abstract theoretical disputes.' :
   p === 'B2' ? 'Explain principles and compare arguments in a concrete ethical situation. Define concepts; exclude philosophical schools, metaethics and abstract theoretical disputes.' :
   'Philosophical schools, theoretical approaches and metaethics are permitted when clearly explained and suited to the selected format and length.'
  ) : `${broader[i]} ${p === 'B1' ? 'Use familiar examples, explicit causes, consequences or viewpoints; explain every necessary concept.' : p === 'B2' ? 'Systems and professional or public questions are permitted with explained specialist concepts.' : 'Abstract approaches and nuances are permitted within the selected format and length; do not add jargon for its own sake.'}`
 ])),
}))
const angleHints = [
 'Introduce one person, place, object or activity to a newcomer through its essential concrete features.',
 'Show familiar recurring actions, daily use or an ordinary routine in chronological or functional order.',
 'State a person or group\'s near-term plan: what they intend to do, when and where.',
 'Locate concrete objects or places with consistent landmarks and spatial relationships.',
 'Focus on one concrete feature and why it matters. It need not be hidden or surprising; a detective clue requires the detective format.',
 'Show preparation or actions for a specific celebration, meeting or arrival of guests.',
 'Make clear what help is needed, why, and the specific request to another person.',
 'Invite someone to a concrete event, give necessary details and include a response where the format permits.',
 'Clarify missing information about time, place, conditions or actions; do not invent complex conflict.',
 'Agree on one option using the participants\' stated preferences and simple reasons.',
 'Identify what participants understood differently and show how it is clarified.',
 'Evaluate a concrete action or result and offer a useful specific suggestion for next time.',
 'Discover an object or information that changes subsequent actions or understanding.',
 'Explain what plan changed, the concrete reason and what participants do next.',
 'Present a specific difficulty, actions to overcome it and the outcome.',
 'Show the intended action, what failed and a reasonable lesson; do not impose a happy ending.',
 'Show how the outcome differs from expectations and what that means. In sourced material, both expectations and outcome must be supported.',
 'Trace the effects of a decision on people, events or later work with explicit links.',
 'Explain the operation of one process or object in an understandable order; do not substitute an explanation of causes.',
 'Explain supported causes of one phenomenon and the links between them.',
 'Compare exactly two options using the same clear criteria for both.',
 'Compare one concrete object, process or way of life in two periods.',
 'Compare initial expectations with actual experience; fictional experience must be identified as a training scenario.',
 'Correct one genuinely established misconception with grounded facts. Never invent a popular myth; if its prevalence or correction cannot be supported, say the task cannot be completed faithfully.',
 'Describe one concrete change, its extent and its meaning for affected people or a process.',
 'Distinguish decisions made, next actions and unresolved questions. Missing real agreements must not be invented.',
 'Identify a recurring pattern actually present in the observations or data. Do not invent trends or turn correlation into causation.',
 'Present distinct positions on the same question and the reasons for each; sourced positions must be actually published.',
 'Present alternatives that each require a sacrifice and explain the trade-off.',
 'Explain what a solution is useful for, its benefits and the conditions that limit its use.',
]
const spatial = ids('home-household food-cooking shopping-services city-life transport travel work-careers learning-education sports hobbies-leisure arts-entertainment nature-wildlife environment technology-digital-life space-astronomy business-entrepreneurship design-architecture')
const processTopics = ids('home-household food-cooking shopping-services money-personal-finance city-life transport travel work-careers learning-education health-wellbeing sports hobbies-leisure languages-communication culture-traditions nature-wildlife environment science-discoveries technology-digital-life society-public-life space-astronomy business-entrepreneurship design-architecture')
const grounded = ids('food-cooking money-personal-finance transport learning-education health-wellbeing sports languages-communication culture-traditions history nature-wildlife environment science-discoveries technology-digital-life society-public-life space-astronomy business-entrepreneurship design-architecture')
const simpleActions = [
 'Introduce the essential people, place, objects or activity involved in {focus} to a newcomer.',
 'Show a familiar sequence of ordinary actions involved in {focus}.',
 'State what a person or group plans to do next about {focus}, and when and where.',
 'Identify concrete objects, places and landmarks involved in {focus}, and explain where they are.',
 'Identify one visible feature or necessary practical detail in {focus} and explain its immediate importance.',
 'Show concrete preparations or actions for a specific celebration or meeting involving {focus}.',
 'Have one participant request a specific simple action from another person involved in {focus}; state the concrete need.',
 'Invite a person to a specific shared activity involving {focus}; give time, place and necessary details.',
 'Clarify one missing time, place, condition or action involving {focus}.',
 'Have participants choose between two concrete options involving {focus} using explicit preferences.',
 'Show one concrete misunderstanding about {focus} and how the participants clarify it.',
 'Evaluate one concrete action or result involving {focus} and offer one useful suggestion.',
 'Show how finding one object or piece of information about {focus} changes the next action.',
 'Change one specific plan involving {focus}; explain the simple reason and the next action.',
 'Resolve one concrete practical difficulty involving {focus} and show the result.',
 'Show an attempted action involving {focus}, what did not work and one simple lesson.',
 'Compare one expected and actual outcome involving {focus}, without forcing a happy ending.',
 'Trace the consequences of one explicit decision involving {focus}.',
 'Explain one simple observable process or sequence of operations involved in {focus}.',
 'Explain supported causes of one concrete phenomenon involved in {focus}.',
 'Compare two concrete options involving {focus} by the same two clear criteria.',
 'Compare one concrete aspect of {focus} in two periods using supported facts or explicitly fictional circumstances.',
 'Compare an explicit expectation about {focus} with a supported or labeled training experience.',
 'Correct one established misconception about {focus} using grounded facts.',
 'Describe one concrete change involving {focus}, its extent and its immediate meaning.',
 'Distinguish decisions, actions and unresolved questions involving {focus}.',
 'Identify a pattern actually present in observations or data about {focus}.',
 'Present distinct viewpoints and explicit reasons about {focus}.',
 'Describe a trade-off between two options involving {focus}.',
 'Explain benefits and conditions of limited applicability involving {focus}.',
]
const angles = angleRows.map((r, i) => ({id:r[0],label:r[2],minProfile:r[3],promptHint:angleHints[i],simpleAction:simpleActions[i],topicIds:r[0]==='spatial-orientation'?spatial:r[0]==='how-it-works'?processTopics:r[0]==='common-misconception'?grounded:all}))
// Positive semantic scopes, deliberately narrower than the whole cross product.
const daily = ids('home-household food-cooking shopping-services city-life transport travel family-relationships work-careers learning-education health-wellbeing sports hobbies-leisure arts-entertainment culture-traditions nature-wildlife technology-digital-life design-architecture')
const actions = ids('home-household food-cooking shopping-services money-personal-finance city-life transport travel work-careers learning-education health-wellbeing sports hobbies-leisure languages-communication culture-traditions nature-wildlife environment science-discoveries technology-digital-life business-entrepreneurship design-architecture')
const work = ids('work-careers learning-education technology-digital-life business-entrepreneurship design-architecture environment')
const data = ids('money-personal-finance city-life transport work-careers learning-education health-wellbeing sports environment science-discoveries technology-digital-life society-public-life space-astronomy business-entrepreneurship')
// [topic scope, angle IDs, mandatory structure in English]. These are explicit
// format-level allowlists; angle-topic restrictions and minimum profiles intersect them.
const specs = [
 [all, 'everyday-routine first-introduction upcoming-plans special-occasion request-for-help overlooked-detail unexpected-discovery change-of-plans problem-and-solution misunderstanding shared-choice unsuccessful-attempt unexpected-outcome difficult-choice consequences-of-a-decision', 'A character, a concrete everyday situation, a sequence of actions and a clear ending.'],
 [daily, 'upcoming-plans unexpected-discovery change-of-plans problem-and-solution unsuccessful-attempt unexpected-outcome difficult-choice', 'A protagonist\'s goal, obstacle, actions to overcome it and outcome.'],
 [ids('home-household shopping-services city-life travel work-careers arts-entertainment history technology-digital-life'), 'overlooked-detail unexpected-discovery misunderstanding unexpected-outcome consequences-of-a-decision', 'A mystery, meaningful clues and an explanation consistent with those clues.'],
 [ids('transport work-careers learning-education nature-wildlife environment science-discoveries technology-digital-life society-public-life space-astronomy'), 'unexpected-discovery problem-and-solution unexpected-outcome consequences-of-a-decision difficult-choice', 'One understandable speculative scientific or technological premise and consequences for characters; mark the premise as fictional rather than established science.'],
 [ids('home-household travel family-relationships hobbies-leisure arts-entertainment culture-traditions history nature-wildlife philosophy-ethics'), 'first-introduction special-occasion unexpected-discovery problem-and-solution difficult-choice consequences-of-a-decision', 'One understandable rule of an unusual world and events consistent with that rule.'],
 [ids('family-relationships work-careers learning-education hobbies-leisure nature-wildlife money-personal-finance business-entrepreneurship philosophy-ethics'), 'everyday-routine shared-choice problem-and-solution unsuccessful-attempt unexpected-outcome difficult-choice consequences-of-a-decision', 'A short fictional action and a clear lesson; at A2 do not introduce abstract philosophical theory.'],
 [all.filter(id=>id!=='philosophy-ethics'), 'first-introduction spatial-orientation overlooked-detail everyday-routine then-and-now', 'Ordered concrete features of a real person, place or object that allow the reader to picture it.'],
 [all, 'how-it-works why-it-happens comparing-two-options then-and-now common-misconception what-changed strengths-and-limitations', 'One main question, a sequential grounded explanation and a concrete example.'],
 [all.filter(id=>id!=='philosophy-ethics'), 'first-introduction overlooked-detail then-and-now what-changed', 'Introduce a real object or person and group supported facts by subject.'],
 [actions, 'first-introduction clarifying-details request-for-help how-it-works comparing-two-options strengths-and-limitations', 'Concrete questions and direct answers, each answering its own question.'],
 [all, 'first-introduction everyday-routine feedback how-it-works change-of-plans problem-and-solution then-and-now different-viewpoints', 'Distinct interviewer and interviewee roles, with questions and answers about experience, activity or a process. Identify the invented interviewee. Do not invent answers for real people.'],
 [data, 'what-changed noticeable-pattern comparing-two-options why-it-happens strengths-and-limitations consequences-of-a-decision', 'State the subject of observation or research, supported results and conclusions with their basis. Use actual evidence; do not invent a study.'],
 [ids('city-life transport travel work-careers learning-education sports arts-entertainment culture-traditions history nature-wildlife environment science-discoveries technology-digital-life society-public-life space-astronomy business-entrepreneurship design-architecture'), 'what-changed upcoming-plans special-occasion overlooked-detail unexpected-outcome', 'A concise verified event: what happened, where and when, who participated and what is reliably known.'],
 [ids('city-life transport travel work-careers sports arts-entertainment culture-traditions environment science-discoveries technology-digital-life society-public-life space-astronomy business-entrepreneurship'), 'special-occasion what-changed overlooked-detail different-viewpoints unexpected-outcome', 'A supported sequence of an event, participants, verified details and context. Distinguish sourced information from author interpretation; never imply the writer witnessed the event.'],
 [ids('food-cooking shopping-services travel learning-education sports hobbies-leisure arts-entertainment technology-digital-life design-architecture'), 'feedback overlooked-detail comparing-two-options expectations-and-reality strengths-and-limitations', 'A fictional reviewer\'s concrete impression, strengths or weaknesses and simple reasons. Use a fictional object or supported characteristics of a real one; never claim actual visiting, purchasing or testing.'],
 [ids('food-cooking shopping-services travel learning-education sports hobbies-leisure arts-entertainment technology-digital-life design-architecture'), 'comparing-two-options strengths-and-limitations expectations-and-reality', 'Two objects, shared comparison criteria and a reasoned conclusion; identify the training comparison and do not invent real characteristics.'],
 [all, 'what-changed different-viewpoints difficult-choice consequences-of-a-decision strengths-and-limitations expectations-and-reality', 'An explicit author position, examples and reasons; distinguish opinion from established facts.'],
 [all, 'difficult-choice different-viewpoints comparing-two-options consequences-of-a-decision strengths-and-limitations', 'A thesis, supporting arguments, a counterargument and a conclusion; evidence must have a basis.'],
 [all, 'different-viewpoints difficult-choice comparing-two-options', 'Two distinct positions, arguments for each and responses to the other side; distinguish the voices.'],
 [all, 'first-introduction special-occasion invitation upcoming-plans different-viewpoints decisions-and-next-steps strengths-and-limitations', 'Define a concrete purpose and audience fitting the topic and angle. Address the audience, introduce the main point, support it with examples and close. This may be informative or ceremonial; do not force emotional persuasion or attribute the new speech to a real speaker.'],
 [daily, 'upcoming-plans request-for-help invitation clarifying-details overlooked-detail', 'A clear recipient and one concrete message or request.'],
 [all, 'upcoming-plans request-for-help invitation clarifying-details shared-choice misunderstanding change-of-plans problem-and-solution feedback', 'A sequence of messages from distinct participants who respond to previous messages.'],
 [all, 'first-introduction everyday-routine upcoming-plans special-occasion request-for-help invitation change-of-plans unexpected-discovery', 'A greeting, a coherent message to a specific recipient and a closing.'],
 [all, 'everyday-routine special-occasion overlooked-detail unexpected-discovery unsuccessful-attempt unexpected-outcome expectations-and-reality difficult-choice', 'First-person events, observations and personal reactions from a fictional author.'],
 [all, 'first-introduction upcoming-plans request-for-help invitation clarifying-details shared-choice misunderstanding change-of-plans problem-and-solution', 'Named or clearly distinct speakers in a concrete developing conversation.'],
 [all, 'everyday-routine unexpected-discovery unsuccessful-attempt expectations-and-reality then-and-now strengths-and-limitations', 'A fictional author\'s experience for a readership, with context and a conclusion.'],
 [daily, 'upcoming-plans special-occasion invitation change-of-plans request-for-help', 'What is happening or needed, where and when, with only necessary details.'],
 [ids('home-household food-cooking shopping-services transport travel work-careers learning-education sports hobbies-leisure arts-entertainment technology-digital-life business-entrepreneurship design-architecture'), 'first-introduction overlooked-detail special-occasion', 'A concrete offer, essential characteristics, price or conditions and a clearly fictional contact.'],
 [ids('food-cooking'), 'first-introduction special-occasion', 'Sections, dish names, short descriptions and prices for a fictional establishment.'],
 [ids('transport travel work-careers learning-education sports hobbies-leisure arts-entertainment culture-traditions business-entrepreneurship'), 'upcoming-plans everyday-routine special-occasion what-changed', 'Ordered events, times and necessary location details in a fictional timetable.'],
 [ids('home-household shopping-services transport travel work-careers learning-education health-wellbeing sports hobbies-leisure business-entrepreneurship'), 'first-introduction clarifying-details', 'Clear field labels and consistent fictional completed values; never collect or imply real personal data.'],
 [actions, 'how-it-works problem-and-solution request-for-help', 'A goal, ordered correct actions, prerequisites and the expected result; explain an executable task.'],
 [actions, 'problem-and-solution comparing-two-options strengths-and-limitations how-it-works', 'Practical recommendations, grounded reasons for using them and conditions of applicability.'],
 [ids('shopping-services travel work-careers learning-education technology-digital-life business-entrepreneurship design-architecture'), 'request-for-help clarifying-details upcoming-plans change-of-plans feedback decisions-and-next-steps', 'A business purpose, necessary details and the recipient\'s expected action; do not add guesses to supplied real materials.'],
 [ids('home-household shopping-services city-life transport travel work-careers learning-education society-public-life business-entrepreneurship'), 'what-changed change-of-plans upcoming-plans decisions-and-next-steps', 'An addressee, a change or requirement, deadlines and procedure. Keep the presentation neutral.'],
 [work, 'what-changed problem-and-solution unsuccessful-attempt decisions-and-next-steps strengths-and-limitations', 'Completed work, remaining tasks, problems and next steps; identify the training scenario or strictly adapt supplied notes.'],
 [ids('work-careers technology-digital-life business-entrepreneurship'), 'decisions-and-next-steps change-of-plans problem-and-solution clarifying-details', 'A structured follow-up to a specific IT meeting, not a transcript: purpose, participants or roles, decisions, actions with owners and deadlines, and open questions. In real notes use "not assigned" or "not agreed" for missing owners/deadlines. Do not turn proposals into decisions. Otherwise create and label a wholly fictional consistent meeting.'],
 [spatial, 'first-introduction spatial-orientation everyday-routine overlooked-detail special-occasion', 'Generate a concrete training scene and a separate text about the actually shown objects, people and actions.'],
 [daily, 'everyday-routine special-occasion request-for-help upcoming-plans unexpected-discovery change-of-plans problem-and-solution', 'Generate a sequence of consistent scenes and a connecting fictional text; keep characters and events consistent across frames.'],
 [actions, 'how-it-works problem-and-solution request-for-help', 'Generate illustrations of correct task steps and corresponding explanations in the same order.'],
 [ids('home-household city-life transport travel work-careers learning-education sports nature-wildlife design-architecture'), 'spatial-orientation first-introduction upcoming-plans', 'Generate a spatial plan and explain positions or a route with consistent landmarks. Use a fictional place, never imply a reliable map of a real route.'],
 [ids('food-cooking money-personal-finance transport learning-education health-wellbeing sports languages-communication culture-traditions nature-wildlife environment science-discoveries technology-digital-life space-astronomy business-entrepreneurship design-architecture'), 'first-introduction how-it-works comparing-two-options then-and-now what-changed', 'Generate visually organized grounded facts and a separate explanation of the displayed relationships. Use stable qualitative facts, not invented statistics.'],
 [data, 'noticeable-pattern what-changed comparing-two-options then-and-now', 'First define a small explicitly fictional training dataset. Generate a chart and a description using identical values, units, categories and periods.'],
 [data, 'noticeable-pattern what-changed comparing-two-options strengths-and-limitations decisions-and-next-steps', 'Use a small explicitly fictional dataset to generate a table or chart, a coherent analysis, conclusions and data limitations; all representations must agree.'],
]
assert.equal(specs.length, 44)
const families = ['fiction', 'information', 'opinion', 'personal', 'practical', 'visual']
const registers = [
 'Neutral narrative register, third-person narration. Use expression to support the plot; do not randomly switch perspective.',
 'Neutral informative register, external narrator; for interviews distinguish question and answer roles.',
 'Neutral or journalistic register and an explicit author perspective; separate debate voices. For speech use an audience-appropriate spoken register.',
 'Conversational or neutral personal register, no compulsory slang. Use the sender\'s perspective; diary and blog use first person, exchanges separate voices.',
 'Neutral practical register; business email, formal notice, progress report and meeting follow-up use business register. The compiler or sender speaks; instructions address the person carrying out the task.',
 'Neutral descriptive or instructional register, observer or compiler of the explanation.',
]
const lengthRows = rows('docs/LEVELS_LENGTH.md')
const statusRows = rows('docs/CONTENT_STATUS.md')
let family = -1
const familyById = new Map()
for (const line of read('docs/FORMATS.md').split(/\r?\n/)) {
 if (/^## .+ — \d+$/.test(line)) family++
 if (line.startsWith('| ')) { const r = line.split('|').slice(1,-1).map(x=>x.trim()); if(r[3] in rank) familyById.set(r[0],family) }
}
const formats = formatRows.map((r, i) => {
 const f = familyById.get(r[0]), len = lengthRows.find(x=>x[0]===r[0] && x.length===6), status = statusRows.find(x=>x[0]===r[0])
 const [topicIds, angleText, promptHint] = specs[i]
 const angleIds = ids(angleText)
 // A compact response cannot carry multi-stage comparisons/trade-offs alongside
 // a counterargument or two full rebuttals. Other short structures remain allowed.
 const shortAngleIds = angleIds.filter(a => !(['argumentative-essay','written-debate','informational-report','visual-report'].includes(r[0]) && ['difficult-choice','decisions-and-next-steps','consequences-of-a-decision'].includes(a)))
 return {id:r[0],label:r[2],minProfile:r[3],family:families[f],volumeModel:len[2],lengths:['short','medium','long'].filter((_,j)=>len[j+3]==='Да'),contentStatus:status[1],promptHint,registerHint:registers[f],topicIds,angleIds,shortAngleIds}
})
const patches = []
for (const [name, catalog, type, count] of [['topics',topics,'ReadingTopic',26],['formats',formats,'ReadingFormat',44],['angles',angles,'ReadingAngle',30]]) {
 assert.equal(catalog.length,count)
 assert.ok(catalog.every(x=>x.promptHint && (!x.disclosures || Object.values(x.disclosures).every(Boolean))))
 const formatted = JSON.stringify(catalog,null,2).replace(/"(topicIds|angleIds|shortAngleIds|lengths)": (\[[^\]]*\])/g, (_, key, value) => `"${key}": ${JSON.stringify(JSON.parse(value))}`)
 const file = `src/data/${name}.ts`
 const output = `// Canonical catalog; authored from approved docs by implementation-step10-v10/author-catalogs.mjs.\nimport type { ${type} } from '../types/reading'\n\nexport const ${name}: readonly ${type}[] = ${formatted}\n`
 if (process.argv.includes('--patch')) {
  const old = read(file)
  if (old !== output) patches.push(`*** Update File: ${file}\n@@\n${old.trimEnd().split(/\r?\n/).map(line=>'-'+line).join('\n')}\n${output.trimEnd().split('\n').map(line=>'+'+line).join('\n')}`)
 } else fs.writeFileSync(file, output)
}
if (process.argv.includes('--patch')) console.log(`*** Begin Patch\n${patches.join('\n')}\n*** End Patch`)
else console.log('Authored 26 topics / 44 formats / 30 angles; no runtime Markdown dependency.')
