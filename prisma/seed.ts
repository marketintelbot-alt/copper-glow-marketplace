import {
  AdminNoteScope,
  ApplicationStatus,
  CancellationPolicy,
  ClaimStatus,
  DepositType,
  DisputeStatus,
  FeaturedSurface,
  OutreachStatus,
  PaymentKind,
  PaymentOption,
  PaymentRequirement,
  PaymentStatus,
  PayoutStatus,
  PrismaClient,
  ProviderStatus,
  ProviderType,
  SubscriptionPlan,
  SubscriptionStatus,
  TrustSignalType,
  UserRole,
  type Prisma,
} from "@prisma/client";
import { addDays, addHours, addMinutes, addMonths, startOfDay } from "date-fns";
import { scryptSync } from "node:crypto";
import { siteConfig } from "../src/lib/site";

const prisma = new PrismaClient();
const DEMO_PASSWORD = "demo1234";
const DEMO_DOMAIN = siteConfig.demoDomain;
const BOOKING_PREFIX = siteConfig.bookingReferencePrefix;
const args = new Set(process.argv.slice(2));
const resetMode = args.has("--reset");
const seedIfEmpty = args.has("--if-empty");

function demoEmail(localPart: string) {
  return `${localPart}@${DEMO_DOMAIN}`;
}

function bookingReference(suffix: string) {
  return `${BOOKING_PREFIX}-${suffix}`;
}

type SeedService = {
  category: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  paymentRequirement: PaymentRequirement;
  depositType?: DepositType;
  depositValue?: number;
  featured?: boolean;
  popularityRank?: number;
  studentPerk?: string;
};

type SeedProvider = {
  slug: string;
  name: string;
  providerType: ProviderType;
  status: ProviderStatus;
  plan: SubscriptionPlan;
  ownerEmail?: string;
  headline: string;
  shortDescription: string;
  story: string;
  approximateArea: string;
  neighborhood: string;
  privateAddress?: string;
  distanceMiles: number;
  serviceRadiusMiles?: number;
  yearsExperience: number;
  isMobileService?: boolean;
  acceptsNewClients?: boolean;
  claimable?: boolean;
  identityVerified: boolean;
  portfolioReviewed: boolean;
  responseTimeMinutes: number;
  profileCompleteness: number;
  portfolioQuality: number;
  completedBookingsCount: number;
  reviewAverage: number;
  reviewCount: number;
  cancellationRate: number;
  disputeRate: number;
  repeatBookingRate: number;
  noShowRate: number;
  conversionRate: number;
  coverTone: string;
  accentTone: string;
  cancellationPolicy: CancellationPolicy;
  featuredSurfaces?: FeaturedSurface[];
  services: SeedService[];
};

type BookingSeed = {
  reference: string;
  userEmail: string;
  providerSlug: string;
  serviceName: string;
  status: "CONFIRMED" | "COMPLETED" | "CANCELED" | "DISPUTED";
  paymentOption: PaymentOption;
  slotIndex?: number;
  manualOffsetHours?: number;
  notes?: string;
  review?: {
    rating: number;
    title: string;
    body: string;
    wouldRebook?: boolean;
  };
  dispute?: {
    reason: string;
    resolutionSummary?: string;
  };
  mockLast4: string;
};

const passwordHash = hashPassword(DEMO_PASSWORD);
const now = new Date();
const today = startOfDay(now);

const categorySeeds = [
  {
    slug: "nails",
    name: "Nails",
    description: "Gel, structured manis, fills, and polished nail art.",
    icon: "sparkles",
    isHighTier: false,
    availableToIndependent: true,
    sortOrder: 1,
  },
  {
    slug: "spray-tans",
    name: "Spray Tans",
    description: "Rapid and classic tanning sessions with campus-friendly timing.",
    icon: "sun-medium",
    isHighTier: false,
    availableToIndependent: true,
    sortOrder: 2,
  },
  {
    slug: "lashes",
    name: "Lashes",
    description: "Natural, hybrid, and volume lash sets with fills.",
    icon: "eye",
    isHighTier: false,
    availableToIndependent: true,
    sortOrder: 3,
  },
  {
    slug: "brows",
    name: "Brows",
    description: "Shaping, lamination, tint, and soft-detail brow work.",
    icon: "pen-tool",
    isHighTier: false,
    availableToIndependent: true,
    sortOrder: 4,
  },
  {
    slug: "hair",
    name: "Hair",
    description: "Cuts, glosses, blowouts, and color appointments.",
    icon: "scissors",
    isHighTier: false,
    availableToIndependent: true,
    sortOrder: 5,
  },
  {
    slug: "waxing",
    name: "Waxing",
    description: "Fast, clean waxing services with clear aftercare guidance.",
    icon: "leaf",
    isHighTier: false,
    availableToIndependent: true,
    sortOrder: 6,
  },
  {
    slug: "advanced-facials",
    name: "Advanced Facials",
    description: "Clinical facials, dermaplane, and advanced skin protocols.",
    icon: "droplets",
    isHighTier: true,
    availableToIndependent: false,
    sortOrder: 7,
  },
  {
    slug: "med-spa",
    name: "Med Spa",
    description: "Higher-tier treatment menus offered only by verified businesses.",
    icon: "shield-check",
    isHighTier: true,
    availableToIndependent: false,
    sortOrder: 8,
  },
  {
    slug: "injectables",
    name: "Injectables",
    description: "Cosmetic injectables handled by verified business teams.",
    icon: "plus-circle",
    isHighTier: true,
    availableToIndependent: false,
    sortOrder: 9,
  },
];

const userSeeds = [
  {
    email: demoEmail("mia"),
    firstName: "Mia",
    lastName: "Ramirez",
    role: UserRole.USER,
    phone: "(520) 555-0114",
    bio: "Junior at U of A who books around classes and sorority events.",
    avatarSeed: "mia-ramirez",
  },
  {
    email: demoEmail("ava"),
    firstName: "Ava",
    lastName: "Patel",
    role: UserRole.USER,
    phone: "(520) 555-0148",
    bio: "Pre-med student who loves efficient brow and lash appointments.",
    avatarSeed: "ava-patel",
  },
  {
    email: demoEmail("camila"),
    firstName: "Camila",
    lastName: "Soto",
    role: UserRole.USER,
    phone: "(520) 555-0169",
    bio: "Campus ambassador who books hair and spray tans before events.",
    avatarSeed: "camila-soto",
  },
  {
    email: demoEmail("nina"),
    firstName: "Nina",
    lastName: "Huang",
    role: UserRole.USER,
    phone: "(520) 555-0191",
    bio: "Senior with a standing manicure every other Thursday.",
    avatarSeed: "nina-huang",
  },
  {
    email: demoEmail("zoe"),
    firstName: "Zoe",
    lastName: "Miller",
    role: UserRole.USER,
    phone: "(520) 555-0173",
    bio: "Graduate student who likes quiet morning appointments.",
    avatarSeed: "zoe-miller",
  },
  {
    email: demoEmail("provider"),
    firstName: "Jasmin",
    lastName: "Ortega",
    role: UserRole.PROVIDER,
    phone: "(520) 555-0122",
    bio: "Owner of Copper Bloom Nails.",
    avatarSeed: "jasmin-ortega",
  },
  {
    email: demoEmail("admin"),
    firstName: "Taylor",
    lastName: "Brooks",
    role: UserRole.ADMIN,
    phone: "(520) 555-0108",
    bio: "Launch operations lead for Aurelle.",
    avatarSeed: "taylor-brooks",
  },
];

