import type { ReactNode } from 'react';

type TableProps = {
  columns: string[];
  children: ReactNode;
};

type TableRowProps = {
  muted?: boolean;
  children: ReactNode;
};

type TableCellProps = {
  label: string;
  children: ReactNode;
};

export default function Table({ columns, children }: TableProps) {
  return (
    <div className="lg:overflow-hidden lg:rounded-xl lg:border lg:border-border lg:bg-surface">
      <table className="block w-full text-sm text-foreground lg:table">
        <thead className="hidden bg-border text-left text-xs text-muted lg:table-header-group">
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col" className="px-4 py-3 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="flex flex-col gap-3 lg:table-row-group">
          {children}
        </tbody>
      </table>
    </div>
  );
}

export function TableRow({ muted = false, children }: TableRowProps) {
  return (
    <tr
      className={`block rounded-xl border border-border p-4 lg:table-row lg:rounded-none lg:border-0 lg:border-t lg:p-0 ${muted ? 'bg-surface-subtle' : 'bg-surface'}`}
    >
      {children}
    </tr>
  );
}

export function TableCell({ label, children }: TableCellProps) {
  return (
    <td
      data-label={label}
      className="flex items-start justify-between gap-4 py-1.5 before:shrink-0 before:text-muted before:content-[attr(data-label)] lg:table-cell lg:px-4 lg:py-4 lg:align-middle lg:before:content-none"
    >
      {children}
    </td>
  );
}
