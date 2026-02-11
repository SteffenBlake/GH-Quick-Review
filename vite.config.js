/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { defineConfig, loadEnv } from 'vite';
import preact from '@preact/preset-vite';
import cspPlugin from './vite-plugin-csp.js';

export default defineConfig(({ mode }) => {
  // Load env file based on mode (.env.test for test mode)
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [preact(), cspPlugin()],
    base: '/GH-Quick-Review/',
    test: {
      globals: true,
      environment: 'jsdom',
      exclude: ['**/node_modules/**', '**/playwright/**'],
    },
    define: {
      // Make env variables available to the app
      // Default to localhost:3000 for development with mock server
      'import.meta.env.VITE_GITHUB_API_URL': JSON.stringify(
        env.VITE_GITHUB_API_URL || 'http://localhost:3000'
      ),
    },
  };
});
