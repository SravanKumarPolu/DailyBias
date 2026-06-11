import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import PageTransition from "./components/PageTransition";
import MobileNav from "./components/MobileNav";
import TodayPage from "./pages/TodayPage";
import NotFound from "./pages/NotFound";
import AnalyticsRouteTracker from "./components/AnalyticsRouteTracker";

// Lazy load pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const SavedPage = lazy(() => import("./pages/SavedPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const QuizPage = lazy(() => import("./pages/QuizPage"));
const WeeklyReviewPage = lazy(() => import("./pages/WeeklyReviewPage"));
const BiasPage = lazy(() => import("./pages/BiasPage"));
const BiasesArchive = lazy(() => import("./pages/BiasesArchive"));

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <PageTransition>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<TodayPage />} />
          <Route path="/today" element={<TodayPage />} />
          <Route path="/welcome" element={<Index />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/bias/:id" element={<BiasPage />} />
          <Route path="/biases" element={<BiasesArchive />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/weekly-review" element={<WeeklyReviewPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </PageTransition>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Skip to main content
        </a>
        <AnalyticsRouteTracker />
        <AnimatedRoutes />
        <MobileNav />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
