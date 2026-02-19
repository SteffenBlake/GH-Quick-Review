import { test, expect } from './fixtures.js';
import { MockServerManager } from './mock-server-manager.js';

test.describe('Review Thread Navigation', { tag: '@parallel' }, () => {
  test('should navigate between review threads using navigation buttons', async ({ page }) => {
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

      // Select repo and PR
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

      // Click on the first review thread (empty-lines.txt, line 3)
      const firstThreadButton = page.locator('.diff-line-message-btn.has-message').first();
      await firstThreadButton.click();

      // Modal should be visible and focused
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });

      // Verify we're on the first thread
      await expect(page.locator('.comment-item-body').first()).toContainText(
        'This is a pending comment - should be visible in directory browser!'
      );

      // Get navigation buttons
      const prevButton = page.getByTestId('prev-thread-btn');
      const nextButton = page.getByTestId('next-thread-btn');

      // First thread: prev should be disabled, next should be enabled
      await expect(prevButton).toBeDisabled();
      await expect(nextButton).toBeEnabled();

      // Navigate to next thread
      await nextButton.click();

      // Modal should still be focused (stayed open)
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });

      // Verify we're on the second thread (example.cs, line 32)
      await expect(page.locator('.comment-item-body').first()).toContainText(
        'authTime'
      );

      // Middle thread: both buttons should be enabled
      await expect(prevButton).toBeEnabled();
      await expect(nextButton).toBeEnabled();

      // Navigate to next thread again
      await nextButton.click();

      // Modal should still be focused
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });

      // Verify we're on the third thread (example.js, line 15)
      await expect(page.locator('.comment-item-body').first()).toContainText(
        'Good improvement! Consider also validating the token format'
      );

      // Last thread: prev should be enabled, next should be disabled
      await expect(prevButton).toBeEnabled();
      await expect(nextButton).toBeDisabled();

      // Navigate back to previous thread
      await prevButton.click();

      // Modal should still be focused
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });

      // Verify we're back on the second thread
      await expect(page.locator('.comment-item-body').first()).toContainText(
        'authTime'
      );

      // Middle thread: both buttons should be enabled again
      await expect(prevButton).toBeEnabled();
      await expect(nextButton).toBeEnabled();

      // Navigate back to first thread
      await prevButton.click();

      // Modal should still be focused
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });

      // Verify we're back on the first thread
      await expect(page.locator('.comment-item-body').first()).toContainText(
        'This is a pending comment - should be visible in directory browser!'
      );

      // First thread: prev should be disabled, next should be enabled
      await expect(prevButton).toBeDisabled();
      await expect(nextButton).toBeEnabled();
    } finally {
      await mockServer.stop();
    }
  });
});
