/**
 * Sanitizes user input by removing potentially harmful characters
 * and limiting length to prevent abuse
 */
export function sanitizeText(text: string, maxLength = 1000): string {
  if (!text) return ""

  // Remove any HTML tags
  let sanitized = text.replace(/<[^>]*>/g, "")

  // Remove any script-like content
  sanitized = sanitized.replace(/javascript:/gi, "")
  sanitized = sanitized.replace(/on\w+\s*=/gi, "")

  // Trim whitespace
  sanitized = sanitized.trim()

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }

  return sanitized
}

/**
 * Validates bias title
 */
export function validateTitle(title: string): { valid: boolean; error?: string } {
  const sanitized = sanitizeText(title, 100)

  if (!sanitized) {
    return { valid: false, error: "Title is required" }
  }

  if (sanitized.length < 3) {
    return { valid: false, error: "Title must be at least 3 characters" }
  }

  if (sanitized.length > 100) {
    return { valid: false, error: "Title must be less than 100 characters" }
  }

  return { valid: true }
}

/**
 * Validates bias summary
 */
export function validateSummary(summary: string): { valid: boolean; error?: string } {
  const sanitized = sanitizeText(summary, 500)

  if (!sanitized) {
    return { valid: false, error: "Summary is required" }
  }

  if (sanitized.length < 10) {
    return { valid: false, error: "Summary must be at least 10 characters" }
  }

  if (sanitized.length > 500) {
    return { valid: false, error: "Summary must be less than 500 characters" }
  }

  return { valid: true }
}

/**
 * Validates optional text fields (why, counter)
 */
export function validateOptionalText(text: string, maxLength = 1000): { valid: boolean; error?: string } {
  if (!text) {
    return { valid: true }
  }

  const sanitized = sanitizeText(text, maxLength)

  if (sanitized.length > maxLength) {
    return { valid: false, error: `Text must be less than ${maxLength} characters` }
  }

  return { valid: true }
}

/**
 * Validates search query
 */
export function validateSearchQuery(query: string): string {
  // Sanitize and limit search queries
  return sanitizeText(query, 200)
}
