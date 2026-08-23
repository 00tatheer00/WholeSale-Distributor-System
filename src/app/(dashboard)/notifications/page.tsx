import * as React from "react";
import { getNotificationsAction } from "@/server/actions/notification.actions";
import { NotificationsClient } from "./notifications-client";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const res = await getNotificationsAction();

  return <NotificationsClient initialData={res.data} />;
}
