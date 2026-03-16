import { ShieldCheck, Star, WandSparkles } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { getContentStats } from "@/lib/marketplace";

export default async function TrustPage() {
  const stats = await getContentStats();

  return (
    <div className="container-shell section-space">
      <div className="space-y-10">
        <SectionHeading
          eyebrow="Trust and safety"
          title="A beauty marketplace that shows why a listing feels trustworthy"
          description="Copper Glow is designed so students can browse quickly without losing the signals that matter. Trust scores stay public, but the raw formula stays internal. Ranking rewards quality and reliability, not just paid placement."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <InsightCard icon={<ShieldCheck className="h-5 w-5" />} title={`${stats.liveProviders} live providers`} body="Only approved and live providers appear on public surfaces. Drafts, outreach records, pending approvals, and suspensions stay internal." />
          <InsightCard icon={<Star className="h-5 w-5" />} title={`${stats.averageTrust.toFixed(1)} average trust`} body="Trust scores roll up identity verification, profile completeness, portfolio review, reliability, and completed-booking quality signals." />
          <InsightCard icon={<WandSparkles className="h-5 w-5" />} title={`${stats.topCategories.length} active launch categories`} body="Higher-tier services are limited to verified businesses only, keeping medical or premium treatments inside tighter review lanes." />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card
            title="What drives trust scores"
            body="Public cards show the score and the reason signals, like verified identity, portfolio review, completed bookings, and low cancellation rates. Behind the scenes, response speed, dispute rate, repeat bookings, no-shows, and review depth all contribute as weighted inputs."
          />
          <Card
            title="What trust scores do not do"
            body="They do not expose the raw scoring formula, exact moderation thresholds, or private address information. Independents never display home or apartment addresses publicly. Students see only approximate areas until the booking is confirmed."
          />
          <Card
            title="Approval workflow"
            body="Providers move through Draft, Pending Outreach, Pending Approval, Approved, Live, Declined, or Suspended. Live is the only state that appears publicly. This keeps launch quality high even while the marketplace is still building inventory."
          />
          <Card
            title="Ranking and paid plans"
            body="Basic, Spotlight, and Premium plans change styling, placement eligibility, and analytics depth. They do not override trust safeguards. Lower-trust providers cannot dominate search simply because they pay."
          />
        </div>

        <div className="rounded-[34px] border border-white/60 bg-white/90 p-6 shadow-[0_22px_52px_rgba(42,29,24,0.08)] lg:p-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {[
              {
                title: "Student-facing safety rules",
                items: [
                  "Only completed bookings can leave reviews.",
                  "Only approved live providers show publicly.",
                  "Exact home addresses stay hidden for independents.",
                  "Standardized cancellation policies keep expectations clean.",
                ],
              },
              {
                title: "Provider safeguards",
                items: [
                  "Approval gating before launch protects brand trust.",
                  "Payouts stay held until post-service confirmation windows close.",
                  "Claim requests route through admin review before profile handoff.",
                  "Promoted placement remains reviewable by admins.",
                ],
              },
              {
                title: "Admin controls",
                items: [
                  "Moderate statuses, claims, applications, disputes, and outreach leads.",
                  "Adjust homepage featured sections without bypassing trust.",
                  "Review trust signal flags and payout holds.",
                  "Keep school expansion structured for future markets like ASU.",
                ],
              },
            ].map((column) => (
              <div key={column.title}>
                <h2 className="font-display text-2xl tracking-[-0.05em] text-[color:var(--color-ink)]">
                  {column.title}
                </h2>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-[color:var(--color-ink-muted)]">
                  {column.items.map((item) => (
                    <li key={item} className="rounded-[20px] bg-[color:var(--color-surface-soft)] px-4 py-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[30px] border border-white/60 bg-white/88 p-5 shadow-[0_18px_40px_rgba(42,29,24,0.06)]">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] bg-[color:var(--color-surface-soft)] text-[color:var(--color-accent-strong)]">
        {icon}
      </div>
      <h2 className="mt-5 font-display text-3xl tracking-[-0.05em] text-[color:var(--color-ink)]">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-[color:var(--color-ink-muted)]">{body}</p>
    </div>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[30px] border border-white/60 bg-white/88 p-6 shadow-[0_18px_40px_rgba(42,29,24,0.06)]">
      <h2 className="font-display text-3xl tracking-[-0.05em] text-[color:var(--color-ink)]">{title}</h2>
      <p className="mt-3 text-sm leading-8 text-[color:var(--color-ink-muted)]">{body}</p>
    </div>
  );
}
