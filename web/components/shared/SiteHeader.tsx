import Link from 'next/link';
import TextLink from './TextLink';

export default function SiteHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link
          href="/"
          className="rounded font-heading text-xl text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Hotel RSVP
        </Link>
        <TextLink href="/staff/login">Staff log in</TextLink>
      </div>
    </header>
  );
}
