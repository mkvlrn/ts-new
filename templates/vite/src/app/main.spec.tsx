import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { App } from '#/app/main.jsx';

test('it works', () => {
  render(<App />);

  const app = screen.getByRole('main');

  expect(app).toBeInTheDocument();
});
