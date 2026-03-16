import { PageShell } from "@/components/page-shell";
import { siteConfig } from "@/lib/site";

export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow="Privacy Policy"
      title="How Copper Glow handles data in the launch market."
      description={`This demo build uses seeded local data and mocked communication flows, but the privacy model is written as if the marketplace were operating live in its first market around ${siteConfig.launchMarket.name}.`}
    >
      <div className="grid gap-4">
        {[
          {
            title: "Information we collect",
            body: "We collect account details, booking details, provider profile information, review content, and platform activity needed to operate bookings, trust scoring, moderation, and customer support.",
          },
          {
            title: "How we use it",
            body: "We use data to run the marketplace, verify providers, process booking states, show trust signals, manage refunds or disputes, and improve ranking relevance without exposing private moderation logic.",
          },
          {
            title: "Independent provider privacy",
            body: "Copper Glow does not show exact home or apartment addresses for independents on public pages. Only approximate areas or neighborhoods are displayed before a booking is confirmed.",
          },
          {
            title: "Reviews and trust data",
            body: "Reviews can be submitted only after completed bookings. Trust signals may be derived from booking performance, review history, cancellation behavior, dispute rates, and repeat booking patterns.",
          },
          {
            title: "Data sharing",
            body: "We share only the information necessary to support a booking, deliver confirmations, and operate provider dashboards. We do not sell customer or provider personal data.",
          },
          {
            title: "Demo mode note",
            body: "This preview app uses mocked payment, email, SMS, and payout flows. Local test data can be reset through the included seed process.",
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
