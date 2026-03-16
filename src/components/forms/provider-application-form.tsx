"use client";

import { useActionState } from "react";
import { submitProviderApplicationAction, type ActionState } from "@/actions";
import { ActionMessage, FieldLabel, Select, TextArea, TextInput } from "@/components/forms/shared";
import { FormSubmitButton } from "@/components/ui/form-submit-button";

export function ProviderApplicationForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(
    submitProviderApplicationAction,
    { status: "idle" }
  );

  return (
    <form action={formAction} className="space-y-4 rounded-[30px] border border-white/60 bg-white/90 p-6 shadow-[0_24px_54px_rgba(42,29,24,0.08)]">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>Business or brand name</FieldLabel>
          <TextInput name="businessName" placeholder="Copper Bloom Nails" />
        </div>
        <div>
          <FieldLabel>Provider type</FieldLabel>
          <Select name="providerType" defaultValue="VERIFIED_BUSINESS">
            <option value="VERIFIED_BUSINESS">Verified Business</option>
            <option value="VERIFIED_INDEPENDENT">Verified Independent</option>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>Email</FieldLabel>
          <TextInput name="email" placeholder="hello@yourstudio.com" />
        </div>
        <div>
          <FieldLabel>Phone</FieldLabel>
          <TextInput name="phone" placeholder="(520) 555-0123" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>Approximate area</FieldLabel>
          <TextInput name="cityArea" placeholder="Main Gate, Sam Hughes, Foothills..." />
        </div>
        <div>
          <FieldLabel>Categories</FieldLabel>
          <TextInput name="categoriesCsv" placeholder="nails, brows, waxing" />
        </div>
      </div>
      <label className="flex items-center gap-3 rounded-[20px] bg-[color:var(--color-surface-soft)] px-4 py-3 text-sm text-[color:var(--color-ink)]">
        <input type="checkbox" name="mobileService" className="h-4 w-4 accent-[color:var(--color-accent-strong)]" />
        Mobile provider or on-site service
      </label>
      <div>
        <FieldLabel>Portfolio summary</FieldLabel>
        <TextArea
          name="portfolioSummary"
          rows={4}
          placeholder="Tell us what your best work looks like, what clients usually book, and what makes your experience trustworthy."
        />
      </div>
      <div>
        <FieldLabel>Launch notes</FieldLabel>
        <TextArea
          name="note"
          rows={4}
          placeholder="Anything the approval team should know about your schedule, setup, or verification status?"
        />
      </div>
      <ActionMessage status={state.status} message={state.message} />
      <FormSubmitButton className="w-full" size="lg" pendingLabel="Submitting...">
        Submit application
      </FormSubmitButton>
    </form>
  );
}
