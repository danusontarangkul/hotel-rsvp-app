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
