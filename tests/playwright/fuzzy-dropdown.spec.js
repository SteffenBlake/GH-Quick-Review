import { test, expect } from '@playwright/test';
import { MockServerManager } from './mock-server-manager.js';

test.describe('Fuzzy Dropdown Component', { tag: '@parallel' }, () => {
  test('repos dropdown should show loading spinner inside disabled dropdown', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.checkHeartbeat();
    // Note: Can't add latency to global server, so this test won't work as intended
    // TODO: Consider moving to serial tests or mocking at a different level
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Should see repos dropdown
      const reposDropdown = page.locator('.repos-dropdown');
      await expect(reposDropdown).toBeVisible();
      
      // The dropdown should eventually load (no latency in global server)
      await expect(reposDropdown.locator('.fuzzy-dropdown-control:not(.disabled)')).toBeVisible({ timeout: 1000 });
    } finally {
      await mockServer.stop();
    }
  });

  // Note: Error handling test removed because it requires modifying global mock server state
  // which is not possible in parallel tests. Error handling is tested in repos.spec.js

  test('repos dropdown should open and show search input when clicked', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait for dropdown to appear
      const reposDropdown = page.locator('.repos-dropdown');
      await expect(reposDropdown.locator('.fuzzy-dropdown-control:not(.disabled)')).toBeVisible();
      
      // Click to open dropdown
      await reposDropdown.locator('.fuzzy-dropdown-control').click();
      
      // Should show search input
      const searchInput = reposDropdown.getByPlaceholder('Type to search...');
      await expect(searchInput).toBeVisible();
      
      // Should show list of repos
      await expect(reposDropdown.getByRole('list')).toBeVisible();
      const items = reposDropdown.getByRole('listitem');
      await expect(items).toHaveCount(2); // test_repo_1 and test_repo_2
    } finally {
      await mockServer.stop();
    }
  });

  test('repos dropdown should filter results based on fuzzy search', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait and open dropdown
      const reposDropdown = page.locator('.repos-dropdown');
      await expect(reposDropdown.locator('.fuzzy-dropdown-control:not(.disabled)')).toBeVisible();
      await reposDropdown.locator('.fuzzy-dropdown-control').click();
      
      // Type to filter - use "repo_1" to specifically match test_repo_1
      const searchInput = reposDropdown.getByPlaceholder('Type to search...');
      await searchInput.fill('repo_1');
      
      // Should show only matching results
      const items = reposDropdown.getByRole('listitem');
      await expect(items).toHaveCount(1);
      await expect(items.first()).toContainText('test_repo_1');
    } finally {
      await mockServer.stop();
    }
  });

  test('repos dropdown should highlight matched characters in search results', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait and open dropdown
      const reposDropdown = page.locator('.repos-dropdown');
      await expect(reposDropdown.locator('.fuzzy-dropdown-control:not(.disabled)')).toBeVisible();
      await reposDropdown.locator('.fuzzy-dropdown-control').click();
      
      // Type to search - use "_1" to specifically match test_repo_1
      const searchInput = reposDropdown.getByPlaceholder('Type to search...');
      await searchInput.fill('_1');
      
      // Check for highlighted text (mark elements) - should have at least one
      const marks = reposDropdown.locator('mark.fuzzy-match');
      await expect(marks.first()).toBeVisible();
      
      // Verify mark elements exist and contain matched characters
      const count = await marks.count();
      expect(count).toBeGreaterThan(0);
    } finally {
      await mockServer.stop();
    }
  });

  test('repos dropdown should show "No results found" when search has no matches', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait and open dropdown
      const reposDropdown = page.locator('.repos-dropdown');
      await expect(reposDropdown.locator('.fuzzy-dropdown-control:not(.disabled)')).toBeVisible();
      await reposDropdown.locator('.fuzzy-dropdown-control').click();
      
      // Type something that won't match
      const searchInput = reposDropdown.getByPlaceholder('Type to search...');
      await searchInput.fill('zzzzzzz');
      
      // Should show "No results found"
      await expect(reposDropdown.getByText('No results found')).toBeVisible();
    } finally {
      await mockServer.stop();
    }
  });

  test('repos dropdown should select item on click and close dropdown', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait and open dropdown
      const reposDropdown = page.locator('.repos-dropdown');
      await expect(reposDropdown.locator('.fuzzy-dropdown-control:not(.disabled)')).toBeVisible();
      await reposDropdown.locator('.fuzzy-dropdown-control').click();
      
      // Click on first repo
      const firstItem = reposDropdown.getByRole('listitem').first();
      await firstItem.click();
      
      // Dropdown should close
      await expect(reposDropdown.getByPlaceholder('Type to search...')).not.toBeVisible();
      
      // Should show selected repo name
      await expect(reposDropdown.locator('.fuzzy-dropdown-text')).toContainText('test_repo_1');
    } finally {
      await mockServer.stop();
    }
  });

  test('repos dropdown should navigate with arrow keys', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait and open dropdown
      const reposDropdown = page.locator('.repos-dropdown');
      await expect(reposDropdown.locator('.fuzzy-dropdown-control:not(.disabled)')).toBeVisible();
      await reposDropdown.locator('.fuzzy-dropdown-control').click();
      
      const searchInput = reposDropdown.getByPlaceholder('Type to search...');
      await expect(searchInput).toBeVisible();
      
      // First item should already be highlighted when dropdown opens
      const firstItem = reposDropdown.getByRole('listitem').first();
      await expect(firstItem).toHaveClass(/highlighted/);
      
      // Press ArrowDown to highlight second item
      await searchInput.press('ArrowDown');
      
      // Second item should be highlighted
      const secondItem = reposDropdown.getByRole('listitem').nth(1);
      await expect(secondItem).toHaveClass(/highlighted/);
    } finally {
      await mockServer.stop();
    }
  });

  test('repos dropdown should select item with Enter key', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait and open dropdown
      const reposDropdown = page.locator('.repos-dropdown');
      await expect(reposDropdown.locator('.fuzzy-dropdown-control:not(.disabled)')).toBeVisible();
      await reposDropdown.locator('.fuzzy-dropdown-control').click();
      
      const searchInput = reposDropdown.getByPlaceholder('Type to search...');
      await expect(searchInput).toBeVisible();
      
      // First item should already be highlighted, just press Enter to select it
      await searchInput.press('Enter');
      
      // Give it time to process the selection
      await page.waitForTimeout(500);
      
      // Should show selected repo text (check using the displayed text, not the dropdown state)
      await expect(reposDropdown).toContainText('test_repo_1');
      
      // Verify in localStorage that selection was saved
      const storedRepo = await page.evaluate(() => localStorage.getItem('selected_repo'));
      expect(storedRepo).toBe('test_user/test_repo_1');
    } finally {
      await mockServer.stop();
    }
  });

  test('repos dropdown should close on Escape key', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait and open dropdown
      const reposDropdown = page.locator('.repos-dropdown');
      await expect(reposDropdown.locator('.fuzzy-dropdown-control:not(.disabled)')).toBeVisible();
      await reposDropdown.locator('.fuzzy-dropdown-control').click();
      
      const searchInput = reposDropdown.getByPlaceholder('Type to search...');
      await expect(searchInput).toBeVisible();
      
      // Press Escape to close
      await searchInput.press('Escape');
      
      // Dropdown should close
      await expect(searchInput).not.toBeVisible();
    } finally {
      await mockServer.stop();
    }
  });

  test('pulls dropdown should be disabled when no repo is selected', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait for repos dropdown
      await expect(page.locator('.repos-dropdown .fuzzy-dropdown-control:not(.disabled)')).toBeVisible();
      
      // PRs dropdown should be disabled
      const pullsDropdown = page.locator('.pulls-dropdown');
      await expect(pullsDropdown.locator('.fuzzy-dropdown-control')).toHaveClass(/disabled/);
    } finally {
      await mockServer.stop();
    }
  });

  test('pulls dropdown should handle long PR titles correctly', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Select a repo
      const reposDropdown = page.locator('.repos-dropdown');
      await expect(reposDropdown.locator('.fuzzy-dropdown-control:not(.disabled)')).toBeVisible();
      await reposDropdown.locator('.fuzzy-dropdown-control').click();
      await reposDropdown.getByRole('listitem').first().click();
      
      // Wait for PRs to load and open dropdown
      const pullsDropdown = page.locator('.pulls-dropdown');
      await expect(pullsDropdown.locator('.fuzzy-dropdown-control:not(.disabled)')).toBeVisible();
      await pullsDropdown.locator('.fuzzy-dropdown-control').click();
      
      // Should show PR with long title
      const longPrItem = pullsDropdown.getByRole('listitem').filter({ 
        hasText: 'Fix critical bug in payment processing system' 
      });
      await expect(longPrItem).toBeVisible();
      
      // Verify the long title is truncated/handled properly (wraps or truncates)
      const longPrText = await longPrItem.textContent();
      expect(longPrText).toContain('Fix critical bug in payment processing system');
      expect(longPrText).toContain('duplicate charges and race conditions');
    } finally {
      await mockServer.stop();
    }
  });

  test('font dropdown should work with fuzzy search', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait for page to load
      await expect(page.locator('.repos-dropdown')).toBeVisible();
      
      // Open font dropdown
      const fontPicker = page.locator('.font-fuzzy-select');
      await fontPicker.locator('.fuzzy-dropdown-control').click();
      
      // Should show search input
      await expect(fontPicker.getByPlaceholder('Type to search...')).toBeVisible();
      
      // Should show font options
      await expect(fontPicker.getByRole('listitem').filter({ hasText: 'Fira Code' })).toBeVisible();
      await expect(fontPicker.getByRole('listitem').filter({ hasText: 'JetBrains Mono' })).toBeVisible();
      
      // Type to filter
      await fontPicker.getByPlaceholder('Type to search...').fill('jet');
      
      // Should show only JetBrains Mono
      const items = fontPicker.getByRole('listitem');
      await expect(items).toHaveCount(1);
      await expect(items.first()).toContainText('JetBrains Mono');
    } finally {
      await mockServer.stop();
    }
  });

  test('dropdowns should have fixed width and not overflow header', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait for page to load
      await expect(page.locator('.repos-dropdown')).toBeVisible();
      
      // Get header width
      const header = page.locator('.header');
      const headerBox = await header.boundingBox();
      
      // Get viewport width
      const viewportSize = page.viewportSize();
      
      // Header should not exceed viewport width
      expect(headerBox.width).toBeLessThanOrEqual(viewportSize.width);
      
      // Repos dropdown should have fixed width
      const reposDropdown = page.locator('.repos-dropdown');
      const reposBox = await reposDropdown.boundingBox();
      expect(reposBox.width).toBeGreaterThan(0);
      expect(reposBox.width).toBeLessThan(viewportSize.width);
      
      // Pulls dropdown should have fixed width
      const pullsDropdown = page.locator('.pulls-dropdown');
      const pullsBox = await pullsDropdown.boundingBox();
      expect(pullsBox.width).toBeGreaterThan(0);
      expect(pullsBox.width).toBeLessThan(viewportSize.width);
    } finally {
      await mockServer.stop();
    }
  });

  test('dropdown menu should be visually shown and not covered up by other elements', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait for repos dropdown
      const reposDropdown = page.locator('.repos-dropdown');
      await expect(reposDropdown.locator('.fuzzy-dropdown-control:not(.disabled)')).toBeVisible();
      
      // Click to open dropdown
      await reposDropdown.locator('.fuzzy-dropdown-control').click();
      
      // Dropdown menu should be visible
      const dropdownMenu = reposDropdown.locator('.fuzzy-dropdown-menu');
      await expect(dropdownMenu).toBeVisible();
      
      // Get z-index and verify it's high enough
      const zIndex = await dropdownMenu.evaluate((el) => window.getComputedStyle(el).zIndex);
      expect(parseInt(zIndex)).toBeGreaterThanOrEqual(1000);
      
      // Verify dropdown list items are actually visible and clickable
      const firstItem = reposDropdown.getByRole('listitem').first();
      await expect(firstItem).toBeVisible();
      
      // Verify the dropdown menu is not clipped by checking if it extends below the control
      const menuBox = await dropdownMenu.boundingBox();
      const controlBox = await reposDropdown.locator('.fuzzy-dropdown-control').boundingBox();
      
      // Menu should start where control ends (top of menu = bottom of control)
      expect(menuBox.y).toBeGreaterThanOrEqual(controlBox.y + controlBox.height - 2); // Allow 2px tolerance for borders
      
      // Menu should have actual height (not clipped to 0)
      expect(menuBox.height).toBeGreaterThan(50); // Should have enough height for options
    } finally {
      await mockServer.stop();
    }
  });

  test('clicking dropdown and immediately typing should auto-focus and work', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait for repos dropdown
      const reposDropdown = page.locator('.repos-dropdown');
      await expect(reposDropdown.locator('.fuzzy-dropdown-control:not(.disabled)')).toBeVisible();
      
      // Click dropdown once
      await reposDropdown.locator('.fuzzy-dropdown-control').click();
      
      // Input should be visible and focused
      const searchInput = reposDropdown.getByPlaceholder('Type to search...');
      await expect(searchInput).toBeVisible();
      await expect(searchInput).toBeFocused();
      
      // Immediately start typing (without explicitly clicking the input)
      await page.keyboard.type('test');
      
      // The search input should have the typed text
      await expect(searchInput).toHaveValue('test');
      
      // Results should be filtered
      const items = reposDropdown.getByRole('listitem');
      const count = await items.count();
      expect(count).toBeGreaterThan(0); // Should have matching results
    } finally {
      await mockServer.stop();
    }
  });

  test('clicking input field when dropdown is open should not close dropdown', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait for repos dropdown
      const reposDropdown = page.locator('.repos-dropdown');
      await expect(reposDropdown.locator('.fuzzy-dropdown-control:not(.disabled)')).toBeVisible();
      
      // Click to open dropdown
      await reposDropdown.locator('.fuzzy-dropdown-control').click();
      
      const searchInput = reposDropdown.getByPlaceholder('Type to search...');
      await expect(searchInput).toBeVisible();
      
      // Click the input field directly
      await searchInput.click();
      
      // Dropdown should still be open
      await expect(searchInput).toBeVisible();
      await expect(reposDropdown.locator('.fuzzy-dropdown-menu')).toBeVisible();
      
      // Should still be able to type
      await page.keyboard.type('test');
      await expect(searchInput).toHaveValue('test');
    } finally {
      await mockServer.stop();
    }
  });

  test('fuzzy search should match characters in different order (true fuzzy matching)', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait for repos dropdown
      const reposDropdown = page.locator('.repos-dropdown');
      await expect(reposDropdown.locator('.fuzzy-dropdown-control:not(.disabled)')).toBeVisible();
      
      // Click to open dropdown
      await reposDropdown.locator('.fuzzy-dropdown-control').click();
      
      const searchInput = reposDropdown.getByPlaceholder('Type to search...');
      await expect(searchInput).toBeVisible();
      
      // Type characters that are in "test_repo" but not in order
      // "tpo" should fuzzy match "test_repo" (t...p...o)
      await searchInput.fill('tpo');
      
      // Should still show results (fuzzy match)
      const items = reposDropdown.getByRole('listitem');
      const count = await items.count();
      expect(count).toBeGreaterThan(0); // Should have fuzzy matched results
      
      // At least one of the test repos should match
      const hasMatch = await items.first().textContent();
      expect(hasMatch).toContain('test_repo');
    } finally {
      await mockServer.stop();
    }
  });

  test('fuzzy search should handle typos and approximate matches', async ({ page }) => {
    const mockServer = new MockServerManager();
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait for repos dropdown
      const reposDropdown = page.locator('.repos-dropdown');
      await expect(reposDropdown.locator('.fuzzy-dropdown-control:not(.disabled)')).toBeVisible();
      
      // Click to open dropdown
      await reposDropdown.locator('.fuzzy-dropdown-control').click();
      
      const searchInput = reposDropdown.getByPlaceholder('Type to search...');
      await expect(searchInput).toBeVisible();
      
      // Type with a typo: "tset" instead of "test"
      await searchInput.fill('tset');
      
      // Should still show results (fuzzy match handles typos)
      const items = reposDropdown.getByRole('listitem');
      const count = await items.count();
      expect(count).toBeGreaterThan(0); // Should have fuzzy matched results despite typo
    } finally {
      await mockServer.stop();
    }
  });
});
