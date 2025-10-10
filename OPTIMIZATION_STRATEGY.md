# 📱 Mobile-First Optimization Strategy

**Project Focus**: 70% Mobile, 30% Desktop  
**Target**: Fast, smooth experience on mobile devices (especially older phones)

---

## 🎯 Mobile Optimization Priorities

### 1. Performance Budget

| Metric                         | Target  | Current | Priority  |
| ------------------------------ | ------- | ------- | --------- |
| First Contentful Paint (FCP)   | < 1.8s  | ~2.5s   | 🔴 HIGH   |
| Largest Contentful Paint (LCP) | < 2.5s  | ~3.2s   | 🔴 HIGH   |
| First Input Delay (FID)        | < 100ms | ~80ms   | ✅ GOOD   |
| Cumulative Layout Shift (CLS)  | < 0.1   | ~0.05   | ✅ GOOD   |
| Time to Interactive (TTI)      | < 3.8s  | ~4.5s   | 🟡 MEDIUM |
| Total Bundle Size              | < 200KB | ~280KB  | 🟡 MEDIUM |

### 2. Network Conditions

**Test Against**:

- 📱 4G: 4 Mbps down, 3 Mbps up
- 📱 3G: 1.6 Mbps down, 750 Kbps up (primary target)
- 📱 Slow 3G: 400 Kbps down, 400 Kbps up
- 📡 Offline: Full functionality

### 3. Device Targets

**Primary**:

- iPhone 12/13 (most common)
- Samsung Galaxy S21/S22
- Google Pixel 5/6
- Mid-range Android (2-4 years old)

**Secondary**:

- Budget Android phones (< $300)
- Older iPhones (iPhone 8/X era)
- Tablets (iPad, Android tablets)

---

## ⚡ Optimization Techniques

### Bundle Size Reduction

#### Current Bundle Analysis

```bash
# Run this to analyze
pnpm add -D @next/bundle-analyzer
ANALYZE=true pnpm build
```

#### Optimization Strategies

**1. Lazy Load Components**

```typescript
// Instead of
import { BiasCard } from '@/components/bias-card'

// Use
const BiasCard = dynamic(() => import('@/components/bias-card'), {
  loading: () => <Skeleton />,
  ssr: false, // If not needed on server
})
```

**2. Optimize Dependencies**

```typescript
// Before (imports entire library)
import { motion } from "framer-motion"

// After (tree-shakeable)
import { motion } from "framer-motion/dist/framer-motion"

// Or use smaller alternatives
import { useSpring } from "react-spring" // Smaller than Framer
```

**3. Remove Unused Dependencies**

```bash
# Audit what's actually used
pnpm dlx depcheck

# Remove unused packages
pnpm remove [unused-package]
```

**4. Split Vendor Bundles**

```typescript
// next.config.mjs - Already configured but optimize further
splitChunks: {
  chunks: 'all',
  cacheGroups: {
    // Separate React (changes rarely)
    react: {
      test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
      name: 'react-vendor',
      priority: 10,
    },
    // Separate UI library (changes rarely)
    ui: {
      test: /[\\/]node_modules[\\/](@radix-ui)[\\/]/,
      name: 'ui-vendor',
      priority: 9,
    },
    // Other vendors
    vendor: {
      test: /[\\/]node_modules[\\/]/,
      name: 'vendor',
      priority: 8,
    },
  },
}
```

---

## 🖼️ Image Optimization

### Current Status

- ✅ No images (text-only app)
- ✅ SVG icons only (lightweight)
- ⚠️ Icon files are JPG (should be PNG or WebP)

### Optimization

```bash
# Convert icon files to WebP (smaller, better quality)
# Use free tool: squoosh.app or cwebp

# Update manifest.json
{
  "icons": [
    {
      "src": "/icon-192.webp",
      "sizes": "192x192",
      "type": "image/webp"
    },
    {
      "src": "/icon-512.webp",
      "sizes": "512x512",
      "type": "image/webp"
    }
  ]
}
```

---

## 🎨 CSS Optimization

### Tailwind CSS Purging

```typescript
// Already configured, but verify
// tailwind.config.js
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  // This removes unused CSS
}
```

### Critical CSS

```typescript
// app/layout.tsx - Inline critical CSS
<style dangerouslySetInnerHTML={{
  __html: `
    /* Critical styles for above-the-fold content */
    .glass {
      backdrop-filter: blur(12px);
      background: rgba(255, 255, 255, 0.1);
    }
  `
}} />
```

