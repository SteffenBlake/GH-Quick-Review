import { test, expect } from '@playwright/test';
import { MockServerManager } from './mock-server-manager.js';

test.describe('Comment Management', () => {
  test('should successfully create a new comment on a line', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.start(null, 3000);
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Select repo and PR
      await expect(page.locator('#repo-select')).toBeVisible();
      await page.locator('#repo-select').selectOption('test_user/test_repo_1');
      await expect(page.locator('#pr-select')).toBeVisible();
      await page.locator('#pr-select').selectOption('1');
      
      // Wait for diff viewer to load
      await expect(page.locator('.diff-viewer')).toBeVisible({ timeout: 10000 });
      
      // Click on a line number to open comment modal
      const lineNumber = page.locator('.line-number').first();
      await lineNumber.click();
      
      // Modal should appear and be focused
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 5000 });
      
      // Type a comment
      const textarea = page.locator('.comment-modal-textarea');
      await textarea.fill('This is a new test comment');
      
      // Submit the comment
      await page.getByRole('button', { name: 'Comment' }).click();
      
      // Modal should close (lose focus)
      await expect(page.locator('.comment-modal')).not.toBeFocused({ timeout: 5000 });
      
      // Success! No error should be shown
      // If we got this far without an alert dialog, the comment was created successfully
    } finally {
      await mockServer.stop();
    }
  });

  test('should successfully edit an existing comment', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.start(null, 3000);
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Select repo and PR
      await expect(page.locator('#repo-select')).toBeVisible();
      await page.locator('#repo-select').selectOption('test_user/test_repo_1');
      await expect(page.locator('#pr-select')).toBeVisible();
      await page.locator('#pr-select').selectOption('1');
      
      // Wait for diff viewer to load
      await expect(page.locator('.diff-viewer')).toBeVisible({ timeout: 10000 });
      
      // Click on a comment icon to open existing thread
      const commentIcon = page.locator('.comment-icon').first();
      await commentIcon.click();
      
      // Modal should appear with existing comments
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 5000 });
      await expect(page.locator('.comment-item')).toBeVisible();
      
      // Click edit button on the first comment (assuming user owns it based on test data)
      const editButton = page.locator('.comment-edit-btn').first();
      await editButton.click();
      
      // Edit textarea should appear
      const editTextarea = page.locator('.comment-edit-textarea');
      await expect(editTextarea).toBeVisible();
      
      // Modify the comment
      await editTextarea.fill('This is an updated comment');
      
      // Click Save
      await page.getByRole('button', { name: 'Save' }).click();
      
      // Edit form should close
      await expect(editTextarea).not.toBeVisible({ timeout: 5000 });
      
      // Success! No error should be shown
    } finally {
      await mockServer.stop();
    }
  });

  test('should successfully reply to an existing comment thread', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.start(null, 3000);
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Select repo and PR
      await expect(page.locator('#repo-select')).toBeVisible();
      await page.locator('#repo-select').selectOption('test_user/test_repo_1');
      await expect(page.locator('#pr-select')).toBeVisible();
      await page.locator('#pr-select').selectOption('1');
      
      // Wait for diff viewer to load
      await expect(page.locator('.diff-viewer')).toBeVisible({ timeout: 10000 });
      
      // Click on a comment icon to open existing thread
      const commentIcon = page.locator('.comment-icon').first();
      await commentIcon.click();
      
      // Modal should appear with existing comments
      await expect(page.locator('.comment-modal')).toBeFocused({ timeout: 5000 });
      await expect(page.locator('.comment-item')).toBeVisible();
      
      // Type a reply
      const replyTextarea = page.locator('.comment-modal-textarea');
      await replyTextarea.fill('This is a reply to the thread');
      
      // Submit the reply
      await page.getByRole('button', { name: 'Reply' }).click();
      
      // Modal should close
      await expect(page.locator('.comment-modal')).not.toBeFocused({ timeout: 5000 });
      
      // Success! No error should be shown
    } finally {
      await mockServer.stop();
    }
  });
});
