import type { Metadata } from 'next';
import LogoutButton from '@/components/auth/LogoutButton';
import NavLink from '@/components/shared/NavLink';
import Page from '@/components/shared/Page';
import PageHeading from '@/components/shared/PageHeading';
import SiteHeader from '@/components/shared/SiteHeader';
import BookingsSection from '@/components/staff/BookingsSection';

export const metadata: Metadata = {
  title: 'Bookings',
};

export default function StaffBookingsPage() {
  return (
    <>
      <SiteHeader
        nav={
          <NavLink href="/staff/bookings" active>
            Bookings
          </NavLink>
        }
        actions={<LogoutButton />}
      />
      <Page>
        <PageHeading>Bookings</PageHeading>
        <BookingsSection />
      </Page>
    </>
  );
}
