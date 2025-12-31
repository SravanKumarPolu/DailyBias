import type { BiasCategory } from "./types"

/**
 * Get Tailwind CSS classes for category colors (for React components)
 */
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

/**
 * Get hex color values for category colors (for Canvas rendering)
 */
export function getCategoryColorHex(category: BiasCategory): string {
  const colorMap: Record<BiasCategory, string> = {
    decision: "#3b82f6",    // Blue - for decision-making biases
    memory: "#8b5cf6",      // Purple - for memory biases
    social: "#ec4899",      // Pink - for social biases
    perception: "#f59e0b",  // Amber - for perception biases
    misc: "#6b7280",        // Gray - for miscellaneous biases
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
