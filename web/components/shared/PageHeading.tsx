import type { ReactNode } from 'react';

type PageHeadingProps = {
  children: ReactNode;
};

export default function PageHeading({ children }: PageHeadingProps) {
  return (
    <h1 className="mb-5 font-heading text-3xl text-foreground">{children}</h1>
  );
}