const providerSeeds: SeedProvider[] = [
  {
    slug: "sonoran-silk-studio",
    name: "Sonoran Silk Studio",
    providerType: ProviderType.VERIFIED_BUSINESS,
    status: ProviderStatus.LIVE,
    plan: SubscriptionPlan.PREMIUM,
    headline: "Glossy hair color, tailored cuts, and a calm salon flow right by Main Gate.",
    shortDescription:
      "A polished full-service salon known for lived-in color, silky blowouts, and class-friendly scheduling.",
    story:
      "Sonoran Silk Studio was built for students who want reliable service without sacrificing taste. Their team blends polished technique, consistent communication, and a front-desk experience that feels as sharp as the finished hair.",
    approximateArea: "Main Gate",
    neighborhood: "Main Gate Square",
    distanceMiles: 0.8,
    yearsExperience: 9,
    identityVerified: true,
    portfolioReviewed: true,
    responseTimeMinutes: 18,
    profileCompleteness: 98,
    portfolioQuality: 96,
    completedBookingsCount: 184,
    reviewAverage: 4.9,
    reviewCount: 68,
    cancellationRate: 0.04,
    disputeRate: 0.0,
    repeatBookingRate: 0.58,
    noShowRate: 0.01,
    conversionRate: 0.42,
    coverTone: "#F4CFC6",
    accentTone: "#A45E53",
    cancellationPolicy: CancellationPolicy.STANDARD,
    featuredSurfaces: [FeaturedSurface.HOMEPAGE_POPULAR, FeaturedSurface.HOMEPAGE_TOP_TRUSTED],
    services: [
      service("hair", "Gloss + Blowout", "A polished gloss refresh finished with a smooth blowout.", 90, 88, PaymentRequirement.DEPOSIT_REQUIRED, DepositType.FIXED, 25, true, 1, "Late afternoon and Sunday slots open."),
      service("hair", "Lived-In Signature Cut", "Soft movement, layered shape, and styling for everyday wear.", 75, 72, PaymentRequirement.DEPOSIT_REQUIRED, DepositType.FIXED, 20, false, 2, "Student IDs unlock a complimentary gloss consult."),
      service("brows", "Soft Brow Clean-Up", "Quick shaping add-on for returning salon clients.", 25, 24, PaymentRequirement.FULL_PREPAY, DepositType.NONE, 0, false, 3, "Easy pre-event add-on."),
    ],
  },
  {
    slug: "copper-bloom-nails",
    name: "Copper Bloom Nails",
    providerType: ProviderType.VERIFIED_BUSINESS,
    status: ProviderStatus.LIVE,
    plan: SubscriptionPlan.SPOTLIGHT,
    ownerEmail: demoEmail("provider"),
    headline: "Structured gel, soft nudes, and dependable timing for busy student schedules.",
    shortDescription:
      "A warm, detail-oriented nail lounge with elevated basics, clean art, and fast fills.",
    story:
      "Copper Bloom became a campus favorite by doing simple things well: clear timing, precise prep, and finishes that still look polished two weeks later. The studio keeps service descriptions transparent so new clients know exactly what to expect.",
    approximateArea: "Sam Hughes",
    neighborhood: "Sam Hughes",
    distanceMiles: 1.2,
    yearsExperience: 7,
    identityVerified: true,
    portfolioReviewed: true,
    responseTimeMinutes: 22,
    profileCompleteness: 97,
    portfolioQuality: 94,
    completedBookingsCount: 152,
    reviewAverage: 4.8,
    reviewCount: 54,
    cancellationRate: 0.05,
    disputeRate: 0.01,
    repeatBookingRate: 0.61,
    noShowRate: 0.01,
    conversionRate: 0.39,
    coverTone: "#F2D8D0",
    accentTone: "#8D5A56",
    cancellationPolicy: CancellationPolicy.STANDARD,
    featuredSurfaces: [
      FeaturedSurface.HOMEPAGE_STUDENT_FAVORITES,
      FeaturedSurface.HOMEPAGE_AFFORDABLE,
      FeaturedSurface.SEARCH_SPOTLIGHT,
    ],
    services: [
      service("nails", "Structured Gel Full Set", "Strength-building gel overlay with shape and finish.", 95, 70, PaymentRequirement.DEPOSIT_REQUIRED, DepositType.FIXED, 20, true, 1, "Free chrome accent on Tuesday bookings."),
      service("nails", "Soft Gel Fill", "Maintenance fill with rebalance and fresh top coat.", 75, 52, PaymentRequirement.DEPOSIT_REQUIRED, DepositType.FIXED, 18, false, 2, "Best for returning clients."),
      service("nails", "Minimalist Mani", "A clean-file manicure with subtle art or one-tone polish.", 50, 38, PaymentRequirement.FULL_PREPAY, DepositType.NONE, 0, false, 3, "Budget-friendly before formals and rush week."),
    ],
  },
  {
    slug: "desert-veil-tans",
    name: "Desert Veil Tans",
    providerType: ProviderType.VERIFIED_INDEPENDENT,
    status: ProviderStatus.LIVE,
    plan: SubscriptionPlan.BASIC,
    headline: "Natural spray tans with quick dry formulas and event-ready scheduling.",
    shortDescription:
      "Independent artist specializing in natural bronze tones and shade matching for photos, formals, and spring events.",
    story:
      "Desert Veil Tans keeps the experience focused: skin prep guidance before booking, a tight appointment window, and natural undertones that look right in Arizona light. Exact home address stays private until booking confirmation.",
    approximateArea: "West University",
    neighborhood: "West University",
    privateAddress: "Private studio near Euclid & Speedway",
    distanceMiles: 0.9,
    yearsExperience: 4,
    identityVerified: true,
    portfolioReviewed: true,
    responseTimeMinutes: 29,
    profileCompleteness: 91,
    portfolioQuality: 89,
    completedBookingsCount: 86,
    reviewAverage: 4.7,
    reviewCount: 32,
    cancellationRate: 0.06,
    disputeRate: 0.0,
    repeatBookingRate: 0.46,
    noShowRate: 0.02,
    conversionRate: 0.34,
    coverTone: "#F6DCCB",
    accentTone: "#A96A4C",
    cancellationPolicy: CancellationPolicy.FLEXIBLE,
    featuredSurfaces: [FeaturedSurface.HOMEPAGE_AFFORDABLE],
    services: [
      service("spray-tans", "Rapid Bronze", "Express rinse formula with tone guidance for first-timers.", 25, 42, PaymentRequirement.DEPOSIT_REQUIRED, DepositType.PERCENTAGE, 30, true, 1, "Free prep mitt with first booking."),
      service("spray-tans", "Classic Weekend Glow", "Traditional tan processed for deeper overnight development.", 30, 55, PaymentRequirement.DEPOSIT_REQUIRED, DepositType.FIXED, 18, false, 2, "Group booking add-ons available."),
    ],
  },
  {
    slug: "luna-lash-lab",
    name: "Luna Lash Lab",
    providerType: ProviderType.VERIFIED_INDEPENDENT,
    status: ProviderStatus.LIVE,
    plan: SubscriptionPlan.SPOTLIGHT,
    headline: "Soft hybrid sets, wispy fills, and a quiet lash room near campus.",
    shortDescription:
      "Verified independent lash artist with natural texture work and strong retention reviews.",
    story:
      "Luna Lash Lab was designed for clients who want a polished look without heavy styling. Every appointment includes mapping notes, aftercare guidance, and realistic refill timing so expectations stay clear from day one.",
    approximateArea: "Rincon Heights",
    neighborhood: "Rincon Heights",
    privateAddress: "Private suite near 4th Street & Campbell",
    distanceMiles: 1.1,
    yearsExperience: 5,
    identityVerified: true,
    portfolioReviewed: true,
    responseTimeMinutes: 25,
    profileCompleteness: 94,
    portfolioQuality: 92,
    completedBookingsCount: 102,
    reviewAverage: 4.8,
    reviewCount: 41,
    cancellationRate: 0.05,
    disputeRate: 0.0,
    repeatBookingRate: 0.57,
    noShowRate: 0.01,
    conversionRate: 0.36,
    coverTone: "#EDD7E2",
    accentTone: "#8E6076",
    cancellationPolicy: CancellationPolicy.STANDARD,
    featuredSurfaces: [FeaturedSurface.HOMEPAGE_STUDENT_FAVORITES, FeaturedSurface.SEARCH_SPOTLIGHT],
    services: [
      service("lashes", "Hybrid Full Set", "Soft fullness with a wispy, campus-ready finish.", 120, 105, PaymentRequirement.DEPOSIT_REQUIRED, DepositType.FIXED, 30, true, 1, "Patch tests available for sensitive eyes."),
      service("lashes", "2-Week Fill", "Maintenance fill for current sets with retention check-in.", 75, 64, PaymentRequirement.DEPOSIT_REQUIRED, DepositType.FIXED, 20, false, 2, "Best for current clients."),
      service("brows", "Lash + Brow Balance", "Tint and tidy add-on for a complete face frame.", 30, 28, PaymentRequirement.FULL_PREPAY, DepositType.NONE, 0, false, 3, "Easy add-on before photoshoots."),
    ],
  },
  {
    slug: "scout-and-sage-wax-bar",
    name: "Scout & Sage Wax Bar",
    providerType: ProviderType.VERIFIED_BUSINESS,
    status: ProviderStatus.LIVE,
    plan: SubscriptionPlan.BASIC,
    headline: "Fast, thoughtful waxing with respectful service and easy rebooking.",
    shortDescription:
      "Trusted waxing studio with clean rooms, gentle technique, and straightforward aftercare.",
    story:
      "Scout & Sage is one of the easiest repeat bookings in the area because the experience is consistent from front desk to service room. The team keeps the menu streamlined, the rooms spotless, and the communication refreshingly direct.",
    approximateArea: "Campbell / Grant",
    neighborhood: "Campbell Corridor",
    distanceMiles: 2.6,
    yearsExperience: 11,
    identityVerified: true,
    portfolioReviewed: true,
    responseTimeMinutes: 17,
    profileCompleteness: 95,
    portfolioQuality: 88,
    completedBookingsCount: 210,
    reviewAverage: 4.8,
    reviewCount: 73,
    cancellationRate: 0.03,
    disputeRate: 0.0,
    repeatBookingRate: 0.63,
    noShowRate: 0.0,
    conversionRate: 0.44,
    coverTone: "#E8DCCB",
    accentTone: "#7C6A52",
    cancellationPolicy: CancellationPolicy.FLEXIBLE,
    featuredSurfaces: [FeaturedSurface.HOMEPAGE_TOP_TRUSTED],
    services: [
      service("waxing", "Brazilian", "Detailed service with calming aftercare guidance.", 35, 58, PaymentRequirement.DEPOSIT_REQUIRED, DepositType.FIXED, 18, true, 1, "Returning guest bundles open monthly."),
      service("waxing", "Brow Wax + Shape", "Quick wax and tidy for class or interview prep.", 20, 24, PaymentRequirement.FULL_PREPAY, DepositType.NONE, 0, false, 2, "Great last-minute appointment."),
      service("brows", "Tint + Tidy", "Brow tinting paired with a clean-up appointment.", 30, 34, PaymentRequirement.FULL_PREPAY, DepositType.NONE, 0, false, 3, "A dependable add-on before events."),
    ],
  },
  {
    slug: "halo-house-beauty-bus",
    name: "Halo House Beauty Bus",
    providerType: ProviderType.VERIFIED_INDEPENDENT,
    status: ProviderStatus.LIVE,
    plan: SubscriptionPlan.PREMIUM,
    headline: "Mobile glam and smooth styling that comes to dorms, apartments, and event prep.",
    shortDescription:
      "Verified mobile artist offering blowouts, braid styling, and quick brow touch-ups across the U of A orbit.",
    story:
      "Halo House is built for convenience without sacrificing polish. The mobile setup is organized, on-time, and designed for group prep before chapter photos, birthdays, and formal weekends.",
    approximateArea: "University / Speedway",
    neighborhood: "Service radius around U of A",
    privateAddress: "Mobile-only provider",
    distanceMiles: 1.5,
    serviceRadiusMiles: 5.0,
    yearsExperience: 6,
    isMobileService: true,
    identityVerified: true,
    portfolioReviewed: true,
    responseTimeMinutes: 24,
    profileCompleteness: 93,
    portfolioQuality: 91,
    completedBookingsCount: 112,
    reviewAverage: 4.8,
    reviewCount: 39,
    cancellationRate: 0.05,
    disputeRate: 0.0,
    repeatBookingRate: 0.49,
    noShowRate: 0.01,
    conversionRate: 0.37,
    coverTone: "#F1D8CF",
    accentTone: "#9B6B5F",
    cancellationPolicy: CancellationPolicy.STRICT,
    featuredSurfaces: [FeaturedSurface.HOMEPAGE_LAST_MINUTE, FeaturedSurface.SEARCH_SPOTLIGHT],
    services: [
      service("hair", "Dorm Blowout", "On-site blowout and finish styling for events or weekends.", 50, 60, PaymentRequirement.DEPOSIT_REQUIRED, DepositType.FIXED, 18, true, 1, "Travel fee already included inside the U of A zone."),
      service("hair", "Soft Waves Styling", "Quick mobile styling for photos, brunch, or chapter events.", 45, 48, PaymentRequirement.DEPOSIT_REQUIRED, DepositType.PERCENTAGE, 35, false, 2, "Works well for small groups."),
      service("brows", "Brow Touch-Up", "Travel-friendly brow cleanup with a soft finish.", 20, 20, PaymentRequirement.FULL_PREPAY, DepositType.NONE, 0, false, 3, "Add-on for existing mobile bookings."),
    ],
  },
  {
    slug: "cielo-med-aesthetics",
    name: "Cielo Med Aesthetics",
    providerType: ProviderType.VERIFIED_BUSINESS,
    status: ProviderStatus.LIVE,
    plan: SubscriptionPlan.PREMIUM,
    headline: "Clinical skin results in a polished, student-welcoming med spa environment.",
    shortDescription:
      "Verified business for higher-tier facials, med spa services, and injectables with elevated intake and follow-up.",
    story:
      "Cielo Med Aesthetics is one of the launch-market trust anchors for advanced services. The practice pairs premium treatment rooms with clear eligibility screening, credentialed staff, and calm educational consults before any higher-risk appointment.",
    approximateArea: "Foothills",
    neighborhood: "Campbell Foothills",
    distanceMiles: 4.3,
    yearsExperience: 12,
    identityVerified: true,
    portfolioReviewed: true,
    responseTimeMinutes: 16,
    profileCompleteness: 99,
    portfolioQuality: 97,
    completedBookingsCount: 236,
    reviewAverage: 4.9,
    reviewCount: 91,
    cancellationRate: 0.02,
    disputeRate: 0.0,
    repeatBookingRate: 0.64,
    noShowRate: 0.0,
    conversionRate: 0.48,
    coverTone: "#E7D7D0",
    accentTone: "#6D554E",
    cancellationPolicy: CancellationPolicy.STRICT,
    featuredSurfaces: [FeaturedSurface.HOMEPAGE_TOP_TRUSTED],
    services: [
      service("advanced-facials", "Barrier Reset Facial", "Clinical facial focused on hydration, calm, and glow.", 60, 135, PaymentRequirement.FULL_PREPAY, DepositType.NONE, 0, true, 1, "Ideal before graduation photos."),
      service("med-spa", "Clarity Peel Consultation", "Assessment plus same-day peel when approved.", 45, 95, PaymentRequirement.FULL_PREPAY, DepositType.NONE, 0, false, 2, "Only for approved candidates."),
      service("injectables", "Lip Balance Consultation", "Consult plus treatment planning with licensed injector.", 40, 150, PaymentRequirement.FULL_PREPAY, DepositType.NONE, 0, false, 3, "Treatment eligibility confirmed after consult."),
    ],
  },
  {
    slug: "campus-glow-skin-clinic",
    name: "Campus Glow Skin Clinic",
    providerType: ProviderType.VERIFIED_BUSINESS,
    status: ProviderStatus.LIVE,
    plan: SubscriptionPlan.SPOTLIGHT,
    headline: "Advanced facials with polished routines and strong barrier-care education.",
    shortDescription:
      "Modern skin clinic blending accessible education with a premium facial room and strong student follow-up.",
    story:
      "Campus Glow Skin Clinic earns trust by making advanced skincare feel understandable. Intake is thoughtful, expectations are realistic, and aftercare is written in plain language instead of spa jargon.",
    approximateArea: "Downtown Tucson",
    neighborhood: "Downtown",
    distanceMiles: 2.9,
    yearsExperience: 8,
    identityVerified: true,
    portfolioReviewed: true,
    responseTimeMinutes: 21,
    profileCompleteness: 96,
    portfolioQuality: 95,
    completedBookingsCount: 128,
    reviewAverage: 4.8,
    reviewCount: 47,
    cancellationRate: 0.04,
    disputeRate: 0.0,
    repeatBookingRate: 0.52,
    noShowRate: 0.01,
    conversionRate: 0.4,
    coverTone: "#EEE3DC",
    accentTone: "#887067",
    cancellationPolicy: CancellationPolicy.STANDARD,
    featuredSurfaces: [FeaturedSurface.HOMEPAGE_POPULAR],
    services: [
      service("advanced-facials", "Dermaplane + Hydration", "A polished skin-reset appointment with zero rush.", 55, 118, PaymentRequirement.FULL_PREPAY, DepositType.NONE, 0, true, 1, "Campus pickup nights tend to go fast."),
      service("advanced-facials", "Acne Recovery Facial", "Targeted facial focused on texture, clarity, and calm.", 70, 145, PaymentRequirement.FULL_PREPAY, DepositType.NONE, 0, false, 2, "Includes tailored home-care notes."),
    ],
  },
  {
    slug: "rooted-ritual-hair-co",
    name: "Rooted Ritual Hair Co.",
    providerType: ProviderType.VERIFIED_BUSINESS,
    status: ProviderStatus.LIVE,
    plan: SubscriptionPlan.BASIC,
    headline: "Soft cuts, brighter blondes, and a neighborhood salon feel just off campus.",
    shortDescription:
      "Warm business studio with clean color work, restorative treatments, and a calm appointment pace.",
    story:
      "Rooted Ritual is one of those salons students keep recommending because the team listens well and paces appointments thoughtfully. Their strongest work is low-maintenance color that grows out cleanly between semesters.",
    approximateArea: "Fourth Avenue",
    neighborhood: "Fourth Avenue",
    distanceMiles: 1.9,
    yearsExperience: 10,
    identityVerified: true,
    portfolioReviewed: true,
    responseTimeMinutes: 27,
    profileCompleteness: 92,
    portfolioQuality: 90,
    completedBookingsCount: 144,
    reviewAverage: 4.7,
    reviewCount: 58,
    cancellationRate: 0.05,
    disputeRate: 0.0,
    repeatBookingRate: 0.55,
    noShowRate: 0.02,
    conversionRate: 0.35,
    coverTone: "#E9D6C8",
    accentTone: "#896450",
    cancellationPolicy: CancellationPolicy.STANDARD,
    featuredSurfaces: [FeaturedSurface.HOMEPAGE_STUDENT_FAVORITES],
    services: [
      service("hair", "Signature Blowout", "Long-wear smooth blowout with movement and shine.", 60, 54, PaymentRequirement.DEPOSIT_REQUIRED, DepositType.FIXED, 15, true, 1, "Great for interviews or event weekends."),
      service("hair", "Dimensional Gloss", "Tone-refresh service for soft dimension and shine.", 80, 94, PaymentRequirement.DEPOSIT_REQUIRED, DepositType.FIXED, 25, false, 2, "Consultation included."),
    ],
  },
  {
    slug: "sunroom-brow-atelier",
    name: "Sunroom Brow Atelier",
    providerType: ProviderType.VERIFIED_INDEPENDENT,
    status: ProviderStatus.LIVE,
    plan: SubscriptionPlan.BASIC,
    headline: "Brow mapping and subtle lamination with a polished, soft-finish look.",
    shortDescription:
      "Independent brow specialist close to campus with excellent shape consistency and natural tint work.",
    story:
      "Sunroom Brow Atelier keeps the setting private and the work detail-driven. Clients choose it for brow lamination that still feels wearable in class, on interviews, and in everyday photos.",
    approximateArea: "University Heights",
    neighborhood: "University Heights",
    privateAddress: "Private studio near Highland & Euclid",
    distanceMiles: 0.7,
    yearsExperience: 3,
    identityVerified: true,
    portfolioReviewed: true,
    responseTimeMinutes: 31,
    profileCompleteness: 90,
    portfolioQuality: 88,
    completedBookingsCount: 74,
    reviewAverage: 4.7,
    reviewCount: 28,
    cancellationRate: 0.06,
    disputeRate: 0.0,
    repeatBookingRate: 0.43,
    noShowRate: 0.02,
    conversionRate: 0.31,
    coverTone: "#F1DFD0",
    accentTone: "#9A775E",
    cancellationPolicy: CancellationPolicy.FLEXIBLE,
    featuredSurfaces: [FeaturedSurface.HOMEPAGE_AFFORDABLE],
    services: [
      service("brows", "Brow Lamination", "Lifted, soft-set brows finished with a tint match.", 50, 62, PaymentRequirement.DEPOSIT_REQUIRED, DepositType.PERCENTAGE, 35, true, 1, "Pairs well with tint add-on."),
      service("brows", "Shape + Tint", "Clean-up, tinting, and mapping for a natural finish.", 35, 34, PaymentRequirement.FULL_PREPAY, DepositType.NONE, 0, false, 2, "Fast midweek favorite."),
    ],
  },
  {
    slug: "velvet-prickly-nail-lounge",
    name: "Velvet Prickly Nail Lounge",
    providerType: ProviderType.VERIFIED_BUSINESS,
    status: ProviderStatus.LIVE,
    plan: SubscriptionPlan.PREMIUM,
    headline: "Editorial nail art, premium prep, and standout sets worth the extra trip.",
    shortDescription:
      "A more fashion-forward nail lounge known for clean linework, chrome finishes, and durable sculpted sets.",
    story:
      "Velvet Prickly is where students book when they want a stronger visual statement. The lounge keeps premium standards on sanitation, timing, and consultation while still feeling warm instead of intimidating.",
    approximateArea: "Broadway Village",
    neighborhood: "Broadway Village",
    distanceMiles: 3.1,
    yearsExperience: 8,
    identityVerified: true,
    portfolioReviewed: true,
    responseTimeMinutes: 20,
    profileCompleteness: 95,
    portfolioQuality: 97,
    completedBookingsCount: 162,
    reviewAverage: 4.9,
    reviewCount: 63,
    cancellationRate: 0.03,
    disputeRate: 0.0,
    repeatBookingRate: 0.6,
    noShowRate: 0.0,
    conversionRate: 0.41,
    coverTone: "#E3CAD4",
    accentTone: "#81586F",
    cancellationPolicy: CancellationPolicy.STANDARD,
    featuredSurfaces: [FeaturedSurface.SEARCH_SPOTLIGHT, FeaturedSurface.HOMEPAGE_POPULAR],
    services: [
      service("nails", "Editorial Sculpted Set", "Long-form set with sculpt, clean art direction, and finish.", 120, 110, PaymentRequirement.DEPOSIT_REQUIRED, DepositType.FIXED, 35, true, 1, "Most-booked for chapter photos."),
      service("nails", "Chrome Refill", "Rebalance appointment with full chrome finish refresh.", 80, 68, PaymentRequirement.DEPOSIT_REQUIRED, DepositType.FIXED, 20, false, 2, "Returning clients only."),
    ],
  },
  {
    slug: "catalina-lash-collective",
    name: "Catalina Lash Collective",
    providerType: ProviderType.VERIFIED_BUSINESS,
    status: ProviderStatus.LIVE,
    plan: SubscriptionPlan.SPOTLIGHT,
    headline: "Lightweight lashes and polished retention for students who want consistency.",
    shortDescription:
      "Trusted lash studio with strong retention metrics, comfortable rooms, and efficient fill scheduling.",
    story:
      "Catalina Lash Collective operates like a finely tuned studio: consistent reminders, realistic refill timing, and technicians who keep the sets flattering instead of heavy. It is one of the easiest lash businesses to recommend to first-timers.",
    approximateArea: "River / Campbell",
    neighborhood: "Campbell North",
    distanceMiles: 4.8,
    yearsExperience: 9,
    identityVerified: true,
    portfolioReviewed: true,
    responseTimeMinutes: 23,
    profileCompleteness: 96,
    portfolioQuality: 94,
    completedBookingsCount: 171,
    reviewAverage: 4.8,
    reviewCount: 66,
    cancellationRate: 0.04,
    disputeRate: 0.0,
    repeatBookingRate: 0.62,
    noShowRate: 0.01,
    conversionRate: 0.43,
    coverTone: "#E7D9E8",
    accentTone: "#745A86",
    cancellationPolicy: CancellationPolicy.STANDARD,
    featuredSurfaces: [FeaturedSurface.HOMEPAGE_TOP_TRUSTED],
    services: [
      service("lashes", "Wet Set Full Lash", "Glossy texture with lightweight fullness and retention mapping.", 110, 112, PaymentRequirement.DEPOSIT_REQUIRED, DepositType.FIXED, 30, true, 1, "Most requested by first-time clients."),
      service("lashes", "Signature Fill", "Refresh and retention maintenance in a calm studio room.", 70, 66, PaymentRequirement.DEPOSIT_REQUIRED, DepositType.FIXED, 20, false, 2, "Great before travel weekends."),
    ],
  },
  {
    slug: "mesa-muse-mobile-tan",
    name: "Mesa Muse Mobile Tan",
    providerType: ProviderType.VERIFIED_INDEPENDENT,
    status: ProviderStatus.LIVE,
    plan: SubscriptionPlan.SPOTLIGHT,
    headline: "Mobile spray tans for apartments, sorority houses, and event weekends near campus.",
    shortDescription:
      "A polished mobile tanning provider with group-friendly scheduling and soft undertone blends.",
    story:
      "Mesa Muse keeps mobile appointments feeling premium instead of makeshift. Setup is tidy, prep instructions are clear, and the provider is especially strong with group bookings before socials, formals, and graduation.",
    approximateArea: "Hacienda del Sol zone",
    neighborhood: "Mobile service area",
    privateAddress: "Mobile-only provider",
    distanceMiles: 2.3,
    serviceRadiusMiles: 6.5,
    yearsExperience: 4,
    isMobileService: true,
    identityVerified: true,
    portfolioReviewed: true,
    responseTimeMinutes: 26,
    profileCompleteness: 92,
    portfolioQuality: 90,
    completedBookingsCount: 91,
    reviewAverage: 4.7,
    reviewCount: 35,
    cancellationRate: 0.06,
    disputeRate: 0.0,
    repeatBookingRate: 0.48,
    noShowRate: 0.01,
    conversionRate: 0.33,
    coverTone: "#F1D8C0",
    accentTone: "#9E6C47",
    cancellationPolicy: CancellationPolicy.STRICT,
    featuredSurfaces: [FeaturedSurface.HOMEPAGE_LAST_MINUTE],
    services: [
      service("spray-tans", "On-Site Rapid Tan", "Mobile rapid tan with student apartment friendly setup.", 30, 58, PaymentRequirement.DEPOSIT_REQUIRED, DepositType.FIXED, 20, true, 1, "Best for last-minute event prep."),
      service("spray-tans", "Group Glow Visit", "Back-to-back mobile tan block for two or more clients.", 60, 90, PaymentRequirement.DEPOSIT_REQUIRED, DepositType.PERCENTAGE, 40, false, 2, "Includes shade planning."),
    ],
  },
  {
    slug: "copper-calm-facial-loft",
    name: "Copper Calm Facial Loft",
    providerType: ProviderType.VERIFIED_BUSINESS,
    status: ProviderStatus.LIVE,
    plan: SubscriptionPlan.BASIC,
    headline: "Quiet advanced facials focused on hydration, barrier repair, and gentle recovery.",
    shortDescription:
      "A refined facial loft with restorative treatments, thoughtful lighting, and no hard-sell atmosphere.",
    story:
      "Copper Calm attracts clients who want skin support without feeling pushed into upsells. The menu stays focused, the aftercare is excellent, and the team is especially good with stressed or sensitized student skin.",
    approximateArea: "Armory Park",
    neighborhood: "Armory Park",
    distanceMiles: 3.5,
    yearsExperience: 7,
    identityVerified: true,
    portfolioReviewed: true,
    responseTimeMinutes: 19,
    profileCompleteness: 94,
    portfolioQuality: 93,
    completedBookingsCount: 118,
    reviewAverage: 4.8,
    reviewCount: 43,
    cancellationRate: 0.03,
    disputeRate: 0.0,
    repeatBookingRate: 0.54,
    noShowRate: 0.01,
    conversionRate: 0.38,
    coverTone: "#E7E0DA",
    accentTone: "#7B655F",
    cancellationPolicy: CancellationPolicy.STANDARD,
    featuredSurfaces: [FeaturedSurface.HOMEPAGE_TOP_TRUSTED],
    services: [
      service("advanced-facials", "Hydration Reset Facial", "Deep hydration treatment with barrier-support layering.", 60, 128, PaymentRequirement.FULL_PREPAY, DepositType.NONE, 0, true, 1, "Quiet room and low-fragrance products."),
      service("advanced-facials", "Sensitive Skin Recovery", "Gentle protocol built for redness, stress, and recovery.", 75, 142, PaymentRequirement.FULL_PREPAY, DepositType.NONE, 0, false, 2, "Strong aftercare notes included."),
    ],
  },
  {
    slug: "silk-route-beauty-loft",
    name: "Silk Route Beauty Loft",
    providerType: ProviderType.VERIFIED_INDEPENDENT,
    status: ProviderStatus.PENDING_APPROVAL,
    plan: SubscriptionPlan.BASIC,
    headline: "Pending approval: lash and brow appointments in a private loft studio.",
    shortDescription:
      "Application received and currently under review before any public launch placement.",
    story:
      "Silk Route Beauty Loft is in the approval pipeline and not visible on public pages until verification is complete.",
    approximateArea: "Blenman-Elm",
    neighborhood: "Blenman-Elm",
    privateAddress: "Private loft near Speedway",
    distanceMiles: 1.6,
    yearsExperience: 2,
    identityVerified: true,
    portfolioReviewed: false,
    responseTimeMinutes: 41,
    profileCompleteness: 84,
    portfolioQuality: 78,
    completedBookingsCount: 17,
    reviewAverage: 4.6,
    reviewCount: 7,
    cancellationRate: 0.08,
    disputeRate: 0.0,
    repeatBookingRate: 0.33,
    noShowRate: 0.03,
    conversionRate: 0.25,
    coverTone: "#EAD9E0",
    accentTone: "#8C6874",
    cancellationPolicy: CancellationPolicy.STANDARD,
    services: [
      service("lashes", "Wispy Full Set", "Pending verification service menu.", 120, 94, PaymentRequirement.DEPOSIT_REQUIRED, DepositType.FIXED, 25),
      service("brows", "Brow Lamination", "Pending verification service menu.", 45, 52, PaymentRequirement.FULL_PREPAY),
    ],
  },
  {
    slug: "main-gate-injectables",
    name: "Main Gate Injectables",
    providerType: ProviderType.VERIFIED_BUSINESS,
    status: ProviderStatus.APPROVED,
    plan: SubscriptionPlan.PREMIUM,
    headline: "Approved internally, waiting on launch timing and final moderation.",
    shortDescription:
      "Higher-tier provider approved for launch prep but not yet switched live.",
    story:
      "Main Gate Injectables has cleared initial credential review but remains off public surfaces until launch sequencing is finalized.",
    approximateArea: "Main Gate",
    neighborhood: "Main Gate Square",
    distanceMiles: 0.5,
    yearsExperience: 9,
    identityVerified: true,
    portfolioReviewed: true,
    responseTimeMinutes: 18,
    profileCompleteness: 97,
    portfolioQuality: 94,
    completedBookingsCount: 92,
    reviewAverage: 4.8,
    reviewCount: 29,
    cancellationRate: 0.03,
    disputeRate: 0.0,
    repeatBookingRate: 0.51,
    noShowRate: 0.01,
    conversionRate: 0.37,
    coverTone: "#E5D6D1",
    accentTone: "#88655E",
    cancellationPolicy: CancellationPolicy.STRICT,
    services: [
      service("injectables", "Consult + Eligibility Review", "Pre-launch consult package.", 30, 125, PaymentRequirement.FULL_PREPAY),
      service("advanced-facials", "Clinical Glow Facial", "Pre-launch advanced facial listing.", 55, 138, PaymentRequirement.FULL_PREPAY),
    ],
  },
  {
    slug: "blush-bungalow-brows",
    name: "Blush Bungalow Brows",
    providerType: ProviderType.VERIFIED_INDEPENDENT,
    status: ProviderStatus.PENDING_OUTREACH,
    plan: SubscriptionPlan.BASIC,
    headline: "Lead discovered and currently in outreach before any verification work begins.",
    shortDescription:
      "Internal lead only. Public listing is gated until provider responds and completes verification.",
    story:
      "This provider exists only in the outreach pipeline and should never be visible on public marketplace pages.",
    approximateArea: "Jefferson Park",
    neighborhood: "Jefferson Park",
    privateAddress: "Private studio",
    distanceMiles: 1.8,
    yearsExperience: 4,
    identityVerified: false,
    portfolioReviewed: false,
    responseTimeMinutes: 90,
    profileCompleteness: 61,
    portfolioQuality: 60,
    completedBookingsCount: 0,
    reviewAverage: 0,
    reviewCount: 0,
    cancellationRate: 0.0,
    disputeRate: 0.0,
    repeatBookingRate: 0.0,
    noShowRate: 0.0,
    conversionRate: 0.0,
    coverTone: "#F0E0D9",
    accentTone: "#9F7467",
    cancellationPolicy: CancellationPolicy.FLEXIBLE,
    services: [
      service("brows", "Shape + Tint", "Internal outreach placeholder.", 30, 32, PaymentRequirement.FULL_PREPAY),
    ],
  },
  {
    slug: "rosewater-aesthetic-bar",
    name: "Rosewater Aesthetic Bar",
    providerType: ProviderType.VERIFIED_BUSINESS,
    status: ProviderStatus.SUSPENDED,
    plan: SubscriptionPlan.BASIC,
    headline: "Suspended listing kept internal for moderation and dispute review.",
    shortDescription:
      "This provider is fully hidden from public surfaces while the team completes review.",
    story:
      "Rosewater Aesthetic Bar remains off-platform while internal moderation and documentation follow-up are completed.",
    approximateArea: "Central Tucson",
    neighborhood: "Central Tucson",
    distanceMiles: 3.4,
    yearsExperience: 6,
    identityVerified: true,
    portfolioReviewed: true,
    responseTimeMinutes: 37,
    profileCompleteness: 89,
    portfolioQuality: 82,
    completedBookingsCount: 44,
    reviewAverage: 4.2,
    reviewCount: 18,
    cancellationRate: 0.12,
    disputeRate: 0.03,
    repeatBookingRate: 0.31,
    noShowRate: 0.04,
    conversionRate: 0.22,
    coverTone: "#EAD9D4",
    accentTone: "#8E6667",
    cancellationPolicy: CancellationPolicy.STRICT,
    services: [
      service("advanced-facials", "Chemical Peel Review", "Suspended listing placeholder.", 45, 125, PaymentRequirement.FULL_PREPAY),
    ],
  },
  {
    slug: "arizona-nail-collective",
    name: "Arizona Nail Collective",
    providerType: ProviderType.VERIFIED_BUSINESS,
    status: ProviderStatus.DRAFT,
    plan: SubscriptionPlan.SPOTLIGHT,
    headline: "Draft-only record kept for sales and moderation prep.",
    shortDescription:
      "Draft provider record not yet ready for approval or public review.",
    story:
      "Arizona Nail Collective is still assembling profile copy, portfolio approvals, and pricing before submission.",
    approximateArea: "Midtown",
    neighborhood: "Midtown",
    distanceMiles: 3.9,
    yearsExperience: 5,
    identityVerified: false,
    portfolioReviewed: false,
    responseTimeMinutes: 52,
    profileCompleteness: 58,
    portfolioQuality: 55,
    completedBookingsCount: 0,
    reviewAverage: 0,
    reviewCount: 0,
    cancellationRate: 0.0,
    disputeRate: 0.0,
    repeatBookingRate: 0.0,
    noShowRate: 0.0,
    conversionRate: 0.0,
    coverTone: "#E8D8CF",
    accentTone: "#7B6059",
    cancellationPolicy: CancellationPolicy.STANDARD,
    services: [
      service("nails", "Structured Gel Set", "Draft listing service.", 90, 64, PaymentRequirement.DEPOSIT_REQUIRED, DepositType.FIXED, 20),
    ],
  },
];

