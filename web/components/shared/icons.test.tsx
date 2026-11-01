import { render } from '@testing-library/react';
import {
  ArrowRightIcon,
  ChatIcon,
  CloseIcon,
  EyeIcon,
  EyeOffIcon,
  LogOutIcon,
  MinimizeIcon,
  SendIcon,
} from './icons';

describe('icons', () => {
  it.each([
    ['ArrowRightIcon', ArrowRightIcon],
    ['CloseIcon', CloseIcon],
    ['LogOutIcon', LogOutIcon],
    ['EyeIcon', EyeIcon],
    ['EyeOffIcon', EyeOffIcon],
    ['ChatIcon', ChatIcon],
    ['MinimizeIcon', MinimizeIcon],
    ['SendIcon', SendIcon],
  ])('%s is hidden from screen readers', (_, IconComponent) => {
    const { container } = render(<IconComponent />);

    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });
});
