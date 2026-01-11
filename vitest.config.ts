import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  test: {
    projects: [
      // Intentionally run the same WASM test suite in all environments:
      // - Node.js, to validate the WASM behavior in a server/runtime context.
      // - Chromium / Firefox / WebKit, to catch browser-specific differences.
      // This duplication increases CI time but is required for full cross-runtime coverage.
      {
        test: {
          name: 'node',
          include: ['./wasm-test/**/*.spec.ts'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'browser',
          include: ['./wasm-test/**/*.spec.ts'],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [
              { browser: 'chromium' },
              { browser: 'firefox' },
              { browser: 'webkit' },
            ],
          },
        },
      },
    ],
  },
})
