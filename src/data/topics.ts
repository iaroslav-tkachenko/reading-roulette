// Canonical catalog; authored from approved docs by implementation-step10-v10/author-catalogs.mjs.
import type { ReadingTopic } from '../types/reading'

export const topics: readonly ReadingTopic[] = [
  {
    "id": "home-household",
    "label": "Home & household",
    "minProfile": "A1",
    "promptHint": "Housing, domestic routines and arranging living spaces; keep building design within the separate architecture topic.",
    "simpleFocus": "the rooms, objects and shared chores in one home",
    "disclosures": {
      "A1": "Rooms, furniture and simple household chores; exclude leases, building regulations and technical systems.",
      "A2": "Home routines, arranging a room and sharing chores; exclude legal or engineering detail.",
      "B1": "Housing, domestic routines and arranging living spaces; keep building design within the separate architecture topic. Use familiar examples, explicit causes, consequences or viewpoints; explain every necessary concept.",
      "B2": "Housing, domestic routines and arranging living spaces; keep building design within the separate architecture topic. Systems and professional or public questions are permitted with explained specialist concepts.",
      "C1+": "Housing, domestic routines and arranging living spaces; keep building design within the separate architecture topic. Abstract approaches and nuances are permitted within the selected format and length; do not add jargon for its own sake."
    }
  },
  {
    "id": "food-cooking",
    "label": "Food & cooking",
    "minProfile": "A1",
    "promptHint": "Ingredients, cooking processes and tastes; keep purchasing and service transactions within shopping.",
    "simpleFocus": "preparing one familiar meal",
    "disclosures": {
      "A1": "Foods, dishes, tastes and simple cooking actions; exclude nutritional biochemistry and specialist techniques.",
      "A2": "Preparing a familiar meal and comparing simple cooking choices; no specialist food science.",
      "B1": "Ingredients, cooking processes and tastes; keep purchasing and service transactions within shopping. Use familiar examples, explicit causes, consequences or viewpoints; explain every necessary concept.",
      "B2": "Ingredients, cooking processes and tastes; keep purchasing and service transactions within shopping. Systems and professional or public questions are permitted with explained specialist concepts.",
      "C1+": "Ingredients, cooking processes and tastes; keep purchasing and service transactions within shopping. Abstract approaches and nuances are permitted within the selected format and length; do not add jargon for its own sake."
    }
  },
  {
    "id": "shopping-services",
    "label": "Shopping & services",
    "minProfile": "A1",
    "promptHint": "Products, orders, delivery, returns and service quality; keep personal budgeting within finance.",
    "simpleFocus": "one ordinary shop order and its goods and prices",
    "disclosures": {
      "A1": "Goods, prices, quantities and a simple order; exclude credit terms, contracts and legal disputes.",
      "A2": "A concrete purchase, delivery or return with simple conditions; no credit or legal theory.",
      "B1": "Products, orders, delivery, returns and service quality; keep personal budgeting within finance. Use familiar examples, explicit causes, consequences or viewpoints; explain every necessary concept.",
      "B2": "Products, orders, delivery, returns and service quality; keep personal budgeting within finance. Systems and professional or public questions are permitted with explained specialist concepts.",
      "C1+": "Products, orders, delivery, returns and service quality; keep personal budgeting within finance. Abstract approaches and nuances are permitted within the selected format and length; do not add jargon for its own sake."
    }
  },
  {
    "id": "money-personal-finance",
    "label": "Money & personal finance",
    "minProfile": "A2",
    "promptHint": "Personal budgeting, spending, saving and financial habits; company finance belongs to business.",
    "simpleFocus": "one person's weekly spending and savings",
    "disclosures": {
      "A2": "A personal weekly budget, ordinary expenses or saving for a purchase; exclude investment, tax and financial models.",
      "B1": "Personal budgeting, spending, saving and financial habits; company finance belongs to business. Use familiar examples, explicit causes, consequences or viewpoints; explain every necessary concept.",
      "B2": "Personal budgeting, spending, saving and financial habits; company finance belongs to business. Systems and professional or public questions are permitted with explained specialist concepts.",
      "C1+": "Personal budgeting, spending, saving and financial habits; company finance belongs to business. Abstract approaches and nuances are permitted within the selected format and length; do not add jargon for its own sake."
    }
  },
  {
    "id": "city-life",
    "label": "City life",
    "minProfile": "A1",
    "promptHint": "Neighborhoods, public spaces, amenities and community life; institutions belong to society.",
    "simpleFocus": "one neighborhood library and its familiar public space",
    "disclosures": {
      "A1": "Nearby places, their positions and simple city amenities; exclude urban policy and infrastructure management.",
      "A2": "Using a neighborhood service or public space and a concrete change to it; no urban governance theory.",
      "B1": "Neighborhoods, public spaces, amenities and community life; institutions belong to society. Use familiar examples, explicit causes, consequences or viewpoints; explain every necessary concept.",
      "B2": "Neighborhoods, public spaces, amenities and community life; institutions belong to society. Systems and professional or public questions are permitted with explained specialist concepts.",
      "C1+": "Neighborhoods, public spaces, amenities and community life; institutions belong to society. Abstract approaches and nuances are permitted within the selected format and length; do not add jargon for its own sake."
    }
  },
  {
    "id": "transport",
    "label": "Transport",
    "minProfile": "A1",
    "promptHint": "Vehicles, everyday journeys, routes and transport operations; traveler experiences belong to travel.",
    "simpleFocus": "one familiar bus route and its stops and times",
    "disclosures": {
      "A1": "A familiar vehicle, departure time, stop and simple route; exclude logistics, tariff policy and transport systems.",
      "A2": "A familiar journey, route choice or timetable change; exclude complex logistics and tariff policy.",
      "B1": "Vehicles, everyday journeys, routes and transport operations; traveler experiences belong to travel. Use familiar examples, explicit causes, consequences or viewpoints; explain every necessary concept.",
      "B2": "Vehicles, everyday journeys, routes and transport operations; traveler experiences belong to travel. Systems and professional or public questions are permitted with explained specialist concepts.",
      "C1+": "Vehicles, everyday journeys, routes and transport operations; traveler experiences belong to travel. Abstract approaches and nuances are permitted within the selected format and length; do not add jargon for its own sake."
    }
  },
  {
    "id": "travel",
    "label": "Travel",
    "minProfile": "A1",
    "promptHint": "Destinations, lodging, sights and traveler experiences.",
    "simpleFocus": "one simple visit and its guesthouse arrangements",
    "disclosures": {
      "A1": "A destination, lodging and simple traveler actions; exclude visas, legal conditions and complex itineraries.",
      "A2": "One manageable trip, accommodation or sightseeing plan; exclude immigration and complex legal procedures.",
      "B1": "Destinations, lodging, sights and traveler experiences. Use familiar examples, explicit causes, consequences or viewpoints; explain every necessary concept.",
      "B2": "Destinations, lodging, sights and traveler experiences. Systems and professional or public questions are permitted with explained specialist concepts.",
      "C1+": "Destinations, lodging, sights and traveler experiences. Abstract approaches and nuances are permitted within the selected format and length; do not add jargon for its own sake."
    }
  },
  {
    "id": "family-relationships",
    "label": "Family & relationships",
    "minProfile": "A1",
    "promptHint": "Family, friendship, partnership, support and interactions between people.",
    "simpleFocus": "shared activities and support in one family or friendship",
    "disclosures": {
      "A1": "Family roles, shared activities, simple requests and feelings; exclude psychological theories, hidden motives and complex conflicts.",
      "A2": "A familiar relationship, a clear misunderstanding or a shared decision with explicit reasons; no psychological theory.",
      "B1": "Family, friendship, partnership, support and interactions between people. Use familiar examples, explicit causes, consequences or viewpoints; explain every necessary concept.",
      "B2": "Family, friendship, partnership, support and interactions between people. Systems and professional or public questions are permitted with explained specialist concepts.",
      "C1+": "Family, friendship, partnership, support and interactions between people. Abstract approaches and nuances are permitted within the selected format and length; do not add jargon for its own sake."
    }
  },
  {
    "id": "work-careers",
    "label": "Work & careers",
    "minProfile": "A1",
    "promptHint": "Professions, tasks, teams, job seeking and career choices; founding and managing companies belongs to business.",
    "simpleFocus": "one team's concrete everyday work task",
    "disclosures": {
      "A1": "A job, workplace and simple duties; exclude management strategy, employment contracts and organizational conflict.",
      "A2": "A concrete team task, job search or everyday work decision; no management strategy or employment law.",
      "B1": "Professions, tasks, teams, job seeking and career choices; founding and managing companies belongs to business. Use familiar examples, explicit causes, consequences or viewpoints; explain every necessary concept.",
      "B2": "Professions, tasks, teams, job seeking and career choices; founding and managing companies belongs to business. Systems and professional or public questions are permitted with explained specialist concepts.",
      "C1+": "Professions, tasks, teams, job seeking and career choices; founding and managing companies belongs to business. Abstract approaches and nuances are permitted within the selected format and length; do not add jargon for its own sake."
    }
  },
  {
    "id": "learning-education",
    "label": "Learning & education",
    "minProfile": "A1",
    "promptHint": "Study habits, skills and educational systems; language structure belongs to languages and communication.",
    "simpleFocus": "one learner's course timetable and study habit",
    "disclosures": {
      "A1": "School subjects, a timetable and simple learning actions; exclude education policy and methodological disputes.",
      "A2": "A study habit, course or practical skill and straightforward reasons; no education-policy or methodological theory.",
      "B1": "Study habits, skills and educational systems; language structure belongs to languages and communication. Use familiar examples, explicit causes, consequences or viewpoints; explain every necessary concept.",
      "B2": "Study habits, skills and educational systems; language structure belongs to languages and communication. Systems and professional or public questions are permitted with explained specialist concepts.",
      "C1+": "Study habits, skills and educational systems; language structure belongs to languages and communication. Abstract approaches and nuances are permitted within the selected format and length; do not add jargon for its own sake."
    }
  },
  {
    "id": "health-wellbeing",
    "label": "Health & wellbeing",
    "minProfile": "A1",
    "promptHint": "Sleep, rest, wellbeing and everyday health care; distinguish general information from personal medical advice.",
    "simpleFocus": "one person's sleep and rest routine",
    "disclosures": {
      "A1": "Sleep, rest and simple descriptions of wellbeing; exclude diagnosis, treatment and medical mechanisms.",
      "A2": "Sleep, rest and everyday wellbeing habits with simple reasons; no diagnoses, treatment plans or medical mechanisms.",
      "B1": "Sleep, rest, wellbeing and everyday health care; distinguish general information from personal medical advice. Use familiar examples, explicit causes, consequences or viewpoints; explain every necessary concept.",
      "B2": "Sleep, rest, wellbeing and everyday health care; distinguish general information from personal medical advice. Systems and professional or public questions are permitted with explained specialist concepts.",
      "C1+": "Sleep, rest, wellbeing and everyday health care; distinguish general information from personal medical advice. Abstract approaches and nuances are permitted within the selected format and length; do not add jargon for its own sake."
    }
  },
  {
    "id": "sports",
    "label": "Sports",
    "minProfile": "A1",
    "promptHint": "Sports, training, competitions, teams and sporting experience.",
    "simpleFocus": "one familiar team's practice session",
    "disclosures": {
      "A1": "A sport, players, venue and basic actions; exclude detailed regulations, sports medicine and complex tactics.",
      "A2": "A familiar training session or match and a simple comparison; exclude sports medicine and complex tactics.",
      "B1": "Sports, training, competitions, teams and sporting experience. Use familiar examples, explicit causes, consequences or viewpoints; explain every necessary concept.",
      "B2": "Sports, training, competitions, teams and sporting experience. Systems and professional or public questions are permitted with explained specialist concepts.",
      "C1+": "Sports, training, competitions, teams and sporting experience. Abstract approaches and nuances are permitted within the selected format and length; do not add jargon for its own sake."
    }
  },
  {
    "id": "hobbies-leisure",
    "label": "Hobbies & leisure",
    "minProfile": "A1",
    "promptHint": "Personal leisure, games, collecting and crafts; works and cultural industries belong to arts.",
    "simpleFocus": "one simple hobby project",
    "disclosures": {
      "A1": "A favorite pastime, its objects and basic actions; exclude specialist techniques and complex game rules.",
      "A2": "A concrete hobby activity or simple project with understandable steps; no specialist techniques.",
      "B1": "Personal leisure, games, collecting and crafts; works and cultural industries belong to arts. Use familiar examples, explicit causes, consequences or viewpoints; explain every necessary concept.",
      "B2": "Personal leisure, games, collecting and crafts; works and cultural industries belong to arts. Systems and professional or public questions are permitted with explained specialist concepts.",
      "C1+": "Personal leisure, games, collecting and crafts; works and cultural industries belong to arts. Abstract approaches and nuances are permitted within the selected format and length; do not add jargon for its own sake."
    }
  },
  {
    "id": "arts-entertainment",
    "label": "Arts & entertainment",
    "minProfile": "A1",
    "promptHint": "Music, films, literature, theatre, exhibitions and works of art; designing spaces belongs to design.",
    "simpleFocus": "one book or film and its concrete characters and features",
    "disclosures": {
      "A1": "A work of art, its characters and simple impressions; exclude artistic theory, symbolism and cultural criticism.",
      "A2": "A familiar film, book, song or exhibition with concrete features and simple reasons; no abstract art theory.",
      "B1": "Music, films, literature, theatre, exhibitions and works of art; designing spaces belongs to design. Use familiar examples, explicit causes, consequences or viewpoints; explain every necessary concept.",
      "B2": "Music, films, literature, theatre, exhibitions and works of art; designing spaces belongs to design. Systems and professional or public questions are permitted with explained specialist concepts.",
      "C1+": "Music, films, literature, theatre, exhibitions and works of art; designing spaces belongs to design. Abstract approaches and nuances are permitted within the selected format and length; do not add jargon for its own sake."
    }
  },
  {
    "id": "languages-communication",
    "label": "Languages & communication",
    "minProfile": "A2",
    "promptHint": "Words, translation, language differences, learning and language use; a conversation alone does not establish this topic.",
    "simpleFocus": "learning and using a few familiar words in another language",
    "disclosures": {
      "A2": "Familiar words, learning a language or one concrete communication misunderstanding; exclude linguistic theory.",
      "B1": "Words, translation, language differences, learning and language use; a conversation alone does not establish this topic. Use familiar examples, explicit causes, consequences or viewpoints; explain every necessary concept.",
      "B2": "Words, translation, language differences, learning and language use; a conversation alone does not establish this topic. Systems and professional or public questions are permitted with explained specialist concepts.",
      "C1+": "Words, translation, language differences, learning and language use; a conversation alone does not establish this topic. Abstract approaches and nuances are permitted within the selected format and length; do not add jargon for its own sake."
    }
  },
  {
    "id": "culture-traditions",
    "label": "Culture & traditions",
    "minProfile": "A2",
    "promptHint": "Customs, celebrations, etiquette and cultural practices; historical analysis belongs to history; avoid stereotypes.",
    "simpleFocus": "preparing for one familiar local celebration",
    "disclosures": {
      "A2": "One concrete custom, celebration or etiquette practice; exclude national-character generalizations and cultural theory.",
      "B1": "Customs, celebrations, etiquette and cultural practices; historical analysis belongs to history; avoid stereotypes. Use familiar examples, explicit causes, consequences or viewpoints; explain every necessary concept.",
      "B2": "Customs, celebrations, etiquette and cultural practices; historical analysis belongs to history; avoid stereotypes. Systems and professional or public questions are permitted with explained specialist concepts.",
      "C1+": "Customs, celebrations, etiquette and cultural practices; historical analysis belongs to history; avoid stereotypes. Abstract approaches and nuances are permitted within the selected format and length; do not add jargon for its own sake."
    }
  },
  {
    "id": "history",
    "label": "History",
    "minProfile": "A2",
    "promptHint": "Past periods, supported events, historical change and life in the past; distinguish evidence and interpretation.",
    "simpleFocus": "one supported example of ordinary daily life in the past",
    "disclosures": {
      "A2": "One simple historical episode, supported biographical fact or comparison of daily life then and now; no complex historical causation.",
      "B1": "Past periods, supported events, historical change and life in the past; distinguish evidence and interpretation. Use familiar examples, explicit causes, consequences or viewpoints; explain every necessary concept.",
      "B2": "Past periods, supported events, historical change and life in the past; distinguish evidence and interpretation. Systems and professional or public questions are permitted with explained specialist concepts.",
      "C1+": "Past periods, supported events, historical change and life in the past; distinguish evidence and interpretation. Abstract approaches and nuances are permitted within the selected format and length; do not add jargon for its own sake."
    }
  },
  {
    "id": "nature-wildlife",
    "label": "Nature & wildlife",
    "minProfile": "A1",
    "promptHint": "Animals, plants, habitats, seasons and observation; human environmental impact belongs to environment.",
    "simpleFocus": "observing one familiar animal in its habitat",
    "disclosures": {
      "A1": "Visible features of animals and plants, habitats, weather and simple actions; exclude genetics, complex ecosystems and scientific mechanisms.",
      "A2": "Observing a familiar animal, plant or natural place with simple connections; no genetics or complex ecosystem models.",
      "B1": "Animals, plants, habitats, seasons and observation; human environmental impact belongs to environment. Use familiar examples, explicit causes, consequences or viewpoints; explain every necessary concept.",
      "B2": "Animals, plants, habitats, seasons and observation; human environmental impact belongs to environment. Systems and professional or public questions are permitted with explained specialist concepts.",
      "C1+": "Animals, plants, habitats, seasons and observation; human environmental impact belongs to environment. Abstract approaches and nuances are permitted within the selected format and length; do not add jargon for its own sake."
    }
  },
  {
    "id": "environment",
    "label": "Environment",
    "minProfile": "A2",
    "promptHint": "Human impacts, resources, waste and conservation choices.",
    "simpleFocus": "saving water or sorting waste in one household",
    "disclosures": {
      "A2": "Everyday actions involving water, energy or waste; exclude climate models and political mechanisms.",
      "B1": "Human impacts, resources, waste and conservation choices. Use familiar examples, explicit causes, consequences or viewpoints; explain every necessary concept.",
      "B2": "Human impacts, resources, waste and conservation choices. Systems and professional or public questions are permitted with explained specialist concepts.",
      "C1+": "Human impacts, resources, waste and conservation choices. Abstract approaches and nuances are permitted within the selected format and length; do not add jargon for its own sake."
    }
  },
  {
    "id": "science-discoveries",
    "label": "Science & discoveries",
    "minProfile": "A2",
    "promptHint": "Observable phenomena, research and experiments; astronomy and applied devices have separate topics.",
    "simpleFocus": "one observable experiment such as ice melting",
    "disclosures": {
      "A2": "One observable process or simple experiment and a short concrete explanation; exclude formulas and specialist theories.",
      "B1": "Observable phenomena, research and experiments; astronomy and applied devices have separate topics. Use familiar examples, explicit causes, consequences or viewpoints; explain every necessary concept.",
      "B2": "Observable phenomena, research and experiments; astronomy and applied devices have separate topics. Systems and professional or public questions are permitted with explained specialist concepts.",
      "C1+": "Observable phenomena, research and experiments; astronomy and applied devices have separate topics. Abstract approaches and nuances are permitted within the selected format and length; do not add jargon for its own sake."
    }
  },
  {
    "id": "technology-digital-life",
    "label": "Technology & digital life",
    "minProfile": "A1",
    "promptHint": "Devices, software, internet use, digital habits and technological change.",
    "simpleFocus": "one familiar phone app and its basic use",
    "disclosures": {
      "A1": "A familiar device and its basic functions; exclude algorithms, system architecture and digital policy.",
      "A2": "A familiar app or device and one concrete use or change; no algorithms, system architecture or digital policy.",
      "B1": "Devices, software, internet use, digital habits and technological change. Use familiar examples, explicit causes, consequences or viewpoints; explain every necessary concept.",
      "B2": "Devices, software, internet use, digital habits and technological change. Systems and professional or public questions are permitted with explained specialist concepts.",
      "C1+": "Devices, software, internet use, digital habits and technological change. Abstract approaches and nuances are permitted within the selected format and length; do not add jargon for its own sake."
    }
  },
  {
    "id": "society-public-life",
    "label": "Society & public life",
    "minProfile": "A2",
    "promptHint": "Public rules, rights, institutions and collective decisions; abstract values belong to philosophy.",
    "simpleFocus": "using one familiar public service and its simple rules",
    "disclosures": {
      "A2": "A familiar public rule, service or form of participation; exclude political systems and complex legal issues.",
      "B1": "Public rules, rights, institutions and collective decisions; abstract values belong to philosophy. Use familiar examples, explicit causes, consequences or viewpoints; explain every necessary concept.",
      "B2": "Public rules, rights, institutions and collective decisions; abstract values belong to philosophy. Systems and professional or public questions are permitted with explained specialist concepts.",
      "C1+": "Public rules, rights, institutions and collective decisions; abstract values belong to philosophy. Abstract approaches and nuances are permitted within the selected format and length; do not add jargon for its own sake."
    }
  },
  {
    "id": "space-astronomy",
    "label": "Space & astronomy",
    "minProfile": "A2",
    "promptHint": "Celestial bodies, sky observation, space exploration and the universe; science-fiction genre alone does not establish this topic.",
    "simpleFocus": "observing the Moon and its visible features",
    "disclosures": {
      "A2": "Sky observation, basic celestial-body facts or an astronaut action; exclude astrophysics and orbital calculations.",
      "B1": "Celestial bodies, sky observation, space exploration and the universe; science-fiction genre alone does not establish this topic. Use familiar examples, explicit causes, consequences or viewpoints; explain every necessary concept.",
      "B2": "Celestial bodies, sky observation, space exploration and the universe; science-fiction genre alone does not establish this topic. Systems and professional or public questions are permitted with explained specialist concepts.",
      "C1+": "Celestial bodies, sky observation, space exploration and the universe; science-fiction genre alone does not establish this topic. Abstract approaches and nuances are permitted within the selected format and length; do not add jargon for its own sake."
    }
  },
  {
    "id": "business-entrepreneurship",
    "label": "Business & entrepreneurship",
    "minProfile": "A2",
    "promptHint": "Starting and operating a business, products, customers and commercial decisions.",
    "simpleFocus": "a small shop, its customers and ordinary orders",
    "disclosures": {
      "A2": "A small familiar business, product, customer, order or simple work organization; exclude strategy, corporate finance and company law.",
      "B1": "Starting and operating a business, products, customers and commercial decisions. Use familiar examples, explicit causes, consequences or viewpoints; explain every necessary concept.",
      "B2": "Starting and operating a business, products, customers and commercial decisions. Systems and professional or public questions are permitted with explained specialist concepts.",
      "C1+": "Starting and operating a business, products, customers and commercial decisions. Abstract approaches and nuances are permitted within the selected format and length; do not add jargon for its own sake."
    }
  },
  {
    "id": "design-architecture",
    "label": "Design & architecture",
    "minProfile": "A1",
    "promptHint": "Appearance and function of objects, buildings and spaces; ordinary household chores belong to home.",
    "simpleFocus": "the colors, shapes and arrangement in one room or building",
    "disclosures": {
      "A1": "Color, shape, size and arrangement of an object or building; exclude design theory, architectural movements and engineering calculations.",
      "A2": "A concrete object or space and a simple design choice; exclude architectural theory and engineering calculations.",
      "B1": "Appearance and function of objects, buildings and spaces; ordinary household chores belong to home. Use familiar examples, explicit causes, consequences or viewpoints; explain every necessary concept.",
      "B2": "Appearance and function of objects, buildings and spaces; ordinary household chores belong to home. Systems and professional or public questions are permitted with explained specialist concepts.",
      "C1+": "Appearance and function of objects, buildings and spaces; ordinary household chores belong to home. Abstract approaches and nuances are permitted within the selected format and length; do not add jargon for its own sake."
    }
  },
  {
    "id": "philosophy-ethics",
    "label": "Philosophy & ethics",
    "minProfile": "B1",
    "promptHint": "Values, fairness, responsibility and reasons for choices; ordinary politeness alone belongs to relationships.",
    "simpleFocus": "an everyday choice involving honesty and fairness",
    "disclosures": {
      "B1": "One everyday dilemma about honesty, fairness or responsibility, with explicit reasons. Exclude philosophical schools, metaethics and abstract theoretical disputes.",
      "B2": "Explain principles and compare arguments in a concrete ethical situation. Define concepts; exclude philosophical schools, metaethics and abstract theoretical disputes.",
      "C1+": "Philosophical schools, theoretical approaches and metaethics are permitted when clearly explained and suited to the selected format and length."
    }
  }
]
