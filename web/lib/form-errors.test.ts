import { ApiError } from './api';
import { groupErrors, toFormErrors } from './form-errors';

const FIELDS = ['name', 'email', 'password'] as const;

describe('groupErrors', () => {
  it('puts a message under the field it starts with', () => {
    expect(groupErrors(['email must be an email'], FIELDS)).toEqual({
      fields: { email: ['email must be an email'] },
      form: [],
    });
  });

  it('keeps several messages for the same field', () => {
    const messages = ['name should not be empty', 'name must be a string'];
    expect(groupErrors(messages, FIELDS).fields.name).toEqual(messages);
  });

  it('puts a message that names no field into the form errors', () => {
    expect(groupErrors(['Something broke'], FIELDS)).toEqual({
      fields: {},
      form: ['Something broke'],
    });
  });

  it('does not match a field name that is only a prefix of a word', () => {
    expect(groupErrors(['emails are closed'], FIELDS).form).toEqual([
      'emails are closed',
    ]);
  });
});

describe('toFormErrors', () => {
  it('returns no errors when there is no error', () => {
    expect(toFormErrors(null, FIELDS)).toEqual({ fields: {}, form: [] });
  });

  it('puts every message of a mapped status under that field', () => {
    const error = new ApiError(409, ['Email is already registered']);

    expect(toFormErrors(error, FIELDS, { 409: 'email' })).toEqual({
      fields: { email: ['Email is already registered'] },
      form: [],
    });
  });

  it('groups a 400 list by field name', () => {
    const error = new ApiError(400, [
      'email must be an email',
      'password is too short',
    ]);

    expect(toFormErrors(error, FIELDS, { 409: 'email' })).toEqual({
      fields: {
        email: ['email must be an email'],
        password: ['password is too short'],
      },
      form: [],
    });
  });

  it('shows an unmapped status at form level', () => {
    const error = new ApiError(401, ['Wrong email or password']);

    expect(toFormErrors(error, FIELDS)).toEqual({
      fields: {},
      form: ['Wrong email or password'],
    });
  });
});
