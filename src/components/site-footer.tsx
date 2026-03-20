import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { siteConfig } from "@/lib/site";

const footerLinks = [
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,#3d2430_0%,#24151d_100%)] text-[rgba(255,243,247,0.92)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.5fr,1fr,1fr] lg:px-8">
        <div className="space-y-4">
          <BrandMark compact tone="footer" className="text-[rgba(255,243,247,0.94)]" />
          <p className="max-w-md text-sm leading-7 text-[rgba(255,243,247,0.72)]">
            Aurelle is a trust-first beauty and self-care marketplace launching first around{" "}
            {siteConfig.launchMarket.name}, with the product and operations model built to grow into
            new campuses, neighborhoods, and cities.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[rgba(255,243,247,0.5)]">
            Explore
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            <Link href="/browse" className="text-[rgba(255,243,247,0.9)] transition hover:text-[color:var(--color-blush-soft)]">
              Browse providers
            </Link>
            <Link href="/trust" className="text-[rgba(255,243,247,0.9)] transition hover:text-[color:var(--color-blush-soft)]">
              Trust and safety
            </Link>
            <Link href="/providers/apply" className="text-[rgba(255,243,247,0.9)] transition hover:text-[color:var(--color-blush-soft)]">
              Offer services? Apply to join
            </Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[rgba(255,243,247,0.5)]">
            Company
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            {footerLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[rgba(255,243,247,0.9)] transition hover:text-[color:var(--color-blush-soft)]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-[rgba(255,255,255,0.08)] px-4 py-4 text-center text-xs uppercase tracking-[0.26em] text-[rgba(255,243,247,0.46)]">
        {siteConfig.launchMarket.footerLabel}
      </div>
    </footer>
  );
}