const bookingSeeds: BookingSeed[] = [
  {
    reference: bookingReference("2401"),
    userEmail: demoEmail("mia"),
    providerSlug: "sonoran-silk-studio",
    serviceName: "Gloss + Blowout",
    status: "CONFIRMED",
    paymentOption: PaymentOption.DEPOSIT,
    slotIndex: 0,
    notes: "Need to be done by noon for chapter photos.",
    mockLast4: "4242",
  },
  {
    reference: bookingReference("2402"),
    userEmail: demoEmail("mia"),
    providerSlug: "mesa-muse-mobile-tan",
    serviceName: "On-Site Rapid Tan",
    status: "CONFIRMED",
    paymentOption: PaymentOption.DEPOSIT,
    slotIndex: 1,
    notes: "Apartment gate code will be sent after confirmation.",
    mockLast4: "1881",
  },
  {
    reference: bookingReference("2403"),
    userEmail: demoEmail("mia"),
    providerSlug: "copper-bloom-nails",
    serviceName: "Structured Gel Full Set",
    status: "COMPLETED",
    paymentOption: PaymentOption.DEPOSIT,
    manualOffsetHours: -240,
    mockLast4: "4242",
    review: {
      rating: 5,
      title: "The cleanest nude set I have had in Tucson",
      body: "Timing was accurate, the prep was super careful, and the set still looked polished nearly three weeks later.",
    },
  },
  {
    reference: bookingReference("2404"),
    userEmail: demoEmail("mia"),
    providerSlug: "luna-lash-lab",
    serviceName: "Hybrid Full Set",
    status: "COMPLETED",
    paymentOption: PaymentOption.DEPOSIT,
    manualOffsetHours: -420,
    mockLast4: "4812",
    review: {
      rating: 5,
      title: "Exactly the soft lash look I wanted",
      body: "She mapped the set around my eye shape and it photographed really naturally for a formal.",
    },
  },
  {
    reference: bookingReference("2405"),
    userEmail: demoEmail("mia"),
    providerSlug: "scout-and-sage-wax-bar",
    serviceName: "Brow Wax + Shape",
    status: "COMPLETED",
    paymentOption: PaymentOption.FULL_PREPAY,
    manualOffsetHours: -168,
    mockLast4: "1881",
  },
  {
    reference: bookingReference("2406"),
    userEmail: demoEmail("ava"),
    providerSlug: "halo-house-beauty-bus",
    serviceName: "Dorm Blowout",
    status: "CONFIRMED",
    paymentOption: PaymentOption.DEPOSIT,
    slotIndex: 0,
    notes: "Three roommates are getting ready together.",
    mockLast4: "9922",
  },
  {
    reference: bookingReference("2407"),
    userEmail: demoEmail("camila"),
    providerSlug: "cielo-med-aesthetics",
    serviceName: "Barrier Reset Facial",
    status: "COMPLETED",
    paymentOption: PaymentOption.FULL_PREPAY,
    manualOffsetHours: -312,
    mockLast4: "2291",
    review: {
      rating: 5,
      title: "Premium without feeling intimidating",
      body: "Everything felt safe and polished. I appreciated how clearly they explained aftercare and next steps.",
    },
  },
  {
    reference: bookingReference("2408"),
    userEmail: demoEmail("nina"),
    providerSlug: "velvet-prickly-nail-lounge",
    serviceName: "Editorial Sculpted Set",
    status: "COMPLETED",
    paymentOption: PaymentOption.DEPOSIT,
    manualOffsetHours: -504,
    mockLast4: "7750",
    review: {
      rating: 5,
      title: "Worth the longer appointment",
      body: "The consultation was thoughtful and the linework looked editorial without being overdone.",
    },
  },
  {
    reference: bookingReference("2409"),
    userEmail: demoEmail("zoe"),
    providerSlug: "campus-glow-skin-clinic",
    serviceName: "Dermaplane + Hydration",
    status: "COMPLETED",
    paymentOption: PaymentOption.FULL_PREPAY,
    manualOffsetHours: -216,
    mockLast4: "3317",
    review: {
      rating: 4,
      title: "Great post-travel reset",
      body: "My skin looked brighter immediately and the clinic notes were actually helpful instead of salesy.",
    },
  },
  {
    reference: bookingReference("2410"),
    userEmail: demoEmail("camila"),
    providerSlug: "desert-veil-tans",
    serviceName: "Classic Weekend Glow",
    status: "CANCELED",
    paymentOption: PaymentOption.DEPOSIT,
    manualOffsetHours: -36,
    mockLast4: "9090",
  },
  {
    reference: bookingReference("2411"),
    userEmail: demoEmail("ava"),
    providerSlug: "rosewater-aesthetic-bar",
    serviceName: "Chemical Peel Review",
    status: "DISPUTED",
    paymentOption: PaymentOption.FULL_PREPAY,
    manualOffsetHours: -120,
    mockLast4: "5321",
    dispute: {
      reason: "Client reported a treatment mismatch and requested a refund review.",
      resolutionSummary: "Pending documentation from provider before final refund decision.",
    },
  },
  {
    reference: bookingReference("2412"),
    userEmail: demoEmail("mia"),
    providerSlug: "sunroom-brow-atelier",
    serviceName: "Shape + Tint",
    status: "COMPLETED",
    paymentOption: PaymentOption.FULL_PREPAY,
    manualOffsetHours: -72,
    mockLast4: "1881",
    review: {
      rating: 5,
      title: "Fast, soft, and really flattering",
      body: "Perfect between classes and the tint matched my color better than most brow studios.",
    },
  },
];

