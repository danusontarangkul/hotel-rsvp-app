import type { ValidationError } from 'class-validator';

export function validationMessages(errors: ValidationError[]): string[] {
  const messages = errors.flatMap((error) => [
    ...Object.values(error.constraints ?? {}),
    ...validationMessages(error.children ?? []),
  ]);
  return [...new Set(messages)];
}
