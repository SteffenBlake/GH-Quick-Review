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

    // Log every 10 tests OR when we reach the total
    // Fixed: Handle edge cases for small test counts (< 10 tests)
    const shouldLog = 
      this.currentCount % 10 === 0 || 
      this.currentCount === this.totalTests ||
      (this.totalTests < 10 && this.currentCount === this.totalTests);
    
    if (shouldLog) {
      const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
      
      // Calculate ETA based on average time per test
      const avgTimePerTest = (Date.now() - this.startTime) / this.currentCount;
      const remainingTests = this.totalTests - this.currentCount;
      const etaMs = avgTimePerTest * remainingTests;
      const etaSeconds = Math.ceil(etaMs / 1000);
      
      let etaStr = '';
      if (this.currentCount < this.totalTests && remainingTests > 0) {
        if (etaSeconds < 60) {
          etaStr = ` ETA: ${etaSeconds}s`;
        } else {
          const minutes = Math.floor(etaSeconds / 60);
          const seconds = etaSeconds % 60;
          etaStr = ` ETA: ${minutes}m ${seconds}s`;
        }
      }
      
      console.log(
        `📊 Progress: ${this.currentCount}/${this.totalTests} tests ` +
        `(✓ ${this.passedTests} ✗ ${this.failedTests} ⊘ ${this.skippedTests}) ` +
        `[${elapsed}s]${etaStr}`
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
