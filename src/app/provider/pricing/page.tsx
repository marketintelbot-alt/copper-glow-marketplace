import { updateProviderPlanFormAction } from "@/actions";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { requireProvider } from "@/lib/auth";
import { getProviderDashboardData } from "@/lib/marketplace";

const plans = [
  {
    value: "BASIC",
    name: "Basic",
    price: "$0 / mo",
    description: "Free launch plan with standard listing, booking access, calendar management, payout tracking UI, and review collection.",
  },
  {
    value: "SPOTLIGHT",
    name: "Spotlight",
    price: "$99 / mo",
    description: "Highlighted card styling, better search placement, richer galleries, seasonal promo eligibility, and basic analytics.",
  },
  {
    value: "PREMIUM",
    name: "Premium",
    price: "$189 / mo",
    description: "Stronger placement, homepage feature eligibility, richer analytics, promo tools, and the strongest profile presentation.",
  },
];

export default async function ProviderPricingPage() {
  const user = await requireProvider();
  const data = await getProviderDashboardData(user.id);

  if (!data) {
    return null;
  }

  return (
    <div className="container-shell section-space">
      <div className="space-y-8">
        <div className="rounded-[36px] border border-white/60 bg-white/90 p-6 shadow-[0_24px_56px_rgba(42,29,24,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--color-ink-muted)]">
            Provider plans
          </p>
          <h1 className="mt-3 font-display text-5xl tracking-[-0.06em] text-[color:var(--color-ink)]">
            Grow visibility without compromising trust.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-[color:var(--color-ink-muted)]">
            Paid tiers influence styling, promo eligibility, and placement opportunity, but ranking still
            respects trust, reliability, review quality, and relevance.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <form
              key={plan.value}
              action={updateProviderPlanFormAction}
              className={`rounded-[32px] border p-6 shadow-[0_18px_40px_rgba(42,29,24,0.06)] ${data.provider.plan === plan.value ? "border-[rgba(168,100,86,0.3)] bg-[rgba(245,231,225,0.88)]" : "border-white/60 bg-white/90"}`}
            >
              <input type="hidden" name="providerId" value={data.provider.id} />
              <input type="hidden" name="plan" value={plan.value} />
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--color-ink-muted)]">
                {data.provider.plan === plan.value ? "Current plan" : "Available plan"}
              </p>
              <h2 className="mt-4 font-display text-4xl tracking-[-0.06em] text-[color:var(--color-ink)]">
                {plan.name}
              </h2>
              <p className="mt-2 text-xl font-semibold text-[color:var(--color-accent-strong)]">{plan.price}</p>
              <p className="mt-4 text-sm leading-8 text-[color:var(--color-ink-muted)]">{plan.description}</p>
              <FormSubmitButton className="mt-8 w-full" pendingLabel="Updating plan...">
                {data.provider.plan === plan.value ? "Keep this plan" : `Switch to ${plan.name}`}
              </FormSubmitButton>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}
