"use client"
import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";

export type AppButtonType = "primary" | "secondary" | "outlineLight" | "danger";

type AppButtonProps = Omit<ComponentProps<typeof Button>, "variant"> & {
  btnType?: AppButtonType;
};

const typeToProps: Record<AppButtonType, { variant?: ComponentProps<typeof Button>["variant"]; className?: string }> = {
  primary: { variant: "default" },
  secondary: { variant: "secondary" },
  outlineLight: { variant: "outline", className: "bg-transparent text-white border-white hover:bg-white/10" },
  danger: { variant: "destructive" },
};

export function AppButton({ btnType = "primary", className, ...props }: AppButtonProps) {
  const mapped = typeToProps[btnType] ?? {};
  const cn = [mapped.className, className].filter(Boolean).join(" ");
  return <Button {...props} variant={mapped.variant} className={cn} />;
}