async function main() {
  if (seedIfEmpty) {
    const existingProviders = await prisma.provider.count();
    if (existingProviders > 0) {
      console.log(`Skipping seed because ${existingProviders} providers already exist.`);
      return;
    }
  }

  if (resetMode) {
    await clearDatabase();
  }

  const school = await prisma.school.create({
    data: {
      name: "University of Arizona",
      slug: "university-of-arizona",
      city: "Tucson",
      state: "AZ",
      campusArea: "Main Gate to Campbell Corridor",
      isLaunchMarket: true,
      launchOrder: 1,
    },
  });

  await prisma.school.create({
    data: {
      name: "Arizona State University",
      slug: "arizona-state-university",
      city: "Tempe",
      state: "AZ",
      campusArea: "Tempe Campus",
      isLaunchMarket: false,
      launchOrder: 2,
    },
  });

  const categories = await seedCategories();
  const users = await seedUsers(school.id);
  const providers = await seedProviders(school.id, categories, users);
  await seedPipelineData(school.id, providers, users);
  await seedBookings(providers, users);
  await seedSavedProviders(providers, users);
  await seedAdminNotes(providers, users);
  await seedContactMessages();

  console.log("Seeded Aurelle marketplace");
  console.log(`Live providers: ${providerSeeds.filter((provider) => provider.status === ProviderStatus.LIVE).length}`);
  console.log(`Demo login password for all seed users: ${DEMO_PASSWORD}`);
}

