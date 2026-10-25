import Link from 'next/link';
import type { ReactNode } from 'react';

type TextLinkProps = {
  href: string;
  children: ReactNode;
};

export default function TextLink({ href, children }: TextLinkProps) {
  return (
    <Link
      href={href}
      className="rounded text-sm text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {children}
    </Link>
  );
}
