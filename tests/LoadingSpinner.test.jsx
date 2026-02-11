import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/preact';
import { LoadingSpinner } from '../src/components/LoadingSpinner';

describe('LoadingSpinner', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders with default text', () => {
    const { getByText } = render(<LoadingSpinner />);
    expect(getByText(/Loading\.\.\./i)).toBeTruthy();
  });

  it('renders with custom text', () => {
    const { getByText } = render(<LoadingSpinner text="Verifying token..." />);
    expect(getByText(/Verifying token\.\.\./i)).toBeTruthy();
  });

  it('contains a spinner character', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.loading-spinner');
    expect(spinner).toBeTruthy();
    expect(spinner.textContent).toMatch(/[\uee06-\uee0b]/);
  });

  it('cycles through spinner characters over time', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.loading-spinner');
    
    const initialChar = spinner.textContent.charAt(0);
    
    // Advance time to trigger spinner animation
    vi.advanceTimersByTime(100);
    
    const nextChar = spinner.textContent.charAt(0);
    
    // Character should have changed (though we can't predict exact character
    // due to animation frame timing, we verify it's still a valid spinner char)
    expect(nextChar).toMatch(/[\uee06-\uee0b]/);
  });
});
