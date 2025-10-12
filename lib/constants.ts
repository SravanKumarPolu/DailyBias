/**
 * Design System Constants
 * 
 * Centralized constants for spacing, animation durations, and other design tokens.
 * These should match the values in tailwind.config.ts for consistency.
 */

// ============================================
// ANIMATION DURATIONS (in milliseconds)
// ============================================

export const DURATION = {
  /** Instant - No animation (0ms) */
  INSTANT: 0,
  
  /** Fast - Quick interactions like hover, focus (150ms) */
  FAST: 150,
  
  /** Normal - Default transitions and animations (250ms) */
  NORMAL: 250,
  
  /** Slow - Noticeable, smooth animations (400ms) */
  SLOW: 400,
  
  /** Slower - Dramatic, attention-grabbing animations (600ms) */
  SLOWER: 600,
} as const

// ============================================
// SPACING (in pixels)
// ============================================

export const SPACING = {
  /** Extra Small - 8px - Tight spacing between related elements */
  XS: 8,
  
  /** Small - 12px - Small gaps within components */
  SM: 12,
  
  /** Medium - 16px - Default spacing (1rem) */
  MD: 16,
  
  /** Large - 24px - Spacing between component sections */
  LG: 24,
  
  /** Extra Large - 32px - Major spacing between sections */
  XL: 32,
  
  /** 2X Large - 48px - Large page sections */
  XXL: 48,
  
  /** 3X Large - 64px - Hero sections, major dividers */
  XXXL: 64,
} as const

// Component-specific spacing
export const COMPONENT_SPACING = {
  /** Gap between cards in grids */
  CARD_GAP: 16,
  
  /** Gap between major sections */
  SECTION_GAP: 24,
  
  /** Padding inside cards */
  CARD_PADDING: 24,
  
  /** Page padding (mobile) */
  PAGE_PADDING: 16,
  
  /** Page padding (tablet+) */
  PAGE_PADDING_LG: 24,
  
  /** Page padding (desktop) */
  PAGE_PADDING_XL: 32,
} as const

// ============================================
// EASING FUNCTIONS
// ============================================

export const EASING = {
  /** Standard ease - Smooth acceleration and deceleration */
  SMOOTH: 'cubic-bezier(0.4, 0, 0.2, 1)',
  
  /** Ease in - Slow start, fast end */
  SMOOTH_IN: 'cubic-bezier(0.4, 0, 1, 1)',
  
  /** Ease out - Fast start, slow end */
  SMOOTH_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
  
  /** Bounce - Elastic, playful effect */
  BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const

// ============================================
// Z-INDEX LAYERS
// ============================================

export const Z_INDEX = {
  /** Behind everything */
  BEHIND: -1,
  
  /** Base layer */
  BASE: 0,
  
  /** Slightly elevated (dropdowns, tooltips) */
  DROPDOWN: 10,
  
  /** Sticky elements (headers, footers) */
  STICKY: 20,
  
  /** Fixed elements (navigation) */
  FIXED: 30,
  
  /** Modals and overlays */
  MODAL_BACKDROP: 40,
  MODAL: 50,
  
  /** Notifications and toasts */
  TOAST: 100,
  
  /** Highest priority (skip links, etc.) */
  MAXIMUM: 9999,
} as const

// ============================================
// BREAKPOINTS (in pixels)
// ============================================

export const BREAKPOINT = {
  /** Extra small devices - 475px */
  XS: 475,
  
  /** Small devices (tablets) - 640px */
  SM: 640,
  
  /** Medium devices (tablets landscape) - 768px */
  MD: 768,
  
  /** Large devices (desktops) - 1024px */
  LG: 1024,
  
  /** Extra large devices - 1280px */
  XL: 1280,
  
  /** 2X large devices - 1536px */
  XXL: 1536,
  
  /** 3X large devices - 1920px */
  XXXL: 1920,
} as const

// ============================================
// ANIMATION PRESETS
// ============================================

export const ANIMATION_PRESET = {
  /** Quick hover effect */
  HOVER: {
    duration: DURATION.FAST,
    easing: EASING.SMOOTH_OUT,
  },
  
  /** Standard transition */
  TRANSITION: {
    duration: DURATION.NORMAL,
    easing: EASING.SMOOTH,
  },
  
  /** Smooth entrance */
  ENTER: {
    duration: DURATION.SLOW,
    easing: EASING.SMOOTH_OUT,
  },
  
  /** Smooth exit */
  EXIT: {
    duration: DURATION.FAST,
    easing: EASING.SMOOTH_IN,
  },
  
  /** Playful bounce */
  BOUNCE: {
    duration: DURATION.SLOW,
    easing: EASING.BOUNCE,
  },
} as const

// ============================================
// FRAMER MOTION VARIANTS
// ============================================

export const MOTION_VARIANTS = {
  /** Fade in animation */
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: DURATION.NORMAL / 1000 },
  },
  
  /** Slide up animation */
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: DURATION.NORMAL / 1000, ease: [0.4, 0, 0.2, 1] },
  },
  
  /** Scale animation */
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: DURATION.FAST / 1000, ease: [0.4, 0, 0.2, 1] },
  },
  
  /** Spring animation */
  spring: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 30,
    mass: 0.8,
  },
} as const

// ============================================
// TYPE EXPORTS
// ============================================

export type Duration = typeof DURATION[keyof typeof DURATION]
export type Spacing = typeof SPACING[keyof typeof SPACING]
export type Easing = typeof EASING[keyof typeof EASING]
export type ZIndex = typeof Z_INDEX[keyof typeof Z_INDEX]
export type Breakpoint = typeof BREAKPOINT[keyof typeof BREAKPOINT]

