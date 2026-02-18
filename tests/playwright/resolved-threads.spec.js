/*
 * Integration tests for resolved review threads filtering
 * Tests that resolved threads are properly filtered from:
 * 1. Directory browser comment icons
 * 2. Diff line comment buttons
 */

import { test, expect } from './fixtures.js';
import { MockServerManager } from './mock-server-manager.js';

// Read-only tests that can run in parallel
test.describe('Resolved Review Threads Filtering - Read Only', { tag: '@parallel' }, () => {
  let mockServer;

  test.beforeEach(() => {
    mockServer = new MockServerManager();
    mockServer.port = 3000; // Use globally started server
  });

  test.afterEach(async () => {
    await mockServer.stop();
  });

  test('should filter resolved threads from GraphQL query', async ({ request }) => {
    await mockServer.checkHeartbeat();

    // Query with resolved: false filter
    const response = await request.post('http://localhost:3000/graphql', {
      data: {
        query: `
          query($owner: String!, $repo: String!, $prNumber: Int!) {
            repository(owner: $owner, name: $repo) {
              pullRequest(number: $prNumber) {
                reviewThreads(first: 100, resolved: false) {
                  nodes {
                    id
                    isResolved
                    path
                    line
                  }
                }
              }
            }
          }
        `,
        variables: {
          owner: 'test_user',
          repo: 'test_repo_1',
          prNumber: 1
        }
      }
    });

    expect(response.ok()).toBeTruthy();
    const result = await response.json();

    expect(result.errors).toBeUndefined();
    expect(result.data).toBeTruthy();
    expect(result.data.repository).toBeTruthy();
    expect(result.data.repository.pullRequest).toBeTruthy();
    expect(result.data.repository.pullRequest.reviewThreads).toBeTruthy();

    const threads = result.data.repository.pullRequest.reviewThreads.nodes;

    // Should have threads (we have unresolved ones in test data)
    expect(threads.length).toBeGreaterThan(0);

    // All returned threads should be unresolved
    threads.forEach(thread => {
      expect(thread.isResolved).toBe(false);
    });

    // Verify we filtered out the resolved threads
    // We added 2 resolved threads to PR #1 (PRT_kwDOThread1003, PRT_kwDOThread1004)
    const resolvedThreadIds = ['PRT_kwDOThread1003', 'PRT_kwDOThread1004'];
    threads.forEach(thread => {
      expect(resolvedThreadIds).not.toContain(thread.id);
    });
  });

  test('should not show comment icon for resolved threads in directory browser', async ({ page }) => {
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

    // Find the directory entries for files with threads
    const exampleJsEntry = page.locator('.directory-entry-content:has(.entry-name:text("example.js"))');
    const exampleCsEntry = page.locator('.directory-entry-content:has(.entry-name:text("example.cs"))');
    const emptyLinesEntry = page.locator('.directory-entry-content:has(.entry-name:text("empty-lines.txt"))');

    // example.js has:
    // - 1 unresolved thread (PRT_kwDOThread1001 at line 15)
    // - 1 RESOLVED thread (PRT_kwDOThread1003 at line 20) - should be filtered out!
    // So it should show the comment icon (because of the unresolved one)
    await expect(exampleJsEntry.locator('.comment-indicator')).toBeVisible();

    // example.cs has:
    // - 1 unresolved thread (PRT_kwDOThread1002 at line 32)
    // - 1 RESOLVED thread (PRT_kwDOThread1004 at line 40) - should be filtered out!
    // So it should show the comment icon (because of the unresolved one)
    await expect(exampleCsEntry.locator('.comment-indicator')).toBeVisible();

    // empty-lines.txt has:
    // - 1 unresolved PENDING thread (PRT_kwDOThread4001 at line 3)
    // So it should show the comment icon
    await expect(emptyLinesEntry.locator('.comment-indicator')).toBeVisible();
  });

  test('should not show comment button for resolved threads on diff lines', async ({ page }) => {
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

    // Line 15 has an unresolved thread - should show message button
    const line15 = diffLines.filter({ has: page.locator('.diff-line-number:text("15")') }).first();
    await expect(line15).toBeVisible();
    await expect(line15.locator('.diff-line-message-btn.has-message')).toBeVisible();

    // All other lines in example.js should either:
    // - Have no comments (show add-message button)
    // - Have only resolved comments (show add-message button, not has-message)
    // We can't easily test for "line 20 specifically" because it might not be in the diff
    // Instead, we verify that only line 15 shows the has-message button

    // Count how many lines have the has-message button - should be exactly 1 (line 15)
    const hasMessageButtons = exampleJsCard.locator('.diff-line-message-btn.has-message');
    await expect(hasMessageButtons).toHaveCount(1);
  });

  test('should exclude resolved threads when counting comments for files', async ({ page }) => {
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

    // Wait for directory browser
    await expect(page.locator('.directory-browser')).toBeVisible({ timeout: 1000 });
    await expect(page.locator('.directory-entry').first()).toBeVisible({ timeout: 1000 });

    // Check that files with only resolved threads don't show comment indicators
    // example.js has 1 unresolved + 1 resolved = should show indicator (1 unresolved)
    const exampleJsEntry = page.locator('.directory-entry-content:has(.entry-name:text("example.js"))');
    await expect(exampleJsEntry.locator('.comment-indicator')).toBeVisible();

    // example.cs has 1 unresolved + 1 resolved = should show indicator (1 unresolved)
    const exampleCsEntry = page.locator('.directory-entry-content:has(.entry-name:text("example.cs"))');
    await expect(exampleCsEntry.locator('.comment-indicator')).toBeVisible();

    // resolved-only.txt has ONLY resolved threads - should NOT show indicator
    const resolvedOnlyEntry = page.locator('.directory-entry-content:has(.entry-name:text("resolved-only.txt"))');
    await expect(resolvedOnlyEntry).toBeVisible(); // File exists in directory
    await expect(resolvedOnlyEntry.locator('.comment-indicator')).not.toBeVisible(); // No icon!

    // Also verify the diff lines don't show comment buttons
    const resolvedOnlyCard = page.locator('.file-card[data-filename="resolved-only.txt"]');
    await expect(resolvedOnlyCard).toBeVisible();

    // The file has a resolved thread at line 1, but should NOT show has-message button
    const resolvedOnlyLines = resolvedOnlyCard.locator('.diff-line');
    const hasMessageButtons = resolvedOnlyLines.locator('.diff-line-message-btn.has-message');
    await expect(hasMessageButtons).toHaveCount(0); // No has-message buttons at all!
  });
});

