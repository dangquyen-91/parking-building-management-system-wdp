export type BookingStatus = "pending" | "paid" | "used" | "expired" | "cancelled";

export type Booking = {
  _id: string;
  phoneNumber: string;
  licensePlate: string;
  vehicleType: "car";
  expectedArrivalTime: string;
  expectedExitTime: string;
  durationHours: number;
  amount: number;
  status: BookingStatus;
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
  phoneNumber: string;
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

