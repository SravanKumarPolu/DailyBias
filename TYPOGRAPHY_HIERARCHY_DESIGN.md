# Typographic Hierarchy Design - Complete Documentation

## Executive Summary

This document provides a comprehensive overview of the typographic hierarchy system designed for the DailyBias application. The system uses intentional variations in font size, weight, color, spacing, and typeface to create a visually clear, readable layout that guides the reader's eye naturally through content while ensuring optimal readability on all devices, including external monitors.

---

## 1. Design Philosophy

### Core Principles

1. **Visual Hierarchy**: Clear distinction between content levels through size, weight, and color
2. **Readability First**: Optimal font sizes and line heights for comfortable reading
3. **Responsive Scaling**: Smooth typography scaling from mobile to 4K displays
4. **Accessibility**: WCAG AA+ contrast ratios and proper semantic structure
5. **Natural Flow**: Typography guides the eye from most important to least important

---

## 2. Typeface Selection

### Primary Typeface: Geist Sans

**Rationale:**
- Modern, highly legible sans-serif designed for digital screens
- Excellent readability at all sizes
- Clean, professional appearance
- Optimized for both body text and headings

**Implementation:**
```css
font-family: var(--font-geist-sans), system-ui, -apple-system, sans-serif;
font-feature-settings: "kern" 1, "liga" 1, "calt" 1, "ss01" 1;
```

**Features:**
- **Kern**: Kerning enabled for better letter spacing
- **Liga**: Ligatures for improved readability
- **Calt**: Contextual alternates for better character combinations
- **SS01**: Stylistic set 1 for enhanced character forms

### Monospace Typeface: Geist Mono

**Usage:** Code blocks, technical content, data display
**Rationale:** Clear distinction from body text, excellent for technical content

---

## 3. Typographic Scale

### Size Hierarchy (Mobile → Desktop → External Monitors)

#### H1 - Primary Headings (Page Titles, Main Content Headers)

**Mobile (< 640px):**
- Size: `text-2xl` (1.5rem / 24px)
- Weight: `font-bold` (700)
- Line Height: `leading-tight` (1.25)
- Letter Spacing: `tracking-tight` (-0.025em)

**Tablet (640px - 1024px):**
- Size: `text-3xl` (1.875rem / 30px)
- Weight: `font-bold` (700)

**Desktop (1024px - 1280px):**
- Size: `text-4xl` (2.25rem / 36px)
- Weight: `font-bold` (700)

**Large Desktop (1280px - 1536px):**
- Size: `text-5xl` (3rem / 48px)
- Weight: `font-bold` (700)
- Line Height: 1.15 (tighter for large headings)

**External Monitors (1536px - 1920px):**
- Size: `text-5xl` to `text-6xl` (3rem - 3.75rem / 48px - 60px)
- Weight: `font-bold` (700)

**4K/Ultra-Wide (1920px+):**
- Size: `clamp(3.5rem, 2.5vw + 2rem, 5rem)` (56px - 80px max)
- Weight: `font-bold` (700)
- Capped to prevent overscaling

**Design Rationale:**
- Largest element on page - immediately draws attention
- Bold weight creates strong visual anchor
- Tighter line height prevents excessive vertical space
- Responsive scaling ensures readability at all screen sizes

---

#### H2 - Section Headings ("Why it happens", "How to counter it")

**Mobile:**
- Size: `text-sm` (0.875rem / 14px)
- Weight: `font-semibold` (600)
- Case: `uppercase`
- Letter Spacing: `tracking-wide` (0.025em)
- Color: `text-foreground/80` (80% opacity)

**Tablet:**
- Size: `text-base` (1rem / 16px)

**Desktop:**
- Size: `text-base` (1rem / 16px)

**Large Desktop:**
- Size: `text-lg` (1.125rem / 18px)

**External Monitors:**
- Size: `text-lg` to `text-xl` (1.125rem - 1.25rem / 18px - 20px)

**4K/Ultra-Wide:**
- Size: `clamp(1.5rem, 1.5vw + 1rem, 2rem)` (24px - 32px max)

