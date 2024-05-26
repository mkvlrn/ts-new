import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import RootLayout from '#/app/layout.jsx';

vi.mock('next/font/google', () => ({
  Inter: () => ({ className: 'mocked-inter' }),
}));

test('RootLayout renders children correctly', async () => {
  render(<RootLayout>Test Child</RootLayout>);

  const childElement = screen.getByText('Test Child');
  expect(childElement).toBeInTheDocument();
});