// Write tests that modify server state - must run serially
test.describe('Resolved Review Threads Filtering - Dynamic Resolution', { tag: '@serial' }, () => {
  let mockServer;

  test.beforeEach(() => {
    mockServer = new MockServerManager();
    mockServer.port = 3000; // Use globally started server
  });

  test.afterEach(async () => {
    await mockServer.reset(); // Reset server state after mutation tests
    await mockServer.stop();
  });

  test('should hide thread from UI when dynamically resolved via GraphQL mutation', async ({ page, request }) => {
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

    // Verify empty-lines.txt has a comment indicator initially (unresolved thread PRT_kwDOThread4001)
    const emptyLinesEntry = page.locator('.directory-entry-content:has(.entry-name:text("empty-lines.txt"))');
    await expect(emptyLinesEntry.locator('.comment-indicator')).toBeVisible();

    // Wait for file cards to render
    await expect(page.locator('.file-card').first()).toBeVisible({ timeout: 1000 });

    // Find the empty-lines.txt file card
    const emptyLinesCard = page.locator('.file-card[data-filename="empty-lines.txt"]');
    await expect(emptyLinesCard).toBeVisible();

    // Line 3 should have a comment button (unresolved thread)
    const diffLines = emptyLinesCard.locator('.diff-line');
    const line3 = diffLines.filter({ has: page.locator('.diff-line-number:text("3")') }).first();
    await expect(line3).toBeVisible();
    await expect(line3.locator('.diff-line-message-btn.has-message')).toBeVisible();

    // Now resolve the thread via GraphQL mutation
    const resolveResponse = await request.post('http://localhost:3000/graphql', {
      data: {
        query: 'mutation { resolveReviewThread(input: {threadId: "PRT_kwDOThread4001"}) { thread { id isResolved } } }'
      }
    });

    expect(resolveResponse.ok()).toBeTruthy();
    const resolveResult = await resolveResponse.json();
    expect(resolveResult.errors).toBeUndefined();
    expect(resolveResult.data.resolveReviewThread.thread.isResolved).toBe(true);

    // Trigger a refetch by reloading the page
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('github_pat', 'test-token-123');
      localStorage.setItem('selected_repo', 'test_user/test_repo_1');
      localStorage.setItem('selected_pr', '1');
    });
    await page.reload();

    // Wait for the page to reload completely
    await expect(page.locator('.directory-browser')).toBeVisible({ timeout: 1000 });

    // Now the comment indicator should be GONE because the thread is resolved
    const emptyLinesEntryAfter = page.locator('.directory-entry-content:has(.entry-name:text("empty-lines.txt"))');
    await expect(emptyLinesEntryAfter.locator('.comment-indicator')).not.toBeVisible();

    // Wait for file cards
    await expect(page.locator('.file-card').first()).toBeVisible({ timeout: 1000 });

    // Find the empty-lines.txt file card again
    const emptyLinesCardAfter = page.locator('.file-card[data-filename="empty-lines.txt"]');
    await expect(emptyLinesCardAfter).toBeVisible();

    // Line 3 should now have NO has-message button (thread is resolved)
    const diffLinesAfter = emptyLinesCardAfter.locator('.diff-line');
    const line3After = diffLinesAfter.filter({ has: page.locator('.diff-line-number:text("3")') }).first();
    await expect(line3After).toBeVisible();
    await expect(line3After.locator('.diff-line-message-btn.has-message')).not.toBeVisible();
    // Note: The add-message button might be hidden in some CSS states (on hover only),
    // so we won't assert it's visible, just that has-message is gone
  });
});
