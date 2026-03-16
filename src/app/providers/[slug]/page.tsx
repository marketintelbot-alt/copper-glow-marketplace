import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, CalendarCheck2, Check, Clock3, MapPin, ShieldCheck, Sparkles, Star } from "lucide-react";
import { FavoriteButton } from "@/components/favorite-button";
import { ProviderCard } from "@/components/provider-card";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import {
  formatCancellationPolicy,
  formatCurrency,
  formatDateTime,
  formatDistanceMiles,
  formatPaymentRequirement,
  formatPercent,
  formatTrustScore,
} from "@/lib/format";
import { getProviderBadges, getProviderPageData } from "@/lib/marketplace";

export default async function ProviderProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const viewer = await getCurrentUser();
  const data = await getProviderPageData(slug, viewer?.id);

  if (!data) {
    notFound();
  }

  const { provider, card, recommended } = data;
  const publicTrustSignals = provider.trustSignals.filter((signal) => signal.isPublic);
  const rebookReasons = [
    {
      icon: <CalendarCheck2 className="h-5 w-5" />,
      title: `${provider.completedBookingsCount}+ completed bookings`,
      body: "A healthy booking history gives new clients a clearer read on consistency and real delivery.",
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: `${formatPercent(provider.repeatBookingRate)} repeat booking rate`,
      body: "Students keep coming back when timing, communication, and finished results all stay sharp.",
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: `${formatPercent(provider.cancellationRate)} cancellation rate`,
      body: "Lower cancellation behavior supports ranking and makes the profile feel dependable during busy weeks.",
    },
  ];
  const bookingNotes = [
    {
      title: "Arrival and location",
      body:
        provider.providerType === "VERIFIED_INDEPENDENT"
          ? "Exact arrival details unlock after booking confirmation. Public pages show only an approximate area for privacy."
          : "You will receive confirmation details and any check-in instructions after booking, without exposing more than needed upfront.",
    },
    {
      title: "Payment setup",
      body: provider.services.some((service) => service.paymentRequirement === "DEPOSIT_REQUIRED")
        ? "This profile offers at least one deposit-based service, with charge-now amounts shown clearly before confirmation."
        : "Services on this profile currently use full prepay, so the full amount is secured during checkout.",
    },
    {
      title: "Response expectations",
      body: `Average response time is about ${provider.responseTimeMinutes} minutes, which helps keep reschedules, confirmations, and last-minute questions moving quickly.`,
    },
  ];
  const bookingFaqs = [
    {
      question: "How do payment options work on this profile?",
      answer: provider.services.some((service) => service.paymentRequirement === "DEPOSIT_REQUIRED")
        ? "Some services support deposits while others may allow full prepay. Checkout always shows the exact amount charged now before you confirm."
        : "This provider currently uses full prepay services, so the full appointment total is collected during checkout.",
    },
    {
      question: "When do I see the full location details?",
      answer:
        provider.providerType === "VERIFIED_INDEPENDENT"
          ? "For privacy, exact home or apartment details stay hidden until a booking is confirmed."
          : "You will receive any needed check-in or arrival instructions after booking confirmation.",
    },
    {
      question: "What makes this provider feel dependable?",
      answer: `${provider.completedBookingsCount}+ completed bookings, ${formatPercent(provider.repeatBookingRate)} repeat demand, and ${formatPercent(provider.disputeRate)} dispute rate all support this listing's trust score.`,
    },
  ];

  return (
    <div className="container-shell section-space">
      <div className="page-grid">
        <div className="space-y-6">
          <section
            className="overflow-hidden rounded-[38px] border border-white/60 p-6 shadow-[0_28px_66px_rgba(42,29,24,0.08)]"
            style={{
              background: `linear-gradient(145deg, ${provider.photos[0]?.gradientFrom ?? provider.coverTone}, ${provider.photos[0]?.gradientTo ?? "#FFF8F5"})`,
            }}
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-4">
                <div className="flex flex-wrap gap-2">
                  {getProviderBadges(provider.providerType, provider.isMobileService).map((badge) => (
                    <span key={badge} className="rounded-full bg-white/78 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--color-ink)]">
                      {badge}
                    </span>
                  ))}
                  <span className="rounded-full bg-white/78 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--color-ink)]">
                    {provider.plan === "PREMIUM" ? "Premium profile" : provider.plan === "SPOTLIGHT" ? "Spotlight profile" : "Standard profile"}
                  </span>
                </div>
                <div>
                  <h1 className="font-display text-5xl leading-[0.95] tracking-[-0.06em] text-[color:var(--color-ink)] sm:text-6xl">
                    {provider.name}
                  </h1>
                  <p className="mt-4 max-w-2xl text-base leading-8 text-[color:var(--color-ink-muted)]">
                    {provider.story}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-[color:var(--color-ink-muted)]">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/72 px-3 py-2">
                    <MapPin className="h-4 w-4 text-[color:var(--color-accent-strong)]" />
                    {provider.approximateArea} • {formatDistanceMiles(provider.distanceMiles)}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/72 px-3 py-2">
                    <Star className="h-4 w-4 fill-current text-[color:var(--color-accent-strong)]" />
                    {provider.reviewAverage.toFixed(1)} rating ({provider.reviewCount})
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/72 px-3 py-2">
                    <Clock3 className="h-4 w-4 text-[color:var(--color-accent-strong)]" />
                    Replies in about {provider.responseTimeMinutes} min
                  </span>
                </div>
              </div>

              <div className="rounded-[30px] bg-white/74 p-5 soft-ring">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--color-ink-muted)]">
                      Trust score
                    </p>
                    <div className="mt-2 flex items-end gap-2">
                      <span className="font-display text-5xl tracking-[-0.06em] text-[color:var(--color-ink)]">
                        {formatTrustScore(provider.trustScore)}
                      </span>
                      <span className="pb-1 text-sm text-[color:var(--color-ink-muted)]">/ 10</span>
                    </div>
                  </div>
                  <FavoriteButton providerId={provider.id} initialSaved={card.saved} />
                </div>
                <div className="mt-4 space-y-2">
                  {publicTrustSignals
                    .slice(0, 4)
                    .map((signal) => (
                      <div key={signal.id} className="flex items-center gap-2 text-sm text-[color:var(--color-ink-muted)]">
                        <Check className="h-4 w-4 text-[color:var(--color-accent-strong)]" />
                        <span>
                          <span className="font-medium text-[color:var(--color-ink)]">{signal.label}:</span>{" "}
                          {signal.value}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-3">
            {provider.photos.map((photo, index) => (
              <div
                key={photo.id}
                className={`rounded-[30px] border border-white/60 p-5 shadow-[0_18px_40px_rgba(42,29,24,0.06)] ${index === 0 ? "sm:col-span-3 lg:col-span-2 lg:min-h-[260px]" : ""}`}
                style={{ background: `linear-gradient(145deg, ${photo.gradientFrom}, ${photo.gradientTo})` }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--color-ink-muted)]">
                  {photo.kind}
                </p>
                <h2 className="mt-4 font-display text-3xl tracking-[-0.05em] text-[color:var(--color-ink)]">
                  {photo.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[color:var(--color-ink-muted)]">{photo.caption}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            {rebookReasons.map((reason) => (
              <div key={reason.title} className="rounded-[30px] border border-white/60 bg-white/88 p-5 shadow-[0_20px_48px_rgba(42,29,24,0.06)]">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-[18px] bg-[color:var(--color-surface-soft)] text-[color:var(--color-accent-strong)]">
                  {reason.icon}
                </div>
                <h2 className="mt-4 font-display text-3xl tracking-[-0.05em] text-[color:var(--color-ink)]">
                  {reason.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[color:var(--color-ink-muted)]">{reason.body}</p>
              </div>
            ))}
          </section>

          <section className="rounded-[36px] border border-white/60 bg-white/88 p-6 shadow-[0_24px_56px_rgba(42,29,24,0.08)]">
            <h2 className="font-display text-4xl tracking-[-0.06em] text-[color:var(--color-ink)]">Services</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {provider.services.map((service) => (
                <div key={service.id} className="rounded-[26px] border border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--color-ink-muted)]">
                        {service.category.name}
                      </p>
                      <h3 className="mt-2 font-display text-3xl tracking-[-0.05em] text-[color:var(--color-ink)]">
                        {service.name}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[color:var(--color-ink-muted)]">From</p>
                      <p className="font-display text-3xl tracking-[-0.05em] text-[color:var(--color-ink)]">
                        {formatCurrency(service.priceCents)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--color-ink-muted)]">{service.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-[color:var(--color-ink-muted)]">
                    <span className="rounded-full bg-white/80 px-3 py-1">{service.durationMinutes} min</span>
                    <span className="rounded-full bg-white/80 px-3 py-1">{formatPaymentRequirement(service.paymentRequirement)}</span>
                    {service.studentPerk ? <span className="rounded-full bg-white/80 px-3 py-1">{service.studentPerk}</span> : null}
                  </div>
                  <div className="mt-5">
                    <Link href={`/book/${provider.slug}?serviceId=${service.id}`}>
                      <Button size="sm">Choose service</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[34px] border border-white/60 bg-white/88 p-6 shadow-[0_22px_52px_rgba(42,29,24,0.08)]">
              <h2 className="font-display text-4xl tracking-[-0.06em] text-[color:var(--color-ink)]">Before you book</h2>
              <div className="mt-5 space-y-4">
                {bookingNotes.map((note) => (
                  <div key={note.title} className="rounded-[24px] bg-[color:var(--color-surface-soft)] p-4">
                    <p className="font-medium text-[color:var(--color-ink)]">{note.title}</p>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--color-ink-muted)]">{note.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[34px] border border-white/60 bg-white/88 p-6 shadow-[0_22px_52px_rgba(42,29,24,0.08)]">
              <h2 className="font-display text-4xl tracking-[-0.06em] text-[color:var(--color-ink)]">Booking FAQs</h2>
              <div className="mt-5 space-y-4">
                {bookingFaqs.map((item) => (
                  <div key={item.question} className="rounded-[24px] bg-[color:var(--color-surface-soft)] p-4">
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] bg-white/80 text-[color:var(--color-accent-strong)]">
                        <BadgeCheck className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-medium text-[color:var(--color-ink)]">{item.question}</p>
                        <p className="mt-2 text-sm leading-7 text-[color:var(--color-ink-muted)]">{item.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[34px] border border-white/60 bg-white/88 p-6 shadow-[0_22px_52px_rgba(42,29,24,0.08)]">
              <h2 className="font-display text-4xl tracking-[-0.06em] text-[color:var(--color-ink)]">Trust details</h2>
              <div className="mt-5 space-y-4">
                {provider.trustSignals.map((signal) => (
                  <div key={signal.id} className="rounded-[24px] bg-[color:var(--color-surface-soft)] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-medium text-[color:var(--color-ink)]">{signal.label}</p>
                      <span className="rounded-full bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--color-ink-muted)]">
                        {signal.value}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--color-ink-muted)]">{signal.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[34px] border border-white/60 bg-white/88 p-6 shadow-[0_22px_52px_rgba(42,29,24,0.08)]">
              <h2 className="font-display text-4xl tracking-[-0.06em] text-[color:var(--color-ink)]">Reviews</h2>
              <div className="mt-5 space-y-4">
                {provider.reviews.length ? (
                  provider.reviews.map((review) => (
                    <div key={review.id} className="rounded-[24px] bg-[color:var(--color-surface-soft)] p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-[color:var(--color-ink)]">{review.title}</p>
                          <p className="text-sm text-[color:var(--color-ink-muted)]">
                            {review.user.firstName} {review.user.lastName.charAt(0)}.
                          </p>
                        </div>
                        <span className="rounded-full bg-white/75 px-3 py-1 text-sm font-semibold text-[color:var(--color-ink)]">
                          {review.rating}.0
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-[color:var(--color-ink-muted)]">{review.body}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm leading-7 text-[color:var(--color-ink-muted)]">
                    Reviews unlock only after completed bookings. This profile is ready for new verified feedback as the market grows.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--color-ink-muted)]">
                  Also nearby
                </p>
                <h2 className="mt-3 font-display text-4xl tracking-[-0.06em] text-[color:var(--color-ink)]">
                  Related providers near the same orbit
                </h2>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recommended.map((item) => (
                <ProviderCard key={item.id} provider={item} />
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-28">
          <div className="rounded-[34px] border border-white/60 bg-white/92 p-5 shadow-[0_24px_56px_rgba(42,29,24,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--color-ink-muted)]">
              Book this provider
            </p>
            <div className="mt-4 space-y-3">
              <div className="rounded-[24px] bg-[color:var(--color-surface-soft)] p-4">
                <p className="text-sm text-[color:var(--color-ink-muted)]">Starting from</p>
                <p className="mt-2 font-display text-4xl tracking-[-0.06em] text-[color:var(--color-ink)]">
                  {formatCurrency(provider.startingPriceCents)}
                </p>
              </div>
              <div className="rounded-[24px] bg-[color:var(--color-surface-soft)] p-4 text-sm text-[color:var(--color-ink-muted)]">
                <p className="font-medium text-[color:var(--color-ink)]">Cancellation policy</p>
                <p className="mt-2 leading-7">{formatCancellationPolicy(provider.cancellationPolicy)}</p>
              </div>
              <div className="rounded-[24px] bg-[color:var(--color-surface-soft)] p-4 text-sm text-[color:var(--color-ink-muted)]">
                <p className="font-medium text-[color:var(--color-ink)]">Public location note</p>
                <p className="mt-2 leading-7">
                  {provider.providerType === "VERIFIED_INDEPENDENT"
                    ? "Exact address stays hidden until booking confirmation. You’ll see only the approximate area now."
                    : "Approximate area shown now, with full check-in instructions after booking where applicable."}
                </p>
              </div>
              <div className="rounded-[24px] bg-[color:var(--color-surface-soft)] p-4 text-sm text-[color:var(--color-ink-muted)]">
                <p className="font-medium text-[color:var(--color-ink)]">Why clients rebook</p>
                <p className="mt-2 leading-7">
                  {formatPercent(provider.repeatBookingRate)} repeat bookings, {formatPercent(provider.noShowRate)} no-show rate,
                  and {provider.yearsExperience} years of experience support this profile’s premium presentation.
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {provider.availabilitySlots.slice(0, 4).map((slot) => (
                <Link
                  key={slot.id}
                  href={`/book/${provider.slug}?serviceId=${slot.serviceId ?? provider.services[0]?.id}&slotId=${slot.id}`}
                  className="flex items-center justify-between rounded-[22px] bg-[color:var(--color-surface-soft)] px-4 py-3 text-sm transition hover:bg-white"
                >
                  <span>{formatDateTime(slot.startsAt)}</span>
                  <span className="font-medium text-[color:var(--color-accent-strong)]">Select</span>
                </Link>
              ))}
            </div>
            <div className="mt-5">
              <Link href={`/book/${provider.slug}`}>
                <Button className="w-full" size="lg">
                  Continue to checkout
                </Button>
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
