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
      
      // Select test_repo_1 PR #2 which has NO active review
      const repoDropdown = page.locator('#repo-select');
      await expect(repoDropdown).toBeVisible();
      await repoDropdown.locator('.fuzzy-dropdown-control').click();
      await repoDropdown.getByText('test_repo_1').click();
      
      const prDropdown = page.locator('#pr-select');
      await expect(prDropdown.locator('.fuzzy-dropdown-control:not(.disabled)')).toBeVisible();
      await prDropdown.locator('.fuzzy-dropdown-control').click();
      await prDropdown.getByText('#2 -').click();
      
      // Wait for diff viewer to load
      await expect(page.locator('.diff-viewer')).toBeVisible({ timeout: 1000 });
      
      // Click on diff viewer to unfocus directory browser
      await page.locator('.diff-viewer').click();
      
      // Hover over a line to reveal the message button
      const diffLine = page.locator('.diff-line:has(.diff-line-number:not(:empty))').first();
      await diffLine.hover();
      
      // Click on a message button to open comment modal
      const messageButton = diffLine.locator('.diff-line-message-btn.add-message');
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
      
      // Modal should STAY open (not close) after submitting
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });
      
      // Click cancel button in modal to close it
      await page.locator('.comment-modal-cancel-btn').click();
      
      // Now modal should be closed
      await expect(page.locator('.comment-modal')).not.toBeFocused({ timeout: 1000 });
      
      // Now add another comment - should show active review UI
      // Find a DIFFERENT line that doesn't have comments yet
      // The first line now has a comment, so find the second line with a number
      const allLinesWithNumbers = page.locator('.diff-line:has(.diff-line-number:not(:empty))');
      const diffLine2 = allLinesWithNumbers.nth(1); // Get second line instead of first
      await diffLine2.hover();
      
      // This line shouldn't have comments yet, so add-message button should appear
      const messageButton2 = diffLine2.locator('.diff-line-message-btn');
      await expect(messageButton2).toBeVisible({ timeout: 1000 });
      await messageButton2.click();
      
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
      const diffLine = page.locator('.diff-line:has(.diff-line-number:not(:empty))').first();
      await diffLine.hover();
      
      // Click on a message button to open comment modal
      const messageButton = diffLine.locator('.diff-line-message-btn.add-message');
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

  test('should submit review and show success toast, keep modal open, and remove submit button', async ({ page }) => {
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
      const diffLine = page.locator('.diff-line:has(.diff-line-number:not(:empty))').first();
      await diffLine.hover();
      const messageButton = diffLine.locator('.diff-line-message-btn.add-message');
      await messageButton.click();
      
      // Modal should appear
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });
      
      // Verify submit review button exists before clicking
      const submitReviewBtn = page.getByRole('button', { name: 'Submit Review: Request Changes' });
      await expect(submitReviewBtn).toBeVisible();
      
      // Click submit review button
      await submitReviewBtn.click();
      
      // Toast notification should appear with success message
      const toast = page.getByTestId('toast-notification');
      await expect(toast).toBeVisible({ timeout: 1000 });
      await expect(toast).toHaveClass(/toast-success/);
      await expect(toast).toContainText('Review submitted successfully!');
      
      // Modal should STAY open and focused (not close)
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });
      
      // Submit review button should now be gone (no active review anymore)
      await expect(submitReviewBtn).not.toBeVisible({ timeout: 1000 });
      
      // Button should now say "Add Comment and start review" (no active review)
      const startReviewBtn = page.getByRole('button', { name: 'Add Comment and start review' });
      await expect(startReviewBtn).toBeVisible();
    } finally {
      await mockServer.reset();
      await mockServer.stop();
    }
  });

  test('should show pending badge on comments before submission and remove after', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Select test_repo_2 PR #2 which HAS an active review with pending comments
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
      
      // Find a line with existing pending comments (look for pending message button)
      const pendingMessageButton = page.locator('.diff-line-message-btn.pending-message').first();
      await pendingMessageButton.click();
      
      // Modal should appear with comment thread
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });
      
      // Should show "Pending" badge on the comment
      const pendingBadge = page.locator('.comment-pending-badge');
      await expect(pendingBadge).toBeVisible();
      await expect(pendingBadge).toContainText('Pending');
      
      // Submit the review
      const submitReviewBtn = page.getByRole('button', { name: 'Submit Review: Request Changes' });
      await expect(submitReviewBtn).toBeVisible();
      await submitReviewBtn.click();
      
      // Toast should appear
      await expect(page.getByTestId('toast-notification')).toBeVisible({ timeout: 1000 });
      
      // Wait for query to invalidate and refetch
      // The pending badge should disappear after the review is submitted
      await expect(pendingBadge).not.toBeVisible({ timeout: 1000 });
    } finally {
      await mockServer.reset();
      await mockServer.stop();
    }
  });

  test('should prevent double submission by removing submit button', async ({ page }) => {
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
      const diffLine = page.locator('.diff-line:has(.diff-line-number:not(:empty))').first();
      await diffLine.hover();
      const messageButton = diffLine.locator('.diff-line-message-btn.add-message');
      await messageButton.click();
      
      // Modal should appear
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });
      
      // Verify submit review button exists
      const submitReviewBtn = page.getByRole('button', { name: 'Submit Review: Request Changes' });
      await expect(submitReviewBtn).toBeVisible();
      
      // Click submit review button
      await submitReviewBtn.click();
      
      // Toast should appear
      await expect(page.getByTestId('toast-notification')).toBeVisible({ timeout: 1000 });
      
      // Submit button should be gone - cannot double-submit
      await expect(submitReviewBtn).not.toBeVisible({ timeout: 1000 });
      
      // Modal stays open, so user cannot accidentally try to submit again
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });
      
      // Close modal and reopen to verify submit button is still gone
      await page.locator('.comment-modal-cancel-btn').click();
      await diffLine.hover();
      await messageButton.click();
      
      // Still no submit button (no active review)
      await expect(submitReviewBtn).not.toBeVisible({ timeout: 1000 });
    } finally {
      await mockServer.reset();
      await mockServer.stop();
    }
  });
});
