import { test, expect } from '@playwright/test';
import { MockServerManager } from './mock-server-manager.js';

test.describe('Review-Based Comment Flow', { tag: '@serial' }, () => {
  test('should start a new review when adding comment with no active review', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Select test_repo_1 which has NO active review
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
      
      // Hover over a line to reveal the message button
      const diffLine = page.locator('.diff-line').first();
      await diffLine.hover();
      
      // Click on a message button to open comment modal
      const messageButton = page.locator('.diff-line-message-btn.add-message').first();
      await messageButton.click();
      
      // Modal should appear and be focused
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });
      
      // Button should say "Add Comment and start review" (no active review)
      const submitBtn = page.getByRole('button', { name: 'Add Comment and start review' });
      await expect(submitBtn).toBeVisible();
      
      // Should NOT show submit review button (no active review yet)
      await expect(page.getByRole('button', { name: 'Submit Review: Request Changes' })).not.toBeVisible();
      
      // Type a comment
      const textarea = page.locator('.comment-modal-textarea');
      await textarea.fill('This comment will start a new review');
      
      // Submit the comment (should start review)
      await submitBtn.click();
      
      // Modal should close
      await expect(page.locator('.comment-modal')).not.toBeFocused({ timeout: 1000 });
      
      // Now add another comment - should show active review UI
      await diffLine.hover();
      await messageButton.click();
      
      // Modal should appear
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });
      
      // Button should now say "Add comment" (active review exists)
      const addCommentBtn = page.getByRole('button', { name: 'Add comment' });
      await expect(addCommentBtn).toBeVisible();
      
      // SHOULD show submit review button now
      const submitReviewBtn = page.getByRole('button', { name: 'Submit Review: Request Changes' });
      await expect(submitReviewBtn).toBeVisible();
    } finally {
      await mockServer.reset();
      await mockServer.stop();
    }
  });

  test('should show submit review button when active review exists', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Select test_repo_2 PR #2 which HAS an active review
      const repoDropdown = page.locator('#repo-select');
      await expect(repoDropdown).toBeVisible();
      await repoDropdown.locator('.fuzzy-dropdown-control').click();
      await repoDropdown.getByText('test_repo_2').click();
      
      const prDropdown = page.locator('#pr-select');
      await expect(prDropdown.locator('.fuzzy-dropdown-control:not(.disabled)')).toBeVisible();
      await prDropdown.locator('.fuzzy-dropdown-control').click();
      await prDropdown.getByText('#2 -').click();
      
      // Wait for diff viewer to load
      await expect(page.locator('.diff-viewer')).toBeVisible({ timeout: 1000 });
      
      // Click on diff viewer to unfocus directory browser
      await page.locator('.diff-viewer').click();
      
      // Hover over a line to reveal the message button
      const diffLine = page.locator('.diff-line').first();
      await diffLine.hover();
      
      // Click on a message button to open comment modal
      const messageButton = page.locator('.diff-line-message-btn.add-message').first();
      await messageButton.click();
      
      // Modal should appear and be focused
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });
      
      // Button should say "Add comment" (active review exists)
      const addCommentBtn = page.getByRole('button', { name: 'Add comment' });
      await expect(addCommentBtn).toBeVisible();
      
      // SHOULD show submit review button (active review exists)
      const submitReviewBtn = page.getByRole('button', { name: 'Submit Review: Request Changes' });
      await expect(submitReviewBtn).toBeVisible();
      
      // Submit review button should be yellow (check CSS)
      const bgColor = await submitReviewBtn.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      // #fbbf24 is rgb(251, 191, 36)
      expect(bgColor).toBe('rgb(251, 191, 36)');
    } finally {
      await mockServer.reset();
      await mockServer.stop();
    }
  });

  test('should submit review with configured body and REQUEST_CHANGES event', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Select test_repo_2 PR #2 which HAS an active review
      const repoDropdown = page.locator('#repo-select');
      await expect(repoDropdown).toBeVisible();
      await repoDropdown.locator('.fuzzy-dropdown-control').click();
      await repoDropdown.getByText('test_repo_2').click();
      
      const prDropdown = page.locator('#pr-select');
      await expect(prDropdown.locator('.fuzzy-dropdown-control:not(.disabled)')).toBeVisible();
      await prDropdown.locator('.fuzzy-dropdown-control').click();
      await prDropdown.getByText('#2 -').click();
      
      // Wait for diff viewer to load
      await expect(page.locator('.diff-viewer')).toBeVisible({ timeout: 1000 });
      
      // Click on diff viewer to unfocus directory browser
      await page.locator('.diff-viewer').click();
      
      // Hover over a line and open comment modal
      const diffLine = page.locator('.diff-line').first();
      await diffLine.hover();
      const messageButton = page.locator('.diff-line-message-btn.add-message').first();
      await messageButton.click();
      
      // Modal should appear
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });
      
      // Click submit review button
      const submitReviewBtn = page.getByRole('button', { name: 'Submit Review: Request Changes' });
      await submitReviewBtn.click();
      
      // Modal should close
      await expect(page.locator('.comment-modal')).not.toBeFocused({ timeout: 1000 });
      
      // Verify the review was submitted by checking if submit button is gone
      // (active review should no longer exist after submission)
      await diffLine.hover();
      await messageButton.click();
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });
      
      // Button should now say "Add Comment and start review" again (no active review)
      const startReviewBtn = page.getByRole('button', { name: 'Add Comment and start review' });
      await expect(startReviewBtn).toBeVisible();
      
      // Submit review button should NOT be visible
      await expect(page.getByRole('button', { name: 'Submit Review: Request Changes' })).not.toBeVisible();
    } finally {
      await mockServer.reset();
      await mockServer.stop();
    }
  });
});
