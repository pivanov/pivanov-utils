import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'src/**/*.d.ts',
        'vitest.config.ts',
        'rollup.config.js',
        'dist',
        'src/types/**',
        'src/**/*.types.ts',
        'src/**/types.ts',
        'src/tools/r2wc',
      ],
      reportsDirectory: './coverage',
    },
    env: {
      NODE_ENV: 'test',
    },
  },
});
