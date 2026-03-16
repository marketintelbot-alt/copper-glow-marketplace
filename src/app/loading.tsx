export default function Loading() {
  return (
    <div className="container-shell section-space">
      <div className="animate-pulse space-y-6">
        <div className="h-16 rounded-[28px] bg-white/70" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-[360px] rounded-[30px] bg-white/70" />
          ))}
        </div>
      </div>
    </div>
  );
}
