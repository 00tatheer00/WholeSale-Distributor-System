"use client";

import * as React from "react";
import { Search, Menu, Building2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationsPopover } from "@/components/layout/notifications-popover";
import { InfoGuideModal } from "@/components/layout/info-guide-modal";
import { UserNav } from "@/components/layout/user-nav";
import { Badge } from "@/components/ui/badge";
import { useUiMode } from "@/providers/ui-mode-provider";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const { isSimple, toggleUiMode } = useUiMode();

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border/80 bg-background/80 px-4 sm:px-6 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 transition-all gap-3">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMobileMenuToggle}
          className="md:hidden h-9 w-9 text-muted-foreground rounded-xl"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        <div className="hidden sm:flex flex-col gap-0.5">
          <Breadcrumbs />
        </div>
      </div>

      {/* Center: Global Search Bar Placeholder */}
      <div className="hidden lg:flex items-center w-full max-w-sm mx-2">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search medicines, batches, invoices (⌘K)..."
            className="w-full pl-10 pr-4 h-9 text-xs rounded-full bg-muted/60 border-transparent focus-visible:bg-background focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/10 transition-all"
          />
        </div>
      </div>

      {/* Right: Actions, Badges, Theme, Notifications & User Profile */}
      <div className="flex items-center gap-2 shrink-0">
        {/* 1-Click Interface Mode Switcher Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleUiMode}
          className={cn(
            "h-8 px-2.5 rounded-full text-xs font-semibold gap-1.5 transition-all shadow-2xs border",
            isSimple
              ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
              : "bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30"
          )}
          title={
            isSimple
              ? "Simple Wholesale Mode is active. Click to switch to Full Enterprise ERP"
              : "Full ERP Mode is active. Click to switch to Simple Wholesale Mode"
          }
        >
          <Zap
            className={cn(
              "h-3.5 w-3.5",
              isSimple
                ? "text-emerald-600 fill-emerald-600/40"
                : "text-blue-600 fill-blue-600/40"
            )}
          />
          <span className="hidden sm:inline">
            {isSimple ? "⚡ Simple Mode" : "🏢 Full ERP"}
          </span>
        </Button>

        <InfoGuideModal />

        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/80 text-secondary-foreground text-xs font-medium border border-border/50 shrink-0 whitespace-nowrap">
          <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="truncate max-w-[140px] font-semibold">Apex Pharma Dist</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0 whitespace-nowrap">
            Main Hub
          </span>
        </div>

        <ThemeToggle />
        <NotificationsPopover />
        <div className="h-5 w-px bg-border/80 mx-0.5" />
        <UserNav />
      </div>
    </header>
  );
}
