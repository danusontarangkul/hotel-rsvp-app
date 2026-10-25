import type { Metadata } from 'next';
import SignupForm from '@/components/auth/SignupForm';
import Card from '@/components/shared/Card';
import Page from '@/components/shared/Page';
import PageHeading from '@/components/shared/PageHeading';
import TextLink from '@/components/shared/TextLink';

export const metadata: Metadata = {
  title: 'Staff sign up',
};

export default function StaffSignupPage() {
  return (
    <Page width="narrow">
      <Card footer={<TextLink href="/staff/login">Log in</TextLink>}>
        <PageHeading>Staff sign up</PageHeading>
        <SignupForm />
      </Card>
    </Page>
  );
}