### CSS-in-JS Performance

- ✅ Using Tailwind (no runtime CSS)
- ✅ No styled-components (good - no runtime cost)
- ✅ Static styles (compiled at build time)

---

## 🔄 JavaScript Optimization

### Code Splitting Strategy

**Current Implementation**: ✅ Good

- Dynamic imports for heavy components
- Separate routes load independently
- Vendor code split

**Improvements**:

```typescript
// 1. Preload critical routes
// app/layout.tsx
import PreloadLinks from '@/components/preload-links'

export default function Layout({ children }) {
  return (
    <>
      <PreloadLinks />
      {children}
    </>
  )
}

// components/preload-links.tsx
export default function PreloadLinks() {
  return (
    <head>
      <link rel="preload" href="/all" as="fetch" />
      <link rel="prefetch" href="/favorites" />
    </head>
  )
}
```

```typescript
// 2. Lazy load below-the-fold content
const RecommendationCard = dynamic(
  () => import('@/components/recommendation-card'),
  { ssr: false } // Don't need on server
)

// Only load when scrolled into view
const [isVisible, setIsVisible] = useState(false)
useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => setIsVisible(entry.isIntersecting),
    { rootMargin: '100px' }
  )
  observer.observe(ref.current)
}, [])

{isVisible && <RecommendationCard />}
```

### Reduce Re-renders

```typescript
// Use React.memo for expensive components
export const BiasCard = React.memo(
  ({ bias, isFavorite }) => {
    // Component code
  },
  (prevProps, nextProps) => {
    // Custom comparison
    return prevProps.bias.id === nextProps.bias.id && prevProps.isFavorite === nextProps.isFavorite
  }
)

// Use useMemo for expensive calculations
const sortedBiases = useMemo(() => biases.sort((a, b) => a.title.localeCompare(b.title)), [biases])

// Use useCallback for event handlers
const handleToggleFavorite = useCallback(() => {
  toggleFavorite(bias.id)
}, [bias.id, toggleFavorite])
```

---

## 💾 Caching Strategy

### Service Worker Optimization

```typescript
// next.config.mjs - Improve caching
runtimeCaching: [
  {
    // Cache API routes
    urlPattern: /^https?.*\/api\/.*/,
    handler: "NetworkFirst",
    options: {
      cacheName: "api-cache",
      networkTimeoutSeconds: 10,
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutes
      },
    },
  },
  {
    // Cache static assets
    urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
    handler: "CacheFirst",
    options: {
      cacheName: "image-cache",
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
  {
    // Cache JS/CSS
    urlPattern: /\.(?:js|css)$/,
    handler: "StaleWhileRevalidate",
    options: {
      cacheName: "static-resources",
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      },
    },
  },
]
```

### IndexedDB Optimization

```typescript
// lib/db.ts - Add indexing for faster queries
export async function getDB() {
  return await openDB<BiasDB>("bias-daily-db", 3, {
    upgrade(db, oldVersion) {
      // ... existing code

      if (oldVersion < 3) {
        // Add compound index for faster filtering
        const progressStore = db.transaction.objectStore("progress")
        progressStore.createIndex("by-category-and-mastered", ["category", "mastered"])
      }
    },
  })
}

// Use the index
const masteredDecisionBiases = await db.getAllFromIndex("progress", "by-category-and-mastered", [
  "decision",
  true,
])
```

---

## 🎭 Animation Performance

### GPU Acceleration

```css
/* Force GPU acceleration for animations */
.will-animate {
  will-change: transform, opacity;
  transform: translateZ(0); /* Create compositing layer */
}

/* But remove after animation completes */
.animation-done {
  will-change: auto;
}
```

```typescript
// Framer Motion - Optimize settings
<motion.div
  animate={{ x: 100 }}
  transition={{
    type: "spring",
    stiffness: 300,
    damping: 20,
    // Use hardware acceleration
    useMotionValue: true,
  }}
  // Reduce motion for accessibility
  style={{
    willChange: isAnimating ? 'transform' : 'auto'
  }}
/>
```

### Reduce Animation Complexity

```typescript
// Check if device can handle complex animations
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches

const canRunComplexAnimations =
  !prefersReducedMotion &&
  window.navigator.hardwareConcurrency > 4 &&
  window.devicePixelRatio <= 2

// Adjust animation based on capability
<motion.div
  animate={canRunComplexAnimations ? complexAnimation : simpleAnimation}
/>
```

