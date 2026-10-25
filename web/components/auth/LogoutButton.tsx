'use client';

import { useRouter } from 'next/navigation';
import Button from '@/components/shared/Button';
import { LogOutIcon } from '@/components/shared/icons';
import { useLogout } from '@/hooks/useLogout';

export default function LogoutButton() {
  const router = useRouter();
  const { run, loading } = useLogout();

  async function handleClick() {
    await run();
    router.push('/staff/login');
  }

  return (
    <Button variant="ghost" loading={loading} onClick={handleClick}>
      <LogOutIcon />
      Log out
    </Button>
  );
}
