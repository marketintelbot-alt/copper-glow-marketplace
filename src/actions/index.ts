"use server";

import {
  ApplicationStatus,
  BookingStatus,
  CancellationPolicy,
  DepositType,
  DisputeStatus,
  PaymentKind,
  PaymentOption,
  PaymentRequirement,
  PaymentStatus,
  PayoutStatus,
  ProviderStatus,
  ProviderType,
  SubscriptionStatus,
} from "@prisma/client";
import { addDays, addHours, addMinutes, formatISO } from "date-fns";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { clearSession, createSession, createUserPasswordHash, requireAdmin, requireProvider, requireUser, verifyUserPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getLaunchSchool } from "@/lib/marketplace";
import { holdMockFunds, sendMockNotification } from "@/lib/mock-services";
import {
  adminDisputeSchema,
  adminPlacementSchema,
  adminProviderStatusSchema,
  applicationSchema,
  bookingSchema,
  claimSchema,
  contactSchema,
  profileSettingsSchema,
  providerPlanSchema,
  providerProfileSchema,
  providerServiceSchema,
  providerSlotSchema,
  reviewSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/validators";

export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

const idleState: ActionState = { status: "idle" };

function withError(message: string, fieldErrors?: Record<string, string>): ActionState {
  return {
    status: "error",
    message,
    fieldErrors,
  };
}

function withSuccess(message: string): ActionState {
  return {
    status: "success",
    message,
  };
}

function zodToState(error: ZodError) {
  const flattened = error.flatten().fieldErrors as Record<string, string[] | undefined>;
  const fieldErrors = Object.fromEntries(
    Object.entries(flattened).map(([key, value]) => [key, value?.[0] ?? "Invalid value."])
  );

  return withError("Please review the highlighted fields.", fieldErrors);
}

function parseString(value: FormDataEntryValue | null | undefined) {
  return typeof value === "string" ? value : "";
}

function assertProviderOwner(userId: string, providerId: string) {
  return prisma.provider.findFirst({
    where: {
      id: providerId,
      ownerId: userId,
    },
  });
}

function computeChargeNow(
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

function getFeeRate(providerType: ProviderType) {
  return providerType === ProviderType.VERIFIED_BUSINESS ? 0.03 : 0.05;
}

function getCancellationDeadline(appointmentStart: Date, policy: CancellationPolicy) {
  return addHours(appointmentStart, policy === CancellationPolicy.STRICT ? -48 : -24);
}

export async function signInAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const parsed = signInSchema.parse({
      email: parseString(formData.get("email")),
      password: parseString(formData.get("password")),
      redirectTo: parseString(formData.get("redirectTo")) || undefined,
    });

    const user = await prisma.user.findUnique({
      where: { email: parsed.email.toLowerCase() },
      include: { ownedProvider: true },
    });

    if (!user || !(await verifyUserPassword(parsed.password, user.passwordHash))) {
      return withError("That email and password combination did not match our demo accounts.");
    }

    await createSession(user.id);

    if (parsed.redirectTo) {
      redirect(parsed.redirectTo);
    }

    if (user.role === "ADMIN") {
      redirect("/admin");
    }

    if (user.role === "PROVIDER") {
      redirect("/provider/dashboard");
    }

    redirect("/account");
  } catch (error) {
    if (error instanceof ZodError) {
      return zodToState(error);
    }

    throw error;
  }
}

export async function signUpAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const parsed = signUpSchema.parse({
      firstName: parseString(formData.get("firstName")),
      lastName: parseString(formData.get("lastName")),
      email: parseString(formData.get("email")),
      password: parseString(formData.get("password")),
      phone: parseString(formData.get("phone")),
    });

    const existing = await prisma.user.findUnique({
      where: { email: parsed.email.toLowerCase() },
    });

    if (existing) {
      return withError("That email already has an account.");
    }

    const school = await getLaunchSchool();
    const user = await prisma.user.create({
      data: {
        role: "USER",
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        email: parsed.email.toLowerCase(),
        passwordHash: await createUserPasswordHash(parsed.password),
        phone: parsed.phone,
        schoolId: school.id,
        avatarSeed: `${parsed.firstName}-${parsed.lastName}`.toLowerCase(),
        bio: "New Copper Glow member.",
      },
    });

    await createSession(user.id);
    redirect("/account");
  } catch (error) {
    if (error instanceof ZodError) {
      return zodToState(error);
    }

    throw error;
  }
}

export async function signOutAction() {
  await clearSession();
  redirect("/");
}