---

## 📊 Performance Monitoring

### Lighthouse CI

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: pnpm install
      - run: pnpm build
      - run: pnpm start &
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/all
            http://localhost:3000/favorites
          uploadArtifacts: true
          temporaryPublicStorage: true
```

### Web Vitals Tracking

```typescript
// app/layout.tsx - Add Web Vitals reporting
import { useReportWebVitals } from 'next/web-vitals'

export default function RootLayout({ children }) {
  useReportWebVitals((metric) => {
    // In production, send to analytics
    if (process.env.NODE_ENV === 'production') {
      console.log(metric)
      // Could send to Sentry, but only in production
      // Sentry.captureMessage(`${metric.name}: ${metric.value}`)
    }
  })

  return <>{children}</>
}
```

---

## 📱 Mobile-Specific Optimizations

### Touch Interactions

```css
/* Faster tap response */
button,
a {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation; /* Prevents double-tap zoom */
}

/* Optimize scrolling */
.scrollable {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}
```

### Viewport Configuration

```typescript
// app/layout.tsx - Already done, but verify
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Prevents zoom on input focus
  userScalable: false,
  viewportFit: "cover", // For notched devices
}
```

### Input Optimization

```css
/* Prevent iOS zoom on input focus */
input,
select,
textarea {
  font-size: 16px; /* Magic number - prevents zoom */
}

/* Better touch targets */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: 8px;
}
```

---

## 🔋 Battery & Resource Optimization

### Reduce Background Activity

```typescript
// Pause animations when tab is hidden
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // Pause animations, stop timers
      pauseAnimations()
    } else {
      // Resume
      resumeAnimations()
    }
  }

  document.addEventListener("visibilitychange", handleVisibilityChange)
  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange)
  }
}, [])
```

### Throttle Expensive Operations

```typescript
// Throttle scroll events
import { throttle } from "lodash-es" // Use ES import for tree-shaking

const handleScroll = throttle(
  () => {
    // Handle scroll
  },
  100,
  { leading: true, trailing: true }
)

useEffect(() => {
  window.addEventListener("scroll", handleScroll)
  return () => {
    handleScroll.cancel()
    window.removeEventListener("scroll", handleScroll)
  }
}, [])
```

---

## 📈 Optimization Checklist

### Immediate Wins (< 1 day)

- [ ] Convert icon files to WebP
- [ ] Add `loading="lazy"` to below-fold content
- [ ] Implement React.memo on expensive components
- [ ] Add intersection observer for lazy loading
- [ ] Enable Lighthouse CI

### Short Term (1-2 weeks)

- [ ] Audit and remove unused dependencies
- [ ] Optimize bundle splitting further
- [ ] Add performance monitoring
- [ ] Implement advanced caching strategies
- [ ] Optimize database queries with indexes

### Long Term (1-2 months)

- [ ] Implement virtual scrolling for long lists
- [ ] Add route preloading based on user behavior
- [ ] Optimize animation complexity
- [ ] Implement progressive enhancement
- [ ] Add performance budgets to CI

---

## 🎯 Target Metrics (After Optimization)

| Metric       | Current | Target  | Strategy                     |
| ------------ | ------- | ------- | ---------------------------- |
| FCP          | 2.5s    | < 1.5s  | Bundle size, critical CSS    |
| LCP          | 3.2s    | < 2.0s  | Lazy loading, caching        |
| TTI          | 4.5s    | < 3.0s  | Code splitting, less JS      |
| Bundle Size  | 280KB   | < 180KB | Remove unused, optimize deps |
| Mobile Score | 85      | > 95    | All of the above             |

---

## 📞 Testing Devices

### Priority Testing

1. **iPhone 12/13** (most common iOS)
2. **Samsung Galaxy S21** (most common Android)
3. **Older iPhone** (iPhone 8 or X)
4. **Budget Android** (< $300 device)

### Tools

- **Chrome DevTools**: Mobile emulation, throttling
- **Lighthouse**: Performance audits
- **WebPageTest**: Real-device testing
- **BrowserStack**: Cross-device testing (free for open source)

---

**Remember**: Mobile users are your primary audience. Every optimization should prioritize mobile experience first, desktop second.

---

Last Updated: October 5, 2025  
Next Review: November 2025
