import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import OnboardingPage from '@/app/onboarding/page'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

describe('OnboardingPage', () => {
  it('should render welcome message', () => {
    render(<OnboardingPage />)
    expect(screen.getByText(/welcome/i)).toBeInTheDocument()
  })

  it('should render next button', () => {
    render(<OnboardingPage />)
    const nextButton = screen.getByText(/next/i)
    expect(nextButton).toBeInTheDocument()
  })

  it('should render skip button', () => {
    render(<OnboardingPage />)
    const skipButton = screen.getByText(/skip/i)
    expect(skipButton).toBeInTheDocument()
  })
})

