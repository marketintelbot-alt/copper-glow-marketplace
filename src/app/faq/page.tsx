import { PageShell } from "@/components/page-shell";
import { siteConfig } from "@/lib/site";

const faqs = [
  {
    q: "How does provider verification work?",
    a: "Every public provider moves through an approval workflow before going live. We review identity details, profile completeness, service clarity, portfolio quality, and trust signals before a listing reaches public pages.",
  },
  {
    q: "Why do some profiles show only an approximate area?",
    a: "Independents and home-based providers do not show exact home or apartment addresses publicly. Students see the neighborhood or area first, and booking details are shared only after confirmation.",
  },
  {
    q: "What does the trust score mean?",
    a: "The score is a public shorthand for reliability and quality. It reflects factors like verification, portfolio review, completed bookings, reviews, cancellations, disputes, and repeat booking behavior. We keep the raw formula private to protect moderation quality.",
  },
  {
    q: "Can I pay a deposit instead of the full price?",
    a: "Yes, when the provider allows it. Some services support a deposit with an optional full-prepay path, while others require full prepay from the start.",
  },
  {
    q: "How do cancellations work?",
    a: "Copper Glow uses standardized policies only: Flexible, Standard, and Strict. Each listing shows the policy before checkout, so students know exactly what happens if they cancel close to the appointment.",
  },
  {
    q: "Can providers pay for better placement?",
    a: "Providers can upgrade plans for stronger presentation and featured eligibility, but trust and quality still matter. Lower-trust listings do not leapfrog stronger ones just because they pay.",
  },
  {
    q: "When can I leave a review?",
    a: "Only after a booking is marked completed. That keeps reviews tied to real appointments and helps preserve quality on a new marketplace.",
  },
  {
    q: "Is Copper Glow only for one campus?",
    a: `No. ${siteConfig.launchMarket.name} is the current launch market, but the data model and admin tools are already structured so future schools and surrounding service areas can be added without rebuilding the platform.`,
  },
];

export default function FAQPage() {
  return (
    <PageShell
      eyebrow="FAQ"
      title="Straight answers for students and providers."
      description="The launch market is intentionally trust-first, so these are the questions we expect most often as Copper Glow opens around campus."
    >
      <div className="grid gap-4">
        {faqs.map((item) => (
          <article key={item.q} className="rounded-[30px] border border-white/60 bg-white/90 p-6 shadow-[0_18px_40px_rgba(42,29,24,0.06)]">
            <h2 className="font-display text-3xl tracking-[-0.05em] text-[color:var(--color-ink)]">{item.q}</h2>
            <p className="mt-3 text-sm leading-8 text-[color:var(--color-ink-muted)]">{item.a}</p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
