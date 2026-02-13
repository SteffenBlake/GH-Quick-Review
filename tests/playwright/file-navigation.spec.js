/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { test, expect } from '@playwright/test';
import { MockServerManager } from './mock-server-manager.js';

test.describe('File Navigation and Sticky Headers', { tag: '@parallel' }, () => {
  test('clicking a file in directory browser scrolls to that file', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      
      // Login
      await page.getByRole('textbox', { name: 'Enter your GitHub PAT' }).fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Select repo and PR
      await page.getByText('Repo...').click();
      await page.getByRole('listitem').filter({ hasText: 'test_repo_1' }).click();
      await page.getByText('Pull Request...').click();
      await page.getByRole('listitem').first().click();
      
      // Wait for content to load
      await page.waitForSelector('[data-filename="example.js"]');
      
      // Click on example.js in directory browser
      await page.getByRole('list').getByText('example.js').click();
      
      // Wait for scroll animation
      await page.waitForTimeout(1500);
      
      // Verify the example.js file card is near the top of the viewport
      const fileCard = page.locator('[data-filename="example.js"]');
      const boundingBox = await fileCard.boundingBox();
      
      expect(boundingBox).not.toBeNull();
      // Should be near the top (allowing some margin for header)
      expect(boundingBox.y).toBeLessThan(150);
    } finally {
      await mockServer.stop();
    }
  });

  test('scrolling through files auto-selects them in directory browser', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      
      // Login
      await page.getByRole('textbox', { name: 'Enter your GitHub PAT' }).fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Select repo and PR
      await page.getByText('Repo...').click();
      await page.getByRole('listitem').filter({ hasText: 'test_repo_1' }).click();
      await page.getByText('Pull Request...').click();
      await page.getByRole('listitem').first().click();
      
      // Wait for content to load
      await page.waitForSelector('[data-filename="example.js"]');
      
      // Initially, should have first file selected (or no selection)
      // Scroll down to example.cs
      await page.evaluate(() => {
        const main = document.querySelector('main');
        if (main) {
          const exampleCs = document.querySelector('[data-filename="example.cs"]');
          if (exampleCs) {
            exampleCs.scrollIntoView({ block: 'center' });
          }
        }
      });
      
      // Wait for Intersection Observer to trigger
      await page.waitForTimeout(500);
      
      // Verify example.cs is now selected in directory browser
      const exampleCsEntry = page.locator('.directory-entry-content').filter({ hasText: 'example.cs' });
      await expect(exampleCsEntry).toHaveClass(/selected/);
    } finally {
      await mockServer.stop();
    }
  });

  test('file card headers are sticky when scrolling', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      
      // Login
      await page.getByRole('textbox', { name: 'Enter your GitHub PAT' }).fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Select repo and PR
      await page.getByText('Repo...').click();
      await page.getByRole('listitem').filter({ hasText: 'test_repo_1' }).click();
      await page.getByText('Pull Request...').click();
      await page.getByRole('listitem').first().click();
      
      // Wait for content to load
      await page.waitForSelector('[data-filename="example.cs"]');
      
      // Click on example.cs to scroll to it
      await page.getByRole('list').getByText('example.cs').click();
      await page.waitForTimeout(1500);
      
      // Get the header element
      const header = page.locator('[data-filename="example.cs"] .file-card-header');
      
      // Verify the header has sticky positioning
      const headerStyles = await header.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          position: styles.position,
          top: styles.top,
          zIndex: styles.zIndex
        };
      });
      
      expect(headerStyles.position).toBe('sticky');
      expect(headerStyles.top).toBe('0px');
      expect(parseInt(headerStyles.zIndex)).toBeGreaterThan(0);
      
      // Scroll down within the file
      await page.evaluate(() => {
        const main = document.querySelector('main');
        if (main) {
          main.scrollBy(0, 300);
        }
      });
      
      await page.waitForTimeout(300);
      
      // Header should still be visible at the top
      const headerBox = await header.boundingBox();
      expect(headerBox).not.toBeNull();
      expect(headerBox.y).toBeLessThan(10); // Should be stuck at the top
    } finally {
      await mockServer.stop();
    }
  });

  test('no feedback loop between click and scroll selection', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      
      // Login
      await page.getByRole('textbox', { name: 'Enter your GitHub PAT' }).fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Select repo and PR
      await page.getByText('Repo...').click();
      await page.getByRole('listitem').filter({ hasText: 'test_repo_1' }).click();
      await page.getByText('Pull Request...').click();
      await page.getByRole('listitem').first().click();
      
      // Wait for content to load
      await page.waitForSelector('[data-filename="example.js"]');
      
      // Click on example.js
      await page.getByRole('list').getByText('example.js').click();
      await page.waitForTimeout(500);
      
      // Get initial scroll position
      const initialScrollTop = await page.evaluate(() => {
        const main = document.querySelector('main');
        return main ? main.scrollTop : 0;
      });
      
      // The scroll position should be relatively stable after the initial scroll animation
      // Wait a bit more to ensure no additional scrolling happens
      await page.waitForTimeout(500);
      
      const finalScrollTop = await page.evaluate(() => {
        const main = document.querySelector('main');
        return main ? main.scrollTop : 0;
      });
      
      // Should be very close (allowing small rounding differences)
      expect(Math.abs(finalScrollTop - initialScrollTop)).toBeLessThan(5);
    } finally {
      await mockServer.stop();
    }
  });
});
