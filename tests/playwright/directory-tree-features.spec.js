import { test, expect } from '@playwright/test';
import { MockServerManager } from './mock-server-manager.js';

const BASE_URL = '/GH-Quick-Review/';

/**
 * Ensures the directory browser is open. Opens it if it's currently closed.
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
async function ensureDirectoryOpen(page) {
  const dirBrowser = page.locator('.directory-browser');
  const isOpen = await dirBrowser.evaluate((el) => {
    // Check if the browser has focus-within (open state) by checking if any child has focus
    return el.matches(':focus-within');
  });
  
  if (!isOpen) {
    await page.locator('.directory-browser-toggle').click();
  }
}

/**
 * Ensures the directory browser is closed. Closes it if it's currently open.
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
async function ensureDirectoryClosed(page) {
  const dirBrowser = page.locator('.directory-browser');
  const isOpen = await dirBrowser.evaluate((el) => {
    return el.matches(':focus-within');
  });
  
  if (isOpen) {
    await page.locator('.directory-browser-toggle').click();
  }
}

test.describe('Directory Browser - File Tree Features', { tag: '@parallel' }, () => {
  test('should display nested directory structure with icons', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
        localStorage.setItem('selected_repo', 'test_user/test_repo_2');
        localStorage.setItem('selected_pr', '1');
      });
      await page.reload();
      
      // Wait for directory browser to be visible
      await expect(page.locator('.directory-browser')).toBeVisible();
      
      // Check that nested directories are visible
      // Use .entry-name to avoid matching file paths that contain the same text
      await expect(page.locator('.entry-name:has-text("src")').first()).toBeVisible();
      await expect(page.locator('.entry-name:has-text("styles")').first()).toBeVisible();
      await expect(page.locator('.entry-name:has-text("themes")').first()).toBeVisible();
      await expect(page.locator('.entry-name:has-text("utils")').first()).toBeVisible();
      await expect(page.locator('.entry-name:has-text("api")').first()).toBeVisible();
      
      // Check that files are visible
      await expect(page.locator('.entry-name:has-text("dark.css")').first()).toBeVisible();
      await expect(page.locator('.entry-name:has-text("client.ts")').first()).toBeVisible();
      await expect(page.locator('.entry-name:has-text("config.json")').first()).toBeVisible();
    } finally {
      await mockServer.stop();
    }
  });

  test('should show git status indicators for files', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
        localStorage.setItem('selected_repo', 'test_user/test_repo_2');
        localStorage.setItem('selected_pr', '1');
      });
      await page.reload();
      
      // Wait for directory browser
      await expect(page.locator('.directory-browser')).toBeVisible();
      
      // Check for git status indicators
      const modifiedFiles = page.locator('.git-status:has-text("~")');
      await expect(modifiedFiles).toHaveCount(3); // config.json, dark.css and client.ts are modified
      
      const addedFiles = page.locator('.git-status:has-text("+")');
      await expect(addedFiles.first()).toBeVisible(); // Multiple new files
    } finally {
      await mockServer.stop();
    }
  });

  test('should collapse and expand directories when clicked', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
        localStorage.setItem('selected_repo', 'test_user/test_repo_2');
        localStorage.setItem('selected_pr', '1');
      });
      await page.reload();
      
      await expect(page.locator('.directory-browser')).toBeVisible();
      
      // Ensure the directory browser is open
      await ensureDirectoryOpen(page);
      
      // Initially, nested directories should be visible (expanded)
      await expect(page.locator('.entry-name:has-text("themes")').first()).toBeVisible();
      await expect(page.locator('.entry-name:has-text("dark.css")').first()).toBeVisible();
      
      // Click the styles directory to collapse it
      await page.locator('.directory-entry-content:has-text("styles")').first().click();
      
      // Wait a moment for the collapse
      await page.waitForTimeout(100);
      
      // themes and dark.css should no longer be visible
      await expect(page.locator('.entry-name:has-text("themes")').first()).not.toBeVisible();
      await expect(page.locator('.entry-name:has-text("dark.css")').first()).not.toBeVisible();
      
      // Click styles again to expand
      await page.locator('.directory-entry-content:has-text("styles")').first().click();
      await page.waitForTimeout(100);
      
      // Should be visible again
      await expect(page.locator('.entry-name:has-text("themes")').first()).toBeVisible();
      await expect(page.locator('.entry-name:has-text("dark.css")').first()).toBeVisible();
    } finally {
      await mockServer.stop();
    }
  });

  test('should select a file when clicked and highlight it', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
        localStorage.setItem('selected_repo', 'test_user/test_repo_2');
        localStorage.setItem('selected_pr', '1');
      });
      await page.reload();
      
      await expect(page.locator('.directory-browser')).toBeVisible();
      
      // Ensure the directory browser is open
      await ensureDirectoryOpen(page);
      
      // Click on a file
      const clientTsEntry = page.locator('.directory-entry-content:has-text("client.ts")').first();
      await clientTsEntry.click();
      
      // Wait for selection
      await page.waitForTimeout(100);
      
      // Check that the file is now selected (has the .selected class)
      await expect(clientTsEntry).toHaveClass(/selected/);
      
      // Click on another file
      const configJsonEntry = page.locator('.directory-entry-content:has-text("config.json")').first();
      await configJsonEntry.click();
      
      await page.waitForTimeout(100);
      
      // The new file should be selected
      await expect(configJsonEntry).toHaveClass(/selected/);
      
      // The previous file should no longer be selected
      await expect(clientTsEntry).not.toHaveClass(/selected/);
    } finally {
      await mockServer.stop();
    }
  });

  test('should show comment indicators for files with comments', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
        localStorage.setItem('selected_repo', 'test_user/test_repo_1');
        localStorage.setItem('selected_pr', '1');
      });
      await page.reload();
      
      await expect(page.locator('.directory-browser')).toBeVisible();
      
      // test_repo_1 PR #1 has comments on:
      // - empty-lines.txt: 1 PENDING comment (line 3) - ISOLATED pending comment test case!
      // - example.js: 1 COMMENTED comment (line 15)
      // - example.cs: 1 COMMENTED comment (line 32)
      // The comment indicator is just an ICON (not a number), shown when commentCount > 0
      
      // Check for comment indicators - should be exactly 3 (one per file with comments)
      const commentIndicators = page.locator('.comment-indicator');
      await expect(commentIndicators).toHaveCount(3);
      
      // CRITICAL: Check empty-lines.txt has a comment indicator
      // This file ONLY has a PENDING comment, nothing else
      // If this shows up, pending comments are working correctly!
      const emptyLinesEntry = page.locator('.directory-entry-content:has-text("empty-lines.txt")');
      const emptyLinesIndicator = emptyLinesEntry.locator('.comment-indicator');
      await expect(emptyLinesIndicator).toBeVisible();
      
      // Also check the other files for completeness
      const exampleJsEntry = page.locator('.directory-entry-content:has-text("example.js")');
      const exampleJsIndicator = exampleJsEntry.locator('.comment-indicator');
      await expect(exampleJsIndicator).toBeVisible();
      
      const exampleCsEntry = page.locator('.directory-entry-content:has-text("example.cs")');
      const exampleCsIndicator = exampleCsEntry.locator('.comment-indicator');
      await expect(exampleCsIndicator).toBeVisible();
    } finally {
      await mockServer.stop();
    }
  });

  test('should sort directories before files', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
        localStorage.setItem('selected_repo', 'test_user/test_repo_2');
        localStorage.setItem('selected_pr', '1');
      });
      await page.reload();
      
      await expect(page.locator('.directory-browser')).toBeVisible();
      
      // Ensure the directory browser is open
      await ensureDirectoryOpen(page);
      
      // Get all top-level entries
      const entries = page.locator('.directory-tree > .directory-entry');
      const firstEntry = entries.first();
      const lastEntry = entries.last();
      
      // First entry should be the src directory (has a chevron in its direct child .directory-entry-content)
      await expect(firstEntry.locator('> .directory-entry-content > .chevron')).toBeVisible();
      
      // Last entry should be a file (no chevron in its direct child .directory-entry-content)
      await expect(lastEntry.locator('> .directory-entry-content > .chevron')).not.toBeVisible();
    } finally {
      await mockServer.stop();
    }
  });

  test('should display appropriate file icons for different file types', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('github_pat', 'test_token_12345');
        localStorage.setItem('selected_repo', 'test_user/test_repo_2');
        localStorage.setItem('selected_pr', '1');
      });
      await page.reload();
      
      await expect(page.locator('.directory-browser')).toBeVisible();
      
      // All directories should have folder icons
      const directories = page.locator('.directory-entry-content:has(.chevron)');
      const directoryCount = await directories.count();
      
      for (let i = 0; i < directoryCount; i++) {
        const dir = directories.nth(i);
        await expect(dir.locator('.file-icon')).toBeVisible();
      }
      
      // All files should have file icons
      const files = page.locator('.directory-entry-content').filter({ hasNot: page.locator('.chevron') });
      const fileCount = await files.count();
      
      for (let i = 0; i < fileCount; i++) {
        const file = files.nth(i);
        await expect(file.locator('.file-icon')).toBeVisible();
      }
    } finally {
      await mockServer.stop();
    }
  });
});
