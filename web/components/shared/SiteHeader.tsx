import Link from 'next/link';
import type { ReactNode } from 'react';

type SiteHeaderProps = {
  nav?: ReactNode;
  actions?: ReactNode;
};

export default function SiteHeader({ nav, actions }: SiteHeaderProps) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4">
        <div className="flex items-center gap-4 sm:gap-10">
          <Link
            href="/"
            className="rounded font-heading text-lg whitespace-nowrap text-foreground sm:text-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Hotel RSVP
          </Link>
          {nav && <nav className="flex items-center gap-4">{nav}</nav>}
        </div>
        {actions}
      </div>
    </header>
  );
}
