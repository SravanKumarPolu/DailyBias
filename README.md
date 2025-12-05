# Bias Daily

Learn one cognitive bias every day from Elon Musk's list of 50 biases. A modern web application built with Next.js, React, and TypeScript.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- pnpm (package manager)

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## 🛠️ Available Scripts

### Development
- `pnpm dev` - Start development server
- `pnpm build` - Production build
- `pnpm start` - Start production server (serves `out/` directory)
- `pnpm lint` - Run linter
- `pnpm lint:fix` - Fix linting issues
- `pnpm type-check` - TypeScript type checking
- `pnpm test` - Run tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:ui` - Run tests with UI
- `pnpm test:coverage` - Run tests with coverage

### Maintenance
- `pnpm clean` - Remove build artifacts (.next, out)
- `pnpm clean:build` - Clean and rebuild
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting
- `pnpm validate` - Run type-check, lint, and tests
- `pnpm diagnostics` - Run system diagnostics (troubleshooting)
- `pnpm audit:deps` - Audit dependencies
- `pnpm audit:security` - Security audit

## 📁 Project Structure

```
├── app/              # Next.js app directory (pages)
├── components/       # React components
├── lib/              # Utilities and helpers
├── hooks/            # Custom React hooks
├── contexts/         # React contexts
├── data/             # Static data (biases.json)
├── public/           # Static assets
├── scripts/          # Utility scripts
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

## 🚢 Deployment

### Web (Netlify/Vercel/Static Hosting)

```bash
# Build
pnpm build

# Deploy
# The `out/` directory contains the static files
# Upload to your hosting provider or use:
netlify deploy --prod
```

The app is configured for static export and can be deployed to any static hosting service.

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

## 🐛 Troubleshooting

**Quick diagnostics:**
```bash
pnpm diagnostics
```

For detailed help, see:
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues and solutions
- [SUPPORT.md](./SUPPORT.md) - Getting help

## 📚 Documentation

### Essential Guides
- [Quick Start Guide](./QUICK_START.md) - Get started quickly
- [Troubleshooting Guide](./TROUBLESHOOTING.md) - Common issues and solutions
- [Support Guide](./SUPPORT.md) - Getting help and reporting issues

### Additional Documentation
- [Development Workflow](./DEVELOPMENT_WORKFLOW.md) - Development best practices
- [UI/UX Review](./COMPREHENSIVE_UI_UX_REVIEW_2025.md) - Complete design system review
- [Email Setup](./EMAIL_SETUP.md) - Email feedback configuration
- [Analytics Setup](./ANALYTICS_SETUP.md) - Analytics configuration

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

---

**Built with:**
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Radix UI