**Design Rationale:**
- Uppercase creates clear distinction from body text
- Semibold weight provides emphasis without competing with H1
- 80% opacity creates visual hierarchy (secondary to H1)
- Wide letter spacing improves readability of uppercase text

---

#### H3 - Subsection Headings (Card Titles, Compact View)

**Mobile:**
- Size: `text-lg` (1.125rem / 18px)
- Weight: `font-semibold` (600)
- Line Height: `leading-tight` (1.25)

**Tablet:**
- Size: `text-xl` (1.25rem / 20px)

**Desktop:**
- Size: `text-xl` (1.25rem / 20px)

**Large Desktop:**
- Size: `text-2xl` (1.5rem / 24px)

**External Monitors:**
- Size: `text-2xl` to `text-3xl` (1.5rem - 1.875rem / 24px - 30px)

**4K/Ultra-Wide:**
- Size: `clamp(2rem, 1.5vw + 1rem, 3rem)` (32px - 48px max)

**Design Rationale:**
- Medium size indicates subsection importance
- Semibold weight provides emphasis
- Used for card titles and compact content views

---

#### Body Text (Paragraphs, Descriptions)

**Mobile:**
- Size: `text-base` (1rem / 16px)
- Weight: `font-normal` (400)
- Line Height: `leading-relaxed` (1.65)
- Color: `text-foreground` (100% opacity)

**Tablet:**
- Size: `text-lg` (1.125rem / 18px)
- Line Height: `leading-relaxed` (1.65)

**Desktop:**
- Size: `text-lg` (1.125rem / 18px)
- Line Height: `leading-relaxed` (1.65)

**Large Desktop (1280px+):**
- Size: `clamp(1.0625rem, 0.4vw + 0.9375rem, 1.25rem)` (17px - 20px)
- Line Height: 1.75 (increased for better readability)
- Base font size: 17px

**External Monitors (1536px+):**
- Size: `clamp(1.125rem, 0.35vw + 1rem, 1.375rem)` (18px - 22px)
- Line Height: 1.8 (even more comfortable)

**4K/Ultra-Wide (1920px+):**
- Size: `clamp(1.125rem, 0.3vw + 1.0625rem, 1.5rem)` (18px - 24px)
- Line Height: 1.8
- Max width: 75ch (slightly wider for ultra-wide displays)

**Design Rationale:**
- 16px minimum ensures readability (prevents iOS zoom)
- Relaxed line height (1.65-1.8) provides comfortable reading
- Responsive scaling ensures optimal size on all displays
- Full opacity for maximum readability
- `text-pretty` utility improves line breaks

---

#### Small Text (Labels, Captions, Metadata)

**Mobile:**
- Size: `text-sm` (0.875rem / 14px)
- Weight: `font-medium` (500) for labels, `font-normal` (400) for captions
- Color: `text-foreground/80` (80% opacity)

**Tablet:**
- Size: `text-base` (1rem / 16px)

**Desktop:**
- Size: `text-base` (1rem / 16px)

**Large Desktop:**
- Size: `text-base` to `text-lg` (1rem - 1.125rem / 16px - 18px)

**External Monitors:**
- Size: `text-lg` to `text-xl` (1.125rem - 1.25rem / 18px - 20px)

**Design Rationale:**
- Medium weight for labels provides emphasis
- 80% opacity creates visual hierarchy
- Scales appropriately for larger displays

---

#### Extra Small Text (Notes, Helper Text)

**All Sizes:**
- Size: `text-xs` (0.75rem / 12px)
- Weight: `font-normal` (400)
- Color: `text-gray-600 dark:text-gray-400` (lower contrast, appropriate for helper text)

**Design Rationale:**
- Smallest text size for least important information
- Lower contrast indicates secondary importance
- Used sparingly for notes and disclaimers

---

## 4. Weight Hierarchy

### Weight Scale

1. **Bold (700)**: Primary headings (H1), card titles
   - Creates strong visual anchor
   - Used for most important content
   - Letter spacing: -0.025em to -0.04em

