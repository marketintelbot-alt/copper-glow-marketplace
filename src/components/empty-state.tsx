type Props = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: Props) {
  return (
    <div className="rounded-[28px] border border-dashed border-[color:var(--color-border-strong)] bg-[rgba(255,255,255,0.6)] px-6 py-10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
      <p className="font-display text-2xl tracking-[-0.04em] text-[color:var(--color-ink)]">{title}</p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[color:var(--color-ink-muted)]">
        {description}
      </p>
    </div>
  );
}
