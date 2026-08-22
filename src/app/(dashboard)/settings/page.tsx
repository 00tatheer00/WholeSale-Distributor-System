import * as React from "react";
import {
  getCompanySettingsAction,
  getUsersAction,
  getAuditLogsAction,
} from "@/server/actions/settings.actions";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const [companyRes, usersRes, auditLogsRes] = await Promise.all([
    getCompanySettingsAction(),
    getUsersAction(),
    getAuditLogsAction(),
  ]);

  return (
    <SettingsClient
      initialCompany={companyRes.data || {}}
      users={usersRes.data || []}
      auditLogs={auditLogsRes.data || []}
    />
  );
}
