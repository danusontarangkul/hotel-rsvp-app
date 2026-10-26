import type { ReactNode } from 'react';

type TableCellProps = {
  label: string;
  children: ReactNode;
};

export default function TableCell({ label, children }: TableCellProps) {
  return (
    <td
      data-label={label}
      className="flex items-start justify-between gap-4 py-1.5 before:shrink-0 before:text-muted before:content-[attr(data-label)] lg:table-cell lg:px-4 lg:py-4 lg:align-middle lg:before:content-none"
    >
      {children}
    </td>
  );
}
