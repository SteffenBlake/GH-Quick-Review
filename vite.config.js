import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import cspPlugin from './vite-plugin-csp.js';

export default defineConfig({
  plugins: [preact(), cspPlugin()],
  base: '/GH-Quick-Review/',
  test: {
    globals: true,
    environment: 'jsdom',
    exclude: ['**/node_modules/**', '**/playwright/**'],
  },
});
