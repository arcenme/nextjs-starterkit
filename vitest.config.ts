import path from 'node:path'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    include: [
      // Integration tests - comprehensive coverage for all features
      'src/__tests__/integration/**/*.test.ts*',
      // Unit tests - only business logic (actions, hooks, utilities)
      'src/__tests__/unit/features/**/actions.test.ts',
      'src/__tests__/unit/hooks/**/*.test.ts',
      'src/__tests__/unit/lib/**/*.test.ts',
    ],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'text-summary', 'html', 'json', 'lcov'],
      include: [
        'src/features/**/actions.ts',
        'src/db/**/handler.ts',
        'src/hooks/**',
        'src/lib/**',
      ],
      exclude: [
        'src/lib/auth.ts',
        'src/lib/auth-client.ts',
        'src/lib/safe-action.ts',
        'src/lib/email.ts',
        'src/lib/env.ts',
        'src/lib/env-client.ts',
        '**/types.ts',
        '**/*.d.ts',
        '**/*.config.*',
      ],
    },
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
