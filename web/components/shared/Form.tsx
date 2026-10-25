import type { ReactNode, SubmitEventHandler } from 'react';
import ErrorMessage from './ErrorMessage';

type FormProps = {
  onSubmit: SubmitEventHandler<HTMLFormElement>;
  actions: ReactNode;
  errors?: string[];
  children: ReactNode;
};

export default function Form({
  onSubmit,
  actions,
  errors = [],
  children,
}: FormProps) {
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-1">
      {children}
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end *:flex-1">
        {actions}
      </div>
      <ErrorMessage messages={errors} />
    </form>
  );
}
