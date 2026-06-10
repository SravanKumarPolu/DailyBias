import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import PageTransition from "./components/PageTransition";
import MobileNav from "./components/MobileNav";
import Index from "./pages/Index";
import TodayPage from "./pages/TodayPage";
import AboutPage from "./pages/AboutPage";
import SavedPage from "./pages/SavedPage";
import SettingsPage from "./pages/SettingsPage";
import QuizPage from "./pages/QuizPage";
import WeeklyReviewPage from "./pages/WeeklyReviewPage";
import BiasPage from "./pages/BiasPage";
import BiasesArchive from "./pages/BiasesArchive";
import NotFound from "./pages/NotFound";
import AnalyticsRouteTracker from "./components/AnalyticsRouteTracker";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <PageTransition>
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
        <AnalyticsRouteTracker />
        <AnimatedRoutes />
        <MobileNav />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
