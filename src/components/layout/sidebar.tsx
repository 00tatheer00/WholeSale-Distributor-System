"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Pill,
  Boxes,
  Truck,
  ReceiptText,
  Store,
  ShoppingCart,
  FileSpreadsheet,
  Users2,
  CreditCard,
  Wallet,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Cross,
  Layers,
  SlidersHorizontal,
  History,
  TrendingUp,
  Bell,
  Shield,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAVIGATION_SECTIONS, APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Pill,
  Boxes,
  Layers,
  SlidersHorizontal,
  History,
  Truck,
  ReceiptText,
  Store,
  ShoppingCart,
  FileSpreadsheet,
  Users2,
  CreditCard,
  Wallet,
  TrendingUp,
  BarChart3,
  Bell,
  Settings,
  Shield,
  BookOpen,
  HelpCircle,
};

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out shrink-0 z-30 h-screen sticky top-0",
        isCollapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 overflow-hidden font-bold tracking-tight"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shrink-0 shadow-sm transition-transform hover:scale-105">
            <Cross className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold truncate leading-tight text-foreground">
                {APP_NAME}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">
                Wholesale Cloud ERP
              </span>
            </div>
          )}
        </Link>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg hidden md:flex"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-4 px-2.5 space-y-4">
        {NAVIGATION_SECTIONS.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <h4 className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {section.title}
              </h4>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = iconMap[item.iconName] || Layers;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.title : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium transition-all group relative",
                      isActive
                        ? "bg-primary text-white font-semibold shadow-sm"
                        : "text-foreground/80 hover:bg-muted/80 hover:text-foreground"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform group-hover:scale-105",
                        isActive
                          ? "text-white"
                          : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    {!isCollapsed && (
                      <span className="truncate flex-1">{item.title}</span>
                    )}
                    {item.badge && !isCollapsed && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-primary/10 text-primary"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* System Status Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <div
          className={cn(
            "flex items-center rounded-xl bg-muted/60 p-2.5 text-xs border border-border/40",
            isCollapsed ? "justify-center" : "gap-2.5"
          )}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 ring-2 ring-emerald-500/20" />
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="text-[11px] font-semibold text-foreground">System Online</span>
              <span className="text-[10px] text-muted-foreground">PostgreSQL / FEFO Active</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
