import type { BiasCategory } from "./types"

export function getCategoryColor(category: BiasCategory): string {
  const colorMap: Record<BiasCategory, string> = {
    decision: "bg-category-decision text-category-decision-foreground",
    memory: "bg-category-memory text-category-memory-foreground",
    social: "bg-category-social text-category-social-foreground",
    perception: "bg-category-perception text-category-perception-foreground",
    misc: "bg-category-misc text-category-misc-foreground",
  }
  return colorMap[category]
}

export function getCategoryLabel(category: BiasCategory): string {
  const labelMap: Record<BiasCategory, string> = {
    decision: "Decision Making",
    memory: "Memory",
    social: "Social",
    perception: "Perception",
    misc: "Miscellaneous",
  }
  return labelMap[category]
}
