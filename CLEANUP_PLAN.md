# DebiasDaily Codebase Cleanup Plan

## Scan Results

### Unused Components (18 components):
1. `src/components/ui/aspect-ratio.tsx`
2. `src/components/ui/pagination.tsx`
3. `src/components/ui/sheet.tsx`
4. `src/components/ui/drawer.tsx`
5. `src/components/ui/hover-card.tsx`
6. `src/components/ui/resizable.tsx`
7. `src/components/ui/navigation-menu.tsx`
8. `src/components/ui/input-otp.tsx`
9. `src/components/ui/accordion.tsx`
10. `src/components/ui/avatar.tsx`
11. `src/components/ui/menubar.tsx`
12. `src/components/ui/table.tsx`
13. `src/components/ui/skeleton.tsx`
14. `src/components/ui/context-menu.tsx`
15. `src/components/ui/carousel.tsx`
16. `src/components/ui/form.tsx`
17. `src/components/ui/chart.tsx`
18. `src/components/ui/sidebar.tsx`

### Unused Hooks (2 hooks):
1. `src/hooks/use-mobile.tsx` (only used by unused sidebar)
2. `src/hooks/use-toast.ts` (unused, sonner used instead)

### Unused Utilities (1 file):
1. `src/components/ui/toaster.tsx` (unused, sonner component used instead)
1. `src/components/ui/use-toast.ts` (unused hook)

### Unused CSS (1 class):
1. `.gradient-border` in `src/index.css`

### Unused Dependencies (17 packages):
1. `@radix-ui/react-accordion`
2. `@radix-ui/react-avatar`
3. `@radix-ui/react-context-menu`
4. `@radix-ui/react-navigation-menu`
5. `@radix-ui/react-scroll-area`
6. `@radix-ui/react-select`
7. `@radix-ui/react-slider`
8. `@radix-ui/react-aspect-ratio`
9. `embla-carousel-react`
10. `input-otp`
11. `react-day-picker`
12. `react-resizable-panels`
13. `recharts`
14. `vaul`
15. `cmdk` (only used by command component which is unused)
16. `react-hook-form` (only used by form component which is unused)
17. `@hookform/resolvers` (only used by form component which is unused)

### Duplicate Logic:
- No significant duplicate patterns found
- Similar patterns in useState usage are legitimate component-specific state

## Expected Bundle Size Reduction

### Current Bundle Analysis:
- Total bundle: ~537 KB (167 KB gzipped)
- Split chunks: vendor-react, vendor-ui, vendor-utils, vendor-charts, index

### Expected Reductions:
1. **UI Component Dependencies**: ~80-100 KB reduction
   - Removing unused Radix UI components
   - Removing form libraries
   - Removing carousel libraries

2. **Chart Library**: ~200 KB reduction
   - recharts is a large library (~200 KB)
   - Only used in unused chart component

3. **Other Unused Libraries**: ~50-70 KB reduction
   - react-day-picker (~30 KB)
   - embla-carousel-react (~20 KB)
   - react-resizable-panels (~15 KB)
   - vaul (~5 KB)

### **Total Expected Reduction**: ~330-370 KB (80-90 KB gzipped)
### **Final Expected Bundle Size**: ~167-207 KB (77-87 KB gzipped)

## Cleanup Execution Plan

### Phase 1: Remove Unused Components (Safe)
- Delete 18 unused UI components
- Delete 2 unused hooks
- Delete unused toaster files
- **Risk**: Minimal - these are completely unused

### Phase 2: Remove Unused CSS (Safe)
- Remove unused `.gradient-border` class
- **Risk**: Minimal - unused class

### Phase 3: Remove Unused Dependencies (Moderate)
- Run `npm uninstall` for unused packages
- Update package.json
- **Risk**: Moderate - need to verify no hidden usage

### Phase 4: Verification (Critical)
- Run lint to check for import errors
- Run build to verify no compilation errors
- Run tests to ensure functionality intact
- **Risk**: High - comprehensive testing required

## Safety Measures

1. **Git Commit Before Cleanup**: Create checkpoint commit
2. **Incremental Removal**: Remove in phases with testing between each
3. **Import Search**: Double-check each component/dependency usage
4. **Test Coverage**: Run full test suite after each phase
5. **Build Verification**: Ensure production build succeeds

## Rollback Plan

If any issues arise:
1. Use git to revert to pre-cleanup commit
2. Reinstall all removed dependencies
3. Restore deleted files from git

## Execution Order

1. ✅ Phase 1: Remove unused components (with immediate test verification)
2. ✅ Phase 2: Remove unused CSS (with immediate test verification)  
3. ✅ Phase 3: Remove unused dependencies (with immediate test verification)
4. ✅ Phase 4: Final verification (build + lint + full test suite)

## Expected Timeline

- Phase 1: 5 minutes
- Phase 2: 1 minute
- Phase 3: 3 minutes
- Phase 4: 5 minutes
- **Total**: ~14 minutes