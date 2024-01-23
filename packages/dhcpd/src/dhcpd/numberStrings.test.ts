import { describe, expect, it } from 'vitest';
import { forNumber__TESTING, forString__TESTING } from './numberStrings.js';

const VALUES = [
  [1, 'ONE'],
  [3, 'THREE'],
  [100, 'ONE_HUNDRED'],
] as const;

const valuesForNumber = forNumber__TESTING(VALUES);
const valuesForString = forString__TESTING(VALUES);

describe('numberStrings', () => {
  it('forNumber', () => {
    expect(valuesForNumber(0)).toBeUndefined();
    expect(valuesForNumber(1)).toBe('ONE');
    expect(valuesForNumber(2)).toBeUndefined();
    expect(valuesForNumber(3)).toBe('THREE');
  });

  it('forString', () => {
    expect(valuesForString('ONE')).toBe(1);
    expect(valuesForString('THREE')).toBe(3);
  });
});
