import { render, screen } from '@testing-library/react';
import SectionHeading from './SectionHeading';

describe('SectionHeading', () => {
  it('renders a level two heading by default', () => {
    render(<SectionHeading>Your stay</SectionHeading>);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Your stay' }),
    ).toBeInTheDocument();
  });

  it('renders a level three heading when asked', () => {
    render(
      <SectionHeading level={3} variant="label">
        Your details
      </SectionHeading>,
    );

    expect(
      screen.getByRole('heading', { level: 3, name: 'Your details' }),
    ).toBeInTheDocument();
  });
});
