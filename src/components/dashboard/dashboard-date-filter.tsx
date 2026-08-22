"use client";

import * as React from "react";
import { Calendar as CalendarIcon, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DateRangePreset } from "@/types/dashboard";

interface DashboardDateFilterProps {
  currentPreset: DateRangePreset;
  startDate: string;
  endDate: string;
  onFilterChange: (preset: DateRangePreset, customStart?: string, customEnd?: string) => void;
  isLoading?: boolean;
}

export function DashboardDateFilter({
  currentPreset,
  startDate,
  endDate,
  onFilterChange,
  isLoading,
}: DashboardDateFilterProps) {
  const [isCustomOpen, setIsCustomOpen] = React.useState(currentPreset === "custom");
  const [customStart, setCustomStart] = React.useState(startDate);
  const [customEnd, setCustomEnd] = React.useState(endDate);

  const handlePresetSelect = (value: string) => {
    const preset = value as DateRangePreset;
    if (preset === "custom") {
      setIsCustomOpen(true);
    } else {
      setIsCustomOpen(false);
      onFilterChange(preset);
    }
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange("custom", customStart, customEnd);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mr-1">
        <Filter className="h-3.5 w-3.5 text-primary" />
        <span>Period:</span>
      </div>

      <Select value={currentPreset} onValueChange={handlePresetSelect} disabled={isLoading}>
        <SelectTrigger className="w-[160px] h-9 text-xs font-medium">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="yesterday">Yesterday</SelectItem>
          <SelectItem value="this_week">This Week</SelectItem>
          <SelectItem value="this_month">This Month</SelectItem>
          <SelectItem value="last_30_days">Last 30 Days</SelectItem>
          <SelectItem value="custom">Custom Range...</SelectItem>
        </SelectContent>
      </Select>

      {isCustomOpen && (
        <form onSubmit={handleApplyCustom} className="flex items-center gap-2">
          <Input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="w-36 h-9 text-xs"
            disabled={isLoading}
            required
          />
          <span className="text-xs text-muted-foreground">to</span>
          <Input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="w-36 h-9 text-xs"
            disabled={isLoading}
            required
          />
          <Button type="submit" size="sm" className="h-9 text-xs px-3" disabled={isLoading}>
            Apply
          </Button>
        </form>
      )}

      <div className="hidden md:flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 px-2.5 py-1.5 rounded-md border border-border/60">
        <CalendarIcon className="h-3 w-3 text-muted-foreground" />
        <span>
          {startDate} — {endDate}
        </span>
      </div>
    </div>
  );
}
