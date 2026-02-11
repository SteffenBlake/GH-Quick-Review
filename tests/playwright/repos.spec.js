import { test, expect } from '@playwright/test';
import { MockServerManager } from './mock-server-manager.js';

test.describe('Repos Dropdown', () => {
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
      await expect(page.locator('#repo-select')).toBeVisible({ timeout: 5000 });
    } finally {
      await mockServer.stop();
    }
  });

  test('should display repos dropdown after successful fetch', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.start(null, 3000);
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait for repos dropdown to appear
      await expect(page.locator('#repo-select')).toBeVisible();
      
      // Should have "Repo..." option
      await expect(page.locator('#repo-select option').first()).toHaveText('Repo...');
      
      // Should have repo options (without username prefix)
      const options = await page.locator('#repo-select option').allTextContents();
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
    await mockServer.start(null, 3000);
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait for dropdown
      await expect(page.locator('#repo-select')).toBeVisible();
      
      // Get available repos
      const options = await page.locator('#repo-select option').allTextContents();
      expect(options.length).toBeGreaterThan(1); // Should have placeholder + repos
      
      // Select a repo
      await page.locator('#repo-select').selectOption('test_user/test_repo_1');
      
      // Verify selection
      const selectedValue = await page.locator('#repo-select').inputValue();
      expect(selectedValue).toBe('test_user/test_repo_1');
    } finally {
      await mockServer.stop();
    }
  });
});
