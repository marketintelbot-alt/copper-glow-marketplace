"use client";

import { PaymentRequirement, type PaymentOption } from "@prisma/client";
import { useActionState, useMemo, useState } from "react";
import { createBookingAction, type ActionState } from "@/actions";
import { ActionMessage, FieldLabel, Select, TextInput } from "@/components/forms/shared";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { formatCurrency, formatDateLabel, formatTimeOnly } from "@/lib/format";
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
  endsAt: string;
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
  const slotDays = useMemo(() => {
    const grouped = new Map<
      string,
      {
        key: string;
        date: Date;
        slots: Slot[];
      }
    >();

    filteredSlots.forEach((slot) => {
      const date = new Date(slot.startsAt);
      const key = slot.startsAt.slice(0, 10);
      const existing = grouped.get(key);

      if (existing) {
        existing.slots.push(slot);
        return;
      }

      grouped.set(key, {
        key,
        date,
        slots: [slot],
      });
    });

    return Array.from(grouped.values());
  }, [filteredSlots]);
  const [preferredDateKey, setPreferredDateKey] = useState(() => {
    const initialSlot = slots.find((slot) => slot.id === initialSlotId);
    return initialSlot?.startsAt.slice(0, 10) ?? "";
  });
  const dateKey = useMemo(() => {
    if (!slotDays.length) {
      return "";
    }

    const selectedSlot = filteredSlots.find((slot) => slot.id === slotId);
    if (selectedSlot) {
      return selectedSlot.startsAt.slice(0, 10);
    }

    if (preferredDateKey && slotDays.some((day) => day.key === preferredDateKey)) {
      return preferredDateKey;
    }

    return slotDays[0].key;
  }, [filteredSlots, preferredDateKey, slotDays, slotId]);
  const effectivePaymentOption =
    selectedService?.paymentRequirement === PaymentRequirement.FULL_PREPAY
      ? "FULL_PREPAY"
      : paymentOption;
  const visibleSlots = useMemo(
    () => filteredSlots.filter((slot) => slot.startsAt.slice(0, 10) === dateKey),
    [dateKey, filteredSlots]
  );
  const selectedDay = slotDays.find((day) => day.key === dateKey) ?? null;

  const chargeNow = useMemo(() => {
    if (!selectedService) {
      return 0;
    }

    if (
      selectedService.paymentRequirement === PaymentRequirement.FULL_PREPAY ||
      effectivePaymentOption === "FULL_PREPAY"
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
  }, [effectivePaymentOption, selectedService]);

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
        <div className="flex items-center justify-between">
          <FieldLabel>Choose date</FieldLabel>
          <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--color-ink-muted)]">
            {slotDays.length ? `${slotDays.length} open day${slotDays.length === 1 ? "" : "s"}` : "No openings"}
          </span>
        </div>
        {slotDays.length ? (
          <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {slotDays.map((day) => {
              const isSelected = day.key === dateKey;
              const isToday = day.date.toDateString() === new Date().toDateString();

              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => {
                    setPreferredDateKey(day.key);
                    setSlotId("");
                  }}
                  className={cn(
                    "min-w-[118px] rounded-[24px] border px-4 py-4 text-left transition",
                    isSelected
                      ? "border-[color:var(--color-accent-strong)] bg-[rgba(194,140,120,0.12)] shadow-[0_16px_30px_rgba(171,83,109,0.12)]"
                      : "border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)] hover:border-[rgba(171,83,109,0.28)]"
                  )}
                >
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-ink-muted)]">
                    {isToday ? "Today" : day.date.toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                  <span className="mt-2 block font-display text-2xl tracking-[-0.05em] text-[color:var(--color-ink)]">
                    {day.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <span className="mt-1 block text-xs text-[color:var(--color-ink-muted)]">
                    {day.slots.length} time{day.slots.length === 1 ? "" : "s"}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)] px-4 py-5 text-sm leading-7 text-[color:var(--color-ink-muted)]">
            No open times are listed for this service yet. Try another service or check back after the
            provider updates availability.
          </div>
        )}
      </div>
      <div>
        <div className="flex items-center justify-between">
          <FieldLabel>Choose time</FieldLabel>
          <span className="text-sm text-[color:var(--color-ink-muted)]">
            {selectedDay ? formatDateLabel(selectedDay.date) : "Select a day first"}
          </span>
        </div>
        <input type="hidden" name="slotId" value={slotId} />
        {visibleSlots.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {visibleSlots.map((slot) => {
              const startsAt = new Date(slot.startsAt);
              const endsAt = new Date(slot.endsAt);
              const isSelected = slot.id === slotId;
              const durationMinutes = Math.max(
                Math.round((endsAt.getTime() - startsAt.getTime()) / 60000),
                0
              );

              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSlotId(slot.id)}
                  className={cn(
                    "rounded-[24px] border px-4 py-4 text-left transition",
                    isSelected
                      ? "border-[color:var(--color-accent-strong)] bg-[linear-gradient(145deg,rgba(255,244,247,0.96),rgba(244,225,232,0.96))] shadow-[0_18px_34px_rgba(171,83,109,0.12)]"
                      : "border-[color:var(--color-border)] bg-white/88 hover:border-[rgba(171,83,109,0.24)] hover:bg-[rgba(255,248,250,0.94)]"
                  )}
                >
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-ink-muted)]">
                    {startsAt.toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                  <span className="mt-2 block font-display text-3xl tracking-[-0.06em] text-[color:var(--color-ink)]">
                    {formatTimeOnly(startsAt)}
                  </span>
                  <span className="mt-1 block text-sm text-[color:var(--color-ink-muted)]">
                    {durationMinutes} min appointment window
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)] px-4 py-5 text-sm leading-7 text-[color:var(--color-ink-muted)]">
            Pick a different day to see live appointment times.
          </div>
        )}
        {state.fieldErrors?.slotId ? (
          <p className="mt-3 text-sm text-[#8c3b3b]">{state.fieldErrors.slotId}</p>
        ) : null}
      </div>
      <div className="space-y-3">
        <FieldLabel>Payment</FieldLabel>
        <div className="grid gap-3">
          <label
            className={cn(
              "rounded-[22px] border px-4 py-4 text-sm transition",
              effectivePaymentOption === "DEPOSIT"
                ? "border-[color:var(--color-accent-strong)] bg-[rgba(194,140,120,0.1)]"
                : "border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)]"
            )}
          >
            <input
              type="radio"
              name="paymentOption"
              value="DEPOSIT"
              className="sr-only"
              checked={effectivePaymentOption === "DEPOSIT"}
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
              effectivePaymentOption === "FULL_PREPAY"
                ? "border-[color:var(--color-accent-strong)] bg-[rgba(194,140,120,0.1)]"
                : "border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)]"
            )}
          >
            <input
              type="radio"
              name="paymentOption"
              value="FULL_PREPAY"
              className="sr-only"
              checked={effectivePaymentOption === "FULL_PREPAY"}
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
