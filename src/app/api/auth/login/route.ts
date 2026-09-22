import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/validations/auth.schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message || "Invalid credentials" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check local SQLite Database
    try {
      const user = await prisma.user.findFirst({
        where: { email: normalizedEmail },
      });

      if (user) {
        if (user.status !== "ACTIVE") {
          return NextResponse.json(
            { success: false, error: "This account has been deactivated." },
            { status: 403 }
          );
        }

        let isPasswordValid = false;
        if (user.passwordHash && user.passwordHash.length > 0) {
          isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        }

        if (isPasswordValid) {
          const res = NextResponse.json({ success: true, message: "Signed in successfully" });
          res.cookies.set("wmdms_session", normalizedEmail, {
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
            httpOnly: true,
            sameSite: "lax",
          });
          res.cookies.set("wmdms_demo_session", normalizedEmail, {
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
            httpOnly: true,
            sameSite: "lax",
          });
          return res;
        } else {
          // Password did not match database hash
          return NextResponse.json(
            { success: false, error: "Invalid email or password. Please try again." },
            { status: 401 }
          );
        }
      }
    } catch (dbErr) {
      console.warn("Local DB lookup notice:", dbErr);
    }

    return NextResponse.json(
      { success: false, error: "Invalid email or password. Please try again." },
      { status: 401 }
    );
  } catch (err: unknown) {
    console.error("Login API error:", err);
    return NextResponse.json(
      { success: false, error: "An error occurred during authentication." },
      { status: 500 }
    );
  }
}
