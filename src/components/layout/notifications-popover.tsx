"use client";

import * as React from "react";
import { Bell, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function NotificationsPopover() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
          </span>
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="p-0 font-semibold text-sm">
            Operational Alerts
          </DropdownMenuLabel>
          <Badge variant="outline" className="text-xs">
            System Live
          </Badge>
        </div>
        <DropdownMenuSeparator />

        <div className="flex flex-col gap-1 p-1">
          <DropdownMenuItem className="cursor-pointer flex items-start gap-2.5 p-2 rounded-md focus:bg-muted">
            <div className="p-1 rounded bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 mt-0.5">
              <Clock className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-xs font-medium leading-none">
                FEFO Expiry Monitor Active
              </p>
              <p className="text-[11px] text-muted-foreground">
                Batch expiration tracking engine is running.
              </p>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem className="cursor-pointer flex items-start gap-2.5 p-2 rounded-md focus:bg-muted">
            <div className="p-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 mt-0.5">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-xs font-medium leading-none">
                Credit Limit Guard Enabled
              </p>
              <p className="text-[11px] text-muted-foreground">
                Customer aging and credit barrier active.
              </p>
            </div>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />
        <div className="p-1">
          <Button variant="ghost" size="sm" className="w-full text-xs justify-center font-normal">
            View All Audit Notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
