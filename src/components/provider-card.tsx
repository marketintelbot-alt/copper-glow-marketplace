import Link from "next/link";
import { ArrowRight, MapPin, ShieldCheck, Sparkles, Star } from "lucide-react";
import { FavoriteButton } from "@/components/favorite-button";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime, formatDistanceMiles, formatTrustScore } from "@/lib/format";
import type { ProviderCard as ProviderCardType } from "@/lib/marketplace";
import { cn, getInitials } from "@/lib/utils";

type Props = {
  provider: ProviderCardType;
};

export function ProviderCard({ provider }: Props) {
  const featuredSignals = provider.trustSignals.slice(0, 2);
  const ratingLabel = provider.reviewCount ? provider.rating.toFixed(1) : "New";

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-[34px] border bg-[linear-gradient(180deg,rgba(255,251,253,0.96),rgba(244,234,240,0.98))] p-4 shadow-[0_22px_52px_rgba(102,54,72,0.08)] backdrop-blur-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_34px_64px_rgba(102,54,72,0.14)]",
        provider.featuredLabel === "Premium"
          ? "border-[rgba(171,83,109,0.34)]"
          : provider.featuredLabel === "Spotlight"
            ? "border-[rgba(154,110,134,0.3)]"
            : "border-[color:var(--color-border)]"
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.46),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(215,133,152,0.1),transparent_34%)] opacity-0 transition duration-300 group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-x-4 top-4 h-px bg-[linear-gradient(90deg,rgba(171,83,109,0),rgba(171,83,109,0.42),rgba(171,83,109,0))]" />
      <div
        className="relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-[28px] p-5 text-[color:var(--color-ink)]"
        style={{
          background: `linear-gradient(140deg, ${provider.photo?.gradientFrom ?? "#F2DCE4"}, ${provider.photo?.gradientTo ?? "#FFF6FA"})`,
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.42),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0))]" />
        <div className="pointer-events-none absolute -right-10 top-6 h-32 w-32 rounded-full bg-white/18 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-5 top-5 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.72),rgba(255,255,255,0))]" />
        <div className="flex items-start justify-between gap-4">
          <div className="relative z-10 space-y-2">
            <div
              className={cn(
                "inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em]",
                provider.featuredLabel === "Premium"
                  ? "border-[rgba(171,83,109,0.16)] bg-[rgba(255,241,246,0.88)] text-[color:var(--color-accent-strong)]"
                  : provider.featuredLabel === "Spotlight"
                    ? "border-[rgba(154,110,134,0.16)] bg-[rgba(247,239,243,0.86)] text-[color:var(--color-olive)]"
                    : "border-[rgba(34,24,21,0.08)] bg-white/72 text-[color:var(--color-ink-muted)]"
              )}
            >
              {provider.featuredLabel}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>{provider.badge}</Badge>
              {provider.isMobileService ? <Badge>Mobile Service</Badge> : null}
            </div>
          </div>
          <div className="relative z-10">
            <FavoriteButton providerId={provider.id} initialSaved={provider.saved} />
          </div>
        </div>
        <div className="relative z-10 grid gap-4 sm:grid-cols-[1fr,auto] sm:items-end">
          <div className="flex flex-wrap gap-2">
            {featuredSignals.map((signal) => (
              <SignalChip key={signal.id}>
                {signal.label}
              </SignalChip>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-[24px] border border-white/55 bg-white/22 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[color:var(--color-ink-muted)]">
                Trust score
              </p>
              <div className="mt-2 flex items-end gap-2">
                <span className="font-display text-4xl tracking-[-0.06em]">{formatTrustScore(provider.trustScore)}</span>
                <span className="pb-1 text-sm text-[color:var(--color-ink-muted)]">/ 10</span>
              </div>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-[24px] border border-white/56 bg-white/34 text-base font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-sm">
              {getInitials(provider.name)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-[2rem] leading-tight tracking-[-0.05em] text-[color:var(--color-ink)]">
                {provider.name}
              </h3>
              <p className="mt-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-[color:var(--color-ink-muted)]">
                <MapPin className="h-3.5 w-3.5" />
                {provider.approximateArea}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/72 bg-white/84 px-3 py-1.5 text-sm font-medium text-[color:var(--color-ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              <Star className="h-4 w-4 fill-current text-[color:var(--color-accent-strong)]" />
              {ratingLabel}
              <span className="text-[color:var(--color-ink-muted)]">({provider.reviewCount})</span>
            </div>
          </div>
          <p className="text-sm leading-7 text-[color:var(--color-ink-muted)]">{provider.shortDescription}</p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-medium text-[color:var(--color-ink-muted)]">
          {provider.categoryTags.map((category) => (
            <span
              key={category}
              className="rounded-full border border-[rgba(97,58,69,0.12)] bg-[rgba(255,255,255,0.72)] px-3 py-1.5"
            >
              {category}
            </span>
          ))}
        </div>

        <div className="grid gap-3 rounded-[26px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(249,240,244,0.78))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] sm:grid-cols-2">
          <InfoRow icon={<Sparkles className="h-4 w-4" />} label="Starts at" value={formatCurrency(provider.startingPriceCents)} />
          <InfoRow icon={<ShieldCheck className="h-4 w-4" />} label="Reviews" value={`${provider.reviewCount} verified`} />
          <InfoRow icon={<MapPin className="h-4 w-4" />} label="Area" value={provider.approximateArea} />
          <InfoRow
            icon={<ArrowRight className="h-4 w-4" />}
            label="Next opening"
            value={provider.nextAvailability ? formatDateTime(provider.nextAvailability) : "Openings soon"}
          />
        </div>

        <div className="flex flex-wrap gap-2 border-t border-[rgba(82,55,44,0.08)] pt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-ink-muted)]">
          <StatusPill>{formatDistanceMiles(provider.distanceMiles)}</StatusPill>
          <StatusPill>{provider.paymentModes.deposit ? "Deposit available" : "Full prepay"}</StatusPill>
          {provider.isMobileService ? <StatusPill>Mobile option</StatusPill> : null}
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/providers/${provider.slug}`} className="flex-1">
            <Button tone="secondary" className="w-full px-4">
              View profile
            </Button>
          </Link>
          <Link href={`/book/${provider.slug}`} className="flex-1">
            <Button className="w-full min-w-0">
              Book now
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/60 bg-white/72 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.78)]">
      {children}
    </span>
  );
}

function SignalChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/48 bg-white/22 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-ink)] backdrop-blur-sm">
      {children}
    </span>
  );
}

function StatusPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[rgba(97,58,69,0.12)] bg-[rgba(255,255,255,0.62)] px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
      {children}
    </span>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[color:var(--color-ink-subtle)]">
        {icon}
        {label}
      </div>
      <p className="text-sm font-medium text-[color:var(--color-ink)]">{value}</p>
    </div>
  );
}
