declare module 'jest-axe' {
  // AxeResults type from axe-core
  export interface AxeResults {
    violations: Array<{
      id: string
      nodes: Array<{
        html?: string
        [key: string]: any
      }>
      [key: string]: any
    }>
    [key: string]: any
  }
  
  interface MatcherResult {
    message: () => string
    pass: boolean
  }
  
  export function toHaveNoViolations(received: AxeResults): MatcherResult
  
  export function axe(container: Element | Document): Promise<AxeResults>
}

// Extend Vitest's expect types
declare module 'vitest' {
  interface Assertion<T = any> {
    toHaveNoViolations(): T
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void
  }
}

