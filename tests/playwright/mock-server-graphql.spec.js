/*
 * Integration tests for the mock server GraphQL API
 * Tests the mock server directly without UI
 */

import { test, expect } from './fixtures.js';

const MOCK_SERVER_URL = 'http://localhost:3000';

test.describe('Mock Server GraphQL API', { tag: '@serial' }, () => {
  test('should add a comment to a new thread via GraphQL mutation', async ({ request }) => {
    // Get PR and review data
    const prResponse = await request.get(`${MOCK_SERVER_URL}/repos/test_user/test_repo_1/pulls/1`);
    expect(prResponse.ok()).toBeTruthy();
    const pr = await prResponse.json();
    expect(pr.node_id).toBeTruthy();
    
    const reviewsResponse = await request.get(`${MOCK_SERVER_URL}/repos/test_user/test_repo_1/pulls/1/reviews`);
    expect(reviewsResponse.ok()).toBeTruthy();
    const reviews = await reviewsResponse.json();
    const pendingReview = reviews.find(r => r.state === 'PENDING');
    expect(pendingReview).toBeTruthy();
    expect(pendingReview.node_id).toBeTruthy();
    
    // Test the GraphQL mutation
    const response = await request.post(`${MOCK_SERVER_URL}/graphql`, {
      data: {
        query: `
          mutation($input: AddPullRequestReviewThreadInput!) {
            addPullRequestReviewThread(input: $input) {
              thread {
                id
                isResolved
                comments {
                  nodes {
                    id
                    body
                    path
                    line
                  }
                }
              }
            }
          }
        `,
        variables: {
          input: {
            pullRequestId: pr.node_id,
            pullRequestReviewId: pendingReview.node_id,
            body: 'Test comment from integration test',
            path: 'empty-lines.txt',
            line: 5,
            side: 'RIGHT'
          }
        }
      }
    });
    
    const result = await response.json();
    console.log('Mutation response:', JSON.stringify(result, null, 2));
    
    expect(response.status()).toBe(200);
    expect(result.errors).toBeUndefined();
    expect(result.data).toBeTruthy();
    expect(result.data.addPullRequestReviewThread).toBeTruthy();
    expect(result.data.addPullRequestReviewThread.thread).toBeTruthy();
    expect(result.data.addPullRequestReviewThread.thread.id).toBeTruthy();
    expect(result.data.addPullRequestReviewThread.thread.comments.nodes).toHaveLength(1);
    expect(result.data.addPullRequestReviewThread.thread.comments.nodes[0].body).toBe('Test comment from integration test');
    expect(result.data.addPullRequestReviewThread.thread.comments.nodes[0].path).toBe('empty-lines.txt');
    expect(result.data.addPullRequestReviewThread.thread.comments.nodes[0].line).toBe(5);
  });
  
  test('should add a comment to an existing thread via GraphQL mutation', async ({ request }) => {
    // Get PR and review data
    const prResponse = await request.get(`${MOCK_SERVER_URL}/repos/test_user/test_repo_1/pulls/1`);
    const pr = await prResponse.json();
    
    const reviewsResponse = await request.get(`${MOCK_SERVER_URL}/repos/test_user/test_repo_1/pulls/1/reviews`);
    const reviews = await reviewsResponse.json();
    const pendingReview = reviews.find(r => r.state === 'PENDING');
    
    // Get existing review threads
    const threadsResponse = await request.post(`${MOCK_SERVER_URL}/graphql`, {
      data: {
        query: `
          query($owner: String!, $repo: String!, $prNumber: Int!) {
            repository(owner: $owner, name: $repo) {
              pullRequest(number: $prNumber) {
                reviewThreads(first: 100) {
                  nodes {
                    id
                    path
                    line
                    comments {
                      nodes {
                        id
                      }
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {
          owner: 'test_user',
          repo: 'test_repo_1',
          prNumber: 1
        }
      }
    });
    
    const threadsResult = await threadsResponse.json();
    expect(threadsResult.data.repository.pullRequest.reviewThreads.nodes.length).toBeGreaterThan(0);
    
    const existingThread = threadsResult.data.repository.pullRequest.reviewThreads.nodes[0];
    const initialCommentCount = existingThread.comments.nodes.length;
    
    // Add a comment to the same path/line
    const addResponse = await request.post(`${MOCK_SERVER_URL}/graphql`, {
      data: {
        query: `
          mutation($input: AddPullRequestReviewThreadInput!) {
            addPullRequestReviewThread(input: $input) {
              thread {
                id
                comments {
                  nodes {
                    id
                    body
                  }
                }
              }
            }
          }
        `,
        variables: {
          input: {
            pullRequestId: pr.node_id,
            pullRequestReviewId: pendingReview.node_id,
            body: 'Reply to existing thread',
            path: existingThread.path,
            line: existingThread.line,
            side: 'RIGHT'
          }
        }
      }
    });
    
    const addResult = await addResponse.json();
    console.log('Add to existing thread response:', JSON.stringify(addResult, null, 2));
    
    expect(addResponse.status()).toBe(200);
    expect(addResult.errors).toBeUndefined();
    expect(addResult.data.addPullRequestReviewThread.thread.comments.nodes.length).toBe(initialCommentCount + 1);
    expect(addResult.data.addPullRequestReviewThread.thread.comments.nodes.some(c => c.body === 'Reply to existing thread')).toBe(true);
  });
  
  test('should return review threads via GraphQL query', async ({ request }) => {
    const response = await request.post(`${MOCK_SERVER_URL}/graphql`, {
      data: {
        query: `
          query($owner: String!, $repo: String!, $prNumber: Int!) {
            repository(owner: $owner, name: $repo) {
              pullRequest(number: $prNumber) {
                reviewThreads(first: 100) {
                  nodes {
                    id
                    path
                    line
                    isResolved
                    comments {
                      nodes {
                        id
                        body
                      }
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {
          owner: 'test_user',
          repo: 'test_repo_1',
          prNumber: 1
        }
      }
    });
    
    const result = await response.json();
    expect(response.status()).toBe(200);
    expect(result.errors).toBeUndefined();
    expect(result.data.repository.pullRequest.reviewThreads.nodes).toBeInstanceOf(Array);
    expect(result.data.repository.pullRequest.reviewThreads.nodes.length).toBeGreaterThan(0);
    
    // Verify structure
    const thread = result.data.repository.pullRequest.reviewThreads.nodes[0];
    expect(thread.id).toBeTruthy();
    expect(thread.path).toBeTruthy();
    expect(typeof thread.line).toBe('number');
    expect(typeof thread.isResolved).toBe('boolean');
    expect(thread.comments.nodes).toBeInstanceOf(Array);
  });
  
  test('should return reviews via GraphQL query', async ({ request }) => {
    const response = await request.post(`${MOCK_SERVER_URL}/graphql`, {
      data: {
        query: `
          query($owner: String!, $repo: String!, $prNumber: Int!) {
            repository(owner: $owner, name: $repo) {
              pullRequest(number: $prNumber) {
                reviews(first: 100) {
                  nodes {
                    id
                    state
                    comments {
                      nodes {
                        id
                        body
                      }
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {
          owner: 'test_user',
          repo: 'test_repo_1',
          prNumber: 1
        }
      }
    });
    
    const result = await response.json();
    expect(response.status()).toBe(200);
    expect(result.errors).toBeUndefined();
    expect(result.data.repository.pullRequest.reviews.nodes).toBeInstanceOf(Array);
  });
  
  test('should add a REST comment (for comparison with GraphQL)', async ({ request }) => {
    // This tests a working REST endpoint that uses readBody
    // Compare its behavior with GraphQL endpoint to find the difference
    const response = await request.post(`${MOCK_SERVER_URL}/repos/test_user/test_repo_1/pulls/1/comments`, {
      data: {
        body: 'Test REST comment',
        path: 'empty-lines.txt',
        line: 3,
        side: 'RIGHT'
      }
    });
    
    const result = await response.json();
    console.log('REST comment response:', JSON.stringify(result, null, 2));
    
    expect(response.status()).toBe(201);
    expect(result.id).toBeTruthy();
    expect(result.body).toBe('Test REST comment');
    expect(result.path).toBe('empty-lines.txt');
    expect(result.line).toBe(3);
  });
});
