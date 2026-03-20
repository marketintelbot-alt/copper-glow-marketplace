import Link from "next/link";
import { ArrowRight, CalendarClock, ShieldCheck, Sparkles } from "lucide-react";
import { ProviderCard } from "@/components/provider-card";
import { Reveal } from "@/components/reveal";
import { SearchModule } from "@/components/search-module";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { getHomepageData } from "@/lib/marketplace";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

const categorySpanClasses = [
  "xl:col-span-2",
  "",
  "",
  "",
  "xl:col-span-2",
  "",
  "",
  "",
  "",
];

export default async function HomePage() {
  const viewer = await getCurrentUser();
  const data = await getHomepageData(viewer?.id);

  const trustNotes = [
    "Approval gating before launch",
    "Visible trust score signals",
    "Approximate areas before booking",
  ];
  const heroPillars = ["Verified businesses", "Verified independents", "Mobile providers"];
  const homepageLanes = [
    {
      eyebrow: "Popular in the launch market",
      title: "Providers students are booking right now",
      description: "Strong repeat demand, polished profiles, and campus-friendly timing make these feel alive.",
      providers: data.sections.popular,
      tone: "soft" as const,
      note: "Most booked right now",
    },
    {
      eyebrow: "Student Favorites",
      title: "High-repeat bookings with standout reviews",
      description: "Trusted providers students keep coming back to for events, weekends, internships, and everyday upkeep.",
      providers: data.sections.studentFavorites,
      tone: "ivory" as const,
      note: "High repeat demand",
    },
    {
      eyebrow: "Affordable Picks",
      title: "Strong quality without the premium price tag",
      description: "Budget-aware appointments that still show healthy trust signals and clean booking policies.",
      providers: data.sections.affordable,
      tone: "soft" as const,
      note: "Budget-aware without compromise",
    },
    {
      eyebrow: "Top Trusted Providers",
      title: "The highest-trust profiles in the launch market",
      description: "Verification, reliability, completion history, and repeat demand all matter here.",
      providers: data.sections.trusted,
      tone: "deep" as const,
      note: "Highest signal strength",
    },
    {
      eyebrow: "Last-Minute Availability",
      title: "Openings you can still grab this week",
      description: "Useful when you want something polished quickly without lowering your standards.",
      providers: data.sections.lastMinute,
      tone: "ivory" as const,
      note: "Near-term openings",
    },
  ];

  return (
    <>
      <section className="container-shell section-space pt-8">
        <div className="grid gap-8 lg:grid-cols-[1.05fr,0.95fr] lg:items-center">
          <Reveal className="space-y-7">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/78 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--color-ink-muted)] shadow-[0_14px_30px_rgba(45,33,29,0.08)]">
              <ShieldCheck className="h-4 w-4 text-[color:var(--color-accent-strong)]" />
              {siteConfig.launchMarket.badge}
            </p>
            <div className="max-w-3xl space-y-5">
              <h1 className="font-display text-5xl leading-[0.92] tracking-[-0.08em] text-[color:var(--color-ink)] sm:text-6xl lg:text-[5.35rem]">
                Trust-first beauty bookings with a softer, more premium feel.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[color:var(--color-ink-muted)] sm:text-lg">
                Aurelle is a beauty and self-care marketplace designed to launch market by market.
                We are opening first around {siteConfig.launchMarket.name}, with verified businesses,
                verified independents, and polished mobile providers supported by clear trust signals,
                clean payment choices, and booking flows that feel calm instead of chaotic.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {heroPillars.map((pillar, index) => (
                <span
                  key={pillar}
                  className={cn(
                    "rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] shadow-[0_12px_24px_rgba(102,54,72,0.08)]",
                    index === 1
                      ? "border-[rgba(221,181,139,0.22)] bg-[rgba(255,248,243,0.76)] text-[color:var(--color-ink-muted)]"
                      : "border-white/70 bg-white/72 text-[color:var(--color-ink-muted)]"
                  )}
                >
                  {pillar}
                </span>
              ))}
            </div>
            <SearchModule categories={data.categories} />
            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard label="Live providers" value={`${data.stats.liveProviders}+`} detail="Only approved and live providers appear publicly." />
              <MetricCard label="Average trust score" value={data.stats.averageTrust} detail="Trust ranking blends verification, reviews, reliability, and repeat bookings." />
              <MetricCard label="Tracked bookings" value={`${data.stats.completedBookings}+`} detail="Historic completed bookings help keep quality signals grounded." />
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr),430px]">
              <div className="relative min-h-[360px] overflow-hidden rounded-[44px] border border-[rgba(255,250,247,0.82)] bg-[linear-gradient(180deg,rgba(255,249,246,0.94),rgba(249,240,236,0.92))] shadow-[0_30px_80px_rgba(42,29,24,0.1)] lg:min-h-[520px]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.42),transparent_34%),radial-gradient(circle_at_85%_18%,rgba(171,83,109,0.08),transparent_22%)]" />
                <div className="absolute left-6 top-6 flex max-w-[320px] flex-wrap gap-3">
                  <span className="rounded-full border border-white/70 bg-white/76 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--color-ink-muted)] shadow-[0_14px_30px_rgba(102,54,72,0.08)]">
                    Approximate areas only
                  </span>
                  <span className="rounded-full border border-white/70 bg-white/76 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--color-ink-muted)] shadow-[0_14px_30px_rgba(102,54,72,0.08)]">
                    Launch-market approved
                  </span>
                </div>
                <div className="absolute right-6 top-6 hidden rounded-[28px] border border-white/70 bg-white/70 px-5 py-4 shadow-[0_18px_40px_rgba(102,54,72,0.08)] lg:block">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[color:var(--color-ink-muted)]">
                    Launch radius
                  </p>
                  <p className="mt-2 font-display text-3xl tracking-[-0.05em] text-[color:var(--color-ink)]">
                    Campus-led
                  </p>
                  <p className="mt-2 max-w-[180px] text-sm leading-6 text-[color:var(--color-ink-muted)]">
                    Discovery starts where trust signals and convenience overlap.
                  </p>
                </div>
                <div className="absolute bottom-6 left-6 max-w-[320px] rounded-[30px] border border-white/70 bg-white/88 p-5 shadow-[0_24px_60px_rgba(42,29,24,0.12)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--color-ink-muted)]">
                    Privacy-first booking
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--color-ink-muted)]">
                    Home-based independents never show exact addresses before confirmation, so trust and
                    personal safety stay aligned.
                  </p>
                </div>
                <div className="absolute bottom-6 right-6 hidden max-w-[240px] rounded-[26px] border border-white/70 bg-white/72 p-4 shadow-[0_18px_44px_rgba(102,54,72,0.09)] xl:block">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--color-accent-strong)]">
                    Calm checkout
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--color-ink-muted)]">
                    Deposits and full prepay are shown clearly before confirmation, without surprise math.
                  </p>
                </div>
              </div>

              <div className="section-band section-band--soft rounded-[36px] p-6 backdrop-blur-xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[color:var(--color-ink-muted)]">
                  Market pulse
                </p>
                <h2 className="mt-4 font-display text-4xl leading-[0.98] tracking-[-0.06em] text-[color:var(--color-ink)]">
                  Built to feel premium before a single booking leaves the platform.
                </h2>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <MiniPanel label="Approval gating" value="Always on" tone="primary" />
                  <MiniPanel label="Trust visibility" value="Public" tone="secondary" />
                  <MiniPanel label="Address privacy" value="Protected" tone="secondary" />
                  <MiniPanel label="Payment clarity" value="Upfront" tone="primary" />
                </div>

                <div className="mt-6 rounded-[28px] bg-[rgba(171,83,109,0.12)] p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--color-accent-strong)]">
                    Real booking signals
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--color-ink-muted)]">
                    Repeat rate, cancellations, and completed bookings all shape ranking instead of paid
                    placement taking over the marketplace.
                  </p>
                </div>

                <div className="mt-4 rounded-[28px] bg-[linear-gradient(180deg,rgba(45,25,31,0.98),rgba(33,19,24,0.96))] p-5 text-[rgba(251,242,235,0.92)]">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[rgba(251,242,235,0.58)]">
                    Why it feels different
                  </p>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-[rgba(251,242,235,0.82)]">
                    {trustNotes.map((note) => (
                      <li key={note} className="flex items-center gap-3">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[color:var(--color-blush-soft)]">
                          <Sparkles className="h-4 w-4" />
                        </span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container-shell section-space">
        <Reveal>
          <div className="section-band section-band--soft rounded-[42px] p-6 lg:p-8">
            <div className="mb-8 flex items-end justify-between gap-6">
              <SectionHeading
                eyebrow="Launch categories"
                title="A more considered way to browse the market"
                description="The first market opens with service lanes that feel curated and visual, not like a generic directory grid."
              />
              <div className="hidden max-w-[240px] space-y-3 lg:block">
                <span className="inline-flex rounded-full border border-[rgba(221,181,139,0.22)] bg-[rgba(255,248,243,0.84)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[color:var(--color-ink-muted)]">
                  {data.categories.length} categories live
                </span>
                <p className="text-sm leading-7 text-[color:var(--color-ink-muted)]">
                  Browse by service lane, not a generic directory menu.
                </p>
              </div>
            </div>
            <div className="grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-4">
              {data.categories.slice(0, 9).map((category, index) => (
                <Reveal key={category.id} delay={index * 40} className={categorySpanClasses[index]}>
                  <Link
                    href={`/browse?category=${category.slug}`}
                    className="group relative block h-full overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,250,252,0.92),rgba(245,236,239,0.94))] p-6 shadow-[0_18px_40px_rgba(42,29,24,0.06)] transition hover:-translate-y-1.5 hover:shadow-[0_28px_56px_rgba(42,29,24,0.1)]"
                  >
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.44),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(171,83,109,0.08),transparent_28%)] opacity-0 transition duration-300 group-hover:opacity-100" />
                    <div className="relative flex items-start justify-between gap-4">
                      <div
                        className={cn(
                          "inline-flex h-12 w-12 items-center justify-center rounded-[18px] font-display text-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]",
                          index % 3 === 0
                            ? "bg-[rgba(171,83,109,0.12)] text-[color:var(--color-accent-strong)]"
                            : "bg-[rgba(154,110,134,0.12)] text-[color:var(--color-olive)]"
                        )}
                      >
                        {category.name.charAt(0)}
                      </div>
                      <span className="rounded-full bg-white/74 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[color:var(--color-ink-muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.78)]">
                        Launch lane
                      </span>
                    </div>
                    <h3 className="relative mt-5 font-display text-3xl tracking-[-0.06em] text-[color:var(--color-ink)]">
                      {category.name}
                    </h3>
                    <p className="relative mt-3 max-w-xl text-sm leading-7 text-[color:var(--color-ink-muted)]">
                      {category.description}
                    </p>
                    <div className="relative mt-6 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--color-accent-strong)]">
                      Browse {category.name.toLowerCase()}
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {homepageLanes.map((lane) => (
        <HomepageSection
          key={lane.eyebrow}
          eyebrow={lane.eyebrow}
          title={lane.title}
          description={lane.description}
          providers={lane.providers}
          tone={lane.tone}
          note={lane.note}
        />
      ))}

      <section className="container-shell section-space">
        <Reveal>
          <div className="section-band section-band--ivory rounded-[38px] p-6 lg:p-8">
            <div className="grid gap-10 lg:grid-cols-[0.95fr,1.05fr]">
              <div className="space-y-5">
                <SectionHeading
                  eyebrow="Trust explainer"
                  title="Designed to reward quality, not just paid placement"
                  description="Spotlight and Premium plans can improve presentation and eligibility, but trust, reviews, reliability, and relevance still shape ranking. Lower-trust listings cannot simply buy their way to the top."
                />
                <Link href="/trust">
                  <Button tone="secondary">See how trust scoring works</Button>
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <TrustCard
                  icon={<ShieldCheck className="h-5 w-5" />}
                  title="Verified identity"
                  body="Every live provider completes identity and business checks before public launch."
                />
                <TrustCard
                  icon={<Sparkles className="h-5 w-5" />}
                  title="Portfolio reviewed"
                  body="Launch listings are reviewed for quality, consistency, and service clarity."
                />
                <TrustCard
                  icon={<CalendarClock className="h-5 w-5" />}
                  title="Reliable booking data"
                  body="Completed bookings, cancellations, and repeat behavior all inform trust signals."
                />
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="container-shell section-space">
        <Reveal>
          <div className="section-band section-band--soft rounded-[40px] px-6 py-10 lg:px-10">
            <div className="grid gap-8 lg:grid-cols-[1fr,0.9fr] lg:items-center">
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--color-ink-muted)]">
                  Offer services?
                </p>
                <h2 className="font-display text-4xl tracking-[-0.06em] text-[color:var(--color-ink)]">
                  Apply with a profile that already feels premium the day it goes live.
                </h2>
                <p className="max-w-2xl text-sm leading-8 text-[color:var(--color-ink-muted)]">
                  Verified Businesses, Verified Independents, and polished mobile providers can apply
                  now. The product is already structured so quality stays visible as the marketplace
                  grows into new neighborhoods and future schools.
                </p>
              </div>
              <div className="rounded-[32px] bg-[linear-gradient(180deg,rgba(45,25,31,0.98),rgba(33,19,24,0.96))] p-6 text-[rgba(251,242,235,0.9)]">
                <div className="space-y-3 text-sm leading-7 text-[rgba(251,242,235,0.78)]">
                  <p>Basic starts free with booking access, calendar management, payout tracking UI, and review collection.</p>
                  <p>Spotlight and Premium unlock richer presentation, analytics, and stronger feature eligibility.</p>
                  <p>Higher-tier services like advanced facials, med spa, and injectables remain business-only.</p>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/providers/apply">
                    <Button>Apply now</Button>
                  </Link>
                  <Link href="/provider/pricing">
                    <Button tone="secondary">See provider plans</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function HomepageSection({
  eyebrow,
  title,
  description,
  providers,
  tone,
  note,
}: {
  eyebrow: string;
  title: string;
  description: string;
  providers: Awaited<ReturnType<typeof getHomepageData>>["sections"]["popular"];
  tone: "soft" | "ivory" | "deep";
  note: string;
}) {
  return (
    <Reveal>
      <section className="container-shell section-space">
        <div
          className={cn(
            "section-band rounded-[42px] p-6 lg:p-8",
            tone === "soft" && "section-band--soft",
            tone === "ivory" && "section-band--ivory",
            tone === "deep" && "section-band--deep"
          )}
        >
          <div className="mb-8 flex items-end justify-between gap-4">
            <div className="space-y-4">
              <SectionHeading
                eyebrow={eyebrow}
                title={title}
                description={description}
                tone={tone === "deep" ? "light" : "default"}
              />
              <span
                className={cn(
                  "inline-flex rounded-full px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.24em]",
                  tone === "deep"
                    ? "border border-white/10 bg-white/6 text-[rgba(255,243,247,0.72)]"
                    : "border border-white/68 bg-white/72 text-[color:var(--color-ink-muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.78)]"
                )}
              >
                {note}
              </span>
            </div>
            <Link
              href="/browse"
              className={cn(
                "hidden items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition lg:inline-flex",
                tone === "deep"
                  ? "border-white/10 bg-white/6 text-[rgba(255,243,247,0.86)] hover:bg-white/10"
                  : "border-white/70 bg-white/72 text-[color:var(--color-accent-strong)] hover:bg-white"
              )}
            >
              Explore all providers
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="snap-strip hide-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:overflow-visible md:px-0 md:pb-0 md:grid-cols-2 xl:grid-cols-4">
            {providers.map((provider, index) => (
              <Reveal key={provider.id} delay={index * 45} className="min-w-[84vw] sm:min-w-[430px] md:min-w-0">
                <ProviderCard provider={provider} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </Reveal>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="section-band section-band--soft rounded-[28px] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--color-ink-muted)]">
        {label}
      </p>
      <p className="mt-3 font-display text-4xl tracking-[-0.06em] text-[color:var(--color-ink)]">{value}</p>
      <p className="mt-2 text-sm leading-7 text-[color:var(--color-ink-muted)]">{detail}</p>
    </div>
  );
}

function TrustCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/72 bg-white/68 p-5 shadow-[0_18px_32px_rgba(102,54,72,0.05),inset_0_1px_0_rgba(255,255,255,0.74)]">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-[18px] bg-[rgba(171,83,109,0.12)] text-[color:var(--color-accent-strong)]">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold text-[color:var(--color-ink)]">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-[color:var(--color-ink-muted)]">{body}</p>
    </div>
  );
}

function MiniPanel({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "primary" | "secondary";
}) {
  return (
    <div
      className={cn(
        "rounded-[24px] p-4 shadow-[0_14px_28px_rgba(102,54,72,0.06),inset_0_1px_0_rgba(255,255,255,0.75)]",
        tone === "primary"
          ? "bg-[linear-gradient(180deg,rgba(171,83,109,0.16),rgba(171,83,109,0.1))]"
          : "bg-[linear-gradient(180deg,rgba(154,110,134,0.16),rgba(154,110,134,0.1))]"
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--color-ink-muted)]">
        {label}
      </p>
      <p className="mt-3 font-display text-3xl tracking-[-0.05em] text-[color:var(--color-ink)]">{value}</p>
    </div>
  );
}
