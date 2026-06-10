import Header from "@/components/Header";
import SEO from "@/components/SEO";
import VoiceSpeedSelector from "@/components/VoiceSpeedSelector";
import { Settings as SettingsIcon } from "lucide-react";

const SettingsPage = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <SEO
        title="Settings"
        description="Personalize your DebiasDaily experience. Configure voice settings for text-to-speech and customize your learning preferences."
      />
      <Header />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/3 right-1/4 h-72 w-72 rounded-full bg-accent/8 blur-[100px]" />
      </div>
      <main id="main-content" className="relative pt-28 pb-16 px-4">
        <div className="container mx-auto max-w-2xl space-y-6">
          <div className="text-center space-y-3 animate-fade-up">
            <div className="gradient-bg inline-flex rounded-2xl p-3">
              <SettingsIcon className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold gradient-text">Settings</h1>
            <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto">
              Personalize your DebiasDaily experience.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 space-y-4 animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground">Listen voice & speed</h3>
                <p className="text-sm text-muted-foreground">Choose how today's bias is read aloud.</p>
              </div>
              <VoiceSpeedSelector />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
