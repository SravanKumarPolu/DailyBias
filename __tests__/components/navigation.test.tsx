import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Navigation } from '@/components/navigation'

// Mock Next.js navigation
let mockPathname = '/'

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}))

describe('Navigation', () => {
  beforeEach(() => {
    mockPathname = '/'
    vi.clearAllMocks()
  })

  it('should render all 6 navigation items', () => {
    render(<Navigation />)
    
    expect(screen.getByLabelText('Daily page')).toBeInTheDocument()
    expect(screen.getByLabelText('All page')).toBeInTheDocument()
    expect(screen.getByLabelText('Favorites page')).toBeInTheDocument()
    expect(screen.getByLabelText('Add page')).toBeInTheDocument()
    expect(screen.getByLabelText('Analytics page')).toBeInTheDocument()
    expect(screen.getByLabelText('Settings page')).toBeInTheDocument()
  })

  it('should render navigation labels', () => {
    render(<Navigation />)
    
    expect(screen.getByText('Daily')).toBeInTheDocument()
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Favorites')).toBeInTheDocument()
    expect(screen.getByText('Add')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('should mark active route when on home page', () => {
    mockPathname = '/'
    render(<Navigation />)
    
    const dailyLink = screen.getByLabelText('Daily page')
    expect(dailyLink).toHaveAttribute('aria-current', 'page')
  })

  it('should mark active route when on all page', () => {
    mockPathname = '/all'
    render(<Navigation />)
    
    const allLink = screen.getByLabelText('All page')
    expect(allLink).toHaveAttribute('aria-current', 'page')
  })

  it('should mark active route when on favorites page', () => {
    mockPathname = '/favorites'
    render(<Navigation />)
    
    const favoritesLink = screen.getByLabelText('Favorites page')
    expect(favoritesLink).toHaveAttribute('aria-current', 'page')
  })

  it('should mark active route when on add page', () => {
    mockPathname = '/add'
    render(<Navigation />)
    
    const addLink = screen.getByLabelText('Add page')
    expect(addLink).toHaveAttribute('aria-current', 'page')
  })

  it('should mark active route when on analytics page', () => {
    mockPathname = '/analytics'
    render(<Navigation />)
    
    const analyticsLink = screen.getByLabelText('Analytics page')
    expect(analyticsLink).toHaveAttribute('aria-current', 'page')
  })

  it('should mark active route when on settings page', () => {
    mockPathname = '/settings'
    render(<Navigation />)
    
    const settingsLink = screen.getByLabelText('Settings page')
    expect(settingsLink).toHaveAttribute('aria-current', 'page')
  })

  it('should not mark inactive routes', () => {
    mockPathname = '/'
    render(<Navigation />)
    
    const allLink = screen.getByLabelText('All page')
    const favoritesLink = screen.getByLabelText('Favorites page')
    
    expect(allLink).not.toHaveAttribute('aria-current', 'page')
    expect(favoritesLink).not.toHaveAttribute('aria-current', 'page')
  })

  it('should have correct href attributes for all links', () => {
    render(<Navigation />)
    
    expect(screen.getByLabelText('Daily page')).toHaveAttribute('href', '/')
    expect(screen.getByLabelText('All page')).toHaveAttribute('href', '/all')
    expect(screen.getByLabelText('Favorites page')).toHaveAttribute('href', '/favorites')
    expect(screen.getByLabelText('Add page')).toHaveAttribute('href', '/add')
    expect(screen.getByLabelText('Analytics page')).toHaveAttribute('href', '/analytics')
    expect(screen.getByLabelText('Settings page')).toHaveAttribute('href', '/settings')
  })

  it('should render navigation with proper accessibility attributes', () => {
    render(<Navigation />)
    
    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    expect(nav).toBeInTheDocument()
  })
})

