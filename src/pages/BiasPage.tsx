import { Link, useParams } from "react-router-dom";
import Header from "@/components/Header";
import BiasCard from "@/components/BiasCard";
import BiasActions from "@/components/BiasActions";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowLeft, Check, Share2, Info } from "lucide-react";
import { getAllBiases } from "@/data/biases";
import { useTrackBiasViewed } from "@/hooks/useTrackBiasViewed";
import { useShareBias } from "@/hooks/useShareBias";

const BiasPage = () => {
  const { id } = useParams<{ id: string }>();
  const bias = getAllBiases().find((b) => b.id === id);

  useTrackBiasViewed(bias);

  const { share, sharing, copied, fallbackHint } = useShareBias(
    bias ?? { id: "", title: "", definition: "", category: "" },
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Header />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-20 right-1/4 h-72 w-72 rounded-full bg-primary/8 blur-[100px]" />
        <div className="absolute bottom-20 left-1/3 h-64 w-64 rounded-full bg-accent/8 blur-[90px]" />
      </div>

      <main className="relative pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-2xl space-y-6">
          <div className="animate-fade-up">
            <Link to="/saved">
              <Button variant="glass" size="sm" className="rounded-xl">
                <ArrowLeft className="h-4 w-4" />
                Back to saved
              </Button>
            </Link>
          </div>

          {!bias ? (
            <div
              className="glass rounded-2xl p-10 text-center space-y-3 animate-fade-up"
              style={{ animationDelay: "0.1s" }}
            >
              <h1 className="text-xl font-semibold text-foreground">Bias not found</h1>
              <p className="text-sm text-muted-foreground">
                This bias may have been removed or the link is incorrect.
              </p>
            </div>
          ) : (
            <>
              <div
                className="flex flex-col items-center gap-3 animate-fade-up"
                style={{ animationDelay: "0.1s" }}
              >
                <BiasActions bias={bias} showShare={false} bookmarkContext="saved" />
                <TooltipProvider delayDuration={200}>
                  <div
                    className="relative z-10 flex flex-wrap items-center justify-center gap-2"
                    data-testid="share-actions"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="glass"
                          size="lg"
                          onClick={share}
                          disabled={sharing}
                          aria-live="polite"
                          aria-busy={sharing}
                          aria-label={
                            copied ? "Bias copied to clipboard" : "Share this bias"
                          }
                          data-testid="share-bias-btn"
                          className={`relative z-10 rounded-xl gap-2 min-h-[48px] min-w-[180px] px-5 touch-manipulation select-none transition-all duration-200 ease-out active:scale-[0.97] pointer-events-auto disabled:opacity-60 disabled:pointer-events-none ${
                            copied
                              ? "animate-copied-pop bg-primary/15 text-primary ring-1 ring-primary/40"
                              : ""
                          }`}
                        >
                          {copied ? (
                            <span key="copied" className="inline-flex items-center gap-2 animate-copied-slide">
                              <Check className="h-4 w-4 text-primary" />
                              Copied
                            </span>
                          ) : (
                            <span key="share" className="inline-flex items-center gap-2 animate-copied-slide">
                              <Share2 className="h-4 w-4" />
                              {sharing ? "Sharing…" : "Share this Bias"}
                            </span>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        {copied ? "Copied to clipboard" : "Share this bias with a friend"}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
                {fallbackHint && (
                  <p
                    role="note"
                    data-testid="share-fallback-hint"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground/80"
                  >
                    <Info className="h-3 w-3" aria-hidden="true" />
                    {fallbackHint}
                  </p>
                )}
              </div>
              <div style={{ animationDelay: "0.2s" }}>
                <BiasCard bias={bias} headingLabel="Saved Bias" />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default BiasPage;
