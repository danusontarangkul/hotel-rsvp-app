import { render, screen } from '@testing-library/react';
import Table from './Table';
import TableCell from './TableCell';
import TableRow from './TableRow';

function renderTable() {
  return render(
    <Table columns={['Guest', 'Status']}>
      <TableRow>
        <TableCell label="Guest">Elena Rossi</TableCell>
        <TableCell label="Status">Active</TableCell>
      </TableRow>
      <TableRow muted>
        <TableCell label="Guest">Maya Chen</TableCell>
        <TableCell label="Status">Cancelled</TableCell>
      </TableRow>
    </Table>,
  );
}

describe('Table', () => {
  it('shows a column header for each column', () => {
    renderTable();

    expect(
      screen.getByRole('columnheader', { name: 'Guest' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Status' }),
    ).toBeInTheDocument();
  });

  it('shows each row with its cells in order', () => {
    renderTable();

    const [, first, second] = screen.getAllByRole('row');
    expect(first).toHaveTextContent('Elena RossiActive');
    expect(second).toHaveTextContent('Maya ChenCancelled');
  });

  it('gives each cell its column name for the small screen layout', () => {
    renderTable();

    expect(screen.getByRole('cell', { name: 'Elena Rossi' })).toHaveAttribute(
      'data-label',
      'Guest',
    );
  });
});