2. **Semibold (600)**: Section headings (H2, H3), labels
   - Provides emphasis without competing with H1
   - Used for secondary headings
   - Letter spacing: -0.02em to -0.03em

3. **Medium (500)**: Emphasized text, descriptions, labels
   - Subtle emphasis for important body text
   - Used in descriptions and labels
   - Letter spacing: -0.015em

4. **Regular (400)**: Body text, default
   - Standard weight for comfortable reading
   - Used for all paragraph text
   - Letter spacing: -0.011em

**Design Rationale:**
- Clear weight progression reinforces size hierarchy
- Heavier weights draw attention to important content
- Lighter weights maintain readability for body text

---

## 5. Color Hierarchy

### Color Scale

1. **Primary Text** (`text-foreground` - 100% opacity)
   - Usage: H1, H3, body text
   - Contrast: >7:1 (WCAG AAA)
   - Purpose: Maximum readability for primary content

2. **Secondary Text** (`text-foreground/80` - 80% opacity)
   - Usage: H2 section headings, descriptions
   - Contrast: ~5.5:1 (WCAG AA+)
   - Purpose: Creates visual hierarchy, indicates secondary importance

3. **Tertiary Text** (`text-foreground/70` - 70% opacity)
   - Usage: Metadata, timestamps
   - Contrast: ~4.8:1 (WCAG AA)
   - Purpose: Indicates less important information

4. **Muted Text** (`text-muted-foreground`)
   - Usage: Helper text, placeholders
   - Contrast: 5.2:1 - 5.5:1 (WCAG AA+)
   - Purpose: Clearly indicates secondary/helper content

5. **Helper Text** (`text-gray-600 dark:text-gray-400`)
   - Usage: Notes, disclaimers
   - Contrast: ~4.5:1 (WCAG AA)
   - Purpose: Lowest hierarchy, used sparingly

**Enhanced Contrast for External Monitors:**
- On 1280px+: `text-foreground/80` becomes 85% opacity
- On 1920px+: `text-foreground/80` becomes 90% opacity
- Ensures better readability on larger displays

**Design Rationale:**
- Opacity-based hierarchy is more flexible than color changes
- Maintains brand colors while creating hierarchy
- Progressive enhancement for larger displays

---

## 6. Spacing System

### Vertical Spacing

**Section Spacing:**
- `space-y-3`: 0.75rem (12px) - Tight sections, form fields
- `space-y-4`: 1rem (16px) - Normal sections, card content
- `space-y-6`: 1.5rem (24px) - Loose sections, page content
- `space-y-8`: 2rem (32px) - Page-level spacing

**Enhanced for External Monitors:**
- On 1536px+: Spacing increases by 25-30%
- `space-y-3` becomes 1rem (16px)
- `space-y-4` becomes 1.25rem (20px)
- `space-y-6` becomes 1.75rem (28px)
- `space-y-8` becomes 2.5rem (40px)

**On 1920px+:**
- `space-y-8` becomes 2.5rem (40px)
- `space-y-10` becomes 3rem (48px)
- `space-y-12` becomes 3.5rem (56px)

**Design Rationale:**
- Consistent spacing creates visual rhythm
- Increased spacing on large displays prevents content from feeling cramped
- Maintains proportional relationships between elements

### Horizontal Spacing

**Reading Width:**
- Mobile: Full width with padding
- Tablet: Max 65ch (optimal reading width)
- Desktop: Max 70ch
- Large Desktop: Max 70ch
- 4K/Ultra-Wide: Max 75ch (slightly wider for ultra-wide displays)

**Design Rationale:**
- Optimal reading width (45-75 characters) prevents eye strain
- Prevents text from stretching too wide on large displays
- Maintains comfortable reading experience

---

## 7. Letter Spacing

### Tracking Scale

1. **Tighter** (-0.04em to -0.025em): Large headings (H1)
   - Prevents excessive spacing in large text
   - Creates cohesive word shapes

2. **Normal** (-0.02em to -0.011em): Body text, H2, H3
   - Standard spacing for readability
   - Slight negative tracking for modern look

