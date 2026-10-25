import type { ReactNode, SubmitEventHandler } from 'react';
import Actions from './Actions';
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
      <Actions>{actions}</Actions>
      <ErrorMessage messages={errors} />
    </form>
  );
}
