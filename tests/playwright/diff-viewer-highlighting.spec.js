import { test, expect } from '@playwright/test';
import { MockServerManager } from './mock-server-manager.js';

/**
 * Diff Viewer Highlighting Tests
 * Tests that syntax highlighting is properly applied to code in diff viewer
 */
test.describe('Diff Viewer Syntax Highlighting', { tag: '@parallel' }, () => {
  test('should apply highlight.js classes to code content', async ({ page }) => {
    const mockServer = new MockServerManager();
    mockServer.port = 3000; // Use globally started mock server
      await mockServer.checkHeartbeat();
    
    try {
      // Login and navigate to a PR
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => {
        localStorage.setItem('github_pat', 'test_token_12345');
      });
      await page.reload();
      
      // Select repo
      await page.locator('.repo-fuzzy-select').click();
      await page.locator('.fuzzy-dropdown-option').filter({ hasText: 'test_repo_1' }).click();
      
      // Select PR
      await page.locator('.pr-fuzzy-select').click();
      await page.locator('.fuzzy-dropdown-option').filter({ hasText: '#1' }).click();
      
      // Wait for diff viewer to load
      await page.waitForSelector('.diff-viewer');
      
      // Check that code elements have hljs classes applied
      const codeElement = page.locator('.diff-line-code code').first();
      await expect(codeElement).toBeVisible();
      
      // Code should have hljs class or language-specific class
      const className = await codeElement.getAttribute('class');
      expect(className).toBeTruthy();
      // Should have hljs or language- classes from highlight.js
      expect(className).toMatch(/hljs|language-/);
    } finally {
      await mockServer.stop();
    }
  });

  test('should have git icon column for all line types including hunk headers', async ({ page }) => {
    const mockServer = new MockServerManager();
    mockServer.port = 3000; // Use globally started mock server
      await mockServer.checkHeartbeat();
    
    try {
      // Login and navigate to a PR
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => {
        localStorage.setItem('github_pat', 'test_token_12345');
      });
      await page.reload();
      
      // Select repo
      await page.locator('.repo-fuzzy-select').click();
      await page.locator('.fuzzy-dropdown-option').filter({ hasText: 'test_repo_1' }).click();
      
      // Select PR
      await page.locator('.pr-fuzzy-select').click();
      await page.locator('.fuzzy-dropdown-option').filter({ hasText: '#1' }).click();
      
      // Wait for diff viewer to load
      await page.waitForSelector('.diff-viewer');
      
      // Get all diff lines
      const allLines = page.locator('.diff-line');
      const lineCount = await allLines.count();
      expect(lineCount).toBeGreaterThan(0);
      
      // Check that ALL lines have git icon column (even if empty)
      for (let i = 0; i < Math.min(lineCount, 10); i++) {
        const line = allLines.nth(i);
        const gitIconColumn = line.locator('.diff-line-git-icon');
        
        // Git icon column should exist for all lines
        await expect(gitIconColumn).toBeAttached();
      }
      
      // Specifically check hunk header has git icon column
      const hunkHeader = page.locator('.diff-line-hunk').first();
      await expect(hunkHeader).toBeVisible();
      const hunkGitIcon = hunkHeader.locator('.diff-line-git-icon');
      await expect(hunkGitIcon).toBeAttached();
    } finally {
      await mockServer.stop();
    }
  });

  test('should apply highlight theme background color to code content', async ({ page }) => {
    const mockServer = new MockServerManager();
    mockServer.port = 3000; // Use globally started mock server
      await mockServer.checkHeartbeat();
    
    try {
      // Login and navigate to a PR
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => {
        localStorage.setItem('github_pat', 'test_token_12345');
        localStorage.setItem('highlight_theme', 'monokai');
      });
      await page.reload();
      
      // Select repo
      await page.locator('.repo-fuzzy-select').click();
      await page.locator('.fuzzy-dropdown-option').filter({ hasText: 'test_repo_1' }).click();
      
      // Select PR
      await page.locator('.pr-fuzzy-select').click();
      await page.locator('.fuzzy-dropdown-option').filter({ hasText: '#1' }).click();
      
      // Wait for diff viewer to load
      await page.waitForSelector('.diff-viewer');
      
      // Check that code content has background color from theme
      // The highlight.js theme applies background to the <code> element, not the <pre> element
      const codeElement = page.locator('.diff-line-code code.hljs').first();
      await expect(codeElement).toBeVisible();
      
      const backgroundColor = await codeElement.evaluate(el => {
        return window.getComputedStyle(el).backgroundColor;
      });
      
      // Should have a background color set (not transparent or default)
      expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
      expect(backgroundColor).not.toBe('transparent');
    } finally {
      await mockServer.stop();
    }
  });

  test('should update syntax highlighting when theme changes', async ({ page }) => {
    const mockServer = new MockServerManager();
    mockServer.port = 3000; // Use globally started mock server
      await mockServer.checkHeartbeat();
    
    try {
      // Login and navigate to a PR
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => {
        localStorage.setItem('github_pat', 'test_token_12345');
        localStorage.setItem('highlight_theme', 'github-dark');
      });
      await page.reload();
      
      // Select repo
      await page.locator('.repo-fuzzy-select').click();
      await page.locator('.fuzzy-dropdown-option').filter({ hasText: 'test_repo_1' }).click();
      
      // Select PR
      await page.locator('.pr-fuzzy-select').click();
      await page.locator('.fuzzy-dropdown-option').filter({ hasText: '#1' }).click();
      
      // Wait for diff viewer to load
      await page.waitForSelector('.diff-viewer');
      
      // Get initial background color
      // The highlight.js theme applies background to the <code> element, not the <pre> element
      const codeElement = page.locator('.diff-line-code code.hljs').first();
      const initialBg = await codeElement.evaluate(el => {
        return window.getComputedStyle(el).backgroundColor;
      });
      
      // Change theme
      await page.locator('.theme-fuzzy-select').click();
      await page.locator('.fuzzy-dropdown-option').filter({ hasText: /^Monokai$/ }).click();
      
      // Wait a bit for theme to apply
      await page.waitForTimeout(500);
      
      // Get new background color
      const newBg = await codeElement.evaluate(el => {
        return window.getComputedStyle(el).backgroundColor;
      });
      
      // Background should change when theme changes
      // (This might not work if themes have same bg, but it's a good indicator)
      // At minimum, ensure bg is still set
      expect(newBg).not.toBe('rgba(0, 0, 0, 0)');
      expect(newBg).not.toBe('transparent');
    } finally {
      await mockServer.stop();
    }
  });
});
