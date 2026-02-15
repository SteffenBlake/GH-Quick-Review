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
      
      // Hover over a line to reveal the message button
      const diffLine = page.locator('.diff-line').first();
      await diffLine.hover();
      
      // Click on a message button to open comment modal
      const messageButton = page.locator('.diff-line-message-btn.add-message').first();
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
      
      // Click Save (use .first() since there might be other Save buttons on the page)
      await page.getByRole('button', { name: 'Save' }).first().click();
      
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
      
      // Hover over a line to reveal the message button
      const diffLine = page.locator('.diff-line').first();
      await diffLine.hover();
      
      // Step 1: Click "Add comment" button → modal should open
      const messageButton = page.locator('.diff-line-message-btn.add-message').first();
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
        
        if (!containerEl || !lastEl) return false;
        
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
      await page.getByRole('button', { name: /comment/i }).click();
      
      // BUG: The comment should appear immediately in the modal
      // The modal should transition from "New Comment" to showing the thread with the comment
      await expect(page.locator('.comment-item')).toHaveCount(1, { timeout: 1000 });
      await expect(page.locator('.comment-item-body')).toContainText('First comment in new thread');
      
      // The header should still show "Comment Thread" now
      await expect(page.locator('.comment-modal h2')).toContainText('Comment Thread');
      
    } finally {
      await mockServer.reset();
      await mockServer.stop();
    }
  });
});
