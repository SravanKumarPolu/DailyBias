# Bias Daily

Learn one cognitive bias every day from Elon Musk's list of 50 biases. Available as a web app and native mobile apps for Android and iOS.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- pnpm (package manager)
- For Android: Android Studio
- For iOS: macOS with Xcode

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

## 📱 Native App Development

### Android

```bash
# Build and sync to Android
pnpm android:sync

# Open in Android Studio
pnpm android:open

# Run on device/emulator
pnpm android:run

# Full workflow (build, sync, open)
pnpm android:build
```

### iOS

```bash
# First time: Add iOS platform
npx cap add ios

# Build and sync to iOS
pnpm ios:sync

# Open in Xcode
pnpm ios:open

# Run on device/simulator
pnpm ios:run

# Full workflow (build, sync, open)
pnpm ios:build
```

## 🛠️ Available Scripts

### Development
- `pnpm dev` - Start development server
- `pnpm build` - Production build
- `pnpm start` - Start production server
- `pnpm lint` - Run linter
- `pnpm type-check` - TypeScript type checking
- `pnpm test` - Run tests

### Maintenance
- `pnpm clean` - Remove build artifacts (.next, out)
- `pnpm clean:build` - Clean and rebuild
- `pnpm format` - Format code with Prettier
- `pnpm validate` - Run type-check, lint, and tests
- `pnpm diagnostics` - Run system diagnostics (troubleshooting)

### Native Apps
- `pnpm android:sync` - Build and sync to Android
- `pnpm android:open` - Open Android Studio
- `pnpm android:run` - Run on Android device
- `pnpm ios:sync` - Build and sync to iOS
- `pnpm ios:open` - Open Xcode
- `pnpm ios:run` - Run on iOS device

## 📁 Project Structure

```
├── app/              # Next.js app directory (pages)
├── components/       # React components
├── lib/              # Utilities and helpers
├── hooks/            # Custom React hooks
├── contexts/         # React contexts
├── data/             # Static data (biases.json)
├── public/           # Static assets
├── android/          # Android native project
├── capacitor.config.ts # Capacitor configuration
└── next.config.mjs   # Next.js configuration
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file for local development:

```env
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://debiasdaily.com
NEXT_PUBLIC_SITE_NAME=Bias Daily
NEXT_PUBLIC_TWITTER_HANDLE=@debiasdaily

# EmailJS (optional - for feedback emails)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
```

### Capacitor Configuration

Edit `capacitor.config.ts` to customize:
- App ID (`com.dailybias.app`)
- App name (`Bias Daily`)
- Splash screen settings
- Platform-specific options

## 🐛 Troubleshooting

**Quick diagnostics:**
```bash
pnpm diagnostics
```

For detailed help, see:
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues and solutions
- [SUPPORT.md](./SUPPORT.md) - Getting help
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick command reference

## 📚 Documentation

- [Android Publishing Guide](./ANDROID_PUBLISH_GUIDE.md) - How to publish to Play Store
- [Troubleshooting Guide](./TROUBLESHOOTING.md) - Common issues and fixes
- [Support Guide](./SUPPORT.md) - Getting help and reporting issues
- [Cleanup Summary](./CLEANUP_COMPLETE.md) - Recent cleanup changes

## 🚢 Deployment

### Web (Netlify)

```bash
# Build
pnpm build

# Deploy
netlify deploy --prod
```

### Android (Play Store)

1. Follow [ANDROID_PUBLISH_GUIDE.md](./ANDROID_PUBLISH_GUIDE.md)
2. Build release bundle in Android Studio
3. Upload to Google Play Console

### iOS (App Store)

1. Add iOS platform: `npx cap add ios`
2. Build and sync: `pnpm ios:sync`
3. Open in Xcode: `pnpm ios:open`
4. Archive and upload to App Store Connect

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage
```

## 📝 Code Quality

```bash
# Format code
pnpm format

# Check formatting
pnpm format:check

# Run linter
pnpm lint

# Fix linting issues
pnpm lint:fix

# Type check
pnpm type-check

# Run all checks
pnpm validate
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `pnpm validate` to ensure quality
5. Submit a pull request

## 📄 License

Private project - All rights reserved

## 🆘 Support

For issues, questions, or contributions:
- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) first
- See [SUPPORT.md](./SUPPORT.md) for support options
- Review existing documentation in `/docs` folder

---

**Built with:**
- Next.js 15
- React 19
- TypeScript
- Capacitor
- Tailwind CSS
- Radix UI

