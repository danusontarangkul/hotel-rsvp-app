import type { BookingStatus } from '@/lib/types';

type BookingStatusBadgeProps = {
  status: BookingStatus;
};

const STYLES: Record<
  BookingStatus,
  { label: string; badge: string; dot: string }
> = {
  active: {
    label: 'Active',
    badge: 'bg-accent-soft text-primary',
    dot: 'bg-primary',
  },
  cancelled: {
    label: 'Cancelled',
    badge: 'bg-surface-muted text-muted',
    dot: 'bg-muted',
  },
};

export default function BookingStatusBadge({
  status,
}: BookingStatusBadgeProps) {
  const { label, badge, dot } = STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${badge}`}
    >
      <span className={`size-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
