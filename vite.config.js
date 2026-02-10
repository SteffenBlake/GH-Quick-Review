import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  base: '/GH-Quick-Review/',
  test: {
    globals: true,
    environment: 'jsdom',
    exclude: ['**/node_modules/**', '**/playwright/**'],
  },
});
