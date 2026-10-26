'use client';

import TextLink from '@/components/shared/TextLink';
import { useCurrentStaff } from '@/hooks/useCurrentStaff';
import HomeHeaderActionsSkeleton from './HomeHeaderActionsSkeleton';
import LogoutButton from './LogoutButton';

export default function HomeHeaderActions() {
  const { loading, data: staff, refetch } = useCurrentStaff();

  if (loading) {
    return <HomeHeaderActionsSkeleton />;
  }

  if (staff) {
    return <LogoutButton onLoggedOut={refetch} />;
  }

  return <TextLink href="/staff/login">Staff log in</TextLink>;
}