async function clearDatabase() {
  await prisma.adminNote.deleteMany();
  await prisma.contactSubmission.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.review.deleteMany();
  await prisma.paymentRecord.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.savedProvider.deleteMany();
  await prisma.trustSignal.deleteMany();
  await prisma.featuredPlacement.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.availabilitySlot.deleteMany();
  await prisma.service.deleteMany();
  await prisma.providerPhoto.deleteMany();
  await prisma.providerApplication.deleteMany();
  await prisma.claimRequest.deleteMany();
  await prisma.outreachLead.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.user.deleteMany();
  await prisma.school.deleteMany();
}

async function seedCategories() {
  const result = new Map<string, { id: string; name: string; isHighTier: boolean }>();

  for (const category of categorySeeds) {
    const created = await prisma.serviceCategory.create({ data: category });
    result.set(category.slug, {
      id: created.id,
      name: created.name,
      isHighTier: created.isHighTier,
    });
  }

  return result;
}

async function seedUsers(schoolId: string) {
  const result = new Map<string, { id: string; firstName: string; lastName: string }>();

  for (const user of userSeeds) {
    const created = await prisma.user.create({
      data: {
        ...user,
        passwordHash,
        schoolId,
      },
    });

    result.set(user.email, {
      id: created.id,
      firstName: created.firstName,
      lastName: created.lastName,
    });
  }

  return result;
}

