import { PageShell } from "@/components/page-shell";
import { siteConfig } from "@/lib/site";

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="About"
      title="A local marketplace built to make beauty booking feel safer and sharper."
      description="Aurelle started with a simple observation: students were already booking beauty services through screenshots, DMs, and half-verified word of mouth. The market was active, but trust was still fragmented."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-[30px] border border-white/60 bg-white/90 p-6 shadow-[0_18px_40px_rgba(42,29,24,0.06)]">
          <h2 className="font-display text-3xl tracking-[-0.05em] text-[color:var(--color-ink)]">Why we launch market by market</h2>
          <p className="mt-3 text-sm leading-8 text-[color:var(--color-ink-muted)]">
            {siteConfig.launchMarket.name} is the first live market because it has strong student demand,
            a real mix of salons, independents, and mobile artists, and clear patterns around event-based
            booking. The product, data model, and ops workflow are intentionally structured so that new
            schools and surrounding neighborhoods can be layered in without rebuilding the marketplace.
          </p>
        </article>
        <article className="rounded-[30px] border border-white/60 bg-white/90 p-6 shadow-[0_18px_40px_rgba(42,29,24,0.06)]">
          <h2 className="font-display text-3xl tracking-[-0.05em] text-[color:var(--color-ink)]">What we believe</h2>
          <p className="mt-3 text-sm leading-8 text-[color:var(--color-ink-muted)]">
            Premium beauty booking should not require guesswork. Students deserve verified providers, clear
            pricing, visible trust signals, and booking flows that feel dependable. Providers deserve a
            product that rewards quality work, repeat business, and reliable client experiences.
          </p>
        </article>
        <article className="rounded-[30px] border border-white/60 bg-white/90 p-6 shadow-[0_18px_40px_rgba(42,29,24,0.06)] lg:col-span-2">
          <h2 className="font-display text-3xl tracking-[-0.05em] text-[color:var(--color-ink)]">How the brand shows up</h2>
          <p className="mt-3 text-sm leading-8 text-[color:var(--color-ink-muted)]">
            Aurelle is feminine but modern, visual without feeling noisy, and premium without feeling
            exclusive. That means polished copy, trustworthy interaction design, and systems that make local
            launch feel real from day one while still reading like a brand that can travel well into future
            cities, campuses, and neighborhood-based markets.
          </p>
        </article>
      </div>
    </PageShell>
  );
}
