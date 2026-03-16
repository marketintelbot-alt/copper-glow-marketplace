"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

type Props = {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  tone?: "primary" | "secondary" | "ghost" | "soft";
  size?: "sm" | "md" | "lg";
};

export function FormSubmitButton({
  children,
  pendingLabel = "Saving...",
  className,
  tone = "primary",
  size = "md",
}: Props) {
  const { pending } = useFormStatus();

  return (
    <Button className={className} tone={tone} size={size} type="submit" disabled={pending}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
