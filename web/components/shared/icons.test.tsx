import { render } from '@testing-library/react';
import {
  ArrowRightIcon,
  CloseIcon,
  EyeIcon,
  EyeOffIcon,
  LogOutIcon,
} from './icons';

describe('icons', () => {
  it.each([
    ['ArrowRightIcon', ArrowRightIcon],
    ['CloseIcon', CloseIcon],
    ['LogOutIcon', LogOutIcon],
    ['EyeIcon', EyeIcon],
    ['EyeOffIcon', EyeOffIcon],
  ])('%s is hidden from screen readers', (_, IconComponent) => {
    const { container } = render(<IconComponent />);

    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });
});
