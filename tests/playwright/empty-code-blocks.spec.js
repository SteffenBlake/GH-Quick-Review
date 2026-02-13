import { test, expect } from '@playwright/test';
import { MockServerManager } from './mock-server-manager.js';

/**
 * Empty Code Blocks Test
 * Tests that empty code blocks in diff hunks render correctly with at least a space
 */
test.describe('Empty Code Blocks in Diff Hunks', () => {
  test('should render empty code blocks with a space instead of being totally empty', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.start(null, 3000);
      await mockServer.checkHeartbeat();
    
    try {
      // Login and navigate to a PR
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => {
        localStorage.setItem('github_pat', 'test_token_12345');
      });
      await page.reload();
      
      // Select repo
      await page.locator('.repo-fuzzy-select').click();
      await page.locator('.fuzzy-dropdown-option').filter({ hasText: 'test_repo_1' }).click();
      
      // Select PR
      await page.locator('.pr-fuzzy-select').click();
      await page.locator('.fuzzy-dropdown-option').filter({ hasText: '#1' }).click();
      
      // Wait for diff viewer to load
      await page.waitForSelector('.diff-viewer');
      
      // Find the file card for empty-lines.txt
      const fileCard = page.locator('.file-card').filter({ hasText: 'empty-lines.txt' });
      await expect(fileCard).toBeVisible();
      
      // Get all code elements in this file card
      const codeElements = fileCard.locator('.diff-line-code code');
      const codeCount = await codeElements.count();
      
      // Check each code element - none should be completely empty
      for (let i = 0; i < codeCount; i++) {
        const codeElement = codeElements.nth(i);
        const textContent = await codeElement.textContent();
        
        // The textContent should never be null or empty string
        // Empty lines should have at least a space character
        expect(textContent).not.toBeNull();
        
        // If the visual line appears empty (after trimming), the actual content should be a space
        if (textContent.trim() === '') {
          expect(textContent).toBe(' ');
        }
      }
    } finally {
      await mockServer.stop();
    }
  });
});
