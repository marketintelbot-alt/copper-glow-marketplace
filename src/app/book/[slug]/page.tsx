import Link from "next/link";
import { notFound } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { BookingCheckoutForm } from "@/components/forms/booking-checkout-form";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { formatCancellationPolicy, formatCurrency, formatDateTime } from "@/lib/format";
import { getBookingPageData } from "@/lib/marketplace";

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const viewer = await getCurrentUser();
  const data = await getBookingPageData(slug, single(query.serviceId), single(query.slotId), viewer?.id);

  if (!data) {
    notFound();
  }

  return (
    <div className="container-shell section-space">
      <div className="grid gap-6 lg:grid-cols-[1fr,0.92fr]">
        <section className="space-y-6">
          <div className="rounded-[36px] border border-white/60 bg-white/88 p-6 shadow-[0_24px_56px_rgba(42,29,24,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--color-ink-muted)]">
              Checkout
            </p>
            <h1 className="mt-3 font-display text-5xl tracking-[-0.06em] text-[color:var(--color-ink)]">
              Secure your booking with {data.provider.name}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-[color:var(--color-ink-muted)]">
              Payments are mocked in this build, but the flow mirrors how held deposits, full prepay,
              payout release, and cancellation windows will behave once a live processor is connected.
            </p>
          </div>

          {viewer ? (
            <BookingCheckoutForm
              providerSlug={data.provider.slug}
              services={data.provider.services.map((service) => ({
                id: service.id,
                name: service.name,
                description: service.description,
                priceCents: service.priceCents,
                paymentRequirement: service.paymentRequirement,
                depositType: service.depositType,
                depositValue: service.depositValue,
              }))}
              slots={data.availableSlots.map((slot) => ({
                id: slot.id,
                serviceId: slot.serviceId,
                startsAt: slot.startsAt.toISOString(),
              }))}
              initialServiceId={data.selectedService?.id}
              initialSlotId={data.selectedSlot?.id}
            />
          ) : (
            <div className="rounded-[34px] border border-white/60 bg-white/90 p-6 shadow-[0_24px_56px_rgba(42,29,24,0.08)]">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] bg-[color:var(--color-surface-soft)] text-[color:var(--color-accent-strong)]">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-display text-4xl tracking-[-0.05em] text-[color:var(--color-ink)]">
                Sign in to finish checkout
              </h2>
              <p className="mt-3 text-sm leading-7 text-[color:var(--color-ink-muted)]">
                Your selected service and slot stay linked in the URL, so you can sign in and come right
                back without starting over.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/auth/sign-in?redirect=${encodeURIComponent(`/book/${slug}?serviceId=${data.selectedService?.id ?? ""}&slotId=${data.selectedSlot?.id ?? ""}`)}`}>
                  <Button>Sign in</Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button tone="secondary">Create account</Button>
                </Link>
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-5 lg:sticky lg:top-28">
          <div className="rounded-[34px] border border-white/60 bg-white/92 p-5 shadow-[0_24px_56px_rgba(42,29,24,0.08)]">
            <h2 className="font-display text-3xl tracking-[-0.05em] text-[color:var(--color-ink)]">
              Booking summary
            </h2>
            <div className="mt-5 space-y-4">
              <SummaryRow label="Provider" value={data.provider.name} />
              <SummaryRow label="Service" value={data.selectedService?.name ?? "Choose a service"} />
              <SummaryRow label="Price" value={data.selectedService ? formatCurrency(data.selectedService.priceCents) : "TBD"} />
              <SummaryRow
                label="Next selected time"
                value={data.selectedSlot ? formatDateTime(data.selectedSlot.startsAt) : "Choose a slot"}
              />
              <SummaryRow label="Policy" value={formatCancellationPolicy(data.provider.cancellationPolicy)} />
            </div>
          </div>
          <div className="rounded-[34px] border border-white/60 bg-white/92 p-5 shadow-[0_24px_56px_rgba(42,29,24,0.08)]">
            <h2 className="font-display text-3xl tracking-[-0.05em] text-[color:var(--color-ink)]">
              Mocked payment behavior
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-[color:var(--color-ink-muted)]">
              <li className="rounded-[22px] bg-[color:var(--color-surface-soft)] px-4 py-3">
                The platform holds funds in escrow until the service completion window closes.
              </li>
              <li className="rounded-[22px] bg-[color:var(--color-surface-soft)] px-4 py-3">
                Platform commission is deducted automatically before provider payout.
              </li>
              <li className="rounded-[22px] bg-[color:var(--color-surface-soft)] px-4 py-3">
                Email, SMS, and payout events are mocked cleanly so real integrations can plug in later.
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] bg-[color:var(--color-surface-soft)] px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--color-ink-muted)]">
        {label}
      </p>
      <p className="mt-2 text-sm leading-7 text-[color:var(--color-ink)]">{value}</p>
    </div>
  );
}
