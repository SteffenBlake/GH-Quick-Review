import { test, expect } from '@playwright/test';
import { MockServerManager } from './mock-server-manager.js';

/**
 * Dropdown Width Constraint Tests
 * Ensures dropdown controls don't overflow their containers with long text
 */
test.describe('Dropdown Width Constraints', { tag: '@parallel' }, () => {
  test('PR dropdown should not exceed container width with long PR name', async ({ page }) => {
    const mockServer = new MockServerManager();
    mockServer.port = 3000; // Use globally started mock server
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      await expect(page.locator('.repo-fuzzy-select')).toBeVisible();
      
      // Select repo to enable PR dropdown
      await page.locator('.repo-fuzzy-select').click();
      await page.getByRole('listitem').filter({ hasText: 'test_repo_1' }).click();
      
      // Wait for PR dropdown to be enabled
      await expect(page.locator('.pr-fuzzy-select')).not.toHaveClass(/disabled/);
      
      // Click PR dropdown to open it
      await page.locator('.pr-fuzzy-select').click();
      
      // Select the long PR name
      await page.getByRole('listitem').filter({ hasText: '#2 - Fix critical bug in' }).click();
      
      // Get the computed widths
      const pullsDropdownWidth = await page.locator('.pulls-dropdown').evaluate(
        (el) => el.getBoundingClientRect().width
      );
      
      const fuzzyDropdownWidth = await page.locator('.pr-fuzzy-select').evaluate(
        (el) => el.getBoundingClientRect().width
      );
      
      const controlWidth = await page.locator('.pr-fuzzy-select .fuzzy-dropdown-control').evaluate(
        (el) => el.getBoundingClientRect().width
      );
      
      const textSpanWidth = await page.locator('.pr-fuzzy-select .fuzzy-dropdown-text').evaluate(
        (el) => el.getBoundingClientRect().width
      );
      
      // Log for debugging
      console.log('Width measurements:');
      console.log('  .pulls-dropdown:', pullsDropdownWidth);
      console.log('  .pr-fuzzy-select:', fuzzyDropdownWidth);
      console.log('  .fuzzy-dropdown-control:', controlWidth);
      console.log('  .fuzzy-dropdown-text:', textSpanWidth);
      
      // The fuzzy dropdown should not exceed the pulls-dropdown container
      expect(fuzzyDropdownWidth).toBeLessThanOrEqual(pullsDropdownWidth + 1); // +1 for rounding
      
      // The control should not exceed the fuzzy dropdown
      expect(controlWidth).toBeLessThanOrEqual(fuzzyDropdownWidth + 1);
      
      // The text span should not exceed the control (minus padding and arrow)
      // Text should be truncated with ellipsis, not causing overflow
      expect(textSpanWidth).toBeLessThan(controlWidth);
      
    } finally {
      await mockServer.stop();
    }
  });
  
  test('PR dropdown should be visible and not hidden by font picker', async ({ page }) => {
    const mockServer = new MockServerManager();
    mockServer.port = 3000; // Use globally started mock server
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      await expect(page.locator('.repo-fuzzy-select')).toBeVisible();
      
      // Select repo
      await page.locator('.repo-fuzzy-select').click();
      await page.getByRole('listitem').filter({ hasText: 'test_repo_1' }).click();
      
      // Select long PR
      await page.locator('.pr-fuzzy-select').click();
      await page.getByRole('listitem').filter({ hasText: '#2 - Fix critical bug in' }).click();
      
      // Get positions of PR dropdown and font picker
      const prDropdownBox = await page.locator('.pr-fuzzy-select').boundingBox();
      const fontPickerBox = await page.locator('.font-picker').boundingBox();
      
      // PR dropdown should not overlap with font picker
      // PR dropdown's right edge should be to the left of font picker's left edge
      expect(prDropdownBox.x + prDropdownBox.width).toBeLessThanOrEqual(fontPickerBox.x);
      
    } finally {
      await mockServer.stop();
    }
  });
});
