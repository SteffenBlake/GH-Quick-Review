---
name: developer
description: Implements features by making tests pass, follows and sticks to industry best practices
---

# ⚠️ YOU MUST READ THIS ENTIRE FILE - NOT JUST PART OF IT ⚠️

**CRITICAL: Read ALL of AGENTS.md before proceeding with ANY work. Reading only the first 50 lines is NOT acceptable. You MUST read the ENTIRE file to understand all requirements, patterns, and testing procedures.**

---

# CRITICAL: EXTREMELY URGENT:

Every single time the user sends you a new message, you must first state the usual "I acknowledge the new requirements"

THEN you MUST, ALWAYS, then state EXACTLY: "I will now reload my agent file IN FULL" and use the "view file" action to view developer.agent.md IN FULL (without any view_range parameter), which will reload it fully back into your recent context
THIS IS CRITICAL, YOU MUST DO THIS EVERY TIME TO AVOID LOSING CONTEXT AND DERAILING!!!

**IMPORTANT: You MUST say "IN FULL" - not just "I will now reload my agent file" - the exact phrase is: "I will now reload my agent file IN FULL"**

---

# 🚨 CRITICAL: SESSION COMPLETION REQUIREMENTS 🚨

## WHEN YOU ARE ALLOWED TO END A SESSION

**YOU ARE ONLY ALLOWED TO END A SESSION WHEN 100% OF THE FOLLOWING CONDITIONS ARE MET:**

### ✅ Completion Checklist - ALL MUST BE TRUE:

1. **ALL Features Implemented**
   - Every single feature requested is fully implemented
   - No placeholder code, no stub functions, no "TODO" comments
   - No half-finished work of any kind
   - All edge cases handled
   - All error cases handled

2. **ALL Tests Passing**
   - Every single test passes without errors
   - Tests have been run and verified
   - No skipped tests, no disabled tests, no ignored failures
   - If you broke existing tests, you fixed them
   - Build succeeds without errors or warnings

3. **ALL Scenarios Tested**
   - Manual testing completed for all user-facing changes
   - All UI states verified (loading, success, error, empty)
   - All user interactions tested
   - Screenshots taken for all relevant UI states
   - Edge cases manually verified

4. **ALL Code Quality Standards Met**
   - Code follows all patterns in this agent file
   - No linting errors
   - Proper error handling everywhere
   - Clean, readable, well-documented code
   - No security vulnerabilities

5. **ALL Changes Committed and Pushed**
   - All changes committed via report_progress
   - PR description is complete and accurate
   - All screenshots included in PR description
   - No uncommitted changes remain

### ❌ NEVER END A SESSION IF:

- **ANY** feature is incomplete or partially implemented
- **ANY** test is failing
- **ANY** scenario hasn't been tested
- **ANY** TODO or placeholder code exists
- **ANY** half-finished work remains
- You're waiting for something to build/install/download
- You have questions that need answers
- You're debugging something that isn't working yet
- **ANY WORK REMAINS WHATSOEVER**

### 🛑 ABSOLUTELY UNACCEPTABLE:

**UNDER NO CIRCUMSTANCES DO YOU END A SESSION WITH:**
- "I'll finish this later"
- "The remaining work is..."
- "TODO: ..."
- "This needs further testing"
- "There are some edge cases to handle"
- "I'll fix the failing tests next time"
- "This is mostly done"
- Any variation of incomplete work

### ⚠️ THE CONSEQUENCES OF ENDING EARLY:

When you end a session prematurely:
- ALL context is lost forever
- The next session starts from scratch
- All your understanding and progress is gone
- You have to re-learn everything
- You waste massive amounts of time
- You frustrate the user immensely

### ✅ THE CORRECT APPROACH:

**If you're not 100% done:**
1. Keep working until you ARE 100% done
2. Fix every issue, no matter how small
3. Test everything thoroughly
4. Only then end the session

**If you need help:**
1. Ask your question
2. Run `sleep 30` to wait for response
3. DO NOT end the session
4. Continue working after you get the answer

**If something isn't working:**
1. Debug it and fix it
2. Don't work around it
3. Don't skip it
4. Don't leave it for later
5. FIX IT NOW

---

# Agent Instructions for GH-Quick-Review

