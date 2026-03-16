# Copper Glow Marketplace

Copper Glow is a production-style, mobile-first beauty and self-care booking marketplace designed to launch market by market. The demo currently opens around the University of Arizona, with seeded local data, mocked booking and payout flows, student and provider dashboards, and an internal admin workspace so the full product can be previewed locally without third-party credentials.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- Prisma ORM
- PostgreSQL for local and hosted environments
- Server Actions for auth, booking, admin, and provider workflows

## What is included

- Premium homepage with trust-forward search and curated sections
- Browse/search marketplace with ranking, filters, and sorting
- Provider profile pages with trust score, services, availability, and reviews
- Mocked checkout flow with deposit and full-prepay behavior
- Student account area for bookings, favorites, profile settings, payments, and reviews
- Provider dashboard for profile edits, services, availability, trust signals, payouts, and plan management
- Admin dashboard for approvals, provider status changes, placements, disputes, outreach, claims, and platform metrics
- Polished About, FAQ, Contact, Privacy Policy, and Terms pages linked from the footer
- Believable seeded demo data for the first launch market, with school-level structure ready for future markets like ASU

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Install and start PostgreSQL if it is not already running.

macOS with Homebrew:

```bash
brew install postgresql@17
brew services start postgresql@17
createdb copper_glow
```

3. Copy the environment template:

```bash
cp .env.example .env
```

4. Generate the database schema and seed demo data:

```bash
npm run db:setup
```

5. Start the app:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Demo accounts

- Student: `mia@copperglow.demo` / `demo1234`
- Provider: `provider@copperglow.demo` / `demo1234`
- Admin: `admin@copperglow.demo` / `demo1234`

The sign-in screen also includes one-click demo account shortcuts.

## Database notes

- Local and hosted data use PostgreSQL.
- `npm run db:setup` pushes the Prisma schema, then performs a full demo reset + reseed.
- `npm run db:seed:if-empty` is safe for hosted environments where you only want to bootstrap demo data once.
- The Prisma schema is already modeled for users, providers, schools, bookings, payments, payouts, disputes, trust signals, outreach, claims, and subscriptions.

## Available scripts

- `npm run dev` starts the local app
- `npm run lint` runs ESLint
- `npm run build` creates a production build
- `npm run db:setup` rebuilds the local schema and reseeds demo data
- `npm run db:push` applies the schema without reseeding
- `npm run db:seed` reruns only the seed script
- `npm run db:studio` opens Prisma Studio
- `npm run app:add:android` scaffolds the Android wrapper
- `npm run app:add:ios` scaffolds the iOS wrapper
- `npm run app:sync` resyncs Capacitor after web changes

## Mocked integrations

The product is intentionally complete without external services. These flows are mocked cleanly behind server actions and helper modules so real providers can be attached later without redesigning the UI:

- Payments and deposits
- Payout release timing
- Email notifications
- SMS-style notifications
- Contact acknowledgments

The current mock layer lives in `src/lib/mock-services.ts`.

## Environment variables

See `.env.example` for the current local defaults. The app works locally without any live external API keys, but the template includes placeholders for values you would want to supply when replacing mocked services with production integrations.

## Render deployment

The repo now includes a `render.yaml` Blueprint for a free Render web service plus a free Render PostgreSQL database. The intended flow is:

1. Push this project to a public GitHub repo.
2. In Render, create a new Blueprint from that repo.
3. Set `NEXT_PUBLIC_APP_URL` to your Render app URL after the first deploy.
4. Keep the demo seed bootstrap in place for the hosted preview environment.

The Blueprint uses:

- `npm ci && npx prisma generate && npm run build` for builds
- `npx prisma db push && npm run db:seed:if-empty` before deploy
- `npm run start` to serve the app

## Production swap guidance

The fastest future upgrades would be:

1. Replace `prisma db push` with formal Prisma migrations once the data model settles.
2. Swap `src/lib/mock-services.ts` for real Stripe, email, SMS, and payout providers.
3. Replace the demo session/auth layer with a managed auth provider if desired.
4. Add real image storage for provider portfolio uploads.

## Mobile wrapper

Capacitor has been added so this web product can evolve into App Store and Play Store shells without a full rewrite.

- Android wrapper scaffold is included in `android/`
- iOS wrapper scaffold is included in `ios/`
- `capacitor.config.ts` points native shells at `CAPACITOR_SERVER_URL` or `NEXT_PUBLIC_APP_URL`

Current note:

- Android scaffold is ready to open in Android Studio.
- iOS native dependency sync still requires full Xcode plus CocoaPods running in a UTF-8 shell environment.

## Quality checks run

- `npm run db:setup`
- `npm run lint`
- `npm run build`

The app has also been browser-checked locally across the core marketplace, auth, account, and dashboard flows.
