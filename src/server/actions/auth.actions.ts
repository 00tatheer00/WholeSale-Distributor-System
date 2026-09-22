"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@/validations/auth.schema";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { MOCK_USERS } from "./mock-data";

export type AuthActionResult = {
  success: boolean;
  message?: string;
  error?: string;
};

/**
 * Server Action for User Sign-In using Local SQLite Database & Bcrypt Authentication.
 * 100% Offline with multi-user role support.
 */
export async function loginAction(
  data: LoginInput
): Promise<AuthActionResult> {
  try {
    // 1. Zod input validation
    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message || "Invalid input data",
      };
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();
    const cookieStore = await cookies();

    // 2. Local Database Authentication via SQLite
    try {
      const user = await prisma.user.findFirst({
        where: { email: normalizedEmail },
      });

      if (user) {
        if (user.status !== "ACTIVE") {
          return {
            success: false,
            error: "This account has been deactivated. Please contact your system administrator.",
          };
        }

        let isPasswordValid = false;

        // Check bcrypt password hash
        if (user.passwordHash && user.passwordHash.length > 0) {
          isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        }

        if (isPasswordValid) {
          cookieStore.set("wmdms_session", normalizedEmail, {
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            httpOnly: true,
            sameSite: "lax",
          });
          cookieStore.set("wmdms_demo_session", normalizedEmail, {
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
            httpOnly: true,
            sameSite: "lax",
          });

          return { success: true };
        } else {
          return {
            success: false,
            error: "Invalid email or password. Please verify your credentials.",
          };
        }
      }
    } catch (dbErr) {
      console.error("Local SQLite login error:", dbErr);
    }

    // 3. Fallback only if SQLite query errored or user does not exist in DB but matches mock user with correct demo password
    const demoUser = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );

    if (demoUser && (password === "admin123" || password === "admin@123" || password === "sales123" || password === "warehouse123" || password === "accounts123")) {
      cookieStore.set("wmdms_session", normalizedEmail, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: "lax",
      });
      cookieStore.set("wmdms_demo_session", normalizedEmail, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: "lax",
      });

      return { success: true };
    }

    return {
      success: false,
      error: "Invalid email or password. Please verify your credentials.",
    };
  } catch (err: unknown) {
    console.error("Login Server Action Error:", err);
    return {
      success: false,
      error: "An unexpected error occurred during sign in. Please try again.",
    };
  }
}

/**
 * Server Action for User Logout.
 */
export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("wmdms_session");
  cookieStore.delete("wmdms_demo_session");

  revalidatePath("/", "layout");
  redirect("/login");
}

/**
 * Offline notice for Forgot Password.
 */
export async function forgotPasswordAction(
  data: ForgotPasswordInput
): Promise<AuthActionResult> {
  return {
    success: true,
    message: "In offline desktop and local network mode, please ask your System Administrator to reset your password from Settings > Team & Security.",
  };
}

/**
 * Offline notice for Reset Password.
 */
export async function resetPasswordAction(
  data: ResetPasswordInput
): Promise<AuthActionResult> {
  return {
    success: true,
    message: "Password reset is managed directly by Administrators through Settings > Team & Security.",
  };
}
