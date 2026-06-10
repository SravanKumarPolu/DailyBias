# DebiasDaily Developer Onboarding Guide

## Project Overview

DebiasDaily is a progressive web application that delivers daily cognitive bias education to users. The app is designed as a calm, focused learning experience with features like streaks, quizzes, reflections, and weekly reviews. All user progress is stored locally in the browser using localStorage.

**Tech Stack:**
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Routing:** React Router DOM v6
- **State Management:** React Hooks + Custom hooks pattern
- **UI Components:** Radix UI primitives with shadcn/ui styling
- **Styling:** Tailwind CSS with custom animations
- **Testing:** Vitest (unit) + Playwright (E2E)
- **Analytics:** Google Analytics 4 (optional, build-time configuration)

---

## Folder Structure

```
debiasdaily/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Radix UI/shadcn components (auto-generated)
│   │   ├── BiasCard.tsx    # Main bias display with TTS integration
│   │   ├── BiasActions.tsx # Bookmark/share/save actions
│   │   ├── Header.tsx      # App navigation header
│   │   ├── MobileNav.tsx   # Bottom navigation for mobile
│   │   ├── SEO.tsx         # Dynamic SEO meta tags component
│   │   ├── StructuredData.tsx # JSON-LD structured data component
│   │   ├── AnalyticsRouteTracker.tsx # Route-based analytics tracking
│   │   ├── ErrorBoundary.tsx # Error boundary for error handling
│   │   ├── ListenControls.tsx # Global TTS playback controls
│   │   ├── VoiceSpeedSelector.tsx # TTS voice and rate selection
│   │   ├── BiasProgress.tsx # Learning cycle progress display
│   │   ├── ReflectionPrompt.tsx # Reflection input component
│   │   ├── BiasFeedback.tsx # Feedback submission form
│   │   ├── CycleCompletionModal.tsx # Cycle completion modal
│   │   ├── PageTransition.tsx # Page transition animations
│   │   └── ...             # Other feature components
│   ├── hooks/              # Custom React hooks
│   │   ├── useTTS.ts       # Text-to-speech functionality
│   │   ├── useTTSSettings.ts # TTS voice and speed settings
│   │   ├── useBiasProgress.ts # Learning cycle progress
│   │   ├── useBookmarks.ts # Bookmark management
│   │   ├── useStreak.ts    # Daily streak tracking
│   │   ├── useReflection.ts # Reflection text management
│   │   ├── useQuizCompletion.ts # Quiz completion tracking
│   │   ├── useShareBias.ts # Share functionality
│   │   ├── useBiasFeedback.ts # Feedback submission
│   │   ├── useTrackBiasViewed.ts # Analytics tracking
│   │   ├── useWeeklyReview.ts # Weekly review calculations
│   │   ├── use-mobile.tsx # Mobile detection hook
│   │   └── use-toast.ts # Toast notification hook
│   ├── lib/                # Utility libraries and core logic
│   │   ├── analytics.ts    # GA4 integration
│   │   ├── biasRotation.ts # Daily bias selection algorithm
│   │   ├── safeStorage.ts  # localStorage wrapper with fallbacks
│   │   ├── reflectionStorage.ts # Reflection persistence
│   │   ├── ttsPlatform.ts  # Platform-specific TTS helpers
│   │   ├── weeklyReview.ts # Weekly review calculations
│   │   ├── dates.ts        # Date utilities (timezone-safe)
│   │   ├── sentences.ts    # Sentence splitting for TTS highlighting
│   │   ├── share.ts        # Share functionality
│   │   └── utils.ts        # General utilities
│   ├── data/               # Static data
│   │   ├── biases.ts       # 60 cognitive bias definitions
│   │   └── reflectionPrompts.ts # Reflection question bank
│   ├── pages/              # Route components
│   │   ├── TodayPage.tsx   # Main daily view
│   │   ├── BiasPage.tsx    # Individual bias detail
│   │   ├── BiasesArchive.tsx # Browse all biases
│   │   ├── QuizPage.tsx    # Daily quiz
│   │   ├── WeeklyReviewPage.tsx # 7-day review
│   │   ├── SavedPage.tsx   # Bookmarked biases
│   │   ├── SettingsPage.tsx # App settings
│   │   └── AboutPage.tsx   # About page
│   ├── types/              # TypeScript type definitions
│   │   ├── biasProgress.ts # Rotation state types
│   │   ├── reflection.ts   # Reflection storage types
│   │   └── biasFeedback.ts # Feedback types
│   ├── test/               # Unit tests
│   ├── App.tsx             # Root component with routing
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── e2e/                    # Playwright E2E tests
├── scripts/                # Build/utility scripts
└── package.json            # Dependencies and scripts
```

