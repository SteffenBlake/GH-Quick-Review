/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

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
