import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  test: {
    projects: [
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
