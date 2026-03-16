"use client";

import { PaymentRequirement, type PaymentOption } from "@prisma/client";
import { useActionState, useMemo, useState } from "react";
import { createBookingAction, type ActionState } from "@/actions";
import { ActionMessage, FieldLabel, Select, TextInput } from "@/components/forms/shared";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

type Service = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  paymentRequirement: PaymentRequirement;
  depositType: "NONE" | "FIXED" | "PERCENTAGE";
  depositValue: number;
};

type Slot = {
  id: string;
  serviceId: string | null;
  startsAt: string;
};

type Props = {
  providerSlug: string;
  services: Service[];
  slots: Slot[];
  initialServiceId?: string;
  initialSlotId?: string;
};

export function BookingCheckoutForm({
  providerSlug,
  services,
  slots,
  initialServiceId,
  initialSlotId,
}: Props) {
  const [state, formAction] = useActionState<ActionState, FormData>(createBookingAction, { status: "idle" });
  const [serviceId, setServiceId] = useState(initialServiceId ?? services[0]?.id ?? "");
  const [slotId, setSlotId] = useState(initialSlotId ?? "");
  const [paymentOption, setPaymentOption] = useState<PaymentOption>("DEPOSIT");

  const selectedService = services.find((service) => service.id === serviceId) ?? services[0];
  const filteredSlots = useMemo(
    () => slots.filter((slot) => !slot.serviceId || slot.serviceId === selectedService?.id),
    [selectedService?.id, slots]
  );

  const chargeNow = useMemo(() => {
    if (!selectedService) {
      return 0;
    }

    if (
      selectedService.paymentRequirement === PaymentRequirement.FULL_PREPAY ||
      paymentOption === "FULL_PREPAY"
    ) {
      return selectedService.priceCents;
    }

    if (selectedService.depositType === "FIXED") {
      return selectedService.depositValue;
    }

    if (selectedService.depositType === "PERCENTAGE") {
      return Math.round(selectedService.priceCents * (selectedService.depositValue / 100));
    }

    return selectedService.priceCents;
  }, [paymentOption, selectedService]);

  const remainingDue = selectedService ? Math.max(selectedService.priceCents - chargeNow, 0) : 0;

  return (
    <form action={formAction} className="space-y-5 rounded-[32px] border border-white/60 bg-white/92 p-6 shadow-[0_24px_54px_rgba(42,29,24,0.08)]">
      <input type="hidden" name="providerSlug" value={providerSlug} />
      <div>
        <FieldLabel>Service</FieldLabel>
        <Select
          name="serviceId"
          value={serviceId}
          onChange={(event) => {
            setServiceId(event.target.value);
            setSlotId("");
          }}
        >
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} • {formatCurrency(service.priceCents)}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <FieldLabel>Appointment time</FieldLabel>
        <Select name="slotId" value={slotId} onChange={(event) => setSlotId(event.target.value)}>
          <option value="">Choose a slot</option>
          {filteredSlots.map((slot) => (
            <option key={slot.id} value={slot.id}>
              {formatDateTime(new Date(slot.startsAt))}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-3">
        <FieldLabel>Payment</FieldLabel>
        <div className="grid gap-3">
          <label
            className={cn(
              "rounded-[22px] border px-4 py-4 text-sm transition",
              paymentOption === "DEPOSIT"
                ? "border-[color:var(--color-accent-strong)] bg-[rgba(194,140,120,0.1)]"
                : "border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)]"
            )}
          >
            <input
              type="radio"
              name="paymentOption"
              value="DEPOSIT"
              className="sr-only"
              checked={paymentOption === "DEPOSIT"}
              onChange={() => setPaymentOption("DEPOSIT")}
              disabled={selectedService?.paymentRequirement === PaymentRequirement.FULL_PREPAY}
            />
            <span className="block font-medium text-[color:var(--color-ink)]">Pay deposit now</span>
            <span className="mt-1 block text-[color:var(--color-ink-muted)]">
              Available when the service supports a fixed or percentage deposit.
            </span>
          </label>
          <label
            className={cn(
              "rounded-[22px] border px-4 py-4 text-sm transition",
              paymentOption === "FULL_PREPAY"
                ? "border-[color:var(--color-accent-strong)] bg-[rgba(194,140,120,0.1)]"
                : "border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)]"
            )}
          >
            <input
              type="radio"
              name="paymentOption"
              value="FULL_PREPAY"
              className="sr-only"
              checked={paymentOption === "FULL_PREPAY"}
              onChange={() => setPaymentOption("FULL_PREPAY")}
            />
            <span className="block font-medium text-[color:var(--color-ink)]">Pay in full now</span>
            <span className="mt-1 block text-[color:var(--color-ink-muted)]">
              Holds the full amount in the platform until the service confirmation window closes.
            </span>
          </label>
        </div>
      </div>
      <div className="grid gap-4 rounded-[24px] bg-[color:var(--color-surface-soft)] p-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-[color:var(--color-ink-muted)]">Charged today</span>
          <span className="font-semibold text-[color:var(--color-ink)]">{formatCurrency(chargeNow)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[color:var(--color-ink-muted)]">Remaining at appointment</span>
          <span className="font-semibold text-[color:var(--color-ink)]">{formatCurrency(remainingDue)}</span>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>Mock card last 4</FieldLabel>
          <TextInput name="cardLast4" placeholder="4242" maxLength={4} />
        </div>
        <div>
          <FieldLabel>Booking notes</FieldLabel>
          <TextInput name="notes" placeholder="Anything the provider should know?" />
        </div>
      </div>
      <ActionMessage status={state.status} message={state.message} />
      <FormSubmitButton className="w-full" size="lg" pendingLabel="Securing booking...">
        Confirm mocked checkout
      </FormSubmitButton>
    </form>
  );
}
