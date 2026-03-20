import type { Metadata } from "next";
import {
  resolveDisputeFormAction,
  updateFeaturedPlacementFormAction,
  updateProviderStatusAction,
} from "@/actions";
import { BadgeCheck, BriefcaseBusiness, CalendarClock, CreditCard, ShieldCheck, Star, Wallet } from "lucide-react";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { requireAdmin } from "@/lib/auth";
import {
  formatCurrency,
  formatDateTime,
  formatPlan,
  formatProviderStatus,
  formatProviderType,
} from "@/lib/format";
import { getAdminDashboardData } from "@/lib/marketplace";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  await requireAdmin();
  const data = await getAdminDashboardData();

  return (
    <div className="container-shell section-space">
      <div className="space-y-8">
        <section className="rounded-[36px] border border-white/60 bg-white/90 p-6 shadow-[0_24px_56px_rgba(42,29,24,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--color-ink-muted)]">
            Admin dashboard
          </p>
          <h1 className="mt-3 font-display text-5xl tracking-[-0.06em] text-[color:var(--color-ink)]">
            Launch ops, moderation, and trust controls in one place.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-[color:var(--color-ink-muted)]">
            Review approvals, move providers through lifecycle states, monitor disputes, control featured
            placement, and manage expansion readiness without exposing unfinished inventory publicly.
          </p>
        </section>

        <div className="grid gap-4 md:grid-cols-5">
          <Metric label="Live providers" value={String(data.metrics.liveProviders)} />
          <Metric label="Pending approvals" value={String(data.metrics.pendingApprovals)} />
          <Metric label="Suspended" value={String(data.metrics.suspendedProviders)} />
          <Metric label="Open disputes" value={String(data.metrics.openDisputes)} />
          <Metric label="Upcoming bookings" value={String(data.metrics.upcomingBookings)} />
        </div>

        <section className="rounded-[34px] border border-white/60 bg-white/90 p-6 shadow-[0_18px_40px_rgba(42,29,24,0.06)]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-4xl tracking-[-0.05em] text-[color:var(--color-ink)]">
                Businesses and provider ops
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[color:var(--color-ink-muted)]">
                Review trust signals, listing quality, lifecycle stage, and featured placement readiness without
                digging through raw rows.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-surface-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--color-ink-muted)]">
              <BriefcaseBusiness className="h-4 w-4 text-[color:var(--color-accent-strong)]" />
              {data.providers.length} tracked providers
            </div>
          </div>
          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            {data.providers.map((provider) => (
              <ProviderOpsCard key={provider.id} provider={provider} />
            ))}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-[34px] border border-white/60 bg-white/90 p-6 shadow-[0_18px_40px_rgba(42,29,24,0.06)]">
            <h2 className="font-display text-4xl tracking-[-0.05em] text-[color:var(--color-ink)]">Featured placement</h2>
            <div className="mt-5 space-y-4">
              {data.providers
                .filter((provider) => provider.status === "LIVE")
                .slice(0, 6)
                .map((provider) => (
                  <form key={provider.id} action={updateFeaturedPlacementFormAction} className="rounded-[22px] bg-[color:var(--color-surface-soft)] p-4">
                    <input type="hidden" name="providerId" value={provider.id} />
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <p className="font-medium text-[color:var(--color-ink)]">{provider.name}</p>
                        <p className="text-sm text-[color:var(--color-ink-muted)]">Current placements: {provider.featuredPlacements.length}</p>
                      </div>
                      <input type="text" name="surface" defaultValue="HOMEPAGE_POPULAR" className="h-11 rounded-full border border-[color:var(--color-border)] bg-white px-4 text-sm outline-none" />
                      <input type="text" name="label" defaultValue="Popular in Launch Market" className="h-11 rounded-full border border-[color:var(--color-border)] bg-white px-4 text-sm outline-none" />
                    </div>
                    <label className="mt-3 inline-flex items-center gap-2 text-sm text-[color:var(--color-ink)]">
                      <input type="checkbox" name="active" defaultChecked className="h-4 w-4 accent-[color:var(--color-accent-strong)]" />
                      Keep active
                    </label>
                    <div className="mt-3">
                      <FormSubmitButton tone="secondary" pendingLabel="Updating...">
                        Save placement
                      </FormSubmitButton>
                    </div>
                  </form>
                ))}
            </div>
          </section>

          <section className="rounded-[34px] border border-white/60 bg-white/90 p-6 shadow-[0_18px_40px_rgba(42,29,24,0.06)]">
            <h2 className="font-display text-4xl tracking-[-0.05em] text-[color:var(--color-ink)]">Disputes and refunds</h2>
            <div className="mt-5 space-y-4">
              {data.disputes.map((dispute) => (
                <form key={dispute.id} action={resolveDisputeFormAction} className="rounded-[22px] bg-[color:var(--color-surface-soft)] p-4">
                  <input type="hidden" name="disputeId" value={dispute.id} />
                  <p className="font-medium text-[color:var(--color-ink)]">{dispute.booking.provider.name}</p>
                  <p className="mt-1 text-sm leading-7 text-[color:var(--color-ink-muted)]">
                    {dispute.reason}
                  </p>
                  <textarea name="resolutionSummary" rows={3} defaultValue={dispute.resolutionSummary ?? ""} className="mt-3 w-full rounded-[18px] border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm outline-none" />
                  <div className="mt-3">
                    <FormSubmitButton tone="secondary" pendingLabel="Resolving...">
                      Resolve dispute
                    </FormSubmitButton>
                  </div>
                </form>
              ))}
            </div>
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <DataColumn
            title="Applications"
            items={data.applications.map((application) => ({
              title: application.businessName,
              body: `${application.status.toLowerCase().replaceAll("_", " ")} • ${application.categoriesCsv} • ${application.cityArea}`,
            }))}
          />
          <DataColumn
            title="Claim requests"
            items={data.claims.map((claim) => ({
              title: claim.businessName,
              body: `${claim.status.toLowerCase().replaceAll("_", " ")} • ${claim.claimantName} • ${claim.claimantEmail}`,
            }))}
          />
          <DataColumn
            title="Outreach pipeline"
            items={data.outreach.map((lead) => ({
              title: lead.businessName,
              body: `${lead.status.toLowerCase().replaceAll("_", " ")} • ${lead.contactChannel} • ${lead.neighborhood}`,
            }))}
          />
        </div>

        <section className="rounded-[34px] border border-white/60 bg-white/90 p-6 shadow-[0_18px_40px_rgba(42,29,24,0.06)]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-4xl tracking-[-0.05em] text-[color:var(--color-ink)]">
                Recent bookings
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[color:var(--color-ink-muted)]">
                A cleaner operations feed for customer, provider, service, payment, and payout state at a glance.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-surface-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--color-ink-muted)]">
              <CalendarClock className="h-4 w-4 text-[color:var(--color-accent-strong)]" />
              {data.bookings.length} recent bookings
            </div>
          </div>
          <div className="mt-5 space-y-4">
            {data.bookings.map((booking) => (
              <BookingOpsCard key={booking.id} booking={booking} />
            ))}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <DataColumn
            title="Category management"
            items={data.categories.map((category) => ({
              title: category.name,
              body: category.isHighTier ? "High-tier business-only category." : "Open to businesses and verified independents.",
            }))}
          />
          <DataColumn
            title="Contact inbox"
            items={data.contacts.map((contact) => ({
              title: contact.name,
              body: `${contact.reason} • ${contact.email} • ${formatDateTime(contact.createdAt)}`,
            }))}
          />
        </div>
      </div>
    </div>
  );
}

