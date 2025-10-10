# Contributing to Bias Daily 🧠

Thank you for your interest in contributing to Bias Daily! This document provides guidelines and information for contributors.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Contribution Guidelines](#contribution-guidelines)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Style Guide](#style-guide)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

---

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive experience for everyone. We expect all contributors to:

- Be respectful and considerate
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discrimination of any kind
- Trolling, insulting, or derogatory comments
- Publishing others' private information
- Any conduct that could be considered inappropriate

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20 or higher
- **pnpm**: v10 or higher (recommended)
- **Git**: Latest version

### Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/DailyBias.git
cd DailyBias

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/DailyBias.git
```

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Open http://localhost:3000
```

### Verify Setup

```bash
# Check TypeScript
pnpm type-check

# Run linter
pnpm lint

# Run tests (once implemented)
pnpm test
```

---

## 💻 Development Process

### 1. Create a Branch

```bash
# Update your fork
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Changes

- Write clean, readable code
- Follow the existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Type check
pnpm type-check

# Lint
pnpm lint

# Test (once tests are implemented)
pnpm test

# Build
pnpm build
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add new feature"
# See commit guidelines below
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
# Then create a Pull Request on GitHub
```

---

## 📝 Contribution Guidelines

### What We're Looking For

#### High Priority 🔴

- **Tests**: Unit tests, integration tests, E2E tests
- **Accessibility**: WCAG 2.1 AA compliance improvements
- **Security**: Input validation, XSS prevention, CSP improvements
- **Performance**: Bundle size reduction, lazy loading
- **Bug fixes**: Any reported issues

#### Medium Priority 🟡

- **Documentation**: Improvements to README, code comments
- **UI/UX**: Design improvements, animations, interactions
- **Features**: New educational features (quizzes, flashcards, etc.)
- **Localization**: Translations (i18n setup needed first)

#### Low Priority 🟢

- **Code refactoring**: Improving existing code structure
- **Optimization**: Minor performance improvements
- **Content**: Adding more cognitive biases

### What We're NOT Looking For

- ❌ Breaking changes without discussion
- ❌ Dependencies that aren't free/open source
- ❌ Backend services (this is an offline-first app)
- ❌ User tracking or analytics
- ❌ Advertisements or monetization
- ❌ Major framework changes without RFC

---

## 📁 Project Structure

```
DailyBias/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Home page (daily bias)
│   ├── all/               # Browse all biases
│   ├── favorites/         # User's favorites
│   ├── add/               # Add custom bias
│   ├── settings/          # App settings
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── bias-card.tsx     # Bias display component
│   ├── navigation.tsx    # Bottom navigation
│   └── ...
├── hooks/                 # Custom React hooks
│   ├── use-biases.ts     # Bias management
│   ├── use-favorites.ts  # Favorites management
│   ├── use-progress.ts   # Progress tracking
│   └── ...
├── lib/                   # Utility functions
│   ├── db.ts             # IndexedDB operations
│   ├── types.ts          # TypeScript types
│   ├── validation.ts     # Input validation
│   └── ...
├── contexts/              # React contexts
│   └── app-context.tsx   # Global app state
├── data/                  # Static data
│   └── biases.json       # Core cognitive biases
└── public/                # Static assets
```

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage

# UI mode
pnpm test:ui
```

### Writing Tests

#### Unit Tests

```typescript
// __tests__/lib/validation.test.ts
import { describe, it, expect } from "vitest"
import { sanitizeText } from "@/lib/validation"

describe("sanitizeText", () => {
  it("should remove HTML tags", () => {
    const input = '<script>alert("xss")</script>Hello'
    const result = sanitizeText(input)
    expect(result).toBe("Hello")
  })

  it("should limit text length", () => {
    const input = "a".repeat(2000)
    const result = sanitizeText(input, 100)
    expect(result.length).toBe(100)
  })
})
```

#### Component Tests

```typescript
// __tests__/components/bias-card.test.tsx
import { render, screen } from '@testing-library/react'
import { BiasCard } from '@/components/bias-card'

describe('BiasCard', () => {
  it('renders bias title', () => {
    const bias = {
      id: 'test',
      title: 'Test Bias',
      category: 'decision',
      summary: 'Test summary',
      why: 'Why it happens',
      counter: 'How to counter',
      source: 'core',
    }

    render(<BiasCard bias={bias} />)
    expect(screen.getByText('Test Bias')).toBeInTheDocument()
  })
})
```

### Test Coverage Goals

- **Minimum**: 60% overall coverage
- **Critical paths**: 80% coverage
- **New features**: Must include tests

---

## 🎨 Style Guide

### TypeScript

```typescript
// ✅ Good: Proper types
interface Bias {
  id: string
  title: string
  category: BiasCategory
}

// ❌ Bad: Using 'any'
const data: any = {}

// ✅ Good: Descriptive names
const getUserBiases = () => {}

// ❌ Bad: Unclear names
const getData = () => {}
```

### React Components

```typescript
// ✅ Good: Functional component with proper typing
interface CardProps {
  title: string
  onClick: () => void
}

export function Card({ title, onClick }: CardProps) {
  return <button onClick={onClick}>{title}</button>
}

// ❌ Bad: No types, unclear props
export function Card({ data }) {
  return <button>{data}</button>
}
```

### File Naming

- **Components**: `kebab-case.tsx` (e.g., `bias-card.tsx`)
- **Hooks**: `use-feature-name.ts` (e.g., `use-biases.ts`)
- **Utils**: `kebab-case.ts` (e.g., `daily-selector.ts`)
- **Types**: `types.ts` or co-located with component

### Code Style

- **Indentation**: 2 spaces
- **Quotes**: Double quotes for strings
- **Semicolons**: Optional (we don't use them)
- **Line length**: 100 characters max
- **Trailing commas**: Use them

```typescript
// ✅ Good
const items = ["first", "second", "third"]

// ❌ Bad
const items = ["first", "second", "third"]
```

---

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **perf**: Performance improvements

### Examples

```bash
# Feature
git commit -m "feat(biases): add filter by category"

# Bug fix
git commit -m "fix(favorites): resolve duplicate entries"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Multiple lines
git commit -m "feat(progress): add streak tracking

- Add streak calculation logic
- Update UI to display current streak
- Add tests for streak edge cases

Closes #123"
```

### Rules

- Use imperative mood ("add" not "added")
- Don't capitalize first letter
- No period at the end
- Reference issues in footer

---

## 🔄 Pull Request Process

### Before Creating a PR

- [ ] Code follows style guidelines
- [ ] Tests are passing
- [ ] TypeScript types are correct
- [ ] No linting errors
- [ ] Documentation is updated
- [ ] Commits follow guidelines

### Creating a PR

1. **Title**: Use conventional commit format

   ```
   feat(component): add new feature
   ```

2. **Description**: Use this template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

How did you test this?

## Screenshots (if applicable)

Add screenshots for UI changes

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-reviewed my code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Added tests
- [ ] All tests passing
```

### Review Process

1. **Automated checks**: Must pass CI/CD
2. **Code review**: At least one approval required
3. **Testing**: Reviewer tests locally
4. **Feedback**: Address all comments
5. **Merge**: Squash and merge to main

### After Merge

- Delete your branch
- Update your fork
- Close related issues

---

## 🐛 Reporting Bugs

### Before Reporting

- Check if the bug is already reported
- Try to reproduce in incognito/private mode
- Test on latest version
- Gather system information

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**

1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**System Information:**

- OS: [e.g., macOS 14.0]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.0.0]

