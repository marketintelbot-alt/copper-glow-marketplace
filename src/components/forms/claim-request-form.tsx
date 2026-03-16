"use client";

import { useActionState } from "react";
import { submitClaimRequestAction, type ActionState } from "@/actions";
import { ActionMessage, FieldLabel, TextArea, TextInput } from "@/components/forms/shared";
import { FormSubmitButton } from "@/components/ui/form-submit-button";

type Props = {
  providerId?: string;
  businessName?: string;
};

export function ClaimRequestForm({ providerId, businessName }: Props) {
  const [state, formAction] = useActionState<ActionState, FormData>(submitClaimRequestAction, { status: "idle" });

  return (
    <form action={formAction} className="space-y-4 rounded-[30px] border border-white/60 bg-white/90 p-6 shadow-[0_24px_54px_rgba(42,29,24,0.08)]">
      {providerId ? <input type="hidden" name="providerId" value={providerId} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>Business name</FieldLabel>
          <TextInput name="businessName" defaultValue={businessName} placeholder="Your business name" />
        </div>
        <div>
          <FieldLabel>Your name</FieldLabel>
          <TextInput name="claimantName" placeholder="Owner or manager name" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>Email</FieldLabel>
          <TextInput name="claimantEmail" placeholder="you@business.com" />
        </div>
        <div>
          <FieldLabel>Instagram</FieldLabel>
          <TextInput name="instagramHandle" placeholder="@yourbrand" />
        </div>
      </div>
      <div>
        <FieldLabel>How should we verify you?</FieldLabel>
        <TextArea
          name="note"
          rows={4}
          placeholder="Tell us how you are connected to this business and what should be updated once the profile is claimed."
        />
      </div>
      <ActionMessage status={state.status} message={state.message} />
      <FormSubmitButton className="w-full" size="lg" pendingLabel="Submitting...">
        Request profile claim
      </FormSubmitButton>
    </form>
  );
}
