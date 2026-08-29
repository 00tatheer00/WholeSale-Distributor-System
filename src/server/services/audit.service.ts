import { prisma } from "@/lib/prisma";

export interface CreateAuditLogParams {
  action: string;
  entityName: string;
  entityId?: string | null;
  oldValues?: any;
  newValues?: any;
  userId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface AuditLogQueryParams {
  action?: string;
  entityName?: string;
  search?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

// Sanitization: Remove secrets and sensitive keys from audit logs
function sanitizeAuditPayload(data: any): any {
  if (!data || typeof data !== "object") return data;
  const sanitized = Array.isArray(data) ? [...data] : { ...data };
  const sensitiveKeys = ["password", "token", "secret", "apiKey", "access_token", "refresh_token", "hash"];

  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some((k) => key.toLowerCase().includes(k))) {
      sanitized[key] = "[REDACTED_SECRET]";
    } else if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
      sanitized[key] = sanitizeAuditPayload(sanitized[key]);
    }
  }
  return sanitized;
}

/**
 * Record an Immutable Audit Log Entry in SQLite
 */
export async function recordAuditLog(params: CreateAuditLogParams) {
  try {
    const sanitizedOld = params.oldValues ? sanitizeAuditPayload(params.oldValues) : undefined;
    const sanitizedNew = params.newValues ? sanitizeAuditPayload(params.newValues) : undefined;

    return await prisma.auditLog.create({
      data: {
        action: params.action,
        entityName: params.entityName,
        entityId: params.entityId,
        oldValues: sanitizedOld ? (typeof sanitizedOld === "string" ? sanitizedOld : JSON.stringify(sanitizedOld)) : null,
        newValues: sanitizedNew ? (typeof sanitizedNew === "string" ? sanitizedNew : JSON.stringify(sanitizedNew)) : null,
        userId: params.userId,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to record audit log:", error);
    return null;
  }
}

/**
 * Query Audit Logs with Filtering and Pagination
 */
export async function getAuditLogs(params: AuditLogQueryParams = {}) {
  const {
    action,
    entityName,
    search = "",
    userId,
    startDate,
    endDate,
    page = 1,
    pageSize = 30,
  } = params;

  const whereClause: any = {};

  if (action && action !== "ALL") whereClause.action = action;
  if (entityName && entityName !== "ALL") whereClause.entityName = entityName;
  if (userId && userId !== "ALL") whereClause.userId = userId;

  if (startDate || endDate) {
    whereClause.createdAt = {};
    if (startDate) whereClause.createdAt.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      whereClause.createdAt.lte = end;
    }
  }

  if (search.trim()) {
    whereClause.OR = [
      { action: { contains: search.trim() } },
      { entityName: { contains: search.trim() } },
      { entityId: { contains: search.trim() } },
      { user: { name: { contains: search.trim() } } },
    ];
  }

  const [totalCount, logs] = await Promise.all([
    prisma.auditLog.count({ where: whereClause }),
    prisma.auditLog.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    currentPage: page,
    pageSize,
    logs: logs.map((l) => ({
      id: l.id,
      action: l.action,
      entityName: l.entityName,
      entityId: l.entityId || "N/A",
      userName: l.user?.name || "System Rule / Cashier",
      userEmail: l.user?.email || "system@pharmadist.local",
      userRole: l.user?.role || "SYSTEM",
      ipAddress: l.ipAddress || "Internal",
      userAgent: l.userAgent || "Desktop Application",
      oldValues: l.oldValues,
      newValues: l.newValues,
      createdAt: l.createdAt.toISOString(),
    })),
  };
}
