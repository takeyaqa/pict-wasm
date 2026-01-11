import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'node',
          root: './wasm-test',
          environment: 'node',
        },
      },
    ],
  },
})
