"use client";

import * as React from "react";
import { Search, Menu, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationsPopover } from "@/components/layout/notifications-popover";
import { UserNav } from "@/components/layout/user-nav";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMobileMenuToggle}
          className="md:hidden h-9 w-9 text-muted-foreground"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        <div className="hidden sm:flex flex-col gap-0.5">
          <Breadcrumbs />
        </div>
      </div>

      {/* Center: Global Search Bar Placeholder */}
      <div className="hidden lg:flex items-center w-full max-w-md mx-4">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search medicines, batches, customers, invoices (Press ⌘K)..."
            className="w-full pl-9 pr-4 h-9 text-xs bg-muted/40 border-muted focus-visible:bg-background"
          />
        </div>
      </div>

      {/* Right: Company Badge, Theme, Notifications & User */}
      <div className="flex items-center gap-2">
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary/80 text-secondary-foreground text-xs font-medium">
          <Building2 className="h-3.5 w-3.5 text-primary" />
          <span className="truncate max-w-[160px]">Apex Pharma Dist Ltd.</span>
          <Badge variant="outline" className="text-[10px] h-4 px-1 py-0 border-primary/40 text-primary">
            Main Hub
          </Badge>
        </div>

        <ThemeToggle />
        <NotificationsPopover />
        <div className="h-5 w-px bg-border mx-1" />
        <UserNav />
      </div>
    </header>
  );
}
