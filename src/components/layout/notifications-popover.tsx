"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  AlertTriangle,
  PackageX,
  Clock,
  ShieldAlert,
  CreditCard,
  Receipt,
  CheckCircle2,
} from "lucide-react";
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
import {
  getNotificationsAction,
  markNotificationAsReadAction,
} from "@/server/actions/notification.actions";
import { NotificationItem } from "@/server/services/notification.service";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "OUT_OF_STOCK":
      return <PackageX className="h-4 w-4 text-rose-600" />;
    case "LOW_STOCK":
      return <AlertTriangle className="h-4 w-4 text-amber-600" />;
    case "EXPIRED_MEDICINE":
      return <PackageX className="h-4 w-4 text-rose-700" />;
    case "NEAR_EXPIRY":
      return <Clock className="h-4 w-4 text-amber-600" />;
    case "CUSTOMER_CREDIT_BREACH":
      return <ShieldAlert className="h-4 w-4 text-purple-600" />;
    case "SUPPLIER_PAYMENT_DUE":
      return <CreditCard className="h-4 w-4 text-sky-600" />;
    default:
      return <Bell className="h-4 w-4 text-[#0071E3]" />;
  }
};

export function NotificationsPopover() {
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);

  const fetchAlerts = async () => {
    try {
      const res = await getNotificationsAction();
      if (res.success && res.data) {
        setUnreadCount(res.data.unreadCount);
        setNotifications(res.data.notifications.slice(0, 5));
      }
    } catch {
      // safe fallback
    }
  };

  React.useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 45000); // 45s interval
    return () => clearInterval(interval);
  }, []);

  const handleItemClick = async (n: NotificationItem) => {
    if (!n.isRead) {
      await markNotificationAsReadAction(n.id);
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl hover:bg-muted/80">
          <Bell className="h-4 w-4 text-foreground/80" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-84 p-0 rounded-2xl shadow-lg border border-border/80">
        <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border/60">
          <DropdownMenuLabel className="p-0 font-bold text-xs text-foreground flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5 text-[#0071E3]" />
            Business Alerts & Watchdog
          </DropdownMenuLabel>
          {unreadCount > 0 ? (
            <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-mono">
              {unreadCount} Unread
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] text-muted-foreground">
              All Caught Up
            </Badge>
          )}
        </div>

        <div className="flex flex-col divide-y divide-border/40 max-h-[320px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1.5" />
              <p className="font-medium text-foreground">No active business alerts</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Inventory & credit guards healthy.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <Link
                key={n.id}
                href={n.link || "/notifications"}
                onClick={() => handleItemClick(n)}
                className={`flex items-start gap-3 p-3 hover:bg-muted/40 transition-colors ${
                  !n.isRead ? "bg-sky-50/40 dark:bg-sky-950/20" : ""
                }`}
              >
                <div className="p-1.5 rounded-xl bg-muted/60 shrink-0 mt-0.5">
                  {getNotificationIcon(n.type)}
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{n.title}</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>
                  <span className="text-[10px] text-muted-foreground/80 mt-0.5">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="p-2 bg-muted/20 border-t border-border/60">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="w-full text-xs justify-center font-semibold text-[#0071E3] hover:bg-sky-50 rounded-xl h-8"
          >
            <Link href="/notifications" onClick={() => setIsOpen(false)}>
              Open Full Notifications Center →
            </Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
