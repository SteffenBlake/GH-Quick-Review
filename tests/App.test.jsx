import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/preact';
import { App } from '../src/App';
import * as auth from '../src/utils/auth';

vi.mock('../src/utils/auth');

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when not authenticated', () => {
    beforeEach(() => {
      auth.isAuthenticated.mockReturnValue(false);
    });

    it('renders the login page', () => {
      const { getByText } = render(<App />);
      expect(getByText(/Login Required/i)).toBeTruthy();
    });

    it('does not render the main content', () => {
      const { queryByText } = render(<App />);
      expect(queryByText(/Lorem ipsum dolor sit amet/i)).toBeFalsy();
    });
  });

  describe('when authenticated', () => {
    beforeEach(() => {
      auth.isAuthenticated.mockReturnValue(true);
    });

    it('renders the app title with GitHub icon', () => {
      const { getByText } = render(<App />);
      expect(getByText('GH Quick Review')).toBeTruthy();
    });

    it('renders the font picker', () => {
      const { getByLabelText } = render(<App />);
      expect(getByLabelText('Font:')).toBeTruthy();
    });

    it('renders lorem ipsum content', () => {
      const { getByText } = render(<App />);
      expect(getByText(/Lorem ipsum dolor sit amet/i)).toBeTruthy();
    });

    it('renders the logout button', () => {
      const { getByTitle } = render(<App />);
      expect(getByTitle('Logout')).toBeTruthy();
    });

    it('does not render the login page', () => {
      const { queryByText } = render(<App />);
      expect(queryByText(/Login Required/i)).toBeFalsy();
    });
  });
});
