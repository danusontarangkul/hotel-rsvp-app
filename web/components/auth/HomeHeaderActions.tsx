import TextLink from '@/components/shared/TextLink';
import HomeHeaderActionsSkeleton from './HomeHeaderActionsSkeleton';
import LogoutButton from './LogoutButton';

type HomeHeaderActionsProps = {
  loading: boolean;
  isStaff: boolean;
  onLoggedOut: () => void;
};

export default function HomeHeaderActions({
  loading,
  isStaff,
  onLoggedOut,
}: HomeHeaderActionsProps) {
  if (loading) {
    return <HomeHeaderActionsSkeleton />;
  }

  if (isStaff) {
    return <LogoutButton onLoggedOut={onLoggedOut} />;
  }

  return <TextLink href="/staff/login">Staff log in</TextLink>;
}
