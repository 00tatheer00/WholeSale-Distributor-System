import "server-only";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export interface AuthenticatedUserContext {
  supabaseUser: {
    id: string;
    email: string;
  };
  profile: {
    id: string;
    companyId: string;
    email: string;
    name: string;
    phone: string | null;
    role: UserRole;
    status: string;
    company: {
      id: string;
      name: string;
      currency: string;
    };
  } | null;
}

/**
 * Retrieves the current Supabase session without redirecting.
 */
export async function getCurrentSession() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    return null;
  }

  return session;
}

/**
 * Retrieves the authenticated user and their matching Prisma database profile.
 */
export async function getCurrentUser(): Promise<AuthenticatedUserContext | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user: supabaseUser },
    error,
  } = await supabase.auth.getUser();

  if (error || !supabaseUser || !supabaseUser.email) {
    return null;
  }

  // Find corresponding application user profile in PostgreSQL
  const profile = await prisma.user.findFirst({
    where: {
      OR: [
        { supabaseAuthId: supabaseUser.id },
        { email: supabaseUser.email.toLowerCase() },
      ],
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          currency: true,
        },
      },
    },
  });

  return {
    supabaseUser: {
      id: supabaseUser.id,
      email: supabaseUser.email,
    },
    profile,
  };
}

/**
 * Server-side route & action guard that requires an active authenticated session.
 * Redirects to /login if the user is not authenticated.
 */
export async function requireAuth(): Promise<AuthenticatedUserContext> {
  const authContext = await getCurrentUser();

  if (!authContext) {
    redirect("/login");
  }

  return authContext;
}

/**
 * Server-side guard requiring SUPER_ADMIN or SALES_MANAGER executive privileges.
 */
export async function requireAdmin(): Promise<AuthenticatedUserContext> {
  const authContext = await requireAuth();

  if (!authContext.profile || authContext.profile.role !== UserRole.SUPER_ADMIN) {
    // If not super admin, check if elevated executive
    if (authContext.profile?.role !== UserRole.SALES_MANAGER) {
      redirect("/dashboard");
    }
  }

  return authContext;
}

/**
 * Utility helper to check if a user has any of the allowed roles.
 */
export function hasRole(
  userRole: UserRole | undefined,
  allowedRoles: UserRole[]
): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}
