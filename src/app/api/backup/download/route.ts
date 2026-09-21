import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.profile?.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Only Super Administrators can download system backups." },
        { status: 403 }
      );
    }

    const dbPath = path.join(process.cwd(), "prisma", "wmdms.db");
    if (!fs.existsSync(dbPath)) {
      return NextResponse.json({ error: "Database file not found." }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(dbPath);
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `pharmadist-backup-${dateStr}.db`;

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "application/x-sqlite3",
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("Backup download failed:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to download backup" },
      { status: 500 }
    );
  }
}
