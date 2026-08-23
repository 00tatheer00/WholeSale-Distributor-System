"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  PackageX,
  AlertTriangle,
  Clock,
  ShieldAlert,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  Filter,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  NotificationSummary,
  NotificationItem,
} from "@/server/services/notification.service";
import {
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
} from "@/server/actions/notification.actions";
import { formatDate } from "@/lib/utils";

interface NotificationsClientProps {
  initialData?: NotificationSummary;
}

export function NotificationsClient({ initialData }: NotificationsClientProps) {
  const router = useRouter();
  const [filterType, setFilterType] = React.useState<string>("ALL");
  const [isMarkingAll, setIsMarkingAll] = React.useState(false);

  const notifications = initialData?.notifications || [];
  const unreadCount = initialData?.unreadCount || 0;

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === "ALL") return true;
    if (filterType === "UNREAD") return !n.isRead;
    return n.type === filterType;
  });

  const handleMarkAllRead = async () => {
    try {
      setIsMarkingAll(true);
      await markAllNotificationsAsReadAction();
      router.refresh();
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    await markNotificationAsReadAction(id);
    router.refresh();
  };

  const getAlertBadge = (type: string) => {
    switch (type) {
      case "OUT_OF_STOCK":
        return <Badge className="bg-rose-100 text-rose-800 border-rose-200">Out of Stock</Badge>;
      case "LOW_STOCK":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Low Stock</Badge>;
      case "EXPIRED_MEDICINE":
        return <Badge className="bg-rose-100 text-rose-900 border-rose-300">Expired Stock</Badge>;
      case "NEAR_EXPIRY":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Near Expiry</Badge>;
      case "CUSTOMER_CREDIT_BREACH":
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Credit Overdue</Badge>;
      case "SUPPLIER_PAYMENT_DUE":
        return <Badge className="bg-sky-100 text-sky-800 border-sky-200">Supplier Due</Badge>;
      default:
        return <Badge variant="outline">System Notice</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-20">
      {/* 1. Header */}
      <PageHeader
        title="Notifications & Operational Alerts"
        description="Automated business watchdog monitoring inventory depletion, FEFO expirations, and customer credit thresholds."
      >
        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllRead}
            disabled={isMarkingAll}
            variant="outline"
            className="rounded-xl text-xs h-9 border-border/80 hover:bg-muted"
          >
            <CheckCheck className="h-4 w-4 mr-1.5 text-emerald-600" />
            Mark All as Read ({unreadCount})
          </Button>
        )}
      </PageHeader>

      {/* 2. Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 bg-muted/40 p-1 rounded-2xl border border-border/80 max-w-fit">
        {[
          { label: "All Alerts", value: "ALL" },
          { label: `Unread (${unreadCount})`, value: "UNREAD" },
          { label: "Low Stock", value: "LOW_STOCK" },
          { label: "Out of Stock", value: "OUT_OF_STOCK" },
          { label: "Near Expiry", value: "NEAR_EXPIRY" },
          { label: "Expired", value: "EXPIRED_MEDICINE" },
          { label: "Credit Breach", value: "CUSTOMER_CREDIT_BREACH" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilterType(f.value)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              filterType === f.value
                ? "bg-white dark:bg-card text-foreground shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 3. Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-card border border-border/80 rounded-2xl p-12 text-center text-muted-foreground shadow-sm">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-foreground">No alerts for the selected category</p>
            <p className="text-xs text-muted-foreground mt-1">All business indicators and thresholds are currently healthy.</p>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
                !n.isRead
                  ? "bg-sky-50/40 border-sky-200 dark:bg-sky-950/20 dark:border-sky-900"
                  : "bg-card border-border/70"
              }`}
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  {getAlertBadge(n.type)}
                  <h3 className="text-xs font-bold text-foreground truncate">{n.title}</h3>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    • {formatDate(n.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {n.message}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!n.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkSingleRead(n.id)}
                    className="h-8 text-xs text-muted-foreground hover:text-foreground rounded-lg"
                  >
                    Mark Read
                  </Button>
                )}

                {n.link && (
                  <Button
                    asChild
                    size="sm"
                    className="bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl text-xs h-8 px-3"
                  >
                    <Link href={n.link} onClick={() => !n.isRead && handleMarkSingleRead(n.id)}>
                      Review Now <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
