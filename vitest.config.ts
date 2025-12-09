import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.next', 'out', 'android', 'ios', 'tests/e2e/**', 'tests/android/**'],
    testTimeout: 20000, // 20 seconds for integration tests (some settings tests need more time)
    pool: 'vmThreads',
    // Note: poolOptions is not in the type definition but is supported at runtime
    // Using type assertion to avoid type error while maintaining functionality
    ...({
      poolOptions: {
        vmThreads: {
          singleThread: false,
        },
      },
    } as { poolOptions?: { vmThreads?: { singleThread?: boolean } } }),
    sequence: {
      concurrent: false, // Run tests sequentially to avoid IndexedDB conflicts
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        '**/*.config.*',
        '**/types.ts',
        '**/*.d.ts',
        '**/coverage/**',
        '**/.next/**',
        '**/out/**',
        '**/android/**',
        '**/ios/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})

