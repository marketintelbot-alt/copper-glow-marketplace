"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useEffectEvent, useState } from "react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
};

function isActiveNavItem(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function HeaderChrome({ children }: { children: React.ReactNode }) {
  const [isScrolled, setIsScrolled] = useState(false);

  const syncScrollState = useEffectEvent(() => {
    setIsScrolled(window.scrollY > 18);
  });

  useEffect(() => {
    syncScrollState();
    window.addEventListener("scroll", syncScrollState, { passive: true });

    return () => window.removeEventListener("scroll", syncScrollState);
  }, []);

  return (
    <div
      className={cn(
        "mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-[28px] border px-4 py-4 shadow-[0_18px_46px_rgba(102,54,72,0.09)] backdrop-blur-xl transition duration-300 sm:px-6 lg:px-8",
        isScrolled
          ? "border-[rgba(255,255,255,0.76)] bg-[rgba(255,247,250,0.92)] shadow-[0_28px_62px_rgba(72,39,52,0.16)]"
          : "border-white/70 bg-[rgba(252,245,248,0.82)]"
      )}
    >
      {children}
    </div>
  );
}

export function DesktopNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-2 rounded-full border border-white/70 bg-white/58 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] md:flex">
      {items.map((item) => {
        const active = isActiveNavItem(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full px-4 py-2.5 text-sm font-medium transition",
              active
                ? "bg-[linear-gradient(135deg,rgba(255,241,246,0.98),rgba(246,218,229,0.94))] text-[color:var(--color-ink)] shadow-[0_14px_30px_rgba(171,83,109,0.12)]"
                : "text-[color:var(--color-ink-muted)] hover:bg-white/80 hover:text-[color:var(--color-ink)]"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function isCurrentNavPath(pathname: string, href: string) {
  return isActiveNavItem(pathname, href);
}
