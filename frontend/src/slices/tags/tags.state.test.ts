import { describe, expect, it } from 'vitest';
import { normalizeTagName } from './tags.state.ts';

describe('normalizeTagName helper', () => {
  it('strips leading hashtag, trims whitespace and converts to lowercase', () => {
    expect(normalizeTagName('#Feature')).toBe('feature');
    expect(normalizeTagName('  #Urgent  ')).toBe('urgent');
    expect(normalizeTagName('BUG')).toBe('bug');
    expect(normalizeTagName('   ')).toBe('');
  });
});