export async function toggleSavedProviderAction(providerId: string) {
  const user = await requireUser();
  const existing = await prisma.savedProvider.findUnique({
    where: {
      userId_providerId: {
        userId: user.id,
        providerId,
      },
    },
  });

  if (existing) {
    await prisma.savedProvider.delete({
      where: {
        userId_providerId: {
          userId: user.id,
          providerId,
        },
      },
    });
  } else {
    await prisma.savedProvider.create({
      data: {
        userId: user.id,
        providerId,
      },
    });
  }

  revalidatePath("/");
  revalidatePath("/browse");
  revalidatePath("/account");
  revalidatePath("/providers/[slug]", "page");
  revalidatePath("/book/[slug]", "page");

  return { saved: !existing };
}

export async function createBookingAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = bookingSchema.parse({
      providerSlug: parseString(formData.get("providerSlug")),
      serviceId: parseString(formData.get("serviceId")),
      slotId: parseString(formData.get("slotId")),
      paymentOption: parseString(formData.get("paymentOption")),
      notes: parseString(formData.get("notes")) || undefined,
      cardLast4: parseString(formData.get("cardLast4")) || undefined,
    });

    const provider = await prisma.provider.findFirst({
      where: {
        slug: parsed.providerSlug,
        status: ProviderStatus.LIVE,
      },
    });

    if (!provider) {
      return withError("That provider is no longer available.");
    }

    const service = await prisma.service.findFirst({
      where: {
        id: parsed.serviceId,
        providerId: provider.id,
      },
      include: {
        category: true,
      },
    });

    if (!service) {
      return withError("Choose a valid service to continue.");
    }

    const slot = await prisma.availabilitySlot.findFirst({
      where: {
        id: parsed.slotId,
        providerId: provider.id,
        serviceId: service.id,
        isBooked: false,
      },
    });

    if (!slot) {
      return withError("That appointment time was just taken. Please choose another slot.");
    }

    const checkout = computeChargeNow(
      service.priceCents,
      parsed.paymentOption,
      service.paymentRequirement,
      service.depositType,
      service.depositValue
    );
    const platformFeeRate = getFeeRate(provider.providerType);
    const platformFeeCents = Math.round(service.priceCents * platformFeeRate);
    const providerPayoutCents = service.priceCents - platformFeeCents;
    const reference = `CG-${Date.now().toString().slice(-6)}`;

    const mockPayment = await holdMockFunds({
      amountCents: checkout.chargeNowCents,
      bookingReference: reference,
      paymentOption: parsed.paymentOption,
      mockCardLast4: parsed.cardLast4,
    });

    await prisma.$transaction(async (tx) => {
      await tx.availabilitySlot.update({
        where: { id: slot.id },
        data: { isBooked: true },
      });

      const booking = await tx.booking.create({
        data: {
          reference,
          userId: user.id,
          providerId: provider.id,
          serviceId: service.id,
          slotId: slot.id,
          status: BookingStatus.CONFIRMED,
          paymentOption: parsed.paymentOption,
          appointmentStart: slot.startsAt,
          appointmentEnd: slot.endsAt,
          notes: parsed.notes,
          priceCents: service.priceCents,
          chargeNowCents: checkout.chargeNowCents,
          remainingDueCents: checkout.remainingDueCents,
          platformFeeRate,
          platformFeeCents,
          providerPayoutCents,
          areaSnapshot: provider.approximateArea,
          mobileSnapshot: provider.isMobileService,
          cancellationPolicy: provider.cancellationPolicy,
          cancellationDeadline: getCancellationDeadline(slot.startsAt, provider.cancellationPolicy),
        },
      });

      await tx.paymentRecord.create({
        data: {
          bookingId: booking.id,
          kind: parsed.paymentOption === PaymentOption.DEPOSIT ? PaymentKind.DEPOSIT : PaymentKind.FULL_PREPAY,
          status: PaymentStatus.HELD,
          amountCents: mockPayment.amountCents,
          mockBrand: mockPayment.brand,
          mockLast4: mockPayment.last4,
          externalReference: mockPayment.externalReference,
        },
      });

      await tx.payout.create({
        data: {
          providerId: provider.id,
          bookingId: booking.id,
          status: PayoutStatus.HELD,
          grossAmountCents: service.priceCents,
          feeAmountCents: platformFeeCents,
          netAmountCents: providerPayoutCents,
          scheduledFor: addDays(slot.endsAt, provider.payoutReleaseDays),
        },
      });
    });

    await sendMockNotification({
      recipient: user.email,
      type: "booking-confirmed",
      summary: `${provider.name} booked for ${formatISO(slot.startsAt)}`,
    });

    revalidatePath("/browse");
    revalidatePath(`/providers/${provider.slug}`);
    revalidatePath("/account");
    redirect(`/book/${provider.slug}/success?reference=${reference}`);
  } catch (error) {
    if (error instanceof ZodError) {
      return zodToState(error);
    }

    throw error;
  }
}

