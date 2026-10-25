import type { ReactNode } from 'react';

type ActionsProps = {
  children: ReactNode;
};

export default function Actions({ children }: ActionsProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end *:flex-1">
      {children}
    </div>
  );
}
