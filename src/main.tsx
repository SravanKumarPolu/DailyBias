import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import { initAnalytics } from "./lib/analytics.ts";
import "./index.css";

// Initialize analytics (async but don't block app render)
initAnalytics().catch(console.error);

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    {/* Skip navigation link for keyboard users */}
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
    >
      Skip to main content
    </a>
    <App />
  </ErrorBoundary>,
);
