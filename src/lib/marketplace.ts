import {
  BookingStatus,
  CancellationPolicy,
  FeaturedSurface,
  PaymentRequirement,
  PayoutStatus,
  ProviderStatus,
  ProviderType,
  SubscriptionPlan,
  type Prisma,
} from "@prisma/client";
import { addHours, endOfDay, isSameDay, parseISO, startOfDay } from "date-fns";
import { prisma } from "@/lib/db";
import { clamp, unique } from "@/lib/utils";

const providerPublicInclude = {
  photos: {
    orderBy: { sortOrder: "asc" },
  },
  services: {
    include: {
      category: true,
    },
    orderBy: [{ isFeatured: "desc" }, { popularityRank: "asc" }, { priceCents: "asc" }],
  },
  trustSignals: {
    orderBy: { sortOrder: "asc" },
  },
  reviews: {
    orderBy: { createdAt: "desc" },
    take: 6,
    include: {
      user: true,
    },
  },
  availabilitySlots: {
    where: {
      startsAt: { gte: new Date() },
      isBooked: false,
    },
    orderBy: { startsAt: "asc" },
    take: 8,
  },
  featuredPlacements: {
    where: {
      active: true,
    },
    orderBy: [{ surface: "asc" }, { sortOrder: "asc" }],
  },
  subscription: true,
  school: true,
} satisfies Prisma.ProviderInclude;

export type PublicProvider = Prisma.ProviderGetPayload<{
  include: typeof providerPublicInclude;
}>;

const accountBookingInclude = {
  provider: {
    include: {
      photos: { orderBy: { sortOrder: "asc" }, take: 1 },
      availabilitySlots: {
        where: {
          startsAt: { gte: new Date() },
          isBooked: false,
        },
        orderBy: { startsAt: "asc" },
        take: 4,
      },
    },
  },
  service: {
    include: {
      category: true,
    },
  },
  paymentRecords: true,
  review: true,
  payout: true,
} satisfies Prisma.BookingInclude;

export type AccountBooking = Prisma.BookingGetPayload<{
  include: typeof accountBookingInclude;
}>;

