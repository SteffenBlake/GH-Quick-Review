/*
 * Integration tests for the mock server
 * Tests the GraphQL API directly without browser/UI
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn } from 'child_process';

const MOCK_SERVER_URL = 'http://localhost:3000';
let serverProcess;

describe('Mock Server GraphQL API', () => {
  beforeAll(async () => {
    // Start the mock server
    serverProcess = spawn('node', ['tools/gh-mock-server.js', 'tools/test_user'], {
      cwd: process.cwd(),
      stdio: 'pipe'
    });
    
    // Wait for server to be ready
    await new Promise((resolve) => {
      const checkServer = async () => {
        try {
          const response = await fetch(`${MOCK_SERVER_URL}/heartbeat`);
          if (response.ok) {
            resolve();
          } else {
            setTimeout(checkServer, 100);
          }
        } catch (error) {
          setTimeout(checkServer, 100);
        }
      };
      checkServer();
    });
  });
  
  afterAll(() => {
    // Stop the mock server
    if (serverProcess) {
      serverProcess.kill();
    }
  });
  
  describe('addPullRequestReviewThread mutation', () => {
    it('should add a comment to a new thread', async () => {
      console.log('[TEST] Starting: should add a comment to a new thread');
      // First, get the PR and review data we need
      const prResponse = await fetch(`${MOCK_SERVER_URL}/repos/test_user/test_repo_1/pulls/1`);
      const pr = await prResponse.json();
      expect(pr.node_id).toBeTruthy();
      
      const reviewsResponse = await fetch(`${MOCK_SERVER_URL}/repos/test_user/test_repo_1/pulls/1/reviews`);
      const reviews = await reviewsResponse.json();
      const pendingReview = reviews.find(r => r.state === 'PENDING');
      expect(pendingReview).toBeTruthy();
      expect(pendingReview.node_id).toBeTruthy();
      
      // Now test the GraphQL mutation
      const response = await fetch(`${MOCK_SERVER_URL}/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        })
      });
      
      const result = await response.json();
      expect(response.status).toBe(200);
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
    
    it('should add a comment to an existing thread', async () => {
      // Get PR and review data
      const prResponse = await fetch(`${MOCK_SERVER_URL}/repos/test_user/test_repo_1/pulls/1`);
      const pr = await prResponse.json();
      
      const reviewsResponse = await fetch(`${MOCK_SERVER_URL}/repos/test_user/test_repo_1/pulls/1/reviews`);
      const reviews = await reviewsResponse.json();
      const pendingReview = reviews.find(r => r.state === 'PENDING');
      
      // First, get the existing review threads to find one to add to
      const threadsResponse = await fetch(`${MOCK_SERVER_URL}/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        })
      });
      
      const threadsResult = await threadsResponse.json();
      expect(threadsResult.data.repository.pullRequest.reviewThreads.nodes.length).toBeGreaterThan(0);
      
      const existingThread = threadsResult.data.repository.pullRequest.reviewThreads.nodes[0];
      const initialCommentCount = existingThread.comments.nodes.length;
      
      // Add a comment to the same path/line as the existing thread
      const addResponse = await fetch(`${MOCK_SERVER_URL}/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        })
      });
      
      const addResult = await addResponse.json();
      expect(addResponse.status).toBe(200);
      expect(addResult.errors).toBeUndefined();
      expect(addResult.data.addPullRequestReviewThread.thread.comments.nodes.length).toBe(initialCommentCount + 1);
      expect(addResult.data.addPullRequestReviewThread.thread.comments.nodes.some(c => c.body === 'Reply to existing thread')).toBe(true);
    });
  });
  
  describe('reviewThreads query', () => {
    it('should return all review threads for a PR', async () => {
      const response = await fetch(`${MOCK_SERVER_URL}/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        })
      });
      
      const result = await response.json();
      expect(response.status).toBe(200);
      expect(result.errors).toBeUndefined();
      expect(result.data.repository.pullRequest.reviewThreads.nodes).toBeInstanceOf(Array);
      expect(result.data.repository.pullRequest.reviewThreads.nodes.length).toBeGreaterThan(0);
      
      // Verify structure of threads
      const thread = result.data.repository.pullRequest.reviewThreads.nodes[0];
      expect(thread.id).toBeTruthy();
      expect(thread.path).toBeTruthy();
      expect(typeof thread.line).toBe('number');
      expect(typeof thread.isResolved).toBe('boolean');
      expect(thread.comments.nodes).toBeInstanceOf(Array);
    });
  });
  
  describe('reviews query', () => {
    it('should return reviews for a PR without matching reviewThreads', async () => {
      const response = await fetch(`${MOCK_SERVER_URL}/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        })
      });
      
      const result = await response.json();
      expect(response.status).toBe(200);
      expect(result.errors).toBeUndefined();
      expect(result.data.repository.pullRequest.reviews.nodes).toBeInstanceOf(Array);
    });
  });
});
