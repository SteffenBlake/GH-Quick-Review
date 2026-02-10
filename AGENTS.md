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

## Project-Specific Guidelines

### Testing Requirements

This project uses **two types of tests** that must BOTH be run:

1. **Unit Tests** (Vitest): Run with `npm test`
   - Component tests
   - Utility function tests
   - Uses jsdom environment

2. **Integration Tests** (Playwright): Run with `npm run test:playwright`
   - End-to-end browser tests located in `/tests/playwright/`
   - Each test spins up a fresh mock server instance
   - **MANDATORY**: Playwright browsers must be installed before running integration tests
   - **Installation command**: `npx playwright install chromium`
   - **DO NOT SKIP** integration tests when asked to run tests

**Complete Test Suite**: Run `npm run test:all` to execute both unit and integration tests.

**When asked to run tests, ALWAYS run both unit tests AND integration tests.** Integration tests are NOT optional.

### Nerd Font Icons

This project uses Nerd Font-compatible fonts (FiraCode Nerd Font and JetBrains Mono Nerd Font) which support icon glyphs. For a reference of available icons and how to use them, see [`.github/agents/nerdfont-icons.md`](.github/agents/nerdfont-icons.md).

### GitHub API Response Formats

#### GET /repos/{owner}/{repo}/pulls/{pull_number}/files

This endpoint returns an array of files changed in a pull request. Below is the **actual response format** from GitHub's API for reference when creating mock data or handling API responses.

