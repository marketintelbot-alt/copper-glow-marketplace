import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Category = {
  slug: string;
  name: string;
};

type Props = {
  categories: Category[];
  compact?: boolean;
  defaultValues?: {
    search?: string;
    category?: string;
    availabilityDate?: string;
  };
  hiddenValues?: Record<string, string | undefined>;
};

export function SearchModule({ categories, compact = false, defaultValues, hiddenValues }: Props) {
  const selectedCategory = defaultValues?.category ?? "";
  const categoryOptions = [{ slug: "", name: "All categories" }, ...categories];

  return (
    <form
      action="/browse"
      className={compact ? "editorial-card grid gap-3 rounded-[28px] p-4 md:grid-cols-[1.4fr,1fr,1fr,auto]" : "editorial-card grid gap-3 rounded-[34px] p-4 md:grid-cols-[1.6fr,1fr,1fr,auto]"}
    >
      {Object.entries(hiddenValues ?? {}).map(([name, value]) =>
        value ? <input key={name} type="hidden" name={name} value={value} /> : null
      )}
      <Field label="What are you booking?" className="md:col-span-2">
        <div className="flex items-center gap-3 rounded-[22px] border border-white/70 bg-white/72 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.78)]">
          <Search className="h-4 w-4 text-[color:var(--color-ink-muted)]" />
          <input
            name="search"
            placeholder="Hair, lashes, spray tan..."
            defaultValue={defaultValues?.search ?? ""}
            className="w-full bg-transparent text-sm text-[color:var(--color-ink)] outline-none placeholder:text-[color:var(--color-ink-subtle)]"
          />
        </div>
      </Field>
      <Field label="Date" className="order-3 md:order-2">
        <input
          type="date"
          name="availabilityDate"
          defaultValue={defaultValues?.availabilityDate ?? ""}
          className="h-[50px] rounded-[22px] border border-white/70 bg-white/72 px-4 text-sm text-[color:var(--color-ink)] outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.78)]"
        />
      </Field>
      <div className="order-4 flex items-end md:order-3">
        <Button type="submit" size="lg" className="w-full md:min-w-[164px]">
          Search
        </Button>
      </div>
      <fieldset className="order-2 md:order-4 md:col-span-4">
        <legend className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--color-ink-muted)]">
          Category
        </legend>
        <div className="flex flex-wrap gap-2">
          {categoryOptions.map((category) => {
            const checked = selectedCategory === category.slug;

            return (
              <label key={category.slug || "all"} className="cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value={category.slug}
                  defaultChecked={checked}
                  className="peer sr-only"
                />
                <span
                  className={cn(
                    "inline-flex min-h-10 items-center justify-center rounded-full border px-4 py-2 text-sm font-medium transition duration-200",
                    "border-white/70 bg-white/76 text-[color:var(--color-ink-muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] hover:-translate-y-0.5 hover:bg-white/92",
                    "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[color:var(--color-accent-strong)]",
                    "peer-checked:border-[rgba(171,83,109,0.24)] peer-checked:bg-[linear-gradient(135deg,rgba(213,126,152,0.2),rgba(171,83,109,0.24))] peer-checked:text-[color:var(--color-accent-strong)] peer-checked:shadow-[0_16px_32px_rgba(171,83,109,0.16)]",
                    compact ? "px-3.5 py-2 text-xs sm:text-sm" : "px-4 py-2.5"
                  )}
                >
                  {category.name}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
      {!compact ? (
        <div className="md:col-span-4">
          <div className="flex flex-wrap gap-2 pt-2 text-xs text-[color:var(--color-ink-muted)]">
            <span className="rounded-full bg-white/70 px-3 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.76)]">Trust-first ranking</span>
            <span className="rounded-full bg-white/70 px-3 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.76)]">Deposit and full prepay options</span>
            <span className="rounded-full bg-white/70 px-3 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.76)]">Approximate locations until booking</span>
            <Link href="/trust" className="rounded-full bg-[rgba(171,83,109,0.12)] px-3 py-1 text-[color:var(--color-accent-strong)]">
              Learn how verification works
            </Link>
          </div>
        </div>
      ) : null}
    </form>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--color-ink-muted)]">
        {label}
      </span>
      {children}
    </label>
  );
}
