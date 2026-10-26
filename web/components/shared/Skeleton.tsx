type SkeletonProps = {
  shape?: 'line' | 'day';
  width?: 'short' | 'medium' | 'long';
};

const WIDTHS: Record<NonNullable<SkeletonProps['width']>, string> = {
  short: 'w-12',
  medium: 'w-20',
  long: 'w-32',
};

export default function Skeleton({
  shape = 'line',
  width = 'medium',
}: SkeletonProps) {
  const size =
    shape === 'day'
      ? 'size-9 rounded-md sm:size-10'
      : `h-4 max-w-full rounded ${WIDTHS[width]}`;
  return (
    <span
      aria-hidden="true"
      className={`block bg-border motion-safe:animate-pulse ${size}`}
    />
  );
}
