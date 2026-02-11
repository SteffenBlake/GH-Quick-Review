# GitHub Mock Server

A lightweight, stateful mock server for GitHub API endpoints, specifically designed for testing and development of GitHub integrations.

## Features

- **Multi-repository support**: Supports multiple repositories with separate data files
- **Dynamic repository discovery**: Automatically discovers repositories from directory structure
- **Stateful**: Changes made during runtime (add, edit, delete comments) persist in memory
- **Directory-based initialization**: Load test data from organized directory structure
- **Dynamic file diff generation**: Uses git diff to generate file changes for PRs
- **Error simulation**: Configure specific endpoints to return errors or timeout for negative testing
- **Simple to use**: Start with a single npm command
- **RESTful**: Implements authentic GitHub API patterns

## Supported Endpoints

The mock server supports the following GitHub API endpoints:

1. **List Repositories for User**  
   `GET /user/repos`

2. **List Pull Requests**  
   `GET /repos/{owner}/{repo}/pulls`

3. **Get Pull Request**  
   `GET /repos/{owner}/{repo}/pulls/{pull_number}`

4. **List Pull Request Files**  
   `GET /repos/{owner}/{repo}/pulls/{pull_number}/files`

5. **Get File Contents**  
   `GET /repos/{owner}/{repo}/contents/{path}`

6. **List Review Comments**  
   `GET /repos/{owner}/{repo}/pulls/{pull_number}/comments`

7. **Add Review Comment**  
   `POST /repos/{owner}/{repo}/pulls/{pull_number}/comments`

8. **Edit Review Comment**  
   `PATCH /repos/{owner}/{repo}/pulls/comments/{comment_id}`

9. **Delete Review Comment**  
   `DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}`

## Directory Structure

The mock server uses a hierarchical directory structure to organize test data:

```
tools/test_user/
├── test_repo_1/
│   ├── 1/                    # PR number 1
│   │   ├── before/           # Files before changes
│   │   │   ├── example.cs
│   │   │   └── example.js
│   │   └── after/            # Files after changes
│   │       ├── example.cs
│   │       └── example.js
│   ├── 2/                    # PR number 2
│   │   ├── before/
│   │   │   ├── example.cs
│   │   │   └── utils.py
│   │   └── after/
│   │       ├── example.cs
│   │       └── index.html    # New file (added)
│   └── data.json             # PR metadata and comments for this repo
└── test_repo_2/
    ├── 1/
    │   ├── before/
    │   └── after/
    ├── 2/
    │   ├── before/
    │   │   └── data.xml       # Will be deleted
    │   └── after/
    │       └── config.yaml    # New file (added)
    └── data.json
```

### How It Works

- **Repositories**: Each directory under `test_user/` represents a repository
- **Pull Requests**: Each numbered subdirectory (1, 2, etc.) represents a PR
- **File Changes**: The server compares `before/` and `after/` directories using git diff to generate file changes
- **File Status Detection**:
  - Files only in `after/`: Status = `added`
  - Files only in `before/`: Status = `removed`
  - Files in both with differences: Status = `modified`

## Quick Start

### Using the default test data

```bash
npm run mock-server
```

The server will start on `http://localhost:3000` using the test data from `tools/test_user`.

### Using custom test data directory

```bash
node tools/gh-mock-server.js path/to/your-user-dir
```

### Using a custom port

```bash
node tools/gh-mock-server.js path/to/your-user-dir 8080
```

## Error Configuration for Testing

The mock server supports error simulation to test how your application handles failures. You can configure endpoints to return specific HTTP error codes or timeout.

### Programmatic Usage with Error Configuration

```javascript
import { startServer } from './tools/gh-mock-server.js';

// Configure specific endpoints to return errors
const errorConfig = {
  listPulls: 404,        // Return 404 for list PRs
  getPull: 500,          // Return 500 for get PR
  addComment: 403,       // Return 403 for add comment
  listComments: 'timeout' // Don't respond (timeout)
};

const server = startServer('./tools/test_user', 3000, errorConfig);
```

### Supported Error Codes

- `400` - Bad Request
- `401` - Requires authentication
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation failed
- `500` - Internal Server Error
- `503` - Service unavailable
- `'timeout'` - No response (simulates timeout)

### Endpoint Configuration Names

- `listUserRepos` - GET /user/repos
- `listPulls` - GET /repos/{owner}/{repo}/pulls
- `getPull` - GET /repos/{owner}/{repo}/pulls/{pull_number}
- `listPullFiles` - GET /repos/{owner}/{repo}/pulls/{pull_number}/files
- `getContents` - GET /repos/{owner}/{repo}/contents/{path}
- `listComments` - GET /repos/{owner}/{repo}/pulls/{pull_number}/comments
- `addComment` - POST /repos/{owner}/{repo}/pulls/{pull_number}/comments
- `editComment` - PATCH /repos/{owner}/{repo}/pulls/comments/{comment_id}
- `deleteComment` - DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}

