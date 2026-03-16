import { format, formatDistanceToNowStrict, isSameDay } from "date-fns";
import {
  CancellationPolicy,
  PaymentRequirement,
  ProviderStatus,
  ProviderType,
  SubscriptionPlan,
} from "@prisma/client";

export function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatPriceRange(minCents: number, maxCents: number) {
  if (minCents === maxCents) {
    return formatCurrency(minCents);
  }

  return `${formatCurrency(minCents)} - ${formatCurrency(maxCents)}`;
}

export function formatDateTime(value: Date) {
  return format(value, "EEE, MMM d • h:mm a");
}

export function formatDateLabel(value: Date) {
  return format(value, "EEEE, MMMM d");
}

export function formatShortDate(value: Date) {
  return format(value, "MMM d");
}

export function formatRelativeSlot(value: Date) {
  if (isSameDay(value, new Date())) {
    return `Today • ${format(value, "h:mm a")}`;
  }

  return formatDateTime(value);
}

export function formatSoonest(value: Date | null) {
  if (!value) {
    return "Openings soon";
  }

  return `${formatDistanceToNowStrict(value, { addSuffix: true })}`;
}

export function formatDistanceMiles(distanceMiles: number) {
  return `${distanceMiles.toFixed(1)} mi from campus`;
}

export function formatTrustScore(value: number) {
  return value.toFixed(1);
}

export function formatPercent(value: number, digits = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

export function formatProviderType(value: ProviderType) {
  return value === ProviderType.VERIFIED_BUSINESS
    ? "Verified Business"
    : "Verified Independent";
}

export function formatProviderStatus(value: ProviderStatus) {
  return value
    .split("_")
    .map((part) => `${part[0]}${part.slice(1).toLowerCase()}`)
    .join(" ");
}

export function formatPlan(value: SubscriptionPlan) {
  return value === SubscriptionPlan.SPOTLIGHT
    ? "Spotlight"
    : value === SubscriptionPlan.PREMIUM
      ? "Premium"
      : "Basic";
}

export function formatPaymentRequirement(value: PaymentRequirement) {
  return value === PaymentRequirement.FULL_PREPAY ? "Full prepay" : "Deposit or pay in full";
}

export function formatCancellationPolicy(value: CancellationPolicy) {
  switch (value) {
    case CancellationPolicy.FLEXIBLE:
      return "Flexible • free cancellation up to 24 hours before";
    case CancellationPolicy.STANDARD:
      return "Standard • deposit forfeited within 24 hours";
    case CancellationPolicy.STRICT:
      return "Strict • deposit forfeited within 48 hours";
    default:
      return "Policy on file";
  }
}
