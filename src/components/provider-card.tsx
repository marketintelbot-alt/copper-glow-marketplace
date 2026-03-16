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
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-[32px] border bg-[linear-gradient(180deg,rgba(255,251,253,0.94),rgba(244,234,240,0.96))] p-4 shadow-[0_18px_40px_rgba(102,54,72,0.08)] backdrop-blur-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_54px_rgba(102,54,72,0.12)]",
        provider.featuredLabel === "Premium"
          ? "border-[rgba(171,83,109,0.34)]"
          : provider.featuredLabel === "Spotlight"
            ? "border-[rgba(154,110,134,0.3)]"
            : "border-[color:var(--color-border)]"
      )}
    >
      <div className="pointer-events-none absolute inset-x-4 top-4 h-px bg-[linear-gradient(90deg,rgba(171,83,109,0),rgba(171,83,109,0.42),rgba(171,83,109,0))]" />
      <div
        className="relative flex min-h-[190px] flex-col justify-between overflow-hidden rounded-[26px] p-5 text-[color:var(--color-ink)]"
        style={{
          background: `linear-gradient(140deg, ${provider.photo?.gradientFrom ?? "#F2DCE4"}, ${provider.photo?.gradientTo ?? "#FFF6FA"})`,
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.42),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0))]" />
        <div className="flex items-start justify-between gap-4">
          <div className="relative z-10 space-y-2">
            <div
              className={cn(
                "inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em]",
                provider.featuredLabel === "Premium"
                  ? "border-[rgba(171,83,109,0.16)] bg-[rgba(255,241,246,0.84)] text-[color:var(--color-accent-strong)]"
                  : provider.featuredLabel === "Spotlight"
                    ? "border-[rgba(154,110,134,0.16)] bg-[rgba(247,239,243,0.82)] text-[color:var(--color-olive)]"
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
        <div className="relative z-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-[color:var(--color-ink-muted)]">
              Trust score
            </p>
            <div className="mt-2 flex items-end gap-2">
              <span className="font-display text-4xl tracking-[-0.06em]">{formatTrustScore(provider.trustScore)}</span>
              <span className="pb-1 text-sm text-[color:var(--color-ink-muted)]">/ 10</span>
            </div>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-[22px] border border-white/60 bg-white/58 text-base font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
            {getInitials(provider.name)}
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-2xl leading-tight tracking-[-0.05em] text-[color:var(--color-ink)]">
              {provider.name}
            </h3>
            <div className="inline-flex items-center gap-1 rounded-full bg-white/84 px-3 py-1 text-sm font-medium text-[color:var(--color-ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              <Star className="h-4 w-4 fill-current text-[color:var(--color-accent-strong)]" />
              {provider.rating.toFixed(1)}
            </div>
          </div>
          <p className="text-sm leading-7 text-[color:var(--color-ink-muted)]">{provider.shortDescription}</p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-medium text-[color:var(--color-ink-muted)]">
          {provider.categoryTags.map((category) => (
            <span
              key={category}
              className="rounded-full border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.66)] px-3 py-1"
            >
              {category}
            </span>
          ))}
        </div>

        <div className="grid gap-3 rounded-[24px] border border-white/65 bg-[rgba(255,255,255,0.52)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.76)] sm:grid-cols-2">
          <InfoRow icon={<Sparkles className="h-4 w-4" />} label="Starts at" value={formatCurrency(provider.startingPriceCents)} />
          <InfoRow icon={<ShieldCheck className="h-4 w-4" />} label="Reviews" value={`${provider.reviewCount} verified`} />
          <InfoRow icon={<MapPin className="h-4 w-4" />} label="Area" value={provider.approximateArea} />
          <InfoRow
            icon={<ArrowRight className="h-4 w-4" />}
            label="Next opening"
            value={provider.nextAvailability ? formatDateTime(provider.nextAvailability) : "Openings soon"}
          />
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-[rgba(82,55,44,0.08)] pt-3 text-sm text-[color:var(--color-ink-muted)]">
          <span>{formatDistanceMiles(provider.distanceMiles)}</span>
          <span>{provider.paymentModes.deposit ? "Deposit available" : "Full prepay"}</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Link href={`/providers/${provider.slug}`}>
            <Button tone="soft" className="px-4">
              View profile
            </Button>
          </Link>
          <Link href={`/book/${provider.slug}`}>
            <Button className="min-w-[132px]">
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
    <span className="rounded-full border border-white/60 bg-white/68 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-ink)]">
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
