import { formatDisplayDate, nightsBetween } from '@/lib/dates';
import type { BookingConfirmation as Confirmation } from '@/lib/types';

type BookingConfirmationProps = {
  booking: Confirmation;
};

export default function BookingConfirmation({
  booking,
}: BookingConfirmationProps) {
  const nights = nightsBetween(booking.checkIn, booking.checkOut).length;
  return (
    <dl className="flex flex-col gap-4 text-sm text-foreground">
      <div>
        <dt className="text-muted">Booking number</dt>
        <dd className="font-heading text-3xl tracking-wide">
          {booking.bookingNumber}
        </dd>
      </div>
      <div>
        <dt className="text-muted">Your stay</dt>
        <dd>
          {formatDisplayDate(booking.checkIn)} –{' '}
          {formatDisplayDate(booking.checkOut)} · {nights}{' '}
          {nights === 1 ? 'night' : 'nights'}
        </dd>
      </div>
    </dl>
  );
}
