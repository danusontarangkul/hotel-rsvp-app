import { joinWithAnd, trimText } from './text';

describe('joinWithAnd', () => {
  it('returns a single item as is', () => {
    expect(joinWithAnd(['Friday'])).toBe('Friday');
  });

  it('joins two items with "and"', () => {
    expect(joinWithAnd(['Friday', 'Saturday'])).toBe('Friday and Saturday');
  });

  it('joins three or more with commas and a final "and"', () => {
    expect(joinWithAnd(['Friday', 'Saturday', 'Sunday'])).toBe(
      'Friday, Saturday and Sunday',
    );
  });

  it('returns an empty string for no items', () => {
    expect(joinWithAnd([])).toBe('');
  });
});

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
