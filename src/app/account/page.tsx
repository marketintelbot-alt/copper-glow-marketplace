import Link from "next/link";
import { signOutAction } from "@/actions";
import { BookingActions } from "@/components/booking-actions";
import { EmptyState } from "@/components/empty-state";
import { ProfileSettingsForm } from "@/components/forms/profile-settings-form";
import { ReviewForm } from "@/components/forms/review-form";
import { ProviderCard } from "@/components/provider-card";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { getAccountPageData } from "@/lib/marketplace";

export default async function AccountPage() {
  const user = await requireUser("/account");
  const data = await getAccountPageData(user.id);

  return (
    <div className="container-shell section-space">
      <div className="space-y-8">
        <div className="rounded-[36px] border border-white/60 bg-white/90 p-6 shadow-[0_24px_56px_rgba(42,29,24,0.08)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--color-ink-muted)]">
                Account
              </p>
              <h1 className="mt-3 font-display text-5xl tracking-[-0.06em] text-[color:var(--color-ink)]">
                Welcome back, {data.user.firstName}.
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-8 text-[color:var(--color-ink-muted)]">
                Manage upcoming appointments, revisit past bookings, favorite trusted providers, and
                leave reviews only after completed visits.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/auth/sign-in">
                <Button tone="soft">Switch account</Button>
              </Link>
              <form action={signOutAction}>
                <Button tone="secondary" type="submit">
                  Sign out
                </Button>
              </form>
            </div>
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="font-display text-4xl tracking-[-0.05em] text-[color:var(--color-ink)]">
            Upcoming bookings
          </h2>
          {data.upcoming.length ? (
            <div className="grid gap-4">
              {data.upcoming.map((booking) => (
                <article key={booking.id} className="rounded-[30px] border border-white/60 bg-white/90 p-5 shadow-[0_18px_40px_rgba(42,29,24,0.06)]">
                  <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--color-ink-muted)]">
                        {booking.reference}
                      </p>
                      <h3 className="font-display text-3xl tracking-[-0.05em] text-[color:var(--color-ink)]">
                        {booking.provider.name}
                      </h3>
                      <p className="text-sm leading-7 text-[color:var(--color-ink-muted)]">
                        {booking.service.name} • {formatDateTime(booking.appointmentStart)}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs text-[color:var(--color-ink-muted)]">
                        <span className="rounded-full bg-[color:var(--color-surface-soft)] px-3 py-1">
                          Charged now: {formatCurrency(booking.chargeNowCents)}
                        </span>
                        <span className="rounded-full bg-[color:var(--color-surface-soft)] px-3 py-1">
                          Remaining: {formatCurrency(booking.remainingDueCents)}
                        </span>
                        <span className="rounded-full bg-[color:var(--color-surface-soft)] px-3 py-1">
                          Policy: {booking.cancellationPolicy.toLowerCase()}
                        </span>
                      </div>
                    </div>
                    <BookingActions
                      bookingId={booking.id}
                      rescheduleOptions={booking.provider.availabilitySlots.map((slot) => ({
                        id: slot.id,
                        startsAt: slot.startsAt.toISOString(),
                      }))}
                    />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="No upcoming bookings" description="Your next appointment will show up here with reschedule and cancellation controls." />
          )}
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-4xl tracking-[-0.05em] text-[color:var(--color-ink)]">
            Past bookings and reviews
          </h2>
          <div className="grid gap-4">
            {data.past.map((booking) => (
              <article key={booking.id} className="rounded-[30px] border border-white/60 bg-white/90 p-5 shadow-[0_18px_40px_rgba(42,29,24,0.06)]">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--color-ink-muted)]">
                      {booking.reference}
                    </p>
                    <h3 className="mt-2 font-display text-3xl tracking-[-0.05em] text-[color:var(--color-ink)]">
                      {booking.provider.name}
                    </h3>
                    <p className="text-sm leading-7 text-[color:var(--color-ink-muted)]">
                      {booking.service.name} • {formatDateTime(booking.appointmentStart)}
                    </p>
                  </div>
                  {booking.review ? (
                    <div className="rounded-[24px] bg-[color:var(--color-surface-soft)] p-4">
                      <p className="font-medium text-[color:var(--color-ink)]">{booking.review.title}</p>
                      <p className="mt-2 text-sm leading-7 text-[color:var(--color-ink-muted)]">{booking.review.body}</p>
                    </div>
                  ) : booking.status === "COMPLETED" ? (
                    <ReviewForm bookingId={booking.id} />
                  ) : (
                    <p className="text-sm text-[color:var(--color-ink-muted)]">
                      Review submission unlocks after completed bookings only.
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-4xl tracking-[-0.05em] text-[color:var(--color-ink)]">
            Saved providers
          </h2>
          {data.favorites.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data.favorites.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          ) : (
            <EmptyState title="No saved providers yet" description="Tap the heart on any listing to keep it in your shortlist." />
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr,0.95fr]">
          <div className="rounded-[34px] border border-white/60 bg-white/90 p-5 shadow-[0_18px_40px_rgba(42,29,24,0.06)]">
            <h2 className="font-display text-4xl tracking-[-0.05em] text-[color:var(--color-ink)]">
              Payment history
            </h2>
            <div className="mt-5 overflow-hidden rounded-[24px] border border-[color:var(--color-border)]">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[color:var(--color-surface-soft)] text-[color:var(--color-ink-muted)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Booking</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.paymentHistory.map((record) => (
                    <tr key={record.id} className="border-t border-[color:var(--color-border)] bg-white">
                      <td className="px-4 py-3">{record.booking.reference}</td>
                      <td className="px-4 py-3">{formatCurrency(record.amountCents)}</td>
                      <td className="px-4 py-3">{record.status.toLowerCase()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <ProfileSettingsForm
              firstName={data.user.firstName}
              lastName={data.user.lastName}
              phone={data.user.phone ?? ""}
              bio={data.user.bio}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
