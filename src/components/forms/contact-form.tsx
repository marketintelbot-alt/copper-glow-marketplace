"use client";

import { useActionState } from "react";
import { submitContactAction, type ActionState } from "@/actions";
import { ActionMessage, FieldLabel, Select, TextArea, TextInput } from "@/components/forms/shared";
import { FormSubmitButton } from "@/components/ui/form-submit-button";

export function ContactForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(submitContactAction, { status: "idle" });

  return (
    <form action={formAction} className="space-y-4 rounded-[30px] border border-white/60 bg-white/90 p-6 shadow-[0_24px_54px_rgba(42,29,24,0.08)]">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>Name</FieldLabel>
          <TextInput name="name" placeholder="Your name" />
        </div>
        <div>
          <FieldLabel>Email</FieldLabel>
          <TextInput name="email" placeholder="you@example.com" />
        </div>
      </div>
      <div>
        <FieldLabel>Topic</FieldLabel>
        <Select name="reason" defaultValue="general">
          <option value="general">General question</option>
          <option value="booking-support">Booking support</option>
          <option value="provider-application">Provider application</option>
          <option value="campus-partnership">Campus partnership</option>
        </Select>
      </div>
      <div>
        <FieldLabel>Message</FieldLabel>
        <TextArea name="message" rows={6} placeholder="Tell us how we can help." />
      </div>
      <ActionMessage status={state.status} message={state.message} />
      <FormSubmitButton className="w-full" size="lg" pendingLabel="Sending...">
        Send message
      </FormSubmitButton>
    </form>
  );
}