export async function cancelBookingAction(bookingId: string) {
  const user = await requireUser();
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      userId: user.id,
    },
    include: {
      paymentRecords: true,
      payout: true,
      provider: true,
      slot: true,
    },
  });

  if (!booking) {
    return withError("We could not find that booking.");
  }

  const refundable = new Date() < booking.cancellationDeadline;

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.CANCELED,
        canceledAt: new Date(),
      },
    });

    if (booking.slotId) {
      await tx.availabilitySlot.update({
        where: { id: booking.slotId },
        data: { isBooked: false },
      });
    }

    await tx.paymentRecord.updateMany({
      where: { bookingId: booking.id },
      data: {
        status: refundable ? PaymentStatus.REFUNDED : PaymentStatus.HELD,
        refundedAt: refundable ? new Date() : null,
      },
    });

    if (booking.payout) {
      await tx.payout.update({
        where: { bookingId: booking.id },
        data: {
          status: refundable ? PayoutStatus.WITHHELD : PayoutStatus.HELD,
        },
      });
    }
  });

  await sendMockNotification({
    recipient: user.email,
    type: "booking-canceled",
    summary: `${booking.provider.name} cancellation processed`,
  });

  revalidatePath("/account");
  revalidatePath("/provider/dashboard");
  revalidatePath("/admin");

  return withSuccess(
    refundable
      ? "Cancellation confirmed. Your mocked payment has been marked for refund."
      : "Cancellation recorded. This booking was inside the forfeiture window, so the mock deposit remains held."
  );
}

export async function rescheduleBookingAction(bookingId: string, newSlotId: string) {
  const user = await requireUser();
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      userId: user.id,
      status: {
        in: [BookingStatus.CONFIRMED, BookingStatus.RESCHEDULED],
      },
    },
    include: {
      provider: true,
      service: true,
      slot: true,
    },
  });

  if (!booking) {
    return withError("That booking can no longer be rescheduled.");
  }

  const slot = await prisma.availabilitySlot.findFirst({
    where: {
      id: newSlotId,
      providerId: booking.providerId,
      serviceId: booking.serviceId,
      isBooked: false,
    },
  });

  if (!slot) {
    return withError("That time is no longer available.");
  }

  await prisma.$transaction(async (tx) => {
    if (booking.slotId) {
      await tx.availabilitySlot.update({
        where: { id: booking.slotId },
        data: { isBooked: false },
      });
    }

    await tx.availabilitySlot.update({
      where: { id: slot.id },
      data: { isBooked: true },
    });

    await tx.booking.update({
      where: { id: booking.id },
      data: {
        slotId: slot.id,
        appointmentStart: slot.startsAt,
        appointmentEnd: slot.endsAt,
        status: BookingStatus.RESCHEDULED,
      },
    });
  });

  await sendMockNotification({
    recipient: user.email,
    type: "booking-rescheduled",
    summary: `${booking.provider.name} moved to ${formatISO(slot.startsAt)}`,
  });

  revalidatePath("/account");
  revalidatePath("/provider/dashboard");
  revalidatePath(`/providers/${booking.provider.slug}`);

  return withSuccess("Appointment moved. Your confirmation panel now reflects the new time.");
}

