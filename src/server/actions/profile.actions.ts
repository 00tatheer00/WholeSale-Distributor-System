"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  updateProfileSchema,
  updatePasswordSchema,
  UpdateProfileInput,
  UpdatePasswordInput,
} from "@/validations/auth.schema";

export type ProfileActionResult = {
  success: boolean;
  message?: string;
  error?: string;
};

/**
 * Server Action for updating Admin / User Profile details (Name, Phone).
 */
export async function updateProfileAction(
  data: UpdateProfileInput
): Promise<ProfileActionResult> {
  try {
    const authContext = await requireAuth();
    if (!authContext.profile) {
      return {
        success: false,
        error: "User database profile not found.",
      };
    }

    const parsed = updateProfileSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message || "Invalid profile data",
      };
    }

    const { name, phone } = parsed.data;

    const updatedUser = await prisma.user.update({
      where: { id: authContext.profile.id },
      data: {
        name,
        phone: phone || null,
      },
    });

    // Write audit log with JSON.stringify for SQLite compatibility
    try {
      await prisma.auditLog.create({
        data: {
          userId: updatedUser.id,
          action: "UPDATE_PROFILE",
          entityName: "User",
          entityId: updatedUser.id,
          oldValues: JSON.stringify({
            name: authContext.profile.name,
            phone: authContext.profile.phone,
          }),
          newValues: JSON.stringify({
            name: updatedUser.name,
            phone: updatedUser.phone,
          }),
        },
      });
    } catch (auditErr) {
      console.error("Audit log error:", auditErr);
    }

    revalidatePath("/settings/profile");
    revalidatePath("/", "layout");

    return {
      success: true,
      message: "Profile information updated successfully.",
    };
  } catch (err: unknown) {
    console.error("Update Profile Server Action Error:", err);
    return {
      success: false,
      error: "Failed to update profile. Please try again.",
    };
  }
}

/**
 * Server Action for changing password from authenticated admin profile in offline desktop ERP.
 */
export async function updatePasswordAction(
  data: UpdatePasswordInput
): Promise<ProfileActionResult> {
  try {
    const authContext = await requireAuth();
    if (!authContext.profile) {
      return {
        success: false,
        error: "User profile not found.",
      };
    }

    const parsed = updatePasswordSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message || "Invalid password requirements",
      };
    }

    const { newPassword } = parsed.data;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update in local SQLite database
    await prisma.user.update({
      where: { id: authContext.profile.id },
      data: {
        passwordHash: hashedPassword,
      },
    });

    // Write audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: authContext.profile.id,
          action: "CHANGE_PASSWORD",
          entityName: "User",
          entityId: authContext.profile.id,
          newValues: JSON.stringify({ passwordChanged: true }),
        },
      });
    } catch (auditErr) {
      console.error("Audit log error:", auditErr);
    }

    revalidatePath("/settings/profile");

    return {
      success: true,
      message: "Your password has been changed successfully.",
    };
  } catch (err: unknown) {
    console.error("Change Password Server Action Error:", err);
    return {
      success: false,
      error: "An unexpected error occurred while changing your password.",
    };
  }
}
