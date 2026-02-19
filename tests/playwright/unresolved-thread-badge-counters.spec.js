/*
 * Integration tests for unresolved thread badge counters
 * Tests that badge counters correctly display the number of unresolved threads:
 * 1. Directory browser shows count of unresolved threads per file
 * 2. Diff lines show count of unresolved threads per line
 */

import { test, expect } from './fixtures.js';
import { MockServerManager } from './mock-server-manager.js';

// Read-only tests that can run in parallel
test.describe('Unresolved Thread Badge Counters', { tag: '@parallel' }, () => {
  let mockServer;

  test.beforeEach(() => {
    mockServer = new MockServerManager();
    mockServer.port = 3000; // Use globally started server
  });

  test.afterEach(async () => {
    await mockServer.stop();
  });

  test('should show correct badge count in directory browser for files with unresolved threads', async ({ page }) => {
    await mockServer.checkHeartbeat();

    // Navigate to the app and set up the state
    await page.goto('/GH-Quick-Review/');
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('github_pat', 'test-token-123');
      localStorage.setItem('selected_repo', 'test_user/test_repo_1');
      localStorage.setItem('selected_pr', '1');
    });

    // Reload to apply state
    await page.reload();

    // Wait for directory browser to render
    await expect(page.locator('.directory-browser')).toBeVisible({ timeout: 1000 });

    // Wait for directory entries to render
    await expect(page.locator('.directory-entry').first()).toBeVisible({ timeout: 1000 });

    // example.js has 3 unresolved threads:
    // - PRT_kwDOThread4001_js at line 4 (pending)
    // - PRT_kwDOThread1001 at line 15
    // - PRT_kwDOThread1001_dup at line 15 (second thread on same line)
    // and 1 RESOLVED thread (PRT_kwDOThread1003 at line 20) - resolved threads don't count!
    const exampleJsEntry = page.locator('.directory-entry-content:has(.entry-name:text("example.js"))');
    await expect(exampleJsEntry.locator('.comment-indicator')).toBeVisible();
    const exampleJsBadge = exampleJsEntry.locator('.icon-badge-counter');
    await expect(exampleJsBadge).toBeVisible();
    await expect(exampleJsBadge).toHaveText('3');

    // example.cs has 1 unresolved thread (PRT_kwDOThread1002 at line 32)
    // and 1 RESOLVED thread (PRT_kwDOThread1004 at line 40) - resolved threads don't count!
    const exampleCsEntry = page.locator('.directory-entry-content:has(.entry-name:text("example.cs"))');
    await expect(exampleCsEntry.locator('.comment-indicator')).toBeVisible();
    const exampleCsBadge = exampleCsEntry.locator('.icon-badge-counter');
    await expect(exampleCsBadge).toBeVisible();
    await expect(exampleCsBadge).toHaveText('1');

    // empty-lines.txt has 1 unresolved PENDING thread (PRT_kwDOThread4001 at line 3)
    const emptyLinesEntry = page.locator('.directory-entry-content:has(.entry-name:text("empty-lines.txt"))');
    await expect(emptyLinesEntry.locator('.comment-indicator')).toBeVisible();
    const emptyLinesBadge = emptyLinesEntry.locator('.icon-badge-counter');
    await expect(emptyLinesBadge).toBeVisible();
    await expect(emptyLinesBadge).toHaveText('1');
  });

  test('should not show badge for files with only resolved threads', async ({ page }) => {
    await mockServer.checkHeartbeat();

    // Navigate to the app and set up the state
    await page.goto('/GH-Quick-Review/');
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('github_pat', 'test-token-123');
      localStorage.setItem('selected_repo', 'test_user/test_repo_1');
      localStorage.setItem('selected_pr', '1');
    });

    // Reload to apply state
    await page.reload();

    // Wait for directory browser to render
    await expect(page.locator('.directory-browser')).toBeVisible({ timeout: 1000 });
    await expect(page.locator('.directory-entry').first()).toBeVisible({ timeout: 1000 });

    // resolved-only.txt has ONLY resolved threads - should NOT show comment icon or badge
    const resolvedOnlyEntry = page.locator('.directory-entry-content:has(.entry-name:text("resolved-only.txt"))');
    await expect(resolvedOnlyEntry).toBeVisible(); // File exists in directory
    await expect(resolvedOnlyEntry.locator('.comment-indicator')).not.toBeVisible(); // No icon!
    await expect(resolvedOnlyEntry.locator('.icon-badge-counter')).not.toBeVisible(); // No badge!
  });

  test('should not show badge for files with no threads', async ({ page }) => {
    await mockServer.checkHeartbeat();

    // Navigate to the app and set up the state
    await page.goto('/GH-Quick-Review/');
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('github_pat', 'test-token-123');
      localStorage.setItem('selected_repo', 'test_user/test_repo_1');
      localStorage.setItem('selected_pr', '1');
    });

    // Reload to apply state
    await page.reload();

    // Wait for directory browser to render
    await expect(page.locator('.directory-browser')).toBeVisible({ timeout: 1000 });
    await expect(page.locator('.directory-entry').first()).toBeVisible({ timeout: 1000 });

    // some-file.txt has NO threads at all - should NOT show comment icon or badge
    // (we'd need to find a file in the test data that has no comments)
    // For now, we'll verify that files without the comment-indicator also don't have badges
    const allEntriesWithoutComments = page.locator('.directory-entry-content:not(:has(.comment-indicator))');
    const count = await allEntriesWithoutComments.count();

    // Check each entry without a comment indicator also has no badge
    for (let i = 0; i < count; i++) {
      const entry = allEntriesWithoutComments.nth(i);
      await expect(entry.locator('.icon-badge-counter')).not.toBeVisible();
    }
  });

  test('should show correct badge count on diff lines with unresolved threads', async ({ page }) => {
    await mockServer.checkHeartbeat();

    // Navigate to the app and set up the state
    await page.goto('/GH-Quick-Review/');
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('github_pat', 'test-token-123');
      localStorage.setItem('selected_repo', 'test_user/test_repo_1');
      localStorage.setItem('selected_pr', '1');
    });

    // Reload to apply state
    await page.reload();

    // Wait for file cards to render
    await expect(page.locator('.file-card').first()).toBeVisible({ timeout: 1000 });

    // Find the example.js file card
    const exampleJsCard = page.locator('.file-card[data-filename="example.js"]');
    await expect(exampleJsCard).toBeVisible();

    // Find diff lines in example.js
    const diffLines = exampleJsCard.locator('.diff-line');

    // Line 15 has TWO unresolved threads - should show message button with badge count of 2
    const line15 = diffLines.filter({ has: page.locator('.diff-line-number:text("15")') }).first();
    await expect(line15).toBeVisible();
    await expect(line15.locator('.diff-line-message-btn.has-message')).toBeVisible();

    const line15Badge = line15.locator('.icon-badge-counter');
    await expect(line15Badge).toBeVisible();
    await expect(line15Badge).toHaveText('2');
  });

  test('should not show badge on diff lines with no unresolved threads', async ({ page }) => {
    await mockServer.checkHeartbeat();

    // Navigate to the app and set up the state
    await page.goto('/GH-Quick-Review/');
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('github_pat', 'test-token-123');
      localStorage.setItem('selected_repo', 'test_user/test_repo_1');
      localStorage.setItem('selected_pr', '1');
    });

    // Reload to apply state
    await page.reload();

    // Wait for file cards to render
    await expect(page.locator('.file-card').first()).toBeVisible({ timeout: 1000 });

    // Find the resolved-only.txt file card
    const resolvedOnlyCard = page.locator('.file-card[data-filename="resolved-only.txt"]');
    await expect(resolvedOnlyCard).toBeVisible();

    // The file has a resolved thread at line 1, but should NOT show has-message button or badge
    const resolvedOnlyLines = resolvedOnlyCard.locator('.diff-line');
    const hasMessageButtons = resolvedOnlyLines.locator('.diff-line-message-btn.has-message');
    await expect(hasMessageButtons).toHaveCount(0); // No has-message buttons at all!

    const badges = resolvedOnlyLines.locator('.icon-badge-counter');
    await expect(badges).toHaveCount(0); // No badges at all!
  });

  test('should show badge count on diff lines without message button (add-message state)', async ({ page }) => {
    await mockServer.checkHeartbeat();

    // Navigate to the app and set up the state
    await page.goto('/GH-Quick-Review/');
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('github_pat', 'test-token-123');
      localStorage.setItem('selected_repo', 'test_user/test_repo_1');
      localStorage.setItem('selected_pr', '1');
    });

    // Reload to apply state
    await page.reload();

    // Wait for file cards to render
    await expect(page.locator('.file-card').first()).toBeVisible({ timeout: 1000 });

    // Find the example.js file card
    const exampleJsCard = page.locator('.file-card[data-filename="example.js"]');
    await expect(exampleJsCard).toBeVisible();

    // Find all diff lines in example.js
    const diffLines = exampleJsCard.locator('.diff-line');

    // Most lines should have the add-message button (not has-message)
    // These lines should NOT have badges
    const addMessageButtons = diffLines.locator('.diff-line-message-btn.add-message');
    const addMessageCount = await addMessageButtons.count();

    // Check that lines with add-message buttons don't have badges
    for (let i = 0; i < addMessageCount; i++) {
      const lineWithAddMessage = addMessageButtons.nth(i).locator('..').locator('..');
      await expect(lineWithAddMessage.locator('.icon-badge-counter')).not.toBeVisible();
    }
  });
});
