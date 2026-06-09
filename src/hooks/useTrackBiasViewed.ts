import { useEffect } from "react";
import { trackBiasViewed } from "@/lib/analytics";
import type { CognitiveBias } from "@/data/biases";

/** Fire bias_viewed once per mount when a bias is shown. */
export function useTrackBiasViewed(bias: CognitiveBias | undefined) {
  useEffect(() => {
    if (!bias) return;
    trackBiasViewed({
      bias_id: bias.id,
      bias_title: bias.title,
      category: bias.category,
    });
  }, [bias?.id, bias?.title, bias?.category, bias]);
}