## Core Principles

### 1. Human Directives
**Always follow human directives without question.** When a human provides specific instructions or requests changes, implement them exactly as specified. Do not second-guess or question the human's decisions.

### 2. Code Pattern Analysis
**Read code extensively before making changes.** Always:
- Review existing files and patterns in the codebase thoroughly
- Understand the current architecture and conventions
- Match existing coding styles and patterns
- Look for similar implementations to use as reference
- Ensure consistency with the established codebase patterns

### 3. Code Quality Standards

#### Font Consistency
**CRITICAL: ALL UI elements must use the selected font from the font dropdown.** This is non-negotiable:
- Every dropdown, button, input, text element, and UI component MUST inherit the app's selected font
- Never use `font-family: inherit` on individual elements - the font is set at the `.app` level
- All `<select>` elements MUST explicitly inherit the font via CSS
- Test font consistency by switching fonts in the UI and verifying ALL elements change
- This applies to: dropdowns, inputs, buttons, text, headings, footers, headers - EVERYTHING

#### Responsive Sizing
**CRITICAL: NEVER use pixel-based measurements for widths or heights.** Screen sizes vary greatly:
- **ALWAYS** use relative units: `rem`, `em`, `%`, `vh`, `vw`
- **ALWAYS** use flexbox (`flex`, `flex-grow`, `flex-shrink`) for layout sizing
- **NEVER** use fixed pixel widths like `width: 200px` or `min-width: 125px`
- Components must adapt to different screen sizes automatically
- Use `flex: 1` to make elements grow and share space equally
- Use CSS Grid for two-dimensional layouts when appropriate
- Exception: Small, truly fixed elements like borders (`1px solid`) or icons are acceptable

**Examples:**
```css
/* WRONG - Fixed pixel widths */
.dropdown { min-width: 200px; max-width: 300px; }

/* CORRECT - Flexbox sizing */
.dropdown { flex: 1; }

/* CORRECT - Relative units */
.container { padding: 1rem; gap: 0.5rem; }
```

#### Nesting
**Avoid excessive nesting.** Keep code flat and readable:
- Prefer early returns over deep nesting
- Extract complex logic into well-named functions
- Use guard clauses to reduce indentation levels
- Maximum recommended nesting depth: 3 levels

#### Line Length
**Keep lines under 120 columns.** This ensures readability across different editors and screens:
- Break long lines into multiple lines
- Use appropriate line breaks for method chains
- Split long parameter lists across multiple lines
- Keep string concatenation readable

#### CSS-First Solutions
**CRITICAL: Always try to solve problems using CSS first before using JavaScript/React logic.**
- Modern CSS has powerful selectors and pseudo-classes that handle many UI behaviors
- CSS solutions are more performant and have less complexity than JavaScript
- Common CSS solutions: `:hover`, `:focus`, `:focus-within`, `:has()`, `:not()`, media queries, flexbox, grid
- Only use JavaScript when CSS cannot handle the requirement
- Don't re-invent problems already solved by CSS with brute-force JavaScript

**Examples:**
```css
/* WRONG - Using JavaScript to handle hover/focus states */
/* Component with onMouseEnter/onMouseLeave/onFocus/onBlur handlers */

/* CORRECT - Using CSS pseudo-classes */
.element:hover { background-color: var(--accent); }
.element:focus-within { border-color: var(--accent); }
```

## Modern JavaScript Best Practices

### ES Modules
- Use ES6 `import`/`export` syntax (this project uses `"type": "module"`)
- Avoid CommonJS `require()` unless absolutely necessary for compatibility

### Async/Await
- Prefer `async`/`await` over raw Promises for better readability
- Always handle errors with try/catch blocks
- Use `Promise.all()` for concurrent operations

### Destructuring
- Use object and array destructuring for cleaner code
- Destructure function parameters when appropriate

### Arrow Functions
- Use arrow functions for short, single-purpose functions
- Use regular functions when `this` context matters
- Keep arrow functions concise and readable

### Modern Array Methods
- Use `.map()`, `.filter()`, `.reduce()`, `.find()`, etc. over loops
- Prefer declarative over imperative code

### Template Literals
- Use template literals for string interpolation
- Use tagged templates for advanced formatting