async function seedProviders(
  schoolId: string,
  categories: Map<string, { id: string; name: string; isHighTier: boolean }>,
  users: Map<string, { id: string; firstName: string; lastName: string }>
) {
  const result = new Map<
    string,
    {
      id: string;
      name: string;
      providerType: ProviderType;
      plan: SubscriptionPlan;
      cancellationPolicy: CancellationPolicy;
      approximateArea: string;
      isMobileService: boolean;
      services: Map<string, { id: string; priceCents: number; durationMinutes: number; paymentRequirement: PaymentRequirement; depositType: DepositType; depositValue: number }>;
      slots: string[];
    }
  >();

  for (const [index, provider] of providerSeeds.entries()) {
    validateProviderCategories(provider, categories);

    const trustScore = calculateTrustScore(provider);
    const created = await prisma.provider.create({
      data: {
        slug: provider.slug,
        name: provider.name,
        providerType: provider.providerType,
        status: provider.status,
        schoolId,
        ownerId: provider.ownerEmail ? users.get(provider.ownerEmail)?.id : undefined,
        plan: provider.plan,
        headline: provider.headline,
        shortDescription: provider.shortDescription,
        story: provider.story,
        approximateArea: provider.approximateArea,
        neighborhood: provider.neighborhood,
        privateAddress: provider.privateAddress,
        distanceMiles: provider.distanceMiles,
        serviceRadiusMiles: provider.serviceRadiusMiles,
        yearsExperience: provider.yearsExperience,
        isMobileService: provider.isMobileService ?? false,
        acceptsNewClients: provider.acceptsNewClients ?? true,
        claimable: provider.claimable ?? false,
        identityVerified: provider.identityVerified,
        portfolioReviewed: provider.portfolioReviewed,
        responseTimeMinutes: provider.responseTimeMinutes,
        profileCompleteness: provider.profileCompleteness,
        portfolioQuality: provider.portfolioQuality,
        completedBookingsCount: provider.completedBookingsCount,
        reviewAverage: provider.reviewAverage,
        reviewCount: provider.reviewCount,
        cancellationRate: provider.cancellationRate,
        disputeRate: provider.disputeRate,
        repeatBookingRate: provider.repeatBookingRate,
        noShowRate: provider.noShowRate,
        conversionRate: provider.conversionRate,
        trustScore,
        rankingBoost: provider.plan === SubscriptionPlan.PREMIUM ? 0.35 : provider.plan === SubscriptionPlan.SPOTLIGHT ? 0.18 : 0.05,
        featuredWeight: provider.featuredSurfaces?.length ?? 0,
        startingPriceCents: Math.min(...provider.services.map((service) => toCents(service.price))),
        coverTone: provider.coverTone,
        accentTone: provider.accentTone,
        cancellationPolicy: provider.cancellationPolicy,
      },
    });

    await prisma.subscription.create({
      data: {
        providerId: created.id,
        plan: provider.plan,
        status: provider.status === ProviderStatus.SUSPENDED ? SubscriptionStatus.CANCELED : SubscriptionStatus.ACTIVE,
        monthlyPriceCents: provider.plan === SubscriptionPlan.BASIC ? 0 : provider.plan === SubscriptionPlan.SPOTLIGHT ? 9900 : 18900,
        renewsAt: addMonths(now, 1),
        analyticsNote:
          provider.plan === SubscriptionPlan.BASIC
            ? "Core booking access, payout tracking, review collection, and standard listing."
            : provider.plan === SubscriptionPlan.SPOTLIGHT
              ? "Highlighted card styling, richer gallery capacity, seasonal promo eligibility, and basic analytics."
              : "Homepage feature eligibility, richer analytics, promo tools, and strongest profile presentation.",
      },
    });

    const serviceMap = new Map<string, { id: string; priceCents: number; durationMinutes: number; paymentRequirement: PaymentRequirement; depositType: DepositType; depositValue: number }>();
    const categoryNames = new Set<string>();

    for (const serviceSeed of provider.services) {
      const category = categories.get(serviceSeed.category);
      if (!category) {
        throw new Error(`Missing category ${serviceSeed.category}`);
      }

      categoryNames.add(category.name);

      const createdService = await prisma.service.create({
        data: {
          providerId: created.id,
          categoryId: category.id,
          name: serviceSeed.name,
          description: serviceSeed.description,
          durationMinutes: serviceSeed.duration,
          priceCents: toCents(serviceSeed.price),
          paymentRequirement: serviceSeed.paymentRequirement,
          depositType: serviceSeed.depositType ?? DepositType.NONE,
          depositValue: serviceSeed.depositValue ?? 0,
          isFeatured: serviceSeed.featured ?? false,
          popularityRank: serviceSeed.popularityRank ?? 0,
          studentPerk: serviceSeed.studentPerk,
        },
      });

      serviceMap.set(serviceSeed.name, {
        id: createdService.id,
        priceCents: createdService.priceCents,
        durationMinutes: createdService.durationMinutes,
        paymentRequirement: createdService.paymentRequirement,
        depositType: createdService.depositType,
        depositValue: createdService.depositValue,
      });
    }

    const photos = buildPhotos(provider.name, provider.coverTone, provider.accentTone, [...categoryNames]);
    for (const [photoIndex, photo] of photos.entries()) {
      await prisma.providerPhoto.create({
        data: {
          providerId: created.id,
          title: photo.title,
          caption: photo.caption,
          gradientFrom: photo.gradientFrom,
          gradientTo: photo.gradientTo,
          accentTone: provider.accentTone,
          kind: photo.kind,
          sortOrder: photoIndex,
        },
      });
    }

    for (const signal of buildTrustSignals(provider, trustScore)) {
      await prisma.trustSignal.create({
        data: {
          providerId: created.id,
          type: signal.type,
          label: signal.label,
          value: signal.value,
          note: signal.note,
          isPublic: signal.isPublic,
          sortOrder: signal.sortOrder,
        },
      });
    }

    for (const [surfaceIndex, surface] of (provider.featuredSurfaces ?? []).entries()) {
      await prisma.featuredPlacement.create({
        data: {
          providerId: created.id,
          surface,
          label: buildPlacementLabel(surface),
          sortOrder: surfaceIndex + 1,
          active: provider.status === ProviderStatus.LIVE,
          startsAt: now,
        },
      });
    }

    const slotIds = await seedAvailabilitySlots(created.id, serviceMap, index);

    result.set(provider.slug, {
      id: created.id,
      name: created.name,
      providerType: provider.providerType,
      plan: provider.plan,
      cancellationPolicy: provider.cancellationPolicy,
      approximateArea: provider.approximateArea,
      isMobileService: provider.isMobileService ?? false,
      services: serviceMap,
      slots: slotIds,
    });
  }

  return result;
}

async function seedAvailabilitySlots(
  providerId: string,
  services: Map<string, { id: string; durationMinutes: number }>,
  providerIndex: number
) {
  const slotIds: string[] = [];
  const serviceEntries = [...services.values()];
  const dayOffsets = [1, 1, 2, 3, 5, 6];
  const hourTemplates = [9, 11, 13, 15, 10, 14];
  const minuteTemplates = [0, 30, 0, 30, 15, 45];

  for (const [index, dayOffset] of dayOffsets.entries()) {
    const service = serviceEntries[index % serviceEntries.length];
    const hour = hourTemplates[index] + (providerIndex % 3);
    const minute = minuteTemplates[index];
    const start = addMinutes(addHours(startOfDay(addDays(now, dayOffset)), hour), minute);
    const end = addMinutes(start, service.durationMinutes);
    const slot = await prisma.availabilitySlot.create({
      data: {
        providerId,
        serviceId: service.id,
        startsAt: start,
        endsAt: end,
      },
    });
    slotIds.push(slot.id);
  }

  return slotIds;
}

