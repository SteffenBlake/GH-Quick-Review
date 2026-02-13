/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

/**
 * Custom Playwright reporter that logs progress every 10 tests
 * to reduce output spam while still showing meaningful progress.
 */
class CustomReporter {
  constructor() {
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.skippedTests = 0;
    this.currentCount = 0;
    this.lastLoggedCount = 0;
    this.startTime = null;
  }

  onBegin(config, suite) {
    this.startTime = Date.now();
    // Count total tests
    this.totalTests = suite.allTests().length;
    console.log(`\n🧪 Running ${this.totalTests} tests...\n`);
  }

  onTestEnd(test, result) {
    this.currentCount++;
    
    if (result.status === 'passed') {
      this.passedTests++;
    } else if (result.status === 'failed') {
      this.failedTests++;
    } else if (result.status === 'skipped') {
      this.skippedTests++;
    }

    // Log every 10 tests
    if (this.currentCount % 10 === 0 || this.currentCount === this.totalTests) {
      const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
      console.log(
        `📊 Progress: ${this.currentCount}/${this.totalTests} tests ` +
        `(✓ ${this.passedTests} ✗ ${this.failedTests} ⊘ ${this.skippedTests}) ` +
        `[${elapsed}s]`
      );
      this.lastLoggedCount = this.currentCount;
    }
    
    // Always log failed tests immediately
    if (result.status === 'failed') {
      console.log(`  ✗ FAILED: ${test.title}`);
      if (result.error) {
        console.log(`    Error: ${result.error.message}`);
      }
    }
  }

  onEnd(result) {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📋 Test Summary:`);
    console.log(`  Total:   ${this.totalTests}`);
    console.log(`  Passed:  ${this.passedTests} ✓`);
    console.log(`  Failed:  ${this.failedTests} ✗`);
    console.log(`  Skipped: ${this.skippedTests} ⊘`);
    console.log(`  Duration: ${duration}s`);
    console.log(`${'='.repeat(80)}\n`);
    
    if (this.failedTests > 0) {
      console.log(`❌ ${this.failedTests} test(s) failed!\n`);
    } else {
      console.log(`✅ All tests passed!\n`);
    }
  }
}

export default CustomReporter;
