import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationSummary {
  unreadCount: number;
  notifications: NotificationItem[];
}

/**
 * Fetch Notifications with Unread Counter
 */
export async function getNotifications(userId?: string): Promise<NotificationSummary> {
  try {
    // Generate fresh system alerts on demand
    await generateSystemAlerts();

    const whereClause: any = userId ? { OR: [{ userId }, { userId: null }] } : {};

    const [unreadCount, rawNotifications] = await Promise.all([
      prisma.notification.count({
        where: { ...whereClause, isRead: false },
      }),
      prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    const notifications: NotificationItem[] = rawNotifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      link: n.link,
      isRead: n.isRead,
      readAt: n.readAt ? n.readAt.toISOString() : null,
      createdAt: n.createdAt.toISOString(),
    }));

    return {
      unreadCount,
      notifications,
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return {
      unreadCount: 0,
      notifications: [],
    };
  }
}

/**
 * Automated Real-time Business Alerts Generation with Deduplication
 */
export async function generateSystemAlerts(): Promise<void> {
  try {
    const now = new Date();
    const in60Days = new Date();
    in60Days.setDate(now.getDate() + 60);

    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    // Fetch existing recent unread notifications for deduplication
    const recentNotifications = await prisma.notification.findMany({
      where: {
        isRead: false,
        createdAt: { gte: oneDayAgo },
      },
      select: { type: true, title: true },
    });

    const existingKeys = new Set(
      recentNotifications.map((n) => `${n.type}_${n.title}`)
    );

    const newAlertsToCreate: Array<{
      type: NotificationType;
      title: string;
      message: string;
      link: string;
    }> = [];

    // 1. Check Out of Stock & Low Stock
    const medicines = await prisma.medicine.findMany({
      where: { status: "ACTIVE" },
      include: {
        batches: {
          where: { quantityOnHand: { gt: 0 } },
          select: { quantityOnHand: true },
        },
      },
    });

    medicines.forEach((m) => {
      const totalStock = m.batches.reduce((sum, b) => sum + b.quantityOnHand, 0);

      if (totalStock === 0) {
        const title = `Out of Stock: ${m.brandName}`;
        if (!existingKeys.has(`${NotificationType.OUT_OF_STOCK}_${title}`)) {
          newAlertsToCreate.push({
            type: NotificationType.OUT_OF_STOCK,
            title,
            message: `"${m.brandName}" (${m.genericName}) has 0 units available across all batches.`,
            link: `/reports/low-stock`,
          });
          existingKeys.add(`${NotificationType.OUT_OF_STOCK}_${title}`);
        }
      } else if (totalStock <= m.minReorderLevel) {
        const title = `Low Stock Warning: ${m.brandName}`;
        if (!existingKeys.has(`${NotificationType.LOW_STOCK}_${title}`)) {
          newAlertsToCreate.push({
            type: NotificationType.LOW_STOCK,
            title,
            message: `"${m.brandName}" has only ${totalStock} units left (Min threshold: ${m.minReorderLevel}).`,
            link: `/reports/low-stock`,
          });
          existingKeys.add(`${NotificationType.LOW_STOCK}_${title}`);
        }
      }
    });

    // 2. Check Expired & Near-Expiry Batches
    const batches = await prisma.medicineBatch.findMany({
      where: {
        quantityOnHand: { gt: 0 },
        expiryDate: { lte: in60Days },
      },
      include: { medicine: true },
    });

    batches.forEach((b) => {
      if (b.expiryDate < now) {
        const title = `Expired Stock: ${b.medicine.brandName} (Batch ${b.batchNumber})`;
        if (!existingKeys.has(`${NotificationType.EXPIRED_MEDICINE}_${title}`)) {
          newAlertsToCreate.push({
            type: NotificationType.EXPIRED_MEDICINE,
            title,
            message: `Batch "${b.batchNumber}" expired on ${b.expiryDate.toISOString().split("T")[0]} with ${b.quantityOnHand} units remaining. Quarantine immediately.`,
            link: `/reports/expiry`,
          });
          existingKeys.add(`${NotificationType.EXPIRED_MEDICINE}_${title}`);
        }
      } else {
        const daysLeft = Math.ceil((b.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const title = `Near Expiry (${daysLeft}d): ${b.medicine.brandName}`;
        if (!existingKeys.has(`${NotificationType.NEAR_EXPIRY}_${title}`)) {
          newAlertsToCreate.push({
            type: NotificationType.NEAR_EXPIRY,
            title,
            message: `Batch "${b.batchNumber}" has ${b.quantityOnHand} units expiring in ${daysLeft} days (${b.expiryDate.toISOString().split("T")[0]}).`,
            link: `/reports/expiry`,
          });
          existingKeys.add(`${NotificationType.NEAR_EXPIRY}_${title}`);
        }
      }
    });

    // 3. Check Customer Credit Limit Breaches
    const overLimitCustomers = await prisma.customer.findMany({
      where: {
        status: "ACTIVE",
        creditLimit: { gt: 0 },
      },
      select: {
        id: true,
        pharmacyName: true,
        currentDue: true,
        creditLimit: true,
      },
    });

    overLimitCustomers.forEach((c) => {
      if (Number(c.currentDue) > Number(c.creditLimit)) {
        const title = `Credit Limit Exceeded: ${c.pharmacyName}`;
        if (!existingKeys.has(`${NotificationType.CUSTOMER_CREDIT_BREACH}_${title}`)) {
          newAlertsToCreate.push({
            type: NotificationType.CUSTOMER_CREDIT_BREACH,
            title,
            message: `${c.pharmacyName} current due ৳${Number(c.currentDue).toLocaleString()} exceeds credit limit ৳${Number(c.creditLimit).toLocaleString()}.`,
            link: `/reports/customer-dues`,
          });
          existingKeys.add(`${NotificationType.CUSTOMER_CREDIT_BREACH}_${title}`);
        }
      }
    });

    // 4. Batch Insert New Deduplicated Alerts
    if (newAlertsToCreate.length > 0) {
      await prisma.notification.createMany({
        data: newAlertsToCreate.map((a) => ({
          type: a.type,
          title: a.title,
          message: a.message,
          link: a.link,
          isRead: false,
        })),
      });
    }
  } catch (error) {
    console.error("Error generating system alerts:", error);
  }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(id: string): Promise<boolean> {
  try {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
}

/**
 * Mark all unread notifications as read
 */
export async function markAllNotificationsAsRead(userId?: string): Promise<boolean> {
  try {
    const whereClause: any = userId ? { OR: [{ userId }, { userId: null }] } : {};
    await prisma.notification.updateMany({
      where: { ...whereClause, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return true;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }
}