async function seedPipelineData(
  schoolId: string,
  providers: Map<string, { id: string }>,
  users: Map<string, { id: string }>
) {
  await prisma.providerApplication.createMany({
    data: [
      {
        schoolId,
        businessName: "Saguaro Silk Blowout Bar",
        providerType: ProviderType.VERIFIED_BUSINESS,
        mobileService: false,
        email: "hello@saguarosilk.demo",
        phone: "(520) 555-1010",
        cityArea: "Main Gate",
        categoriesCsv: "hair,brows",
        portfolioSummary: "Two-chair salon with glossy blowout work, neutral branding, and strong before/after photos.",
        note: "Requested a soft launch slot before graduation season.",
        status: ApplicationStatus.SUBMITTED,
      },
      {
        schoolId,
        applicantUserId: users.get(demoEmail("provider"))?.id,
        businessName: "Halo House Expansion",
        providerType: ProviderType.VERIFIED_INDEPENDENT,
        mobileService: true,
        email: demoEmail("provider"),
        phone: "(520) 555-0122",
        cityArea: "U of A radius",
        categoriesCsv: "hair,brows",
        portfolioSummary: "Request to add a second mobile stylist for group bookings.",
        note: "Needs added operator approval and insurance review.",
        status: ApplicationStatus.UNDER_REVIEW,
      },
    ],
  });

  await prisma.claimRequest.createMany({
    data: [
      {
        schoolId,
        providerId: providers.get("sonoran-silk-studio")?.id,
        claimantName: "Dani Flores",
        claimantEmail: "dani@sonoransilk.demo",
        businessName: "Sonoran Silk Studio",
        instagramHandle: "@sonoransilkstudio",
        note: "Owner asked to claim listing and connect a front-desk account.",
        status: ClaimStatus.UNDER_REVIEW,
      },
      {
        schoolId,
        providerId: providers.get("rooted-ritual-hair-co")?.id,
        claimantName: "Ari Vega",
        claimantEmail: "ari@rootedritual.demo",
        businessName: "Rooted Ritual Hair Co.",
        instagramHandle: "@rootedritualhair",
        note: "Requested to update team bios and pricing before activating profile claim.",
        status: ClaimStatus.CONTACTED,
      },
    ],
  });

  await prisma.outreachLead.createMany({
    data: [
      {
        schoolId,
        providerId: providers.get("blush-bungalow-brows")?.id,
        businessName: "Blush Bungalow Brows",
        contactName: "Maya Torres",
        contactChannel: "Instagram DM",
        categoryFocus: "Brows",
        neighborhood: "Jefferson Park",
        status: OutreachStatus.CONTACTED,
        note: "Initial outreach sent with approval requirements and marketplace intro deck.",
      },
      {
        schoolId,
        providerId: providers.get("main-gate-injectables")?.id,
        businessName: "Main Gate Injectables",
        contactName: "Front Desk",
        contactChannel: "Email",
        categoryFocus: "Injectables",
        neighborhood: "Main Gate",
        status: OutreachStatus.APPROVED,
        note: "Approved internally, waiting on go-live timing.",
      },
      {
        schoolId,
        businessName: "Gloss Room Tucson",
        contactName: "Bella Quinn",
        contactChannel: "Referral",
        categoryFocus: "Hair",
        neighborhood: "Fourth Avenue",
        status: OutreachStatus.INTERESTED,
        note: "Requested revenue and trust model overview before applying.",
      },
    ],
  });
}

async function seedBookings(
  providers: Map<
    string,
    {
      id: string;
      providerType: ProviderType;
      cancellationPolicy: CancellationPolicy;
      approximateArea: string;
      isMobileService: boolean;
      services: Map<string, { id: string; priceCents: number; durationMinutes: number; paymentRequirement: PaymentRequirement; depositType: DepositType; depositValue: number }>;
      slots: string[];
    }
  >,
  users: Map<string, { id: string }>
) {
  for (const bookingSeed of bookingSeeds) {
    const provider = providers.get(bookingSeed.providerSlug);
    const user = users.get(bookingSeed.userEmail);

    if (!provider || !user) {
      throw new Error(`Missing provider or user for booking ${bookingSeed.reference}`);
    }

    const service = provider.services.get(bookingSeed.serviceName);
    if (!service) {
      throw new Error(`Missing service ${bookingSeed.serviceName} for booking ${bookingSeed.reference}`);
    }

    let appointmentStart: Date;
    let appointmentEnd: Date;
    let slotId: string | undefined;

    if (bookingSeed.status === "CONFIRMED" && bookingSeed.slotIndex !== undefined) {
      slotId = provider.slots[bookingSeed.slotIndex];
      const slot = await prisma.availabilitySlot.findUniqueOrThrow({
        where: { id: slotId },
      });
      appointmentStart = slot.startsAt;
      appointmentEnd = slot.endsAt;
      await prisma.availabilitySlot.update({
        where: { id: slotId },
        data: { isBooked: true },
      });
    } else {
      appointmentStart = addHours(today, bookingSeed.manualOffsetHours ?? -96);
      appointmentEnd = addMinutes(appointmentStart, service.durationMinutes);
    }

    const checkout = computeCheckout(service.priceCents, bookingSeed.paymentOption, service.paymentRequirement, service.depositType, service.depositValue);
    const platformFeeRate = provider.providerType === ProviderType.VERIFIED_BUSINESS ? 0.03 : 0.05;
    const platformFeeCents = Math.round(service.priceCents * platformFeeRate);
    const providerPayoutCents = service.priceCents - platformFeeCents;

    const statusMap = {
      CONFIRMED: "CONFIRMED",
      COMPLETED: "COMPLETED",
      CANCELED: "CANCELED",
      DISPUTED: "DISPUTED",
    } as const;

    const booking = await prisma.booking.create({
      data: {
        reference: bookingSeed.reference,
        userId: user.id,
        providerId: provider.id,
        serviceId: service.id,
        slotId,
        status: statusMap[bookingSeed.status],
        paymentOption: bookingSeed.paymentOption,
        appointmentStart,
        appointmentEnd,
        notes: bookingSeed.notes,
        priceCents: service.priceCents,
        chargeNowCents: checkout.chargeNowCents,
        remainingDueCents: checkout.remainingDueCents,
        platformFeeRate,
        platformFeeCents,
        providerPayoutCents,
        areaSnapshot: provider.approximateArea,
        mobileSnapshot: provider.isMobileService,
        cancellationPolicy: provider.cancellationPolicy,
        cancellationDeadline: computeCancellationDeadline(appointmentStart, provider.cancellationPolicy),
        canceledAt: bookingSeed.status === "CANCELED" ? addHours(appointmentStart, -12) : null,
        completedAt: bookingSeed.status === "COMPLETED" ? addMinutes(appointmentEnd, 90) : null,
      },
    });

    await prisma.paymentRecord.create({
      data: {
        bookingId: booking.id,
        kind: bookingSeed.paymentOption === PaymentOption.DEPOSIT ? PaymentKind.DEPOSIT : PaymentKind.FULL_PREPAY,
        status:
          bookingSeed.status === "CANCELED"
            ? PaymentStatus.REFUNDED
            : bookingSeed.status === "COMPLETED"
              ? PaymentStatus.RELEASED
              : PaymentStatus.HELD,
        amountCents: checkout.chargeNowCents,
        mockBrand: "Visa",
        mockLast4: bookingSeed.mockLast4,
        externalReference: `mock_${bookingSeed.reference.toLowerCase()}`,
        releasedAt: bookingSeed.status === "COMPLETED" ? addHours(appointmentEnd, 36) : null,
        refundedAt: bookingSeed.status === "CANCELED" ? addHours(appointmentStart, -10) : null,
      },
    });

    if (bookingSeed.status !== "CANCELED") {
      await prisma.payout.create({
        data: {
          providerId: provider.id,
          bookingId: booking.id,
          status:
            bookingSeed.status === "COMPLETED"
              ? PayoutStatus.RELEASED
              : bookingSeed.status === "DISPUTED"
                ? PayoutStatus.WITHHELD
                : PayoutStatus.HELD,
          grossAmountCents: service.priceCents,
          feeAmountCents: platformFeeCents,
          netAmountCents: providerPayoutCents,
          scheduledFor: addDays(appointmentEnd, 2),
          releasedAt: bookingSeed.status === "COMPLETED" ? addDays(appointmentEnd, 2) : null,
        },
      });
    }

    if (bookingSeed.review) {
      await prisma.review.create({
        data: {
          bookingId: booking.id,
          userId: user.id,
          providerId: provider.id,
          rating: bookingSeed.review.rating,
          title: bookingSeed.review.title,
          body: bookingSeed.review.body,
          wouldRebook: bookingSeed.review.wouldRebook ?? true,
          createdAt: addHours(appointmentEnd, 30),
        },
      });
    }

    if (bookingSeed.dispute) {
      await prisma.dispute.create({
        data: {
          bookingId: booking.id,
          status: DisputeStatus.OPEN,
          reason: bookingSeed.dispute.reason,
          resolutionSummary: bookingSeed.dispute.resolutionSummary,
          openedAt: addHours(appointmentEnd, 18),
        },
      });
    }
  }
}

async function seedSavedProviders(
  providers: Map<string, { id: string }>,
  users: Map<string, { id: string }>
) {
  const mia = users.get(demoEmail("mia"));
  const ava = users.get(demoEmail("ava"));

  if (!mia || !ava) {
    return;
  }

  await prisma.savedProvider.createMany({
    data: [
      { userId: mia.id, providerId: providers.get("copper-bloom-nails")!.id },
      { userId: mia.id, providerId: providers.get("sonoran-silk-studio")!.id },
      { userId: mia.id, providerId: providers.get("mesa-muse-mobile-tan")!.id },
      { userId: mia.id, providerId: providers.get("cielo-med-aesthetics")!.id },
      { userId: ava.id, providerId: providers.get("halo-house-beauty-bus")!.id },
      { userId: ava.id, providerId: providers.get("sunroom-brow-atelier")!.id },
    ],
  });
}

