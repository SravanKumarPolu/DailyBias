import { useMemo } from "react";
import { loadRotationState } from "@/lib/biasRotation";
import { buildWeeklyReview } from "@/lib/weeklyReview";
import { countReflectionsInWeek } from "@/lib/reflectionStorage";
import { useStreak } from "@/hooks/useStreak";
import { useBookmarks } from "@/hooks/useBookmarks";

export function useWeeklyReview() {
  const { streak } = useStreak();
  const { bookmarks } = useBookmarks();

  return useMemo(() => {
    const review = buildWeeklyReview();
    const state = loadRotationState();
    const cycle = state?.cycle ?? 1;
    const reflectionsThisWeek = countReflectionsInWeek(review.entries, cycle);

    return {
      ...review,
      streak,
      bookmarksCount: bookmarks.length,
      reflectionsThisWeek,
    };
  }, [streak, bookmarks.length]);
}