---

## Routing Architecture

### Technology
- **React Router DOM v6** with `<BrowserRouter>`
- Client-side routing for SPA behavior
- Future v7 transitions enabled

### Route Structure
```typescript
/               → TodayPage (default)
/today          → TodayPage
/welcome        → Index (landing/onboarding)
/bias/:id       → BiasPage (individual bias detail)
/biases         → BiasesArchive (browse all biases)
/quiz           → QuizPage (daily quiz)
/weekly-review  → WeeklyReviewPage (7-day summary)
/saved          → SavedPage (bookmarked biases)
/settings       → SettingsPage (app configuration)
/about          → AboutPage (information)
*               → NotFound (404)
```

### Key Features
- **Animated Routes:** Uses `PageTransition` component for smooth transitions
- **Analytics Tracking:** `AnalyticsRouteTracker` sends GA4 page_view events on route changes
- **Mobile Navigation:** `MobileNav` component provides bottom navigation on mobile devices
- **Route Parameters:** Dynamic routes for bias details (`/bias/:id`)
- **SEO Optimization:** Dynamic SEO meta tags and structured data on all pages
- **Accessibility:** Semantic HTML with `id="main-content"` landmarks and ARIA labels

### Route Guards
No authentication guards (app is fully public). All routes are accessible to all users.

---

## State Management

### Architecture Pattern
**Custom Hooks Pattern** - No global state management library (Redux, Zustand, etc.). State is managed through:
1. **React Hooks** (`useState`, `useEffect`, `useCallback`, `useMemo`)
2. **Custom Hooks** that encapsulate business logic
3. **localStorage** for persistence with event-based synchronization

### Key State Management Hooks

#### useBiasProgress
Manages the learning cycle rotation state:
- **State Source:** localStorage (`debiasdaily.rotation.v2`)
- **Events:** Listens to `bias-rotation-changed` custom event
- **State Schema:**
  ```typescript
  {
    lastSeenDate: string;        // YYYY-MM-DD
    lastSeenIndex: number;       // Index in bias array
    lastSeenBiasId: string;      // Bias identifier
    cycle: number;               // Current cycle (1 = first pass)
    seenBiasIds: string[];       // Unique biases seen this cycle
    activeDays: string[];        // Calendar dates with visits
    completedCycles: number[];   // Fully completed cycles
    milestoneDismissedCycle: number; // Last dismissed completion
    phase: "foundation";         // Learning phase
  }
  ```

#### useBookmarks
Manages user bookmarked biases:
- **State Source:** localStorage (`debiasdaily.bookmarks.v1`)
- **Events:** Custom event listeners + Storage API events
- **Operations:** `toggleBookmark`, `removeBookmark`, `isBookmarked`

#### useStreak
Tracks daily visit streaks:
- **State Source:** localStorage (`debiasdaily.streak.v1`)
- **Logic:** Increment on consecutive days, reset on gaps
- **Events:** `streak-changed` custom event

#### useReflection
Manages reflection text for biases:
- **State Source:** localStorage (`debiasdaily.reflections.v1`)
- **Key Format:** `${cycle}:${biasId}` for storage
- **Events:** `reflection-changed` custom event

#### useTTS
Controls text-to-speech playback:
- **State Source:** React component state (no persistence)
- **Complex State:** Playback queue, active section, character index
- **Platform:** Uses Web Speech API with platform-specific workarounds

### Synchronization Pattern
All localStorage-based hooks use a consistent pattern:
1. **Initial State:** Load from localStorage on mount
2. **Event Sync:** Listen to custom events for cross-tab sync
3. **Storage Events:** Listen to native Storage API for other tabs
4. **Write Operations:** Dispatch custom events after writes

### No Global State
- Each hook manages its own domain
- Components compose multiple hooks as needed
- No shared state manager or context providers (except React Query)

---

## API Flow

### Architecture: No External APIs
DebiasDaily is a **client-side only application** with no backend API calls. All data is:
1. **Static content** embedded in the codebase (`src/data/biases.ts`)
2. **User-generated data** stored in localStorage
3. **Analytics** sent to Google Analytics 4 (build-time configuration)