**Real API Response Example (from PR #4):**

```json
[
  {
    "sha": "a44798d1003cb94a4c8583670658b6a5a95c543c",
    "filename": ".github/workflows/deploy.yml",
    "status": "modified",
    "additions": 1,
    "deletions": 1,
    "changes": 2,
    "blob_url": "https://github.com/SteffenBlake/GH-Quick-Review/blob/5b5b1a856ede9e26a9ff5c804566c007c13ed862/.github%2Fworkflows%2Fdeploy.yml",
    "raw_url": "https://github.com/SteffenBlake/GH-Quick-Review/raw/5b5b1a856ede9e26a9ff5c804566c007c13ed862/.github%2Fworkflows%2Fdeploy.yml",
    "contents_url": "https://api.github.com/repos/SteffenBlake/GH-Quick-Review/contents/.github%2Fworkflows%2Fdeploy.yml?ref=5b5b1a856ede9e26a9ff5c804566c007c13ed862",
    "patch": "@@ -25,7 +25,7 @@ jobs:\n       - name: Setup Node.js\n         uses: actions/setup-node@v4\n         with:\n-          node-version: '18'\n+          node-version: '20'\n           cache: 'npm'\n \n       - name: Install dependencies"
  },
  {
    "sha": "7fbee256cbb8008cf046af3c2ea887b2f2961699",
    "filename": "package.json",
    "status": "modified",
    "additions": 1,
    "deletions": 1,
    "changes": 2,
    "blob_url": "https://github.com/SteffenBlake/GH-Quick-Review/blob/5b5b1a856ede9e26a9ff5c804566c007c13ed862/package.json",
    "raw_url": "https://github.com/SteffenBlake/GH-Quick-Review/raw/5b5b1a856ede9e26a9ff5c804566c007c13ed862/package.json",
    "contents_url": "https://api.github.com/repos/SteffenBlake/GH-Quick-Review/contents/package.json?ref=5b5b1a856ede9e26a9ff5c804566c007c13ed862",
    "patch": "@@ -28,7 +28,7 @@\n   },\n   \"homepage\": \"https://github.com/SteffenBlake/GH-Quick-Review#readme\",\n   \"engines\": {\n-    \"node\": \">=18.0.0\"\n+    \"node\": \">=20.0.0\"\n   },\n   \"dependencies\": {\n     \"preact\": \"^10.28.3\""
  },
  {
    "sha": "532858cf03c7178013a6cac04eacdf547eecfff0",
    "filename": "tools/gh-mock-server.js",
    "status": "modified",
    "additions": 28,
    "deletions": 1,
    "changes": 29,
    "blob_url": "https://github.com/SteffenBlake/GH-Quick-Review/blob/5b5b1a856ede9e26a9ff5c804566c007c13ed862/tools%2Fgh-mock-server.js",
    "raw_url": "https://github.com/SteffenBlake/GH-Quick-Review/raw/5b5b1a856ede9e26a9ff5c804566c007c13ed862/tools%2Fgh-mock-server.js",
    "contents_url": "https://api.github.com/repos/SteffenBlake/GH-Quick-Review/contents/tools%2Fgh-mock-server.js?ref=5b5b1a856ede9e26a9ff5c804566c007c13ed862",
    "patch": "@@ -23,9 +23,10 @@ class GitHubMockServer {\n     // Initialize in-memory state from loaded data\n     this.pulls = new Map(data.pulls.map(pr => [pr.number, { ...pr }]));\n     this.comments = new Map(data.comments.map(comment => [comment.id, { ...comment }]));\n+    this.files = new Map((data.files || []).map(fileGroup => [fileGroup.pull_number, fileGroup.files]));\n     this.nextCommentId = Math.max(...data.comments.map(c => c.id), 0) + 1;\n     \n-    console.log(`Loaded ${this.pulls.size} pull requests and ${this.comments.size} comments`);\n+    console.log(`Loaded ${this.pulls.size} pull requests, ${this.comments.size} comments, and ${this.files.size} file groups`);\n   }\n \n   /**\n@@ -119,6 +120,12 @@ class GitHubMockServer {\n         method: 'GET',\n         handler: this.getPull.bind(this)\n       },\n+      {\n+        // List PR files: GET /repos/{owner}/{repo}/pulls/{pull_number}/files\n+        pattern: /^\\/repos\\/([^\\/]+)\\/([^\\/]+)\\/pulls\\/(\\d+)\\/files$/,\n+        method: 'GET',\n+        handler: this.listPullFiles.bind(this)\n+      },\n       {\n         // List review comments: GET /repos/{owner}/{repo}/pulls/{pull_number}/comments\n         pattern: /^\\/repos\\/([^\\/]+)\\/([^\\/]+)\\/pulls\\/(\\d+)\\/comments$/,\n@@ -184,6 +191,25 @@ class GitHubMockServer {\n     this.sendResponse(res, 200, pull);\n   }\n \n+  listPullFiles(req, res, match) {\n+    if (this.checkConfiguredError('listPullFiles', res)) return;\n+    \n+    const [, owner, repo, pullNumber] = match;\n+    const pull = this.pulls.get(parseInt(pullNumber));\n+    \n+    if (!pull) {\n+      return this.sendResponse(res, 404, {\n+        message: 'Not Found',\n+        documentation_url: 'https://docs.github.com/rest/pulls/pulls#list-pull-requests-files'\n+      });\n+    }\n+    \n+    // Get files for this PR\n+    const files = this.files.get(parseInt(pullNumber)) || [];\n+    \n+    this.sendResponse(res, 200, files);\n+  }\n+\n   listComments(req, res, match) {\n     if (this.checkConfiguredError('listComments', res)) return;\n     \n@@ -351,6 +377,7 @@ function startServer(dataFile = resolve(__dirname, 'test-data.json'), port = 300\n     console.log(`\\nAvailable endpoints:`);\n     console.log(`  GET    /repos/{owner}/{repo}/pulls`);\n     console.log(`  GET    /repos/{owner}/{repo}/pulls/{pull_number}`);\n+    console.log(`  GET    /repos/{owner}/{repo}/pulls/{pull_number}/files`);\n     console.log(`  GET    /repos/{owner}/{repo}/pulls/{pull_number}/comments`);\n     console.log(`  POST   /repos/{owner}/{repo}/pulls/{pull_number}/comments`);\n     console.log(`  PATCH  /repos/{owner}/{repo}/pulls/comments/{comment_id}`);"
  }
]
```

**Corresponding Git Diff for PR #4:**

```diff
diff --git a/.github/workflows/deploy.yml b/.github/workflows/deploy.yml
index e4e9fe0..a44798d 100644
--- a/.github/workflows/deploy.yml
+++ b/.github/workflows/deploy.yml
@@ -25,7 +25,7 @@ jobs:
       - name: Setup Node.js
         uses: actions/setup-node@v4
         with:
-          node-version: '18'
+          node-version: '20'
           cache: 'npm'
 
       - name: Install dependencies
diff --git a/package.json b/package.json
index 53e6a4d..7fbee25 100644
--- a/package.json
+++ b/package.json
@@ -28,7 +28,7 @@
   },
   "homepage": "https://github.com/SteffenBlake/GH-Quick-Review#readme",
   "engines": {
-    "node": ">=18.0.0"
+    "node": ">=20.0.0"
   },
   "dependencies": {
     "preact": "^10.28.3"
diff --git a/tools/gh-mock-server.js b/tools/gh-mock-server.js
index 40ef199..532858c 100644
--- a/tools/gh-mock-server.js
+++ b/tools/gh-mock-server.js
@@ -23,9 +23,10 @@ class GitHubMockServer {
     // Initialize in-memory state from loaded data
     this.pulls = new Map(data.pulls.map(pr => [pr.number, { ...pr }]));
     this.comments = new Map(data.comments.map(comment => [comment.id, { ...comment }]));
+    this.files = new Map((data.files || []).map(fileGroup => [fileGroup.pull_number, fileGroup.files]));
     this.nextCommentId = Math.max(...data.comments.map(c => c.id), 0) + 1;
     
-    console.log(`Loaded ${this.pulls.size} pull requests and ${this.comments.size} comments`);
+    console.log(`Loaded ${this.pulls.size} pull requests, ${this.comments.size} comments, and ${this.files.size} file groups`);
   }
 
   /**
@@ -119,6 +120,12 @@ class GitHubMockServer {
         method: 'GET',
         handler: this.getPull.bind(this)
       },
+      {
+        // List PR files: GET /repos/{owner}/{repo}/pulls/{pull_number}/files
+        pattern: /^\/repos\/([^\/]+)\/([^\/]+)\/pulls\/(\d+)\/files$/,
+        method: 'GET',
+        handler: this.listPullFiles.bind(this)
+      },
       {
         // List review comments: GET /repos/{owner}/{repo}/pulls/{pull_number}/comments
         pattern: /^\/repos\/([^\/]+)\/([^\/]+)\/pulls\/(\d+)\/comments$/,
@@ -184,6 +191,25 @@ class GitHubMockServer {
     this.sendResponse(res, 200, pull);
   }
 
+  listPullFiles(req, res, match) {
+    if (this.checkConfiguredError('listPullFiles', res)) return;
+    
+    const [, owner, repo, pullNumber] = match;
+    const pull = this.pulls.get(parseInt(pullNumber));
+    
+    if (!pull) {
+      return this.sendResponse(res, 404, {
+        message: 'Not Found',
+        documentation_url: 'https://docs.github.com/rest/pulls/pulls#list-pull-requests-files'
+      });
+    }
+    
+    // Get files for this PR
+    const files = this.files.get(parseInt(pullNumber)) || [];
+    
+    this.sendResponse(res, 200, files);
+  }
+
   listComments(req, res, match) {
     if (this.checkConfiguredError('listComments', res)) return;
     
@@ -351,6 +377,7 @@ function startServer(dataFile = resolve(__dirname, 'test-data.json'), port = 300
     console.log(`\nAvailable endpoints:`);
     console.log(`  GET    /repos/{owner}/{repo}/pulls`);
     console.log(`  GET    /repos/{owner}/{repo}/pulls/{pull_number}`);
+    console.log(`  GET    /repos/{owner}/{repo}/pulls/{pull_number}/files`);
     console.log(`  GET    /repos/{owner}/{repo}/pulls/{pull_number}/comments`);
     console.log(`  POST   /repos/{owner}/{repo}/pulls/{pull_number}/comments`);
     console.log(`  PATCH  /repos/{owner}/{repo}/pulls/comments/{comment_id}`);
```

**Key Observations:**

1. **SHA Format**: Full 40-character commit hashes (e.g., `a44798d1003cb94a4c8583670658b6a5a95c543c`)
2. **URL Encoding**: File paths in URLs use `%2F` for forward slashes (e.g., `.github%2Fworkflows%2Fdeploy.yml`)
3. **Filename Field**: Contains the actual path with forward slashes (not URL-encoded)
4. **Status Values**: `modified`, `added`, `removed`, `renamed`, etc.
5. **Patch Format**: Standard unified diff format with `@@` hunk headers and `+`/`-` line prefixes
6. **Required Fields**: All file objects include `sha`, `filename`, `status`, `additions`, `deletions`, `changes`, `blob_url`, `raw_url`, `contents_url`, and optionally `patch`

This documentation serves as the definitive reference for understanding how GitHub represents file changes in PR responses.

#### GET /repos/{owner}/{repo}/contents/{path}

This endpoint returns the contents of a file in a repository. Below is the **actual response format** from GitHub's API.

**Real API Response Example (for package.json):**

```json
{
  "name": "package.json",
  "path": "package.json",
  "sha": "7fbee256cbb8008cf046af3c2ea887b2f2961699",
  "size": 1014,
  "url": "https://api.github.com/repos/SteffenBlake/GH-Quick-Review/contents/package.json?ref=5b5b1a856ede9e26a9ff5c804566c007c13ed862",
  "html_url": "https://github.com/SteffenBlake/GH-Quick-Review/blob/5b5b1a856ede9e26a9ff5c804566c007c13ed862/package.json",
  "git_url": "https://api.github.com/repos/SteffenBlake/GH-Quick-Review/git/blobs/7fbee256cbb8008cf046af3c2ea887b2f2961699",
  "download_url": "https://raw.githubusercontent.com/SteffenBlake/GH-Quick-Review/5b5b1a856ede9e26a9ff5c804566c007c13ed862/package.json",
  "type": "file",
  "content": "ewogICJuYW1lIjogImdoLXF1aWNrLXJldmlldyIsCiAgInZlcnNpb24iOiAi\nMS4wLjAiLAogICJkZXNjcmlwdGlvbiI6ICJHaXRIdWIgUXVpY2sgUmV2aWV3\nIFRvb2wiLAogICJtYWluIjogInNyYy9pbmRleC5qcyIsCiAgInR5cGUiOiAi\nbW9kdWxlIiwKICAic2NyaXB0cyI6IHsKICAgICJkZXYiOiAidml0ZSIsCiAg\nICAiYnVpbGQiOiAidml0ZSBidWlsZCIsCiAgICAicHJldmlldyI6ICJ2aXRl\nIHByZXZpZXciLAogICAgInRlc3QiOiAidml0ZXN0IHJ1biIsCiAgICAic3Rh\ncnQiOiAibm9kZSBzcmMvaW5kZXguanMiLAogICAgIm1vY2stc2VydmVyIjog\nIm5vZGUgdG9vbHMvZ2gtbW9jay1zZXJ2ZXIuanMgdG9vbHMvdGVzdC1kYXRh\nLmpzb24iCiAgfSwKICAicmVwb3NpdG9yeSI6IHsKICAgICJ0eXBlIjogImdp\ndCIsCiAgICAidXJsIjogImdpdCtodHRwczovL2dpdGh1Yi5jb20vU3RlZmZl\nbkJsYWtlL0dILVF1aWNrLVJldmlldy5naXQiCiAgfSwKICAia2V5d29yZHMi\nOiBbCiAgICAiZ2l0aHViIiwKICAgICJyZXZpZXciLAogICAgImNvZGUtcmV2\naWV3IgogIF0sCiAgImF1dGhvciI6ICIiLAogICJsaWNlbnNlIjogIklTQyIs\nCiAgImJ1Z3MiOiB7CiAgICAidXJsIjogImh0dHBzOi8vZ2l0aHViLmNvbS9T\ndGVmZmVuQmxha2UvR0gtUXVpY2stUmV2aWV3L2lzc3VlcyIKICB9LAogICJo\nb21lcGFnZSI6ICJodHRwczovL2dpdGh1Yi5jb20vU3RlZmZlbkJsYWtlL0dI\nLVF1aWNrLVJldmlldyNyZWFkbWUiLAogICJlbmdpbmVzIjogewogICAgIm5v\nZGUiOiAiPj0yMC4wLjAiCiAgfSwKICAiZGVwZW5kZW5jaWVzIjogewogICAg\nInByZWFjdCI6ICJeMTAuMjguMyIKICB9LAogICJkZXZEZXBlbmRlbmNpZXMi\nOiB7CiAgICAiQHByZWFjdC9wcmVzZXQtdml0ZSI6ICJeMi4xMC4zIiwKICAg\nICJAdGVzdGluZy1saWJyYXJ5L3ByZWFjdCI6ICJeMy4yLjQiLAogICAgImpz\nZG9tIjogIl4yOC4wLjAiLAogICAgInZpdGUiOiAiXjcuMy4xIiwKICAgICJ2\naXRlc3QiOiAiXjQuMC4xOCIKICB9Cn0K\n",
  "encoding": "base64",
  "_links": {
    "self": "https://api.github.com/repos/SteffenBlake/GH-Quick-Review/contents/package.json?ref=5b5b1a856ede9e26a9ff5c804566c007c13ed862",
    "git": "https://api.github.com/repos/SteffenBlake/GH-Quick-Review/git/blobs/7fbee256cbb8008cf046af3c2ea887b2f2961699",
    "html": "https://github.com/SteffenBlake/GH-Quick-Review/blob/5b5b1a856ede9e26a9ff5c804566c007c13ed862/package.json"
  }
}
```

**Key Observations:**

1. **Content Encoding**: The `content` field contains base64-encoded file content with line breaks every 60 characters (per RFC 2045)
2. **SHA Format**: Full 40-character SHA-1 hash of the file blob
3. **Type Field**: Indicates whether this is a `file` or `dir`
4. **Size**: File size in bytes (not the base64 encoded size)
5. **URLs**: All URLs include the ref (commit SHA) as a query parameter or in the path
6. **Links Object**: Contains `self`, `git`, and `html` links for different access methods
7. **Required Fields**: All responses include `name`, `path`, `sha`, `size`, `url`, `html_url`, `git_url`, `download_url`, `type`, `content`, `encoding`, and `_links`

This documentation serves as the definitive reference for understanding how GitHub represents file contents in API responses.
