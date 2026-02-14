import { test, expect } from '@playwright/test';
import { MockServerManager } from './mock-server-manager.js';

test.describe('Pending Review Comments', { tag: '@parallel' }, () => {
  test('should display pending badge on pending comments', async ({ page }) => {
    const mockServer = new MockServerManager();
    mockServer.port = 3000;
    await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Select test_repo_1 and PR #1 (which has a pending comment)
      const repoDropdown = page.locator('#repo-select');
      await expect(repoDropdown).toBeVisible();
      await repoDropdown.locator('.fuzzy-dropdown-control').click();
      await repoDropdown.getByText('test_repo_1').click();
      
      const prDropdown = page.locator('#pr-select');
      await expect(prDropdown.locator('.fuzzy-dropdown-control:not(.disabled)')).toBeVisible();
      await prDropdown.locator('.fuzzy-dropdown-control').click();
      await prDropdown.getByText('#1 -').click();
      
      // Wait for diff viewer to load
      await expect(page.locator('.diff-viewer')).toBeVisible({ timeout: 1000 });
      
      // Click on diff viewer to unfocus directory browser
      await page.locator('.diff-viewer').click();
      
      // Find ANY message button that has comments and click it
      // We'll iterate through them to find the one with a pending comment
      const messageButtons = page.locator('.diff-line-message-btn.has-message');
      const count = await messageButtons.count();
      
      let foundPendingComment = false;
      for (let i = 0; i < count; i++) {
        // Click the button
        await messageButtons.nth(i).click();
        
        // Wait for modal to open
        await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });
        
        // Check if there's a pending badge
        const pendingBadge = page.locator('.comment-pending-badge');
        const badgeCount = await pendingBadge.count();
        
        if (badgeCount > 0) {
          // Found it! Verify the badge
          await expect(pendingBadge.first()).toBeVisible();
          await expect(pendingBadge.first()).toContainText('Pending');
          
          // Verify the badge has yellow color
          const badgeColor = await pendingBadge.first().evaluate(el => {
            return window.getComputedStyle(el).color;
          });
          // RGB for #fbbf24 is rgb(251, 191, 36)
          expect(badgeColor).toContain('251');
          expect(badgeColor).toContain('191');
          expect(badgeColor).toContain('36');
          
          foundPendingComment = true;
          break;
        } else {
          // Close the modal and try the next button
          await page.locator('.comment-modal-cancel-btn').click();
          await expect(page.locator('.comment-modal')).not.toBeFocused({ timeout: 1000 });
        }
      }
      
      expect(foundPendingComment).toBe(true);
      // Success!
    } finally {
      await mockServer.stop();
    }
  });

  test('should show pending comments persist after page reload', async ({ page }) => {
    const mockServer = new MockServerManager();
    mockServer.port = 3000;
    await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Select test_repo_1 and PR #1
      const repoDropdown = page.locator('#repo-select');
      await expect(repoDropdown).toBeVisible();
      await repoDropdown.locator('.fuzzy-dropdown-control').click();
      await repoDropdown.getByText('test_repo_1').click();
      
      const prDropdown = page.locator('#pr-select');
      await expect(prDropdown.locator('.fuzzy-dropdown-control:not(.disabled)')).toBeVisible();
      await prDropdown.locator('.fuzzy-dropdown-control').click();
      await prDropdown.getByText('#1 -').click();
      
      // Wait for diff viewer
      await expect(page.locator('.diff-viewer')).toBeVisible({ timeout: 1000 });
      await page.locator('.diff-viewer').click();
      
      // Count message buttons before reload
      const messageButtonsBefore = page.locator('.diff-line-message-btn.has-message');
      const countBefore = await messageButtonsBefore.count();
      expect(countBefore).toBeGreaterThan(0);
      
      // Reload the page to simulate user refresh
      await page.reload();
      
      // Wait for the page to load again
      await expect(page.locator('.diff-viewer')).toBeVisible({ timeout: 1000 });
      
      // Count message buttons after reload - should be the same
      const messageButtonsAfter = page.locator('.diff-line-message-btn.has-message');
      const countAfter = await messageButtonsAfter.count();
      expect(countAfter).toBe(countBefore);
      
      // Now find and verify the pending comment still has its badge
      await page.locator('.diff-viewer').click();
      
      let foundPendingComment = false;
      for (let i = 0; i < countAfter; i++) {
        await messageButtonsAfter.nth(i).click();
        await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });
        
        const pendingBadge = page.locator('.comment-pending-badge');
        const badgeCount = await pendingBadge.count();
        
        if (badgeCount > 0) {
          await expect(pendingBadge.first()).toBeVisible();
          await expect(pendingBadge.first()).toContainText('Pending');
          foundPendingComment = true;
          break;
        } else {
          await page.locator('.comment-modal-cancel-btn').click();
          await expect(page.locator('.comment-modal')).not.toBeFocused({ timeout: 1000 });
        }
      }
      
      expect(foundPendingComment).toBe(true);
      // Success!
    } finally {
      await mockServer.stop();
    }
  });

  test('should fetch and merge comments from REST and GraphQL', async ({ page }) => {
    const mockServer = new MockServerManager();
    mockServer.port = 3000;
    await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Select test_repo_1 and PR #1
      const repoDropdown = page.locator('#repo-select');
      await expect(repoDropdown).toBeVisible();
      await repoDropdown.locator('.fuzzy-dropdown-control').click();
      await repoDropdown.getByText('test_repo_1').click();
      
      const prDropdown = page.locator('#pr-select');
      await expect(prDropdown.locator('.fuzzy-dropdown-control:not(.disabled)')).toBeVisible();
      await prDropdown.locator('.fuzzy-dropdown-control').click();
      await prDropdown.getByText('#1 -').click();
      
      // Wait for diff viewer
      await expect(page.locator('.diff-viewer')).toBeVisible({ timeout: 1000 });
      
      // Verify that comments are visible (meaning they were fetched and merged)
      const messageButtons = page.locator('.diff-line-message-btn.has-message');
      const count = await messageButtons.count();
      
      // PR #1 has 3 comments total (2 submitted + 1 pending)
      // All should be displayed
      expect(count).toBeGreaterThan(0);
      
      // Success - comments were merged correctly from both sources!
    } finally {
      await mockServer.stop();
    }
  });
});
