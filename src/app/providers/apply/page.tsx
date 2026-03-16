import { ClaimRequestForm } from "@/components/forms/claim-request-form";
import { ProviderApplicationForm } from "@/components/forms/provider-application-form";
import { siteConfig } from "@/lib/site";

export default function ProviderApplyPage() {
  return (
    <div className="container-shell section-space">
      <div className="space-y-8">
        <section className="rounded-[38px] border border-white/60 bg-[linear-gradient(145deg,rgba(245,226,218,0.86),rgba(255,255,255,0.9))] p-8 shadow-[0_28px_66px_rgba(42,29,24,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--color-ink-muted)]">
            For providers
          </p>
          <h1 className="mt-4 font-display text-5xl tracking-[-0.06em] text-[color:var(--color-ink)]">
            Apply to join Copper Glow as the marketplace expands.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-[color:var(--color-ink-muted)]">
            We are launching first around {siteConfig.launchMarket.name} with a trust-first marketplace
            for beauty and self-care. Verified Businesses, Verified Independents, and strong mobile
            providers can apply now, while the product stays ready for additional markets over time.
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="font-display text-4xl tracking-[-0.05em] text-[color:var(--color-ink)]">
              New provider application
            </h2>
            <p className="text-sm leading-7 text-[color:var(--color-ink-muted)]">
              Basic includes listing access, booking management, payout tracking UI, and review
              collection. Spotlight and Premium open up stronger placement, richer presentation, and
              analytics once trust standards are met.
            </p>
            <ProviderApplicationForm />
          </div>
          <div className="space-y-4">
            <h2 className="font-display text-4xl tracking-[-0.05em] text-[color:var(--color-ink)]">
              Claim an existing business
            </h2>
            <p className="text-sm leading-7 text-[color:var(--color-ink-muted)]">
              If your business already appears in the outreach pipeline or pre-launch directory, submit a
              claim request and we’ll route it through the admin verification queue before handing over
              profile controls.
            </p>
            <ClaimRequestForm />
          </div>
        </div>
      </div>
    </div>
  );
}
