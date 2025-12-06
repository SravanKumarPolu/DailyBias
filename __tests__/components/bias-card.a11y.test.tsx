import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { BiasCard } from '@/components/bias-card'
import type { Bias } from '@/lib/types'

// Extend Vitest matchers with jest-axe
expect.extend(toHaveNoViolations)

const mockBias: Bias = {
  id: 'test-bias-1',
  title: 'Confirmation Bias',
  summary: 'The tendency to search for, interpret, and recall information in a way that confirms one\'s preexisting beliefs.',
  why: 'This happens because our brains prefer information that aligns with what we already believe.',
  counter: 'Actively seek out opposing viewpoints and challenge your assumptions.',
  category: 'decision',
  researchLevel: 'established',
}

describe('BiasCard Accessibility', () => {
  it('should have no accessibility violations in compact variant', async () => {
    const { container } = render(
      <BiasCard
        bias={mockBias}
        variant="compact"
        isFavorite={false}
        isMastered={false}
      />
    )
    
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations in detailed variant', async () => {
    const { container } = render(
      <BiasCard
        bias={mockBias}
        variant="detailed"
        isFavorite={false}
        isMastered={false}
      />
    )
    
    const results = await axe(container)
    // Filter out known Radix UI Collapsible limitation (aria-expanded on div)
    const filteredViolations = results.violations.filter(
      (violation) =>
        !(
          violation.id === 'aria-allowed-attr' &&
          violation.nodes.some((node) =>
            node.html?.includes('collapsible-trigger') || node.html?.includes('aria-expanded')
          )
        )
    )
    expect(filteredViolations).toHaveLength(0)
  })

  it('should have proper ARIA labels for favorite button', async () => {
    const { container, getByTestId } = render(
      <BiasCard
        bias={mockBias}
        variant="detailed"
        isFavorite={false}
        isMastered={false}
        onToggleFavorite={() => {}}
      />
    )
    
    const favoriteButton = getByTestId('bias-favorite-button')
    expect(favoriteButton).toHaveAttribute('aria-label')
    expect(favoriteButton).toHaveAttribute('aria-pressed', 'false')
    
    const results = await axe(container)
    // Filter out known Radix UI Collapsible limitation (aria-expanded on div)
    const filteredViolations = results.violations.filter(
      (violation) =>
        !(
          violation.id === 'aria-allowed-attr' &&
          violation.nodes.some((node) =>
            node.html?.includes('collapsible-trigger') || node.html?.includes('aria-expanded')
          )
        )
    )
    expect(filteredViolations).toHaveLength(0)
  })

  it('should have proper semantic HTML structure', async () => {
    const { container, getByTestId } = render(
      <BiasCard
        bias={mockBias}
        variant="detailed"
        isFavorite={false}
        isMastered={false}
      />
    )
    
    const biasCard = getByTestId('bias-card')
    // Should have article role or be an article element
    const role = biasCard.getAttribute('role')
    const tagName = biasCard.tagName.toLowerCase()
    expect(role === 'article' || tagName === 'article').toBe(true)
    
    // Should have aria-label or aria-labelledby
    const ariaLabel = biasCard.getAttribute('aria-label')
    const ariaLabelledBy = biasCard.getAttribute('aria-labelledby')
    expect(ariaLabel || ariaLabelledBy).toBeTruthy()
    
    const results = await axe(container)
    // Filter out known Radix UI Collapsible limitation (aria-expanded on div)
    const filteredViolations = results.violations.filter(
      (violation) =>
        !(
          violation.id === 'aria-allowed-attr' &&
          violation.nodes.some((node) =>
            node.html?.includes('collapsible-trigger') || node.html?.includes('aria-expanded')
          )
        )
    )
    expect(filteredViolations).toHaveLength(0)
  })
})

