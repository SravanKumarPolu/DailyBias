declare module 'jest-axe' {
  import { AxeResults } from 'axe-core'
  
  export function toHaveNoViolations(): {
    message: () => string
    pass: boolean
  }
  
  export function axe(container: Element | Document): Promise<AxeResults>
}