### Data Flow Patterns

#### Static Data (Bias Content)
```typescript
// Data is imported directly, no API calls
import { getAllBiases, resolveTodaysBias } from "@/data/biases";

// Bias rotation is computed client-side
const { bias, state } = resolveTodaysBias();
```

#### User Progress Data
```typescript
// Read from localStorage via safe wrapper
const state = loadRotationState();

// Write with event dispatching for sync
saveRotationState(newState);

// Custom event triggers UI updates
window.dispatchEvent(new Event(ROTATION_CHANGED_EVENT));
```

#### Analytics Events
```typescript
// Analytics are fire-and-forget, no response handling
trackBiasViewed({ bias_id: bias.id, bias_title: bias.title, category: bias.category });

// Implemented via Google Analytics gtag.js
window.gtag("event", "bias_viewed", params);
```

### External Services

#### Google Analytics 4
- **Integration:** Build-time configuration via `VITE_GA_MEASUREMENT_ID`
- **Implementation:** Direct gtag.js loading in `analytics.ts`
- **Events:** Anonymous page views and user interactions
- **No Response Handling:** Analytics are fire-and-forget

#### No Authentication APIs
- No user accounts or authentication
- No OAuth or social login
- All data is local to the user's browser

### Data Fetching Strategy
**No data fetching** - All data is either:
1. **Bundled with the application** (bias definitions, reflection prompts)
2. **Stored locally** (user progress, bookmarks, reflections)
3. **Sent to analytics** (anonymous usage events)

---

## TTS (Text-to-Speech) Architecture

### Technology Stack
- **Web Speech API** (`window.speechSynthesis`)
- **Platform-specific workarounds** for mobile/desktop differences
- **Custom queue management** for multi-section playback

### Core Hook: useTTS

#### State Management
```typescript
type TTSState = "idle" | "playing" | "paused";

interface TTSControls {
  state: TTSState;
  activeSection: string | null;      // Currently playing section ID
  activeCharIndex: number;           // Character position for highlighting
  queueProgress: number;             // 0-1 progress through queue
  isQueue: boolean;                 // Whether playing queue or single section
  play: (text: string, sectionId: string) => void;
  playAll: (sections: QueueItem[]) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}
```

#### Key Features

##### Voice Selection
- **Best Voice Algorithm:** Prioritizes English voices, prefers natural-sounding voices
- **Async Loading:** Waits for `voiceschanged` event on mobile
- **User Preferences:** Stores selected voice in localStorage

##### Platform Handling
```typescript
// Mobile vs Desktop detection
isIOSSafari(): boolean      // iOS device detection (including iPadOS 13+)
isMobileBrowser(): boolean  // General mobile detection
shouldUseKeepAlive(): boolean // Chrome desktop workaround
```

##### Chrome Desktop Keep-Alive
- **Problem:** Chrome pauses speech after ~15 seconds
- **Solution:** Periodic `pause()`/`resume()` every 10 seconds
- **Platform:** Desktop Chrome only (disabled on mobile)

##### iOS/Mobile Handling
- **Problem:** Mobile browsers have unreliable speech synthesis
- **Solution:** 
  - Voice loading waits for `voiceschanged` event
  - Shorter text segments to avoid interruption
  - Synchronous `speak()` call (no setTimeout) for iOS gesture requirements

##### Queue Management
```typescript
interface QueueItem {
  id: string;
  text: string;
  spokenPrefix?: string;  // Optional prefix to strip from charIndex
}
```
- Sequential playback of multiple sections
- Progress tracking across queue
- Automatic advancement to next section

##### Sentence Highlighting
```typescript
// Real-time character position tracking
utterance.onboundary = (e) => {
  setActiveCharIndex(e.charIndex - charIndexOffset);
};

// Sentence splitting for highlighting
splitSentences(text); // Returns character ranges
```

### Settings Storage
```typescript
// Stored in localStorage via useTTSSettings hook
VOICE_KEY: "debiasdaily.tts.voice.v1"
RATE_KEY: "debiasdaily.tts.rate.v1" 
VOLUME_KEY: "debiasdaily.tts.volume.v1"
```

### Error Handling
- **Expected Errors:** `interrupted`, `canceled` (silently ignored)
- **Real Errors:** Network, voice unavailable (shown as toast)
- **Fallback:** Graceful degradation when TTS unsupported

