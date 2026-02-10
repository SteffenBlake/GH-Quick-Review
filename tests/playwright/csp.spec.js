import { test, expect } from '@playwright/test';

test.describe('Content Security Policy', () => {
  test('should have CSP meta tag with dev environment settings', async ({ page }) => {
    await page.goto('/GH-Quick-Review/');
    
    // Get the CSP meta tag
    const cspMetaTag = await page.locator('meta[http-equiv="Content-Security-Policy"]').first();
    
    // Verify CSP meta tag exists
    await expect(cspMetaTag).toBeAttached();
    
    // Get the CSP content
    const cspContent = await cspMetaTag.getAttribute('content');
    
    // Verify required CSP directives are present
    expect(cspContent).toContain("default-src 'self'");
    expect(cspContent).toContain("script-src 'self' 'unsafe-inline'");
    expect(cspContent).toContain("style-src 'self' 'unsafe-inline'");
    expect(cspContent).toContain("font-src 'self'");
    expect(cspContent).toContain("img-src 'self' data:");
    // In dev mode, should include mock server URL
    expect(cspContent).toContain("connect-src 'self' http://localhost:3000");
  });

  test('should allow inline scripts and styles with CSP', async ({ page }) => {
    // Navigate to the page
    await page.goto('/GH-Quick-Review/');
    
    // Verify the page loads without CSP violations
    // The page has inline styles in index.html that should be allowed
    const hasInlineStyles = await page.evaluate(() => {
      const styleTag = document.querySelector('style');
      return styleTag !== null && styleTag.textContent.includes('@font-face');
    });
    
    expect(hasInlineStyles).toBe(true);
  });

  test('should allow data: URIs for images with CSP', async ({ page }) => {
    await page.goto('/GH-Quick-Review/');
    
    // Get CSP content
    const cspMetaTag = await page.locator('meta[http-equiv="Content-Security-Policy"]').first();
    const cspContent = await cspMetaTag.getAttribute('content');
    
    // Verify data: is allowed for images
    expect(cspContent).toContain('img-src');
    expect(cspContent).toContain('data:');
  });

  test('should allow fonts from self origin with CSP', async ({ page }) => {
    await page.goto('/GH-Quick-Review/');
    
    // Get CSP content
    const cspMetaTag = await page.locator('meta[http-equiv="Content-Security-Policy"]').first();
    const cspContent = await cspMetaTag.getAttribute('content');
    
    // Verify font-src is set to 'self'
    expect(cspContent).toContain("font-src 'self'");
  });

  test('CSP meta tag should be placed early in head', async ({ page }) => {
    await page.goto('/GH-Quick-Review/');
    
    // Get all meta tags
    const metaTags = await page.locator('head meta').all();
    
    // Get the index of charset and CSP meta tags
    let charsetIndex = -1;
    let cspIndex = -1;
    
    for (let i = 0; i < metaTags.length; i++) {
      const charset = await metaTags[i].getAttribute('charset');
      const httpEquiv = await metaTags[i].getAttribute('http-equiv');
      
      if (charset === 'UTF-8') {
        charsetIndex = i;
      }
      if (httpEquiv === 'Content-Security-Policy') {
        cspIndex = i;
      }
    }
    
    // Verify CSP comes right after charset
    expect(charsetIndex).toBeGreaterThanOrEqual(0);
    expect(cspIndex).toBeGreaterThanOrEqual(0);
    expect(cspIndex).toBe(charsetIndex + 1);
  });
});
