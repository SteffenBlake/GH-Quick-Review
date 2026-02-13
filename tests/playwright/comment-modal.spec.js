/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { test, expect } from '@playwright/test';
import { MockServerManager } from './mock-server-manager.js';

test.describe('Comment Modal', () => {
  test('should open modal when clicking add comment button on diff line', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
    
    try {
      // Navigate to the app
      await page.goto('/GH-Quick-Review/');
      
      // Login with PAT
      await page.fill('input[placeholder="Enter your GitHub PAT"]', 'test-token');
      await page.click('button:has-text("Login")');
      
      // Wait for repos to load and select first repo
      await page.waitForSelector('text=test_repo_1');
      await page.click('text=test_repo_1');
      
      // Select a PR
      await page.waitForSelector('text=#1 - Add new feature');
      await page.click('text=#1 - Add new feature');
      
      // Wait for diff to load
      await page.waitForSelector('.diff-line');
      
      // Find and click an "add comment" button (󰙓 icon)
      const addCommentBtn = page.locator('.diff-line-message-btn.add-message').first();
      await addCommentBtn.click();
      
      // Modal should be visible
      await page.waitForSelector('.comment-modal:focus-within');
      
      // Should show "New Comment" header
      await expect(page.locator('.comment-modal h2')).toContainText('New Comment');
      
      // Should have textarea
      await expect(page.locator('.comment-modal-textarea')).toBeVisible();
      
      // Should have Cancel and Comment buttons
      await expect(page.locator('.comment-modal button:has-text("Cancel")')).toBeVisible();
      await expect(page.locator('.comment-modal button:has-text("Comment")')).toBeVisible();
      
      // Comment button should be disabled when textarea is empty
      await expect(page.locator('.comment-modal button:has-text("Comment")')).toBeDisabled();
      
    } finally {
      await mockServer.stop();
    }
  });

  test('should close modal when clicking Cancel button', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
    
    try {
      // Navigate to the app
      await page.goto('/GH-Quick-Review/');
      
      // Login
      await page.fill('input[placeholder="Enter your GitHub PAT"]', 'test-token');
      await page.click('button:has-text("Login")');
      
      // Navigate to a PR with diffs
      await page.waitForSelector('text=test_repo_1');
      await page.click('text=test_repo_1');
      await page.waitForSelector('text=#1 - Add new feature');
      await page.click('text=#1 - Add new feature');
      await page.waitForSelector('.diff-line');
      
      // Open modal
      const addCommentBtn = page.locator('.diff-line-message-btn.add-message').first();
      await addCommentBtn.click();
      await page.waitForSelector('.comment-modal:focus-within');
      
      // Click Cancel
      await page.click('.comment-modal button:has-text("Cancel")');
      
      // Modal should lose focus and become hidden
      await page.waitForSelector('.comment-modal:not(:focus-within)');
      
    } finally {
      await mockServer.stop();
    }
  });

  test('should close modal when clicking outside', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
    
    try {
      // Navigate to the app
      await page.goto('/GH-Quick-Review/');
      
      // Login
      await page.fill('input[placeholder="Enter your GitHub PAT"]', 'test-token');
      await page.click('button:has-text("Login")');
      
      // Navigate to a PR
      await page.waitForSelector('text=test_repo_1');
      await page.click('text=test_repo_1');
      await page.waitForSelector('text=#1 - Add new feature');
      await page.click('text=#1 - Add new feature');
      await page.waitForSelector('.diff-line');
      
      // Open modal
      const addCommentBtn = page.locator('.diff-line-message-btn.add-message').first();
      await addCommentBtn.click();
      await page.waitForSelector('.comment-modal:focus-within');
      
      // Click outside the modal (on the overlay)
      await page.click('.comment-modal', { position: { x: 5, y: 5 } });
      
      // Modal should lose focus and become hidden
      await page.waitForSelector('.comment-modal:not(:focus-within)', { timeout: 2000 });
      
    } finally {
      await mockServer.stop();
    }
  });

  test('should enable Comment button when text is entered', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
    
    try {
      // Navigate to the app
      await page.goto('/GH-Quick-Review/');
      
      // Login
      await page.fill('input[placeholder="Enter your GitHub PAT"]', 'test-token');
      await page.click('button:has-text("Login")');
      
      // Navigate to a PR
      await page.waitForSelector('text=test_repo_1');
      await page.click('text=test_repo_1');
      await page.waitForSelector('text=#1 - Add new feature');
      await page.click('text=#1 - Add new feature');
      await page.waitForSelector('.diff-line');
      
      // Open modal
      const addCommentBtn = page.locator('.diff-line-message-btn.add-message').first();
      await addCommentBtn.click();
      await page.waitForSelector('.comment-modal:focus-within');
      
      // Type some text
      await page.fill('.comment-modal-textarea', 'This is a test comment');
      
      // Comment button should now be enabled
      await expect(page.locator('.comment-modal button:has-text("Comment")')).toBeEnabled();
      
    } finally {
      await mockServer.stop();
    }
  });

  test('modal should be 80vw wide and shrink-wrap height', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
    
    try {
      // Navigate to the app
      await page.goto('/GH-Quick-Review/');
      
      // Login
      await page.fill('input[placeholder="Enter your GitHub PAT"]', 'test-token');
      await page.click('button:has-text("Login")');
      
      // Navigate to a PR
      await page.waitForSelector('text=test_repo_1');
      await page.click('text=test_repo_1');
      await page.waitForSelector('text=#1 - Add new feature');
      await page.click('text=#1 - Add new feature');
      await page.waitForSelector('.diff-line');
      
      // Open modal
      const addCommentBtn = page.locator('.diff-line-message-btn.add-message').first();
      await addCommentBtn.click();
      await page.waitForSelector('.comment-modal:focus-within');
      
      // Check modal content dimensions
      const modalContent = page.locator('.comment-modal-content');
      const box = await modalContent.boundingBox();
      const viewport = page.viewportSize();
      
      // Should be approximately 80% of viewport width
      const expectedWidth = viewport.width * 0.8;
      expect(Math.abs(box.width - expectedWidth)).toBeLessThan(10); // Allow 10px tolerance
      
      // Height should be less than 80% of viewport (shrink-wrapped)
      const maxHeight = viewport.height * 0.8;
      expect(box.height).toBeLessThanOrEqual(maxHeight);
      
    } finally {
      await mockServer.stop();
    }
  });
});
