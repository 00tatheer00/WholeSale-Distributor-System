"use server";

import { revalidatePath } from "next/cache";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  NotificationSummary,
} from "@/server/services/notification.service";

export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function getNotificationsAction(): Promise<ActionResult<NotificationSummary>> {
  try {
    const data = await getNotifications();
    return { success: true, data };
  } catch (error: any) {
    console.error("getNotificationsAction error:", error);
    return {
      success: true,
      data: { unreadCount: 0, notifications: [] },
    };
  }
}

export async function markNotificationAsReadAction(id: string): Promise<ActionResult> {
  try {
    const ok = await markNotificationAsRead(id);
    if (!ok) return { success: false, error: "Failed to update notification." };

    revalidatePath("/notifications");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to mark as read." };
  }
}

export async function markAllNotificationsAsReadAction(): Promise<ActionResult> {
  try {
    const ok = await markAllNotificationsAsRead();
    if (!ok) return { success: false, error: "Failed to clear notifications." };

    revalidatePath("/notifications");
    return { success: true, message: "All notifications marked as read." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to mark all as read." };
  }
}
