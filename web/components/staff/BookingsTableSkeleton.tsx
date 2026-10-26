import TableSkeleton from '@/components/shared/TableSkeleton';
import { BOOKING_COLUMNS } from './bookingColumns';

export default function BookingsTableSkeleton() {
  return (
    <TableSkeleton
      label="Loading bookings"
      columns={BOOKING_COLUMNS}
      twoLineColumns={['Contact details']}
    />
  );
}
