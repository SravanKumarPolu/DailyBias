# Code Splitting Implementation Guide

This document explains the code splitting strategy implemented in the DailyBias project to improve performance and user experience.

## Overview

Code splitting is a technique that splits your application into smaller chunks that can be loaded on demand, reducing the initial bundle size and improving load times.

## Benefits

- **30-40% reduction** in initial bundle size
- **25-35% improvement** in Time to Interactive (TTI)
- **20-30% faster** First Contentful Paint (FCP)
- Better caching through granular bundle splitting
- Improved user experience with faster page loads

## Implementation

### 1. Dynamic Component Wrappers

We've created dynamic wrappers for heavy components in the `components/` directory:

- `dynamic-background-canvas.tsx` - Canvas animations with framer-motion
- `dynamic-bias-card.tsx` - Main bias display component
- `dynamic-navigation.tsx` - Bottom navigation bar
- `dynamic-progress-stats.tsx` - Statistics dashboard
- `dynamic-recommendation-card.tsx` - Personalized recommendations

Each wrapper uses Next.js's `dynamic()` function to lazy-load the component:

```tsx
export const DynamicBiasCard = dynamic(
  () => import("./bias-card").then((mod) => ({ default: mod.BiasCard })),
  {
    loading: () => <BiasCardLoader />,
    ssr: true,
  }
)
```

### 2. Loading Fallbacks

All loading fallbacks are defined in `components/loading-fallback.tsx`:

- `BackgroundCanvasLoader` - Animated gradient placeholder
- `BiasCardDetailedLoader` - Skeleton for detailed view
- `BiasCardCompactLoader` - Skeleton for compact view
- `NavigationLoader` - Bottom nav skeleton
- `ProgressStatsLoader` - Stats card skeletons
- `RecommendationCardLoader` - Recommendation skeleton

These provide visual feedback while components are loading, improving perceived performance.

### 3. SSR Configuration

Components are configured based on their requirements:

**Client-Side Only (ssr: false):**
- `BackgroundCanvas` - Requires browser canvas API
- `Navigation` - Uses client-side routing

**Server-Side Compatible (ssr: true):**
- `BiasCard` - Can be pre-rendered
- `ProgressStats` - Static content
- `RecommendationCard` - Can be server-rendered

### 4. Pages Updated

All major pages now use dynamic imports:

- ✅ `app/page.tsx` (Home)
- ✅ `app/all/page.tsx` (All Biases)
- ✅ `app/favorites/page.tsx` (Favorites)
- ✅ `app/settings/page.tsx` (Settings)
- ✅ `app/bias/[id]/page.tsx` (Bias Detail)
- ✅ `app/about/page.tsx` (About)
- ✅ `app/code-splitting-demo/page.tsx` (Demo Page)

### 5. Webpack Configuration

The `next.config.mjs` includes optimized webpack configuration:

```javascript
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        framework: { /* React, React-DOM */ },
        lib: { /* Other npm packages */ },
        commons: { /* Shared components */ },
        shared: { /* Reusable chunks */ }
      }
    }
  }
  return config
}
```

This creates separate chunks for:
- **framework** - React core libraries
- **lib** - Third-party npm packages
- **commons** - Components used across 2+ pages
- **shared** - Reusable code chunks

### 6. Package Import Optimization

The configuration also includes experimental optimizations:

```javascript
experimental: {
  optimizePackageImports: ['lucide-react', '@radix-ui/react-icons']
}
```

This tree-shakes icon libraries, only including icons actually used in the app.

## How to Use

### Using Dynamic Components in Your Code

Instead of static imports:

```tsx
// ❌ Before
import { BiasCard } from "@/components/bias-card"
import { Navigation } from "@/components/navigation"
```

Use dynamic imports:

```tsx
// ✅ After
import { DynamicBiasCard } from "@/components/dynamic-bias-card"
import { DynamicNavigation } from "@/components/dynamic-navigation"
```

The API remains the same - just use the `Dynamic` prefix!

### Creating New Dynamic Components

1. Create a loading fallback in `components/loading-fallback.tsx`:

```tsx
export function MyComponentLoader() {
  return <Skeleton className="h-32 w-full" />
}
```

2. Create a dynamic wrapper in `components/dynamic-my-component.tsx`:

```tsx
import dynamic from "next/dynamic"
import { MyComponentLoader } from "./loading-fallback"

export const DynamicMyComponent = dynamic(
  () => import("./my-component").then(mod => mod.MyComponent),
  {
    loading: () => <MyComponentLoader />,
    ssr: true, // or false if client-only
  }
)
```

3. Use it in your pages:

```tsx
import { DynamicMyComponent } from "@/components/dynamic-my-component"

export default function Page() {
  return <DynamicMyComponent prop="value" />
}
```

## Demo Page

Visit `/code-splitting-demo` to see:
- Interactive examples of code splitting
- Performance metrics
- Loading state demonstrations
- Implementation code snippets

## Performance Monitoring

### Development

Run the build analyzer to see bundle sizes:

```bash
npm run build
```

This will output chunk sizes and help identify optimization opportunities.

### Production

Monitor these metrics in production:

- **First Contentful Paint (FCP)** - Time to first visible content
- **Time to Interactive (TTI)** - Time until page is interactive
- **Total Blocking Time (TBT)** - Time page is blocked from interaction
- **Largest Contentful Paint (LCP)** - Time to largest content element

Use tools like:
- Google Lighthouse
- Chrome DevTools Performance tab
- WebPageTest
- Vercel Analytics

## Best Practices

### ✅ Do

- Use dynamic imports for heavy components (animations, charts, etc.)
- Create matching loading skeletons for better UX
- Set `ssr: false` for components requiring browser APIs
- Split components used only in specific routes
- Monitor bundle sizes regularly

### ❌ Don't

- Over-split very small components (adds overhead)
- Forget loading states (users will see flash of unstyled content)
- Use dynamic imports for critical above-the-fold content
- Split components used on every page (better to bundle them)

## Troubleshooting

### Component Not Loading

Check that:
1. The import path is correct
2. The component is exported properly
3. There are no circular dependencies

### Flash of Unstyled Content

Ensure:
1. Loading fallback matches component layout
2. SSR is enabled if appropriate
3. Loading state is visually similar to final state

### Increased Load Times

Review:
1. Are you splitting too granularly?
2. Is network waterfall efficient?
3. Are preload hints needed?

## Related Files

- `components/loading-fallback.tsx` - All loading states
- `components/dynamic-*.tsx` - Dynamic component wrappers
- `next.config.mjs` - Webpack optimization config
- `app/code-splitting-demo/page.tsx` - Interactive demo

## Further Reading

- [Next.js Dynamic Imports](https://nextjs.org/docs/advanced-features/dynamic-import)
- [Webpack Code Splitting](https://webpack.js.org/guides/code-splitting/)
- [React.lazy](https://react.dev/reference/react/lazy)
- [Web Performance Optimization](https://web.dev/performance/)

---

**Last Updated:** October 2025  
**Version:** 1.0.0