### Integration Points
- **BiasCard:** Section-level playback controls
- **ListenControls:** Global playback controls
- **VoiceSpeedSelector:** Rate adjustment UI

---

## Analytics Architecture

### Technology: Google Analytics 4 (GA4)

### Implementation
```typescript
// Build-time configuration
const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

// Direct gtag.js loading (no React SDK)
script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
```

### Event Tracking Flow

#### Initialization
```typescript
// main.tsx - Called once at app startup
initAnalytics();

// Loads gtag.js and configures GA4
window.gtag("js", new Date());
window.gtag("config", measurementId, { send_page_view: false });
```

#### Page View Tracking
```typescript
// AnalyticsRouteTracker component - On every route change
useEffect(() => {
  trackPageView(location.pathname, location.search);
}, [location.pathname, location.search]);
```

#### Custom Events
```typescript
// Specific interaction tracking
trackBiasViewed({ bias_id, bias_title, category });
trackBiasBookmarked({ bias_id });
trackQuizCompleted({ bias_id, score, total_questions });
trackCycleCompleted({ cycle_number });
// ... etc
```

### Event Schema
All events follow GA4 convention:
```typescript
sendEvent(eventName: string, params?: Record<string, string | number | boolean>);
```

### Tracked Events

| Event Name | Parameters | When Tracked |
|-----------|-----------|--------------|
| `page_view` | `page_title`, `page_path`, `page_location` | Route change |
| `bias_viewed` | `bias_id`, `bias_title`, `category` | Today/Bias page load |
| `quiz_completed` | `bias_id`, `score`, `total_questions` | Quiz completion |
| `bias_bookmarked` | `bias_id` | Bookmark added |
| `bias_unbookmarked` | `bias_id` | Bookmark removed |
| `reflection_saved` | `bias_id` | First reflection save |
| `cycle_completed` | `cycle_number` | 60 biases viewed |
| `weekly_review_opened` | (none) | Weekly review page opened |
| `bias_shared` | `bias_id`, `bias_title`, `category`, `share_method` | Share action |
| `bias_feedback_submitted` | `bias_id`, `useful` | Feedback form submit |

### Privacy Approach
- **Anonymous Only:** No user IDs, emails, or personal data
- **No Reflection Content:** Analytics events don't include reflection text
- **Opt-out:** Disabled when `VITE_GA_MEASUREMENT_ID` is empty
- **Build-time:** Measurement ID baked in at build time (no runtime config)

### Limitations
- **SPA Tracking:** Page views require client-side tracking (implemented)
- **Ad Blockers:** May prevent events in some browsers
- **Configuration Changes:** New measurement ID requires rebuild

---

## Authentication Flow

### No Authentication System
DebiasDaily is designed as a **privacy-first, local-only application** with no user authentication:

#### Design Philosophy
- **Zero Account Requirement:** Users can use all features without signing up
- **Local Data Only:** All user data stays on their device
- **No Personal Data Collection:** No emails, names, or identifiers
- **No Sync:** No cloud sync or cross-device synchronization

#### Implications
- **No Login/Signup Pages:** No authentication UI
- **No Password Management:** No credentials to handle
- **No Session Management:** No tokens or sessions
- **No User Profiles:** No user account data
- **No Permissions:** No role-based access control

#### Alternative Approach: Local Storage
Instead of user accounts, the app uses:
- **localStorage:** All progress stored locally
- **Device-Bound:** Data tied to specific browser/device
- **No Recovery:** Data loss if browser storage cleared
- **No Collaboration:** No sharing of progress between users

#### Future Authentication Considerations
If authentication were added, it would likely be for:
- **Cross-device sync:** Optional cloud backup
- **Progress recovery:** Restore progress after data loss
- **Social Features:** Share progress with friends (optional)

However, the current architecture deliberately avoids authentication to maintain simplicity and privacy.

---

## Data Fetching Strategy

### No Network Data Fetching
DebiasDaily uses a **zero-fetch architecture** for data:

#### Static Data (Embedded)
```typescript
// All bias content is bundled with the app
const biases: CognitiveBias[] = [
  { id: "confirmation-bias", title: "Confirmation Bias", ... },
  { id: "anchoring-bias", title: "Anchoring Bias", ... },
  // ... 60 total biases
];
```

#### Benefits
- **Instant Loading:** No network latency for content
- **Offline Capability:** Works without internet connection
- **Predictable Performance:** No API rate limits or downtime
- **Simple Deployment:** No backend infrastructure needed