const providerDashboardInclude = {
  services: {
    include: { category: true },
    orderBy: { priceCents: "asc" },
  },
  availabilitySlots: {
    orderBy: { startsAt: "asc" },
    take: 14,
  },
  bookings: {
    include: {
      user: true,
      service: {
        include: { category: true },
      },
      paymentRecords: true,
      payout: true,
      review: true,
    },
    orderBy: { appointmentStart: "desc" },
    take: 24,
  },
  reviews: {
    include: {
      user: true,
      booking: true,
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  },
  trustSignals: {
    orderBy: { sortOrder: "asc" },
  },
  photos: {
    orderBy: { sortOrder: "asc" },
  },
  subscription: true,
  payouts: {
    orderBy: { createdAt: "desc" },
    take: 12,
  },
} satisfies Prisma.ProviderInclude;

export async function getLaunchSchool() {
  return prisma.school.findFirstOrThrow({
    where: { isLaunchMarket: true },
  });
}

export async function getCategories() {
  return prisma.serviceCategory.findMany({
    orderBy: { sortOrder: "asc" },
  });
}

export async function getPublicProviders() {
  return prisma.provider.findMany({
    where: {
      status: ProviderStatus.LIVE,
      school: {
        isLaunchMarket: true,
      },
    },
    include: providerPublicInclude,
  });
}

export function mapProviderCard(provider: PublicProvider, viewerSavedIds: string[] = []) {
  const prices = provider.services.map((service) => service.priceCents);
  const nextAvailability = provider.availabilitySlots[0]?.startsAt ?? null;
  const categoryTags = unique(provider.services.map((service) => service.category.name));
  const featuredTier = provider.plan !== SubscriptionPlan.BASIC;

  return {
    id: provider.id,
    slug: provider.slug,
    name: provider.name,
    headline: provider.headline,
    shortDescription: provider.shortDescription,
    providerType: provider.providerType,
    badge: provider.providerType === ProviderType.VERIFIED_BUSINESS ? "Verified Business" : "Verified Independent",
    isMobileService: provider.isMobileService,
    trustScore: provider.trustScore,
    categoryTags,
    startingPriceCents: Math.min(...prices),
    maxPriceCents: Math.max(...prices),
    approximateArea: provider.approximateArea,
    rating: provider.reviewAverage,
    reviewCount: provider.reviewCount,
    nextAvailability,
    featuredTier,
    featuredLabel:
      provider.plan === SubscriptionPlan.PREMIUM
        ? "Premium"
        : provider.plan === SubscriptionPlan.SPOTLIGHT
          ? "Spotlight"
          : "Basic",
    placementSurfaces: provider.featuredPlacements.map((placement) => placement.surface),
    photo: provider.photos[0],
    trustSignals: provider.trustSignals.filter((signal) => signal.isPublic).slice(0, 4),
    saved: viewerSavedIds.includes(provider.id),
    distanceMiles: provider.distanceMiles,
    paymentModes: {
      deposit: provider.services.some((service) => service.paymentRequirement === PaymentRequirement.DEPOSIT_REQUIRED),
      fullPrepay: provider.services.some((service) => service.paymentRequirement === PaymentRequirement.FULL_PREPAY),
    },
    services: provider.services,
  };
}

export type ProviderCard = ReturnType<typeof mapProviderCard>;

type BrowseInput = {
  search?: string;
  category?: string;
  providerType?: string;
  trustMin?: string;
  distanceMax?: string;
  minPrice?: string;
  maxPrice?: string;
  availabilityDate?: string;
  paymentType?: string;
  mobile?: string;
  sort?: string;
};

export async function getHomepageData(viewerId?: string | null) {
  const [school, categories, providers, saved] = await Promise.all([
    getLaunchSchool(),
    getCategories(),
    getPublicProviders(),
    viewerId
      ? prisma.savedProvider.findMany({
          where: { userId: viewerId },
          select: { providerId: true },
        })
      : Promise.resolve([]),
  ]);

  const savedIds = saved.map((item) => item.providerId);
  const cards = providers.map((provider) => mapProviderCard(provider, savedIds));

  const sections = {
    popular: pickSection(cards, "HOMEPAGE_POPULAR", cards.slice().sort((a, b) => b.reviewCount - a.reviewCount || a.distanceMiles - b.distanceMiles)),
    studentFavorites: pickSection(
      cards,
      "HOMEPAGE_STUDENT_FAVORITES",
      cards.slice().sort((a, b) => b.rating - a.rating || a.startingPriceCents - b.startingPriceCents)
    ),
    affordable: pickSection(cards, "HOMEPAGE_AFFORDABLE", cards.slice().sort((a, b) => a.startingPriceCents - b.startingPriceCents)),
    trusted: pickSection(cards, "HOMEPAGE_TOP_TRUSTED", cards.slice().sort((a, b) => b.trustScore - a.trustScore)),
    lastMinute: pickSection(
      cards,
      "HOMEPAGE_LAST_MINUTE",
      cards
        .filter((card) => card.nextAvailability && card.nextAvailability <= addHours(new Date(), 30))
        .sort((a, b) => Number(a.nextAvailability) - Number(b.nextAvailability))
    ),
  };

  return {
    school,
    categories,
    cards,
    sections,
    stats: {
      liveProviders: providers.length,
      averageTrust: (providers.reduce((sum, provider) => sum + provider.trustScore, 0) / providers.length).toFixed(1),
      completedBookings: providers.reduce((sum, provider) => sum + provider.completedBookingsCount, 0),
    },
  };
}

function pickSection(cards: ProviderCard[], surface: FeaturedSurface, fallback: ProviderCard[]) {
  const surfaced = cards.filter((card) => card.placementSurfaces.includes(surface));
  return (surfaced.length ? surfaced : fallback).slice(0, 4);
}

export async function getBrowseData(input: BrowseInput, viewerId?: string | null) {
  const [providers, categories, saved] = await Promise.all([
    getPublicProviders(),
    getCategories(),
    viewerId
      ? prisma.savedProvider.findMany({
          where: { userId: viewerId },
          select: { providerId: true },
        })
      : Promise.resolve([]),
  ]);

  const savedIds = saved.map((item) => item.providerId);
  const cards = providers.map((provider) => mapProviderCard(provider, savedIds));
  const filtered = filterBrowseCards(cards, input);
  const sorted = sortBrowseCards(filtered, input.sort ?? "best-match", input);

  return {
    categories,
    total: sorted.length,
    results: sorted,
    filters: input,
  };
}

function filterBrowseCards(cards: ReturnType<typeof mapProviderCard>[], input: BrowseInput) {
  return cards.filter((card) => {
    const searchTerm = input.search?.trim().toLowerCase();
    const categoryFilter = input.category?.toLowerCase();
    const providerType = input.providerType;
    const trustMin = input.trustMin ? Number(input.trustMin) : 0;
    const distanceMax = input.distanceMax ? Number(input.distanceMax) : Infinity;
    const minPrice = input.minPrice ? Number(input.minPrice) * 100 : 0;
    const maxPrice = input.maxPrice ? Number(input.maxPrice) * 100 : Infinity;
    const availabilityDate = input.availabilityDate ? parseISO(input.availabilityDate) : null;
    const paymentType = input.paymentType;
    const mobile = input.mobile;

    const searchMatches =
      !searchTerm ||
      [card.name, card.headline, card.approximateArea, ...card.categoryTags, ...card.services.map((service) => service.name)]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm);

    const categoryMatches =
      !categoryFilter ||
      card.services.some(
        (service) =>
          service.category.slug === categoryFilter ||
          service.category.name.toLowerCase() === categoryFilter
      );

    const providerTypeMatches =
      !providerType ||
      (providerType === "business" && card.providerType === ProviderType.VERIFIED_BUSINESS) ||
      (providerType === "independent" && card.providerType === ProviderType.VERIFIED_INDEPENDENT) ||
      (providerType === "mobile" && card.isMobileService);

    const trustMatches = card.trustScore >= trustMin;
    const distanceMatches = card.distanceMiles <= distanceMax;
    const priceMatches = card.startingPriceCents >= minPrice && card.startingPriceCents <= maxPrice;
    const availabilityMatches =
      !availabilityDate ||
      card.services.some(() => card.nextAvailability && isSameDay(card.nextAvailability, availabilityDate));
    const paymentMatches =
      !paymentType ||
      (paymentType === "deposit" && card.paymentModes.deposit) ||
      (paymentType === "full-prepay" && card.paymentModes.fullPrepay);
    const mobileMatches =
      !mobile ||
      (mobile === "yes" && card.isMobileService) ||
      (mobile === "no" && !card.isMobileService);

    return (
      searchMatches &&
      categoryMatches &&
      providerTypeMatches &&
      trustMatches &&
      distanceMatches &&
      priceMatches &&
      availabilityMatches &&
      paymentMatches &&
      mobileMatches
    );
  });
}

