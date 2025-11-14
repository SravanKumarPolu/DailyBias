import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '@/hooks/use-debounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 300))
    expect(result.current).toBe('test')
  })

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      {
        initialProps: { value: 'initial' },
      }
    )

    expect(result.current).toBe('initial')

    act(() => {
      rerender({ value: 'updated' })
    })
    expect(result.current).toBe('initial') // Still initial

    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(result.current).toBe('updated')
  })

  it('should cancel previous timeout on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      {
        initialProps: { value: 'first' },
      }
    )

    act(() => {
      rerender({ value: 'second' })
    })
    vi.advanceTimersByTime(150)
    
    act(() => {
      rerender({ value: 'third' })
    })
    vi.advanceTimersByTime(150)
    
    expect(result.current).toBe('first') // Should still be first

    act(() => {
      vi.advanceTimersByTime(150)
    })
    expect(result.current).toBe('third')
  })

  it('should respect custom delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: 'initial' },
      }
    )

    act(() => {
      rerender({ value: 'updated' })
    })
    vi.advanceTimersByTime(300)
    expect(result.current).toBe('initial')

    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(result.current).toBe('updated')
  })
})

