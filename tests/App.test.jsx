import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/preact';
import { App } from '../src/App';

describe('App', () => {
  it('renders the app title', () => {
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
});
