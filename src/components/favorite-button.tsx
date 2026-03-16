"use client";

import { Heart } from "lucide-react";
import { useState, useTransition } from "react";
import { toggleSavedProviderAction } from "@/actions";
import { cn } from "@/lib/utils";

type Props = {
  providerId: string;
  initialSaved: boolean;
};

export function FavoriteButton({ providerId, initialSaved }: Props) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(initialSaved);

  return (
    <button
      type="button"
      onClick={() =>
        startTransition(async () => {
          const result = await toggleSavedProviderAction(providerId);
          setSaved(result.saved);
        })
      }
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full border transition",
        saved
          ? "border-[color:var(--color-accent-strong)] bg-[rgba(183,124,104,0.14)] text-[color:var(--color-accent-strong)]"
          : "border-[color:var(--color-border)] bg-white/85 text-[color:var(--color-ink-muted)]"
      )}
      aria-label={saved ? "Remove favorite" : "Save provider"}
      aria-pressed={saved}
      disabled={pending}
    >
      <Heart className={cn("h-4 w-4", saved && "fill-current")} />
    </button>
  );
}
