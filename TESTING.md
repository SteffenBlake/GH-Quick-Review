# Testing Guide

This document describes the testing approach for GH-Quick-Review.

## Overview

This project uses **Playwright** for end-to-end integration testing. We do not use unit tests - all testing is done through real browser interactions.

## Why Playwright Only?

- **Real user interactions**: Tests interact with the app exactly how users do
- **No mocking hell**: Only the GitHub API is mocked via our mock server
- **Confidence**: If Playwright tests pass, the feature works in real browsers
- **Simplicity**: One test framework, one approach, less maintenance

## Running Tests

### Prerequisites

```bash
# Install Playwright browsers (one-time setup)
npx playwright install chromium
```

### Run All Tests

```bash
npm run test:playwright
```

### Run Specific Test File

```bash
npx playwright test auth.spec.js
```

### Debug Mode

```bash
npx playwright test --debug
```

## Test Structure

All tests are located in `tests/playwright/`:

- `auth.spec.js` - Authentication flow tests
- `repos.spec.js` - Repository selection tests
- `pulls.spec.js` - Pull request selection tests
- `directory-browser.spec.js` - File tree navigation tests
- `font-consistency.spec.js` - Font switching tests
- `csp.spec.js` - Content Security Policy tests

## Mock Server

Tests use a mock GitHub API server (`tools/gh-mock-server.js`) that:

- Runs on `http://localhost:3000`
- Provides test data from `tools/test_user/`
- Each test starts/stops its own server instance
- Tests run serially to avoid port conflicts

## Writing Tests

### Test Template

```javascript
import { test, expect } from '@playwright/test';
import { MockServerManager } from './mock-server-manager.js';

test('my test', async ({ page }) => {
  const mockServer = new MockServerManager();
  const port = await mockServer.start(null, 3000);
  
  try {
    await page.goto('/GH-Quick-Review/');
    // ... your test actions ...
    await expect(page.locator('.something')).toBeVisible();
  } finally {
    await mockServer.stop();
  }
});
```

### Best Practices

1. **Always clean up**: Use try/finally to stop the mock server
2. **Test real flows**: Simulate actual user interactions
3. **Avoid implementation details**: Test behavior, not internals
4. **Use meaningful selectors**: Prefer data-testid or role-based selectors
5. **Keep tests isolated**: Each test should be independent

## CI/CD

Tests run automatically on:
- Every push
- Every pull request
- Before deployment

See `.github/workflows/` for CI configuration.
