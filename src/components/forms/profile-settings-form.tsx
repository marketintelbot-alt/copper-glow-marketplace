"use client";

import { useActionState } from "react";
import { type ActionState, updateProfileSettingsAction } from "@/actions";
import { ActionMessage, FieldLabel, TextArea, TextInput } from "@/components/forms/shared";
import { FormSubmitButton } from "@/components/ui/form-submit-button";

type Props = {
  firstName: string;
  lastName: string;
  phone: string;
  bio?: string | null;
};

export function ProfileSettingsForm({ firstName, lastName, phone, bio }: Props) {
  const [state, formAction] = useActionState<ActionState, FormData>(updateProfileSettingsAction, { status: "idle" });

  return (
    <form action={formAction} className="space-y-4 rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-[0_20px_44px_rgba(42,29,24,0.08)]">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>First name</FieldLabel>
          <TextInput name="firstName" defaultValue={firstName} />
        </div>
        <div>
          <FieldLabel>Last name</FieldLabel>
          <TextInput name="lastName" defaultValue={lastName} />
        </div>
      </div>
      <div>
        <FieldLabel>Phone</FieldLabel>
        <TextInput name="phone" defaultValue={phone} />
      </div>
      <div>
        <FieldLabel>Bio</FieldLabel>
        <TextArea name="bio" rows={4} defaultValue={bio ?? ""} />
      </div>
      <ActionMessage status={state.status} message={state.message} />
      <FormSubmitButton pendingLabel="Saving settings...">Save settings</FormSubmitButton>
    </form>
  );
}
