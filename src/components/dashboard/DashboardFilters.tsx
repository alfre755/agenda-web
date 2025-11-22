"use client";

import * as React from "react";
import { format } from "date-fns";
import { Building2, Calendar as CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface DashboardFiltersProps {
  organizationId?: string;
  dateRange?: DateRange | undefined;
  onOrganizationChange?: (organizationId: string) => void;
  onDateRangeChange?: (range: DateRange | undefined) => void;
  organizations?: Array<{ id: string; name: string }>;
  className?: string;
}

export function DashboardFilters({
  organizationId,
  dateRange,
  onOrganizationChange,
  onDateRangeChange,
  organizations = [],
  className,
}: DashboardFiltersProps) {
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    onDateRangeChange?.(range);
    if (range?.from && range?.to) {
      setIsCalendarOpen(false);
    }
  };

  return (
    <div className={cn("flex items-center gap-3 flex-wrap", className)}>
      {/* Filtros inline compactos */}
      <div className="flex items-center gap-3">
        {/* Selector de Organización */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">
            Organización:
          </label>
          <Select
            value={organizationId || "all"}
            onValueChange={(value) =>
              onOrganizationChange?.(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="h-9 w-[160px] text-xs">
              <Building2 className="mr-2 h-3.5 w-3.5" />
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las organizaciones</SelectItem>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selector de Rango de Fechas */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">
            Fechas:
          </label>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-9 text-xs px-3 justify-start gap-2",
                  !dateRange?.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd/MM/yy")} -{" "}
                      {format(dateRange.to, "dd/MM/yy")}
                    </>
                  ) : (
                    format(dateRange.from, "dd/MM/yy")
                  )
                ) : (
                  "Seleccionar"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleDateRangeSelect}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

    </div>
  );
}