export async function submitReviewAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = reviewSchema.parse({
      bookingId: parseString(formData.get("bookingId")),
      rating: parseString(formData.get("rating")),
      title: parseString(formData.get("title")),
      body: parseString(formData.get("body")),
      wouldRebook: parseString(formData.get("wouldRebook")),
    });

    const booking = await prisma.booking.findFirst({
      where: {
        id: parsed.bookingId,
        userId: user.id,
        status: BookingStatus.COMPLETED,
        review: null,
      },
      include: {
        provider: true,
      },
    });

    if (!booking) {
      return withError("Only completed bookings can be reviewed.");
    }

    await prisma.$transaction(async (tx) => {
      await tx.review.create({
        data: {
          bookingId: booking.id,
          userId: user.id,
          providerId: booking.providerId,
          rating: parsed.rating,
          title: parsed.title,
          body: parsed.body,
          wouldRebook: Boolean(parsed.wouldRebook),
        },
      });

      const nextReviewCount = booking.provider.reviewCount + 1;
      const nextReviewAverage =
        (booking.provider.reviewAverage * booking.provider.reviewCount + parsed.rating) / nextReviewCount;

      await tx.provider.update({
        where: { id: booking.providerId },
        data: {
          reviewCount: nextReviewCount,
          reviewAverage: Number(nextReviewAverage.toFixed(2)),
        },
      });
    });

    revalidatePath("/account");
    revalidatePath(`/providers/${booking.provider.slug}`);
    return withSuccess("Thanks. Your verified review is now live on the provider profile.");
  } catch (error) {
    if (error instanceof ZodError) {
      return zodToState(error);
    }

    throw error;
  }
}

export async function updateProfileSettingsAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = profileSettingsSchema.parse({
      firstName: parseString(formData.get("firstName")),
      lastName: parseString(formData.get("lastName")),
      phone: parseString(formData.get("phone")),
      bio: parseString(formData.get("bio")) || undefined,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: parsed,
    });

    revalidatePath("/account");
    return withSuccess("Profile settings updated.");
  } catch (error) {
    if (error instanceof ZodError) {
      return zodToState(error);
    }

    throw error;
  }
}

export async function submitContactAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const parsed = contactSchema.parse({
      name: parseString(formData.get("name")),
      email: parseString(formData.get("email")),
      reason: parseString(formData.get("reason")),
      message: parseString(formData.get("message")),
    });

    await prisma.contactSubmission.create({
      data: parsed,
    });

    await sendMockNotification({
      recipient: parsed.email,
      type: "contact",
      summary: "Contact request received",
    });

    revalidatePath("/contact");
    revalidatePath("/admin");
    return withSuccess("Message received. In this demo, we log it instantly and send a mocked acknowledgment.");
  } catch (error) {
    if (error instanceof ZodError) {
      return zodToState(error);
    }

    throw error;
  }
}

export async function submitProviderApplicationAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const parsed = applicationSchema.parse({
      businessName: parseString(formData.get("businessName")),
      providerType: parseString(formData.get("providerType")),
      mobileService: parseString(formData.get("mobileService")),
      email: parseString(formData.get("email")),
      phone: parseString(formData.get("phone")),
      cityArea: parseString(formData.get("cityArea")),
      categoriesCsv: parseString(formData.get("categoriesCsv")),
      portfolioSummary: parseString(formData.get("portfolioSummary")),
      note: parseString(formData.get("note")),
    });

    const school = await getLaunchSchool();
    const user = await requireUser().catch(() => null);

    await prisma.providerApplication.create({
      data: {
        schoolId: school.id,
        applicantUserId: user?.id,
        businessName: parsed.businessName,
        providerType: parsed.providerType,
        mobileService: Boolean(parsed.mobileService),
        email: parsed.email,
        phone: parsed.phone,
        cityArea: parsed.cityArea,
        categoriesCsv: parsed.categoriesCsv,
        portfolioSummary: parsed.portfolioSummary,
        note: parsed.note,
        status: ApplicationStatus.SUBMITTED,
      },
    });

    await sendMockNotification({
      recipient: parsed.email,
      type: "application",
      summary: "Provider application received",
    });

    revalidatePath("/providers/apply");
    revalidatePath("/admin");
    return withSuccess("Application submitted. The demo now shows it inside the admin approval queue.");
  } catch (error) {
    if (error instanceof ZodError) {
      return zodToState(error);
    }

    throw error;
  }
}

export async function submitClaimRequestAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const parsed = claimSchema.parse({
      businessName: parseString(formData.get("businessName")),
      claimantName: parseString(formData.get("claimantName")),
      claimantEmail: parseString(formData.get("claimantEmail")),
      instagramHandle: parseString(formData.get("instagramHandle")) || undefined,
      note: parseString(formData.get("note")),
      providerId: parseString(formData.get("providerId")) || undefined,
    });

    const school = await getLaunchSchool();
    const user = await requireUser().catch(() => null);

    await prisma.claimRequest.create({
      data: {
        schoolId: school.id,
        providerId: parsed.providerId,
        submittedByUserId: user?.id,
        businessName: parsed.businessName,
        claimantName: parsed.claimantName,
        claimantEmail: parsed.claimantEmail,
        instagramHandle: parsed.instagramHandle,
        note: parsed.note,
      },
    });

    revalidatePath("/providers/apply");
    revalidatePath("/admin");
    return withSuccess("Claim request submitted. It is now visible in the admin claim review queue.");
  } catch (error) {
    if (error instanceof ZodError) {
      return zodToState(error);
    }

    throw error;
  }
}

