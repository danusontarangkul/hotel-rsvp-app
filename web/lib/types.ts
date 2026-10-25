export type Staff = {
  id: string;
  name: string;
  email: string;
};

export type SignupInput = {
  name: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type Availability = {
  firstBookableDate: string;
  bookedNights: string[];
};

export type GuestDetails = {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
};

export type CreateBookingInput = GuestDetails & {
  checkIn: string;
  checkOut: string;
};

export type BookingConfirmation = {
  bookingNumber: string;
  checkIn: string;
  checkOut: string;
};

export type ApiErrorBody = {
  statusCode: number;
  message: string | string[];
  error?: string;
};
