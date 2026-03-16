import { addAvailabilitySlotFormAction, addProviderServiceFormAction, updateProviderProfileFormAction } from "@/actions";
import { EmptyState } from "@/components/empty-state";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { ProviderPhotoUploader } from "@/components/provider-photo-uploader";
import { Button } from "@/components/ui/button";
import { requireProvider } from "@/lib/auth";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { getCategories, getProviderDashboardData } from "@/lib/marketplace";

export default async function ProviderDashboardPage() {
  const user = await requireProvider();
  const data = await getProviderDashboardData(user.id);
  const categories = await getCategories();

  if (!data) {
    return (
      <div className="container-shell section-space">
        <EmptyState title="No connected provider profile yet" description="Apply to join first, then this dashboard will unlock profile editing, booking management, and payout tracking." />
      </div>
    );
  }

  const { provider, metrics, upcomingBookings } = data;

  return (
    <div className="container-shell section-space">
      <div className="space-y-8">
        <section className="rounded-[36px] border border-white/60 bg-white/90 p-6 shadow-[0_24px_56px_rgba(42,29,24,0.08)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--color-ink-muted)]">
                Provider dashboard
              </p>
              <h1 className="mt-3 font-display text-5xl tracking-[-0.06em] text-[color:var(--color-ink)]">
                {provider.name}
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-8 text-[color:var(--color-ink-muted)]">
                Manage profile copy, services, availability, booking activity, payout tracking, reviews,
                and trust signals. This dashboard runs on local demo data but mirrors a production-ready
                provider workspace.
              </p>
            </div>
            <div className="flex gap-3">
              <a href="/provider/pricing">
                <Button tone="secondary">Manage plan</Button>
              </a>
            </div>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="Pending bookings" value={String(metrics.pendingRequests)} />
          <Metric label="Completed window" value={String(metrics.completedThisWindow)} />
          <Metric label="Held payouts" value={String(metrics.heldPayouts)} />
          <Metric label="Released payouts" value={formatCurrency(metrics.releasedPayouts)} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
          <section className="space-y-6 rounded-[34px] border border-white/60 bg-white/90 p-6 shadow-[0_18px_40px_rgba(42,29,24,0.06)]">
            <div>
              <h2 className="font-display text-4xl tracking-[-0.05em] text-[color:var(--color-ink)]">
                Profile and trust
              </h2>
              <p className="mt-2 text-sm leading-7 text-[color:var(--color-ink-muted)]">
                Keep your public profile sharp and trust signals strong.
              </p>
            </div>
            <form action={updateProviderProfileFormAction} className="grid gap-4">
              <input type="hidden" name="providerId" value={provider.id} />
              <Field label="Headline">
                <input name="headline" defaultValue={provider.headline} className="h-12 rounded-[20px] border border-[color:var(--color-border)] bg-white px-4 text-sm outline-none" />
              </Field>
              <Field label="Short description">
                <textarea name="shortDescription" defaultValue={provider.shortDescription} rows={3} className="rounded-[20px] border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm outline-none" />
              </Field>
              <Field label="Story">
                <textarea name="story" defaultValue={provider.story} rows={5} className="rounded-[20px] border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm outline-none" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Approximate area">
                  <input name="approximateArea" defaultValue={provider.approximateArea} className="h-12 rounded-[20px] border border-[color:var(--color-border)] bg-white px-4 text-sm outline-none" />
                </Field>
                <Field label="Neighborhood">
                  <input name="neighborhood" defaultValue={provider.neighborhood} className="h-12 rounded-[20px] border border-[color:var(--color-border)] bg-white px-4 text-sm outline-none" />
                </Field>
              </div>
              <Field label="Cancellation policy">
                <select name="cancellationPolicy" defaultValue={provider.cancellationPolicy} className="h-12 rounded-[20px] border border-[color:var(--color-border)] bg-white px-4 text-sm outline-none">
                  <option value="FLEXIBLE">Flexible</option>
                  <option value="STANDARD">Standard</option>
                  <option value="STRICT">Strict</option>
                </select>
              </Field>
              <div className="flex flex-wrap gap-4 text-sm text-[color:var(--color-ink)]">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" name="acceptsNewClients" defaultChecked={provider.acceptsNewClients} className="h-4 w-4 accent-[color:var(--color-accent-strong)]" />
                  Accepting new clients
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" name="isMobileService" defaultChecked={provider.isMobileService} className="h-4 w-4 accent-[color:var(--color-accent-strong)]" />
                  Mobile service
                </label>
              </div>
              <FormSubmitButton pendingLabel="Saving profile...">Save profile</FormSubmitButton>
            </form>
            <div className="grid gap-3">
              {provider.trustSignals.map((signal) => (
                <div key={signal.id} className="rounded-[20px] bg-[color:var(--color-surface-soft)] px-4 py-3 text-sm text-[color:var(--color-ink-muted)]">
                  <span className="font-medium text-[color:var(--color-ink)]">{signal.label}:</span> {signal.value}
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-6">
            <section className="rounded-[34px] border border-white/60 bg-white/90 p-6 shadow-[0_18px_40px_rgba(42,29,24,0.06)]">
              <h2 className="font-display text-4xl tracking-[-0.05em] text-[color:var(--color-ink)]">
                Add service
              </h2>
              <form action={addProviderServiceFormAction} className="mt-5 grid gap-4">
                <input type="hidden" name="providerId" value={provider.id} />
                <Field label="Category">
                  <select name="categoryId" className="h-12 rounded-[20px] border border-[color:var(--color-border)] bg-white px-4 text-sm outline-none">
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Service name">
                  <input name="name" className="h-12 rounded-[20px] border border-[color:var(--color-border)] bg-white px-4 text-sm outline-none" />
                </Field>
                <Field label="Description">
                  <textarea name="description" rows={3} className="rounded-[20px] border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm outline-none" />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Duration (min)">
                    <input name="durationMinutes" type="number" className="h-12 rounded-[20px] border border-[color:var(--color-border)] bg-white px-4 text-sm outline-none" />
                  </Field>
                  <Field label="Price (cents)">
                    <input name="priceCents" type="number" className="h-12 rounded-[20px] border border-[color:var(--color-border)] bg-white px-4 text-sm outline-none" />
                  </Field>
                </div>
                <FormSubmitButton pendingLabel="Adding service...">Add service</FormSubmitButton>
              </form>
            </section>

            <section className="rounded-[34px] border border-white/60 bg-white/90 p-6 shadow-[0_18px_40px_rgba(42,29,24,0.06)]">
              <h2 className="font-display text-4xl tracking-[-0.05em] text-[color:var(--color-ink)]">
                Add availability
              </h2>
              <form action={addAvailabilitySlotFormAction} className="mt-5 grid gap-4">
                <input type="hidden" name="providerId" value={provider.id} />
                <Field label="Service">
                  <select name="serviceId" className="h-12 rounded-[20px] border border-[color:var(--color-border)] bg-white px-4 text-sm outline-none">
                    {provider.services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Start time">
                  <input type="datetime-local" name="startsAt" className="h-12 rounded-[20px] border border-[color:var(--color-border)] bg-white px-4 text-sm outline-none" />
                </Field>
                <FormSubmitButton pendingLabel="Adding slot...">Add slot</FormSubmitButton>
              </form>
            </section>

            <ProviderPhotoUploader />
          </div>
        </div>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[34px] border border-white/60 bg-white/90 p-6 shadow-[0_18px_40px_rgba(42,29,24,0.06)]">
            <h2 className="font-display text-4xl tracking-[-0.05em] text-[color:var(--color-ink)]">Upcoming bookings</h2>
            <div className="mt-5 space-y-4">
              {upcomingBookings.length ? (
                upcomingBookings.map((booking) => (
                  <div key={booking.id} className="rounded-[22px] bg-[color:var(--color-surface-soft)] px-4 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-[color:var(--color-ink)]">{booking.user.firstName} {booking.user.lastName}</p>
                        <p className="text-sm text-[color:var(--color-ink-muted)]">{booking.service.name} • {formatDateTime(booking.appointmentStart)}</p>
                      </div>
                      <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--color-ink-muted)]">
                        {booking.status.toLowerCase()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState title="No upcoming bookings" description="New confirmed and rescheduled appointments will appear here for quick triage." />
              )}
            </div>
          </div>

          <div className="rounded-[34px] border border-white/60 bg-white/90 p-6 shadow-[0_18px_40px_rgba(42,29,24,0.06)]">
            <h2 className="font-display text-4xl tracking-[-0.05em] text-[color:var(--color-ink)]">Recent reviews</h2>
            <div className="mt-5 space-y-4">
              {provider.reviews.length ? provider.reviews.map((review) => (
                <div key={review.id} className="rounded-[22px] bg-[color:var(--color-surface-soft)] px-4 py-4">
                  <p className="font-medium text-[color:var(--color-ink)]">{review.title}</p>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--color-ink-muted)]">{review.body}</p>
                </div>
              )) : <EmptyState title="No reviews yet" description="Verified reviews will show here after completed bookings." />}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-[0_18px_40px_rgba(42,29,24,0.06)]">
      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[color:var(--color-ink-muted)]">{label}</p>
      <p className="mt-3 font-display text-4xl tracking-[-0.06em] text-[color:var(--color-ink)]">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--color-ink-muted)]">{label}</span>
      {children}
    </label>
  );
}
