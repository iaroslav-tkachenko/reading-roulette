// Canonical catalog; authored from approved docs by implementation-step10-v10/author-catalogs.mjs.
import type { ReadingAngle } from '../types/reading'

export const angles: readonly ReadingAngle[] = [
  {
    "id": "first-introduction",
    "label": "First introduction",
    "minProfile": "A1",
    "promptHint": "Introduce one person, place, object or activity to a newcomer through its essential concrete features.",
    "simpleAction": "Introduce the essential people, place, objects or activity involved in {focus} to a newcomer.",
    "topicIds": ["home-household","food-cooking","shopping-services","money-personal-finance","city-life","transport","travel","family-relationships","work-careers","learning-education","health-wellbeing","sports","hobbies-leisure","arts-entertainment","languages-communication","culture-traditions","history","nature-wildlife","environment","science-discoveries","technology-digital-life","society-public-life","space-astronomy","business-entrepreneurship","design-architecture","philosophy-ethics"]
  },
  {
    "id": "everyday-routine",
    "label": "An ordinary day",
    "minProfile": "A1",
    "promptHint": "Show familiar recurring actions, daily use or an ordinary routine in chronological or functional order.",
    "simpleAction": "Show a familiar sequence of ordinary actions involved in {focus}.",
    "topicIds": ["home-household","food-cooking","shopping-services","money-personal-finance","city-life","transport","travel","family-relationships","work-careers","learning-education","health-wellbeing","sports","hobbies-leisure","arts-entertainment","languages-communication","culture-traditions","history","nature-wildlife","environment","science-discoveries","technology-digital-life","society-public-life","space-astronomy","business-entrepreneurship","design-architecture","philosophy-ethics"]
  },
  {
    "id": "upcoming-plans",
    "label": "Upcoming plans",
    "minProfile": "A1",
    "promptHint": "State a person or group's near-term plan: what they intend to do, when and where.",
    "simpleAction": "State what a person or group plans to do next about {focus}, and when and where.",
    "topicIds": ["home-household","food-cooking","shopping-services","money-personal-finance","city-life","transport","travel","family-relationships","work-careers","learning-education","health-wellbeing","sports","hobbies-leisure","arts-entertainment","languages-communication","culture-traditions","history","nature-wildlife","environment","science-discoveries","technology-digital-life","society-public-life","space-astronomy","business-entrepreneurship","design-architecture","philosophy-ethics"]
  },
  {
    "id": "spatial-orientation",
    "label": "What is where",
    "minProfile": "A1",
    "promptHint": "Locate concrete objects or places with consistent landmarks and spatial relationships.",
    "simpleAction": "Identify concrete objects, places and landmarks involved in {focus}, and explain where they are.",
    "topicIds": ["home-household","food-cooking","shopping-services","city-life","transport","travel","work-careers","learning-education","sports","hobbies-leisure","arts-entertainment","nature-wildlife","environment","technology-digital-life","space-astronomy","business-entrepreneurship","design-architecture"]
  },
  {
    "id": "overlooked-detail",
    "label": "An important detail",
    "minProfile": "A1",
    "promptHint": "Focus on one concrete feature and why it matters. It need not be hidden or surprising; a detective clue requires the detective format.",
    "simpleAction": "Identify one visible feature or necessary practical detail in {focus} and explain its immediate importance.",
    "topicIds": ["home-household","food-cooking","shopping-services","money-personal-finance","city-life","transport","travel","family-relationships","work-careers","learning-education","health-wellbeing","sports","hobbies-leisure","arts-entertainment","languages-communication","culture-traditions","history","nature-wildlife","environment","science-discoveries","technology-digital-life","society-public-life","space-astronomy","business-entrepreneurship","design-architecture","philosophy-ethics"]
  },
  {
    "id": "special-occasion",
    "label": "A special occasion",
    "minProfile": "A1",
    "promptHint": "Show preparation or actions for a specific celebration, meeting or arrival of guests.",
    "simpleAction": "Show concrete preparations or actions for a specific celebration or meeting involving {focus}.",
    "topicIds": ["home-household","food-cooking","shopping-services","money-personal-finance","city-life","transport","travel","family-relationships","work-careers","learning-education","health-wellbeing","sports","hobbies-leisure","arts-entertainment","languages-communication","culture-traditions","history","nature-wildlife","environment","science-discoveries","technology-digital-life","society-public-life","space-astronomy","business-entrepreneurship","design-architecture","philosophy-ethics"]
  },
  {
    "id": "request-for-help",
    "label": "A request for help",
    "minProfile": "A1",
    "promptHint": "Make clear what help is needed, why, and the specific request to another person.",
    "simpleAction": "Have one participant request a specific simple action from another person involved in {focus}; state the concrete need.",
    "topicIds": ["home-household","food-cooking","shopping-services","money-personal-finance","city-life","transport","travel","family-relationships","work-careers","learning-education","health-wellbeing","sports","hobbies-leisure","arts-entertainment","languages-communication","culture-traditions","history","nature-wildlife","environment","science-discoveries","technology-digital-life","society-public-life","space-astronomy","business-entrepreneurship","design-architecture","philosophy-ethics"]
  },
  {
    "id": "invitation",
    "label": "An invitation",
    "minProfile": "A1",
    "promptHint": "Invite someone to a concrete event, give necessary details and include a response where the format permits.",
    "simpleAction": "Invite a person to a specific shared activity involving {focus}; give time, place and necessary details.",
    "topicIds": ["home-household","food-cooking","shopping-services","money-personal-finance","city-life","transport","travel","family-relationships","work-careers","learning-education","health-wellbeing","sports","hobbies-leisure","arts-entertainment","languages-communication","culture-traditions","history","nature-wildlife","environment","science-discoveries","technology-digital-life","society-public-life","space-astronomy","business-entrepreneurship","design-architecture","philosophy-ethics"]
  },
  {
    "id": "clarifying-details",
    "label": "Clarifying details",
    "minProfile": "A1",
    "promptHint": "Clarify missing information about time, place, conditions or actions; do not invent complex conflict.",
    "simpleAction": "Clarify one missing time, place, condition or action involving {focus}.",
    "topicIds": ["home-household","food-cooking","shopping-services","money-personal-finance","city-life","transport","travel","family-relationships","work-careers","learning-education","health-wellbeing","sports","hobbies-leisure","arts-entertainment","languages-communication","culture-traditions","history","nature-wildlife","environment","science-discoveries","technology-digital-life","society-public-life","space-astronomy","business-entrepreneurship","design-architecture","philosophy-ethics"]
  },
  {
    "id": "shared-choice",
    "label": "A shared choice",
    "minProfile": "A2",
    "promptHint": "Agree on one option using the participants' stated preferences and simple reasons.",
    "simpleAction": "Have participants choose between two concrete options involving {focus} using explicit preferences.",
    "topicIds": ["home-household","food-cooking","shopping-services","money-personal-finance","city-life","transport","travel","family-relationships","work-careers","learning-education","health-wellbeing","sports","hobbies-leisure","arts-entertainment","languages-communication","culture-traditions","history","nature-wildlife","environment","science-discoveries","technology-digital-life","society-public-life","space-astronomy","business-entrepreneurship","design-architecture","philosophy-ethics"]
  },
  {
    "id": "misunderstanding",
    "label": "A misunderstanding",
    "minProfile": "A2",
    "promptHint": "Identify what participants understood differently and show how it is clarified.",
    "simpleAction": "Show one concrete misunderstanding about {focus} and how the participants clarify it.",
    "topicIds": ["home-household","food-cooking","shopping-services","money-personal-finance","city-life","transport","travel","family-relationships","work-careers","learning-education","health-wellbeing","sports","hobbies-leisure","arts-entertainment","languages-communication","culture-traditions","history","nature-wildlife","environment","science-discoveries","technology-digital-life","society-public-life","space-astronomy","business-entrepreneurship","design-architecture","philosophy-ethics"]
  },
  {
    "id": "feedback",
    "label": "Feedback",
    "minProfile": "A2",
    "promptHint": "Evaluate a concrete action or result and offer a useful specific suggestion for next time.",
    "simpleAction": "Evaluate one concrete action or result involving {focus} and offer one useful suggestion.",
    "topicIds": ["home-household","food-cooking","shopping-services","money-personal-finance","city-life","transport","travel","family-relationships","work-careers","learning-education","health-wellbeing","sports","hobbies-leisure","arts-entertainment","languages-communication","culture-traditions","history","nature-wildlife","environment","science-discoveries","technology-digital-life","society-public-life","space-astronomy","business-entrepreneurship","design-architecture","philosophy-ethics"]
  },
  {
    "id": "unexpected-discovery",
    "label": "Unexpected discovery",
    "minProfile": "A2",
    "promptHint": "Discover an object or information that changes subsequent actions or understanding.",
    "simpleAction": "Show how finding one object or piece of information about {focus} changes the next action.",
    "topicIds": ["home-household","food-cooking","shopping-services","money-personal-finance","city-life","transport","travel","family-relationships","work-careers","learning-education","health-wellbeing","sports","hobbies-leisure","arts-entertainment","languages-communication","culture-traditions","history","nature-wildlife","environment","science-discoveries","technology-digital-life","society-public-life","space-astronomy","business-entrepreneurship","design-architecture","philosophy-ethics"]
  },
  {
    "id": "change-of-plans",
    "label": "A change of plans",
    "minProfile": "A2",
    "promptHint": "Explain what plan changed, the concrete reason and what participants do next.",
    "simpleAction": "Change one specific plan involving {focus}; explain the simple reason and the next action.",
    "topicIds": ["home-household","food-cooking","shopping-services","money-personal-finance","city-life","transport","travel","family-relationships","work-careers","learning-education","health-wellbeing","sports","hobbies-leisure","arts-entertainment","languages-communication","culture-traditions","history","nature-wildlife","environment","science-discoveries","technology-digital-life","society-public-life","space-astronomy","business-entrepreneurship","design-architecture","philosophy-ethics"]
  },
  {
    "id": "problem-and-solution",
    "label": "Problem and solution",
    "minProfile": "A2",
    "promptHint": "Present a specific difficulty, actions to overcome it and the outcome.",
    "simpleAction": "Resolve one concrete practical difficulty involving {focus} and show the result.",
    "topicIds": ["home-household","food-cooking","shopping-services","money-personal-finance","city-life","transport","travel","family-relationships","work-careers","learning-education","health-wellbeing","sports","hobbies-leisure","arts-entertainment","languages-communication","culture-traditions","history","nature-wildlife","environment","science-discoveries","technology-digital-life","society-public-life","space-astronomy","business-entrepreneurship","design-architecture","philosophy-ethics"]
  },
  {
    "id": "unsuccessful-attempt",
    "label": "An unsuccessful attempt",
    "minProfile": "A2",
    "promptHint": "Show the intended action, what failed and a reasonable lesson; do not impose a happy ending.",
    "simpleAction": "Show an attempted action involving {focus}, what did not work and one simple lesson.",
    "topicIds": ["home-household","food-cooking","shopping-services","money-personal-finance","city-life","transport","travel","family-relationships","work-careers","learning-education","health-wellbeing","sports","hobbies-leisure","arts-entertainment","languages-communication","culture-traditions","history","nature-wildlife","environment","science-discoveries","technology-digital-life","society-public-life","space-astronomy","business-entrepreneurship","design-architecture","philosophy-ethics"]
  },
  {
    "id": "unexpected-outcome",
    "label": "An unexpected outcome",
    "minProfile": "A2",
    "promptHint": "Show how the outcome differs from expectations and what that means. In sourced material, both expectations and outcome must be supported.",
    "simpleAction": "Compare one expected and actual outcome involving {focus}, without forcing a happy ending.",
    "topicIds": ["home-household","food-cooking","shopping-services","money-personal-finance","city-life","transport","travel","family-relationships","work-careers","learning-education","health-wellbeing","sports","hobbies-leisure","arts-entertainment","languages-communication","culture-traditions","history","nature-wildlife","environment","science-discoveries","technology-digital-life","society-public-life","space-astronomy","business-entrepreneurship","design-architecture","philosophy-ethics"]
  },
  {
    "id": "consequences-of-a-decision",
    "label": "Consequences of a decision",
    "minProfile": "B1",
    "promptHint": "Trace the effects of a decision on people, events or later work with explicit links.",
    "simpleAction": "Trace the consequences of one explicit decision involving {focus}.",
    "topicIds": ["home-household","food-cooking","shopping-services","money-personal-finance","city-life","transport","travel","family-relationships","work-careers","learning-education","health-wellbeing","sports","hobbies-leisure","arts-entertainment","languages-communication","culture-traditions","history","nature-wildlife","environment","science-discoveries","technology-digital-life","society-public-life","space-astronomy","business-entrepreneurship","design-architecture","philosophy-ethics"]
  },
  {
    "id": "how-it-works",
    "label": "How it works",
    "minProfile": "A2",
    "promptHint": "Explain the operation of one process or object in an understandable order; do not substitute an explanation of causes.",
    "simpleAction": "Explain one simple observable process or sequence of operations involved in {focus}.",
    "topicIds": ["home-household","food-cooking","shopping-services","money-personal-finance","city-life","transport","travel","work-careers","learning-education","health-wellbeing","sports","hobbies-leisure","languages-communication","culture-traditions","nature-wildlife","environment","science-discoveries","technology-digital-life","society-public-life","space-astronomy","business-entrepreneurship","design-architecture"]
  },
  {
    "id": "why-it-happens",
    "label": "Why it happens",
    "minProfile": "B1",
    "promptHint": "Explain supported causes of one phenomenon and the links between them.",
    "simpleAction": "Explain supported causes of one concrete phenomenon involved in {focus}.",
    "topicIds": ["home-household","food-cooking","shopping-services","money-personal-finance","city-life","transport","travel","family-relationships","work-careers","learning-education","health-wellbeing","sports","hobbies-leisure","arts-entertainment","languages-communication","culture-traditions","history","nature-wildlife","environment","science-discoveries","technology-digital-life","society-public-life","space-astronomy","business-entrepreneurship","design-architecture","philosophy-ethics"]
  },
  {
    "id": "comparing-two-options",
    "label": "Comparing two options",
    "minProfile": "A2",
    "promptHint": "Compare exactly two options using the same clear criteria for both.",
    "simpleAction": "Compare two concrete options involving {focus} by the same two clear criteria.",
    "topicIds": ["home-household","food-cooking","shopping-services","money-personal-finance","city-life","transport","travel","family-relationships","work-careers","learning-education","health-wellbeing","sports","hobbies-leisure","arts-entertainment","languages-communication","culture-traditions","history","nature-wildlife","environment","science-discoveries","technology-digital-life","society-public-life","space-astronomy","business-entrepreneurship","design-architecture","philosophy-ethics"]
  },
  {
    "id": "then-and-now",
    "label": "Then and now",
    "minProfile": "A2",
    "promptHint": "Compare one concrete object, process or way of life in two periods.",
    "simpleAction": "Compare one concrete aspect of {focus} in two periods using supported facts or explicitly fictional circumstances.",
    "topicIds": ["home-household","food-cooking","shopping-services","money-personal-finance","city-life","transport","travel","family-relationships","work-careers","learning-education","health-wellbeing","sports","hobbies-leisure","arts-entertainment","languages-communication","culture-traditions","history","nature-wildlife","environment","science-discoveries","technology-digital-life","society-public-life","space-astronomy","business-entrepreneurship","design-architecture","philosophy-ethics"]
  },
  {
    "id": "expectations-and-reality",
    "label": "Expectations and reality",
    "minProfile": "B1",
    "promptHint": "Compare initial expectations with actual experience; fictional experience must be identified as a training scenario.",
    "simpleAction": "Compare an explicit expectation about {focus} with a supported or labeled training experience.",
    "topicIds": ["home-household","food-cooking","shopping-services","money-personal-finance","city-life","transport","travel","family-relationships","work-careers","learning-education","health-wellbeing","sports","hobbies-leisure","arts-entertainment","languages-communication","culture-traditions","history","nature-wildlife","environment","science-discoveries","technology-digital-life","society-public-life","space-astronomy","business-entrepreneurship","design-architecture","philosophy-ethics"]
  },
  {
    "id": "common-misconception",
    "label": "A common misconception",
    "minProfile": "B1",
    "promptHint": "Correct one genuinely established misconception with grounded facts. Never invent a popular myth; if its prevalence or correction cannot be supported, say the task cannot be completed faithfully.",
    "simpleAction": "Correct one established misconception about {focus} using grounded facts.",
    "topicIds": ["food-cooking","money-personal-finance","transport","learning-education","health-wellbeing","sports","languages-communication","culture-traditions","history","nature-wildlife","environment","science-discoveries","technology-digital-life","society-public-life","space-astronomy","business-entrepreneurship","design-architecture"]
  },
  {
    "id": "what-changed",
    "label": "What changed",
    "minProfile": "A2",
    "promptHint": "Describe one concrete change, its extent and its meaning for affected people or a process.",
    "simpleAction": "Describe one concrete change involving {focus}, its extent and its immediate meaning.",
    "topicIds": ["home-household","food-cooking","shopping-services","money-personal-finance","city-life","transport","travel","family-relationships","work-careers","learning-education","health-wellbeing","sports","hobbies-leisure","arts-entertainment","languages-communication","culture-traditions","history","nature-wildlife","environment","science-discoveries","technology-digital-life","society-public-life","space-astronomy","business-entrepreneurship","design-architecture","philosophy-ethics"]
  },
  {
    "id": "decisions-and-next-steps",
    "label": "Decisions and next steps",
    "minProfile": "B1",
    "promptHint": "Distinguish decisions made, next actions and unresolved questions. Missing real agreements must not be invented.",
    "simpleAction": "Distinguish decisions, actions and unresolved questions involving {focus}.",
    "topicIds": ["home-household","food-cooking","shopping-services","money-personal-finance","city-life","transport","travel","family-relationships","work-careers","learning-education","health-wellbeing","sports","hobbies-leisure","arts-entertainment","languages-communication","culture-traditions","history","nature-wildlife","environment","science-discoveries","technology-digital-life","society-public-life","space-astronomy","business-entrepreneurship","design-architecture","philosophy-ethics"]
  },
  {
    "id": "noticeable-pattern",
    "label": "A noticeable pattern",
    "minProfile": "B1",
    "promptHint": "Identify a recurring pattern actually present in the observations or data. Do not invent trends or turn correlation into causation.",
    "simpleAction": "Identify a pattern actually present in observations or data about {focus}.",
    "topicIds": ["home-household","food-cooking","shopping-services","money-personal-finance","city-life","transport","travel","family-relationships","work-careers","learning-education","health-wellbeing","sports","hobbies-leisure","arts-entertainment","languages-communication","culture-traditions","history","nature-wildlife","environment","science-discoveries","technology-digital-life","society-public-life","space-astronomy","business-entrepreneurship","design-architecture","philosophy-ethics"]
  },
  {
    "id": "different-viewpoints",
    "label": "Different viewpoints",
    "minProfile": "B1",
    "promptHint": "Present distinct positions on the same question and the reasons for each; sourced positions must be actually published.",
    "simpleAction": "Present distinct viewpoints and explicit reasons about {focus}.",
    "topicIds": ["home-household","food-cooking","shopping-services","money-personal-finance","city-life","transport","travel","family-relationships","work-careers","learning-education","health-wellbeing","sports","hobbies-leisure","arts-entertainment","languages-communication","culture-traditions","history","nature-wildlife","environment","science-discoveries","technology-digital-life","society-public-life","space-astronomy","business-entrepreneurship","design-architecture","philosophy-ethics"]
  },
  {
    "id": "difficult-choice",
    "label": "A difficult choice",
    "minProfile": "B1",
    "promptHint": "Present alternatives that each require a sacrifice and explain the trade-off.",
    "simpleAction": "Describe a trade-off between two options involving {focus}.",
    "topicIds": ["home-household","food-cooking","shopping-services","money-personal-finance","city-life","transport","travel","family-relationships","work-careers","learning-education","health-wellbeing","sports","hobbies-leisure","arts-entertainment","languages-communication","culture-traditions","history","nature-wildlife","environment","science-discoveries","technology-digital-life","society-public-life","space-astronomy","business-entrepreneurship","design-architecture","philosophy-ethics"]
  },
  {
    "id": "strengths-and-limitations",
    "label": "Strengths and limitations",
    "minProfile": "B1",
    "promptHint": "Explain what a solution is useful for, its benefits and the conditions that limit its use.",
    "simpleAction": "Explain benefits and conditions of limited applicability involving {focus}.",
    "topicIds": ["home-household","food-cooking","shopping-services","money-personal-finance","city-life","transport","travel","family-relationships","work-careers","learning-education","health-wellbeing","sports","hobbies-leisure","arts-entertainment","languages-communication","culture-traditions","history","nature-wildlife","environment","science-discoveries","technology-digital-life","society-public-life","space-astronomy","business-entrepreneurship","design-architecture","philosophy-ethics"]
  }
]