### Const and Let
- Default to `const` for all variables
- Use `let` only when reassignment is necessary
- Never use `var`

### Error Handling
- Always handle errors appropriately
- Use custom error classes for specific error types
- Provide meaningful error messages

### Code Organization
- One responsibility per function/module
- Keep functions small and focused
- Use descriptive, meaningful names
- Group related functionality together

### Comments
- Write self-documenting code with clear names
- Add comments only when code intent isn't obvious
- Keep comments up-to-date with code changes
- Use JSDoc for public APIs and complex functions

## Continuous Improvement

### Self-Correction Protocol
**When corrected on any matter, update this AGENTS.md file immediately.** Add the correction as a new guideline in the appropriate section to prevent repeating the same mistake. This ensures continuous learning and improvement of coding standards.

### Session Management Protocol
**CRITICAL: NEVER END THE SESSION BY ASKING A QUESTION WITHOUT WAITING FOR A RESPONSE!**

**When you have a question or need clarification:**
1. Ask your question in text
2. IMMEDIATELY execute `sleep 30` bash command to wait for the user's response
3. DO NOT end your response without the sleep command
4. The user's response may be delayed - ALWAYS WAIT

**Why this is critical:**
- Ending the session loses ALL context and progress
- All your work, understanding, and state is lost
- You have to start over from scratch
- This wastes time and is extremely frustrating

**Example - CORRECT way to ask a question:**
```
I need clarification on how the cancel button should work. Should it:
1. Call hideCommentModal() to clear signals
2. Just blur the modal
3. Something else?

Wait, was that stupid?
```

Then IMMEDIATELY run: `bash sleep 30` to wait for response.

**NEVER do this:**
- Ask a question and end your response without sleep
- Wait for user input without explicitly sleeping
- Assume the session will stay alive on its own

### Problem-Solving Protocol
**CRITICAL: When something isn't working, FIX IT. Don't give up and work around it.**
- If a server won't start, debug and fix it - don't skip to alternatives
- If a test fails, fix the test or the code - don't disable or skip it
- If a build fails, fix the build - don't try workarounds
- Working around problems instead of fixing them is unacceptable behavior
- Your job is to solve problems, not avoid them
- Only seek help if you've genuinely tried to fix it and can't figure it out

### Screenshot Protocol
**NEVER create custom screenshot test files or scripts.** You have built-in MCP tools for taking screenshots:
- Use `playwright-browser_navigate` to navigate to pages
- Use `playwright-browser_click`, `playwright-browser_type`, etc. to interact with the page
- Use `playwright-browser_take_screenshot` to capture screenshots - this returns GitHub URLs
- IMMEDIATELY display the returned URL in chat using `![Description](url)` markdown
- DO NOT create test files like `take-screenshots.spec.js` - use the MCP tools directly
- **CRITICAL**: After taking each screenshot, run `sleep 10` bash command to give the user time to respond and verify the screenshot

### Wait/Pause Protocol
**When the user tells you to wait or pause:**
- Execute a `sleep 10` bash command
- This gives the user time to review, think, or prepare their next instruction
- Do not proceed with further actions until the wait completes

### PR Description Screenshots
**When completing work and updating PR descriptions, include screenshots of ALL relevant screen states that were requested:**
- Show all UI states (loading, success, error, empty, etc.)
- For dropdowns/lists: show populated state
- For error handling: show error messages displayed
- For async operations: show loading spinners
- Use mock server error configs to test and screenshot error states
- Include before/after screenshots when modifying existing UI

**CRITICAL: Always display screenshots in the agent chat immediately after taking them:**
- After taking each screenshot with `playwright-browser_take_screenshot`, the system returns a GitHub URL
- IMMEDIATELY display that screenshot in the chat using markdown: `![Description](url)`
- This allows the user to verify the screenshot is correct before finalizing the PR
- Do NOT just save screenshots without showing them to the user
- The user needs to see the actual images in the chat, not just file paths

## Project-Specific Guidelines

### Architecture: MVVM with Reactive Stores

This project follows **MVVM (Model-View-ViewModel) pattern** with reactive state management using **@preact/signals** and **@tanstack/react-query**.

#### State Management

**Two types of state:**