**Additional context**
Any other information
```

---

## 💡 Feature Requests

### Before Requesting

- Check if feature is already requested
- Consider if it aligns with project goals
- Think about implementation complexity

### Feature Request Template

```markdown
**Is your feature related to a problem?**
Clear description of the problem

**Describe the solution**
What you'd like to happen

**Describe alternatives**
Other solutions you've considered

**Additional context**
Mockups, examples, etc.
```

---

## 🎯 Project Goals

### Core Principles

1. **Privacy First**: No tracking, no backend, no data collection
2. **Offline First**: Must work completely offline
3. **Accessibility**: WCAG 2.1 AA compliance
4. **Performance**: Fast loading, smooth animations
5. **Education**: Focus on learning cognitive biases
6. **Open Source**: Free forever, MIT license

### What Makes Bias Daily Special

- Deterministic daily selection
- Voice commands and text-to-speech
- Progress tracking and gamification
- Beautiful, modern UI
- Complete privacy

---

## 📚 Resources

### Learning

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Tools

- [Vitest](https://vitest.dev) - Testing framework
- [Testing Library](https://testing-library.com) - React testing
- [Radix UI](https://www.radix-ui.com) - Accessible components
- [Framer Motion](https://www.framer.com/motion/) - Animations

### Community

- [GitHub Discussions](https://github.com/OWNER/DailyBias/discussions)
- [Issues](https://github.com/OWNER/DailyBias/issues)
- [Discord](https://discord.gg/...) - If available

---

## 🙏 Recognition

Contributors will be:

- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in About page (if significant contribution)

---

## ❓ Questions?

- **General questions**: GitHub Discussions
- **Bug reports**: GitHub Issues
- **Security issues**: Email security@biasdaily.app
- **Other**: Create a discussion

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Bias Daily! 🚀**

Every contribution, no matter how small, makes a difference in helping people understand cognitive biases better.