function sortBrowseCards(
  cards: ReturnType<typeof mapProviderCard>[],
  sort: string,
  input: BrowseInput
) {
  const sorted = cards.slice();

  if (sort === "lowest-price") {
    return sorted.sort((a, b) => a.startingPriceCents - b.startingPriceCents);
  }

  if (sort === "highest-trust") {
    return sorted.sort((a, b) => b.trustScore - a.trustScore);
  }

  if (sort === "nearest") {
    return sorted.sort((a, b) => a.distanceMiles - b.distanceMiles);
  }

  if (sort === "soonest-available") {
    return sorted.sort((a, b) => Number(a.nextAvailability ?? Infinity) - Number(b.nextAvailability ?? Infinity));
  }

  const term = input.search?.trim().toLowerCase();
  const category = input.category?.toLowerCase();
  const maxPrice = Math.max(...sorted.map((card) => card.startingPriceCents));

  return sorted.sort((a, b) => scoreCard(b) - scoreCard(a));

  function scoreCard(card: ReturnType<typeof mapProviderCard>) {
    const serviceText = card.services.map((service) => `${service.name} ${service.category.name}`).join(" ").toLowerCase();
    const relevance =
      !term && !category
        ? 0.74
        : clamp(
            (term && (card.name.toLowerCase().includes(term) || serviceText.includes(term)) ? 0.72 : 0.36) +
              (category && serviceText.includes(category) ? 0.38 : 0),
            0,
            1.1
          );
    const trust = card.trustScore / 10;
    const reviewScore = clamp(card.rating / 5 + card.reviewCount / 100, 0, 1.4);
    const distance = clamp(1 - card.distanceMiles / 6, 0.1, 1);
    const availability = card.nextAvailability
      ? clamp(1 - (card.nextAvailability.getTime() - Date.now()) / (1000 * 60 * 60 * 168), 0.1, 1)
      : 0.18;
    const price = clamp(1 - card.startingPriceCents / maxPrice, 0.1, 1);
    const conversion = clamp(card.services.length / 4, 0.4, 1);
    const planBoost =
      card.trustScore >= 8.2
        ? card.featuredLabel === "Premium"
          ? 0.24
          : card.featuredLabel === "Spotlight"
            ? 0.14
            : 0.05
        : 0.04;

    return relevance * 2.1 + trust * 2.45 + reviewScore * 0.9 + distance * 0.7 + availability * 0.95 + price * 0.55 + conversion * 0.35 + planBoost;
  }
}

