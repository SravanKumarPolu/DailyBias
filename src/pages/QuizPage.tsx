import { useEffect, useMemo, useRef, useState } from "react";
import { trackQuizCompleted } from "@/lib/analytics";
import Header from "@/components/Header";
import { Sparkles, Check, X, RotateCcw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTodaysBias, getAllBiases, type CognitiveBias } from "@/data/biases";
import { Progress } from "@/components/ui/progress";
import { useQuizCompletion } from "@/hooks/useQuizCompletion";

interface QuizQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// Deterministic shuffle so answers don't reshuffle on re-render
const seededShuffle = <T,>(arr: T[], seed: number): T[] => {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const pickDistractors = (
  pool: string[],
  exclude: string,
  count: number,
  seed: number,
): string[] => {
  const filtered = pool.filter((s) => s && s !== exclude);
  return seededShuffle(filtered, seed).slice(0, count);
};

const buildQuestions = (bias: CognitiveBias, all: CognitiveBias[]): QuizQuestion[] => {
  const others = all.filter((b) => b.id !== bias.id);
  const seed = bias.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);

  const definitionDistractors = pickDistractors(
    others.map((b) => b.definition),
    bias.definition,
    3,
    seed + 1,
  );
  const whyDistractors = pickDistractors(
    others.map((b) => b.whyItHappens),
    bias.whyItHappens,
    3,
    seed + 2,
  );
  const exampleDistractors = pickDistractors(
    others.flatMap((b) => b.examples),
    bias.examples[0],
    3,
    seed + 3,
  );
  const counterDistractors = pickDistractors(
    others.flatMap((b) => b.counterSteps),
    bias.counterSteps[0],
    3,
    seed + 4,
  );

  const make = (
    prompt: string,
    correct: string,
    distractors: string[],
    explanation: string,
    salt: number,
  ): QuizQuestion => {
    const options = seededShuffle([correct, ...distractors], seed + salt);
    return {
      prompt,
      options,
      correctIndex: options.indexOf(correct),
      explanation,
    };
  };

  return [
    make(
      `Which best describes ${bias.title}?`,
      bias.definition,
      definitionDistractors,
      `${bias.title}: ${bias.definition}`,
      11,
    ),
    make(
      `Why does ${bias.title} tend to happen?`,
      bias.whyItHappens,
      whyDistractors,
      bias.whyItHappens,
      12,
    ),
    make(
      `Which of these is an example of ${bias.title}?`,
      bias.examples[0],
      exampleDistractors,
      `A clear example: ${bias.examples[0]}`,
      13,
    ),
    make(
      `Which step helps you counter ${bias.title}?`,
      bias.counterSteps[0],
      counterDistractors,
      `Try this: ${bias.counterSteps[0]}`,
      14,
    ),
  ];
};

