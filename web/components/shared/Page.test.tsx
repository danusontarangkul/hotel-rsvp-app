import { render, screen } from '@testing-library/react';
import Page from './Page';

describe('Page', () => {
  it('renders its content as the main landmark', () => {
    render(<Page>Hello</Page>);

    expect(screen.getByRole('main')).toHaveTextContent('Hello');
  });
});
