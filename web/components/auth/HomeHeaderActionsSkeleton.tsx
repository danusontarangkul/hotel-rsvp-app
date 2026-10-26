import Skeleton from '@/components/shared/Skeleton';

export default function HomeHeaderActionsSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Checking staff log in">
      <Skeleton width="medium" />
    </div>
  );
}
