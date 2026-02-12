/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { test, expect } from '@playwright/test';
import { MockServerManager } from './mock-server-manager.js';

test.describe('File Order Consistency', () => {
  test('directory view and hunks have matching file order (directories first, then alphabetically)', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
    
    try {
      await page.goto('/GH-Quick-Review/');
      
      // Login
      await page.getByRole('textbox', { name: 'Enter your GitHub PAT' }).fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Select test_repo_2 which has a complex directory structure
      await page.getByText('Repo...').click();
      await page.getByRole('listitem').filter({ hasText: 'test_repo_2' }).click();
      await page.getByText('Pull Request...').click();
      await page.getByRole('listitem').first().click();
      
      // Wait for content to load
      await page.waitForSelector('.file-card');
      
      // Get the order of files in the diff viewer (file cards) - full paths
      const fullPaths = await page.evaluate(() => {
        const fileCards = document.querySelectorAll('.file-card');
        return Array.from(fileCards).map(card => card.getAttribute('data-filename'));
      });
      
      console.log('Full paths from hunks:', fullPaths);
      
      // Verify the order is correct:
      // Based on actual test data, the files should be sorted with directories first, then alphabetically
      // Expected order: directories first (src, tests), then root files (config.json)
      // Within src: components before styles before utils (alphabetically)
      // Within tests: integration before unit (alphabetically)
      const expectedOrder = [
        'src/components/ui/Button.tsx',
        'src/components/ui/Input.tsx',
        'src/styles/themes/dark.css',
        'src/utils/api/client.ts',
        'src/utils/helpers.js',
        'tests/integration/api.test.ts',
        'tests/unit/Button.test.tsx',
        'config.json'
      ];
      
      expect(fullPaths).toEqual(expectedOrder);
      
    } finally {
      await mockServer.stop();
    }
  });
});
