import type { ValidationError } from 'class-validator';
import { validationMessages } from './validation-errors';

function error(
  property: string,
  constraints: Record<string, string> = {},
  children: ValidationError[] = [],
): ValidationError {
  return { property, constraints, children };
}

describe('validationMessages', () => {
  it('lists the message of each failed field', () => {
    const errors = [
      error('guestName', { isNotEmpty: 'Name is required.' }),
      error('guestEmail', { isEmail: 'Email must be a valid email address.' }),
    ];

    expect(validationMessages(errors)).toEqual([
      'Name is required.',
      'Email must be a valid email address.',
    ]);
  });

  it('lists nested messages without the field path', () => {
    const errors = [
      error('messages', {}, [
        error('0', {}, [
          error('content', { isNotEmpty: 'Message content is required.' }),
        ]),
      ]),
    ];

    expect(validationMessages(errors)).toEqual([
      'Message content is required.',
    ]);
  });

  it('lists a repeated message once', () => {
    const errors = [
      error('messages', {}, [
        error('0', {}, [
          error('content', { isNotEmpty: 'Message content is required.' }),
        ]),
        error('1', {}, [
          error('content', { isNotEmpty: 'Message content is required.' }),
        ]),
      ]),
    ];

    expect(validationMessages(errors)).toEqual([
      'Message content is required.',
    ]);
  });

  it('returns nothing for no errors', () => {
    expect(validationMessages([])).toEqual([]);
  });
});
