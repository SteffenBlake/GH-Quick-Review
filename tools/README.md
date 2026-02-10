# GitHub Mock Server

A lightweight, stateful mock server for GitHub API endpoints, specifically designed for testing and development of GitHub integrations.

## Features

- **Stateful**: Changes made during runtime (add, edit, delete comments) persist in memory
- **File-based initialization**: Load test data from JSON files
- **Simple to use**: Start with a single npm command
- **RESTful**: Implements authentic GitHub API patterns

## Supported Endpoints

The mock server supports the following GitHub API endpoints:

1. **List Pull Requests**  
   `GET /repos/{owner}/{repo}/pulls`

2. **Get Pull Request**  
   `GET /repos/{owner}/{repo}/pulls/{pull_number}`

3. **List Review Comments**  
   `GET /repos/{owner}/{repo}/pulls/{pull_number}/comments`

4. **Add Review Comment**  
   `POST /repos/{owner}/{repo}/pulls/{pull_number}/comments`

5. **Edit Review Comment**  
   `PATCH /repos/{owner}/{repo}/pulls/comments/{comment_id}`

6. **Delete Review Comment**  
   `DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}`

## Quick Start

### Using the default test data

```bash
npm run mock-server
```

The server will start on `http://localhost:3000` using the test data from `tools/test-data.json`.

### Using custom test data

```bash
node tools/gh-mock-server.js path/to/your-data.json
```

### Using a custom port

```bash
node tools/gh-mock-server.js path/to/your-data.json 8080
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

### List all pull requests

```bash
curl http://localhost:3000/repos/testorg/test-repo/pulls
```

### Get a specific pull request

```bash
curl http://localhost:3000/repos/testorg/test-repo/pulls/1
```

### List comments for a pull request

```bash
curl http://localhost:3000/repos/testorg/test-repo/pulls/1/comments
```

### Add a new comment

```bash
curl -X POST http://localhost:3000/repos/testorg/test-repo/pulls/1/comments \
  -H "Content-Type: application/json" \
  -d '{
    "body": "This looks good!",
    "path": "src/index.js",
    "position": 5,
    "line": 10
  }'
```

### Edit a comment

```bash
curl -X PATCH http://localhost:3000/repos/testorg/test-repo/pulls/comments/1001 \
  -H "Content-Type: application/json" \
  -d '{"body": "Updated comment text"}'
```

### Delete a comment

```bash
curl -X DELETE http://localhost:3000/repos/testorg/test-repo/pulls/comments/1001
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
