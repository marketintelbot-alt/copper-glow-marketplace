type Props = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeading({ eyebrow, title, description, align = "left" }: Props) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.34em] text-[color:var(--color-ink-muted)]">
        <span className="h-px w-8 bg-[rgba(171,83,109,0.32)]" />
        {eyebrow}
      </p>
      <h2 className="mt-4 font-display text-3xl leading-[0.98] tracking-[-0.06em] text-[color:var(--color-ink)] sm:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-sm leading-8 text-[color:var(--color-ink-muted)] sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
