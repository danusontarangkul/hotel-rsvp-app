import { render, screen } from '@testing-library/react';
import PageHeading from './PageHeading';

describe('PageHeading', () => {
  it('renders a level one heading', () => {
    render(<PageHeading>Staff sign up</PageHeading>);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Staff sign up' }),
    ).toBeInTheDocument();
  });
});
