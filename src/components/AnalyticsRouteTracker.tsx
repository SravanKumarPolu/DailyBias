import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/analytics";

/** Sends GA4 page_view on each client-side route change. */
const AnalyticsRouteTracker = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname, location.search);
  }, [location.pathname, location.search]);

  return null;
};

export default AnalyticsRouteTracker;
