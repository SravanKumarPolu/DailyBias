import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Header />
      <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 pt-24 pb-16">
        <div className="glass rounded-2xl p-10 text-center space-y-4 max-w-md animate-fade-up">
          <h1 className="text-4xl font-bold text-foreground">404</h1>
          <p className="text-muted-foreground">Oops! Page not found</p>
          <Button asChild variant="glass" className="rounded-xl">
            <Link to="/">Return to Today</Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
