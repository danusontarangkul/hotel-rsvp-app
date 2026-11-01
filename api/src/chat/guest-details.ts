import { toPhoneDigits } from '../common/phone';
import {
  GUEST_EMAIL_LABEL,
  GUEST_NAME_LABEL,
  GUEST_PHONE_LABEL,
} from './chat.constants';

export type GuestDetails = {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
};

const NAME_PART = /[\p{L}\p{N}'-]+/gu;

function toLowerCase(text: string): string {
  return text.toLowerCase();
}

function nameParts(name: string): string[] {
  return toLowerCase(name).match(NAME_PART) ?? [];
}

function nameWasTyped(name: string, typed: string): boolean {
  const typedParts = new Set(nameParts(typed));
  const parts = nameParts(name);
  return parts.length > 0 && parts.every((part) => typedParts.has(part));
}

function emailWasTyped(email: string, typed: string): boolean {
  return email !== '' && toLowerCase(typed).includes(toLowerCase(email));
}

function phoneWasTyped(phone: string, typed: string): boolean {
  const digits = toPhoneDigits(phone);
  return digits !== '' && typed.replace(/\D/g, '').includes(digits);
}

export function guestDetailsNotTyped(
  details: GuestDetails,
  typed: string,
): string[] {
  const missing: string[] = [];
  if (!nameWasTyped(details.guestName, typed)) {
    missing.push(GUEST_NAME_LABEL);
  }
  if (!emailWasTyped(details.guestEmail, typed)) {
    missing.push(GUEST_EMAIL_LABEL);
  }
  if (!phoneWasTyped(details.guestPhone, typed)) {
    missing.push(GUEST_PHONE_LABEL);
  }
  return missing;
}