export async function updateProviderProfileAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await requireProvider();
    const parsed = providerProfileSchema.parse({
      providerId: parseString(formData.get("providerId")),
      headline: parseString(formData.get("headline")),
      shortDescription: parseString(formData.get("shortDescription")),
      story: parseString(formData.get("story")),
      approximateArea: parseString(formData.get("approximateArea")),
      neighborhood: parseString(formData.get("neighborhood")),
      cancellationPolicy: parseString(formData.get("cancellationPolicy")),
      acceptsNewClients: parseString(formData.get("acceptsNewClients")),
      isMobileService: parseString(formData.get("isMobileService")),
    });

    if (user.role !== "ADMIN") {
      const provider = await assertProviderOwner(user.id, parsed.providerId);
      if (!provider) {
        return withError("You do not have access to that provider profile.");
      }
    }

    await prisma.provider.update({
      where: { id: parsed.providerId },
      data: {
        headline: parsed.headline,
        shortDescription: parsed.shortDescription,
        story: parsed.story,
        approximateArea: parsed.approximateArea,
        neighborhood: parsed.neighborhood,
        cancellationPolicy: parsed.cancellationPolicy,
        acceptsNewClients: Boolean(parsed.acceptsNewClients),
        isMobileService: Boolean(parsed.isMobileService),
      },
    });

    revalidatePath("/provider/dashboard");
    return withSuccess("Profile details updated.");
  } catch (error) {
    if (error instanceof ZodError) {
      return zodToState(error);
    }

    throw error;
  }
}

export async function addProviderServiceAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await requireProvider();
    const parsed = providerServiceSchema.parse({
      providerId: parseString(formData.get("providerId")),
      categoryId: parseString(formData.get("categoryId")),
      name: parseString(formData.get("name")),
      description: parseString(formData.get("description")),
      durationMinutes: parseString(formData.get("durationMinutes")),
      priceCents: parseString(formData.get("priceCents")),
    });

    if (user.role !== "ADMIN") {
      const provider = await assertProviderOwner(user.id, parsed.providerId);
      if (!provider) {
        return withError("You do not have access to that provider profile.");
      }
    }

    await prisma.service.create({
      data: {
        providerId: parsed.providerId,
        categoryId: parsed.categoryId,
        name: parsed.name,
        description: parsed.description,
        durationMinutes: parsed.durationMinutes,
        priceCents: parsed.priceCents,
        paymentRequirement: PaymentRequirement.DEPOSIT_REQUIRED,
        depositType: DepositType.FIXED,
        depositValue: 2000,
      },
    });

    revalidatePath("/provider/dashboard");
    return withSuccess("Service added. Demo defaults use a fixed deposit until you wire a live payment processor.");
  } catch (error) {
    if (error instanceof ZodError) {
      return zodToState(error);
    }

    throw error;
  }
}

export async function addAvailabilitySlotAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await requireProvider();
    const parsed = providerSlotSchema.parse({
      providerId: parseString(formData.get("providerId")),
      serviceId: parseString(formData.get("serviceId")),
      startsAt: parseString(formData.get("startsAt")),
    });

    if (user.role !== "ADMIN") {
      const provider = await assertProviderOwner(user.id, parsed.providerId);
      if (!provider) {
        return withError("You do not have access to that provider profile.");
      }
    }

    const service = await prisma.service.findUnique({
      where: { id: parsed.serviceId },
    });

    if (!service) {
      return withError("Choose a valid service.");
    }

    const startsAt = new Date(parsed.startsAt);
    const endsAt = addMinutes(startsAt, service.durationMinutes);

    await prisma.availabilitySlot.create({
      data: {
        providerId: parsed.providerId,
        serviceId: parsed.serviceId,
        startsAt,
        endsAt,
      },
    });

    revalidatePath("/provider/dashboard");
    return withSuccess("Availability slot added.");
  } catch (error) {
    if (error instanceof ZodError) {
      return zodToState(error);
    }

    throw error;
  }
}

