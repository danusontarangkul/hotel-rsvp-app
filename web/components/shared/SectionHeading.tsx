import type { ReactNode } from 'react';

type SectionHeadingProps = {
  level?: 2 | 3;
  variant?: 'title' | 'label';
  id?: string;
  children: ReactNode;
};

const VARIANTS: Record<NonNullable<SectionHeadingProps['variant']>, string> = {
  title: 'mb-4 font-heading text-2xl text-foreground',
  label: 'mb-3 text-sm font-semibold text-foreground',
};

export default function SectionHeading({
  level = 2,
  variant = 'title',
  id,
  children,
}: SectionHeadingProps) {
  const Tag = level === 2 ? 'h2' : 'h3';
  return (
    <Tag id={id} className={VARIANTS[variant]}>
      {children}
    </Tag>
  );
}