const QuizPage = () => {
  const bias = useMemo(() => getTodaysBias(), []);
  const questions = useMemo(() => buildQuestions(bias, getAllBiases()), [bias]);

  const { isDoneToday, record, markDone } = useQuizCompletion(bias.id);

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const quizTrackedRef = useRef(false);

  const total = questions.length;
  const q = questions[current];

  const handleSelect = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
  };

  const score = answers.reduce(
    (acc, a, i) => acc + (a === questions[i].correctIndex ? 1 : 0),
    0,
  );

  const handleNext = () => {
    if (selected === null) return;
    const nextAnswers = [...answers, selected];
    setAnswers(nextAnswers);
    setSelected(null);
    if (current + 1 >= total) {
      setFinished(true);
    } else {
      setCurrent(current + 1);
    }
  };

  useEffect(() => {
    if (!finished || quizTrackedRef.current) return;
    const finalScore = answers.reduce(
      (acc, a, i) => acc + (a === questions[i].correctIndex ? 1 : 0),
      0,
    );
    markDone({ biasId: bias.id, score: finalScore, total });
    trackQuizCompleted({
      bias_id: bias.id,
      score: finalScore,
      total_questions: total,
    });
    quizTrackedRef.current = true;
  }, [finished, answers, questions, markDone, bias.id, total]);

  const handleRestart = () => {
    quizTrackedRef.current = false;
    setCurrent(0);
    setSelected(null);
    setAnswers([]);
    setFinished(false);
  };


  const progressValue = finished
    ? 100
    : ((current + (selected !== null ? 1 : 0)) / total) * 100;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Header />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-24 right-1/4 h-72 w-72 rounded-full bg-primary/8 blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/3 h-72 w-72 rounded-full bg-accent/8 blur-[100px]" />
      </div>

      <main className="relative pt-28 pb-16 px-4">
        <div className="container mx-auto max-w-2xl space-y-6">
          <div className="text-center space-y-3 animate-fade-up">
            <div className="gradient-bg inline-flex rounded-2xl p-3">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold gradient-text">Daily Quiz</h1>
            <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto">
              A calm check-in on today's bias:{" "}
              <span className="text-foreground font-medium">{bias.title}</span>.
            </p>
          </div>

          {isDoneToday && !finished && answers.length === 0 && (
            <div
              className="glass rounded-2xl p-6 sm:p-8 space-y-5 animate-fade-up text-center"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Check className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-foreground">
                  Quiz done for today
                </h2>
                <p className="text-sm text-muted-foreground">
                  You scored{" "}
                  <span className="text-foreground font-medium">
                    {record?.score} / {record?.total}
                  </span>{" "}
                  on today's bias. Come back tomorrow for a fresh one.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <Button disabled variant="hero" className="rounded-xl" aria-disabled="true">
                  Start quiz
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button onClick={handleRestart} variant="glass" className="rounded-xl">
                  <RotateCcw className="h-4 w-4" />
                  Take again
                </Button>
              </div>
            </div>
          )}

          {!finished && !(isDoneToday && answers.length === 0) && (
            <div
              className="glass rounded-2xl p-6 sm:p-8 space-y-6 animate-fade-up"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Question {current + 1} of {total}
                  </span>
                  <span>{Math.round(progressValue)}%</span>
                </div>
                <Progress value={progressValue} className="h-1.5" />
              </div>

              <h2 className="text-lg sm:text-xl font-semibold text-foreground leading-snug">
                {q.prompt}
              </h2>

              <div role="radiogroup" aria-label="Answer choices" className="space-y-2.5">
                {q.options.map((opt, i) => {
                  const isSelected = selected === i;
                  const isCorrect = i === q.correctIndex;
                  const revealed = selected !== null;
                  const stateClass = !revealed
                    ? "border-[hsl(var(--glass-border))] hover:bg-secondary/40"
                    : isCorrect
                      ? "border-primary/60 bg-primary/10"
                      : isSelected
                        ? "border-destructive/50 bg-destructive/10"
                        : "border-[hsl(var(--glass-border))] opacity-60";

                  return (
                    <button
                      key={i}
                      role="radio"
                      aria-checked={isSelected}
                      disabled={revealed}
                      onClick={() => handleSelect(i)}
                      className={`w-full text-left rounded-xl border px-4 py-3 text-sm leading-relaxed transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${stateClass}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[10px] font-medium">
                          {revealed && isCorrect ? (
                            <Check className="h-3 w-3" />
                          ) : revealed && isSelected ? (
                            <X className="h-3 w-3" />
                          ) : (
                            String.fromCharCode(65 + i)
                          )}
                        </span>
                        <span className="text-foreground">{opt}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selected !== null && (
                <div
                  className="rounded-xl border border-[hsl(var(--glass-border))] bg-secondary/30 p-4 text-sm text-muted-foreground animate-fade-up"
                  aria-live="polite"
                >
                  {selected === q.correctIndex ? "Nice — that's right. " : "Not quite. "}
                  {q.explanation}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={handleNext}
                  disabled={selected === null}
                  variant="hero"
                  className="rounded-xl"
                >
                  {current + 1 >= total ? "See results" : "Next"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {finished && (
            <div
              className="glass rounded-2xl p-6 sm:p-8 space-y-6 animate-fade-up"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Your score</p>
                <p className="text-4xl font-bold gradient-text">
                  {score} / {total}
                </p>
                <p className="text-sm text-muted-foreground">
                  {score === total
                    ? "Perfect — you're tuned in today."
                    : score >= Math.ceil(total / 2)
                      ? "Solid work. A little reflection goes a long way."
                      : "Take a breath — revisit today's bias and try again."}
                </p>
              </div>

              <div className="space-y-3">
                {questions.map((question, i) => {
                  const userAns = answers[i];
                  const correct = userAns === question.correctIndex;
                  return (
                    <div
                      key={i}
                      className="rounded-xl border border-[hsl(var(--glass-border))] bg-secondary/20 p-4 space-y-2"
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                            correct
                              ? "bg-primary/20 text-primary"
                              : "bg-destructive/20 text-destructive"
                          }`}
                        >
                          {correct ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        </span>
                        <p className="text-sm font-medium text-foreground">{question.prompt}</p>
                      </div>
                      <div className="pl-7 space-y-1 text-sm">
                        <p className="text-muted-foreground">
                          <span className="text-foreground/80">Your answer: </span>
                          {question.options[userAns]}
                        </p>
                        {!correct && (
                          <p className="text-muted-foreground">
                            <span className="text-foreground/80">Correct: </span>
                            {question.options[question.correctIndex]}
                          </p>
                        )}
                        <p className="text-muted-foreground/90 italic">{question.explanation}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center">
                <Button onClick={handleRestart} variant="glass" className="rounded-xl">
                  <RotateCcw className="h-4 w-4" />
                  Try again
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default QuizPage;