#### Trade-offs
- **Update Cycle:** Content updates require app rebuild
- **Storage Size:** All content bundled in initial download
- **Dynamic Content:** Limited ability for personalized content

#### Alternative Approaches Not Used
- **No API Calls:** No fetch/axios for content
- **No GraphQL:** No query language for data
- **No React Query:** Only used for potential future API integration
- **No Server-Side Rendering:** Static client-side app

### React Query Integration
While not currently used for data fetching, React Query is included:
```typescript
// App.tsx - QueryClientProvider setup
<QueryClientProvider client={queryClient}>
  {/* App content */}
</QueryClientProvider>
```

**Purpose:** Future-proofing for potential API features (optional sync, etc.)

### Local Data Access Patterns

#### Direct Imports
```typescript
// Static data imported directly
import { getAllBiases } from "@/data/biases";
const biases = getAllBiases();
```

#### localStorage Access
```typescript
// User data via safe storage wrapper
import { safeStorage } from "@/lib/safeStorage";
const data = safeStorage.getItem(STORAGE_KEY);
```

#### Computed Data
```typescript
// Derived from stored state
const { bias, state } = resolveTodaysBias();
const review = buildWeeklyReview();
```

### Performance Considerations
- **Bundle Size:** 60 bias definitions add to initial bundle
- **Tree Shaking:** Unused code eliminated by Vite
- **Code Splitting:** Route-based splitting available if needed
- **Caching:** Service worker could be added for offline support

---

## SEO Architecture

### Technology: Dynamic Client-Side SEO

### Implementation
```typescript
// SEO component - Dynamic meta tag updates
<SEO
  title="Today's Cognitive Bias"
  description="Learn about Confirmation Bias today."
/>

// StructuredData component - JSON-LD schemas
<StructuredData type="website" />
<StructuredData type="organization" />
<StructuredData type="article" data={{ title, description }} />
<StructuredData type="breadcrumb" data={{ items: [...] }} />
```

### SEO Features
- **Dynamic Page Titles:** Unique titles per route (Today, Bias Detail, Quiz, etc.)
- **Dynamic Meta Descriptions:** Meaningful descriptions for each page
- **Dynamic Canonical URLs:** Proper canonical tags for all pages
- **Open Graph Tags:** og:title, og:description, og:url, og:image with dimensions
- **Twitter Cards:** twitter:card, twitter:title, twitter:description, twitter:image
- **Structured Data:** JSON-LD schemas for Website, Organization, Article, Breadcrumb
- **Sitemap.xml:** Comprehensive sitemap with all routes and bias pages
- **Robots.txt:** Allows crawling with sitemap reference

### Implementation Pattern
```typescript
// SEO component uses DOM manipulation in useEffect
useEffect(() => {
  document.title = fullTitle;
  // Update meta tags dynamically
  // Update canonical URL
  // Update Open Graph and Twitter tags
}, [fullTitle, fullDescription, canonicalUrl]);
```

### Accessibility Enhancements
- **Semantic HTML:** Proper use of `<main>`, `<nav>`, `<header>`, `<footer>`
- **ARIA Labels:** Descriptive labels on interactive elements
- **Landmarks:** `id="main-content"` on main elements for screen readers
- **Focus Management:** Proper focus states and keyboard navigation
- **Resource Hints:** preconnect, dns-prefetch for performance
- **Noscript Content:** Fallback content for JavaScript-disabled browsers

---

## Development Workflow

### Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test              # Unit tests
npm run test:e2e      # End-to-end tests
```

### Environment Configuration

```bash
# Copy .env.example to .env
cp .env.example .env

