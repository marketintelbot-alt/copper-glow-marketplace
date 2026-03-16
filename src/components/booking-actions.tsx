"use client";

import { useState, useTransition } from "react";
import { cancelBookingAction, rescheduleBookingAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";

type RescheduleOption = {
  id: string;
  startsAt: string;
};

type Props = {
  bookingId: string;
  rescheduleOptions: RescheduleOption[];
};

export function BookingActions({ bookingId, rescheduleOptions }: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState(rescheduleOptions[0]?.id ?? "");
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      {rescheduleOptions.length ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={selectedSlot}
            onChange={(event) => setSelectedSlot(event.target.value)}
            className="h-11 flex-1 rounded-full border border-[color:var(--color-border)] bg-white px-4 text-sm text-[color:var(--color-ink)] outline-none"
          >
            {rescheduleOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {formatDateTime(new Date(option.startsAt))}
              </option>
            ))}
          </select>
          <Button
            tone="secondary"
            onClick={() =>
              startTransition(async () => {
                const result = await rescheduleBookingAction(bookingId, selectedSlot);
                setMessage(result.message ?? null);
              })
            }
            disabled={pending || !selectedSlot}
          >
            Reschedule
          </Button>
        </div>
      ) : null}
      <Button
        tone="ghost"
        className="justify-start px-0 text-[color:var(--color-accent-strong)]"
        onClick={() =>
          startTransition(async () => {
            const result = await cancelBookingAction(bookingId);
            setMessage(result.message ?? null);
          })
        }
        disabled={pending}
      >
        Cancel booking
      </Button>
      {message ? (
        <p className="rounded-[18px] bg-[color:var(--color-surface-soft)] px-4 py-3 text-sm text-[color:var(--color-ink-muted)]">
          {message}
        </p>
      ) : null}
    </div>
  );
}
