import Button from '@/components/shared/Button';
import EmptyState from '@/components/shared/EmptyState';
import Table from '@/components/shared/Table';
import TableCell from '@/components/shared/TableCell';
import TableRow from '@/components/shared/TableRow';
import { formatDisplayDate } from '@/lib/dates';
import { formatPhone } from '@/lib/phone';
import type { Booking } from '@/lib/types';
import BookingStatusBadge from './BookingStatusBadge';
import { BOOKING_COLUMNS } from './bookingColumns';

type BookingsTableProps = {
  bookings: Booking[];
  onCancel: (booking: Booking) => void;
};

export default function BookingsTable({
  bookings,
  onCancel,
}: BookingsTableProps) {
  if (bookings.length === 0) {
    return <EmptyState>No bookings</EmptyState>;
  }

  return (
    <Table columns={BOOKING_COLUMNS}>
      {bookings.map((booking) => {
        const cancelled = booking.status === 'cancelled';
        return (
          <TableRow key={booking.id} muted={cancelled}>
            <TableCell label="Guest">
              <span className="font-semibold">{booking.guestName}</span>
            </TableCell>
            <TableCell label="Contact details">
              <span className="flex min-w-0 flex-col items-end text-right break-all lg:items-start lg:text-left lg:break-normal">
                <span>{booking.guestEmail}</span>
                <span className="text-muted">
                  {formatPhone(booking.guestPhone)}
                </span>
              </span>
            </TableCell>
            <TableCell label="Check-in">
              {formatDisplayDate(booking.checkIn)}
            </TableCell>
            <TableCell label="Check-out">
              {formatDisplayDate(booking.checkOut)}
            </TableCell>
            <TableCell label="Booking no.">
              <span className="font-semibold">{booking.bookingNumber}</span>
            </TableCell>
            <TableCell label="Status">
              <BookingStatusBadge status={booking.status} />
            </TableCell>
            <TableCell label="Action">
              {cancelled ? (
                <span className="text-muted">—</span>
              ) : (
                <Button
                  variant="danger-text"
                  aria-label={`Cancel booking ${booking.bookingNumber}`}
                  onClick={() => onCancel(booking)}
                >
                  Cancel booking
                </Button>
              )}
            </TableCell>
          </TableRow>
        );
      })}
    </Table>
  );
}