function ProviderOpsCard({
  provider,
}: {
  provider: Awaited<ReturnType<typeof getAdminDashboardData>>["providers"][number];
}) {
  const categories = [...new Set(provider.services.map((service) => service.category.name))];

  return (
    <article
      className={`rounded-[26px] border p-5 shadow-[0_18px_40px_rgba(42,29,24,0.06)] ${
        provider.providerType === "VERIFIED_BUSINESS"
          ? "border-[rgba(171,83,109,0.18)] bg-[linear-gradient(180deg,rgba(255,248,251,0.96),rgba(247,232,239,0.94))]"
          : "border-white/60 bg-[color:var(--color-surface-soft)]"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-3xl tracking-[-0.05em] text-[color:var(--color-ink)]">
              {provider.name}
            </p>
            <StatusPill tone={provider.status === "LIVE" ? "success" : provider.status === "SUSPENDED" ? "danger" : "neutral"}>
              {formatProviderStatus(provider.status)}
            </StatusPill>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
            <MetaPill>{formatProviderType(provider.providerType)}</MetaPill>
            <MetaPill>{formatPlan(provider.plan)}</MetaPill>
            {provider.claimable ? <MetaPill>Claimable</MetaPill> : null}
          </div>
        </div>
        <div className="rounded-[22px] bg-white/80 px-4 py-3 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.78)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--color-ink-muted)]">
            Trust score
          </p>
          <p className="mt-2 font-display text-4xl tracking-[-0.05em] text-[color:var(--color-ink)]">
            {provider.trustScore.toFixed(1)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {categories.slice(0, 4).map((category) => (
          <span
            key={`${provider.id}-${category}`}
            className="rounded-full border border-white/60 bg-white/80 px-3 py-1 text-xs font-medium text-[color:var(--color-ink-muted)]"
          >
            {category}
          </span>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <OpsMetric
          icon={<BadgeCheck className="h-4 w-4" />}
          label="Reviews"
          value={`${provider.reviewAverage.toFixed(1)} avg · ${provider.reviewCount}`}
        />
        <OpsMetric
          icon={<ShieldCheck className="h-4 w-4" />}
          label="Signals"
          value={`${provider.trustSignals.length} tracked`}
        />
        <OpsMetric
          icon={<Star className="h-4 w-4" />}
          label="Featured"
          value={`${provider.featuredPlacements.length} active`}
        />
      </div>

      <form action={updateProviderStatusAction} className="mt-5 flex flex-col gap-3 lg:flex-row">
        <input type="hidden" name="providerId" value={provider.id} />
        <select
          name="status"
          defaultValue={provider.status}
          className="h-11 flex-1 rounded-full border border-[color:var(--color-border)] bg-white px-4 text-sm outline-none"
        >
          {["DRAFT", "PENDING_OUTREACH", "PENDING_APPROVAL", "APPROVED", "LIVE", "DECLINED", "SUSPENDED"].map((status) => (
            <option key={status} value={status}>
              {status.toLowerCase().replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <FormSubmitButton tone="secondary" pendingLabel="Saving..." className="lg:min-w-[132px]">
          Save status
        </FormSubmitButton>
      </form>
    </article>
  );
}

function BookingOpsCard({
  booking,
}: {
  booking: Awaited<ReturnType<typeof getAdminDashboardData>>["bookings"][number];
}) {
  const paymentRecord = booking.paymentRecords[0];

  return (
    <article className="rounded-[24px] border border-white/60 bg-[color:var(--color-surface-soft)] p-5 shadow-[0_18px_40px_rgba(42,29,24,0.05)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-2xl tracking-[-0.04em] text-[color:var(--color-ink)]">
              {booking.reference}
            </p>
            <StatusPill tone={booking.status === "COMPLETED" ? "success" : booking.status === "CANCELED" || booking.status === "DISPUTED" ? "danger" : "neutral"}>
              {formatEnumLabel(booking.status)}
            </StatusPill>
            <MetaPill>{booking.paymentOption === "DEPOSIT" ? "Deposit" : "Full prepay"}</MetaPill>
          </div>
          <p className="text-sm text-[color:var(--color-ink)]">
            {booking.provider.name} · {booking.service.name}
          </p>
          <p className="text-sm text-[color:var(--color-ink-muted)]">
            {booking.user.firstName} {booking.user.lastName} · {formatDateTime(booking.appointmentStart)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {paymentRecord ? (
            <StatusPill tone={paymentRecord.status === "RELEASED" || paymentRecord.status === "SUCCEEDED" ? "success" : paymentRecord.status === "FAILED" || paymentRecord.status === "REFUNDED" ? "danger" : "neutral"}>
              Payment {formatEnumLabel(paymentRecord.status)}
            </StatusPill>
          ) : null}
          {booking.payout ? (
            <StatusPill tone={booking.payout.status === "RELEASED" ? "success" : booking.payout.status === "WITHHELD" ? "danger" : "neutral"}>
              Payout {formatEnumLabel(booking.payout.status)}
            </StatusPill>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <OpsMetric
          icon={<CreditCard className="h-4 w-4" />}
          label="Charge now"
          value={formatCurrency(booking.chargeNowCents)}
        />
        <OpsMetric
          icon={<Wallet className="h-4 w-4" />}
          label="Total value"
          value={formatCurrency(booking.priceCents)}
        />
        <OpsMetric
          icon={<Wallet className="h-4 w-4" />}
          label="Provider payout"
          value={booking.payout ? formatCurrency(booking.payout.netAmountCents) : "Not scheduled"}
        />
        <OpsMetric
          icon={<CalendarClock className="h-4 w-4" />}
          label="Customer"
          value={`${booking.user.firstName} ${booking.user.lastName}`}
        />
      </div>
    </article>
  );
}

function OpsMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[20px] bg-white/82 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
      <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--color-ink-muted)]">
        {icon}
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-[color:var(--color-ink)]">{value}</p>
    </div>
  );
}

function MetaPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/60 bg-white/82 px-3 py-1 text-[11px] font-semibold text-[color:var(--color-ink-muted)]">
      {children}
    </span>
  );
}

function StatusPill({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "success" | "danger" | "neutral";
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${
        tone === "success"
          ? "bg-[rgba(92,145,117,0.14)] text-[rgb(58,108,80)]"
          : tone === "danger"
            ? "bg-[rgba(178,82,102,0.14)] text-[rgb(140,56,75)]"
            : "bg-white/82 text-[color:var(--color-ink-muted)]"
      }`}
    >
      {children}
    </span>
  );
}

function formatEnumLabel(value: string) {
  return value
    .split("_")
    .map((part) => `${part[0]}${part.slice(1).toLowerCase()}`)
    .join(" ");
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-[0_18px_40px_rgba(42,29,24,0.06)]">
      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[color:var(--color-ink-muted)]">{label}</p>
      <p className="mt-3 font-display text-4xl tracking-[-0.06em] text-[color:var(--color-ink)]">{value}</p>
    </div>
  );
}

function DataColumn({
  title,
  items,
}: {
  title: string;
  items: { title: string; body: string }[];
}) {
  return (
    <section className="rounded-[34px] border border-white/60 bg-white/90 p-6 shadow-[0_18px_40px_rgba(42,29,24,0.06)]">
      <h2 className="font-display text-4xl tracking-[-0.05em] text-[color:var(--color-ink)]">{title}</h2>
      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <div key={`${title}-${item.title}`} className="rounded-[22px] bg-[color:var(--color-surface-soft)] px-4 py-4">
            <p className="font-medium text-[color:var(--color-ink)]">{item.title}</p>
            <p className="mt-1 text-sm leading-7 text-[color:var(--color-ink-muted)]">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
