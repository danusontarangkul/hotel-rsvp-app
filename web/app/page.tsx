import BookingSection from '@/components/booking/BookingSection';
import Page from '@/components/shared/Page';
import PageHeading from '@/components/shared/PageHeading';
import SiteHeader from '@/components/shared/SiteHeader';

export default function Home() {
  return (
    <>
      <SiteHeader />
      <Page>
        <PageHeading>Book the room</PageHeading>
        <BookingSection />
      </Page>
    </>
  );
}
