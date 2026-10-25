import BookingSection from '@/components/booking/BookingSection';
import Page from '@/components/shared/Page';
import PageHeading from '@/components/shared/PageHeading';
import SiteHeader from '@/components/shared/SiteHeader';
import TextLink from '@/components/shared/TextLink';

export default function Home() {
  return (
    <>
      <SiteHeader
        actions={<TextLink href="/staff/login">Staff log in</TextLink>}
      />
      <Page>
        <PageHeading>Book the room</PageHeading>
        <BookingSection />
      </Page>
    </>
  );
}
