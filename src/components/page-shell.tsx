type Props = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function PageShell({ eyebrow, title, description, children }: Props) {
  return (
    <div className="container-shell section-space">
      <div className="space-y-8">
        <section className="rounded-[36px] border border-white/60 bg-white/90 p-6 shadow-[0_24px_56px_rgba(42,29,24,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--color-ink-muted)]">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-display text-5xl tracking-[-0.06em] text-[color:var(--color-ink)]">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-[color:var(--color-ink-muted)]">
            {description}
          </p>
        </section>
        {children}
      </div>
    </div>
  );
}
