export type BookingStatus = "pending" | "paid" | "used" | "expired" | "cancelled";

export type Booking = {
  _id: string;
  email: string;
  phone?: string | null;
  licensePlate: string;
  vehicleType: "car";
  expectedArrivalTime: string;
  expectedExitTime: string;
  durationHours: number;
  amount: number;
  status: BookingStatus;
  paymentId?: string | null;
  userId?: string | null;
  sessionId?: string | null;
  usedAt?: string | null;
  qrToken?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BookingPayment = {
  orderCode: number;
  amount: number;
  checkoutUrl: string;
  paymentLinkId: string;
  qrCode?: string;
  accountNumber?: string;
  accountName?: string;
  bin?: string;
};

export type CreateBookingPayload = {
  email: string;
  phone: string;
  licensePlate: string;
  expectedArrivalTime: string;
  expectedExitTime: string;
};

export type CreateBookingResult = {
  booking: Booking;
  payment: BookingPayment;
};

export type MyBookingsResult = {
  bookings: Booking[];
};

export type BookingLookupResult = {
  bookings: Booking[];
};

export type StoredGuestBooking = Booking & {
  payment?: BookingPayment;
  savedAt: string;
};

