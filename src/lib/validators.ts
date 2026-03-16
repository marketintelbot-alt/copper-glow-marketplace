import { CancellationPolicy, FeaturedSurface, PaymentOption, ProviderStatus, ProviderType, SubscriptionPlan } from "@prisma/client";
import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  redirectTo: z.string().optional(),
});

export const signUpSchema = z.object({
  firstName: z.string().min(2, "First name is required."),
  lastName: z.string().min(2, "Last name is required."),
  email: z.email("Enter a valid email."),
  password: z.string().min(8, "Use at least 8 characters."),
  phone: z.string().min(10, "Phone number looks too short."),
});

export const bookingSchema = z.object({
  providerSlug: z.string().min(1),
  serviceId: z.string().min(1, "Choose a service."),
  slotId: z.string().min(1, "Choose an appointment time."),
  paymentOption: z.enum(PaymentOption),
  notes: z.string().max(240, "Keep notes under 240 characters.").optional(),
  cardLast4: z.string().length(4, "Use 4 digits.").optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Tell us your name."),
  email: z.email("Enter a valid email."),
  reason: z.string().min(2, "Pick a topic."),
  message: z.string().min(20, "Add a few more details.").max(1200, "Please keep the message a bit shorter."),
});

export const applicationSchema = z.object({
  businessName: z.string().min(2, "Business name is required."),
  providerType: z.enum(ProviderType),
  mobileService: z.string().optional(),
  email: z.email("Enter a valid email."),
  phone: z.string().min(10, "Phone number looks too short."),
  cityArea: z.string().min(2, "Tell us the area you serve."),
  categoriesCsv: z.string().min(2, "Select at least one category."),
  portfolioSummary: z.string().min(20, "Share a little more about your work."),
  note: z.string().min(10, "Tell us what makes your listing launch-ready."),
});

export const claimSchema = z.object({
  businessName: z.string().min(2),
  claimantName: z.string().min(2),
  claimantEmail: z.email("Enter a valid email."),
  instagramHandle: z.string().optional(),
  note: z.string().min(10, "Tell us how this business is connected to you."),
  providerId: z.string().optional(),
});

export const reviewSchema = z.object({
  bookingId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().min(4, "Add a short headline."),
  body: z.string().min(20, "Share enough detail to help future clients."),
  wouldRebook: z.string().optional(),
});

export const profileSettingsSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().min(10),
  bio: z.string().max(240).optional(),
});

export const providerProfileSchema = z.object({
  providerId: z.string().min(1),
  headline: z.string().min(10),
  shortDescription: z.string().min(24),
  story: z.string().min(40),
  approximateArea: z.string().min(2),
  neighborhood: z.string().min(2),
  cancellationPolicy: z.enum(CancellationPolicy),
  acceptsNewClients: z.string().optional(),
  isMobileService: z.string().optional(),
});

export const providerServiceSchema = z.object({
  providerId: z.string().min(1),
  categoryId: z.string().min(1),
  name: z.string().min(2),
  description: z.string().min(12),
  durationMinutes: z.coerce.number().int().min(15).max(240),
  priceCents: z.coerce.number().int().min(1500),
});

export const providerSlotSchema = z.object({
  providerId: z.string().min(1),
  serviceId: z.string().min(1),
  startsAt: z.string().min(1),
});

export const providerPlanSchema = z.object({
  providerId: z.string().min(1),
  plan: z.enum(SubscriptionPlan),
});

export const adminProviderStatusSchema = z.object({
  providerId: z.string().min(1),
  status: z.enum(ProviderStatus),
});

export const adminPlacementSchema = z.object({
  providerId: z.string().min(1),
  active: z.string().optional(),
  surface: z.enum(FeaturedSurface),
  label: z.string().min(2),
});

export const adminDisputeSchema = z.object({
  disputeId: z.string().min(1),
  resolutionSummary: z.string().min(10),
});
