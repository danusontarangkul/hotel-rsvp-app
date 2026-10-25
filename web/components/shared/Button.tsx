import type { ButtonHTMLAttributes } from 'react';
import Spinner from './Spinner';

type ButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className'
> & {
  variant?:
    'primary' | 'secondary' | 'danger' | 'danger-text' | 'ghost' | 'icon';
  loading?: boolean;
};

const VARIANTS: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'rounded-md bg-primary px-4 py-3 text-sm font-semibold text-on-primary',
  secondary: 'rounded-md px-4 py-3 text-sm font-semibold text-foreground',
  danger: 'rounded-md bg-error px-4 py-3 text-sm font-semibold text-on-primary',
  'danger-text': 'rounded text-sm font-medium text-error',
  ghost: 'rounded px-2 py-1 text-sm font-medium text-foreground',
  icon: 'rounded p-1 text-muted',
};

export default function Button({
  variant = 'primary',
  loading = false,
  disabled,
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`inline-grid cursor-pointer transition-opacity enabled:hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]}`}
    >
      <span
        className={`col-start-1 row-start-1 inline-flex items-center justify-center gap-2 whitespace-nowrap ${loading ? 'opacity-0' : ''}`}
      >
        {children}
      </span>
      {loading && (
        <span className="col-start-1 row-start-1 flex items-center justify-center">
          <Spinner />
        </span>
      )}
    </button>
  );
}
