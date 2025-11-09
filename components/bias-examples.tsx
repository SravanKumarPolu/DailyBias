"use client"

import { motion } from "framer-motion"
import { Lightbulb, CheckCircle2 } from "lucide-react"
import type { Bias } from "@/lib/types"

interface BiasExamplesProps {
  bias: Bias
}

// Generate contextual examples based on bias type
export function generateExamples(bias: Bias): string[] {
  const examples: { [key: string]: string[] } = {
    "fundamental-attribution-error": [
      "Thinking someone who cut you off in traffic is a rude person, not considering they might be rushing to an emergency",
      "Judging a coworker as lazy for missing a deadline, without knowing they're dealing with a family crisis",
      "Assuming a waiter is incompetent when your order is wrong, not considering kitchen errors or miscommunication",
    ],
    "self-serving-bias": [
      "Attributing your promotion to hard work but blaming office politics when passed over",
      "Crediting skill when your investment succeeds, but bad luck when it fails",
      "Taking credit for a successful team project but blaming others when it goes poorly",
    ],
    "in-group-favoritism": [
      "Trusting advice from alumni of your university more than equally qualified outsiders",
      "Giving teammates benefit of the doubt for mistakes while judging competitors harshly",
      "Sharing opportunities with people from your social circle before considering others",
    ],
    "bandwagon-effect": [
      "Buying a product because it's trending, without researching if it meets your needs",
      "Adopting political views because they're popular in your social circle",
      "Joining a gym membership in January because everyone else is doing it",
    ],
    "groupthink": [
      "A team unanimously approving a flawed strategy because no one wants to disagree",
      "Board members not questioning a CEO's risky decision to maintain harmony",
      "Committee members suppressing doubts to reach quick consensus",
    ],
    "halo-effect": [
      "Assuming an attractive person is also intelligent, kind, and competent",
      "Believing everything a successful entrepreneur says, even outside their expertise",
      "Judging a well-designed product as higher quality without testing it",
    ],
    "moral-luck": [
      "Judging a drunk driver more harshly if they hit someone than if they arrived home safely",
      "Praising a doctor for a successful surgery that had significant luck involved",
      "Condemning a decision based on its outcome rather than the information available when made",
    ],
    "false-consensus": [
      "Assuming most people share your political views because your friends do",
      "Believing your lifestyle choices are more common than they actually are",
      "Thinking everyone agrees with your opinion in a meeting due to lack of vocal opposition",
    ],
    "curse-of-knowledge": [
      "A programmer using jargon when explaining to non-technical users",
      "A teacher moving too quickly because they forgot how hard the concept was to learn",
      "An expert frustrated that others don't understand what seems obvious to them",
    ],
    "spotlight-effect": [
      "Being mortified by a small stain on your shirt that no one else notices",
      "Thinking everyone noticed your stumble or verbal mistake in a presentation",
      "Overestimating how much others think about your social media posts",
    ],
    "availability-heuristic": [
      "Overestimating plane crash risks after seeing news coverage, despite flying being statistically safer",
      "Fearing shark attacks while swimming, ignoring more common drowning risks",
      "Judging a neighborhood as dangerous because you recall a recent news story about it",
    ],
    "defensive-attribution": [
      "Blaming a mugging victim for being in a bad neighborhood to reassure yourself it won't happen to you",
      "Believing someone got sick because they didn't take care of themselves, to feel in control of your own health",
      "Thinking accident victims were careless because it makes you feel safer from random misfortune",
    ],
    "just-world-hypothesis": [
      "Believing people are poor because they don't work hard enough",
      "Assuming victims of crimes must have done something to deserve it",
      "Thinking success always comes to those who truly deserve it",
    ],
    "naive-realism": [
      "Believing you see situations objectively while others are biased",
      "Thinking your interpretation of ambiguous events is the only reasonable one",
      "Assuming people who disagree with you are ignorant or irrational",
    ],
    "naive-cynicism": [
      "Assuming politicians who support policies you oppose must be corrupt",
      "Believing scientists reporting inconvenient findings are motivated by money",
      "Thinking people who disagree politically must have hidden agendas",
    ],
    "forer-barnum-effect": [
      "Believing a horoscope is accurate because it uses vague, generally applicable statements",
      "Thinking a personality test 'really gets you' when it uses flattering generalities",
      "Finding cold readings by psychics convincing because they apply to most people",
    ],
    "dunning-kruger-effect": [
      "A novice chess player thinking they're ready for advanced competitions",
      "Someone who read a few articles believing they understand complex medical issues",
      "An inexperienced driver being overconfident while experts are more cautious",
    ],
    "anchoring": [
      "Being influenced by an inflated original price when seeing a 'sale' discount",
      "Letting the first salary number in a negotiation overly influence the final agreement",
      "Judging a reasonable price as high because you saw a much lower (but unrealistic) price first",
    ],
    "automation-bias": [
      "Following GPS directions into a lake because it said to turn",
      "Not questioning a medical algorithm's diagnosis despite contradictory symptoms",
      "Trusting autocorrect suggestions without verifying they're contextually appropriate",
    ],
    "google-effect": [
      "Not remembering phone numbers or addresses because you rely on your phone to store them",
      "Struggling to recall facts you've Googled repeatedly instead of memorizing them",
      "Confusing the ability to search for information with actually knowing or understanding it",
    ],
    "reactance": [
      "Wanting to eat junk food specifically because you're on a strict diet",
      "Resisting health advice when it's delivered as a mandate rather than a suggestion",
      "Feeling tempted to do something you normally wouldn't, simply because you're told not to",
    ],
    "confirmation-bias": [
      "Only reading news sources that align with your political views",
      "Remembering instances that support your opinion while forgetting contradictory evidence",
      "Interpreting ambiguous evidence as confirming your pre-existing beliefs",
    ],
    "backfire-effect": [
      "Becoming more convinced of a false belief after seeing evidence disproving it",
      "Doubling down on an opinion when presented with contradictory facts",
      "Feeling attacked when corrected, leading to stronger adherence to original view",
    ],
    "third-person-effect": [
      "Believing advertising influences others but not yourself",
      "Thinking propaganda affects other people but you can see through it",
      "Assuming violent media impacts others while you remain unaffected",
    ],
    "belief-bias": [
      "Accepting logically flawed arguments that support your conclusions",
      "Rejecting valid arguments that lead to conclusions you disagree with",
      "Judging the strength of an argument by whether you like its conclusion",
    ],
    "availability-cascade": [
      "Believing something is a major problem because everyone is talking about it",
      "Assuming a repeatedly reported story represents a widespread trend",
      "Social media amplifying minor issues into perceived crises through repetition",
    ],
    "declinism": [
      "Believing 'kids these days' are worse than your generation was at that age",
      "Thinking society is in moral decline compared to an idealized 'good old days'",
      "Romanticizing past decades while forgetting their serious problems and hardships",
    ],
    "status-quo-bias": [
      "Keeping the same insurance policy for years without comparing alternatives",
      "Sticking with default settings even when customization would be better",
      "Staying in a mediocre job because leaving requires effort and uncertainty",
    ],
    "sunk-cost-fallacy": [
      "Continuing to watch a boring movie because you already paid for the ticket",
      "Staying in an unfulfilling relationship because of years already invested",
      "Pouring more money into a failing project to justify past investments",
    ],
    "gamblers-fallacy": [
      "Believing a roulette wheel is 'due' for red after several blacks in a row",
      "Thinking your lottery numbers are more likely to win because they haven't come up",
      "Expecting a coin to land tails after several heads, despite 50/50 odds",
    ],
    "zero-risk-bias": [
      "Spending thousands to eliminate trace chemicals in water while ignoring major health risks like smoking",
      "Choosing a product with 'zero risk' over one that reduces a much larger risk significantly",
      "Demanding perfect safety in low-risk activities (flying) while ignoring higher-risk behaviors (driving)",
    ],
    "framing-effect": [
      "Choosing surgery described as '90% survival rate' over '10% mortality rate' (same thing)",
      "Being more motivated by losing $5 than gaining $5, despite equal value",
      "Preferring '95% fat-free' over '5% fat' despite being identical",
    ],
    "stereotyping": [
      "Assuming someone's interests or abilities based on their gender, race, or age",
      "Making judgments about individuals based solely on group membership",
      "Expecting certain behaviors from people because of cultural stereotypes",
    ],
    "out-group-homogeneity-bias": [
      "Thinking 'they all look/act the same' about unfamiliar cultural groups",
      "Seeing your own political party as diverse but opposing party as monolithic",
      "Noticing individual variation in your group while stereotyping other groups",
    ],
    "authority-bias": [
      "Trusting a celebrity's medical advice despite them having no medical training",
      "Following financial advice from a successful entrepreneur in an unrelated field without verifying it",
      "Accepting statements as true simply because they came from someone with impressive credentials",
    ],
    "placebo-effect": [
      "Feeling pain relief after taking a sugar pill you believe is real medicine",
      "Experiencing reduced symptoms when receiving a sham treatment because you expect it to work",
      "Feeling more energized from 'premium' coffee that's chemically identical to regular coffee",
    ],
    "survivorship-bias": [
      "Following advice from successful entrepreneurs without considering those who followed the same advice and failed",
      "Studying successful companies without analyzing failed ones with similar strategies",
      "Thinking old buildings are higher quality, ignoring that poorly built ones didn't survive",
    ],
    "tachypsychia": [
      "Experiencing time as slowing down during a car accident",
      "Feeling like a sports play took longer than video replay shows",
      "Recalling an emergency as taking much longer than it actually did",
    ],
    "law-of-triviality": [
      "Spending hours debating office kitchen supplies but minutes on major budget decisions",
      "Lengthy committee discussions about trivial details while rushing important topics",
      "Focusing on easy-to-understand minor issues while avoiding complex important ones",
    ],
    "zeigarnik-effect": [
      "Constantly thinking about unfinished tasks while completed ones fade from mind",
      "Feeling anxious about incomplete work even during leisure time",
      "Remembering interrupted tasks better than completed ones",
    ],
    "ikea-effect": [
      "Overvaluing furniture you assembled yourself compared to identical pre-built items",
      "Being more attached to something you created, even if others made higher-quality versions",
      "Pricing your handmade crafts higher than similar items because of the effort you invested",
    ],
    "ben-franklin-effect": [
      "Starting to like someone more after you do them a favor",
      "Justifying helping someone by convincing yourself they're worthy",
      "Feeling increased affinity for people you've invested effort in helping",
    ],
    "bystander-effect": [
      "Not helping in an emergency because you assume someone else will intervene",
      "Walking past someone in need when others are also ignoring them, thinking someone else will help",
      "Failing to report a problem because responsibility feels diffused among many witnesses",
    ],
    "suggestibility": [
      "Remembering events differently after leading questions",
      "Forming opinions that match the framing of a question",
      "Being influenced by suggestions embedded in how information is presented",
    ],
    "false-memory": [
      "Vividly 'remembering' events that never happened based on stories or photos",
      "Incorporating details from others' accounts into your own memories",
      "Confabulating details to fill gaps in memory of actual events",
    ],
    "cryptomnesia": [
      "Presenting someone else's idea as your own without realizing you heard it before",
      "Unconsciously plagiarizing because you forgot the source of an idea",
      "Believing you invented a solution that you actually encountered earlier",
    ],
    "clustering-illusion": [
      "Seeing meaningful patterns in random stock market fluctuations",
      "Believing in 'hot streaks' in basketball when it's random variation",
      "Finding faces or messages in random visual noise",
    ],
    "pessimism-bias": [
      "Consistently predicting worse outcomes than actually occur",
      "Remembering negative events more vividly than positive ones",
      "Overestimating the likelihood and impact of bad things happening",
    ],
    "optimism-bias": [
      "Believing you're less likely than others to experience negative events",
      "Underestimating project completion times despite past delays",
      "Thinking bad outcomes happen to others but not to you",
    ],
    "blind-spot-bias": [
      "Recognizing biases in others while believing you're objective",
      "Thinking you're less biased than average (most people think this)",
      "Seeing others as influenced by cognitive biases while you rely on facts",
    ],
  }

  // Return specific examples if available, otherwise generate generic ones
  if (examples[bias.id]) {
    return examples[bias.id]
  }

  // Generate generic examples based on category
  const categoryExamples: { [key: string]: string[] } = {
    decision: [
      `Making rushed decisions without considering long-term consequences`,
      `Relying on gut feelings instead of analyzing available data`,
      `Following popular opinion without independent evaluation`,
    ],
    memory: [
      `Recalling past events differently to match current beliefs`,
      `Adding false details to fill gaps in actual memories`,
      `Remembering information differently based on how questions are phrased`,
    ],
    social: [
      `Judging individuals based on stereotypes about their group`,
      `Agreeing with group consensus despite personal reservations`,
      `Blaming others' character for behavior while excusing your own as circumstantial`,
    ],
    perception: [
      `Finding meaningful patterns in completely random sequences`,
      `Judging quality based on appearance rather than actual testing`,
      `Overestimating risks based on memorable news stories rather than statistics`,
    ],
    misc: [
      `Using mental shortcuts that lead to systematic judgment errors`,
      `Falling into predictable thinking patterns that distort reality`,
      `Making biased decisions without recognizing the influence`,
    ],
  }

  return categoryExamples[bias.category] || categoryExamples.misc
}

