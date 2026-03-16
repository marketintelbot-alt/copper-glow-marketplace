import { PageShell } from "@/components/page-shell";
import { ContactForm } from "@/components/forms/contact-form";

export default function ContactPage() {
  return (
    <PageShell
      eyebrow="Contact"
      title="Reach the launch team."
      description="Questions about bookings, provider applications, partnerships, or launch support all land here. In this local preview, submissions are stored in the demo admin inbox and return mocked acknowledgments instantly."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
        <section className="rounded-[30px] border border-white/60 bg-white/90 p-6 shadow-[0_18px_40px_rgba(42,29,24,0.06)]">
          <h2 className="font-display text-3xl tracking-[-0.05em] text-[color:var(--color-ink)]">Best for</h2>
          <ul className="mt-4 space-y-3 text-sm leading-8 text-[color:var(--color-ink-muted)]">
            <li className="rounded-[22px] bg-[color:var(--color-surface-soft)] px-4 py-3">Booking support and platform questions</li>
            <li className="rounded-[22px] bg-[color:var(--color-surface-soft)] px-4 py-3">Provider applications and profile claims</li>
            <li className="rounded-[22px] bg-[color:var(--color-surface-soft)] px-4 py-3">Campus partnerships, pop-ups, and launch collaborations</li>
            <li className="rounded-[22px] bg-[color:var(--color-surface-soft)] px-4 py-3">Privacy, terms, or moderation questions</li>
          </ul>
        </section>
        <ContactForm />
      </div>
    </PageShell>
  );
}
