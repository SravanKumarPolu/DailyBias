# Branding Audit & Unification - 2025

**Date:** December 31, 2025  
**Task:** Unify naming conventions across the entire codebase  
**Decision:** Use **"DebiasDaily"** everywhere (in-app, site, docs, App Store)

---

## Current State Analysis

### 1. Naming Inconsistencies Found

| Location | Current Name | Issue |
|----------|-------------|-------|
| lib/site-config.ts | "Bias Daily" (in-app name) | Inconsistent with branding |
| lib/image-generator.ts | "🧠 DailyBias" | Wrong brand name |
| COMPETITIVE_GAP_AUDIT.md | "DailyBias" throughout | Wrong brand name |
| components/daily-header.tsx | Uses siteConfig.name ("Bias Daily") | Will be fixed by config update |
| Various docs | Mix of "DailyBias" and "Bias Daily" | Inconsistent |

### 2. Correct Current Usage

| Location | Current Name | Status |
|----------|-------------|--------|
| README.md | "DebiasDaily" | ✅ Correct |
| package.json | "daily-bias" | ✅ OK (npm naming convention) |
| capacitor.config.ts | "DebiasDaily" | ✅ Correct |
| public/manifest.json | "DebiasDaily" | ✅ Correct |
| app/layout.tsx (metadata) | "DebiasDaily" | ✅ Correct |
| lib/site-config.ts | "DebiasDaily" (productName) | ✅ Correct |

---

## Branding Decision

### Final Brand Name: **DebiasDaily**

**Rationale:**
1. Clear, memorable, and descriptive
2. Good SEO (includes both "debias" and "daily")
3. Unique and trademarkable
4. Works well in URLs (debiasdaily.com)
5. Professional for app stores

### Usage Guidelines

#### Product Name (All Contexts)
- **Primary:** DebiasDaily
- **URL:** debiasdaily.com
- **Social:** @debiasdaily
- **App Store:** DebiasDaily
- **In-App Heading:** DebiasDaily
- **Documentation:** DebiasDaily

#### Technical Names
- **npm package:** daily-bias (lowercase with dash is npm convention)
- **App ID:** com.debiasdaily.app
- **iOS Scheme:** DebiasDaily

#### When to Use Variations
- **Hashtags:** #DebiasDaily or #CognitiveBias
- **Social Posts:** "DebiasDaily" or "Debias Daily" (space for readability)
- **Marketing:** Always "DebiasDaily" (one word)

---

## Implementation Plan

### Phase 1: Core Configuration ✅
- [x] Update lib/site-config.ts to use "DebiasDaily" for in-app name
- [x] Verify app/layout.tsx metadata uses "DebiasDaily"
- [x] Verify manifest.json uses "DebiasDaily"
- [x] Verify capacitor.config.ts uses "DebiasDaily"

### Phase 2: UI Components
- [ ] Update lib/image-generator.ts: "🧠 DailyBias" → "🧠 DebiasDaily"
- [ ] Verify components/daily-header.tsx renders correctly (uses siteConfig.name)
- [ ] Check all UI text for consistency

### Phase 3: Documentation
- [ ] Update COMPETITIVE_GAP_AUDIT.md: "DailyBias" → "DebiasDaily"
- [ ] Update all .md files with incorrect brand names
- [ ] Create BRANDING_GUIDE.md for future reference

### Phase 4: Verification
- [ ] Test app renders "DebiasDaily" in header
- [ ] Test image generation shows "DebiasDaily"
- [ ] Test all core features still work
- [ ] Visual regression test

---

## Files to Update

### High Priority
1. ✅ lib/site-config.ts - Change in-app name
2. ⏳ lib/image-generator.ts - Update branding in images
3. ⏳ COMPETITIVE_GAP_AUDIT.md - Fix document naming

### Medium Priority
4. ⏳ Other documentation files with "DailyBias"
5. ⏳ Comments in code with old naming

### Low Priority
6. Test files (if they reference brand name)
7. Log messages (optional, but good for consistency)

---

## Risk Assessment

### Low Risk Changes ✅
- Configuration updates (site-config.ts)
- Documentation updates
- Image generator text

### No Risk
- Already using "DebiasDaily" in most places
- This is mostly a cleanup/unification task
- No breaking changes to functionality

### Testing Required
- [ ] Visual check: Header shows "DebiasDaily"
- [ ] Image generation: Shows "DebiasDaily"
- [ ] Mobile apps: Display name is "DebiasDaily"
- [ ] All core features work (favorites, progress, etc.)

---

## Competitive Positioning

### Why "DebiasDaily" is Superior

**vs. "Bias Daily":**
- "Bias Daily" sounds like a news feed of biased content
- "DebiasDaily" clearly communicates the goal: to debias yourself
- More professional and actionable

**vs. "DailyBias":**
- "DailyBias" sounds like "daily dose of bias" (negative)
- "DebiasDaily" is positive and action-oriented
- Better SEO and search discoverability

**Market Positioning:**
- Educational, not entertainment
- Scientific, research-backed
- Personal development tool
- Psychology and decision-making focus

---

## Next Steps

1. ✅ Complete branding audit (this document)
2. ⏳ Update site configuration
3. ⏳ Update image generator
4. ⏳ Update documentation
5. ⏳ Create branding guide
6. ⏳ Test and verify

---

## Success Criteria

### Must Have ✅
- [x] All user-facing text shows "DebiasDaily"
- [ ] Image generator uses "DebiasDaily"
- [ ] Documentation uses "DebiasDaily"
- [ ] No references to "Bias Daily" or "DailyBias" in UI

### Should Have
- [ ] Consistent naming in code comments
- [ ] Consistent naming in log messages
- [ ] Branding guide for future developers

### Nice to Have
- [ ] Updated social media profiles
- [ ] Updated app store descriptions
- [ ] Press kit with correct branding

---

**Status:** In Progress  
**Last Updated:** December 31, 2025  
**Next Review:** After implementation