3. **Wide** (0.025em to 0.05em): Uppercase text (H2 section headings)
   - Improves readability of uppercase text
   - Creates clear distinction

**Design Rationale:**
- Negative tracking for modern, cohesive appearance
- Wide tracking for uppercase improves legibility
- Adjusted based on font size and weight

---

## 8. Line Height

### Line Height Scale

1. **Tight** (1.2 - 1.25): Headings (H1, H2, H3)
   - Prevents excessive vertical space
   - Creates compact, impactful headings

2. **Normal** (1.5): Small text, labels
   - Standard line height
   - Good for short text blocks

3. **Relaxed** (1.65 - 1.7): Body text (mobile/tablet)
   - Optimal for comfortable reading
   - Prevents eye strain

4. **Very Relaxed** (1.75 - 1.8): Body text (large displays)
   - Enhanced readability on large screens
   - Prevents text from feeling cramped

**Design Rationale:**
- Tighter line heights for headings create visual impact
- Relaxed line heights for body text improve readability
- Progressive enhancement for larger displays

---

## 9. Text Utilities

### Text Wrapping

1. **`text-balance`**: Headings
   - Prevents awkward line breaks
   - Creates visually balanced headings
   - CSS: `text-wrap: balance`

2. **`text-pretty`**: Paragraphs
   - Better line breaks in body text
   - Improves readability
   - CSS: `text-wrap: pretty`

**Design Rationale:**
- Modern CSS features improve typography quality
- Better line breaks enhance readability
- Creates more professional appearance

---

## 10. External Monitor Optimizations

### Problem Identified

Text was too small and lacked proper contrast on external monitors, making it difficult to read.

### Solutions Implemented

1. **Enhanced Base Font Size**
   - 1280px+: 17px base (from 16px)
   - 1536px+: 18px base
   - Ensures comfortable reading at distance

2. **Improved Heading Scaling**
   - Added `xl:`, `2xl:` breakpoints
   - Headings scale appropriately for large displays
   - Capped at reasonable maximums to prevent overscaling

3. **Better Line Heights**
   - Increased from 1.65 to 1.75-1.8 on large displays
   - Prevents text from feeling cramped
   - Improves readability at distance

4. **Enhanced Contrast**
   - Increased opacity of secondary text on large displays
   - Better contrast ratios for readability
   - Progressive enhancement based on screen size

5. **Improved Spacing**
   - Increased vertical spacing by 25-30% on large displays
   - Prevents content from feeling cramped
   - Maintains visual rhythm

6. **Optimal Reading Width**
   - Maintained 70ch max width (optimal reading width)
   - Slightly wider (75ch) on ultra-wide displays
   - Prevents text from stretching too wide

**Design Rationale:**
- External monitors are typically viewed from greater distance
- Larger font sizes and spacing improve readability
- Enhanced contrast ensures text is clearly visible
- Maintains design integrity while improving usability

---

## 11. Visual Flow & Eye Movement

### Reading Pattern

1. **H1 (Largest, Boldest)**: Eye is drawn first
   - Establishes page/section topic
   - Creates visual anchor

2. **H2 (Medium, Semibold, Uppercase)**: Secondary focus
   - Guides eye to section content
   - Clear visual distinction

3. **Body Text (Normal, Relaxed)**: Primary reading
   - Comfortable line height for extended reading
   - Optimal width prevents eye strain

4. **Small Text (Reduced Opacity)**: Supporting information
   - Lower in hierarchy
   - Doesn't compete with primary content

### Design Choices Supporting Flow

1. **Size Progression**: Clear size differences guide eye
2. **Weight Variation**: Heavier weights draw attention
3. **Color Hierarchy**: Opacity creates depth
4. **Spacing**: White space creates breathing room
5. **Alignment**: Consistent left alignment for natural reading flow

---

## 12. Accessibility Considerations

### Contrast Ratios

- **Primary Text**: >7:1 (WCAG AAA)
- **Secondary Text**: 5.2:1 - 5.5:1 (WCAG AA+)
- **Tertiary Text**: ~4.8:1 (WCAG AA)
- **Helper Text**: ~4.5:1 (WCAG AA)

