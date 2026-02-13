import { test, expect } from '@playwright/test';
import { MockServerManager } from './mock-server-manager.js';

/**
 * Font Consistency Tests
 * Ensures ALL UI elements respect the selected font from the font dropdown
 */
test.describe('Font Consistency', { tag: '@parallel' }, () => {
  test('header title should use selected font', async ({ page }) => {
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
      await expect(page.locator('.repo-fuzzy-select')).toBeVisible();
      
      // Check initial font (FiraCode)
      const headerTitle = page.getByRole('heading', { name: /GH Quick Review/i });
      let computedFont = await headerTitle.evaluate((el) => window.getComputedStyle(el).fontFamily);
      expect(computedFont).toContain('FiraCode');
      
      // Change font to JetBrains Mono
      await page.getByLabel('Font:').selectOption('JetBrainsMono');
      
      // Verify font changed
      computedFont = await headerTitle.evaluate((el) => window.getComputedStyle(el).fontFamily);
      expect(computedFont).toContain('JetBrainsMono');
    } finally {
      await mockServer.stop();
    }
  });

  test('repo dropdown should use selected font', async ({ page }) => {
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
      await expect(page.locator('.repo-fuzzy-select')).toBeVisible();
      
      // Check initial font (FiraCode)
      const repoDropdown = page.locator('.repo-fuzzy-select');
      let computedFont = await repoDropdown.evaluate((el) => window.getComputedStyle(el).fontFamily);
      expect(computedFont).toContain('FiraCode');
      
      // Change font to JetBrains Mono
      await page.getByLabel('Font:').selectOption('JetBrainsMono');
      
      // Verify font changed
      computedFont = await repoDropdown.evaluate((el) => window.getComputedStyle(el).fontFamily);
      expect(computedFont).toContain('JetBrainsMono');
    } finally {
      await mockServer.stop();
    }
  });

  test('PR dropdown should use selected font', async ({ page }) => {
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
      await expect(page.locator('.repo-fuzzy-select')).toBeVisible();
      
      // Check initial font (FiraCode)
      const prDropdown = page.locator('.pr-fuzzy-select');
      let computedFont = await prDropdown.evaluate((el) => window.getComputedStyle(el).fontFamily);
      expect(computedFont).toContain('FiraCode');
      
      // Change font to JetBrains Mono
      await page.getByLabel('Font:').selectOption('JetBrainsMono');
      
      // Verify font changed
      computedFont = await prDropdown.evaluate((el) => window.getComputedStyle(el).fontFamily);
      expect(computedFont).toContain('JetBrainsMono');
    } finally {
      await mockServer.stop();
    }
  });

  test('font dropdown itself should use selected font', async ({ page }) => {
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
      await expect(page.locator('.repo-fuzzy-select')).toBeVisible();
      
      // Check initial font (FiraCode)
      const fontDropdown = page.getByLabel('Font:');
      let computedFont = await fontDropdown.evaluate((el) => window.getComputedStyle(el).fontFamily);
      expect(computedFont).toContain('FiraCode');
      
      // Change font to JetBrains Mono
      await fontDropdown.selectOption('JetBrainsMono');
      
      // Verify font changed
      computedFont = await fontDropdown.evaluate((el) => window.getComputedStyle(el).fontFamily);
      expect(computedFont).toContain('JetBrainsMono');
    } finally {
      await mockServer.stop();
    }
  });

  test('logout button should use selected font', async ({ page }) => {
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
      await expect(page.locator('.repo-fuzzy-select')).toBeVisible();
      
      // Check initial font (FiraCode)
      const logoutButton = page.getByRole('button', { name: /Logout/i });
      let computedFont = await logoutButton.evaluate((el) => window.getComputedStyle(el).fontFamily);
      expect(computedFont).toContain('FiraCode');
      
      // Change font to JetBrains Mono
      await page.getByLabel('Font:').selectOption('JetBrainsMono');
      
      // Verify font changed
      computedFont = await logoutButton.evaluate((el) => window.getComputedStyle(el).fontFamily);
      expect(computedFont).toContain('JetBrainsMono');
    } finally {
      await mockServer.stop();
    }
  });

  test('main content text should use selected font', async ({ page }) => {
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
      await expect(page.locator('.repo-fuzzy-select')).toBeVisible();
      
      // Check initial font (FiraCode)
      const mainContent = page.getByText('Please select a Repo and a Pull Request to review!');
      let computedFont = await mainContent.evaluate((el) => window.getComputedStyle(el).fontFamily);
      expect(computedFont).toContain('FiraCode');
      
      // Change font to JetBrains Mono
      await page.getByLabel('Font:').selectOption('JetBrainsMono');
      
      // Verify font changed
      computedFont = await mainContent.evaluate((el) => window.getComputedStyle(el).fontFamily);
      expect(computedFont).toContain('JetBrainsMono');
    } finally {
      await mockServer.stop();
    }
  });

  test('main content heading should use selected font', async ({ page }) => {
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
      await expect(page.locator('.repo-fuzzy-select')).toBeVisible();
      
      // Check initial font (FiraCode)
      const mainHeading = page.getByRole('heading', { name: 'I dunno lol' });
      let computedFont = await mainHeading.evaluate((el) => window.getComputedStyle(el).fontFamily);
      expect(computedFont).toContain('FiraCode');
      
      // Change font to JetBrains Mono
      await page.getByLabel('Font:').selectOption('JetBrainsMono');
      
      // Verify font changed
      computedFont = await mainHeading.evaluate((el) => window.getComputedStyle(el).fontFamily);
      expect(computedFont).toContain('JetBrainsMono');
    } finally {
      await mockServer.stop();
    }
  });

  test('footer copyright text should use selected font', async ({ page }) => {
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
      await expect(page.locator('.repo-fuzzy-select')).toBeVisible();
      
      // Check initial font (FiraCode)
      const footerText = page.locator('.footer-copyright');
      let computedFont = await footerText.evaluate((el) => window.getComputedStyle(el).fontFamily);
      expect(computedFont).toContain('FiraCode');
      
      // Change font to JetBrains Mono
      await page.getByLabel('Font:').selectOption('JetBrainsMono');
      
      // Verify font changed
      computedFont = await footerText.evaluate((el) => window.getComputedStyle(el).fontFamily);
      expect(computedFont).toContain('JetBrainsMono');
    } finally {
      await mockServer.stop();
    }
  });

  test('footer links should use selected font', async ({ page }) => {
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
      await expect(page.locator('.repo-fuzzy-select')).toBeVisible();
      
      // Check initial font (FiraCode)
      const sourceCodeLink = page.getByRole('link', { name: /Source Code/i });
      let computedFont = await sourceCodeLink.evaluate((el) => window.getComputedStyle(el).fontFamily);
      expect(computedFont).toContain('FiraCode');
      
      // Change font to JetBrains Mono
      await page.getByLabel('Font:').selectOption('JetBrainsMono');
      
      // Verify font changed
      computedFont = await sourceCodeLink.evaluate((el) => window.getComputedStyle(el).fontFamily);
      expect(computedFont).toContain('JetBrainsMono');
    } finally {
      await mockServer.stop();
    }
  });

  test('login page heading should use selected font', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.start(null, 3000);
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Check initial font (FiraCode) on login page
      const loginHeading = page.getByRole('heading', { name: /Login Required/i });
      let computedFont = await loginHeading.evaluate((el) => window.getComputedStyle(el).fontFamily);
      expect(computedFont).toContain('FiraCode');
      
      // Change font to JetBrains Mono
      await page.getByLabel('Font:').selectOption('JetBrainsMono');
      
      // Verify font changed
      computedFont = await loginHeading.evaluate((el) => window.getComputedStyle(el).fontFamily);
      expect(computedFont).toContain('JetBrainsMono');
    } finally {
      await mockServer.stop();
    }
  });

  test('login input field should use selected font', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.start(null, 3000);
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Check initial font (FiraCode)
      const patInput = page.getByPlaceholder('Enter your GitHub PAT');
      let computedFont = await patInput.evaluate((el) => window.getComputedStyle(el).fontFamily);
      expect(computedFont).toContain('FiraCode');
      
      // Change font to JetBrains Mono
      await page.getByLabel('Font:').selectOption('JetBrainsMono');
      
      // Verify font changed
      computedFont = await patInput.evaluate((el) => window.getComputedStyle(el).fontFamily);
      expect(computedFont).toContain('JetBrainsMono');
    } finally {
      await mockServer.stop();
    }
  });

  test('login button should use selected font', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.start(null, 3000);
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Check initial font (FiraCode)
      const loginButton = page.getByRole('button', { name: 'Login' });
      let computedFont = await loginButton.evaluate((el) => window.getComputedStyle(el).fontFamily);
      expect(computedFont).toContain('FiraCode');
      
      // Change font to JetBrains Mono
      await page.getByLabel('Font:').selectOption('JetBrainsMono');
      
      // Verify font changed
      computedFont = await loginButton.evaluate((el) => window.getComputedStyle(el).fontFamily);
      expect(computedFont).toContain('JetBrainsMono');
    } finally {
      await mockServer.stop();
    }
  });

  test('login page description text should use selected font', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.start(null, 3000);
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Check initial font (FiraCode)
      const descText = page.getByText('Please enter your GitHub Personal Access Token to continue.');
      let computedFont = await descText.evaluate((el) => window.getComputedStyle(el).fontFamily);
      expect(computedFont).toContain('FiraCode');
      
      // Change font to JetBrains Mono
      await page.getByLabel('Font:').selectOption('JetBrainsMono');
      
      // Verify font changed
      computedFont = await descText.evaluate((el) => window.getComputedStyle(el).fontFamily);
      expect(computedFont).toContain('JetBrainsMono');
    } finally {
      await mockServer.stop();
    }
  });

  test('login page documentation links should use selected font', async ({ page }) => {
    const mockServer = new MockServerManager();
    await mockServer.start(null, 3000);
      await mockServer.checkHeartbeat();
    
    try {
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Check initial font (FiraCode)
      const patGuideLink = page.getByRole('link', { name: /Guide: How to generate a PAT token/i });
      let computedFont = await patGuideLink.evaluate((el) => window.getComputedStyle(el).fontFamily);
      expect(computedFont).toContain('FiraCode');
      
      // Change font to JetBrains Mono
      await page.getByLabel('Font:').selectOption('JetBrainsMono');
      
      // Verify font changed
      computedFont = await patGuideLink.evaluate((el) => window.getComputedStyle(el).fontFamily);
      expect(computedFont).toContain('JetBrainsMono');
    } finally {
      await mockServer.stop();
    }
  });
});
