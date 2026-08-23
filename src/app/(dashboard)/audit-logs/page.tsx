import * as React from "react";
import { getAuditLogsAction } from "@/server/actions/settings.actions";
import { AuditLogsClient } from "./audit-logs-client";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{
    action?: string;
    entity?: string;
    search?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const pageNum = params.page ? parseInt(params.page, 10) : 1;

  const res = await getAuditLogsAction({
    action: params.action,
    entityName: params.entity,
    search: params.search,
    page: pageNum,
    pageSize: 30,
  });

  return <AuditLogsClient initialData={res.data} />;
}
