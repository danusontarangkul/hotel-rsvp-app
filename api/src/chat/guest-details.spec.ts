import {
  GUEST_EMAIL_LABEL,
  GUEST_NAME_LABEL,
  GUEST_PHONE_LABEL,
} from './chat.constants';
import { guestDetailsNotTyped } from './guest-details';

const details = {
  guestName: 'Ana Lopez',
  guestEmail: 'ana@example.com',
  guestPhone: '5550100123',
};

describe('guestDetailsNotTyped', () => {
  it('finds nothing missing when the guest typed every detail', () => {
    expect(
      guestDetailsNotTyped(
        details,
        'Book it for Ana Lopez, ana@example.com, 555-010-0123',
      ),
    ).toEqual([]);
  });

  it('accepts details typed across several messages', () => {
    expect(
      guestDetailsNotTyped(
        details,
        'My name is ana lopez\nEmail is ANA@example.com\nPhone (555) 010-0123',
      ),
    ).toEqual([]);
  });

  it('flags every detail when the guest typed none', () => {
    expect(
      guestDetailsNotTyped(details, 'Book Dec 15 to Dec 17 for me please. Yes'),
    ).toEqual([GUEST_NAME_LABEL, GUEST_EMAIL_LABEL, GUEST_PHONE_LABEL]);
  });

  it('flags a name the guest only partly typed', () => {
    expect(
      guestDetailsNotTyped(details, 'I am Ana, ana@example.com, 5550100123'),
    ).toEqual([GUEST_NAME_LABEL]);
  });

  it('does not count a name part found inside another word', () => {
    expect(
      guestDetailsNotTyped(
        { ...details, guestName: 'Ana Lo' },
        'I am Ana Lopez, ana@example.com, 5550100123',
      ),
    ).toEqual([GUEST_NAME_LABEL]);
  });

  it('flags an email the guest did not type', () => {
    expect(guestDetailsNotTyped(details, 'Ana Lopez, 5550100123')).toEqual([
      GUEST_EMAIL_LABEL,
    ]);
  });

  it('flags a phone number the guest did not type', () => {
    expect(guestDetailsNotTyped(details, 'Ana Lopez, ana@example.com')).toEqual(
      [GUEST_PHONE_LABEL],
    );
  });

  it('flags blank details', () => {
    expect(
      guestDetailsNotTyped(
        { guestName: '', guestEmail: '', guestPhone: '' },
        'Ana Lopez, ana@example.com, 5550100123',
      ),
    ).toEqual([GUEST_NAME_LABEL, GUEST_EMAIL_LABEL, GUEST_PHONE_LABEL]);
  });
});
