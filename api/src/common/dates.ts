const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toUtcDate(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

function fromUtcDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function todayIn(timeZone: string, now: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function addDays(date: string, days: number): string {
  return fromUtcDate(new Date(toUtcDate(date).getTime() + days * MS_PER_DAY));
}

export function nightsBetween(checkIn: string, checkOut: string): string[] {
  const nights: string[] = [];
  for (let night = checkIn; night < checkOut; night = addDays(night, 1)) {
    nights.push(night);
  }
  return nights;
}
