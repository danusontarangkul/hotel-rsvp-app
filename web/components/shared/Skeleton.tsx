type SkeletonProps = {
  width?: 'short' | 'medium' | 'long';
};

const WIDTHS: Record<NonNullable<SkeletonProps['width']>, string> = {
  short: 'w-12',
  medium: 'w-20',
  long: 'w-32',
};

export default function Skeleton({ width = 'medium' }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={`block h-4 max-w-full rounded bg-border motion-safe:animate-pulse ${WIDTHS[width]}`}
    />
  );
}
