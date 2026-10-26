import type { ReactNode } from 'react';

type TableRowProps = {
  muted?: boolean;
  children: ReactNode;
};

export default function TableRow({ muted = false, children }: TableRowProps) {
  return (
    <tr
      className={`block rounded-xl border border-border p-4 lg:table-row lg:rounded-none lg:border-0 lg:border-t lg:p-0 ${muted ? 'bg-surface-subtle' : 'bg-surface'}`}
    >
      {children}
    </tr>
  );
}
