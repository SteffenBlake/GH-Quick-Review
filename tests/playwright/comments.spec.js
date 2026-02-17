import { test, expect } from './fixtures.js';
import { MockServerManager } from './mock-server-manager.js';

test.describe('Comment Management', { tag: '@serial' }, () => {
  test('should successfully create a new comment on a line', async ({ page }) => {
    const mockServer = new MockServerManager();
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

      // Click on diff viewer to unfocus directory browser (which auto-focuses on PR selection)
      await page.locator('.diff-viewer').click();

      // Find a line with a line number (not hunk header, not empty line)
      // Look for a line that has .diff-line-number visible
      const lineWithNumber = page.locator('.diff-line:has(.diff-line-number:not(:empty))').first();
      await lineWithNumber.hover();

      // Click on the message button that appears on hover
      const messageButton = lineWithNumber.locator('.diff-line-message-btn.add-message');
      await messageButton.click();

      // Modal should appear and be focused
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });

      // Type a comment
      const textarea = page.locator('.comment-modal-textarea');
      await textarea.fill('This is a new test comment');

      // Submit the comment
      await page.getByRole('button', { name: 'Comment' }).click();

      // Modal should STAY open (not blur) after submitting
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });

      // Success! No error should be shown
      // If we got this far without an alert dialog, the comment was created successfully
    } finally {
      await mockServer.reset(); // Reset data for next test
      await mockServer.stop();
    }
  });

  test('should successfully edit an existing comment', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.checkHeartbeat();
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

      // Click on diff viewer to unfocus directory browser (which auto-focuses on PR selection)
      await page.locator('.diff-viewer').click();

      // BEFORE clicking: Modal should be hidden (opacity: 0)
      await expect(page.locator('.comment-modal')).toHaveCSS('opacity', '0');

      // Click on a message button with existing comments to open thread
      const messageButton = page.locator('.diff-line-message-btn.has-message').first();
      await messageButton.click();

      // Modal should appear with existing comments
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });
      await expect(page.locator('.comment-item')).toBeVisible();

      // Wait for edit button to appear (requires user data to load first)
      const editButton = page.locator('.comment-edit-btn').first();
      await expect(editButton).toBeVisible({ timeout: 1000 });
      await editButton.click();

      // Edit textarea should appear
      const editTextarea = page.locator('.comment-edit-textarea');
      await expect(editTextarea).toBeVisible();

      // Modify the comment
      await editTextarea.fill('This is an updated comment');

      // Click Save button (now in the comment header)
      await page.locator('.comment-edit-submit-btn').first().click();

      // Edit form should close
      await expect(editTextarea).not.toBeVisible({ timeout: 1000 });

      // BUG #1: Modal should STAY OPEN (remain focused) after editing
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });

      // Comment should show updated text (in view mode, not edit mode)
      await expect(page.locator('.comment-item-body').first()).toContainText('This is an updated comment');

      // Close the modal by clicking the Cancel button in the comment form
      await page.locator('.comment-modal-cancel-btn').click();
      // Modal should fade out (opacity: 0)
      await expect(page.locator('.comment-modal')).toHaveCSS('opacity', '0', { timeout: 1000 });

      // BUG #2: Modal should be able to RE-OPEN after editing
      await messageButton.click();
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });
      await expect(page.locator('.comment-item-body').first()).toContainText('This is an updated comment');

      // Success! No error should be shown
    } finally {
      await mockServer.reset(); // Reset data for next test
      await mockServer.stop();
    }
  });

  test('should successfully reply to an existing comment thread', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.checkHeartbeat();
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

      // Click on diff viewer to unfocus directory browser (which auto-focuses on PR selection)
      await page.locator('.diff-viewer').click();

      // Click on a message button with existing comments to open thread
      const messageButton = page.locator('.diff-line-message-btn.has-message').first();
      await messageButton.click();

      // Modal should appear with existing comments
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });
      await expect(page.locator('.comment-item')).toBeVisible();

      // Type a reply
      const replyTextarea = page.locator('.comment-modal-textarea');
      await replyTextarea.fill('This is a reply to the thread');

      // Submit the reply
      await page.getByRole('button', { name: 'Add comment' }).click();

      // Modal should STAY open (not blur) after submitting
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });

      // Success! No error should be shown
    } finally {
      await mockServer.reset(); // Reset data for next test
      await mockServer.stop();
    }
  });

  test('should re-open modal after clicking off it (blur)', async ({ page }) => {
    const mockServer = new MockServerManager();
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

      // Find a line with a line number (not hunk header, not empty line)
      const diffLine = page.locator('.diff-line:has(.diff-line-number:not(:empty))').first();
      await diffLine.hover();

      // Step 1: Click "Add comment" button → modal should open
      const messageButton = diffLine.locator('.diff-line-message-btn.add-message');
      await messageButton.click();
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });

      // Step 2: Click off the modal (on the diff viewer) → modal should close via blur
      await page.locator('.diff-viewer').click();
      await expect(page.locator('.comment-modal')).toHaveCSS('opacity', '0', { timeout: 1000 });

      // Step 3: Hover again to make the message button visible, then click it → modal SHOULD re-open
      await diffLine.hover();
      await messageButton.click();
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });

      // Verify we can interact with the modal
      const textarea = page.locator('.comment-modal-textarea');
      await textarea.fill('Test comment after re-opening');
      await expect(textarea).toHaveValue('Test comment after re-opening');

      // Success! The modal re-opened correctly
    } finally {
      await mockServer.reset();
      await mockServer.stop();
    }
  });

  test('should scroll to new comment when replying to existing thread', async ({ page }) => {
    const mockServer = new MockServerManager();
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

      // Click on a message button with existing comments to open thread
      const messageButton = page.locator('.diff-line-message-btn.has-message').first();
      await messageButton.click();

      // Modal should appear with existing comments
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });
      await expect(page.locator('.comment-item')).toBeVisible();

      // Get the initial number of comments
      const initialCommentCount = await page.locator('.comment-item').count();

      // Type a reply
      const replyTextarea = page.locator('.comment-modal-textarea');
      await replyTextarea.fill('New reply to scroll to');

      // Submit the reply
      await page.getByRole('button', { name: 'Add comment' }).click();

      // Wait for the new comment to appear
      await expect(page.locator('.comment-item')).toHaveCount(initialCommentCount + 1);

      // Get the comment thread container
      const threadContainer = page.locator('.comment-modal-thread');

      // Get the last comment (the one we just added)
      const lastComment = page.locator('.comment-item').last();

      // Check if the last comment is visible (scrolled into view)
      // We do this by checking if it's within the visible viewport of the scrollable container
      const isInView = await page.evaluate(({ container, element }) => {
        const containerEl = document.querySelector(container);
        const elementEl = document.querySelectorAll(element);
        const lastEl = elementEl[elementEl.length - 1];

        if (!containerEl || !lastEl) {return false;}

        const containerRect = containerEl.getBoundingClientRect();
        const elementRect = lastEl.getBoundingClientRect();

        // Check if the element is within the visible area of the container
        return (
          elementRect.bottom <= containerRect.bottom &&
          elementRect.top >= containerRect.top
        );
      }, { container: '.comment-modal-thread', element: '.comment-item' });

      // BUG: The new comment should be scrolled into view
      expect(isInView).toBe(true);

    } finally {
      await mockServer.reset();
      await mockServer.stop();
    }
  });

  test('should display new comment immediately when starting a new thread', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.checkHeartbeat();

    // Listen for console messages
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

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

      // Find a line WITHOUT existing comments
      // Count all comment buttons to find one without comments
      const allLines = page.locator('.diff-line');
      const lineCount = await allLines.count();

      // Look for a line that doesn't have the .has-message class
      let lineWithoutComments = null;
      let messageButton = null;

      for (let i = 0; i < lineCount; i++) {
        const line = allLines.nth(i);
        const hasMessageBtn = line.locator('.diff-line-message-btn.has-message');
        const count = await hasMessageBtn.count();

        if (count === 0) {
          // This line doesn't have comments yet
          lineWithoutComments = line;
          await line.hover();
          messageButton = line.locator('.diff-line-message-btn.add-message');
          const btnVisible = await messageButton.isVisible();
          if (btnVisible) {
            break;
          }
        }
      }

      // Click the message button to start a new thread
      await messageButton.click();

      // Modal should appear in "New Comment" mode
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });
      await expect(page.locator('.comment-modal h2')).toContainText('New Comment');

      // No comments should be visible yet (it's a new thread)
      await expect(page.locator('.comment-item')).toHaveCount(0);

      // Type a new comment
      const textarea = page.locator('.comment-modal-textarea');
      await textarea.fill('First comment in new thread');

      // Submit the comment
      // For new comments without an active review, the button says "Add Comment and start review"
      const submitButton = page.getByRole('button', { name: /Add comment/i });
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toBeEnabled(); // Wait for button to be enabled after typing
      await submitButton.click();

      // The modal should transition from "New Comment" to "Comment Thread"
      // Make sure we're checking the FOCUSED modal, not some other modal on the page
      const modal = page.locator('.comment-modal:focus');
      await expect(modal.locator('h2')).toContainText('Comment Thread', { timeout: 2000 });

      // The comment should appear immediately in the modal
      await expect(modal.locator('.comment-item')).toHaveCount(1);
      await expect(modal.locator('.comment-item-body')).toContainText('First comment in new thread');

    } finally {
      await mockServer.reset();
      await mockServer.stop();
    }
  });

  test('should resolve thread and update UI completely', async ({ page }) => {
    test.setTimeout(10000); // Increase timeout for latency test
    const mockServer = new MockServerManager();
    await mockServer.checkHeartbeat();
    // DON'T set latency yet - we'll set it just before the resolve operation

    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();

      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();

      // Select repo and PR #1 (no latency, so this should be fast)
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

      // Find a line with an existing COMMENTED (not PENDING) thread
      // PENDING threads will still show after resolving, so we need a COMMENTED thread
      // Files appear in order: empty-lines.txt (PENDING), example.cs (COMMENTED), example.js (COMMENTED)
      // Skip the first button (empty-lines.txt - PENDING) and click the second one (example.cs - COMMENTED)
      const allCommentButtons = page.locator('.diff-line-message-btn.has-message');
      await expect(allCommentButtons.nth(1)).toBeVisible(); // Wait for the second button

      // Get the count of has-message buttons before resolving
      const hasMessageCountBefore = await allCommentButtons.count();

      // Click on the SECOND has-message button (example.cs line 32 - COMMENTED thread)
      await allCommentButtons.nth(1).click();

      // Modal should appear and be focused
      const modal = page.locator('.comment-modal:focus');
      await expect(modal).toBeVisible({ timeout: 1000 });
      await expect(modal.locator('h2')).toContainText('Comment Thread');

      // Verify resolve button exists
      const resolveButton = modal.locator('.comment-modal-resolve-btn');
      await expect(resolveButton).toBeVisible();
      await expect(resolveButton).toContainText('Resolve');

      // NOW set latency to make the resolve operation slow enough to see loading state
      await mockServer.setConfig({ latency: 300 });

      // Click the resolve button
      await resolveButton.click();

      // Modal should show loading state due to 300ms latency
      // Don't require focus since content is changing
      await expect(page.locator('.comment-modal-resolving')).toBeVisible({ timeout: 1000 });

      // Modal should close after resolution completes
      await expect(page.locator('.comment-modal')).toHaveCSS('opacity', '0', { timeout: 2000 });

      // Verify success toast is shown
      const toast = page.getByTestId('toast-notification');
      await expect(toast).toBeVisible({ timeout: 1000 });
      await expect(toast).toContainText('Thread resolved successfully');

      // Wait for the UI to update by checking that the comment count actually decreases
      // This is more reliable than an arbitrary timeout
      await expect(async () => {
        const count = await page.locator('.diff-line-message-btn.has-message').count();
        expect(count).toBe(hasMessageCountBefore - 1);
      }).toPass({ timeout: 2000 });

      // Verify final state
      const hasMessageCountAfter = await page.locator('.diff-line-message-btn.has-message').count();
      expect(hasMessageCountAfter).toBe(hasMessageCountBefore - 1);

    } finally {
      await mockServer.reset(); // Reset server config and data
      await mockServer.stop();
    }
  });

  test('should display error when fetchReviewThreads GraphQL returns FORBIDDEN', async ({ page }) => {
    const mockServer = new MockServerManager();
    mockServer.port = 3000;
    await mockServer.checkHeartbeat();

    try {
      // Configure ONLY fetchReviewThreads to error (reviewThreads query)
      // Other operations should still work normally
      await mockServer.setConfig({
        graphqlErrors: {
          reviewThreads: {
            type: 'FORBIDDEN',
            path: ['reviewThreads'],
            message: 'Resource not accessible by personal access token'
          }
        }
      });

      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();

      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();

      // Select repo - this should work normally
      const repoDropdown = page.locator('#repo-select');
      await expect(repoDropdown).toBeVisible();
      await repoDropdown.locator('.fuzzy-dropdown-control').click();
      await repoDropdown.getByText('test_repo_1').click();

      // Select PR - this should work normally
      const prDropdown = page.locator('#pr-select');
      await expect(prDropdown.locator('.fuzzy-dropdown-control:not(.disabled)')).toBeVisible();
      await prDropdown.locator('.fuzzy-dropdown-control').click();
      await prDropdown.getByText('#1 -').click();

      // fetchReviewThreads is called when PR is selected - should trigger error
      await expect(page.locator('.error-page')).toBeVisible({ timeout: 1000 });
      await expect(page.locator('.error-message')).toContainText('FORBIDDEN');
      await expect(page.locator('.error-message')).toContainText('reviewThreads');
      await expect(page.locator('.error-message')).toContainText('Resource not accessible by personal access token');

      // Verify navbar and footer are still visible
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();

      // Verify other UI is hidden
      await expect(page.locator('.diff-viewer')).not.toBeVisible();
    } finally {
      await mockServer.reset();
      await mockServer.stop();
    }
  });

  test('should display error when resolveReviewThread GraphQL mutation returns FORBIDDEN', async ({ page }) => {
    const mockServer = new MockServerManager();
    mockServer.port = 3000;
    await mockServer.checkHeartbeat();

    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();

      // Login and navigate to PR first (without error config)
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();

      const repoDropdown = page.locator('#repo-select');
      await expect(repoDropdown).toBeVisible();
      await repoDropdown.locator('.fuzzy-dropdown-control').click();
      await repoDropdown.getByText('test_repo_1').click();

      const prDropdown = page.locator('#pr-select');
      await expect(prDropdown.locator('.fuzzy-dropdown-control:not(.disabled)')).toBeVisible();
      await prDropdown.locator('.fuzzy-dropdown-control').click();
      await prDropdown.getByText('#1 -').click();

      await expect(page.locator('.diff-viewer')).toBeVisible({ timeout: 1000 });

      // NOW configure error ONLY for resolveReviewThread mutation
      await mockServer.setConfig({
        graphqlErrors: {
          resolveReviewThread: {
            type: 'FORBIDDEN',
            path: ['resolveReviewThread'],
            message: 'Resource not accessible by personal access token'
          }
        }
      });

      // Find a resolve button and try to click it
      await page.locator('.diff-viewer').click();
      const resolveButton = page.locator('button:has-text("Resolve")').first();
      
      if (await resolveButton.isVisible()) {
        await resolveButton.click();

        // Error message should be displayed
        await expect(page.locator('.error-page')).toBeVisible({ timeout: 1000 });
        await expect(page.locator('.error-message')).toContainText('FORBIDDEN');
        await expect(page.locator('.error-message')).toContainText('resolveReviewThread');
      }
    } finally {
      await mockServer.reset();
      await mockServer.stop();
    }
  });

  test('should display error when addPullRequestReviewThread GraphQL mutation returns FORBIDDEN', async ({ page }) => {
    const mockServer = new MockServerManager();
    mockServer.port = 3000;
    await mockServer.checkHeartbeat();

    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();

      // Login and navigate first
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();

      const repoDropdown = page.locator('#repo-select');
      await expect(repoDropdown).toBeVisible();
      await repoDropdown.locator('.fuzzy-dropdown-control').click();
      await repoDropdown.getByText('test_repo_1').click();

      const prDropdown = page.locator('#pr-select');
      await expect(prDropdown.locator('.fuzzy-dropdown-control:not(.disabled)')).toBeVisible();
      await prDropdown.locator('.fuzzy-dropdown-control').click();
      await prDropdown.getByText('#1 -').click();

      await expect(page.locator('.diff-viewer')).toBeVisible({ timeout: 1000 });

      // NOW configure error ONLY for addPullRequestReviewThread mutation
      await mockServer.setConfig({
        graphqlErrors: {
          addPullRequestReviewThread: {
            type: 'FORBIDDEN',
            path: ['addPullRequestReviewThread'],
            message: 'Resource not accessible by personal access token'
          }
        }
      });

      // Try to add a comment to pending review
      await page.locator('.diff-viewer').click();
      const lineWithNumber = page.locator('.diff-line:has(.diff-line-number:not(:empty))').first();
      await lineWithNumber.hover();

      const messageButton = lineWithNumber.locator('.diff-line-message-btn.add-message');
      await messageButton.click();

      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });

      const textarea = page.locator('.comment-modal-textarea');
      await textarea.fill('Test comment that will trigger FORBIDDEN error');

      const submitButton = page.locator('.comment-modal-submit-btn');
      await submitButton.click();

      // Error message should be displayed
      await expect(page.locator('.error-page')).toBeVisible({ timeout: 1000 });
      await expect(page.locator('.error-message')).toContainText('FORBIDDEN');
      await expect(page.locator('.error-message')).toContainText('addPullRequestReviewThread');
    } finally {
      await mockServer.reset();
      await mockServer.stop();
    }
  });

  test('should display error when updatePullRequestReviewComment GraphQL mutation returns FORBIDDEN', async ({ page }) => {
    const mockServer = new MockServerManager();
    mockServer.port = 3000;
    await mockServer.checkHeartbeat();

    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();

      // Login and navigate first
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();

      const repoDropdown = page.locator('#repo-select');
      await expect(repoDropdown).toBeVisible();
      await repoDropdown.locator('.fuzzy-dropdown-control').click();
      await repoDropdown.getByText('test_repo_1').click();

      const prDropdown = page.locator('#pr-select');
      await expect(prDropdown.locator('.fuzzy-dropdown-control:not(.disabled)')).toBeVisible();
      await prDropdown.locator('.fuzzy-dropdown-control').click();
      await prDropdown.getByText('#1 -').click();

      await expect(page.locator('.diff-viewer')).toBeVisible({ timeout: 1000 });

      // NOW configure error ONLY for updatePullRequestReviewComment mutation
      await mockServer.setConfig({
        graphqlErrors: {
          updatePullRequestReviewComment: {
            type: 'FORBIDDEN',
            path: ['updatePullRequestReviewComment'],
            message: 'Resource not accessible by personal access token'
          }
        }
      });

      // Find an existing comment and try to edit it
      await page.locator('.diff-viewer').click();
      
      // Click on existing comment thread
      const messageWithComments = page.locator('.diff-line-message-btn.has-message').first();
      await messageWithComments.click();

      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 1000 });

      // Click edit button on first comment
      const editButton = page.locator('.comment-edit-btn').first();
      await editButton.click();

      // Edit the comment
      const textarea = page.locator('.comment-modal-textarea');
      await textarea.fill('Updated comment that will trigger FORBIDDEN error');

      // Submit the edit
      const submitButton = page.locator('.comment-modal-submit-btn');
      await submitButton.click();

      // Error message should be displayed
      await expect(page.locator('.error-page')).toBeVisible({ timeout: 1000 });
      await expect(page.locator('.error-message')).toContainText('FORBIDDEN');
      await expect(page.locator('.error-message')).toContainText('updatePullRequestReviewComment');
    } finally {
      await mockServer.reset();
      await mockServer.stop();
    }
  });
});
