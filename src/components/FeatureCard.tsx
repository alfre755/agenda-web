import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type FeatureCardProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
};

export function FeatureCard({ title, description, icon: Icon }: FeatureCardProps) {
  return (
    <Card className="border-white/15 bg-white/10 text-white">
      <CardHeader className="flex flex-row items-center gap-3">
        {Icon ? <Icon className="size-5 text-white/90" /> : null}
        <CardTitle className="text-white/95 text-base md:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-white/85 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}
