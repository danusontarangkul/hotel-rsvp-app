'use client';

import { useRouter } from 'next/navigation';
import Button from '@/components/shared/Button';
import { LogOutIcon } from '@/components/shared/icons';
import { useLogout } from '@/hooks/useLogout';

type LogoutButtonProps = {
  onLoggedOut?: () => void;
};

export default function LogoutButton({ onLoggedOut }: LogoutButtonProps) {
  const router = useRouter();
  const { run, loading } = useLogout();

  async function handleClick() {
    await run();
    onLoggedOut?.();
    router.push('/');
  }

  return (
    <Button variant="ghost" loading={loading} onClick={handleClick}>
      <LogOutIcon />
      Log out
    </Button>
  );
}
