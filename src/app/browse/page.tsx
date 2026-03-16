import { EmptyState } from "@/components/empty-state";
import { ProviderCard } from "@/components/provider-card";
import { SearchModule } from "@/components/search-module";
import { SectionHeading } from "@/components/section-heading";
import { getCurrentUser } from "@/lib/auth";
import { getBrowseData } from "@/lib/marketplace";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

type SearchParamValue = string | string[] | undefined;

function single(value: SearchParamValue) {
  return Array.isArray(value) ? value[0] : value;
}

function pickHiddenFields(
  filters: Record<string, string | undefined>,
  excluded: string[]
) {
  return Object.fromEntries(
    Object.entries(filters).filter(([key, value]) => !excluded.includes(key) && Boolean(value))
  );
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, SearchParamValue>>;
}) {
  const params = await searchParams;
  const viewer = await getCurrentUser();
  const data = await getBrowseData(
    {
      search: single(params.search),
      category: single(params.category),
      providerType: single(params.providerType),
      trustMin: single(params.trustMin),
      distanceMax: single(params.distanceMax),
      minPrice: single(params.minPrice),
      maxPrice: single(params.maxPrice),
      availabilityDate: single(params.availabilityDate),
      paymentType: single(params.paymentType),
      mobile: single(params.mobile),
      sort: single(params.sort),
    },
    viewer?.id
  );
  const hasActiveFilters = Object.values(data.filters).some((value) => Boolean(value));
  const searchHiddenValues = pickHiddenFields(data.filters, ["search", "category", "availabilityDate"]);
  const filterHiddenValues = pickHiddenFields(data.filters, [
    "sort",
    "providerType",
    "trustMin",
    "distanceMax",
    "minPrice",
    "maxPrice",
  ]);
  const quickFilters = [
    {
      label: "Top trust",
      active: data.filters.sort === "highest-trust" || data.filters.trustMin === "8.8",
      href: buildBrowseHref(data.filters, { sort: "highest-trust", trustMin: "8.8" }),
    },
    {
      label: "Under $60",
      active: data.filters.maxPrice === "60",
      href: buildBrowseHref(data.filters, { maxPrice: "60" }),
    },
    {
      label: "Within 2 mi",
      active: data.filters.distanceMax === "2",
      href: buildBrowseHref(data.filters, { distanceMax: "2" }),
    },
    {
      label: "Mobile service",
      active: data.filters.mobile === "yes",
      href: buildBrowseHref(data.filters, { mobile: "yes" }),
    },
    {
      label: "Deposit",
      active: data.filters.paymentType === "deposit",
      href: buildBrowseHref(data.filters, { paymentType: "deposit" }),
    },
    {
      label: "Soonest",
      active: data.filters.sort === "soonest-available",
      href: buildBrowseHref(data.filters, { sort: "soonest-available" }),
    },
  ];

  return (
    <div className="container-shell section-space">
      <div className="space-y-8">
        <SectionHeading
          eyebrow="Browse"
          title="Find the right provider for your timing, budget, and trust bar"
          description="Search ranking balances relevance, trust score, review quality, distance, price, and availability, with paid plans adding polish but not overpowering quality."
        />
        <SearchModule
          categories={data.categories}
          compact
          defaultValues={{
            search: data.filters.search,
            category: data.filters.category,
            availabilityDate: data.filters.availabilityDate,
          }}
          hiddenValues={searchHiddenValues}
        />

        <div className="sticky top-[78px] z-20 -mx-4 overflow-x-auto px-4 pb-1 md:static md:mx-0 md:px-0">
          <div className="inline-flex min-w-full gap-2 rounded-[24px] border border-white/60 bg-[rgba(252,246,248,0.92)] p-2 shadow-[0_18px_40px_rgba(102,54,72,0.06)] backdrop-blur-xl md:min-w-0 md:flex-wrap">
            {quickFilters.map((filter) => (
              <a
                key={filter.label}
                href={filter.href}
                className={cn(
                  "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition",
                  filter.active
                    ? "bg-[color:var(--color-accent-strong)] text-white shadow-[0_10px_24px_rgba(171,83,109,0.24)]"
                    : "bg-white/85 text-[color:var(--color-ink)] hover:bg-white"
                )}
              >
                {filter.label}
              </a>
            ))}
            {hasActiveFilters ? (
              <a
                href="/browse"
                className="whitespace-nowrap rounded-full border border-[color:var(--color-border)] bg-transparent px-4 py-2 text-sm font-medium text-[color:var(--color-ink-muted)] transition hover:bg-white/70"
              >
                Reset filters
              </a>
            ) : null}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/60 bg-white/88 p-5 shadow-[0_18px_40px_rgba(42,29,24,0.06)]">
          <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-5" action="/browse">
            {Object.entries(filterHiddenValues).map(([name, value]) =>
              value ? <input key={name} type="hidden" name={name} value={value} /> : null
            )}
            <FilterField label="Sort">
              <select name="sort" defaultValue={data.filters.sort ?? "best-match"} className="h-12 rounded-[20px] bg-[color:var(--color-surface-soft)] px-4 text-sm outline-none">
                <option value="best-match">Best Match</option>
                <option value="lowest-price">Lowest Price</option>
                <option value="highest-trust">Highest Trust</option>
                <option value="nearest">Nearest</option>
                <option value="soonest-available">Soonest Available</option>
              </select>
            </FilterField>
            <FilterField label="Provider type">
              <select name="providerType" defaultValue={data.filters.providerType ?? ""} className="h-12 rounded-[20px] bg-[color:var(--color-surface-soft)] px-4 text-sm outline-none">
                <option value="">All providers</option>
                <option value="business">Verified Business</option>
                <option value="independent">Verified Independent</option>
                <option value="mobile">Mobile Service</option>
              </select>
            </FilterField>
            <FilterField label="Min trust">
              <input name="trustMin" defaultValue={data.filters.trustMin ?? ""} placeholder="7.5" className="h-12 rounded-[20px] bg-[color:var(--color-surface-soft)] px-4 text-sm outline-none" />
            </FilterField>
            <FilterField label="Max distance">
              <input name="distanceMax" defaultValue={data.filters.distanceMax ?? ""} placeholder="5" className="h-12 rounded-[20px] bg-[color:var(--color-surface-soft)] px-4 text-sm outline-none" />
            </FilterField>
            <FilterField label="Price ceiling">
              <input name="maxPrice" defaultValue={data.filters.maxPrice ?? ""} placeholder="120" className="h-12 rounded-[20px] bg-[color:var(--color-surface-soft)] px-4 text-sm outline-none" />
            </FilterField>
            <div className="md:col-span-2 xl:col-span-5 flex justify-end">
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[rgba(171,83,109,0.2)] bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-strong))] px-5 text-sm font-medium text-white shadow-[0_18px_34px_rgba(171,83,109,0.24)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_42px_rgba(171,83,109,0.32)]"
              >
                Apply filters
              </button>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-[color:var(--color-ink-muted)]">
            {data.total} providers match your current filters.
          </p>
          <p className="text-xs uppercase tracking-[0.26em] text-[color:var(--color-ink-subtle)]">
            {siteConfig.launchMarket.footerLabel}
          </p>
        </div>

        {data.results.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.results.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No providers match that exact combination yet"
            description="Try widening the price range, lowering the trust minimum slightly, or removing the availability date to see more near-campus options."
          />
        )}
      </div>
    </div>
  );
}

function buildBrowseHref(
  filters: Record<string, string | undefined>,
  overrides: Record<string, string | undefined>
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries({ ...filters, ...overrides })) {
    if (value) {
      params.set(key, value);
    }
  }

  const query = params.toString();
  return query ? `/browse?${query}` : "/browse";
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--color-ink-muted)]">
        {label}
      </span>
      {children}
    </label>
  );
}
