import HomeHeader from '@/components/auth/HomeHeader';
import BookingSection from '@/components/booking/BookingSection';
import ChatWidget from '@/components/chat/ChatWidget';
import Page from '@/components/shared/Page';
import PageHeading from '@/components/shared/PageHeading';

export default function Home() {
  return (
    <>
      <HomeHeader />
      <Page>
        <PageHeading>Book the room</PageHeading>
        <BookingSection />
      </Page>
      <ChatWidget />
    </>
  );
}