export async function getProviderPageData(slug: string, viewerId?: string | null) {
  const [provider, saved] = await Promise.all([
    prisma.provider.findFirst({
      where: {
        slug,
        status: ProviderStatus.LIVE,
      },
      include: {
        ...providerPublicInclude,
        bookings: {
          orderBy: { appointmentStart: "desc" },
          take: 12,
        },
      },
    }),
    viewerId
      ? prisma.savedProvider.findFirst({
          where: {
            userId: viewerId,
            provider: { slug },
          },
        })
      : Promise.resolve(null),
  ]);

  if (!provider) {
    return null;
  }

  const recommended = (await getPublicProviders())
    .filter((item) => item.id !== provider.id)
    .filter((item) =>
      item.services.some((service) => provider.services.some((target) => target.categoryId === service.categoryId))
    )
    .slice(0, 3);

  return {
    provider,
    card: mapProviderCard(provider, saved ? [provider.id] : []),
    recommended: recommended.map((item) => mapProviderCard(item)),
    paymentMix: {
      hasDeposit: provider.services.some((service) => service.paymentRequirement === PaymentRequirement.DEPOSIT_REQUIRED),
      hasFullPrepay: provider.services.some((service) => service.paymentRequirement === PaymentRequirement.FULL_PREPAY),
    },
  };
}

export async function getBookingPageData(
  slug: string,
  selectedServiceId?: string,
  selectedSlotId?: string,
  viewerId?: string | null
) {
  const data = await getProviderPageData(slug, viewerId);
  if (!data) {
    return null;
  }

  const selectedService =
    data.provider.services.find((service) => service.id === selectedServiceId) ?? data.provider.services[0];
  const availableSlots = data.provider.availabilitySlots.filter(
    (slot) => !selectedService || slot.serviceId === selectedService.id
  );
  const selectedSlot =
    availableSlots.find((slot) => slot.id === selectedSlotId) ?? availableSlots[0] ?? null;

  return {
    ...data,
    selectedService,
    selectedSlot,
    availableSlots,
  };
}

export async function getAccountPageData(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      savedProviders: {
        include: {
          provider: {
            include: providerPublicInclude,
          },
        },
      },
    },
  });

  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: accountBookingInclude,
    orderBy: { appointmentStart: "desc" },
  });

  const upcomingStatuses: BookingStatus[] = [BookingStatus.CONFIRMED, BookingStatus.RESCHEDULED];
  const pastStatuses: BookingStatus[] = [BookingStatus.COMPLETED, BookingStatus.CANCELED, BookingStatus.DISPUTED];
  const upcoming = bookings.filter((booking) => upcomingStatuses.includes(booking.status));
  const past = bookings.filter((booking) => pastStatuses.includes(booking.status));

  return {
    user,
    upcoming,
    past,
    favorites: user.savedProviders.map((item) => mapProviderCard(item.provider, [item.provider.id])),
    paymentHistory: bookings.flatMap((booking) =>
      booking.paymentRecords.map((record) => ({
        ...record,
        booking,
      }))
    ),
  };
}

