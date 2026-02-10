import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/GH-Quick-Review/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should display login page when not authenticated', async ({ page }) => {
    await page.goto('/GH-Quick-Review/');
    
    // Should show login required heading with key icon
    await expect(page.getByRole('heading', { name: /Login Required/i })).toBeVisible();
    
    // Should show PAT input field
    await expect(page.getByPlaceholder('Enter your GitHub PAT')).toBeVisible();
    
    // Should show login button
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    
    // Should show documentation links
    await expect(page.getByRole('link', { name: /Guide: How to generate a PAT token/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Warning: Should you trust this app/i })).toBeVisible();
    
    // Should NOT show main content
    await expect(page.getByText(/Lorem ipsum dolor sit amet/i)).not.toBeVisible();
  });

  test('should save token to localStorage and show main content on login', async ({ page }) => {
    await page.goto('/GH-Quick-Review/');
    
    // Enter a test token
    await page.getByPlaceholder('Enter your GitHub PAT').fill('ghp_test_token_123');
    
    // Click login button
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Should show main content
    await expect(page.getByText(/Lorem ipsum dolor sit amet/i)).toBeVisible();
    
    // Should show logout button (button with the icon)
    await expect(page.getByRole('button', { name: '󰗽' })).toBeVisible();
    
    // Should NOT show login page
    await expect(page.getByRole('heading', { name: /Login Required/i })).not.toBeVisible();
    
    // Verify token is in localStorage
    const token = await page.evaluate(() => localStorage.getItem('github_pat'));
    expect(token).toBe('ghp_test_token_123');
  });

  test('should trim whitespace from token before saving', async ({ page }) => {
    await page.goto('/GH-Quick-Review/');
    
    // Enter token with whitespace
    await page.getByPlaceholder('Enter your GitHub PAT').fill('  ghp_test_token_456  ');
    
    // Click login button
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Verify trimmed token is in localStorage
    const token = await page.evaluate(() => localStorage.getItem('github_pat'));
    expect(token).toBe('ghp_test_token_456');
  });

  test('should not login with empty token', async ({ page }) => {
    await page.goto('/GH-Quick-Review/');
    
    // Click login without entering token
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Should still show login page
    await expect(page.getByRole('heading', { name: /Login Required/i })).toBeVisible();
    
    // Verify no token in localStorage
    const token = await page.evaluate(() => localStorage.getItem('github_pat'));
    expect(token).toBeNull();
  });

  test('should logout and return to login page', async ({ page }) => {
    await page.goto('/GH-Quick-Review/');
    
    // Login first
    await page.getByPlaceholder('Enter your GitHub PAT').fill('ghp_test_token_789');
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Verify we're logged in
    await expect(page.getByText(/Lorem ipsum dolor sit amet/i)).toBeVisible();
    
    // Click logout button using the icon
    await page.getByRole('button', { name: '󰗽' }).click();
    
    // Should return to login page
    await expect(page.getByRole('heading', { name: /Login Required/i })).toBeVisible();
    
    // Should NOT show main content
    await expect(page.getByText(/Lorem ipsum dolor sit amet/i)).not.toBeVisible();
    
    // Verify token is cleared from localStorage
    const token = await page.evaluate(() => localStorage.getItem('github_pat'));
    expect(token).toBeNull();
  });

  test('should persist authentication across page reloads', async ({ page }) => {
    await page.goto('/GH-Quick-Review/');
    
    // Login
    await page.getByPlaceholder('Enter your GitHub PAT').fill('ghp_test_token_persist');
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Verify we're logged in
    await expect(page.getByText(/Lorem ipsum dolor sit amet/i)).toBeVisible();
    
    // Reload the page
    await page.reload();
    
    // Should still be logged in (not showing login page)
    await expect(page.getByText(/Lorem ipsum dolor sit amet/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /Login Required/i })).not.toBeVisible();
    
    // Verify token is still in localStorage
    const token = await page.evaluate(() => localStorage.getItem('github_pat'));
    expect(token).toBe('ghp_test_token_persist');
  });

  test('documentation links should have correct URLs', async ({ page }) => {
    await page.goto('/GH-Quick-Review/');
    
    const guideLink = page.getByRole('link', { name: /Guide: How to generate a PAT token/i });
    const warningLink = page.getByRole('link', { name: /Warning: Should you trust this app/i });
    
    await expect(guideLink).toHaveAttribute(
      'href',
      'https://github.com/SteffenBlake/GH-Quick-Review/blob/main/docs/Generating-a-PAT-Token.md'
    );
    
    await expect(warningLink).toHaveAttribute(
      'href',
      'https://github.com/SteffenBlake/GH-Quick-Review/blob/main/docs/Should-You-Trust-This-App.md'
    );
  });

  test('documentation links should open in new tab', async ({ page }) => {
    await page.goto('/GH-Quick-Review/');
    
    const guideLink = page.getByRole('link', { name: /Guide: How to generate a PAT token/i });
    const warningLink = page.getByRole('link', { name: /Warning: Should you trust this app/i });
    
    await expect(guideLink).toHaveAttribute('target', '_blank');
    await expect(warningLink).toHaveAttribute('target', '_blank');
    
    await expect(guideLink).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(warningLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
