import type { ReactNode } from 'react';

type TableProps = {
  columns: string[];
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
