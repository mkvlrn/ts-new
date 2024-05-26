import { cleanup, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test } from 'vitest';
import { Logo } from '#/components/logo.jsx';

describe('all components', () => {
  beforeEach(() => {
    cleanup();
  });

  test('logo.tsx', () => {
    render(<Logo />);

    const logo = screen.getByRole('img');

    expect(logo).toBeInTheDocument();
  });
});