export async function updateProviderPlanAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await requireProvider();
    const parsed = providerPlanSchema.parse({
      providerId: parseString(formData.get("providerId")),
      plan: parseString(formData.get("plan")),
    });

    if (user.role !== "ADMIN") {
      const provider = await assertProviderOwner(user.id, parsed.providerId);
      if (!provider) {
        return withError("You do not have access to that provider profile.");
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.provider.update({
        where: { id: parsed.providerId },
        data: {
          plan: parsed.plan,
          rankingBoost:
            parsed.plan === "PREMIUM" ? 0.35 : parsed.plan === "SPOTLIGHT" ? 0.18 : 0.05,
        },
      });

      await tx.subscription.update({
        where: { providerId: parsed.providerId },
        data: {
          plan: parsed.plan,
          status: SubscriptionStatus.ACTIVE,
          monthlyPriceCents: parsed.plan === "BASIC" ? 0 : parsed.plan === "SPOTLIGHT" ? 9900 : 18900,
        },
      });
    });

    revalidatePath("/provider/dashboard");
    revalidatePath("/provider/pricing");
    revalidatePath("/browse");
    return withSuccess("Plan updated.");
  } catch (error) {
    if (error instanceof ZodError) {
      return zodToState(error);
    }

    throw error;
  }
}

export async function updateProviderStatusAction(formData: FormData) {
  const user = await requireAdmin();
  void user;
  const parsed = adminProviderStatusSchema.parse({
    providerId: parseString(formData.get("providerId")),
    status: parseString(formData.get("status")),
  });

  await prisma.provider.update({
    where: { id: parsed.providerId },
    data: { status: parsed.status },
  });

  revalidatePath("/admin");
  revalidatePath("/browse");
}

export async function updateProviderProfileFormAction(formData: FormData) {
  await updateProviderProfileAction(idleState, formData);
}

export async function addProviderServiceFormAction(formData: FormData) {
  await addProviderServiceAction(idleState, formData);
}

export async function addAvailabilitySlotFormAction(formData: FormData) {
  await addAvailabilitySlotAction(idleState, formData);
}

export async function updateProviderPlanFormAction(formData: FormData) {
  await updateProviderPlanAction(idleState, formData);
}

export async function updateFeaturedPlacementFormAction(formData: FormData) {
  await updateFeaturedPlacementAction(idleState, formData);
}

export async function resolveDisputeFormAction(formData: FormData) {
  await resolveDisputeAction(idleState, formData);
}

export async function updateFeaturedPlacementAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const parsed = adminPlacementSchema.parse({
      providerId: parseString(formData.get("providerId")),
      active: parseString(formData.get("active")),
      surface: parseString(formData.get("surface")),
      label: parseString(formData.get("label")),
    });

    const existing = await prisma.featuredPlacement.findFirst({
      where: {
        providerId: parsed.providerId,
        surface: parsed.surface,
      },
    });

    if (existing) {
      await prisma.featuredPlacement.update({
        where: { id: existing.id },
        data: {
          active: Boolean(parsed.active),
          label: parsed.label,
        },
      });
    } else {
      await prisma.featuredPlacement.create({
        data: {
          providerId: parsed.providerId,
          surface: parsed.surface,
          label: parsed.label,
          active: Boolean(parsed.active),
        },
      });
    }

    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/browse");
    return withSuccess("Placement settings updated.");
  } catch (error) {
    if (error instanceof ZodError) {
      return zodToState(error);
    }

    throw error;
  }
}

export async function resolveDisputeAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const parsed = adminDisputeSchema.parse({
      disputeId: parseString(formData.get("disputeId")),
      resolutionSummary: parseString(formData.get("resolutionSummary")),
    });

    const dispute = await prisma.dispute.findUnique({
      where: { id: parsed.disputeId },
      include: { booking: true },
    });

    if (!dispute) {
      return withError("Dispute not found.");
    }

    await prisma.$transaction(async (tx) => {
      await tx.dispute.update({
        where: { id: dispute.id },
        data: {
          status: DisputeStatus.RESOLVED,
          resolutionSummary: parsed.resolutionSummary,
        },
      });

      await tx.payout.updateMany({
        where: { bookingId: dispute.bookingId },
        data: {
          status: PayoutStatus.WITHHELD,
        },
      });

      await tx.booking.update({
        where: { id: dispute.bookingId },
        data: {
          status: BookingStatus.DISPUTED,
        },
      });
    });

    revalidatePath("/admin");
    return withSuccess("Dispute resolution saved.");
  } catch (error) {
    if (error instanceof ZodError) {
      return zodToState(error);
    }

    throw error;
  }
}