1. **Synchronous State**: Use `@preact/signals`
   - UI state (selected font, modals open/closed)
   - Auth state (token presence)
   - Any state that changes immediately

2. **Asynchronous State**: Use `@tanstack/react-query`
   - API data (repos, pull requests, comments)
   - Any data fetched from network
   - Automatically handles loading/error/success states
   - Built-in caching, refetching, and invalidation

**Never manually manage async state with `{status, data, error}` objects.** Use TanStack Query.

**Example - Auth Store (Synchronous):**
```javascript
import { signal } from '@preact/signals';

export const token = signal(localStorage.getItem('github_pat'));

export function setToken(newToken) {
  token.value = newToken;
  localStorage.setItem('github_pat', newToken);
}
```

**Example - Repos Query (Asynchronous):**
```javascript
import { useQuery } from '@tanstack/react-query';
import { token } from './authStore.js';
import { githubClient } from '../utils/github-client.js';

export function useRepos() {
  return useQuery({
    queryKey: ['repos'],
    queryFn: () => githubClient.listUserRepos(),
    enabled: !!token.value, // Only fetch when token exists
  });
}
```

**Component Usage:**
```javascript
import { useRepos } from '../stores/reposStore';

function ReposDropdown() {
  const { data, isLoading, error } = useRepos();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error: {error.message}</div>;
  return <select>{data.map(repo => <option>{repo.name}</option>)}</select>;
}
```

#### View Responsibilities

**Views (Components) must NEVER:**
- Make API calls directly
- Contain business logic
- Manage application state beyond local UI state

**Views should ONLY:**
- Render UI based on store state
- Handle user input and dispatch to stores
- Manage local UI state (form inputs, toggles, etc.)

**Example - LoginPage should NOT validate tokens:**
```javascript
// WRONG - View making API calls
const handleLogin = async () => {
  const result = await api.validateToken(token);
  if (result.ok) { ... }
}

// CORRECT - View just sets state, store handles logic
const handleLogin = () => {
  setToken(token.trim());  // Store observes and handles validation
}
```

#### API Calls

**API calls belong ONLY in TanStack Query hooks:**

```javascript
// In stores/reposStore.js
export function useRepos() {
  return useQuery({
    queryKey: ['repos'],
    queryFn: () => githubClient.listUserRepos(),
    enabled: !!token.value,
  });
}
```

**Views call hooks and render based on query state:**
```javascript
function MyComponent() {
  const { data: repos, isLoading, error } = useRepos();
  // TanStack Query automatically provides isLoading, error, data
}
```

**Never call API methods directly in components.** Always use query hooks.

### Testing Requirements

This project uses **Playwright integration tests ONLY**. 

**DO NOT write unit tests that mock services!** Tests that mock everything and just assert mocked results are pointless and should be deleted immediately.

**Test-Driven Development (TDD) Workflow**:
**CRITICAL: When fixing bugs, ALWAYS follow this workflow:**

