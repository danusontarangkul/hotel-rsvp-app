import Button from '@/components/shared/Button';
import EmptyState from '@/components/shared/EmptyState';
import Table, { TableCell, TableRow } from '@/components/shared/Table';
import TableSkeleton from '@/components/shared/TableSkeleton';
import { formatDisplayDate } from '@/lib/dates';
import { formatPhone } from '@/lib/phone';
import type { Booking } from '@/lib/types';
import BookingStatusBadge from './BookingStatusBadge';

type BookingsTableProps = {
  bookings: Booking[];
  onCancel: (booking: Booking) => void;
};

const COLUMNS = [
  'Guest',
  'Contact details',
  'Check-in',
  'Check-out',
  'Booking no.',
  'Status',
  'Action',
];

export function BookingsTableSkeleton() {
  return (
    <TableSkeleton
      label="Loading bookings"
      columns={COLUMNS}
      twoLineColumns={['Contact details']}
    />
  );
}

export default function BookingsTable({
  bookings,
  onCancel,
}: BookingsTableProps) {
  if (bookings.length === 0) {
    return <EmptyState>No bookings</EmptyState>;
  }

  return (
    <Table columns={COLUMNS}>
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
