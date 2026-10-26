import Skeleton from '@/components/shared/Skeleton';
import CalendarLegend from './CalendarLegend';
import { MONTHS_SHOWN, WEEKDAY_LABELS, WEEKS_SHOWN } from './calendarLayout';

export default function AvailabilityCalendarSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading available dates">
      <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
        {Array.from({ length: MONTHS_SHOWN }, (_, month) => (
          <div key={month} className="flex flex-col gap-3">
            <div className="flex h-8 items-center">
              <Skeleton width="long" />
            </div>
            <div className="grid grid-cols-7 gap-1 p-1">
              {WEEKDAY_LABELS.map((weekday) => (
                <span
                  key={weekday}
                  aria-hidden="true"
                  className="text-center text-xs text-muted"
                >
                  {weekday}
                </span>
              ))}
              {Array.from(
                { length: WEEKS_SHOWN * WEEKDAY_LABELS.length },
                (_, day) => (
                  <Skeleton key={day} shape="day" />
                ),
              )}
            </div>
          </div>
        ))}
      </div>
      <CalendarLegend />
    </div>
  );
}
