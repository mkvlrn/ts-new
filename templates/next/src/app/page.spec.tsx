import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import Home from '#/app/page.jsx';

test('Home component renders correctly', async () => {
  render(<Home />);

  const linkElement = screen.getByText(/get started by editing/i);
  expect(linkElement).toBeInTheDocument();
});
