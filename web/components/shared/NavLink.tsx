import Link from 'next/link';
import type { ReactNode } from 'react';

type NavLinkProps = {
  href: string;
  active?: boolean;
  children: ReactNode;
};

export default function NavLink({
  href,
  active = false,
  children,
}: NavLinkProps) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`border-b-2 py-1 text-sm font-medium text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${active ? 'border-primary' : 'border-transparent hover:border-border'}`}
    >
      {children}
    </Link>
  );
}
