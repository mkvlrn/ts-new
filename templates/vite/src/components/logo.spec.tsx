import { cleanup, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test } from 'vitest';
import { Title } from '#/components/title.jsx';

describe('all components', () => {
  beforeEach(() => {
    cleanup();
  });

  test('title.tsx', () => {
    render(<Title />);

    const title = screen.getByRole('heading');

    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('React TypeScript SPA');
  });
});
