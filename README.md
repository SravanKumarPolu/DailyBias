# Bias Daily

A beautiful, offline-first PWA that shows you one cognitive bias every day from Elon Musk's list of 50 biases.

## Features

- 📅 **Daily Bias**: Deterministic selection ensures everyone sees the same bias on the same date
- 🎨 **Beautiful UI**: Glassmorphism design with smooth animations
- 📱 **PWA**: Install on any device, works offline
- ⭐ **Favorites**: Save biases for later review
- ➕ **Add Your Own**: Create custom biases
- 🎯 **No Backend**: Everything runs locally using IndexedDB
- 🔒 **Privacy First**: No tracking, no data collection, no servers
- 🌓 **Dark Mode**: Automatic theme switching

## Getting Started

### Development

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

\`\`\`bash
npm run build
npm start
\`\`\`

### Deploy

Deploy to Vercel or Netlify:

\`\`\`bash
# Vercel
vercel

# Netlify
netlify deploy --prod
\`\`\`

## Data Export/Import

All your data (favorites, custom biases, settings) is stored locally. You can export and import your data from the Settings page.

## Privacy

Bias Daily stores all data locally on your device using IndexedDB and localStorage. No data is ever sent to any server. The app works completely offline after the first load.

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- Framer Motion
- IndexedDB (via idb)
- PWA (Service Worker)

## License

MIT
