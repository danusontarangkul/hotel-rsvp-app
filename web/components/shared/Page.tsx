import type { ReactNode } from 'react';

type PageProps = {
  width?: 'narrow' | 'wide';
  children: ReactNode;
};

const WIDTHS: Record<NonNullable<PageProps['width']>, string> = {
  narrow: 'max-w-md',
  wide: 'max-w-6xl',
};

export default function Page({ width = 'wide', children }: PageProps) {
  return (
    <main className={`mx-auto w-full px-4 py-12 ${WIDTHS[width]}`}>
      {children}
    </main>
  );
}
