import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Brain, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };
  error: Error | null = null;

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.error = error;
    console.error("DebiasDaily render error:", error, info.componentStack);
    console.error("Error context:", {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  }

  handleRetry = () => {
    this.error = null;
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen relative overflow-hidden bg-background">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/3 left-1/3 h-72 w-72 rounded-full bg-primary/8 blur-[100px]" />
        </div>
        <main className="relative flex min-h-screen items-center justify-center px-4 py-16">
          <div className="glass rounded-2xl p-10 text-center space-y-5 max-w-md animate-fade-up">
            <div className="gradient-bg inline-flex rounded-2xl p-3">
              <Brain className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                DebiasDaily encountered an unexpected error. This has been logged for investigation.
                You can try again or return to today&apos;s bias.
              </p>
              {this.error?.message && (
                <p className="text-xs text-muted-foreground/70 font-mono">
                  Error: {this.error.message.slice(0, 100)}
                  {this.error.message.length > 100 ? "..." : ""}
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={this.handleRetry} variant="hero" className="rounded-xl gap-2">
                <RefreshCw className="h-4 w-4" />
                Try again
              </Button>
              <Button asChild variant="glass" className="rounded-xl">
                <Link to="/">Return to Today</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default ErrorBoundary;
