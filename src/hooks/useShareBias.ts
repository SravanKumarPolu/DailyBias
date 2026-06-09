import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { trackBiasShared } from "@/lib/analytics";
import {
  buildBiasShareData,
  getShareCapability,
  runShareFlow,
  type ShareableBias,
  type ShareOutcome,
} from "@/lib/share";

export function useShareBias(bias: ShareableBias) {
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | null>(null);

  const capability = useMemo(() => getShareCapability(), []);
  const shareData = useMemo(() => buildBiasShareData(bias), [bias]);

  useEffect(() => {
    return () => {
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
    };
  }, []);

  const flashCopied = () => {
    setCopied(true);
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopied(false), 2200);
  };

  const clearCopied = () => {
    if (resetTimer.current) {
      window.clearTimeout(resetTimer.current);
      resetTimer.current = null;
    }
    setCopied(false);
  };

  const copyToClipboard = async (text: string) => {
    if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
    await navigator.clipboard.writeText(text);
  };

  const share = async (): Promise<ShareOutcome | undefined> => {
    if (sharing || !bias.id) return;
    setSharing(true);
    try {
      const outcome = await runShareFlow(shareData, {
        capability,
        share: (data) => navigator.share(data),
        copy: copyToClipboard,
      });

      if (outcome === "shared") {
        trackBiasShared({
          bias_id: bias.id,
          bias_title: bias.title,
          category: bias.category,
          share_method: "native",
        });
      } else if (outcome === "copied") {
        flashCopied();
        trackBiasShared({
          bias_id: bias.id,
          bias_title: bias.title,
          category: bias.category,
          share_method: "clipboard",
        });
        toast("Copied to clipboard", {
          description: "Share this bias with a friend.",
          duration: 2500,
          className: "calm-toast",
        });
      } else if (outcome === "cancelled") {
        clearCopied();
      } else if (outcome === "failed") {
        toast.error("Couldn't share", {
          description: "Please try again or copy from your browser bar.",
          duration: 3000,
        });
      }

      return outcome;
    } finally {
      setSharing(false);
    }
  };

  const fallbackHint =
    capability.reason === "iframe"
      ? "Native share isn't available in preview — copy still works."
      : capability.reason === "insecure"
        ? "Native share needs HTTPS — copy still works."
        : null;

  return {
    share,
    sharing,
    copied,
    capability,
    fallbackHint,
  };
}
