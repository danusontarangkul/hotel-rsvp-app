import { render, screen } from '@testing-library/react';
import TableRow from './TableRow';

function renderInTable(row: React.ReactNode) {
  return render(
    <table>
      <tbody>{row}</tbody>
    </table>,
  );
}

describe('TableRow', () => {
  it('shows its cells as a row', () => {
    renderInTable(
      <TableRow>
        <td>Elena Rossi</td>
      </TableRow>,
    );

    expect(screen.getByRole('row')).toHaveTextContent('Elena Rossi');
  });

  it('can be shown as muted', () => {
    renderInTable(
      <TableRow muted>
        <td>Maya Chen</td>
      </TableRow>,
    );

    expect(screen.getByRole('row')).toHaveTextContent('Maya Chen');
  });
});
