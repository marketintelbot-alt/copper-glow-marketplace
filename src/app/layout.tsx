import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { ScrollProgressBar } from "@/components/scroll-progress-bar";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: siteConfig.meta.title,
  description: siteConfig.meta.description,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  const isAuthenticated = Boolean(user);
  const accountHref =
    user?.role === "ADMIN" ? "/admin" : user?.role === "PROVIDER" ? "/provider/dashboard" : user ? "/account" : "/auth/sign-in";
  const accountLabel =
    user?.role === "ADMIN"
      ? "Admin dashboard"
      : user?.role === "PROVIDER"
        ? "Provider dashboard"
        : user
          ? "Account"
          : "Sign in";

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${display.variable} ${sans.variable} bg-[color:var(--color-canvas)] font-sans text-[color:var(--color-ink)] antialiased`}>
        <div className="relative min-h-screen overflow-x-hidden">
          <ScrollProgressBar />
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_14%_0%,rgba(255,241,247,0.22),transparent_22%),radial-gradient(circle_at_100%_12%,rgba(223,157,184,0.36),transparent_24%),linear-gradient(180deg,rgba(241,188,209,0.44),rgba(248,220,232,0.06))]" />
          <SiteHeader
            accountHref={accountHref}
            accountLabel={accountLabel}
            isAuthenticated={isAuthenticated}
            userFirstName={user?.firstName}
          />
          <main>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
