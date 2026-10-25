import type { ReactNode } from 'react';
import Spinner from './Spinner';

type LoadingMessageProps = {
  children: ReactNode;
};

export default function LoadingMessage({ children }: LoadingMessageProps) {
  return (
    <p
      role="status"
      className="flex items-center justify-center gap-2 py-16 text-sm text-muted"
    >
      <Spinner />
      {children}
    </p>
  );
}