// Generate contextual tips based on specific bias
export function generateTips(bias: Bias): string[] {
  const tips: { [key: string]: string[] } = {
    "fundamental-attribution-error": [
      "Ask 'What circumstances might explain this behavior?' before judging",
      "Assume good intent and consider external factors first",
      "Apply the same standards to yourself as you do to others",
      "Remember: everyone is fighting a battle you know nothing about",
    ],
    "self-serving-bias": [
      "When you succeed, acknowledge the role of luck and others' help",
      "When you fail, honestly assess your own contribution first",
      "Keep a 'luck journal' noting when circumstances helped you",
      "Practice saying 'I was wrong' or 'I made a mistake' regularly",
    ],
    "in-group-favoritism": [
      "Actively seek relationships with people from different backgrounds",
      "Ask: 'Would I judge this differently if it came from an outsider?'",
      "Use blind evaluation processes when making decisions",
      "Challenge yourself to find common ground with 'outsiders'",
    ],
    "bandwagon-effect": [
      "Before adopting popular beliefs, ask 'What's the actual evidence?'",
      "Distinguish between popularity and validity",
      "Seek out contrarian viewpoints intentionally",
      "Remember: truth isn't democratic—many can be wrong together",
    ],
    "groupthink": [
      "Assign a 'devil's advocate' role in group decisions",
      "Encourage anonymous feedback and criticism",
      "Leaders: withhold opinions until others have spoken",
      "Break into smaller subgroups before making final decisions",
    ],
    "halo-effect": [
      "Evaluate different traits independently, not as a package",
      "Use structured evaluation criteria for important judgments",
      "Ask: 'What evidence do I have for this specific quality?'",
      "Be aware that attractiveness influences your perception",
    ],
    "moral-luck": [
      "Judge actions by intentions and available information, not outcomes",
      "Ask: 'Would I judge this differently if the outcome was different?'",
      "Consider counterfactuals: what could have happened but didn't",
      "Focus on decision quality, not just results",
    ],
    "false-consensus": [
      "Actively survey others before assuming agreement",
      "Seek out data on actual population beliefs and behaviors",
      "Challenge your assumption: 'Do I really know what others think?'",
      "Remember that your bubble isn't representative",
    ],
    "curse-of-knowledge": [
      "Explain concepts to someone unfamiliar to test your clarity",
      "Ask others what they understand, not just if they understand",
      "Use the 'five-year-old test': can you explain it simply?",
      "Remember what it was like before you learned this",
    ],
    "spotlight-effect": [
      "Remind yourself: people are too busy thinking about themselves",
      "Ask friends what they noticed about you—usually it's less than you think",
      "Focus outward on others rather than inward on yourself",
      "Test your assumptions: did anyone actually notice that mistake?",
    ],
    "availability-heuristic": [
      "Seek out base rates and statistics, not just memorable examples",
      "Ask: 'Is this easy to recall because it's common or just vivid?'",
      "Counter dramatic news with boring statistical reality",
      "Keep a log of actual frequencies vs. your gut feelings",
    ],
    "defensive-attribution": [
      "Acknowledge that bad things can happen to anyone, including you, regardless of precautions",
      "Show compassion for victims without searching for ways they 'caused' their misfortune",
      "Ask yourself: 'Am I blaming them to feel safer or more in control?'",
      "Recognize when you're victim-blaming to protect your sense of security",
    ],
    "just-world-hypothesis": [
      "Recognize that life isn't fair—outcomes don't always match merit",
      "Support systemic solutions, not just individual responsibility",
      "Show compassion without needing victims to 'deserve' it",
      "Ask: 'Am I assuming fairness to feel better about inequality?'",
    ],
    "naive-realism": [
      "Remind yourself: 'My perception is an interpretation, not reality'",
      "Actively seek out how others see the same situation differently",
      "Ask: 'What might I be missing due to my perspective?'",
      "Practice intellectual humility: you could be wrong",
    ],
    "naive-cynicism": [
      "Ask: 'What evidence do I have for their bad motives?'",
      "Consider benign explanations before assuming malice",
      "Test your cynicism by asking people directly about their motives",
      "Remember: not everyone who disagrees is corrupt or biased",
    ],
    "forer-barnum-effect": [
      "Ask: 'Is this specific to me, or could it apply to anyone?'",
      "Seek falsifiable, specific claims rather than vague generalities",
      "Test personality assessments with friends—do they fit too?",
      "Be skeptical of cold reading techniques and vague predictions",
    ],
    "dunning-kruger-effect": [
      "Assume you know less than you think, especially when starting",
      "Seek honest feedback from experts in the field",
      "Track your confidence vs. actual performance over time",
      "Embrace 'learned ignorance': the more you know, the more you see what you don't",
    ],
    "anchoring": [
      "Ignore the first number you see—it's often arbitrary or strategic",
      "Generate your own estimate before seeing others' numbers",
      "Ask: 'What evidence supports this number beyond the anchor?'",
      "In negotiations, be the first to anchor with an aggressive number",
    ],
    "automation-bias": [
      "Question algorithmic recommendations, especially in critical decisions",
      "Maintain expertise so you can override automation when needed",
      "Ask: 'What could the algorithm miss or get wrong?'",
      "Use automation as input, not as decision-maker",
    ],
    "google-effect": [
      "Practice active recall before Googling answers",
      "Take notes by hand to deepen memory encoding",
      "Ask yourself: 'Can I explain this without looking it up?'",
      "Build genuine understanding, not just bookmark navigation skills",
    ],
    "reactance": [
      "Notice when you resist simply because you feel pressured",
      "Reframe restrictions as choices: 'I'm choosing to...'",
      "Ask: 'Would I want this if it wasn't forbidden or mandated?'",
      "Give others autonomy instead of direct orders when possible",
    ],
    "confirmation-bias": [
      "Actively seek out information that challenges your beliefs",
      "Ask: 'What would prove me wrong?' then look for that evidence",
      "Follow people with different viewpoints on social media",
      "Play devil's advocate with your own opinions",
    ],
    "backfire-effect": [
      "When corrected, pause and breathe before defending yourself",
      "Separate your identity from your beliefs—you can change your mind",
      "Ask: 'What would I need to see to change my view?'",
      "Practice saying: 'I didn't know that, thank you'",
    ],
    "third-person-effect": [
      "Assume you're as susceptible to influence as others",
      "Ask: 'How has advertising/media affected my choices?'",
      "Track your purchases and beliefs to spot external influences",
      "Remember: thinking you're immune often makes you more vulnerable",
    ],
    "belief-bias": [
      "Evaluate arguments by their logical structure, not conclusions",
      "Practice analyzing arguments you agree with for flaws",
      "Ask: 'Is this logically valid, or do I just like the conclusion?'",
      "Study formal logic to separate validity from believability",
    ],
    "availability-cascade": [
      "Question claims that 'everyone is talking about' something",
      "Seek primary sources and original data, not just repeated stories",
      "Ask: 'Is this widespread because it's true or just repeated?'",
      "Wait for dust to settle before forming opinions on viral topics",
    ],
    "declinism": [
      "Seek out historical data to counter nostalgia and pessimism",
      "Read books like 'Factfulness' or 'Enlightenment Now' for perspective",
      "Ask: 'What has actually gotten better over time?'",
      "Remember: nostalgia edits out the bad parts of the past",
    ],
    "status-quo-bias": [
      "Regularly reassess defaults and current arrangements",
      "Ask: 'Would I choose this if starting from scratch today?'",
      "Experiment with small changes to test alternatives",
      "Remember: the current state isn't necessarily optimal",
    ],
    "sunk-cost-fallacy": [
      "Focus on future costs and benefits, not past investments",
      "Ask: 'If I hadn't already invested, would I start now?'",
      "Practice cutting losses early in low-stakes situations",
      "Remember: you can't recover sunk costs by doubling down",
    ],
    "gamblers-fallacy": [
      "Remember: past random events don't influence future ones",
      "Ask: 'Does this process have memory?' (Usually no)",
      "Study probability to understand independence of events",
      "In truly random processes, 'due for a win' doesn't exist",
    ],
    "zero-risk-bias": [
      "Compare actual risk reduction, not just 'zero vs. some risk'",
      "Ask: 'What's the cost-benefit of eliminating this small risk?'",
      "Focus resources on reducing large risks, not eliminating small ones",
      "Remember: you can't eliminate all risk, so prioritize wisely",
    ],
    "framing-effect": [
      "Reframe information in multiple ways before deciding",
      "Ask: 'How would this sound if described differently?'",
      "Convert percentages to frequencies and vice versa",
      "Be aware of 'loss framing' vs. 'gain framing' in persuasion",
    ],
    "stereotyping": [
      "Treat people as individuals, not representatives of groups",
      "Ask: 'What evidence do I have about this specific person?'",
      "Actively counter stereotypes with counter-examples",
      "Build genuine relationships with people from stereotyped groups",
    ],
    "out-group-homogeneity-bias": [
      "Remember: 'they' are just as diverse as 'we' are",
      "Seek out individual stories from out-group members",
      "Ask: 'Am I seeing real similarity or just unfamiliarity?'",
      "Spend meaningful time with out-group members",
    ],
    "authority-bias": [
      "Question expert claims, especially outside their expertise",
      "Ask: 'What evidence supports this, beyond their credentials?'",
      "Remember: experts can be wrong, especially on new issues",
      "Evaluate arguments on merit, not just the speaker's status",
    ],
    "placebo-effect": [
      "Be aware that your expectations can create real physiological changes",
      "Recognize that feeling better doesn't always mean the treatment caused it",
      "In research or testing, use control groups and blinding to account for placebo effects",
      "Remember: subjective improvement may be due to expectations, not the treatment itself",
    ],
    "survivorship-bias": [
      "Actively seek out stories of failure, not just success",
      "Ask: 'What about those who tried the same thing and failed?'",
      "Look at base rates, not just visible successes",
      "Remember: the graveyard of failed attempts is usually invisible",
    ],
    "tachypsychia": [
      "In high-stress moments, remember time perception is distorted",
      "Practice emergency scenarios to improve actual reaction time",
      "Don't rely on subjective time estimates during crises",
      "Use video replay to calibrate time perception after events",
    ],
    "law-of-triviality": [
      "Allocate meeting time based on importance, not accessibility",
      "Ask: 'Are we debating this because it's important or easy?'",
      "Set time limits on trivial discussions",
      "Focus on high-impact decisions even if they're complex",
    ],
    "zeigarnik-effect": [
      "Use this positively: start tasks to create completion motivation",
      "Write down unfinished tasks before breaks to reduce mental clutter",
      "Break large projects into completable chunks for satisfaction",
      "Create closure rituals for work you must pause",
    ],
    "ikea-effect": [
      "Get external feedback on things you've created or assembled",
      "Ask: 'Would I value this if someone else made it?'",
      "Be aware you're attached due to effort, not just quality",
      "When selling, emphasize DIY/customization to leverage this bias",
    ],
    "ben-franklin-effect": [
      "Ask small favors to build relationships and liking",
      "When someone helps you, follow up to strengthen the bond",
      "Don't just do favors—also request them to build connection",
      "Remember: people justify their helpful actions by liking you more",
    ],
    "bystander-effect": [
      "In emergencies, assign specific people specific tasks",
      "Don't assume someone else will help—you do it",
      "If you need help, ask specific individuals, not the crowd",
      "Practice taking initiative in low-stakes situations",
    ],
    "suggestibility": [
      "Be aware that how questions are asked influences answers",
      "Avoid leading questions when gathering information",
      "Notice when you're being primed by suggestions",
      "Use open-ended questions to reduce suggestion effects",
    ],
    "false-memory": [
      "Be humble about memory certainty—memory is reconstructive",
      "Corroborate important memories with evidence when possible",
      "Don't reinforce false memories through repeated telling",
      "Be aware that vivid ≠ accurate in memory",
    ],
    "cryptomnesia": [
      "Keep detailed notes about sources of your ideas",
      "Give credit generously, especially when uncertain about origin",
      "Ask: 'Where did I first encounter this idea?'",
      "Remember: your brain naturally integrates others' ideas as your own",
    ],
    "clustering-illusion": [
      "Learn about randomness—true random often includes apparent patterns",
      "Ask: 'Could this pattern occur by chance?'",
      "Use statistical tests before inferring meaning from patterns",
      "Remember: your brain is a pattern-seeking machine, sometimes too eager",
    ],
    "pessimism-bias": [
      "Track predictions to see how often you overestimate bad outcomes",
      "Ask: 'What's the actual base rate of this bad outcome?'",
      "Practice gratitude to counter negativity bias",
      "Remember: our brains evolved to overweight threats",
    ],
    "optimism-bias": [
      "Use 'pre-mortem' analysis: imagine failure and work backward",
      "Ask: 'What could go wrong? What's my backup plan?'",
      "Track predictions to calibrate your optimism",
      "Remember: 'it won't happen to me' is a dangerous thought",
    ],
    "blind-spot-bias": [
      "Assume you're biased, even when you can't see how",
      "Ask others: 'What biases do you see in my thinking?'",
      "Study cognitive biases to recognize them in yourself",
      "Remember: thinking you're less biased is itself a bias",
    ],
  }

  // Return specific tips if available
  if (tips[bias.id]) {
    return tips[bias.id]
  }

  // Generate generic tips based on category as fallback
  const categoryTips: { [key: string]: string[] } = {
    decision: [
      "Slow down and analyze decisions systematically rather than relying on gut feelings",
      "List pros and cons explicitly, including long-term consequences",
      "Sleep on important decisions to avoid emotional or impulsive choices",
      "Seek input from people with different perspectives and expertise",
    ],
    memory: [
      "Verify important memories with external evidence or documentation",
      "Be humble about memory certainty—memories are reconstructed, not replayed",
      "Avoid leading questions when gathering information from yourself or others",
      "Cross-reference your memories with others who were present",
    ],
    social: [
      "Consider others' circumstances and context, not just their actions",
      "Build genuine relationships with diverse groups to reduce stereotyping",
      "Question your first impressions and automatic judgments",
      "Practice perspective-taking by imagining situations from others' viewpoints",
    ],
    perception: [
      "Seek out objective data and statistics to counter subjective impressions",
      "Ask yourself: 'What actual evidence supports this perception?'",
      "Remember that your brain automatically fills gaps with assumptions",
      "Get second opinions on important judgments to check for distortions",
    ],
    misc: [
      "Actively seek out information that contradicts your current beliefs",
      "Take time to reflect and question your automatic assumptions",
      "Ask others for their perspective to reveal your blind spots",
      "Use structured frameworks to reduce reliance on mental shortcuts",
    ],
  }

  return categoryTips[bias.category] || categoryTips.misc
}

