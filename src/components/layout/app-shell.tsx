"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Pill,
  ReceiptText,
  Truck,
  ShoppingCart,
  X,
} from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

const MOBILE_NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Medicines", href: "/medicines", icon: Pill },
  { label: "Purchases", href: "/purchases", icon: ReceiptText },
  { label: "Suppliers", href: "/suppliers", icon: Truck },
  { label: "Sales", href: "/sales", icon: ShoppingCart },
];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  // Automatically close mobile menu on route change
  React.useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Touch Backdrop - Closes drawer on tap/click */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
            onTouchEnd={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Container */}
          <div className="relative flex w-[280px] max-w-[85vw] flex-col bg-white dark:bg-[#1C1C1E] z-50 shadow-2xl border-r border-border h-full">
            <div className="flex items-center justify-between p-3 border-b border-border/80">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Menu</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar
                isCollapsed={false}
                setIsCollapsed={() => setIsMobileOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-x-hidden pb-16 md:pb-0">
        <Header onMobileMenuToggle={() => setIsMobileOpen(true)} />
        <main className="flex-1 p-3 sm:p-5 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Apple-Style Floating Mobile Bottom Bar (Thumb-Friendly) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-xl border-t border-border/80 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
        <div className="grid grid-cols-5 items-center justify-around">
          {MOBILE_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl transition-all",
                  isActive
                    ? "text-[#0071E3] font-semibold"
                    : "text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "stroke-[2.5]" : "stroke-[1.75]")} />
                <span className="text-[10px] leading-tight truncate w-full text-center">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
