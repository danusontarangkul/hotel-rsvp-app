import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import ErrorMessage from './ErrorMessage';

type TextInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'id' | 'className'
> & {
  label: string;
  errors?: string[];
  trailing?: ReactNode;
};

export default function TextInput({
  label,
  errors = [],
  trailing,
  required,
  ...props
}: TextInputProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hasError = errors.length > 0;
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className={`text-sm font-semibold text-foreground ${required ? "after:content-['_*']" : ''}`}
      >
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          id={id}
          required={required}
          aria-invalid={hasError}
          aria-describedby={errorId}
          className={`w-full rounded-md border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${trailing ? 'pr-10' : ''} ${hasError ? 'border-error' : 'border-border'}`}
          {...props}
        />
        {trailing && <div className="absolute right-2 flex">{trailing}</div>}
      </div>
      <ErrorMessage id={errorId} messages={errors} />
    </div>
  );
}
