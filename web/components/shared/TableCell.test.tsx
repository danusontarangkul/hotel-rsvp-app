import { render, screen } from '@testing-library/react';
import TableCell from './TableCell';

describe('TableCell', () => {
  it('shows its content and carries its column name for small screens', () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell label="Guest">Elena Rossi</TableCell>
          </tr>
        </tbody>
      </table>,
    );

    expect(screen.getByRole('cell', { name: 'Elena Rossi' })).toHaveAttribute(
      'data-label',
      'Guest',
    );
  });
});
