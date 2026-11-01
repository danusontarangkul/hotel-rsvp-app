import { trimText } from './text';

describe('trimText', () => {
  it('removes spaces and line breaks from both ends', () => {
    expect(trimText('\n  Nov 3 is open.  \n')).toBe('Nov 3 is open.');
  });

  it('keeps spaces inside the text', () => {
    expect(trimText('Nov 3  is open.')).toBe('Nov 3  is open.');
  });

  it('returns an empty string for only spaces', () => {
    expect(trimText('   ')).toBe('');
  });
});