# Set environment variables
VITE_SITE_URL=https://debiasdaily.com
VITE_GA_MEASUREMENT_ID=G-QMF2Q394SC  # Leave empty to disable analytics locally
```

### Code Style
- **ESLint:** Configured with React and TypeScript rules
- **Prettier:** Code formatting with .prettierrc config
- **TypeScript:** Strict type checking enabled

### Testing Strategy
- **Unit Tests:** Vitest with React Testing Library
- **E2E Tests:** Playwright with visual regression testing
- **Test Location:** `src/test/` for unit, `e2e/` for E2E
- **Coverage:** Aim for high coverage on core logic

### Build Process
- **Vite:** Fast build tool with HMR
- **React Plugin:** @vitejs/plugin-react-swc for fast refresh
- **Production Build:** Optimized and minified output
- **Preview:** `npm run preview` to test production build locally

---

## Key Architectural Decisions

### Why This Architecture?

#### Client-Side Only
- **Simplicity:** No backend infrastructure needed
- **Privacy:** User data never leaves their device
- **Cost:** No server costs or scaling concerns
- **Reliability:** No API dependencies or downtime

#### localStorage for State
- **Persistence:** Survives browser refresh/close
- **Simplicity:** No database setup or migration
- **Performance:** Instant access, no network calls
- **Sufficient:** App doesn't require complex querying

#### Custom Hooks Pattern
- **Co-location:** Logic close to where it's used
- **Composability:** Hooks can be combined as needed
- **Testability:** Individual hooks can be tested in isolation
- **No Boilerplate:** Less overhead than Redux/context

#### Static Content
- **Speed:** Instant loading, no network calls
- **Reliability:** No API failures or rate limits
- **Simplicity:** No CMS or content management needed
- **Control:** Content updates require deliberate code changes

#### Web Speech API for TTS
- **No Dependencies:** Uses built-in browser capabilities
- **Free:** No API costs or usage limits
- **Privacy:** Audio never leaves the device
- **Platform Support:** Works on modern browsers without plugins

---

## Common Tasks

### Adding a New Bias
1. Edit `src/data/biases.ts`
2. Add new bias object to the array
3. Ensure unique `id` and proper categorization
4. Test rotation logic includes new bias

### Adding a New Page
1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add SEO component with title and description
4. Add StructuredData component if needed
5. Add analytics page name in `src/lib/analytics.ts`
6. Update navigation if needed
7. Add to sitemap.xml if public page

### Modifying TTS Behavior
1. Edit `src/hooks/useTTS.ts` for core logic
2. Edit `src/lib/ttsPlatform.ts` for platform specifics
3. Test on multiple browsers/devices
4. Consider mobile vs desktop differences

### Adding New Analytics Events
1. Add event function in `src/lib/analytics.ts`
2. Call from appropriate component/hook
3. Test with GA4 DebugView
4. Document in README analytics section

### Updating Storage Schema
1. Add migration logic in relevant storage file
2. Test with existing user data
3. Consider backward compatibility
4. Update version in storage key

---

## Troubleshooting

### Common Issues

#### localStorage Quota Exceeded
- **Symptom:** Features stop saving data
- **Cause:** Safari private mode or storage quota
- **Solution:** `safeStorage` automatically falls back to memory

#### TTS Not Working
- **Symptom:** No audio playback
- **Cause:** Browser doesn't support Web Speech API
- **Solution:** Graceful degradation, show error message

#### Analytics Not Recording
- **Symptom:** No events in GA4 DebugView
- **Cause:** Missing `VITE_GA_MEASUREMENT_ID` or ad blocker
- **Solution:** Check .env file and disable ad blocker for testing

#### Visual Test Failures
- **Symptom:** Playwright screenshots don't match baseline
- **Cause:** Font rendering or antialiasing differences
- **Solution:** Use GitHub workflow to update baselines on CI

---

## Resources

### Internal Documentation
- **README.md:** Project overview and deployment
- **Components:** Individual component documentation
- **Hooks:** Custom hook documentation inline
- **Types:** TypeScript definitions in `src/types/`

### External Dependencies
- **React Router:** https://reactrouter.com/
- **Radix UI:** https://www.radix-ui.com/
- **Tailwind CSS:** https://tailwindcss.com/
- **Vite:** https://vitejs.dev/
- **Playwright:** https://playwright.dev/

### Development Tools
- **React DevTools:** Browser extension for React debugging
- **Google Analytics Debugger:** Chrome extension for analytics testing
- **Playwright Inspector:** E2E test debugging

---

## Next Steps for New Developers

1. **Set up environment:** Install dependencies and configure .env
2. **Run the app:** Start dev server and explore all pages
3. **Read the code:** Start with `TodayPage.tsx` and follow imports
4. **Make a small change:** Try adding a console.log or modifying UI
5. **Write a test:** Add a unit test for a hook or utility
6. **Understand the data flow:** Trace how biases are selected and displayed
7. **Explore TTS:** Test audio features on different browsers
8. **Check analytics:** Verify events in GA4 DebugView

Welcome to DebiasDaily! 🧠