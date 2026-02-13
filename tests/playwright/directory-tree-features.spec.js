import { test, expect } from '@playwright/test';
import { MockServerManager } from './mock-server-manager.js';

const BASE_URL = '/GH-Quick-Review/';

test.describe('Directory Browser - File Tree Features', () => {
  test('should display nested directory structure with icons', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
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
      await expect(page.locator('text=src')).toBeVisible();
      await expect(page.locator('text=styles')).toBeVisible();
      await expect(page.locator('text=themes')).toBeVisible();
      await expect(page.locator('text=utils')).toBeVisible();
      await expect(page.locator('text=api')).toBeVisible();
      
      // Check that files are visible
      await expect(page.locator('text=dark.css')).toBeVisible();
      await expect(page.locator('text=client.ts')).toBeVisible();
      await expect(page.locator('text=config.json')).toBeVisible();
    } finally {
      await mockServer.stop();
    }
  });

  test('should show git status indicators for files', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
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
      await expect(modifiedFiles).toHaveCount(2); // dark.css and client.ts are modified
      
      const addedFiles = page.locator('.git-status:has-text("+")');
      await expect(addedFiles.first()).toBeVisible(); // Multiple new files
    } finally {
      await mockServer.stop();
    }
  });

  test('should collapse and expand directories when clicked', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
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
      
      // Initially, nested directories should be visible (expanded)
      await expect(page.locator('text=themes')).toBeVisible();
      await expect(page.locator('text=dark.css')).toBeVisible();
      
      // Click the styles directory to collapse it
      await page.locator('.directory-entry-content:has-text("styles")').first().click();
      
      // Wait a moment for the collapse
      await page.waitForTimeout(100);
      
      // themes and dark.css should no longer be visible
      await expect(page.locator('text=themes')).not.toBeVisible();
      await expect(page.locator('text=dark.css')).not.toBeVisible();
      
      // Click styles again to expand
      await page.locator('.directory-entry-content:has-text("styles")').first().click();
      await page.waitForTimeout(100);
      
      // Should be visible again
      await expect(page.locator('text=themes')).toBeVisible();
      await expect(page.locator('text=dark.css')).toBeVisible();
    } finally {
      await mockServer.stop();
    }
  });

  test('should select a file when clicked and highlight it', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
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
    const port = await mockServer.start(null, 3000);
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
      
      // test_repo_1 PR #1 has comments on example.cs and example.js
      // Check for comment indicators
      const commentIndicators = page.locator('.comment-indicator');
      await expect(commentIndicators.first()).toBeVisible();
    } finally {
      await mockServer.stop();
    }
  });

  test('should sort directories before files', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
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
      
      // Get all top-level entries
      const entries = page.locator('.directory-tree > .directory-entry');
      const firstEntry = entries.first();
      const lastEntry = entries.last();
      
      // First entry should be the src directory (has a chevron)
      await expect(firstEntry.locator('.chevron')).toBeVisible();
      
      // Last entries should be files (no chevron)
      await expect(lastEntry.locator('.chevron')).not.toBeVisible();
    } finally {
      await mockServer.stop();
    }
  });

  test('should display appropriate file icons for different file types', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 3000);
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
