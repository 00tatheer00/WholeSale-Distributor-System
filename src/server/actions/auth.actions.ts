"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@/validations/auth.schema";

export type AuthActionResult = {
  success: boolean;
  message?: string;
  error?: string;
};

/**
 * Server Action for User Sign-In using Supabase Auth.
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
    const supabase = await createServerSupabaseClient();

    // 2. Authenticate with Supabase Auth
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error || !authData.user) {
      // Return clean, non-technical error to prevent user enumeration
      return {
        success: false,
        error: "Invalid email or password. Please check your credentials.",
      };
    }

    // 3. Sync supabaseAuthId with Prisma user profile if not yet linked
    try {
      const existingUser = await prisma.user.findFirst({
        where: { email: authData.user.email?.toLowerCase() },
      });

      if (existingUser && !existingUser.supabaseAuthId) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { supabaseAuthId: authData.user.id },
        });
      }

      // Log successful login in AuditLog
      if (existingUser) {
        await prisma.auditLog.create({
          data: {
            userId: existingUser.id,
            action: "USER_LOGIN",
            entityName: "User",
            entityId: existingUser.id,
            newValues: { email: existingUser.email, role: existingUser.role },
          },
        });
      }
    } catch {
      // Non-blocking catch for audit logging
    }

    revalidatePath("/", "layout");
    return { success: true };
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
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

/**
 * Server Action to request a password reset email.
 */
export async function forgotPasswordAction(
  data: ForgotPasswordInput
): Promise<AuthActionResult> {
  try {
    const parsed = forgotPasswordSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message || "Invalid email address",
      };
    }

    const { email } = parsed.data;
    const supabase = await createServerSupabaseClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        redirectTo: `${appUrl}/reset-password`,
      }
    );

    if (error) {
      console.error("Supabase Reset Password Error:", error.message);
      return {
        success: false,
        error: "Unable to process password reset request. Please verify the email address.",
      };
    }

    return {
      success: true,
      message: "If an account exists with this email, a password recovery link has been dispatched.",
    };
  } catch (err: unknown) {
    console.error("Forgot Password Server Action Error:", err);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Server Action to update the password for an authenticated recovery session.
 */
export async function resetPasswordAction(
  data: ResetPasswordInput
): Promise<AuthActionResult> {
  try {
    const parsed = resetPasswordSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message || "Invalid password requirements",
      };
    }

    const { password } = parsed.data;
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      return {
        success: false,
        error: "Password reset failed. The recovery session may have expired.",
      };
    }

    return {
      success: true,
      message: "Your password has been successfully updated. You can now sign in.",
    };
  } catch (err: unknown) {
    console.error("Reset Password Server Action Error:", err);
    return {
      success: false,
      error: "An unexpected error occurred while resetting your password.",
    };
  }
}
