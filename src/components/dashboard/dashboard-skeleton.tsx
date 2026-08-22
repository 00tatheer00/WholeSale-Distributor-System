import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-64 bg-muted rounded-md" />
          <div className="h-4 w-96 bg-muted/60 rounded-md" />
        </div>
        <div className="h-9 w-48 bg-muted rounded-md" />
      </div>

      {/* KPI Grid Skeleton */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="border border-border/60">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-8 w-8 bg-muted rounded-lg" />
              </div>
              <div className="h-7 w-32 bg-muted rounded" />
              <div className="h-3 w-28 bg-muted/60 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary Status Badges Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted/40 rounded-lg border border-border/40" />
        ))}
      </div>

      {/* Summary Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="h-64 border border-border/60">
          <CardHeader className="h-14 border-b bg-muted/20" />
          <CardContent className="p-6" />
        </Card>
        <Card className="h-64 border border-border/60">
          <CardHeader className="h-14 border-b bg-muted/20" />
          <CardContent className="p-6" />
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="h-80 border border-border/60">
          <CardHeader className="h-14 border-b bg-muted/20" />
          <CardContent className="p-6" />
        </Card>
        <Card className="h-80 border border-border/60">
          <CardHeader className="h-14 border-b bg-muted/20" />
          <CardContent className="p-6" />
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="h-72 border border-border/60">
          <CardHeader className="h-14 border-b bg-muted/20" />
          <CardContent className="p-6" />
        </Card>
        <Card className="h-72 border border-border/60">
          <CardHeader className="h-14 border-b bg-muted/20" />
          <CardContent className="p-6" />
        </Card>
      </div>
    </div>
  );
}
