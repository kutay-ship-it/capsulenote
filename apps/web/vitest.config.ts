import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./__tests__/setup.ts'],
    include: ['**/__tests__/**/*.test.{ts,tsx}', '**/tests/**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '__tests__/',
        '*.config.*',
        'dist/',
        '.next/',
      ],
    },
    testTimeout: 10000, // 10s timeout for tests
    hookTimeout: 10000, // 10s timeout for hooks
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@dearme/prisma': path.resolve(__dirname, '../../packages/prisma'),
    },
  },
})