### Example: Testing Error Handling

```javascript
import { GitHubMockServer } from './tools/gh-mock-server.js';
import http from 'http';

// Create a mock server that returns 404 for get comments
const mockServer = new GitHubMockServer('./tools/test_user', {
  listComments: 404
});

const server = http.createServer((req, res) => {
  mockServer.handleRequest(req, res);
});

server.listen(3000);

// Your integration test can now verify that the app handles 404 gracefully
```

## Test Data Format

The test data JSON file should have the following structure:

```json
{
  "pulls": [
    {
      "number": 1,
      "id": 1,
      "state": "open",
      "title": "PR Title",
      "body": "PR Description",
      "user": { "login": "username", "id": 101, "type": "User" },
      "head": { "ref": "feature-branch", "sha": "abc123" },
      "base": { "ref": "main", "sha": "def456" },
      ...
    }
  ],
  "comments": [
    {
      "id": 1001,
      "pull_number": 1,
      "body": "Comment text",
      "path": "src/file.js",
      "position": 5,
      "line": 10,
      "user": { "login": "reviewer", "id": 201, "type": "User" },
      ...
    }
  ]
}
```

### Required Fields

**Pull Requests:**
- `number` (integer): PR number
- `id` (integer): PR ID
- `state` (string): "open", "closed", or "merged"
- `title` (string): PR title
- `head.sha` (string): Head commit SHA

**Comments:**
- `id` (integer): Unique comment ID
- `pull_number` (integer): Associated PR number
- `body` (string): Comment text

## Usage Examples

### List all repositories for authenticated user

```bash
curl http://localhost:3000/user/repos
```

### List all pull requests

```bash
curl http://localhost:3000/repos/test_user/test_repo_1/pulls
```

### Get a specific pull request

```bash
curl http://localhost:3000/repos/test_user/test_repo_1/pulls/1
```

### List files changed in a pull request

```bash
curl http://localhost:3000/repos/test_user/test_repo_1/pulls/2/files
```

This will show added, modified, and deleted files with their diff stats.

### Get file contents

```bash
curl http://localhost:3000/repos/test_user/test_repo_1/contents/example.js
```

### List comments for a pull request

```bash
curl http://localhost:3000/repos/test_user/test_repo_1/pulls/1/comments
```

### Add a new comment

```bash
curl -X POST http://localhost:3000/repos/test_user/test_repo_1/pulls/1/comments \
  -H "Content-Type: application/json" \
  -d '{
    "body": "This looks good!",
    "path": "example.js",
    "position": 5,
    "line": 10
  }'
```

### Edit a comment

```bash
curl -X PATCH http://localhost:3000/repos/test_user/test_repo_1/pulls/comments/1001 \
  -H "Content-Type: application/json" \
  -d '{"body": "Updated comment text"}'
```

### Delete a comment

```bash
curl -X DELETE http://localhost:3000/repos/test_user/test_repo_1/pulls/comments/1001
```

## Statefulness

The mock server maintains state in memory:
- Adding a comment increases the comment count
- Editing a comment updates its content and `updated_at` timestamp
- Deleting a comment removes it from the server

**Important**: State is not persisted to the JSON file. Restarting the server will reload the original test data.

## Integration Testing

The mock server is ideal for integration tests:

```javascript
// Example test setup
const API_BASE = 'http://localhost:3000';

beforeAll(async () => {
  // Start mock server programmatically if needed
});

test('should list pull requests', async () => {
  const response = await fetch(`${API_BASE}/repos/testorg/test-repo/pulls`);
  const pulls = await response.json();
  expect(pulls.length).toBeGreaterThan(0);
});

test('should add and delete comment', async () => {
  // Add comment
  const addResponse = await fetch(
    `${API_BASE}/repos/testorg/test-repo/pulls/1/comments`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: 'Test comment', path: 'test.js', line: 5 })
    }
  );
  const newComment = await addResponse.json();
  
  // Delete comment
  const deleteResponse = await fetch(
    `${API_BASE}/repos/testorg/test-repo/pulls/comments/${newComment.id}`,
    { method: 'DELETE' }
  );
  expect(deleteResponse.status).toBe(204);
});
```

## Development

The mock server can run alongside your development environment:

1. Start the mock server: `npm run mock-server`
2. Configure your app to use `http://localhost:3000` as the GitHub API base URL
3. Develop and test without hitting the real GitHub API

## CORS Support

The mock server includes CORS headers, allowing browser-based applications to make requests.
