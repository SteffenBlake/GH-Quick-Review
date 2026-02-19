import { test, expect } from './fixtures.js';
import { MockServerManager } from './mock-server-manager.js';

test.describe('Review Thread Line Ordering', { tag: '@parallel' }, () => {
  test('should navigate threads in correct line number order within same file', async ({ page }) => {
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

      // Click on the thread at line 4 in example.js (the FIRST thread, lower line number)
      // This should be the "Pending comment on app.js" thread
      const threadButtons = page.locator('[data-filename="example.js"] .diff-line-message-btn.has-message');

      // Get all thread buttons for example.js and click the first one
      const firstButton = threadButtons.first();
      await firstButton.click();

      // Modal should be visible and focused
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });

      // Verify we're on line 4 thread
      await expect(page.locator('.comment-item-body').first()).toContainText(
        'Pending comment on app.js'
      );

      // Get navigation buttons
      const nextButton = page.getByTestId('next-thread-btn');

      // Click next to go to the second thread in example.js (line 15)
      await nextButton.click();

      // Modal should still be focused
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });

      // Verify we're now on line 15 thread (the next higher line number in example.js)
      await expect(page.locator('.comment-item-body').first()).toContainText(
        'Good improvement! Consider also validating the token format'
      );
    } finally {
      await mockServer.stop();
    }
  });

  test('should navigate threads across files in correct order', async ({ page }) => {
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

      // Expected order of threads:
      // 1. empty-lines.txt line 3
      // 2. example.cs line 32
      // 3. example.js line 4
      // 4. example.js line 15

      // Start at the first thread
      const firstThreadButton = page.locator('.diff-line-message-btn.has-message').first();
      await firstThreadButton.click();

      // Verify we're on empty-lines.txt line 3
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });
      await expect(page.locator('.comment-item-body').first()).toContainText(
        'This is a pending comment - should be visible in directory browser!'
      );

      const nextButton = page.getByTestId('next-thread-btn');

      // Navigate to second thread (example.cs line 32)
      await nextButton.click();
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });
      await expect(page.locator('.comment-item-body').first()).toContainText(
        'authTime'
      );

      // Navigate to third thread (example.js line 4)
      await nextButton.click();
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });
      await expect(page.locator('.comment-item-body').first()).toContainText(
        'Pending comment on app.js'
      );

      // Navigate to fourth thread (example.js line 15)
      await nextButton.click();
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });
      await expect(page.locator('.comment-item-body').first()).toContainText(
        'Good improvement! Consider also validating the token format'
      );

      // Now navigate backwards
      const prevButton = page.getByTestId('prev-thread-btn');

      // Go back to example.js line 4
      await prevButton.click();
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });
      await expect(page.locator('.comment-item-body').first()).toContainText(
        'Pending comment on app.js'
      );

      // Go back to example.cs line 32
      await prevButton.click();
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });
      await expect(page.locator('.comment-item-body').first()).toContainText(
        'authTime'
      );

      // Go back to empty-lines.txt line 3
      await prevButton.click();
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });
      await expect(page.locator('.comment-item-body').first()).toContainText(
        'This is a pending comment - should be visible in directory browser!'
      );
    } finally {
      await mockServer.stop();
    }
  });

  test('should skip multiple threads on same line when navigating forward', async ({ page }) => {
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

      // example.js has TWO threads on line 15, we want to test that forward nav skips both
      // and goes to the next line with a thread
      // Expected threads in order:
      // 1. empty-lines.txt:3 (PENDING)
      // 2. example.cs:32 (COMMENTED)
      // 3. example.js:4 (PENDING)
      // 4. example.js:15 - FIRST thread (COMMENTED)
      // 5. example.js:15 - SECOND thread (COMMENTED) <- should be SKIPPED when navigating forward from #4
      //
      // So from thread #4 (example.js:15 first thread), clicking "next" should go to... nothing?
      // Or back to the start? Let's think about this...
      //
      // Actually, we want it to skip to the NEXT DIFFERENT LINE. Since example.js:15 has 2 threads,
      // and it's the last line with threads in the data, the "next" button should be DISABLED
      // when on example.js:15 (both threads on that line).

      // Start at example.js line 4 thread
      const threadButtons = page.locator('[data-filename="example.js"] .diff-line-message-btn.has-message');

      // Click the FIRST thread button on example.js (should be line 4)
      await threadButtons.first().click();

      // Verify we're on the line 4 thread
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });
      await expect(page.locator('.comment-item-body').first()).toContainText('Pending comment on app.js');

      // Get navigation buttons
      const nextButton = page.getByTestId('next-thread-btn');
      const prevButton = page.getByTestId('prev-thread-btn');

      // Click next to go to line 15 FIRST thread
      await nextButton.click();
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });
      await expect(page.locator('.comment-item-body').first()).toContainText('Good improvement! Consider also validating');

      // Now we're on example.js:15 first thread
      // Clicking NEXT should be DISABLED because the next thread is also on line 15 (same line)
      // and there are no more threads after that on different lines
      await expect(nextButton).toBeDisabled();

      // But clicking PREV should work - should go back to example.js:4
      await prevButton.click();
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });
      await expect(page.locator('.comment-item-body').first()).toContainText('Pending comment on app.js');

    } finally {
      await mockServer.stop();
    }
  });
});
