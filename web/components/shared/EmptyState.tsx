import type { ReactNode } from 'react';
import Card from './Card';

type EmptyStateProps = {
  children: ReactNode;
};

export default function EmptyState({ children }: EmptyStateProps) {
  return (
    <Card>
      <p className="text-center text-sm text-muted">{children}</p>
    </Card>
  );
}
