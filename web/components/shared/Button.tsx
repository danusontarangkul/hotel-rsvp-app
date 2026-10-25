import type { ButtonHTMLAttributes } from 'react';
import Spinner from './Spinner';

type ButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className'
> & {
  variant?: 'primary' | 'icon';
  loading?: boolean;
};

const VARIANTS: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'rounded-md bg-primary px-4 py-3 text-sm font-semibold text-on-primary',
  icon: 'rounded p-1 text-muted hover:text-foreground',
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
      className={`inline-grid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]}`}
    >
      <span
        className={`col-start-1 row-start-1 inline-flex items-center justify-center gap-2 ${loading ? 'opacity-0' : ''}`}
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