export function BiasExamples({ bias }: BiasExamplesProps) {
  const examples = generateExamples(bias)
  const tips = generateTips(bias)

  return (
    <div className="mt-6 space-y-6">
      {/* Real-World Examples Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="text-muted-foreground mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider sm:text-base">
          <Lightbulb className="h-4 w-4 text-primary" />
          Real-World Examples
        </h3>
        <div className="space-y-3">
          {examples.map((example, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}
              className="group flex gap-3 rounded-lg border border-accent/50 bg-gradient-to-br from-accent/20 via-accent/10 to-transparent p-4 transition-all duration-200 hover:border-accent hover:shadow-depth-1"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 transition-transform duration-200 group-hover:scale-110">
                <Lightbulb className="h-3.5 w-3.5 text-primary" />
              </div>
              <p className="text-sm leading-relaxed sm:text-base">{example}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h3 className="text-muted-foreground mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider sm:text-base">
          <CheckCircle2 className="h-4 w-4 text-success" />
          Quick Tips
        </h3>
        <ul className="space-y-2">
          {tips.map((tip, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.1, duration: 0.3 }}
              className="flex gap-3"
            >
              <CheckCircle2 className="h-5 w-5 shrink-0 text-success transition-transform duration-200 hover:scale-110" />
              <span className="text-sm leading-relaxed">{tip}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </div>
  )
}

