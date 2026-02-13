import { test, expect } from '@playwright/test';
import { MockServerManager } from './mock-server-manager.js';

test.describe('Repos Dropdown', { tag: '@parallel' }, () => {
  test('should show loading spinner while fetching repos', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.start(null, 3000, { latency: 2000 }); // Add latency to see loading
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Should see loading spinner
      await expect(page.getByText(/Loading\.\.\./i)).toBeVisible({ timeout: 1000 });
      
      // Wait for repos to load
      await expect(page.locator('#repo-select')).toBeVisible({ timeout: 1000 });
    } finally {
      await mockServer.stop();
    }
  });

  test('should display repos dropdown after successful fetch', async ({ page }) => {
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
      
      // Wait for repos dropdown to appear
      const repoDropdown = page.locator('#repo-select');
      await expect(repoDropdown).toBeVisible();
      
      // Should show "Repo..." placeholder when nothing selected
      await expect(repoDropdown.locator('.fuzzy-dropdown-text')).toHaveText('Repo...');
      
      // Click to open dropdown
      await repoDropdown.locator('.fuzzy-dropdown-control').click();
      
      // Should have repo options (without username prefix)
      const options = await repoDropdown.locator('.fuzzy-dropdown-option').allTextContents();
      expect(options).toContain('test_repo_1');
      expect(options).toContain('test_repo_2');
    } finally {
      await mockServer.stop();
    }
  });

  test('should show error page when repos fetch returns 500', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.start(null, 3000, { listUserRepos: 500 });
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Should show error page
      await expect(page.getByRole('heading', { name: /Error/i })).toBeVisible();
      await expect(page.getByText(/Please logout and log back in to try again/i)).toBeVisible();
    } finally {
      await mockServer.stop();
    }
  });

  test('should show error page when repos fetch returns 401', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.start(null, 3000, { listUserRepos: 401 });
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Should show error page
      await expect(page.getByRole('heading', { name: /Error/i })).toBeVisible();
      await expect(page.getByText(/Please logout and log back in to try again/i)).toBeVisible();
    } finally {
      await mockServer.stop();
    }
  });

  test('should allow selecting a repository from dropdown', async ({ page }) => {
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
      
      // Wait for dropdown
      const repoDropdown = page.locator('#repo-select');
      await expect(repoDropdown).toBeVisible();
      
      // Click to open dropdown
      await repoDropdown.locator('.fuzzy-dropdown-control').click();
      
      // Get available repos
      const options = await repoDropdown.locator('.fuzzy-dropdown-option').allTextContents();
      expect(options.length).toBe(2); // test_repo_1 and test_repo_2
      
      // Select a repo by clicking on it
      await repoDropdown.getByText('test_repo_1').click();
      
      // Verify selection - the dropdown should now show the selected repo name
      await expect(repoDropdown.locator('.fuzzy-dropdown-text')).toHaveText('test_repo_1');
    } finally {
      await mockServer.stop();
    }
  });

  test('should persist selected repo across page reloads', async ({ page }) => {
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
      
      // Wait for dropdown
      const repoDropdown = page.locator('#repo-select');
      await expect(repoDropdown).toBeVisible();
      
      // Click to open dropdown
      await repoDropdown.locator('.fuzzy-dropdown-control').click();
      
      // Select a repo by clicking on it
      await repoDropdown.getByText('test_repo_1').click();
      
      // Verify selection persisted to localStorage
      const storedRepo = await page.evaluate(() => localStorage.getItem('selected_repo'));
      expect(storedRepo).toBe('test_user/test_repo_1');
      
      // Reload the page
      await page.reload();
      
      // Wait for dropdown to appear again
      await expect(repoDropdown).toBeVisible();
      
      // Verify selection is still there
      await expect(repoDropdown.locator('.fuzzy-dropdown-text')).toHaveText('test_repo_1');
    } finally {
      await mockServer.stop();
    }
  });

  test('should clear selected repo on logout and reset on login', async ({ page }) => {
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
      
      // Wait for dropdown
      const repoDropdown = page.locator('#repo-select');
      await expect(repoDropdown).toBeVisible();
      
      // Click to open dropdown
      await repoDropdown.locator('.fuzzy-dropdown-control').click();
      
      // Select a repo
      await repoDropdown.getByText('test_repo_1').click();
      
      // Verify selection
      await expect(repoDropdown.locator('.fuzzy-dropdown-text')).toHaveText('test_repo_1');
      
      // Logout
      await page.getByRole('button', { name: /Logout/i }).click();
      
      // Verify we're back at login page
      await expect(page.getByPlaceholder('Enter your GitHub PAT')).toBeVisible();
      
      // Verify selected repo was cleared from localStorage
      const storedRepo = await page.evaluate(() => localStorage.getItem('selected_repo'));
      expect(storedRepo).toBeNull();
      
      // Login again
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait for dropdown
      await expect(repoDropdown).toBeVisible();
      
      // Verify dropdown is reset to placeholder (no selection)
      await expect(repoDropdown.locator('.fuzzy-dropdown-text')).toHaveText('Repo...');
    } finally {
      await mockServer.stop();
    }
  });
});
