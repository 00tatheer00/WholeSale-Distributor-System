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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAVIGATION_SECTIONS, APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
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
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border/60">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 overflow-hidden font-bold tracking-tight"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shrink-0 shadow-md">
            <Cross className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold truncate leading-tight text-white">
                {APP_NAME}
              </span>
              <span className="text-[10px] text-sidebar-foreground/60 font-medium tracking-wider uppercase">
                Wholesale ERP
              </span>
            </div>
          )}
        </Link>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-7 w-7 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent hidden md:flex"
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
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAVIGATION_SECTIONS.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <h4 className="px-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/45">
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
                      "flex items-center gap-3 rounded-md px-2.5 py-2 text-xs font-medium transition-all group relative",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-sm"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform group-hover:scale-105",
                        isActive
                          ? "text-sidebar-primary-foreground"
                          : "text-sidebar-foreground/70"
                      )}
                    />
                    {!isCollapsed && (
                      <span className="truncate flex-1">{item.title}</span>
                    )}
                    {item.badge && !isCollapsed && (
                      <span className="rounded-full bg-sidebar-primary/20 px-1.5 py-0.5 text-[9px] font-semibold text-sidebar-primary">
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
      <div className="p-3 border-t border-sidebar-border/60">
        <div
          className={cn(
            "flex items-center rounded-md bg-sidebar-accent/50 p-2 text-xs",
            isCollapsed ? "justify-center" : "gap-2"
          )}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="text-[11px] font-medium text-white">System Online</span>
              <span className="text-[10px] text-sidebar-foreground/50">PostgreSQL / FEFO Active</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
