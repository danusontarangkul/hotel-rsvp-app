import type { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  footer?: ReactNode;
};

export default function Card({ children, footer }: CardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6 sm:p-8">
      {children}
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
}
