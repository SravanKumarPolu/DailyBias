export type BiasCategory =
  | "Core Thinking"
  | "Memory & Perception"
  | "Social"
  | "Decision-Making"
  | "Logical & Reasoning"
  | "Behavioral & Everyday";

export interface CognitiveBias {
  id: string;
  title: string;
  category: BiasCategory;
  definition: string;
  whyItHappens: string;
  examples: string[];
  counterSteps: string[];
  tips: string[];
}

const biases: CognitiveBias[] = [
  // ═══════════════════════════════════════
  // 🧠 CORE THINKING BIASES
  // ═══════════════════════════════════════
  {
    id: "confirmation-bias",
    title: "Confirmation Bias",
    category: "Core Thinking",
    definition: "The tendency to search for, interpret, and recall information in a way that confirms your pre-existing beliefs, while ignoring contradictory evidence.",
    whyItHappens: "Our brains are wired for efficiency. Processing information that aligns with existing beliefs requires less cognitive effort than challenging them. It also protects our sense of identity and worldview.",
    examples: [
      "Only reading news sources that align with your political views.",
      "Remembering the times a horoscope was right and forgetting when it was wrong.",
      "A manager only noticing evidence that supports their first impression of an employee.",
    ],
    counterSteps: [
      "Pause and identify your current belief about the topic.",
      "Deliberately search for evidence that contradicts your view.",
      "Discuss the issue with someone who holds the opposite opinion.",
      "Write down both supporting and opposing evidence before deciding.",
    ],
    tips: [
      "Actively seek out opposing viewpoints before forming an opinion.",
      "Ask yourself: 'What evidence would change my mind?'",
      "Discuss important decisions with people who think differently than you.",
      "Keep a decision journal to track your reasoning over time.",
    ],
  },
  {
    id: "anchoring-bias",
    title: "Anchoring Bias",
    category: "Core Thinking",
    definition: "The tendency to rely too heavily on the first piece of information encountered (the 'anchor') when making decisions.",
    whyItHappens: "When we need to estimate or decide quickly, our brain uses the first available reference point as a starting position and adjusts from there — but we typically don't adjust enough.",
    examples: [
      "A shirt marked down from $100 to $60 feels like a deal, even if it's only worth $40.",
      "Salary negotiations are heavily influenced by whoever states a number first.",
      "Judges give harsher sentences when prosecutors request higher penalties.",
    ],
    counterSteps: [
      "Before receiving information, set your own independent estimate.",
      "Research comparable options or data points from multiple sources.",
      "Consciously ignore the first number you hear and recalculate from scratch.",
      "Use a structured decision matrix to weigh factors equally.",
    ],
    tips: [
      "Pause before reacting to the first number or piece of information you hear.",
      "Research independently before entering a negotiation.",
      "Consider multiple reference points, not just the first one.",
      "Ask: 'Would I evaluate this the same way without that initial information?'",
    ],
  },
  {
    id: "availability-heuristic",
    title: "Availability Heuristic",
    category: "Core Thinking",
    definition: "The tendency to overestimate the likelihood of events that are easily recalled, often because they are recent, vivid, or emotionally charged.",
    whyItHappens: "Our brains use mental shortcuts to assess probability. If something comes to mind quickly — because it was dramatic or recent — we assume it must be common.",
    examples: [
      "Fearing plane crashes more than car accidents, even though driving is statistically far more dangerous.",
      "Overestimating crime rates after watching the news.",
      "Thinking shark attacks are common after seeing a movie about them.",
    ],
    counterSteps: [
      "Stop and ask: \"Am I basing this on a vivid memory or on real data?\"",
      "Look up actual statistics or base rates for the event in question.",
      "Consider whether recent news or media is inflating your perception.",
      "Keep a log of actual frequencies to calibrate your intuition over time.",
    ],
    tips: [
      "Look up actual statistics before making risk assessments.",
      "Be aware that vivid stories are not the same as representative data.",
      "Ask: 'Am I basing this on evidence or on what comes to mind easily?'",
      "Diversify your information sources to get a more balanced view.",
    ],
  },
  {
    id: "hindsight-bias",
    title: "Hindsight Bias",
    category: "Core Thinking",
    definition: "The tendency to believe, after an event has occurred, that you would have predicted or expected the outcome — the 'I knew it all along' effect.",
    whyItHappens: "Once we know the outcome, our brain reconstructs our memory to make it seem like the result was obvious. This gives us a false sense of predictive ability.",
    examples: [
      "After a stock market crash, claiming you 'saw it coming.'",
      "Believing a failed startup's demise was obvious, even though many experts invested in it.",
      "Saying 'I knew they'd break up' after a couple's relationship ends.",
    ],
    counterSteps: [
      "Write down your predictions before the outcome is known.",
      "After an event, review what you actually predicted versus what happened.",
      "Acknowledge the role of uncertainty and luck in outcomes.",
      "Ask others what they predicted to get a reality check.",
    ],
    tips: [
      "Write down your predictions before events unfold.",
      "Review your past predictions honestly to calibrate your judgment.",
      "Acknowledge uncertainty — most outcomes are not as predictable as they seem in retrospect.",
      "Be humble about your ability to foresee complex events.",
    ],
  },
  {
    id: "framing-effect",
    title: "Framing Effect",
    category: "Core Thinking",
    definition: "The tendency to react differently to the same information depending on how it's presented — as a gain or a loss, for example.",
    whyItHappens: "Our brains don't process information in a vacuum. Context, wording, and presentation shape our emotional response, which in turn shapes our decisions.",
    examples: [
      "'90% fat-free' sounds healthier than '10% fat,' even though they mean the same thing.",
      "A surgery with a '95% survival rate' feels safer than one with a '5% mortality rate.'",
      "Discounts framed as 'Save $20' vs. 'Get 10% off' can change buying behavior.",
    ],
    counterSteps: [
      "Restate the information in the opposite frame (gain vs. loss).",
      "Strip away emotional language and focus on raw numbers.",
      "Ask: \"Would my decision change if this were worded differently?\"",
      "Present the same information in multiple frames before choosing.",
    ],
    tips: [
      "Reframe information both positively and negatively before deciding.",
      "Focus on absolute numbers rather than percentages when possible.",
      "Ask: 'Would I feel the same way if this were worded differently?'",
      "Be skeptical of persuasive framing in advertising and politics.",
    ],
  },
  {
    id: "overconfidence-bias",
    title: "Overconfidence Bias",
    category: "Core Thinking",
    definition: "The tendency to overestimate your own abilities, knowledge, or the precision of your predictions.",
    whyItHappens: "Confidence feels good and is socially rewarded. Our brains prefer certainty over ambiguity, so we unconsciously inflate our sense of competence.",
    examples: [
      "93% of drivers believe they are above average — statistically impossible.",
      "Entrepreneurs consistently overestimate their chances of success.",
      "Students predicting they'll finish assignments earlier than they actually do.",
    ],
    counterSteps: [
      "Assign a confidence percentage to your prediction and track accuracy.",
      "Seek out a second opinion, especially from someone with different expertise.",
      "Use pre-mortems: imagine your plan failed and list why.",
      "Review your past predictions honestly to calibrate your confidence.",
    ],
    tips: [
      "Track your predictions and review accuracy over time.",
      "Seek honest feedback from others regularly.",
      "Use confidence intervals instead of single-point estimates.",
      "Remember: expertise in one domain doesn't transfer to all domains.",
    ],
  },
  {
    id: "belief-bias",
    title: "Belief Bias",
    category: "Core Thinking",
    definition: "The tendency to judge the strength of an argument based on whether you agree with its conclusion, rather than evaluating the logic itself.",
    whyItHappens: "Our existing beliefs create a filter. When a conclusion aligns with what we already think, we're less critical of the reasoning — and vice versa.",
    examples: [
      "Accepting a poorly reasoned argument because the conclusion matches your worldview.",
      "Rejecting a valid logical argument because the conclusion feels counterintuitive.",
      "Agreeing with a study's findings without checking its methodology because the results 'make sense.'",
    ],
    counterSteps: [
      "Separate the conclusion from the argument — evaluate logic first.",
      "Ask: \"Would I accept this reasoning if the conclusion were different?\"",
      "Practice evaluating arguments in unfamiliar domains where you have no bias.",
      "Use formal logic tools or structured argument mapping.",
    ],
    tips: [
      "Evaluate arguments by their logic and evidence, not their conclusions.",
      "Practice formal reasoning exercises to strengthen logical thinking.",
      "Ask: 'Would I accept this reasoning if it led to a different conclusion?'",
      "Separate your emotional reaction from your logical evaluation.",
    ],
  },
  {
    id: "dunning-kruger-effect",
    title: "Dunning-Kruger Effect",
    category: "Core Thinking",
    definition: "A cognitive bias where people with limited knowledge in a domain overestimate their competence, while experts tend to underestimate theirs.",
    whyItHappens: "When you know very little about a topic, you lack the expertise needed to recognize what you don't know. Conversely, experts assume that what's easy for them is easy for everyone.",
    examples: [
      "A beginner investor feeling confident they can beat the stock market after one lucky trade.",
      "Someone who took a first-aid course believing they could perform surgery.",
      "An experienced scientist feeling uncertain about publishing a groundbreaking paper.",
    ],
    counterSteps: [
      "Rate your knowledge on a topic, then list everything you don't know.",
      "Seek feedback from recognized experts in the field.",
      "Test your understanding by trying to teach the concept to someone else.",
      "Commit to continuous learning and resist the urge to stop when you feel confident.",
    ],
    tips: [
      "Actively seek feedback from people more experienced than you.",
      "Treat confidence as a signal to double-check, not to stop learning.",
      "Remember: the more you learn, the more you realize you don't know.",
      "Ask experts to evaluate your understanding honestly.",
    ],
  },
  {
    id: "sunk-cost-fallacy",
    title: "Sunk Cost Fallacy",
    category: "Core Thinking",
    definition: "The tendency to continue investing in something because of previously invested resources, even when it's no longer rational to do so.",
    whyItHappens: "We hate feeling like our past investments were wasted. Stopping feels like admitting failure, so we keep going to justify what we've already spent.",
    examples: [
      "Finishing a terrible movie because you already paid for the ticket.",
      "Staying in a failing relationship because you've been together for years.",
      "A company continuing a doomed project because millions were already spent on it.",
    ],
    counterSteps: [
      "Ask: \"If I were starting fresh today, would I invest in this?\"",
      "Set clear exit criteria before beginning any project or investment.",
      "Calculate only the future costs and benefits, ignoring past spending.",
      "Consult someone uninvested in the project for an objective perspective.",
    ],
    tips: [
      "Ask: 'If I were starting fresh today, would I make this same choice?'",
      "Focus on future value, not past investment.",
      "Recognize that cutting losses early is a sign of wisdom, not failure.",
      "Set pre-defined criteria for when to quit before starting a project.",
    ],
  },
  {
    id: "status-quo-bias",
    title: "Status Quo Bias",
    category: "Core Thinking",
    definition: "The preference for the current state of affairs, where changes are perceived as a loss even when they could lead to improvement.",
    whyItHappens: "Change involves uncertainty and effort. Our brains prefer predictability, and losses from change feel larger than equivalent gains.",
    examples: [
      "Sticking with a default phone plan even when better options exist.",
      "Staying at a job you dislike because switching feels risky.",
      "Keeping the same investment portfolio for years without reviewing it.",
    ],
    counterSteps: [
      "Schedule regular reviews of your major choices (annually or quarterly).",
      "Ask: \"Would I actively choose this if I were starting over?\"",
      "List the costs of staying the same alongside the costs of change.",
      "Try small, reversible changes to reduce the fear of switching.",
    ],
    tips: [
      "Periodically review your defaults — subscriptions, routines, beliefs.",
      "Ask: 'Would I choose this if I were starting from scratch?'",
      "Treat inaction as a decision, not a non-decision.",
      "Set calendar reminders to review major life choices annually.",
    ],
  },
  {
    id: "optimism-bias",
    title: "Optimism Bias",
    category: "Core Thinking",
    definition: "The tendency to overestimate the likelihood of positive events happening to you and underestimate the likelihood of negative events.",
    whyItHappens: "A moderate level of optimism is adaptive — it motivates action and resilience. But our brains often take it too far, leading us to underestimate real risks.",
    examples: [
      "Believing your startup will succeed despite the high failure rate.",
      "Underestimating how long a home renovation project will take.",
      "Thinking 'it won't happen to me' about health risks despite not exercising.",
    ],
    counterSteps: [
      "Research base rates — how often do similar plans succeed or fail?",
      "Add a 30-50% buffer to all time and cost estimates.",
      "Run a pre-mortem: assume the plan failed and identify reasons.",
      "Ask a skeptical friend or colleague to challenge your assumptions.",
    ],
    tips: [
      "Use base rates: look at how often things succeed or fail in general.",
      "Build buffer time and budget into all plans.",
      "Ask a pessimistic friend to poke holes in your plan.",
      "Practice 'pre-mortem' thinking: imagine your plan failed — why did it fail?",
    ],
  },
  {
    id: "choice-overload",
    title: "Choice Overload",
    category: "Core Thinking",
    definition: "The phenomenon where having too many options leads to decision fatigue, anxiety, and often worse decisions or complete avoidance.",
    whyItHappens: "More options require more mental effort to evaluate. As choices multiply, the fear of making the wrong one increases, leading to paralysis or post-decision regret.",
    examples: [
      "Spending an hour scrolling through Netflix and not watching anything.",
      "Feeling overwhelmed choosing between 30 types of jam at the store.",
      "Delaying important decisions like choosing a retirement plan because there are too many options.",
    ],
    counterSteps: [
      "Limit yourself to comparing no more than 3-5 options.",
      "Define your must-have criteria before browsing options.",
      "Set a firm deadline for making the decision.",
      "Use satisficing: pick the first option that meets your standards.",
    ],
    tips: [
      "Set a time limit for decisions and stick to it.",
      "Narrow options to 3–5 before evaluating deeply.",
      "Use 'satisficing' — pick the first option that meets your criteria rather than seeking the best.",
      "Automate recurring decisions (meal planning, clothing, routines).",
    ],
  },
  {
    id: "negativity-bias",
    title: "Negativity Bias",
    category: "Core Thinking",
    definition: "The tendency to give more weight to negative experiences, information, or emotions than positive ones of equal intensity.",
    whyItHappens: "Evolutionarily, paying more attention to threats kept our ancestors alive. Our brains are hardwired to prioritize negative stimuli because missing a danger was far costlier than missing a reward.",
    examples: [
      "One critical comment ruining your mood despite ten compliments.",
      "Remembering a single bad vacation day more vividly than the great ones.",
      "News media focusing on crises because negative stories get more engagement.",
    ],
    counterSteps: [
      "For every negative thought, consciously identify two positive counterpoints.",
      "Keep a daily gratitude journal with at least three entries.",
      "Limit your consumption of negative news and social media.",
      "When reviewing feedback, give equal time to positive and negative comments.",
    ],
    tips: [
      "Actively practice gratitude by listing positive events each day.",
      "When you receive criticism, consciously balance it with positive feedback you've gotten.",
      "Limit exposure to negative news and social media.",
      "Reframe negative events by asking what you can learn from them.",
    ],
  },

  // ═══════════════════════════════════════
  // 🧩 MEMORY & PERCEPTION BIASES
  // ═══════════════════════════════════════
  {
    id: "false-memory",
    title: "False Memory",
    category: "Memory & Perception",
    definition: "The phenomenon where a person recalls something that did not happen or remembers it differently from the way it actually happened.",
    whyItHappens: "Memory is reconstructive, not reproductive. Each time we recall an event, we reassemble it from fragments, and external suggestions, emotions, or imagination can alter those fragments.",
    examples: [
      "Vividly remembering an event from childhood that your parents say never happened.",
      "Witnesses in court confidently identifying the wrong suspect.",
      "Believing you locked the door when you actually didn't.",
    ],
    counterSteps: [
      "Write down important events as soon as possible after they happen.",
      "Cross-check your memories with other witnesses or documentation.",
      "Be cautious of leading questions that might alter your recollection.",
      "Accept that vivid recall does not guarantee accuracy.",
    ],
    tips: [
      "Don't treat vivid memories as automatically accurate.",
      "Corroborate important memories with evidence or other people.",
      "Be cautious of leading questions that might reshape your recollections.",
      "Write things down close to when they happen for more reliable records.",
    ],
  },
  {
    id: "misinformation-effect",
    title: "Misinformation Effect",
    category: "Memory & Perception",
    definition: "The tendency for post-event information to interfere with and alter the memory of the original event.",
    whyItHappens: "New information blends with existing memory traces. When someone suggests details after an event, those suggestions can become incorporated into what we 'remember.'",
    examples: [
      "A witness changing their account after hearing another witness's version.",
      "Remembering a car accident as worse after reading a dramatic news report about it.",
      "Misremembering a conversation after someone tells you what they think was said.",
    ],
    counterSteps: [
      "Record your version of events before discussing them with others.",
      "Avoid media coverage of events you witnessed until you've documented your account.",
      "In important situations, write notes immediately after the event.",
      "Ask yourself: \"Is this my memory or something I heard later?\"",
    ],
    tips: [
      "Record your version of events before discussing them with others.",
      "Be cautious of how media coverage can reshape your memories.",
      "In important situations, write notes immediately after the event.",
      "Recognize that confidence in a memory doesn't guarantee its accuracy.",
    ],
  },
  {
    id: "peak-end-rule",
    title: "Peak-End Rule",
    category: "Memory & Perception",
    definition: "The tendency to judge an experience based on how you felt at its most intense point (the peak) and at its end, rather than the average of every moment.",
    whyItHappens: "Our brains compress long experiences into emotional highlights. The peak and the ending are the most salient moments, so they disproportionately shape our overall evaluation.",
    examples: [
      "A vacation remembered fondly because of one amazing day, despite several boring ones.",
      "A painful medical procedure rated as 'not that bad' because the ending was gentle.",
      "A great dinner ruined in memory by a rude waiter at checkout.",
    ],
    counterSteps: [
      "When evaluating a past experience, review the full timeline, not just highlights.",
      "Rate each phase of an experience separately, then average them.",
      "Design important experiences to end positively.",
      "Be aware that your summary of an experience may not reflect its entirety.",
    ],
    tips: [
      "Design experiences to end on a high note when possible.",
      "When evaluating past experiences, review the full timeline, not just highlights.",
      "Be aware that your memory of an experience may not reflect its totality.",
      "Use this knowledge to improve how you deliver experiences to others.",
    ],
  },
  {
    id: "serial-position-effect",
    title: "Serial Position Effect",
    category: "Memory & Perception",
    definition: "The tendency to best remember the first items (primacy) and last items (recency) in a list, while forgetting those in the middle.",
    whyItHappens: "First items get more rehearsal time and enter long-term memory (primacy). Last items are still fresh in working memory (recency). Middle items get neither advantage.",
    examples: [
      "Remembering the first and last items on a grocery list but forgetting the middle.",
      "Job candidates interviewed first or last being rated higher than those in the middle.",
      "The opening and closing acts of a concert being most memorable.",
    ],
    counterSteps: [
      "Pay special attention to information presented in the middle.",
      "Use written lists or notes rather than relying on memory.",
      "Review all items in a random order to reduce position effects.",
      "When presenting, repeat key middle points at the end.",
    ],
    tips: [
      "Put the most important information at the beginning or end of presentations.",
      "When studying, pay extra attention to material in the middle of a session.",
      "Use written lists rather than relying on memory for important sequences.",
      "Break long lists into smaller groups to reduce the effect.",
    ],
  },
  {
    id: "fading-affect-bias",
    title: "Fading Affect Bias",
    category: "Memory & Perception",
    definition: "The tendency for the emotions associated with negative memories to fade faster than those associated with positive memories.",
    whyItHappens: "This is likely a psychological defense mechanism. Letting negative emotions fade helps maintain mental well-being and allows us to move forward.",
    examples: [
      "A painful breakup that felt devastating at the time but now seems like 'not a big deal.'",
      "Remembering college fondly while forgetting the stress of exams.",
      "Past failures losing their sting while past successes retain their glow.",
    ],
    counterSteps: [
      "Journal about both positive and negative experiences regularly.",
      "When making decisions about the past, consult your journal, not just your feelings.",
      "Acknowledge that nostalgia may distort your perception.",
      "Use this bias to your advantage: know that current pain will soften over time.",
    ],
    tips: [
      "Use this bias to your advantage — know that current pain will likely soften.",
      "Be aware that nostalgia may paint the past more positively than it was.",
      "Journal about both positive and negative experiences to maintain balance.",
      "Don't make major decisions based solely on how you feel about past experiences.",
    ],
  },
  {
    id: "change-blindness",
    title: "Change Blindness",
    category: "Memory & Perception",
    definition: "The failure to notice significant changes in a visual scene when they occur gradually or during a brief interruption.",
    whyItHappens: "Our visual system doesn't capture a complete picture of the world — it constructs a model. When attention is diverted, even large changes can go undetected.",
    examples: [
      "Not noticing a friend's new haircut until they mention it.",
      "Failing to see that a website's design changed after an update.",
      "Missing a person being swapped out mid-conversation in psychology experiments.",
    ],
    counterSteps: [
      "Take before-and-after screenshots or notes when monitoring changes.",
      "Actively scan environments for differences, especially after interruptions.",
      "Use checklists to track details in important contexts.",
      "Ask someone else to verify changes you might have missed.",
    ],
    tips: [
      "Actively scan for changes when you know something might have shifted.",
      "Don't rely on passive observation for important details — check deliberately.",
      "Take before-and-after notes when monitoring systems or environments.",
      "Be aware that you may be missing more than you realize in daily life.",
    ],
  },
  {
    id: "selective-perception",
    title: "Selective Perception",
    category: "Memory & Perception",
    definition: "The tendency to filter information based on your expectations, allowing expected stimuli through while screening out the unexpected.",
    whyItHappens: "Our brains process an enormous amount of sensory data. To cope, they filter input based on what we expect or want to see, creating a biased view of reality.",
    examples: [
      "Sports fans seeing more fouls committed by the opposing team.",
      "A person looking to buy a specific car suddenly seeing that car everywhere.",
      "Hearing your name in a noisy room (the cocktail party effect).",
    ],
    counterSteps: [
      "Before entering a situation, write down what you expect to see.",
      "After the situation, compare your notes with someone who had different expectations.",
      "Practice mindful observation: try to notice what you normally wouldn't.",
      "Seek data and evidence rather than relying on subjective observation.",
    ],
    tips: [
      "Challenge your expectations before entering a situation.",
      "Ask others what they observed — their filters may differ from yours.",
      "Practice mindful observation: try to notice things you normally wouldn't.",
      "Be aware that your expectations shape what you literally see and hear.",
    ],
  },
  {
    id: "illusory-correlation",
    title: "Illusory Correlation",
    category: "Memory & Perception",
    definition: "The tendency to perceive a relationship between two unrelated things, often because they are unusual or stand out together.",
    whyItHappens: "Our brains are pattern-seeking machines. When two distinctive events co-occur, we remember them more vividly and assume a causal connection even when none exists.",
    examples: [
      "Believing that a full moon causes strange behavior.",
      "Associating a specific outfit with good luck after wearing it during a win.",
      "Thinking a minority group commits more crime because those cases are more memorable.",
    ],
    counterSteps: [
      "Track actual occurrences in a simple spreadsheet or tally.",
      "Ask: \"Am I noticing this because it's real or because it's memorable?\"",
      "Look for statistical evidence before assuming two things are related.",
      "Be especially skeptical of correlations involving rare or dramatic events.",
    ],
    tips: [
      "Look for statistical evidence before assuming two things are related.",
      "Ask: 'Am I noticing this pattern because it's real, or because it's memorable?'",
      "Track actual occurrences rather than relying on memory.",
      "Be especially cautious of correlations involving rare or distinctive events.",
    ],
  },
  {
    id: "halo-effect",
    title: "Halo Effect",
    category: "Memory & Perception",
    definition: "The tendency to let a positive impression in one area influence your overall judgment of a person, brand, or product.",
    whyItHappens: "Our brains love coherent narratives. If someone seems good in one way, we unconsciously assume they're good in other ways too, creating a 'halo' of positivity.",
    examples: [
      "Assuming an attractive person is also intelligent and kind.",
      "Trusting a celebrity's opinion on health because they're famous.",
      "Rating a product highly on all features because the packaging looks premium.",
    ],
    counterSteps: [
      "Evaluate each trait or quality independently using a checklist.",
      "Ask: \"Am I judging this based on evidence or on an unrelated positive impression?\"",
      "Seek objective data (reviews, metrics) rather than relying on first impressions.",
      "Delay overall judgments until you've assessed multiple dimensions.",
    ],
    tips: [
      "Evaluate each quality or trait independently.",
      "Ask: 'Am I judging this based on evidence, or based on an unrelated positive impression?'",
      "Seek objective data rather than relying on first impressions.",
      "Be especially critical when charisma or aesthetics are involved.",
    ],
  },
  {
    id: "horn-effect",
    title: "Horn Effect",
    category: "Memory & Perception",
    definition: "The tendency to let a negative impression in one area unfairly influence your overall judgment of a person or thing — the opposite of the Halo Effect.",
    whyItHappens: "Just as positive traits create a halo, negative traits create a 'horn.' One bad quality makes us assume everything else is also bad, simplifying our evaluation.",
    examples: [
      "Dismissing someone's ideas because they have poor grammar.",
      "Rating an entire restaurant experience as bad because of slow service, despite great food.",
      "Judging a job candidate negatively for all qualities after noticing one weakness.",
    ],
    counterSteps: [
      "List both strengths and weaknesses before forming an overall judgment.",
      "Ask: \"Is this one flaw actually relevant to what I'm evaluating?\"",
      "Give a second chance: revisit your assessment after more exposure.",
      "Separate the specific negative trait from the person or thing as a whole.",
    ],
    tips: [
      "Separate individual traits from your overall assessment.",
      "Ask: 'Is this one flaw actually relevant to what I'm evaluating?'",
      "Give people and things a fair chance beyond first impressions.",
      "Consciously list positive qualities alongside negative ones.",
    ],
  },

  // ═══════════════════════════════════════
  // 👥 SOCIAL BIASES
  // ═══════════════════════════════════════
  {
    id: "bandwagon-effect",
    title: "Bandwagon Effect",
    category: "Social",
    definition: "The tendency to adopt beliefs or behaviors because many other people do the same, regardless of the underlying evidence.",
    whyItHappens: "Humans are social creatures. Following the crowd feels safe and reduces the cognitive effort of independent evaluation. Social proof is a powerful motivator.",
    examples: [
      "Buying a product just because it's a bestseller.",
      "Adopting a political opinion because 'everyone' seems to hold it.",
      "Investing in a stock because it's trending on social media.",
    ],
    counterSteps: [
      "Before joining a trend, write down your own opinion without consulting others.",
      "Research the evidence independently before adopting a popular belief.",
      "Ask: \"Would I believe this if nobody else did?\"",
      "Wait 48 hours before making decisions influenced by social trends.",
    ],
    tips: [
      "Before following a trend, ask: 'Do I actually agree, or am I just following the crowd?'",
      "Evaluate decisions based on your own research and values.",
      "Remember that popularity does not equal correctness.",
      "Take time to form your own opinion before discussing with others.",
    ],
  },
  {
    id: "authority-bias",
    title: "Authority Bias",
    category: "Social",
    definition: "The tendency to attribute greater accuracy to the opinion of an authority figure, regardless of the content of their statement.",
    whyItHappens: "We're taught from childhood to respect and obey authority. This useful social rule can become a bias when we stop critically evaluating claims just because an authority makes them.",
    examples: [
      "Believing a health claim because a doctor said it, without checking the evidence.",
      "Following a financial advisor's risky advice without question.",
      "Accepting a manager's decision as correct simply because of their title.",
    ],
    counterSteps: [
      "Check whether the authority is an expert in the relevant domain.",
      "Look for the evidence behind their claim, not just who said it.",
      "Seek a second expert opinion, especially on high-stakes decisions.",
      "Remember that even experts can have conflicts of interest.",
    ],
    tips: [
      "Evaluate the evidence behind a claim, not just who made it.",
      "Check whether the authority is actually an expert in the relevant domain.",
      "Remember that even experts can be wrong or have conflicts of interest.",
      "Seek second opinions on important decisions.",
    ],
  },
  {
    id: "in-group-bias",
    title: "In-group Bias",
    category: "Social",
    definition: "The tendency to favor members of your own group over outsiders, giving them preferential treatment, trust, and positive evaluations.",
    whyItHappens: "Humans evolved in tribal groups where loyalty to your own group was essential for survival. This instinct persists, making us default to favoring 'our people.'",
    examples: [
      "Hiring someone from your own university over an equally qualified candidate.",
      "Defending a friend's bad behavior while condemning the same behavior in a stranger.",
      "Rooting for your national team regardless of their skill level.",
    ],
    counterSteps: [
      "Apply the same standards to in-group and out-group members.",
      "Ask: \"Would I evaluate this the same way if the person were from a different group?\"",
      "Include diverse perspectives in your decision-making process.",
      "Actively build relationships with people outside your usual circles.",
    ],
    tips: [
      "Be aware of your group affiliations and how they might influence your judgment.",
      "Apply the same standards to in-group and out-group members.",
      "Actively seek diverse perspectives in decision-making.",
      "Ask: 'Would I feel the same way if this person were not part of my group?'",
    ],
  },
  {
    id: "out-group-homogeneity-bias",
    title: "Out-group Homogeneity Bias",
    category: "Social",
    definition: "The tendency to see members of other groups as more similar to each other than members of your own group — 'they're all the same.'",
    whyItHappens: "We have more contact with our own group, so we see its diversity. With less exposure to other groups, we rely on stereotypes and generalizations.",
    examples: [
      "Thinking 'all politicians are the same' while seeing nuance in your own party.",
      "Believing all fans of a rival sports team are aggressive.",
      "Assuming all members of another culture share the same beliefs.",
    ],
    counterSteps: [
      "Seek individual stories and interactions with people from other groups.",
      "Challenge yourself whenever you catch yourself generalizing.",
      "Consume media and content created by members of other groups.",
      "Remind yourself that every group has as much diversity as your own.",
    ],
    tips: [
      "Seek individual interactions with people from other groups.",
      "Challenge yourself when you catch yourself generalizing about a group.",
      "Remember that every group has as much internal diversity as your own.",
      "Consume media and stories from diverse perspectives.",
    ],
  },
  {
    id: "stereotyping",
    title: "Stereotyping",
    category: "Social",
    definition: "The tendency to apply generalized beliefs about a group to an individual member without considering their unique characteristics.",
    whyItHappens: "Stereotypes are cognitive shortcuts that help us process social information quickly. While sometimes containing a kernel of truth, they oversimplify and often lead to inaccurate judgments.",
    examples: [
      "Assuming someone is good at math based on their ethnicity.",
      "Expecting an elderly person to be technologically incompetent.",
      "Assuming a man isn't nurturing or a woman isn't assertive.",
    ],
    counterSteps: [
      "Pause and ask: \"Am I making an assumption based on a group, not this individual?\"",
      "Seek out examples that contradict the stereotype.",
      "Get to know individuals personally before forming judgments.",
      "Expose yourself to diverse media that breaks common stereotypes.",
    ],
    tips: [
      "Treat each person as an individual with unique qualities.",
      "Challenge your assumptions by seeking contradictory evidence.",
      "Expose yourself to diverse examples that break stereotypes.",
      "Ask: 'Am I making assumptions about this person based on a group they belong to?'",
    ],
  },
  {
    id: "projection-bias",
    title: "Projection Bias",
    category: "Social",
    definition: "The tendency to assume that others share your current beliefs, values, feelings, or preferences.",
    whyItHappens: "Our own perspective is the most accessible reference point. It requires extra effort to imagine that others might think or feel differently from how we do.",
    examples: [
      "Assuming your coworkers are as excited about a project as you are.",
      "Buying a gift you would love rather than considering the recipient's taste.",
      "Thinking everyone agrees with your political views because your social circle does.",
    ],
    counterSteps: [
      "Before assuming, explicitly ask others about their preferences or feelings.",
      "Practice perspective-taking: imagine the situation from their unique viewpoint.",
      "Use surveys or structured feedback instead of guessing.",
      "Remind yourself: \"My feelings are not universal.\"",
    ],
    tips: [
      "Actively ask others about their preferences instead of assuming.",
      "Practice perspective-taking: genuinely try to see things from another's viewpoint.",
      "Remember that your feelings and preferences are not universal.",
      "Use surveys or feedback rather than guessing what others want.",
    ],
  },
  {
    id: "spotlight-effect",
    title: "Spotlight Effect",
    category: "Social",
    definition: "The tendency to overestimate how much other people notice your appearance, behavior, or mistakes.",
    whyItHappens: "We are the center of our own world, so we naturally assume others pay as much attention to us as we do to ourselves. In reality, most people are focused on their own lives.",
    examples: [
      "Feeling mortified about a small stain on your shirt, while no one else notices.",
      "Believing everyone noticed your awkward comment in a meeting.",
      "Avoiding the gym because you think everyone will judge your fitness level.",
    ],
    counterSteps: [
      "Recall the last time you noticed someone else's minor mistake — you probably didn't.",
      "Ask a trusted friend if they noticed your perceived blunder.",
      "Reframe: most people are too focused on themselves to notice your flaw.",
      "Track your \"embarrassing moments\" — you'll find they're forgotten by others quickly.",
    ],
    tips: [
      "Remember: people are far less focused on you than you think.",
      "Recall how often you notice small mistakes in others — it's rare.",
      "Reframe embarrassment: most 'embarrassing' moments are forgotten by others within minutes.",
      "Focus on your actions and growth rather than others' perceptions.",
    ],
  },
  {
    id: "social-comparison-bias",
    title: "Social Comparison Bias",
    category: "Social",
    definition: "The tendency to evaluate yourself by comparing to others, often leading to feelings of inadequacy or superiority.",
    whyItHappens: "Humans are inherently social and use others as benchmarks. Social media amplifies this by showing curated highlights of others' lives.",
    examples: [
      "Feeling inadequate after scrolling through Instagram highlight reels.",
      "Comparing your salary to a friend's and feeling undervalued.",
      "A student feeling like a failure because a classmate seems to study effortlessly.",
    ],
    counterSteps: [
      "Compare yourself to your past self rather than to others.",
      "Curate your social media feeds to reduce highlight-reel exposure.",
      "Define your own personal metrics for success.",
      "When you catch yourself comparing, note it and redirect to your own goals.",
    ],
    tips: [
      "Compare yourself to your past self, not to others.",
      "Remember that you're seeing others' highlights, not their struggles.",
      "Limit social media consumption when it triggers comparison.",
      "Define your own metrics for success rather than adopting others'.",
    ],
  },
  {
    id: "false-consensus-effect",
    title: "False Consensus Effect",
    category: "Social",
    definition: "The tendency to overestimate how much other people agree with your beliefs, values, and behaviors.",
    whyItHappens: "We surround ourselves with like-minded people, creating an echo chamber. We also use our own views as the baseline for 'normal,' inflating the perceived consensus.",
    examples: [
      "Assuming most people share your dietary preferences.",
      "Believing your opinion on a controversial topic is the majority view.",
      "Being shocked when an election result doesn't match your expectations.",
    ],
    counterSteps: [
      "Before assuming others agree, ask them directly.",
      "Expose yourself to diverse viewpoints outside your social circle.",
      "Look at survey data rather than relying on personal impression.",
      "Ask: \"Do I think everyone agrees because my bubble does?\"",
    ],
    tips: [
      "Actively seek out perspectives different from your own.",
      "Don't assume your social circle represents the general population.",
      "Look at data and surveys rather than relying on personal impression.",
      "Practice genuine curiosity about views that differ from yours.",
    ],
  },
  {
    id: "fundamental-attribution-error",
    title: "Fundamental Attribution Error",
    category: "Social",
    definition: "The tendency to attribute others' behavior to their character while attributing your own behavior to external circumstances.",
    whyItHappens: "When observing others, we focus on the person. When reflecting on ourselves, we're acutely aware of situational pressures. This asymmetry creates a double standard.",
    examples: [
      "Thinking someone who cut you off in traffic is reckless, but when you do it, you were in a rush.",
      "Labeling a coworker as lazy when they miss a deadline, but blaming your own miss on a heavy workload.",
      "Judging someone as unfriendly because they didn't smile, without considering they might be having a bad day.",
    ],
    counterSteps: [
      "When judging someone, list at least three situational factors that might explain their behavior.",
      "Apply the same empathy to others that you give yourself.",
      "Ask: \"What would I think if I were in their shoes?\"",
      "Default to assuming positive intent until proven otherwise.",
    ],
    tips: [
      "Before judging someone, ask: 'What situation might explain this behavior?'",
      "Apply the same empathy to others that you give yourself.",
      "Remember that you rarely know the full context of someone's actions.",
      "Practice assuming positive intent until proven otherwise.",
    ],
  },
  {
    id: "self-serving-bias",
    title: "Self-Serving Bias",
    category: "Social",
    definition: "The tendency to attribute your successes to your own abilities and efforts, while blaming failures on external factors.",
    whyItHappens: "This protects our self-esteem. Taking credit for wins feels good, while externalizing failures avoids the discomfort of personal responsibility.",
    examples: [
      "Acing a test and crediting your intelligence, but blaming a bad grade on an unfair exam.",
      "A manager taking credit for team success but blaming market conditions for failures.",
      "Winning a game due to 'skill' but losing due to 'bad luck.'",
    ],
    counterSteps: [
      "After a success, list the external factors and luck that contributed.",
      "After a failure, honestly assess what you could have done differently.",
      "Ask a trusted friend for their honest perspective on your role.",
      "Keep a balanced journal of both personal contributions and external factors.",
    ],
    tips: [
      "When you succeed, acknowledge the external factors that helped.",
      "When you fail, honestly assess what you could have done differently.",
      "Ask trusted others for their perspective on your role in outcomes.",
      "Practice balanced self-reflection regularly.",
    ],
  },
  {
    id: "bystander-effect",
    title: "Bystander Effect",
    category: "Social",
    definition: "The tendency for individuals to be less likely to help someone in distress when other people are present.",
    whyItHappens: "In a group, responsibility feels diffused — 'someone else will help.' We also look to others for cues on how to act, and if no one acts, we assume action isn't needed.",
    examples: [
      "Witnessing a car accident on a busy road and assuming someone else has already called 911.",
      "Not speaking up in a meeting when you notice an error, assuming someone more senior will.",
      "Walking past someone who dropped their groceries because others are also walking past.",
    ],
    counterSteps: [
      "If you see someone in need, commit to acting — don't wait for others.",
      "Point to a specific person and ask them directly for help.",
      "Recognize the diffusion of responsibility and consciously override it.",
      "Practice being the first to act in low-stakes situations to build the habit.",
    ],
    tips: [
      "If you see someone in need, act — don't assume others will.",
      "In emergencies, point to a specific person and ask them to help.",
      "Recognize the diffusion of responsibility and consciously override it.",
      "Be the first to act — it often triggers others to help too.",
    ],
  },
  {
    id: "just-world-hypothesis",
    title: "Just-World Hypothesis",
    category: "Social",
    definition: "The belief that the world is fundamentally fair — that people get what they deserve and deserve what they get.",
    whyItHappens: "Believing in a just world gives us a sense of control and predictability. If bad things only happen to bad people, we feel safer. This leads to blaming victims for their misfortune.",
    examples: [
      "Blaming a crime victim for 'being in the wrong place.'",
      "Assuming wealthy people earned their fortune purely through hard work.",
      "Believing that someone who lost their job must have been a bad employee.",
    ],
    counterSteps: [
      "When you catch yourself blaming a victim, stop and consider structural factors.",
      "Learn about systemic inequalities that affect outcomes.",
      "Ask: \"Am I attributing this to fairness because it makes me feel safer?\"",
      "Practice compassion by listening to people's stories without judgment.",
    ],
    tips: [
      "Recognize that luck, privilege, and systemic factors play major roles in outcomes.",
      "Catch yourself when you're blaming victims for their circumstances.",
      "Develop compassion by learning about structural inequalities.",
      "Ask: 'Am I attributing this outcome to fairness because it makes me feel safer?'",
    ],
  },

  // ═══════════════════════════════════════
  // 💰 DECISION-MAKING BIASES
  // ═══════════════════════════════════════
  {
    id: "loss-aversion",
    title: "Loss Aversion",
    category: "Decision-Making",
    definition: "The tendency to prefer avoiding losses over acquiring equivalent gains — losses feel roughly twice as painful as gains feel good.",
    whyItHappens: "Evolutionarily, losing resources could mean death, while gaining extra resources was less critical. This asymmetry is deeply wired into our emotional responses.",
    examples: [
      "Holding onto a losing stock hoping it'll recover, instead of selling and reinvesting.",
      "Refusing to return a product you don't like because it feels like losing money.",
      "Staying in a bad situation because the fear of losing what you have outweighs potential gains.",
    ],
    counterSteps: [
      "Reframe the decision in terms of potential gains, not just losses.",
      "Set pre-defined rules for when to cut your losses.",
      "Ask: \"Would I make this choice if I were starting from zero?\"",
      "Accept that the emotional pain of loss fades faster than you expect.",
    ],
    tips: [
      "Frame decisions in terms of what you'll gain, not just what you might lose.",
      "Ask: 'Would I make the same decision if I were starting from zero?'",
      "Set rules in advance for when to cut losses (e.g., sell a stock if it drops 10%).",
      "Recognize that the pain of loss often fades faster than you expect.",
    ],
  },
  {
    id: "endowment-effect",
    title: "Endowment Effect",
    category: "Decision-Making",
    definition: "The tendency to overvalue something simply because you own it.",
    whyItHappens: "Ownership creates an emotional attachment. Once we possess something, losing it feels like a loss — triggering loss aversion — so we demand more to give it up than we'd pay to acquire it.",
    examples: [
      "Pricing your used car higher than its market value because 'it's special to you.'",
      "Refusing to trade a coffee mug you were given, even for something objectively better.",
      "Homeowners overpricing their house because of sentimental attachment.",
    ],
    counterSteps: [
      "Imagine you don't own the item — would you buy it at the price you're asking?",
      "Get objective valuations from disinterested third parties.",
      "Separate emotional attachment from market value.",
      "Practice decluttering regularly to weaken ownership attachment.",
    ],
    tips: [
      "Imagine you don't own the item — would you buy it at the price you're asking?",
      "Get objective valuations from others before setting prices.",
      "Separate emotional value from market value in transactions.",
      "Practice letting go of possessions periodically to weaken the attachment.",
    ],
  },
  {
    id: "zero-risk-bias",
    title: "Zero-Risk Bias",
    category: "Decision-Making",
    definition: "The preference to completely eliminate one small risk rather than making a larger overall reduction in risk.",
    whyItHappens: "Our brains crave certainty. Eliminating a risk entirely feels more satisfying than reducing a larger risk partially, even when the latter saves more lives or resources.",
    examples: [
      "Spending millions to make one product 100% safe rather than improving safety across many products.",
      "Choosing a plan with zero deductible over one with better overall coverage.",
      "A city fixing one perfectly safe playground rather than improving ten dangerous ones.",
    ],
    counterSteps: [
      "Compare total risk reduction across all options, not just one.",
      "Use expected-value calculations to prioritize safety investments.",
      "Ask: \"Does eliminating this small risk come at the cost of ignoring bigger ones?\"",
      "Focus on data-driven risk prioritization rather than emotional certainty.",
    ],
    tips: [
      "Compare total risk reduction, not just whether a single risk reaches zero.",
      "Think in terms of expected outcomes across all options.",
      "Ask: 'Does eliminating this small risk come at the cost of ignoring bigger ones?'",
      "Use data to prioritize where safety investments have the highest impact.",
    ],
  },
  {
    id: "pessimism-bias",
    title: "Pessimism Bias",
    category: "Decision-Making",
    definition: "The tendency to overestimate the likelihood of negative outcomes, seeing the worst-case scenario as the most probable.",
    whyItHappens: "While some pessimism is protective, this bias goes further — anxiety and past negative experiences can make threats seem more likely and severe than they are.",
    examples: [
      "Assuming a new project will fail before it's even started.",
      "Expecting the worst outcome from a medical test despite low statistical risk.",
      "Avoiding investment opportunities because 'the market will crash.'",
    ],
    counterSteps: [
      "Check the actual base rate — how often does the worst case really happen?",
      "Write three scenarios: worst-case, best-case, and most-likely-case.",
      "Track your pessimistic predictions to see how often they were warranted.",
      "Distinguish between productive caution and paralyzing fear.",
    ],
    tips: [
      "Check base rates — how often does the worst case actually happen?",
      "Balance worst-case thinking with best-case and most-likely-case scenarios.",
      "Track your predictions to see how often your pessimism was warranted.",
      "Distinguish between productive caution and paralyzing pessimism.",
    ],
  },
  {
    id: "ambiguity-effect",
    title: "Ambiguity Effect",
    category: "Decision-Making",
    definition: "The tendency to avoid options where the probability of a favorable outcome is unknown, preferring options with known probabilities even when the unknown option might be better.",
    whyItHappens: "Uncertainty is uncomfortable. Our brains prefer known risks over unknown ones, even when the unknown option could yield better results.",
    examples: [
      "Choosing a guaranteed low return over an investment with potentially higher but uncertain returns.",
      "Sticking with a familiar brand rather than trying a new one with great reviews.",
      "Avoiding a new career path because the outcome is uncertain, despite being unhappy in your current job.",
    ],
    counterSteps: [
      "Gather more information to reduce the ambiguity before deciding.",
      "Ask: \"Am I avoiding this because it's bad, or because it's uncertain?\"",
      "Start with a small, reversible experiment to test the unknown option.",
      "Separate the discomfort of uncertainty from the actual quality of the option.",
    ],
    tips: [
      "Distinguish between risk (known probabilities) and ambiguity (unknown probabilities).",
      "Gather more information to reduce ambiguity before deciding.",
      "Ask: 'Am I avoiding this because it's actually bad, or because it's uncertain?'",
      "Start with small, reversible experiments to test unknown options.",
    ],
  },
  {
    id: "decoy-effect",
    title: "Decoy Effect",
    category: "Decision-Making",
    definition: "The phenomenon where adding a third, less attractive option (the decoy) makes one of the original two options seem more appealing.",
    whyItHappens: "We evaluate options relative to each other, not in absolute terms. A strategically placed decoy makes the target option look like a clear winner by comparison.",
    examples: [
      "A medium popcorn priced almost as high as a large makes the large seem like the best deal.",
      "A subscription plan with fewer features at nearly the same price as the premium plan pushes you toward premium.",
      "A real estate agent showing you a slightly worse house at the same price to make the target house look better.",
    ],
    counterSteps: [
      "Evaluate each option on its own merits, not relative to others.",
      "Mentally remove the middle option and check if your preference changes.",
      "Ask: \"Would I choose this if the other options weren't there?\"",
      "Be suspicious of pricing tiers that seem designed to push you toward one choice.",
    ],
    tips: [
      "Evaluate each option on its own merits, not relative to others.",
      "Remove the middle option mentally and see if your preference changes.",
      "Ask: 'Would I choose this if the other options weren't there?'",
      "Be suspicious when pricing structures seem designed to push you toward one choice.",
    ],
  },

  // ═══════════════════════════════════════
  // 🧪 LOGICAL & REASONING BIASES
  // ═══════════════════════════════════════
  {
    id: "survivorship-bias",
    title: "Survivorship Bias",
    category: "Logical & Reasoning",
    definition: "The tendency to focus on successful examples while overlooking failures, leading to false conclusions about what causes success.",
    whyItHappens: "Failures are often invisible — failed companies shut down, failed products disappear. We only see what survived, creating a distorted picture of reality.",
    examples: [
      "Studying only successful entrepreneurs and concluding that dropping out of college leads to success.",
      "Believing old buildings were better made because only the sturdy ones are still standing.",
      "Thinking a specific diet works because you only hear from people who succeeded.",
    ],
    counterSteps: [
      "Always ask: \"Where are the failures? What happened to those who didn't succeed?\"",
      "Seek data on failure rates alongside success stories.",
      "Be skeptical of advice drawn solely from successful examples.",
      "Look for the full dataset including those who tried and failed.",
    ],
    tips: [
      "Always ask: 'Where are the failures? What happened to those who didn't make it?'",
      "Look for data on failure rates alongside success stories.",
      "Be skeptical of advice based solely on successful examples.",
      "Seek out the full dataset, including those who tried and failed.",
    ],
  },
  {
    id: "base-rate-fallacy",
    title: "Base Rate Fallacy",
    category: "Logical & Reasoning",
    definition: "The tendency to ignore general statistical information (base rates) in favor of specific, individual information.",
    whyItHappens: "Specific, vivid details are more emotionally compelling than abstract statistics. Stories about individuals override our ability to reason about probabilities.",
    examples: [
      "Fearing terrorism more than heart disease despite heart disease being far more common.",
      "Believing a positive medical test means you definitely have the disease, ignoring the low prevalence rate.",
      "Assuming someone described as 'quiet and organized' is a librarian rather than a salesperson, ignoring that salespeople vastly outnumber librarians.",
    ],
    counterSteps: [
      "Before evaluating specific evidence, look up the base rate.",
      "Ask: \"How common is this in the general population?\"",
      "Use Bayesian reasoning: update beliefs based on both prior probability and new evidence.",
      "Be wary of vivid stories that override statistical reasoning.",
    ],
    tips: [
      "Always consider the base rate before evaluating specific evidence.",
      "Ask: 'How common is this in the general population?'",
      "Use Bayesian thinking: update your beliefs based on both prior probability and new evidence.",
      "Be wary of dramatic stories that override statistical reasoning.",
    ],
  },
  {
    id: "gamblers-fallacy",
    title: "Gambler's Fallacy",
    category: "Logical & Reasoning",
    definition: "The belief that past random events affect the probability of future random events — for example, thinking a coin is 'due' for heads after several tails.",
    whyItHappens: "Our pattern-seeking brains expect balance in random sequences. After a streak, we feel the opposite outcome is 'owed,' but independent events have no memory.",
    examples: [
      "Betting on red at roulette because black has come up five times in a row.",
      "Thinking you're 'due' for a win after a losing streak in gambling.",
      "Expecting a boy after having three girls, as if nature keeps a tally.",
    ],
    counterSteps: [
      "Remind yourself: each independent event has no memory of past events.",
      "Don't look for patterns in truly random sequences.",
      "Learn the difference between independent and dependent probabilities.",
      "Set fixed limits before gambling and stick to them regardless of streaks.",
    ],
    tips: [
      "Remember: independent random events don't influence each other.",
      "Don't look for patterns in truly random sequences.",
      "Understand the difference between independent and dependent probabilities.",
      "When gambling, accept that each event starts fresh regardless of history.",
    ],
  },
  {
    id: "clustering-illusion",
    title: "Clustering Illusion",
    category: "Logical & Reasoning",
    definition: "The tendency to see patterns in random data, interpreting clusters or streaks as meaningful when they occur by chance.",
    whyItHappens: "Our brains evolved to detect patterns for survival. This hyperactive pattern recognition makes us see structure even in random noise.",
    examples: [
      "Seeing a 'hot streak' in basketball when the player's shots are statistically random.",
      "Finding meaningful shapes in clouds or random noise.",
      "Believing a series of coincidences must have a deeper meaning.",
    ],
    counterSteps: [
      "Learn what random data actually looks like — it's clumpier than you expect.",
      "Ask: \"Would this pattern still stand out in a much larger dataset?\"",
      "Run a simple statistical test before concluding a pattern is real.",
      "Be especially cautious of patterns in small sample sizes.",
    ],
    tips: [
      "Learn basic statistics to understand what random data actually looks like.",
      "Ask: 'Would this pattern still stand out in a larger dataset?'",
      "Run statistical tests before concluding that a pattern is real.",
      "Remember that humans are prone to seeing patterns even where none exist.",
    ],
  },
  {
    id: "illusion-of-control",
    title: "Illusion of Control",
    category: "Logical & Reasoning",
    definition: "The tendency to believe you have influence over outcomes that are actually determined by chance.",
    whyItHappens: "We prefer feeling in control. When we're involved in a process, we overestimate our ability to influence its outcome, even when it's purely random.",
    examples: [
      "Blowing on dice before rolling them in a board game.",
      "Choosing your own lottery numbers instead of using quick pick, thinking it improves your odds.",
      "A trader believing their gut feeling controls market movements.",
    ],
    counterSteps: [
      "Ask: \"Do my actions actually change the probability of this outcome?\"",
      "Distinguish between skill-based and chance-based situations.",
      "Track your results objectively to see if your rituals make a difference.",
      "Accept uncertainty and redirect effort to areas where you have real influence.",
    ],
    tips: [
      "Distinguish between situations where skill matters and those governed by chance.",
      "Ask: 'Do my actions actually change the probability of this outcome?'",
      "Track results objectively to see if your 'control' actually makes a difference.",
      "Accept uncertainty and focus your effort where you have real influence.",
    ],
  },
  {
    id: "curse-of-knowledge",
    title: "Curse of Knowledge",
    category: "Logical & Reasoning",
    definition: "The difficulty of imagining what it's like not to know something once you already know it, making communication with novices harder.",
    whyItHappens: "Once knowledge is embedded, it becomes 'obvious' to us. We forget the learning process and fail to recognize that others don't share our understanding.",
    examples: [
      "An expert giving a jargon-filled presentation that confuses the audience.",
      "A teacher frustrated that students don't grasp a concept that seems simple.",
      "A developer writing documentation that only other developers can understand.",
    ],
    counterSteps: [
      "When explaining, pretend you're hearing the concept for the first time.",
      "Use analogies and everyday language instead of jargon.",
      "Test your explanation on someone unfamiliar with the topic.",
      "Ask your audience to summarize what they understood and fill in gaps.",
    ],
    tips: [
      "When explaining, imagine you're hearing this information for the first time.",
      "Use analogies and simple language, even for complex topics.",
      "Test your explanations on someone unfamiliar with the subject.",
      "Ask your audience questions to check their understanding.",
    ],
  },
  {
    id: "conjunction-fallacy",
    title: "Conjunction Fallacy",
    category: "Logical & Reasoning",
    definition: "The tendency to believe that a combination of specific conditions is more probable than a single general one.",
    whyItHappens: "Detailed, specific scenarios feel more plausible because they create a vivid narrative. We confuse a good story with high probability.",
    examples: [
      "Thinking 'Linda is a bank teller and a feminist' is more likely than 'Linda is a bank teller' after hearing she studied philosophy.",
      "Believing a specific, detailed prediction over a vague one, even though the specific one is mathematically less likely.",
      "Expecting a complex chain of events over a simpler but more probable explanation.",
    ],
    counterSteps: [
      "Remember: adding conditions always reduces or maintains probability.",
      "Be skeptical of detailed scenarios that feel more \"realistic.\"",
      "Practice basic probability reasoning with simple examples.",
      "Ask: \"Is this less likely simply because it's more specific?\"",
    ],
    tips: [
      "Remember: adding conditions always reduces (or maintains) probability, never increases it.",
      "Be skeptical of scenarios that are compelling because they're detailed.",
      "Practice basic probability reasoning.",
      "Ask: 'Is this less likely simply because it's more specific?'",
    ],
  },
  {
    id: "appeal-to-probability",
    title: "Appeal to Probability",
    category: "Logical & Reasoning",
    definition: "The logical fallacy of assuming that because something is possible or probable, it is therefore certain or inevitable.",
    whyItHappens: "Our brains struggle with gradations of probability. It's easier to think in binary (will happen/won't happen) than to maintain nuanced probabilistic thinking.",
    examples: [
      "Assuming that because there's a chance of rain, it will definitely rain — and canceling plans.",
      "Worrying that because accidents can happen, one will happen to you.",
      "Believing that because a business idea could work, it will work.",
    ],
    counterSteps: [
      "Assign a rough probability (percentage) to the outcome.",
      "Distinguish between possible, probable, and certain.",
      "Make decisions based on expected value, not extreme scenarios alone.",
      "Ask: \"What is the actual likelihood, not just the possibility?\"",
    ],
    tips: [
      "Distinguish between possible, probable, and certain.",
      "Assign rough probabilities to outcomes instead of thinking in absolutes.",
      "Make decisions based on expected value, not worst-case or best-case alone.",
      "Ask: 'What is the actual likelihood, not just the possibility?'",
    ],
  },

  // ═══════════════════════════════════════
  // ⚡ BEHAVIORAL & EVERYDAY BIASES
  // ═══════════════════════════════════════
  {
    id: "default-effect",
    title: "Default Effect",
    category: "Behavioral & Everyday",
    definition: "The tendency to stick with the pre-selected or default option, even when alternatives might be better.",
    whyItHappens: "Choosing requires effort, and defaults feel like the 'recommended' choice. We interpret the default as the normal or safe option and see no reason to change it.",
    examples: [
      "Keeping the default ringtone on your phone for years.",
      "Staying enrolled in a retirement plan you didn't choose because it was the default.",
      "Accepting default privacy settings on apps without reviewing them.",
    ],
    counterSteps: [
      "Review default settings on all your accounts and devices.",
      "Ask: \"Is this default serving me, or the company that set it?\"",
      "Treat every default as a conscious choice — opt in deliberately.",
      "Set a quarterly reminder to audit subscriptions and settings.",
    ],
    tips: [
      "Review default settings on all your accounts and devices.",
      "Ask: 'Is this default serving me, or is it serving the company that set it?'",
      "Treat defaults as suggestions, not recommendations.",
      "Periodically audit your subscriptions, settings, and automatic enrollments.",
    ],
  },
  {
    id: "ikea-effect",
    title: "IKEA Effect",
    category: "Behavioral & Everyday",
    definition: "The tendency to place disproportionately high value on things you helped create, regardless of their objective quality.",
    whyItHappens: "Investing labor creates emotional ownership. The effort we put into building something makes us feel more attached to it and overvalue it compared to similar items made by others.",
    examples: [
      "Proudly displaying a poorly assembled bookshelf because you built it yourself.",
      "A manager overvaluing their own proposal over a better one from a colleague.",
      "Preferring your homemade meal even when a restaurant version tastes better.",
    ],
    counterSteps: [
      "Seek external, unbiased feedback on things you've built.",
      "Compare your creation objectively against alternatives you didn't make.",
      "Ask: \"Would I value this as highly if someone else had made it?\"",
      "Be willing to replace your own work with a better solution.",
    ],
    tips: [
      "Seek external opinions on things you've created.",
      "Compare your creation objectively against alternatives.",
      "Ask: 'Would I value this as highly if someone else had made it?'",
      "Be open to replacing your work with better solutions.",
    ],
  },
  {
    id: "effort-justification",
    title: "Effort Justification",
    category: "Behavioral & Everyday",
    definition: "The tendency to value outcomes more highly when they required significant effort, even if the effort was unnecessary.",
    whyItHappens: "If we suffered or worked hard for something, our brain needs to justify that effort. Admitting it wasn't worth it would create uncomfortable cognitive dissonance.",
    examples: [
      "Valuing a college degree more after a grueling program, regardless of what was actually learned.",
      "Defending a difficult hazing ritual as 'character building.'",
      "Insisting a complicated recipe tastes better simply because it took hours to prepare.",
    ],
    counterSteps: [
      "Evaluate outcomes based on their actual quality, not effort invested.",
      "Ask: \"Would I value this the same if it had been easy?\"",
      "Be cautious of processes that use unnecessary difficulty to create loyalty.",
      "Remember that efficiency and smart shortcuts are strengths, not weaknesses.",
    ],
    tips: [
      "Evaluate outcomes based on their actual quality, not the effort invested.",
      "Ask: 'Would I value this the same if it had been easy?'",
      "Be wary of organizations or processes that use unnecessary difficulty to create loyalty.",
      "Remember that efficiency and smart shortcuts are virtues, not weaknesses.",
    ],
  },
  {
    id: "present-bias",
    title: "Present Bias",
    category: "Behavioral & Everyday",
    definition: "The tendency to give stronger weight to immediate rewards over future ones, even when waiting would yield a significantly better outcome.",
    whyItHappens: "Our brains evolved for environments where the future was uncertain, making immediate rewards more valuable. This wiring persists even when delayed gratification is clearly better.",
    examples: [
      "Spending money now instead of saving for retirement.",
      "Choosing to scroll social media instead of studying for an exam next week.",
      "Eating junk food for instant pleasure despite long-term health goals.",
    ],
    counterSteps: [
      "Pre-commit to future-oriented decisions: automate savings, schedule workouts.",
      "Visualize your future self benefiting from today's discipline.",
      "Add friction to impulsive choices (e.g., 24-hour waiting period for purchases).",
      "Use implementation intentions: \"When X happens, I will do Y.\"",
    ],
    tips: [
      "Pre-commit to decisions: automate savings, schedule workouts, meal prep.",
      "Visualize your future self benefiting from today's discipline.",
      "Use implementation intentions: 'When X happens, I will do Y.'",
      "Make the delayed reward feel more concrete and immediate.",
    ],
  },
  {
    id: "planning-fallacy",
    title: "Planning Fallacy",
    category: "Behavioral & Everyday",
    definition: "The tendency to underestimate the time, cost, and risk of future actions while overestimating their benefits.",
    whyItHappens: "We plan based on best-case scenarios and our idealized vision, ignoring past experiences with similar tasks. Optimism and poor reference class forecasting both contribute.",
    examples: [
      "Home renovations consistently taking twice as long and costing twice as much as planned.",
      "Students consistently underestimating how long assignments will take.",
      "Software projects going over budget and past deadline almost universally.",
    ],
    counterSteps: [
      "Use reference class forecasting: look at how long similar tasks actually took.",
      "Add 50-100% buffer to your time and cost estimates.",
      "Break the project into small tasks and estimate each separately.",
      "Track your estimates vs. actuals over time to improve calibration.",
    ],
    tips: [
      "Use 'reference class forecasting': look at how long similar projects actually took.",
      "Add 50-100% buffer to your time and cost estimates.",
      "Break projects into small tasks and estimate each one separately.",
      "Track your estimates vs. actuals to calibrate over time.",
    ],
  },
  {
    id: "zeigarnik-effect",
    title: "Zeigarnik Effect",
    category: "Behavioral & Everyday",
    definition: "The tendency to remember uncompleted or interrupted tasks better than completed ones.",
    whyItHappens: "Unfinished tasks create cognitive tension — your brain keeps them 'active' until closure is achieved. Completed tasks are filed away and forgotten.",
    examples: [
      "A waiter remembering orders perfectly until they're served, then forgetting them instantly.",
      "Lying awake thinking about an unfinished work task.",
      "Cliffhangers in TV shows being so effective because they leave stories unresolved.",
    ],
    counterSteps: [
      "Write down all open tasks to offload them from your working memory.",
      "Before bed, create tomorrow's to-do list to quiet mental loops.",
      "Use this effect positively: start tasks briefly to create momentum.",
      "Break large projects into smaller, completable chunks for closure.",
    ],
    tips: [
      "Write down open tasks to 'offload' them from your mind.",
      "Use this effect positively: start tasks even briefly to create momentum.",
      "Before bed, write tomorrow's to-do list to quiet unfinished-task anxiety.",
      "Break large projects into smaller completable chunks for a sense of closure.",
    ],
  },
  {
    id: "mere-exposure-effect",
    title: "Mere Exposure Effect",
    category: "Behavioral & Everyday",
    definition: "The tendency to develop a preference for things simply because you are familiar with them.",
    whyItHappens: "Familiarity signals safety — if something hasn't harmed you before, it's probably safe. This creates a positive association with repeated exposure, even without any conscious evaluation.",
    examples: [
      "Preferring a song you initially disliked after hearing it multiple times.",
      "Choosing a familiar brand over an unknown one, even without evidence of better quality.",
      "Feeling more comfortable around people you see regularly, even without interacting.",
    ],
    counterSteps: [
      "Ask: \"Do I prefer this because it's better, or because I'm used to it?\"",
      "Deliberately try unfamiliar alternatives on a regular basis.",
      "Set a \"new experience\" goal each week or month.",
      "Use this effect intentionally: expose yourself repeatedly to things you want to learn.",
    ],
    tips: [
      "Be aware that familiarity ≠ quality.",
      "Deliberately try new things to counteract the comfort of the familiar.",
      "In decisions, ask: 'Do I prefer this because it's better, or because I'm used to it?'",
      "Use this effect positively: expose yourself repeatedly to things you want to learn or appreciate.",
    ],
  },
  {
    id: "reactance",
    title: "Reactance",
    category: "Behavioral & Everyday",
    definition: "The tendency to do the opposite of what someone wants you to do when you feel your freedom is being restricted.",
    whyItHappens: "Humans value autonomy. When we feel our choices are being limited or controlled, we instinctively push back — even if the restricted option wasn't something we wanted.",
    examples: [
      "A teenager doing exactly what their parents told them not to do.",
      "Wanting a product more after being told it's banned or restricted.",
      "Resisting a doctor's advice simply because it was phrased as a command.",
    ],
    counterSteps: [
      "Notice when your resistance is driven by the restriction, not your preference.",
      "Ask: \"Would I want this if no one told me I couldn't have it?\"",
      "When persuading others, offer choices instead of commands.",
      "Pause before reacting oppositionally — check if the suggestion actually has merit.",
    ],
    tips: [
      "When persuading others, offer choices rather than commands.",
      "Notice when your resistance is driven by the restriction, not your actual preference.",
      "Ask: 'Would I want this if no one had told me I couldn't have it?'",
      "Frame suggestions as options, not obligations, to reduce reactance in others.",
    ],
  },
  {
    id: "hyperbolic-discounting",
    title: "Hyperbolic Discounting",
    category: "Behavioral & Everyday",
    definition: "The tendency to prefer smaller, immediate rewards over larger, later ones — with the preference growing stronger as the immediate option gets closer.",
    whyItHappens: "Our brains evaluate future rewards using a curved (hyperbolic) discount function rather than a steady one. The closer a reward gets, the more its value spikes relative to future alternatives.",
    examples: [
      "Choosing $50 today over $100 in six months.",
      "Opting for fast food now over cooking a healthier meal later.",
      "Spending a bonus immediately rather than investing it for greater future returns.",
    ],
    counterSteps: [
      "Use commitment devices: lock savings, set auto-investments.",
      "Create friction for impulsive spending (remove saved cards, add wait times).",
      "Visualize the larger future reward in concrete, tangible terms.",
      "Compare the per-day value of the immediate vs. delayed reward.",
    ],
    tips: [
      "Use commitment devices: lock away savings, set up automatic investments.",
      "Create distance from temptation — if you can't access it easily, you'll choose the future reward.",
      "Visualize your future self enjoying the larger reward.",
      "Add friction to impulsive choices (e.g., 24-hour waiting periods for purchases).",
    ],
  },
  {
    id: "habit-bias",
    title: "Habit Bias",
    category: "Behavioral & Everyday",
    definition: "The tendency to continue behaviors out of habit rather than active decision-making, even when the original reason for the habit no longer applies.",
    whyItHappens: "Habits operate on autopilot through the basal ganglia, bypassing conscious decision-making. This efficiency is useful but can keep us locked into outdated behaviors.",
    examples: [
      "Taking the same route to work every day even though a faster one exists.",
      "Ordering the same meal at a restaurant without looking at the menu.",
      "Continuing to use a software tool you learned years ago despite better alternatives.",
    ],
    counterSteps: [
      "Audit your routines quarterly — which ones still serve you?",
      "Try changing one small habit each month to stay mentally flexible.",
      "Ask: \"Am I doing this because it's best, or because it's automatic?\"",
      "Use habit-stacking: attach new, better behaviors to existing triggers.",
    ],
    tips: [
      "Periodically audit your routines: which ones are still serving you?",
      "Try changing one small habit each month to stay mentally flexible.",
      "Ask: 'Am I doing this because it's best, or because it's automatic?'",
      "Use 'habit stacking' — attach new, better behaviors to existing habit triggers.",
    ],
  },
];

export const biasCategories: BiasCategory[] = [
  "Core Thinking",
  "Memory & Perception",
  "Social",
  "Decision-Making",
  "Logical & Reasoning",
  "Behavioral & Everyday",
];

export function getBiasesByCategory(category: BiasCategory): CognitiveBias[] {
  return biases.filter((b) => b.category === category);
}

import { registerBiasCatalog, resolveTodaysBias } from "@/lib/biasRotation";

registerBiasCatalog(biases);

export function getAllBiases(): CognitiveBias[] {
  return biases;
}

/**
 * Returns today's bias using sequential safeStorage-based rotation.
 *
 * - Same bias all day (multiple opens → same result)
 * - Advances by 1 each new day (skipped days still advance correctly)
 * - Loops back to index 0 after the 60th bias
 * - First-time user starts at index 0
 * - Timezone-safe (uses local date)
 * - Tracks seen biases per cycle via resolveTodaysBias()
 */
export function getTodaysBias(): CognitiveBias {
  return resolveTodaysBias().bias;
}

/** Progress-aware resolver — use on Today page for milestone detection. */
export { resolveTodaysBias };
