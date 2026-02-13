import { test, expect } from '@playwright/test';
import { MockServerManager } from './mock-server-manager.js';

test.describe('Pulls Dropdown', { tag: '@parallel' }, () => {
  test('should not show pulls dropdown when not logged in', async ({ page }) => {
    const mockServer = new MockServerManager();
    mockServer.port = 3000; // Use globally started mock server
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Should NOT see PR dropdown
      await expect(page.locator('#pr-select')).not.toBeVisible();
    } finally {
      await mockServer.stop();
    }
  });

  test('should show greyed out dropdown when no repo is selected', async ({ page }) => {
    const mockServer = new MockServerManager();
    mockServer.port = 3000; // Use globally started mock server
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait for repos dropdown
      await expect(page.locator('#repo-select')).toBeVisible();
      
      // PR dropdown should be visible but disabled
      const prSelect = page.locator('#pr-select');
      await expect(prSelect).toBeVisible();
      
      // Check that the control has disabled class
      await expect(prSelect.locator('.fuzzy-dropdown-control')).toHaveClass(/disabled/);
      
      // Should show "Pull Request..." placeholder
      await expect(prSelect.locator('.fuzzy-dropdown-text')).toHaveText('Pull Request...');
    } finally {
      await mockServer.stop();
    }
  });

  // Note: Loading spinner test removed - requires latency config which can't be done with shared mock server
  // TODO: Re-implement as @serial test with mock server API to configure latency

  test('should display PRs dropdown after successful fetch', async ({ page }) => {
    const mockServer = new MockServerManager();
    mockServer.port = 3000; // Use globally started mock server
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait for repos dropdown and select a repo
      const repoDropdown = page.locator('#repo-select');
      await expect(repoDropdown).toBeVisible();
      await repoDropdown.locator('.fuzzy-dropdown-control').click();
      await repoDropdown.getByText('test_repo_1').click();
      
      // Wait for PRs dropdown to be enabled
      const prDropdown = page.locator('#pr-select');
      await expect(prDropdown.locator('.fuzzy-dropdown-control:not(.disabled)')).toBeVisible();
      
      // Should show "Pull Request..." placeholder when nothing selected
      await expect(prDropdown.locator('.fuzzy-dropdown-text')).toHaveText('Pull Request...');
      
      // Click to open dropdown
      await prDropdown.locator('.fuzzy-dropdown-control').click();
      
      // Should have PR options with format "#{number} - {title}"
      const options = await prDropdown.locator('.fuzzy-dropdown-option').allTextContents();
      expect(options.length).toBe(2); // test_pull_1 and test_pull_2
      expect(options).toContainEqual(expect.stringContaining('#1 -'));
      expect(options).toContainEqual(expect.stringContaining('#2 -'));
    } finally {
      await mockServer.stop();
    }
  });

  // Note: Error tests removed - require error config which can't be done with shared mock server
  // TODO: Re-implement as @serial tests with mock server API to configure errors

  test('should allow selecting a PR from dropdown', async ({ page }) => {
    const mockServer = new MockServerManager();
    mockServer.port = 3000; // Use globally started mock server
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait for repos dropdown and select a repo
      const repoDropdown = page.locator('#repo-select');
      await expect(repoDropdown).toBeVisible();
      await repoDropdown.locator('.fuzzy-dropdown-control').click();
      await repoDropdown.getByText('test_repo_1').click();
      
      // Wait for PR dropdown to be enabled
      const prDropdown = page.locator('#pr-select');
      await expect(prDropdown.locator('.fuzzy-dropdown-control:not(.disabled)')).toBeVisible();
      
      // Click to open PR dropdown
      await prDropdown.locator('.fuzzy-dropdown-control').click();
      
      // Get available PRs
      const options = await prDropdown.locator('.fuzzy-dropdown-option').allTextContents();
      expect(options.length).toBe(2); // test_pull_1 and test_pull_2
      
      // Select PR #1
      await prDropdown.getByText('#1 -').click();
      
      // Verify selection - dropdown should show the PR text
      await expect(prDropdown.locator('.fuzzy-dropdown-text')).toContainText('#1 -');
    } finally {
      await mockServer.stop();
    }
  });

  test('should persist selected PR across page reloads', async ({ page }) => {
    const mockServer = new MockServerManager();
    mockServer.port = 3000; // Use globally started mock server
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait for repos dropdown and select a repo
      const repoDropdown = page.locator('#repo-select');
      await expect(repoDropdown).toBeVisible();
      await repoDropdown.locator('.fuzzy-dropdown-control').click();
      await repoDropdown.getByText('test_repo_1').click();
      
      // Wait for PR dropdown
      const prDropdown = page.locator('#pr-select');
      await expect(prDropdown.locator('.fuzzy-dropdown-control:not(.disabled)')).toBeVisible();
      
      // Select a PR
      await prDropdown.locator('.fuzzy-dropdown-control').click();
      await prDropdown.getByText('#1 -').click();
      
      // Verify selection persisted to localStorage
      const storedPr = await page.evaluate(() => localStorage.getItem('selected_pr'));
      expect(storedPr).toBe('1');
      
      // Reload the page
      await page.reload();
      
      // Wait for dropdowns to appear again
      await expect(repoDropdown).toBeVisible();
      await expect(prDropdown).toBeVisible();
      
      // Verify selection is still there
      await expect(prDropdown.locator('.fuzzy-dropdown-text')).toContainText('#1 -');
    } finally {
      await mockServer.stop();
    }
  });

  test('should clear selected PR when repo changes', async ({ page }) => {
    const mockServer = new MockServerManager();
    mockServer.port = 3000; // Use globally started mock server
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait for repos dropdown and select a repo
      const repoDropdown = page.locator('#repo-select');
      await expect(repoDropdown).toBeVisible();
      await repoDropdown.locator('.fuzzy-dropdown-control').click();
      await repoDropdown.getByText('test_repo_1').click();
      
      // Wait for PR dropdown and select a PR
      const prDropdown = page.locator('#pr-select');
      await expect(prDropdown.locator('.fuzzy-dropdown-control:not(.disabled)')).toBeVisible();
      await prDropdown.locator('.fuzzy-dropdown-control').click();
      await prDropdown.getByText('#1 -').click();
      
      // Verify PR selection
      await expect(prDropdown.locator('.fuzzy-dropdown-text')).toContainText('#1 -');
      
      // Click on main content to unfocus directory browser (which auto-focuses on PR selection)
      await page.locator('main').click();
      // Wait for directory browser to slide out (transition is 0.3s)
      await page.waitForTimeout(400);
      
      // Change repo
      await repoDropdown.locator('.fuzzy-dropdown-control').click();
      await repoDropdown.getByText('test_repo_2').click();
      
      // Wait for PR dropdown to reload - it should become disabled then re-enabled
      await expect(prDropdown.locator('.fuzzy-dropdown-control:not(.disabled)')).toBeVisible();
      
      // Verify PR dropdown is reset to placeholder (no selection)
      await expect(prDropdown.locator('.fuzzy-dropdown-text')).toHaveText('Pull Request...');
      
      // Verify selected PR was cleared from localStorage
      const storedPr = await page.evaluate(() => localStorage.getItem('selected_pr'));
      expect(storedPr).toBeNull();
    } finally {
      await mockServer.stop();
    }
  });

  test('should clear selected PR on logout and reset on login', async ({ page }) => {
    const mockServer = new MockServerManager();
    mockServer.port = 3000; // Use globally started mock server
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait for repos dropdown and select a repo
      const repoDropdown = page.locator('#repo-select');
      await expect(repoDropdown).toBeVisible();
      await repoDropdown.locator('.fuzzy-dropdown-control').click();
      await repoDropdown.getByText('test_repo_1').click();
      
      // Wait for PR dropdown and select a PR
      const prDropdown = page.locator('#pr-select');
      await expect(prDropdown.locator('.fuzzy-dropdown-control:not(.disabled)')).toBeVisible();
      await prDropdown.locator('.fuzzy-dropdown-control').click();
      await prDropdown.getByText('#1 -').click();
      
      // Verify PR selection
      await expect(prDropdown.locator('.fuzzy-dropdown-text')).toContainText('#1 -');
      
      // Logout
      await page.getByRole('button', { name: /Logout/i }).click();
      
      // Verify we're back at login page
      await expect(page.getByPlaceholder('Enter your GitHub PAT')).toBeVisible();
      
      // Verify selected PR was cleared from localStorage
      const storedPr = await page.evaluate(() => localStorage.getItem('selected_pr'));
      expect(storedPr).toBeNull();
      
      // Login again
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait for dropdowns
      await expect(repoDropdown).toBeVisible();
      await expect(prDropdown).toBeVisible();
      
      // Verify PR dropdown is reset to placeholder (no selection)
      await expect(prDropdown.locator('.fuzzy-dropdown-text')).toHaveText('Pull Request...');
    } finally {
      await mockServer.stop();
    }
  });

  test('should truncate long PR titles with CSS', async ({ page }) => {
    const mockServer = new MockServerManager();
    mockServer.port = 3000; // Use globally started mock server
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait for repos dropdown and select a repo
      const repoDropdown = page.locator('#repo-select');
      await expect(repoDropdown).toBeVisible();
      await repoDropdown.locator('.fuzzy-dropdown-control').click();
      await repoDropdown.getByText('test_repo_1').click();
      
      // Wait for PR dropdown
      const prDropdown = page.locator('#pr-select');
      await expect(prDropdown.locator('.fuzzy-dropdown-control:not(.disabled)')).toBeVisible();
      
      // Click to open PR dropdown
      await prDropdown.locator('.fuzzy-dropdown-control').click();
      
      // Check that fuzzy dropdown option elements have CSS for text truncation
      const optionStyle = await prDropdown.locator('.fuzzy-dropdown-option').first().evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          whiteSpace: computed.whiteSpace,
          overflow: computed.overflow,
          textOverflow: computed.textOverflow
        };
      });
      
      // Verify CSS truncation properties are set
      expect(optionStyle.whiteSpace).toBe('nowrap');
      expect(optionStyle.overflow).toBe('hidden');
      expect(optionStyle.textOverflow).toBe('ellipsis');
    } finally{
      await mockServer.stop();
    }
  });

  test('should re-enable PR dropdown when repo is selected after being disabled', async ({ page }) => {
    const mockServer = new MockServerManager();
    mockServer.port = 3000; // Use globally started mock server
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait for repos dropdown
      const repoDropdown = page.locator('#repo-select');
      await expect(repoDropdown).toBeVisible();
      
      // PR dropdown should be disabled initially (has disabled class)
      const prDropdown = page.locator('#pr-select');
      await expect(prDropdown.locator('.fuzzy-dropdown-control')).toHaveClass(/disabled/);
      
      // Select a repo
      await repoDropdown.locator('.fuzzy-dropdown-control').click();
      await repoDropdown.getByText('test_repo_1').click();
      
      // Wait for PRs to load - dropdown control should no longer be disabled
      await expect(prDropdown.locator('.fuzzy-dropdown-control:not(.disabled)')).toBeVisible();
      
      // Click to open PR dropdown
      await prDropdown.locator('.fuzzy-dropdown-control').click();
      
      // Should have PR options
      const options = await prDropdown.locator('.fuzzy-dropdown-option').allTextContents();
      expect(options.length).toBe(2);
    } finally {
      await mockServer.stop();
    }
  });
});
