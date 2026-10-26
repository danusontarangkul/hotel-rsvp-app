import Skeleton from './Skeleton';
import Table from './Table';
import TableCell from './TableCell';
import TableRow from './TableRow';

type TableSkeletonProps = {
  label: string;
  columns: string[];
  rows?: number;
  twoLineColumns?: string[];
};

export default function TableSkeleton({
  label,
  columns,
  rows = 5,
  twoLineColumns = [],
}: TableSkeletonProps) {
  return (
    <div role="status" aria-busy="true" aria-label={label}>
      <Table columns={columns}>
        {Array.from({ length: rows }, (_, row) => (
          <TableRow key={row}>
            {columns.map((column) => (
              <TableCell key={column} label={column}>
                <span className="flex flex-col items-end gap-1.5 lg:items-start">
                  <Skeleton
                    width={twoLineColumns.includes(column) ? 'long' : 'medium'}
                  />
                  {twoLineColumns.includes(column) && (
                    <Skeleton width="medium" />
                  )}
                </span>
              </TableCell>
            ))}
          </TableRow>
        ))}
      </Table>
    </div>
  );
}