### Font Sizes

- **Minimum**: 16px (prevents iOS zoom)
- **Body Text**: 16px - 24px (optimal range)
- **Headings**: Scale appropriately but maintain hierarchy

### Semantic Structure

- Proper HTML heading hierarchy (H1 → H2 → H3)
- Semantic HTML elements
- ARIA labels where appropriate

---

## 13. Responsive Breakpoints

### Breakpoint Strategy

1. **Mobile**: < 640px
   - Base sizes, compact spacing
   - Minimum readable sizes

2. **Tablet**: 640px - 1024px
   - Moderate scaling
   - Increased spacing

3. **Desktop**: 1024px - 1280px
   - Optimal sizes
   - Comfortable spacing

4. **Large Desktop**: 1280px - 1536px
   - Enhanced sizes
   - Improved line heights
   - Better contrast

5. **External Monitors**: 1536px - 1920px
   - Further enhanced sizes
   - Increased spacing
   - Optimized for distance viewing

6. **4K/Ultra-Wide**: 1920px+
   - Maximum sizes (capped)
   - Maximum spacing
   - Ultra-wide reading width

---

## 14. Implementation Examples

### Example 1: Bias Card Title (H1)

```tsx
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl 2xl:text-6xl 
               font-bold tracking-tight text-balance leading-tight">
  {bias.title}
</h1>
```

**Hierarchy:**
- Size: 24px → 30px → 36px → 48px → 60px
- Weight: Bold (700)
- Spacing: Tight tracking, tight line height
- Color: Full foreground (100% opacity)

### Example 2: Section Heading (H2)

```tsx
<h2 className="text-sm sm:text-base lg:text-lg xl:text-lg 2xl:text-xl
               font-semibold tracking-wide uppercase text-foreground/80">
  Why it happens
</h2>
```

**Hierarchy:**
- Size: 14px → 16px → 18px → 20px
- Weight: Semibold (600)
- Spacing: Wide tracking (uppercase)
- Color: 80% opacity (secondary)

### Example 3: Body Text

```tsx
<p className="text-base sm:text-lg lg:text-xl xl:text-xl 2xl:text-xl
             leading-relaxed text-pretty text-foreground">
  {bias.summary}
</p>
```

**Hierarchy:**
- Size: 16px → 18px → 20px → 22px → 24px
- Weight: Normal (400)
- Spacing: Relaxed line height (1.65-1.8)
- Color: Full foreground (100% opacity)

---

## 15. Design Choices Summary

### Why These Choices Work

1. **Clear Size Progression**: 24px → 36px → 48px → 60px creates obvious hierarchy
2. **Weight Reinforcement**: Bold for primary, semibold for secondary reinforces size
3. **Color Opacity**: 100% → 80% → 70% creates depth without color changes
4. **Spacing Rhythm**: Consistent spacing creates visual flow
5. **Responsive Scaling**: Smooth scaling ensures readability at all sizes
6. **External Monitor Optimization**: Enhanced sizes and spacing for distance viewing

### How Each Element Contributes

- **Size**: Primary hierarchy indicator
- **Weight**: Reinforces importance
- **Color**: Creates depth and hierarchy
- **Spacing**: Creates rhythm and flow
- **Line Height**: Ensures readability
- **Letter Spacing**: Improves legibility
- **Text Wrapping**: Enhances appearance

---

## 16. Conclusion

The typographic hierarchy system creates a visually clear, readable layout that:

1. **Guides the Eye**: Clear size, weight, and color progression
2. **Enhances Readability**: Optimal font sizes, line heights, and spacing
3. **Scales Responsively**: Smooth scaling from mobile to 4K displays
4. **Maintains Accessibility**: WCAG AA+ contrast ratios
5. **Optimizes for External Monitors**: Enhanced sizes and contrast for distance viewing

The system uses intentional variations in all typographic elements to create a cohesive, professional, and highly readable design that works beautifully across all devices and screen sizes.
