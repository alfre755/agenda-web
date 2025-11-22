import * as React from "react";
import { type LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  className?: string;
}

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor,
  trend,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              "rounded-lg p-2.5",
              iconColor
                ? "bg-muted/50"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Icon
              className="h-5 w-5"
              style={iconColor ? { color: iconColor } : undefined}
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="flex flex-col space-y-1">
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <p
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive !== false
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                )}
              >
                {trend.isPositive !== false ? "↑" : "↓"} {trend.value}%{" "}
                {trend.label}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
