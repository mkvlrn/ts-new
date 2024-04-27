import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { App } from '#/app/main';

test('it works', () => {
  render(<App />);

  const app = screen.getByRole('main');

  expect(app).toBeInTheDocument();
});
