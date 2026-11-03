const YES_ANSWERS = new Set([
  'yes',
  'y',
  'yeah',
  'yep',
  'yup',
  'sure',
  'ok',
  'okay',
  'correct',
  'confirm',
  'yes please',
  'please do',
  'book it',
]);

const NO_ANSWERS = new Set(['no', 'n', 'nope', 'nah', 'cancel', 'no thanks']);

function toAnswerWords(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isYes(text: string): boolean {
  return YES_ANSWERS.has(toAnswerWords(text));
}

export function isNo(text: string): boolean {
  return NO_ANSWERS.has(toAnswerWords(text));
}

const BOOKING_WORDS = '(?:make (?:a )?)?(?:book|booking|reserve|reservation)';

const CANCEL_WORDS = 'cancel';

const REQUEST_CUES =
  '(?:want|wanna|like|need|looking|ready|hoping|planning|can i|could i|may i|can we|could we|let me|help me|i ll|we ll)';

const QUESTION_STARTS = new Set([
  'how',
  'what',
  'when',
  'where',
  'why',
  'which',
  'who',
  'do',
  'does',
  'is',
  'are',
]);

function requestMatcher(actionWords: string): (text: string) => boolean {
  const startsWithAction = new RegExp(`^${actionWords}\\b`);
  const asksForAction = new RegExp(
    `\\b${REQUEST_CUES}(?: to)? (?:a )?${actionWords}\\b`,
  );
  return (text: string): boolean => {
    const words = toAnswerWords(text);
    const firstWord = words.split(' ')[0];
    if (QUESTION_STARTS.has(firstWord)) {
      return false;
    }
    return startsWithAction.test(words) || asksForAction.test(words);
  };
}

export const isBookingRequest = requestMatcher(BOOKING_WORDS);

export const isCancelRequest = requestMatcher(CANCEL_WORDS);
