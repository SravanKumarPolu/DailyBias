import { useEffect, useMemo, useRef, useState } from "react";
import Header from "@/components/Header";
import BiasCard from "@/components/BiasCard";
import BiasActions from "@/components/BiasActions";
import BiasProgress from "@/components/BiasProgress";
import ReflectionPrompt from "@/components/ReflectionPrompt";
import BiasFeedback from "@/components/BiasFeedback";
import CycleCompletionModal from "@/components/CycleCompletionModal";
import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import { resolveTodaysBias } from "@/data/biases";
import { useBiasProgress } from "@/hooks/useBiasProgress";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useStreak } from "@/hooks/useStreak";
import { useTrackBiasViewed } from "@/hooks/useTrackBiasViewed";
import { trackCycleCompleted } from "@/lib/analytics";

const TodayPage = () => {
  const { bias, cycleJustCompleted } = useMemo(() => resolveTodaysBias(), []);
  const {
    seenCount,
    totalBiases,
    cycle,
    daysActive,
    isCycleComplete,
    dismissMilestone,
  } = useBiasProgress();
  const { streak } = useStreak();
  const { bookmarks } = useBookmarks();
  const [showMilestone, setShowMilestone] = useState(false);
  const cycleTrackedRef = useRef(false);

  useTrackBiasViewed(bias);

  useEffect(() => {
    if (cycleJustCompleted || isCycleComplete) {
      setShowMilestone(true);
    }
  }, [cycleJustCompleted, isCycleComplete]);

  useEffect(() => {
    if ((cycleJustCompleted || isCycleComplete) && !cycleTrackedRef.current) {
      cycleTrackedRef.current = true;
      trackCycleCompleted({ cycle_number: cycle });
    }
  }, [cycleJustCompleted, isCycleComplete, cycle]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <SEO
        title="Today's Cognitive Bias"
        description={`Learn about ${bias.title} today. ${bias.definition}`}
      />
      <StructuredData type="website" />
      <StructuredData type="organization" />
      <StructuredData
        type="article"
        data={{
          title: bias.title,
          description: bias.definition,
        }}
      />
      <StructuredData
        type="breadcrumb"
        data={{
          items: [
            { name: 'Home', path: '/' },
            { name: 'Today', path: '/today' },
          ]
        }}
      />
      <Header />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-20 right-1/4 h-72 w-72 rounded-full bg-primary/8 blur-[100px]" />
        <div className="absolute bottom-20 left-1/3 h-64 w-64 rounded-full bg-accent/8 blur-[90px]" />
      </div>

      <main id="main-content" className="relative pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-2xl space-y-6">
          <div className="flex justify-center animate-fade-up" style={{ animationDelay: "0.05s" }}>
            <BiasProgress seenCount={seenCount} totalBiases={totalBiases} cycle={cycle} />
          </div>

          <div className="flex justify-center animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <BiasActions bias={bias} />
          </div>

          <div style={{ animationDelay: "0.2s" }}>
            <BiasCard bias={bias} />
          </div>

          <BiasFeedback biasId={bias.id} className="animate-fade-up" />

          <ReflectionPrompt biasId={bias.id} cycle={cycle} className="animate-fade-up" />
        </div>
      </main>

      <CycleCompletionModal
        open={showMilestone}
        onOpenChange={setShowMilestone}
        stats={{
          daysActive,
          streak,
          bookmarksCount: bookmarks.length,
          cycle,
        }}
        onContinue={dismissMilestone}
      />
    </div>
  );
};

export default TodayPage;
