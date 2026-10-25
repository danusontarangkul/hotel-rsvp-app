import type { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';
import Card from '@/components/shared/Card';
import Page from '@/components/shared/Page';
import PageHeading from '@/components/shared/PageHeading';
import TextLink from '@/components/shared/TextLink';

export const metadata: Metadata = {
  title: 'Staff log in',
};

export default function StaffLoginPage() {
  return (
    <Page width="narrow">
      <Card
        footer={
          <TextLink href="/staff/signup">Create a staff account</TextLink>
        }
      >
        <PageHeading>Staff log in</PageHeading>
        <LoginForm />
      </Card>
    </Page>
  );
}
