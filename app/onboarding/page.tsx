"use client"

import { useState, useEffect } from "react"
import { Brain, Star, Zap, Check, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { siteConfig } from "@/lib/site-config"

const onboardingSteps = [
  {
    icon: Brain,
    title: `Welcome to ${siteConfig.name}`,
    description: "Learn one cognitive bias every day from a curated list of 50 research-backed cognitive biases.",
    features: [
      "New bias daily, personalized to your progress",
      "Beautiful, distraction-free interface",
      "Works completely offline after first load",
    ],
    gradient: "from-primary/20 via-primary/10 to-transparent",
  },
  {
    icon: Star,
    title: "Track Your Progress",
    description: "Build your knowledge systematically and see your growth over time.",
    features: [
      "Mark biases as mastered when you understand them",
      "Favorite important biases for quick review",
      "View detailed statistics on your learning journey",
    ],
    gradient: "from-success/20 via-success/10 to-transparent",
  },
  {
    icon: Zap,
    title: "Learn Anywhere",
    description: "Install as an app and access your biases anytime, anywhere.",
    features: [
      "Install on your phone or desktop (PWA)",
      "All data stored locally - complete privacy",
      "Text-to-speech to listen while multitasking",
    ],
    gradient: "from-accent/20 via-accent/10 to-transparent",
  },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()

  // Trigger animation on mount and step change
  useEffect(() => {
    setIsVisible(false)
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [currentStep])

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Mark onboarding as complete
      localStorage.setItem("onboarding-completed", "true")
      router.push("/")
    }
  }

  const handleSkip = () => {
    localStorage.setItem("onboarding-completed", "true")
    router.push("/")
  }

  const step = onboardingSteps[currentStep]
  const Icon = step.icon
  const isLastStep = currentStep === onboardingSteps.length - 1

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-50 transition-all duration-1000",
            step.gradient
          )}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
      </div>

      {/* Content */}
      <div className="relative flex min-h-screen flex-col">
        {/* Skip button */}
        {!isLastStep && (
          <div className="flex justify-end p-4 sm:p-6">
            <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
              Skip
            </Button>
          </div>
        )}

        {/* Main content */}
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6">
          <div className="w-full max-w-lg">
            <div
              key={currentStep}
              className={cn(
                "space-y-8 transition-all duration-300",
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-4"
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  "flex justify-center transition-all duration-500 delay-75",
                  isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
                )}
              >
                <div className="relative">
                  <div className={cn(
                    "absolute inset-0 rounded-full blur-xl opacity-40 bg-gradient-to-br transition-opacity duration-300",
                    step.gradient
                  )} />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-xl border border-primary/20 sm:h-24 sm:w-24">
                    <Icon className="h-10 w-10 text-primary sm:h-12 sm:w-12" />
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-4 text-center">
                <h1
                  className={cn(
                    "text-3xl font-bold tracking-tight sm:text-4xl transition-all duration-500 delay-150",
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  )}
                >
                  {step.title}
                </h1>
                <p
                  className={cn(
                    "text-lg text-muted-foreground sm:text-xl transition-all duration-500 delay-200",
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  )}
                >
                  {step.description}
                </p>
              </div>

              {/* Features */}
              <ul className={cn(
                "space-y-4 transition-opacity duration-500 delay-300",
                isVisible ? "opacity-100" : "opacity-0"
              )}>
                {step.features.map((feature, index) => (
                  <li
                    key={index}
                    className={cn(
                      "flex items-start gap-3 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 p-4 transition-all hover:border-primary/30 hover:shadow-depth-2",
                      isVisible
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-4"
                    )}
                    style={{
                      transitionDelay: `${300 + index * 50}ms`,
                    }}
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm leading-relaxed sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-6 sm:p-8">
          <div className="mx-auto max-w-lg space-y-6">
            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2">
              {onboardingSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-95",
                    index === currentStep
                      ? "w-8 bg-primary"
                      : "w-2 bg-muted hover:bg-muted-foreground/50"
                  )}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>

            {/* Next button */}
            <Button
              onClick={handleNext}
              size="lg"
              className="w-full text-base shadow-glow-primary hover:shadow-glow-primary-intense transition-all duration-300"
            >
              {isLastStep ? (
                <>
                  Get Started
                  <Check className="ml-2 h-5 w-5" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

