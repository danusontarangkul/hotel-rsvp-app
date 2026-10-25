import { render } from '@testing-library/react';
import Spinner from './Spinner';

describe('Spinner', () => {
  it('is hidden from screen readers', () => {
    const { container } = render(<Spinner />);

    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });
});
