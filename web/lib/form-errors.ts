import type { ApiError } from './api';

export type FormErrors<Field extends string> = {
  fields: Partial<Record<Field, string[]>>;
  form: string[];
};

export function groupErrors<Field extends string>(
  messages: string[],
  fields: readonly Field[],
): FormErrors<Field> {
  const result: FormErrors<Field> = { fields: {}, form: [] };
  for (const message of messages) {
    const field = fields.find((name) =>
      message.toLowerCase().startsWith(`${name.toLowerCase()} `),
    );
    if (field) {
      result.fields[field] = [...(result.fields[field] ?? []), message];
    } else {
      result.form.push(message);
    }
  }
  return result;
}

export function toFormErrors<Field extends string>(
  error: ApiError | null,
  fields: readonly Field[],
  fieldForStatus: Partial<Record<number, Field>> = {},
): FormErrors<Field> {
  if (!error) {
    return { fields: {}, form: [] };
  }
  const field = fieldForStatus[error.status];
  if (field) {
    const result: FormErrors<Field> = { fields: {}, form: [] };
    result.fields[field] = error.messages;
    return result;
  }
  return groupErrors(error.messages, fields);
}
