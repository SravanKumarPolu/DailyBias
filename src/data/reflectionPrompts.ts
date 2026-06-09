/**
 * One optional reflection prompt per cognitive bias.
 * Kept separate from biases.ts to avoid bloating the main content file.
 */
export const reflectionPrompts: Record<string, string> = {
  "confirmation-bias":
    "Where did you recently seek information that only supported what you already believed?",
  "anchoring-bias":
    "What first number or fact shaped a decision you made this week more than it should have?",
  "availability-heuristic":
    "Did a vivid recent story make something feel more likely than the facts support?",
  "hindsight-bias":
    "Looking back, did you tell yourself an outcome was obvious when it wasn't at the time?",
  "framing-effect":
    "How might the way a choice was worded have changed your decision?",
  "overconfidence-bias":
    "Where did you feel more certain about an outcome than your track record justified?",
  "belief-bias":
    "Did you accept an argument because it felt right, without checking the logic?",
  "dunning-kruger-effect":
    "Was there a topic where you felt like an expert before learning how much you didn't know?",
  "sunk-cost-fallacy":
    "Did you keep investing in something mainly because you'd already put time or money in?",
  "status-quo-bias":
    "What did you stick with simply because change felt uncomfortable or risky?",
  "optimism-bias":
    "Where did you underestimate risks or overestimate how smoothly things would go?",
  "choice-overload":
    "Did too many options make you delay, freeze, or pick something you later regretted?",
  "negativity-bias":
    "Did one negative detail outweigh several positive ones in how you judged a situation?",
  "false-memory":
    "Is there a memory you're confident about that might have shifted over retellings?",
  "misinformation-effect":
    "Did something you heard—even if untrue—linger in your mind and affect later thinking?",
  "peak-end-rule":
    "How did the best or worst moment, or the ending, shape your overall impression?",
  "serial-position-effect":
    "Did you remember the beginning or end of a list more than what was in the middle?",
  "fading-affect-bias":
    "Has the emotional sting of a past event faded faster than the lesson you drew from it?",
  "change-blindness":
    "Did you miss a change that was right in front of you because you weren't looking for it?",
  "selective-perception":
    "What did you notice today that others might have filtered out—or vice versa?",
  "illusory-correlation":
    "Did you connect two things that happened together but aren't actually related?",
  "halo-effect":
    "Did one positive trait make you rate someone or something too favorably overall?",
  "horn-effect":
    "Did one flaw unfairly color your whole opinion of a person or idea?",
  "bandwagon-effect":
    "Did you agree with a group because everyone else seemed to, not because you thought it through?",
  "authority-bias":
    "Did someone's title or status make you accept a claim without questioning it?",
  "in-group-bias":
    "Did you give someone in your circle the benefit of the doubt you wouldn't give an outsider?",
  "out-group-homogeneity-bias":
    "Did you assume people outside your group are all alike in some way?",
  "stereotyping":
    "Where did a label replace actually learning about an individual?",
  "projection-bias":
    "Did you assume others want, feel, or think the same way you do?",
  "spotlight-effect":
    "Did you worry others noticed a mistake or flaw more than they probably did?",
  "social-comparison-bias":
    "Who did you compare yourself to this week, and how did that affect your mood or choices?",
  "false-consensus-effect":
    "Did you assume most people share your opinion when they might not?",
  "fundamental-attribution-error":
    "Did you blame someone's character for behavior that might have situational causes?",
  "self-serving-bias":
    "Did you credit yourself for a win but blame circumstances for a loss?",
  "bystander-effect":
    "Was there a moment you held back from helping because others were present?",
  "just-world-hypothesis":
    "Did you assume someone deserved a bad outcome because the world feels fair?",
  "loss-aversion":
    "Did avoiding a loss matter more to you than an equivalent potential gain?",
  "endowment-effect":
    "Did you value something more simply because you already owned it?",
  "zero-risk-bias":
    "Did you prefer eliminating a tiny risk over a much larger improvement elsewhere?",
  "pessimism-bias":
    "Where did you expect the worst outcome even when better odds were realistic?",
  "ambiguity-effect":
    "Did you avoid a choice because the unknowns felt worse than known downsides?",
  "decoy-effect":
    "Did an extra option nudge you toward a choice you might not have picked otherwise?",
  "survivorship-bias":
    "Did you focus on success stories and overlook those who tried the same and failed?",
  "base-rate-fallacy":
    "Did vivid details make you ignore how common or rare something actually is?",
  "gamblers-fallacy":
    "Did past random events make you feel the next outcome was due to balance out?",
  "clustering-illusion":
    "Did you see a pattern in random noise—a streak, a sign, a coincidence?",
  "illusion-of-control":
    "Where did you feel you could influence an outcome that was mostly chance?",
  "curse-of-knowledge":
    "Did you explain something assuming others knew what you know?",
  "conjunction-fallacy":
    "Did a detailed story feel more plausible than a simpler, more likely explanation?",
  "appeal-to-probability":
    "Did something feel possible enough that you treated it as probable?",
  "default-effect":
    "Did you accept a pre-selected option without actively choosing?",
  "ikea-effect":
    "Did you value something more because you built or customized it yourself?",
  "effort-justification":
    "Did hard work make you rate the result as better than it objectively was?",
  "present-bias":
    "What did you choose for now that your future self might regret?",
  "planning-fallacy":
    "Did you underestimate how long a task would take despite past experience?",
  "zeigarnik-effect":
    "Did an unfinished task keep pulling your attention more than completed ones?",
  "mere-exposure-effect":
    "Did familiarity make you like something more without realizing why?",
  "reactance":
    "Did being told not to do something make you want to do it more?",
  "hyperbolic-discounting":
    "Did a reward today outweigh a bigger reward you'd have to wait for?",
  "habit-bias":
    "What did you do on autopilot today without questioning whether it still serves you?",
};

const FALLBACK_PROMPT =
  "Where might this bias have shown up in a decision, conversation, or judgment you made recently?";

export function getReflectionPrompt(biasId: string): string {
  return reflectionPrompts[biasId] ?? FALLBACK_PROMPT;
}
