import { test, expect } from '@playwright/test';
import { MockServerManager } from './mock-server-manager.js';

test.describe('Pulls Dropdown', () => {
  test('should not show pulls dropdown when not logged in', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.start(null, 3000);
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
    await mockServer.start(null, 3000);
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
      await expect(page.locator('#pr-select')).toBeVisible();
      await expect(page.locator('#pr-select')).toBeDisabled();
      
      // Should show "Pull Request..." placeholder
      const prSelect = page.locator('#pr-select');
      const selectedText = await prSelect.evaluate(el => el.options[el.selectedIndex].text);
      expect(selectedText).toBe('Pull Request...');
    } finally {
      await mockServer.stop();
    }
  });

  test('should show loading spinner while fetching PRs', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.start(null, 3000, { latency: 2000 });
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait for repos dropdown and select a repo
      await expect(page.locator('#repo-select')).toBeVisible();
      await page.locator('#repo-select').selectOption('test_user/test_repo_1');
      
      // Should see loading spinner for PRs
      await expect(page.locator('.pulls-loading')).toBeVisible({ timeout: 1000 });
      await expect(page.getByText(/Loading\.\.\./i)).toBeVisible();
      
      // Wait for PRs to load
      await expect(page.locator('#pr-select')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('.pulls-loading')).not.toBeVisible();
    } finally {
      await mockServer.stop();
    }
  });

  test('should display PRs dropdown after successful fetch', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.start(null, 3000);
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait for repos dropdown and select a repo
      await expect(page.locator('#repo-select')).toBeVisible();
      await page.locator('#repo-select').selectOption('test_user/test_repo_1');
      
      // Wait for PRs dropdown to appear
      await expect(page.locator('#pr-select')).toBeVisible();
      
      // Should have "Pull Request..." option
      const firstOption = await page.locator('#pr-select option').first().textContent();
      expect(firstOption).toBe('Pull Request...');
      
      // Should have PR options with format "#{number} - {title}"
      const options = await page.locator('#pr-select option').allTextContents();
      expect(options.length).toBeGreaterThan(1); // Should have placeholder + PRs
      expect(options).toContainEqual(expect.stringContaining('#1 -'));
      expect(options).toContainEqual(expect.stringContaining('#2 -'));
    } finally {
      await mockServer.stop();
    }
  });

  test('should show error page when PRs fetch returns 500', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.start(null, 3000, { listPulls: 500 });
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait for repos dropdown and select a repo
      await expect(page.locator('#repo-select')).toBeVisible();
      await page.locator('#repo-select').selectOption('test_user/test_repo_1');
      
      // Should show error page
      await expect(page.getByRole('heading', { name: /Error/i })).toBeVisible();
      await expect(page.getByText(/Please logout and log back in to try again/i)).toBeVisible();
    } finally {
      await mockServer.stop();
    }
  });

  test('should show error page when PRs fetch returns 401', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.start(null, 3000, { listPulls: 401 });
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait for repos dropdown and select a repo
      await expect(page.locator('#repo-select')).toBeVisible();
      await page.locator('#repo-select').selectOption('test_user/test_repo_1');
      
      // Should show error page
      await expect(page.getByRole('heading', { name: /Error/i })).toBeVisible();
      await expect(page.getByText(/Please logout and log back in to try again/i)).toBeVisible();
    } finally {
      await mockServer.stop();
    }
  });

  test('should allow selecting a PR from dropdown', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.start(null, 3000);
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait for repos dropdown and select a repo
      await expect(page.locator('#repo-select')).toBeVisible();
      await page.locator('#repo-select').selectOption('test_user/test_repo_1');
      
      // Wait for PR dropdown
      await expect(page.locator('#pr-select')).toBeVisible();
      
      // Get available PRs
      const options = await page.locator('#pr-select option').allTextContents();
      expect(options.length).toBeGreaterThan(1); // Should have placeholder + PRs
      
      // Select a PR
      await page.locator('#pr-select').selectOption('1');
      
      // Verify selection
      const selectedValue = await page.locator('#pr-select').inputValue();
      expect(selectedValue).toBe('1');
    } finally {
      await mockServer.stop();
    }
  });

  test('should persist selected PR across page reloads', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.start(null, 3000);
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait for repos dropdown and select a repo
      await expect(page.locator('#repo-select')).toBeVisible();
      await page.locator('#repo-select').selectOption('test_user/test_repo_1');
      
      // Wait for PR dropdown
      await expect(page.locator('#pr-select')).toBeVisible();
      
      // Select a PR
      await page.locator('#pr-select').selectOption('1');
      
      // Verify selection persisted to localStorage
      const storedPr = await page.evaluate(() => localStorage.getItem('selected_pr'));
      expect(storedPr).toBe('1');
      
      // Reload the page
      await page.reload();
      
      // Wait for dropdowns to appear again
      await expect(page.locator('#repo-select')).toBeVisible();
      await expect(page.locator('#pr-select')).toBeVisible();
      
      // Verify selection is still there
      const selectedValue = await page.locator('#pr-select').inputValue();
      expect(selectedValue).toBe('1');
    } finally {
      await mockServer.stop();
    }
  });

  test('should clear selected PR when repo changes', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.start(null, 3000);
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait for repos dropdown and select a repo
      await expect(page.locator('#repo-select')).toBeVisible();
      await page.locator('#repo-select').selectOption('test_user/test_repo_1');
      
      // Wait for PR dropdown and select a PR
      await expect(page.locator('#pr-select')).toBeVisible();
      await page.locator('#pr-select').selectOption('1');
      
      // Verify PR selection
      let selectedPrValue = await page.locator('#pr-select').inputValue();
      expect(selectedPrValue).toBe('1');
      
      // Change repo
      await page.locator('#repo-select').selectOption('test_user/test_repo_2');
      
      // Wait for PR dropdown to reload
      await expect(page.locator('#pr-select')).toBeVisible();
      
      // Verify PR dropdown is reset to empty (no selection)
      selectedPrValue = await page.locator('#pr-select').inputValue();
      expect(selectedPrValue).toBe('');
      
      // Verify selected PR was cleared from localStorage
      const storedPr = await page.evaluate(() => localStorage.getItem('selected_pr'));
      expect(storedPr).toBeNull();
    } finally {
      await mockServer.stop();
    }
  });

  test('should clear selected PR on logout and reset on login', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.start(null, 3000);
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait for repos dropdown and select a repo
      await expect(page.locator('#repo-select')).toBeVisible();
      await page.locator('#repo-select').selectOption('test_user/test_repo_1');
      
      // Wait for PR dropdown and select a PR
      await expect(page.locator('#pr-select')).toBeVisible();
      await page.locator('#pr-select').selectOption('1');
      
      // Verify PR selection
      let selectedPrValue = await page.locator('#pr-select').inputValue();
      expect(selectedPrValue).toBe('1');
      
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
      await expect(page.locator('#repo-select')).toBeVisible();
      await expect(page.locator('#pr-select')).toBeVisible();
      
      // Verify PR dropdown is reset to empty (no selection)
      selectedPrValue = await page.locator('#pr-select').inputValue();
      expect(selectedPrValue).toBe('');
    } finally {
      await mockServer.stop();
    }
  });

  test('should truncate long PR titles with CSS', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.start(null, 3000);
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait for repos dropdown and select a repo
      await expect(page.locator('#repo-select')).toBeVisible();
      await page.locator('#repo-select').selectOption('test_user/test_repo_1');
      
      // Wait for PR dropdown
      await expect(page.locator('#pr-select')).toBeVisible();
      
      // Check that option elements have CSS for text truncation
      const optionStyle = await page.locator('#pr-select option').first().evaluate((el) => {
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
    } finally {
      await mockServer.stop();
    }
  });

  test('should re-enable PR dropdown when repo is selected after being disabled', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.start(null, 3000);
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
      
      // PR dropdown should be disabled initially
      await expect(page.locator('#pr-select')).toBeDisabled();
      
      // Select a repo
      await page.locator('#repo-select').selectOption('test_user/test_repo_1');
      
      // Wait for PRs to load
      await expect(page.locator('#pr-select')).toBeVisible();
      
      // PR dropdown should now be enabled
      await expect(page.locator('#pr-select')).toBeEnabled();
      
      // Should have PR options
      const options = await page.locator('#pr-select option').allTextContents();
      expect(options.length).toBeGreaterThan(1);
    } finally {
      await mockServer.stop();
    }
  });
});
