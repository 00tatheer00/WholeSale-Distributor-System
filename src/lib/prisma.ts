import "server-only";
import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

function resolveSqliteDatabaseUrl(): string {
  // If explicitly passed via env and points to existing file
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && envUrl.startsWith("file:")) {
    const raw = envUrl.replace("file:", "");
    if (path.isAbsolute(raw) && fs.existsSync(raw)) {
      return envUrl;
    }
  }

  // Candidate locations for wmdms.db
  const candidates = [
    path.join(process.cwd(), "prisma", "wmdms.db"),
    path.join(process.cwd(), "wmdms.db"),
    path.join(__dirname, "prisma", "wmdms.db"),
    path.join(__dirname, "..", "prisma", "wmdms.db"),
    path.join(__dirname, "..", "..", "prisma", "wmdms.db"),
    path.join(__dirname, "..", "..", "..", "prisma", "wmdms.db"),
    typeof (process as any).resourcesPath !== "undefined"
      ? path.join((process as any).resourcesPath, "app", "prisma", "wmdms.db")
      : "",
    typeof (process as any).resourcesPath !== "undefined"
      ? path.join((process as any).resourcesPath, "app", ".next", "standalone", "prisma", "wmdms.db")
      : "",
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      const normalized = candidate.replace(/\\/g, "/");
      return `file:${normalized}`;
    }
  }

  // Default path
  const defaultPath = path.join(process.cwd(), "prisma", "wmdms.db").replace(/\\/g, "/");
  return `file:${defaultPath}`;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const resolvedUrl = resolveSqliteDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: resolvedUrl,
      },
    },
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
