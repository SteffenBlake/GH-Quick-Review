/*
 * Integration tests for review creation API validation
 * Tests the mock server's event validation for creating reviews
 */

import { test, expect } from './fixtures.js';

const MOCK_SERVER_URL = 'http://localhost:3000';

test.describe('Review Creation Event Validation', { tag: '@parallel' }, () => {
  test('should reject invalid event value', async ({ request }) => {
    // Attempt to create a review with invalid event value
    const response = await request.post(`${MOCK_SERVER_URL}/repos/test_user/test_repo_1/pulls/1/reviews`, {
      data: {
        commit_id: 'abc123',
        body: 'Test review',
        event: 'PENDING'  // Invalid - PENDING is not a valid event value
      }
    });
    
    expect(response.status()).toBe(422);
    const error = await response.json();
    expect(error.message).toBe('Validation Failed');
    expect(error.errors).toBeDefined();
    expect(error.errors[0].field).toBe('event');
  });
  
  test('should accept APPROVE as valid event', async ({ request }) => {
    const response = await request.post(`${MOCK_SERVER_URL}/repos/test_user/test_repo_1/pulls/1/reviews`, {
      data: {
        commit_id: 'abc123',
        body: 'Looks good!',
        event: 'APPROVE'
      }
    });
    
    expect(response.status()).toBe(200);
    const review = await response.json();
    expect(review.state).toBe('APPROVE');
    expect(review.submitted_at).toBeDefined();
  });
  
  test('should accept REQUEST_CHANGES as valid event', async ({ request }) => {
    const response = await request.post(`${MOCK_SERVER_URL}/repos/test_user/test_repo_1/pulls/1/reviews`, {
      data: {
        commit_id: 'abc123',
        body: 'Please fix this',
        event: 'REQUEST_CHANGES'
      }
    });
    
    expect(response.status()).toBe(200);
    const review = await response.json();
    expect(review.state).toBe('REQUEST_CHANGES');
    expect(review.submitted_at).toBeDefined();
  });
  
  test('should accept COMMENT as valid event', async ({ request }) => {
    const response = await request.post(`${MOCK_SERVER_URL}/repos/test_user/test_repo_1/pulls/1/reviews`, {
      data: {
        commit_id: 'abc123',
        body: 'Just a comment',
        event: 'COMMENT'
      }
    });
    
    expect(response.status()).toBe(200);
    const review = await response.json();
    expect(review.state).toBe('COMMENT');
    expect(review.submitted_at).toBeDefined();
  });
  
  test('should create PENDING review when event is omitted', async ({ request }) => {
    const response = await request.post(`${MOCK_SERVER_URL}/repos/test_user/test_repo_1/pulls/1/reviews`, {
      data: {
        commit_id: 'abc123',
        body: 'Draft review'
      }
    });
    
    expect(response.status()).toBe(200);
    const review = await response.json();
    expect(review.state).toBe('PENDING');
    expect(review.submitted_at).toBeUndefined();
  });
  
  test('should reject other invalid event values', async ({ request }) => {
    const invalidEvents = ['INVALID', 'REJECT', 'DISMISS', 'pending', 'approve'];
    
    for (const invalidEvent of invalidEvents) {
      const response = await request.post(`${MOCK_SERVER_URL}/repos/test_user/test_repo_1/pulls/1/reviews`, {
        data: {
          commit_id: 'abc123',
          body: 'Test',
          event: invalidEvent
        }
      });
      
      expect(response.status()).toBe(422);
      const error = await response.json();
      expect(error.message).toBe('Validation Failed');
    }
  });
});
