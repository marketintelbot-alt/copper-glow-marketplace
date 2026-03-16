type MockPaymentInput = {
  amountCents: number;
  bookingReference: string;
  paymentOption: "DEPOSIT" | "FULL_PREPAY";
  mockCardLast4?: string;
};

type MockNotificationInput = {
  recipient: string;
  type: "booking-confirmed" | "booking-canceled" | "booking-rescheduled" | "contact" | "application";
  summary: string;
};

export async function holdMockFunds(input: MockPaymentInput) {
  return {
    status: "HELD" as const,
    amountCents: input.amountCents,
    brand: "Visa",
    last4: input.mockCardLast4 ?? "4242",
    externalReference: `mock_${input.bookingReference.toLowerCase()}`,
    note:
      input.paymentOption === "DEPOSIT"
        ? "Deposit held in platform escrow until service completion window ends."
        : "Full prepay held in platform escrow until service completion window ends.",
  };
}

export async function sendMockNotification(input: MockNotificationInput) {
  return {
    delivered: true,
    deliveredAt: new Date(),
    channel: input.type === "contact" ? "mock-email" : "mock-email + mock-sms",
    preview: `${input.type}: ${input.summary} -> ${input.recipient}`,
  };
}
