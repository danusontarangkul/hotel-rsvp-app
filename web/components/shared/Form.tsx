import type { ReactNode, SubmitEventHandler } from 'react';

type FormProps = {
  onSubmit: SubmitEventHandler<HTMLFormElement>;
  children: ReactNode;
};

export default function Form({ onSubmit, children }: FormProps) {
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-1.5">
      {children}
    </form>
  );
}
