/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { test, expect } from '@playwright/test';
import { MockServerManager } from './mock-server-manager.js';

test.describe('Repos Dropdown', () => {
  test('should show loading spinner while fetching repos', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start(null, 0, { latency: 2000 }); // Add latency to see loading
    
    try {
      await page.addInitScript((mockPort) => {
        window.VITE_GITHUB_API_URL = `http://localhost:${mockPort}`;
      }, port);
      
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
    const port = await mockServer.start();
    
    try {
      await page.addInitScript((mockPort) => {
        window.VITE_GITHUB_API_URL = `http://localhost:${mockPort}`;
      }, port);
      
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait for repos dropdown to appear
      await expect(page.locator('#repo-select')).toBeVisible();
      
      // Should have "Select a repository..." option
      await expect(page.locator('#repo-select option').first()).toHaveText('Select a repository...');
      
      // Should have repos from mock server
      const options = await page.locator('#repo-select option').allTextContents();
      expect(options.length).toBeGreaterThan(1); // At least the placeholder + repos
      expect(options.some(opt => opt.includes('test_repo'))).toBeTruthy();
    } finally {
      await mockServer.stop();
    }
  });

  test('should display error message when repos fetch fails', async ({ page }) => {
    const mockServer = new MockServerManager();
    // Configure mock server to return 500 error for listUserRepos
    const port = await mockServer.start(null, 0, {
      listUserRepos: 500
    });
    
    try {
      await page.addInitScript((mockPort) => {
        window.VITE_GITHUB_API_URL = `http://localhost:${mockPort}`;
      }, port);
      
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login
      await page.getByPlaceholder('Enter your GitHub PAT').fill('test_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Should see error message
      await expect(page.locator('.repos-error')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText(/Error:/i)).toBeVisible();
      
      // Should NOT see the dropdown
      await expect(page.locator('#repo-select')).not.toBeVisible();
    } finally {
      await mockServer.stop();
    }
  });

  test('should display error message for 401 unauthorized', async ({ page }) => {
    const mockServer = new MockServerManager();
    // Configure mock server to return 401 for listUserRepos
    const port = await mockServer.start(null, 0, {
      listUserRepos: 401
    });
    
    try {
      await page.addInitScript((mockPort) => {
        window.VITE_GITHUB_API_URL = `http://localhost:${mockPort}`;
      }, port);
      
      await page.goto('/GH-Quick-Review/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // Login with token (will fail on repos fetch)
      await page.getByPlaceholder('Enter your GitHub PAT').fill('bad_token');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Should see error message indicating auth failure
      await expect(page.locator('.repos-error')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText(/Error:/i)).toBeVisible();
    } finally {
      await mockServer.stop();
    }
  });

  test('should allow selecting a repository from dropdown', async ({ page }) => {
    const mockServer = new MockServerManager();
    const port = await mockServer.start();
    
    try {
      await page.addInitScript((mockPort) => {
        window.VITE_GITHUB_API_URL = `http://localhost:${mockPort}`;
      }, port);
      
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
      const repoOption = options.find(opt => opt.includes('test_repo'));
      expect(repoOption).toBeTruthy();
      
      // Select a repo
      await page.locator('#repo-select').selectOption({ label: repoOption });
      
      // Verify selection
      const selectedValue = await page.locator('#repo-select').inputValue();
      expect(selectedValue).toBeTruthy();
      expect(selectedValue.length).toBeGreaterThan(0);
    } finally {
      await mockServer.stop();
    }
  });
});
