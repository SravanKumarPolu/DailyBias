import { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ListenControlsProps {
  text: string;
}

type PlayState = "idle" | "playing" | "paused";

const ListenControls = ({ text }: ListenControlsProps) => {
  const [state, setState] = useState<PlayState>("idle");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handlePlay = () => {
    if (state === "paused") {
      window.speechSynthesis.resume();
      setState("playing");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setState("idle");
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setState("playing");
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setState("paused");
  };

  const handleReset = () => {
    window.speechSynthesis.cancel();
    setState("idle");
  };

  return (
    <div className="glass rounded-2xl p-4 flex items-center gap-3">
      <Volume2 className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground mr-auto">Listen</span>

      {state === "playing" ? (
        <Button variant="glass" size="icon" onClick={handlePause} className="rounded-xl h-9 w-9" aria-label="Pause playback">
          <Pause className="h-4 w-4" />
        </Button>
      ) : (
        <Button variant="glass" size="icon" onClick={handlePlay} className="rounded-xl h-9 w-9" aria-label="Start playback">
          <Play className="h-4 w-4" />
        </Button>
      )}

      <Button
        variant="glass"
        size="icon"
        onClick={handleReset}
        disabled={state === "idle"}
        className="rounded-xl h-9 w-9"
        aria-label="Stop playback"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ListenControls;