export async function getProviderDashboardData(userId: string) {
  const provider = await prisma.provider.findFirst({
    where: { ownerId: userId },
    include: providerDashboardInclude,
  });

  if (!provider) {
    return null;
  }

  const upcomingStatuses: BookingStatus[] = [BookingStatus.CONFIRMED, BookingStatus.RESCHEDULED];
  const upcomingBookings = provider.bookings.filter((booking) => upcomingStatuses.includes(booking.status));
  const completedBookings = provider.bookings.filter((booking) => booking.status === BookingStatus.COMPLETED);

  return {
    provider,
    upcomingBookings,
    completedBookings,
    metrics: {
      pendingRequests: upcomingBookings.length,
      completedThisWindow: completedBookings.length,
      heldPayouts: provider.payouts.filter((payout) => payout.status === PayoutStatus.HELD).length,
      releasedPayouts: provider.payouts
        .filter((payout) => payout.status === PayoutStatus.RELEASED)
        .reduce((sum, payout) => sum + payout.netAmountCents, 0),
    },
  };
}

export async function getAdminDashboardData() {
  const [providers, applications, claims, outreach, disputes, contacts, categories, bookings] =
    await Promise.all([
      prisma.provider.findMany({
        include: {
          services: { include: { category: true } },
          subscription: true,
          trustSignals: { orderBy: { sortOrder: "asc" } },
          featuredPlacements: { where: { active: true } },
        },
        orderBy: [{ status: "asc" }, { trustScore: "desc" }],
      }),
      prisma.providerApplication.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.claimRequest.findMany({
        include: { provider: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.outreachLead.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.dispute.findMany({
        include: {
          booking: {
            include: {
              provider: true,
              user: true,
              service: true,
            },
          },
        },
        orderBy: { openedAt: "desc" },
      }),
      prisma.contactSubmission.findMany({
        orderBy: { createdAt: "desc" },
      }),
      getCategories(),
      prisma.booking.findMany({
        include: {
          provider: true,
          user: true,
          service: true,
          paymentRecords: true,
          payout: true,
        },
        orderBy: { appointmentStart: "desc" },
        take: 20,
      }),
    ]);

  return {
    providers,
    applications,
    claims,
    outreach,
    disputes,
    contacts,
    categories,
    bookings,
    metrics: {
      liveProviders: providers.filter((provider) => provider.status === ProviderStatus.LIVE).length,
      pendingApprovals: providers.filter((provider) => provider.status === ProviderStatus.PENDING_APPROVAL).length,
      suspendedProviders: providers.filter((provider) => provider.status === ProviderStatus.SUSPENDED).length,
      openDisputes: disputes.length,
      upcomingBookings: bookings.filter((booking) => booking.status === BookingStatus.CONFIRMED).length,
    },
  };
}

export function getCancellationPolicyWindow(policy: CancellationPolicy) {
  return policy === CancellationPolicy.STRICT ? 48 : 24;
}

export function getProviderBadges(providerType: ProviderType, isMobileService: boolean) {
  return [
    providerType === ProviderType.VERIFIED_BUSINESS ? "Verified Business" : "Verified Independent",
    ...(isMobileService ? ["Mobile Service"] : []),
  ];
}

export async function getSavedProviderIds(userId: string | null | undefined) {
  if (!userId) {
    return [];
  }

  const items = await prisma.savedProvider.findMany({
    where: { userId },
    select: { providerId: true },
  });

  return items.map((item) => item.providerId);
}

export async function getContentStats() {
  const providers = await getPublicProviders();
  return {
    liveProviders: providers.length,
    averageTrust: Number(
      (providers.reduce((sum, provider) => sum + provider.trustScore, 0) / providers.length).toFixed(1)
    ),
    topCategories: unique(providers.flatMap((provider) => provider.services.map((service) => service.category.name))).slice(0, 6),
  };
}

export function getAvailabilityWindow(slots: { startsAt: Date }[]) {
  const nextSlot = slots[0]?.startsAt ?? null;
  if (!nextSlot) {
    return null;
  }

  const todayWindow = slots.find((slot) => isSameDay(slot.startsAt, new Date()));
  return todayWindow?.startsAt ?? nextSlot;
}

export function slotFallsOnDate(slot: Date, date: string) {
  const parsed = parseISO(date);
  return slot >= startOfDay(parsed) && slot <= endOfDay(parsed);
}
