import { expect, test } from 'vitest';
import { add } from './math';

test('add', () => {
  const twoPlusTwo = add(2, 2);
  expect(twoPlusTwo).toBe(4);
});
