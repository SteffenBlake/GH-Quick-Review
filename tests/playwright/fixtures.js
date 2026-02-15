/*
 * Playwright test fixtures with automatic mock server error checking
 */

import { test as base, expect } from '@playwright/test';

const MOCK_SERVER_PORT = 3000;

export const test = base.extend({
  // Automatic error checking fixture
  // This runs after each test and checks if the mock server logged any unexpected errors
  autoCheckErrors: [async ({}, use, testInfo) => {
    // Run the test
    await use();
    
    // After test completes, check for mock server errors
    try {
      const response = await fetch(`http://localhost:${MOCK_SERVER_PORT}/error-messages`);
      
      if (!response.ok) {
        console.warn('Warning: Could not check mock server errors - endpoint returned', response.status);
        return;
      }
      
      const data = await response.json();
      const errors = data.errors || [];
      
      if (errors.length > 0) {
        console.error('\n' + '='.repeat(80));
        console.error('🚨 MOCK SERVER ERRORS DETECTED:');
        console.error('='.repeat(80));
        errors.forEach((err, index) => {
          console.error(`\nError ${index + 1}:`);
          console.error(`  Time: ${err.timestamp}`);
          console.error(`  Context: ${err.context}`);
          console.error(`  Message: ${err.message}`);
          if (err.stack) {
            console.error(`  Stack: ${err.stack}`);
          }
        });
        console.error('='.repeat(80) + '\n');
        
        // Fail the test if mock server had errors
        expect(errors, `Mock server logged ${errors.length} unexpected error(s)`).toHaveLength(0);
      }
    } catch (error) {
      // If we can't check errors (e.g., server not running), just log a warning
      // Don't fail the test for this
      console.warn('Warning: Could not check mock server errors:', error.message);
    }
  }, { auto: true }], // auto: true means this runs for every test automatically
});

export { expect } from '@playwright/test';
