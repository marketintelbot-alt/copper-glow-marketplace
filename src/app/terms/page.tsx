import { PageShell } from "@/components/page-shell";
import { siteConfig } from "@/lib/site";

export default function TermsPage() {
  return (
    <PageShell
      eyebrow="Terms of Service"
      title="Marketplace terms for the Copper Glow launch."
      description="These terms describe how the marketplace is intended to operate for students, providers, and admins when the product is live."
    >
      <div className="grid gap-4">
        {[
          {
            title: "Marketplace role",
            body: "Copper Glow provides booking, discovery, trust, moderation, and provider management tooling. Providers remain responsible for the services they deliver and for maintaining accurate business information.",
          },
          {
            title: "Booking and payment flow",
            body: "Providers may require either a deposit or full prepay. In the live product, funds are held by the platform and provider payout is released after the appointment completion window, less the platform fee.",
          },
          {
            title: "Cancellation policies",
            body: "Copper Glow supports only standardized Flexible, Standard, and Strict cancellation policies. Policy terms are shown before checkout and apply to cancellations or no-shows according to the selected provider setting.",
          },
          {
            title: "Provider eligibility",
            body: "Providers do not go live automatically. Copper Glow may suspend, decline, or remove providers who fail verification, generate safety concerns, or violate platform standards.",
          },
          {
            title: "Reviews",
            body: "Reviews are restricted to completed bookings. Fraudulent, retaliatory, or policy-violating reviews may be moderated or removed.",
          },
          {
            title: "Launch market scope",
            body: `Copper Glow launches first around ${siteConfig.launchMarket.name}. We may expand to additional schools, neighborhoods, and cities over time, and provider coverage may evolve as each market opens.`,
          },
        ].map((section) => (
          <article key={section.title} className="rounded-[30px] border border-white/60 bg-white/90 p-6 shadow-[0_18px_40px_rgba(42,29,24,0.06)]">
            <h2 className="font-display text-3xl tracking-[-0.05em] text-[color:var(--color-ink)]">{section.title}</h2>
            <p className="mt-3 text-sm leading-8 text-[color:var(--color-ink-muted)]">{section.body}</p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
