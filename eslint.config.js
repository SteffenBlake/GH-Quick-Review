import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      // Error prevention
      'no-console': 'off', // We use console intentionally for debug logging
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-undef': 'error',
      
      // Best practices
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'no-var': 'error',
      'prefer-const': 'error',
      
      // Code quality
      'no-trailing-spaces': 'error',
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      
      // Disable overly strict rules
      'no-useless-escape': 'off', // Regex escapes can be intentional for clarity
      'no-empty-pattern': 'off', // Empty destructuring can be intentional
      'preserve-caught-error': 'off', // Not all errors need to be re-thrown with cause
    },
  },
  {
    // Test files and tools can have different rules
    files: ['tests/**/*.js', '**/*.spec.js', '**/*.test.js', 'tools/**/*.js'],
    rules: {
      'no-unused-vars': 'off', // Tests and tools often have fixtures and experimental code
      'curly': 'off', // Allow more flexible syntax in tests
    },
  },
  {
    // Ignore build output and dependencies
    ignores: ['dist/**', 'node_modules/**', '.github/**'],
  },
];
