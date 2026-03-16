function SkeletonBlock({
  className,
}: {
  className: string;
}) {
  return <div className={`rounded-[28px] bg-white/75 ${className}`} />;
}

export function MarketplaceGridLoading() {
  return (
    <div className="container-shell section-space">
      <div className="animate-pulse space-y-8">
        <div className="space-y-3">
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="h-16 max-w-3xl" />
          <SkeletonBlock className="h-6 max-w-2xl" />
        </div>
        <SkeletonBlock className="h-28 w-full" />
        <SkeletonBlock className="h-28 w-full" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-[390px] w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProviderProfileLoading() {
  return (
    <div className="container-shell section-space">
      <div className="page-grid animate-pulse">
        <div className="space-y-6">
          <SkeletonBlock className="h-[360px] w-full rounded-[38px]" />
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-48 w-full rounded-[30px]" />
            ))}
          </div>
          <SkeletonBlock className="h-[420px] w-full rounded-[36px]" />
          <div className="grid gap-6 lg:grid-cols-2">
            <SkeletonBlock className="h-[360px] w-full rounded-[34px]" />
            <SkeletonBlock className="h-[360px] w-full rounded-[34px]" />
          </div>
        </div>
        <div className="space-y-5">
          <SkeletonBlock className="h-[460px] w-full rounded-[34px]" />
          <SkeletonBlock className="h-48 w-full rounded-[34px]" />
        </div>
      </div>
    </div>
  );
}

export function BookingPageLoading() {
  return (
    <div className="container-shell section-space">
      <div className="grid animate-pulse gap-6 lg:grid-cols-[1fr,0.92fr]">
        <div className="space-y-6">
          <SkeletonBlock className="h-52 w-full rounded-[36px]" />
          <SkeletonBlock className="h-[620px] w-full rounded-[34px]" />
        </div>
        <div className="space-y-5">
          <SkeletonBlock className="h-[320px] w-full rounded-[34px]" />
          <SkeletonBlock className="h-[260px] w-full rounded-[34px]" />
        </div>
      </div>
    </div>
  );
}

export function DashboardLoading({
  metricCount = 4,
  panelCount = 4,
}: {
  metricCount?: number;
  panelCount?: number;
}) {
  const metricGridClass =
    metricCount >= 4
      ? "grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      : metricCount === 3
        ? "grid gap-4 md:grid-cols-3"
        : metricCount === 2
          ? "grid gap-4 md:grid-cols-2"
          : "grid gap-4";

  return (
    <div className="container-shell section-space">
      <div className="animate-pulse space-y-8">
        <SkeletonBlock className="h-48 w-full rounded-[36px]" />
        {metricCount > 0 ? (
          <div className={metricGridClass}>
            {Array.from({ length: metricCount }).map((_, index) => (
              <SkeletonBlock key={index} className="h-32 w-full rounded-[28px]" />
            ))}
          </div>
        ) : null}
        <div className="grid gap-6 xl:grid-cols-2">
          {Array.from({ length: panelCount }).map((_, index) => (
            <SkeletonBlock key={index} className="h-[360px] w-full rounded-[34px]" />
          ))}
        </div>
      </div>
    </div>
  );
}
