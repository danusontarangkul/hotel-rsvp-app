import { isNo, isYes } from './chat-answers';

describe('isYes', () => {
  it.each(['Yes', 'yes!', ' YES ', 'y', 'yep', 'Sure', 'ok', 'Yes, please'])(
    'reads "%s" as yes',
    (text) => {
      expect(isYes(text)).toBe(true);
    },
  );

  it.each(['no', 'maybe', 'yes but change the dates', ''])(
    'does not read "%s" as yes',
    (text) => {
      expect(isYes(text)).toBe(false);
    },
  );
});

describe('isNo', () => {
  it.each(['No', 'no.', 'NOPE', 'n', 'cancel', 'No thanks'])(
    'reads "%s" as no',
    (text) => {
      expect(isNo(text)).toBe(true);
    },
  );

  it.each(['yes', 'not sure', ''])('does not read "%s" as no', (text) => {
    expect(isNo(text)).toBe(false);
  });
});
