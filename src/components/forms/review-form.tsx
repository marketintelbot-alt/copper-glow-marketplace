"use client";

import { useActionState } from "react";
import { submitReviewAction, type ActionState } from "@/actions";
import { ActionMessage, FieldLabel, Select, TextArea, TextInput } from "@/components/forms/shared";
import { FormSubmitButton } from "@/components/ui/form-submit-button";

type Props = {
  bookingId: string;
};

export function ReviewForm({ bookingId }: Props) {
  const [state, formAction] = useActionState<ActionState, FormData>(submitReviewAction, { status: "idle" });

  return (
    <form action={formAction} className="space-y-4 rounded-[24px] border border-[color:var(--color-border)] bg-white/80 p-4">
      <input type="hidden" name="bookingId" value={bookingId} />
      <div className="grid gap-4 sm:grid-cols-[140px,1fr]">
        <div>
          <FieldLabel>Rating</FieldLabel>
          <Select name="rating" defaultValue="5">
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
          </Select>
        </div>
        <div>
          <FieldLabel>Headline</FieldLabel>
          <TextInput name="title" placeholder="Short summary of the visit" />
        </div>
      </div>
      <div>
        <FieldLabel>Review</FieldLabel>
        <TextArea name="body" rows={4} placeholder="What stood out about the service, timing, atmosphere, or results?" />
      </div>
      <label className="flex items-center gap-3 text-sm text-[color:var(--color-ink)]">
        <input type="checkbox" name="wouldRebook" defaultChecked className="h-4 w-4 accent-[color:var(--color-accent-strong)]" />
        I would book this provider again
      </label>
      <ActionMessage status={state.status} message={state.message} />
      <FormSubmitButton pendingLabel="Publishing review...">Submit verified review</FormSubmitButton>
    </form>
  );
}