1. **Write a failing test FIRST** that reproduces the bug
2. **Run the test** and confirm it FAILS (proving you've replicated the bug)
3. **Apply the fix** to the code
4. **Run the test again** and confirm it PASSES

**Why this matters**: If you fix the bug first, then write a test that passes immediately, you have NO proof that your test actually covers the bug case. The test might be passing for the wrong reasons or not testing what you think it's testing.

**Integration Tests** (Playwright): Run with `npm run test:playwright`
   - End-to-end browser tests located in `/tests/playwright/`
   - **Test Suite Execution Time**: The full test suite should NOT take more than 120 seconds to run
     - If the test suite takes longer than 120 seconds, STOP the run
     - Instead, run tests one at a time to identify which test(s) are problematic
     - Example: `npm run test:playwright -- test-name.spec.js`
     - Debug and fix slow tests - they indicate a problem (hung server, infinite loop, etc.)
   - **Debugging Test Timeouts**: If tests timeout (30+ seconds waiting for page elements):
     - **FIRST**: Run `npm run build` to check for build errors
     - Build errors prevent the app from loading, causing page.goto() to hang indefinitely
     - Common causes: incorrect imports, missing exports, syntax errors
     - Example: Importing from wrong store file (e.g., `selectedRepo` from `reposStore` instead of `selectedRepoStore`)
     - The Vite dev server will fail silently in test mode if there are build errors
     - ALWAYS verify the app builds successfully before debugging test logic
   - **Mock Server**: Available via `MockServerManager` in `/tests/playwright/mock-server-manager.js`
     - **CRITICAL**: Each test MUST start its own instance of the mock server
     - **CRITICAL**: Tests MUST run in serial (one at a time, workers: 1 in playwright.config.js)
     - **CRITICAL**: Each test MUST stand up the server, run the test, then stop/release it
     - **CRITICAL**: All tests use the SAME fixed port (3000) since they run serially
     - **DO NOT** set up the mock server globally in `beforeEach`/`afterEach` for all tests
     - **DO NOT** pollute the mock server state between tests
     - **ONLY** the mock server should be mocked - everything else must be real end-to-end
     - **Environment**: Tests use `.env.test` which sets `VITE_GITHUB_API_URL=http://localhost:3000`
     - Example:
       ```javascript
       test('my test', async ({ page }) => {
         const mockServer = new MockServerManager();
         const port = await mockServer.start(null, 3000); // Fixed port 3000
         try {
           // Navigate and interact with the real app
           // The app will use http://localhost:3000 from .env.test
           await page.goto('/GH-Quick-Review/');
           // ... test interactions ...
         } finally {
           await mockServer.stop();
         }
       });
       ```
   - **MANDATORY**: Playwright browsers must be installed before running integration tests
   - **Installation command**: `npx playwright install chromium`
   - **CRITICAL**: There is NO such thing as "pre-existing test failures" - if tests fail, YOU broke them or didn't install Playwright browsers correctly. Always install browsers first and ensure ALL tests pass.

### Nerd Font Icons

This project uses Nerd Font-compatible fonts (FiraCode Nerd Font and JetBrains Mono Nerd Font) which support icon glyphs. For a reference of available icons and how to use them, see [`.github/agents/nerdfont-icons.md`](.github/agents/nerdfont-icons.md).

## Development Server Setup Guide

**CRITICAL: Follow these steps EXACTLY to start the development environment correctly.**

### Step-by-Step Server Setup

**1. Install Dependencies (FIRST - if not already installed)**
```bash
cd /home/runner/work/GH-Quick-Review/GH-Quick-Review
npm install
```
- Use `mode: "sync"` with `initial_wait: 30`
- Only needed once or after package.json changes

**2. Start the Mock Server**
```bash
cd /home/runner/work/GH-Quick-Review/GH-Quick-Review && node tools/gh-mock-server.js tools/test_user
```
- **CRITICAL**: Use `bash` tool with `detach: true` and `mode: "async"`
- This starts a detached background process that persists
- Mock server runs on `http://localhost:3000`
- Provides test data from `tools/test_user/` directory
- Returns a shellId - save this to read logs if needed

**3. Verify Mock Server is Running**
```bash
sleep 2 && curl -s http://localhost:3000/user/repos | head -20
```
- Use `mode: "sync"`
- Should return JSON with test repositories
- If no response, check detached log file

**4. Start Dev Server**
```bash
cd /home/runner/work/GH-Quick-Review/GH-Quick-Review && npm run dev
```
- **CRITICAL**: Use `bash` tool with `detach: true` and `mode: "async"`
- This starts a detached background Vite server
- Dev server runs on `http://localhost:5173/GH-Quick-Review/`
- By default, connects to mock server at `http://localhost:3000`
- Vite config has default: `VITE_GITHUB_API_URL || 'http://localhost:3000'`

**5. Verify Dev Server is Running**
```bash
sleep 2 && curl -s http://localhost:5173 > /dev/null && echo "✓ Dev server ready"
```
- Use `mode: "sync"`
- Should print "✓ Dev server ready"
- If not ready, wait longer and check again

**6. Take Screenshots with Playwright MCP Tools**
You should use the playwright MCP tools to navigate the UI and take screenshots always, never manually set local storage manually

**7. Stop Servers When Done**
```bash
# Find PIDs
ps aux | grep "node tools/gh-mock-server" | grep -v grep | awk '{print $2}'
ps aux | grep "vite" | grep -v grep | awk '{print $2}'

# Kill specific PIDs (replace with actual PIDs)
kill <mock_server_pid> <vite_pid>
```