async function seedAdminNotes(
  providers: Map<string, { id: string }>,
  users: Map<string, { id: string }>
) {
  const adminId = users.get(demoEmail("admin"))?.id;
  if (!adminId) {
    return;
  }

  const disputedBooking = await prisma.booking.findUnique({ where: { reference: bookingReference("2411") } });
  const sonoranClaim = await prisma.claimRequest.findFirst({
    where: { businessName: "Sonoran Silk Studio" },
  });

  const notes: Prisma.AdminNoteCreateManyInput[] = [
    {
      authorId: adminId,
      scope: AdminNoteScope.PROVIDER,
      providerId: providers.get("silk-route-beauty-loft")?.id,
      title: "Portfolio follow-up needed",
      body: "Requested a second pass on before/after lighting consistency before approval can move forward.",
    },
    {
      authorId: adminId,
      scope: AdminNoteScope.BOOKING,
      bookingId: disputedBooking?.id,
      title: "Hold payout until documentation lands",
      body: "Keep funds held while provider submits treatment consent record and aftercare follow-up thread.",
    },
    {
      authorId: adminId,
      scope: AdminNoteScope.CLAIM,
      claimRequestId: sonoranClaim?.id,
      title: "Verify business email domain",
      body: "Claim request looks valid; waiting for domain-based verification before account handoff.",
    },
  ].flatMap((note) => (note.providerId || note.bookingId || note.claimRequestId ? [note] : []));

  await prisma.adminNote.createMany({
    data: notes,
  });
}

async function seedContactMessages() {
  await prisma.contactSubmission.createMany({
    data: [
      {
        name: "Lena Ross",
        email: "lena@example.com",
        reason: "provider-application",
        message: "Interested in joining as a verified independent for brows and lamination. Curious about approval timing for summer launch.",
      },
      {
        name: "Jordan Ellis",
        email: "jordan@example.com",
        reason: "campus-partnership",
        message: "Would love to discuss a student organization partnership for formals and graduation content.",
      },
    ],
  });
}

function service(
  category: string,
  name: string,
  description: string,
  duration: number,
  price: number,
  paymentRequirement: PaymentRequirement,
  depositType: DepositType = DepositType.NONE,
  depositValue = 0,
  featured = false,
  popularityRank = 0,
  studentPerk?: string
): SeedService {
  return {
    category,
    name,
    description,
    duration,
    price,
    paymentRequirement,
    depositType,
    depositValue,
    featured,
    popularityRank,
    studentPerk,
  };
}

function buildPhotos(name: string, coverTone: string, accentTone: string, categoryNames: string[]) {
  return [
    {
      title: `${name} signature finish`,
      caption: `Reviewed portfolio image showcasing ${categoryNames[0]?.toLowerCase() ?? "service"} work.`,
      gradientFrom: coverTone,
      gradientTo: mixHex(coverTone, "#FFFFFF", 0.38),
      kind: "cover",
    },
    {
      title: "Verified portfolio review",
      caption: `Aurelle reviewed texture, lighting, and result consistency across recent client work.`,
      gradientFrom: accentTone,
      gradientTo: mixHex(accentTone, "#F7F2EE", 0.56),
      kind: "detail",
    },
    {
      title: "Student-ready setup",
      caption: `Booking flow, service notes, and timing tuned for U of A schedules and event prep.`,
      gradientFrom: mixHex(coverTone, accentTone, 0.5),
      gradientTo: mixHex(coverTone, "#FFF7F3", 0.45),
      kind: "lifestyle",
    },
  ];
}

function calculateTrustScore(provider: SeedProvider) {
  const weighted =
    weightedPart(provider.identityVerified ? 1 : 0, 1.15) +
    weightedPart(provider.profileCompleteness / 100, 0.95) +
    weightedPart(provider.portfolioReviewed ? provider.portfolioQuality / 100 : 0.45, 1.05) +
    weightedPart(Math.min(provider.completedBookingsCount / 180, 1), 1.2) +
    weightedPart(Math.min(Math.max((provider.reviewAverage - 3.8) / 1.2, 0), 1), 1.25) +
    weightedPart(Math.min(provider.reviewCount / 60, 1), 0.7) +
    weightedPart(Math.max(1 - provider.responseTimeMinutes / 90, 0), 0.75) +
    weightedPart(Math.max(1 - provider.cancellationRate / 0.14, 0), 0.95) +
    weightedPart(Math.max(1 - provider.disputeRate / 0.05, 0), 0.65) +
    weightedPart(Math.min(provider.repeatBookingRate / 0.65, 1), 0.7) +
    weightedPart(Math.max(1 - provider.noShowRate / 0.06, 0), 0.65);

  const score = 4.35 + weighted * 0.53;
  return Number(Math.min(Math.max(score, 6.8), 9.8).toFixed(1));
}

function weightedPart(value: number, weight: number) {
  return value * weight;
}

function buildTrustSignals(provider: SeedProvider, trustScore: number) {
  return [
    {
      type: TrustSignalType.IDENTITY,
      label: "Verified identity",
      value: provider.identityVerified ? "Confirmed" : "In review",
      note: provider.identityVerified
        ? "Identity and business details verified before launch."
        : "Identity documents still being reviewed.",
      isPublic: true,
      sortOrder: 1,
    },
    {
      type: TrustSignalType.PORTFOLIO,
      label: "Portfolio reviewed",
      value: provider.portfolioReviewed ? "Approved" : "Pending",
      note: provider.portfolioReviewed
        ? "Portfolio quality and result consistency have been reviewed by Aurelle."
        : "Portfolio review must finish before public launch.",
      isPublic: true,
      sortOrder: 2,
    },
    {
      type: TrustSignalType.BOOKINGS,
      label: "Completed bookings",
      value: `${provider.completedBookingsCount}`,
      note: "Shows completed appointment history tracked by the platform and imported launch data.",
      isPublic: true,
      sortOrder: 3,
    },
    {
      type: TrustSignalType.CANCELLATION,
      label: "Cancellation rate",
      value: `${Math.round(provider.cancellationRate * 100)}%`,
      note: provider.cancellationRate <= 0.05 ? "Low cancellation rate." : "Watchlist item for operations review.",
      isPublic: true,
      sortOrder: 4,
    },
    {
      type: TrustSignalType.REVIEWS,
      label: "Trust score",
      value: trustScore.toFixed(1),
      note: "Composite trust score blends quality, reliability, and marketplace performance signals.",
      isPublic: false,
      sortOrder: 5,
    },
    {
      type: TrustSignalType.RESPONSE,
      label: "Average response time",
      value: `${provider.responseTimeMinutes} min`,
      note: "Used internally for ranking and support quality checks.",
      isPublic: false,
      sortOrder: 6,
    },
    {
      type: TrustSignalType.REPEAT,
      label: "Repeat booking rate",
      value: `${Math.round(provider.repeatBookingRate * 100)}%`,
      note: "Repeat booking behavior supports ranking but does not override trust safeguards.",
      isPublic: false,
      sortOrder: 7,
    },
  ];
}

function computeCheckout(
  priceCents: number,
  paymentOption: PaymentOption,
  paymentRequirement: PaymentRequirement,
  depositType: DepositType,
  depositValue: number
) {
  if (paymentRequirement === PaymentRequirement.FULL_PREPAY || paymentOption === PaymentOption.FULL_PREPAY) {
    return {
      chargeNowCents: priceCents,
      remainingDueCents: 0,
    };
  }

  const chargeNowCents =
    depositType === DepositType.FIXED
      ? depositValue
      : depositType === DepositType.PERCENTAGE
        ? Math.round(priceCents * (depositValue / 100))
        : priceCents;

  return {
    chargeNowCents,
    remainingDueCents: Math.max(priceCents - chargeNowCents, 0),
  };
}

function computeCancellationDeadline(appointmentStart: Date, policy: CancellationPolicy) {
  const hours = policy === CancellationPolicy.STRICT ? 48 : 24;
  return addHours(appointmentStart, -hours);
}

function buildPlacementLabel(surface: FeaturedSurface) {
  switch (surface) {
    case FeaturedSurface.HOMEPAGE_POPULAR:
      return "Popular in Launch Market";
    case FeaturedSurface.HOMEPAGE_STUDENT_FAVORITES:
      return "Student Favorites";
    case FeaturedSurface.HOMEPAGE_AFFORDABLE:
      return "Affordable Picks";
    case FeaturedSurface.HOMEPAGE_TOP_TRUSTED:
      return "Top Trusted Providers";
    case FeaturedSurface.HOMEPAGE_LAST_MINUTE:
      return "Last-Minute Availability";
    case FeaturedSurface.SEARCH_SPOTLIGHT:
      return "Spotlight placement";
    default:
      return "Featured";
  }
}

function validateProviderCategories(
  provider: SeedProvider,
  categories: Map<string, { isHighTier: boolean }>
) {
  for (const service of provider.services) {
    const category = categories.get(service.category);
    if (!category) {
      throw new Error(`Missing category ${service.category} for ${provider.name}`);
    }

    if (provider.providerType !== ProviderType.VERIFIED_BUSINESS && category.isHighTier) {
      throw new Error(`${provider.name} is not allowed to offer ${service.category}`);
    }
  }
}

function hashPassword(password: string) {
  return scryptSync(password, "aurelle-demo-salt", 64).toString("hex");
}

function toCents(value: number) {
  return Math.round(value * 100);
}

function mixHex(hexA: string, hexB: string, ratio: number) {
  const a = hexA.replace("#", "");
  const b = hexB.replace("#", "");
  const r = mixChannel(a.slice(0, 2), b.slice(0, 2), ratio);
  const g = mixChannel(a.slice(2, 4), b.slice(2, 4), ratio);
  const bl = mixChannel(a.slice(4, 6), b.slice(4, 6), ratio);
  return `#${r}${g}${bl}`;
}

function mixChannel(valueA: string, valueB: string, ratio: number) {
  const channel = Math.round(parseInt(valueA, 16) * (1 - ratio) + parseInt(valueB, 16) * ratio);
  return channel.toString(16).padStart(2, "0");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
