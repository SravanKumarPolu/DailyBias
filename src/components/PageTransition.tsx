import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState<"enter" | "exit">("enter");
  const prevLocation = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname === prevLocation.current) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setDisplayChildren(children);
      prevLocation.current = location.pathname;
      setTransitionStage("enter");
      return;
    }

    setTransitionStage("exit");
  }, [location.pathname, children]);

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || e.propertyName !== "opacity") return;
    if (transitionStage === "exit") {
      setDisplayChildren(children);
      prevLocation.current = location.pathname;
      setTransitionStage("enter");
    }
  };

  return (
    <div
      onTransitionEnd={handleTransitionEnd}
      className={`transition-all duration-300 ease-out ${
        transitionStage === "enter"
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-2"
      }`}
    >
      {displayChildren}
    </div>
  );
};

export default PageTransition;
