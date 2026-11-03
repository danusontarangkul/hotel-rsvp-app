'use client';

import NavLink from '@/components/shared/NavLink';
import SiteHeader from '@/components/shared/SiteHeader';
import { useCurrentStaff } from '@/hooks/useCurrentStaff';
import HomeHeaderActions from './HomeHeaderActions';

export default function HomeHeader() {
  const { loading, data: staff, refetch } = useCurrentStaff();
  const isStaff = Boolean(staff);

  return (
    <SiteHeader
      nav={
        isStaff ? <NavLink href="/staff/bookings">Bookings</NavLink> : undefined
      }
      actions={
        <HomeHeaderActions
          loading={loading}
          isStaff={isStaff}
          onLoggedOut={refetch}
        />
      }
    />
  );
}
