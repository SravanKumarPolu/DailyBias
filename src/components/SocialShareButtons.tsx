import { Button } from "@/components/ui/button";
import { Share2, Copy } from "lucide-react";

export function SocialShareButtons() {
  const shareUrl = "https://debiasdaily.com";
  const shareText = "Learn one cognitive bias per day - DebiasDaily";

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "DebiasDaily",
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleNativeShare}
      >
        <Share2 className="h-4 w-4 mr-2" />
        Paylaş
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
      >
        <Copy className="h-4 w-4 mr-2" />
        Linki Kopyala
      </Button>
    </div>
  );
}
