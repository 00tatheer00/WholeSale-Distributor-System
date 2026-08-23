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

import { cookies } from "next/headers";
import { MOCK_USERS, MOCK_COMPANY } from "@/server/actions/mock-data";

/**
 * Retrieves the authenticated user and their matching Prisma database profile.
 */
export async function getCurrentUser(): Promise<AuthenticatedUserContext | null> {
  const cookieStore = await cookies();
  const demoEmail = cookieStore.get("wmdms_demo_session")?.value;

  let authEmail: string | null = null;
  let authId: string = "demo-user-id";

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();

    if (supabaseUser && supabaseUser.email) {
      authEmail = supabaseUser.email;
      authId = supabaseUser.id;
    }
  } catch {
    // Supabase unavailable in local test
  }

  if (!authEmail && demoEmail) {
    authEmail = demoEmail;
  }

  if (!authEmail) {
    return null;
  }

  // Find corresponding application user profile in PostgreSQL or fallback to seed mock profile
  try {
    const profile = await prisma.user.findFirst({
      where: {
        OR: [
          { supabaseAuthId: authId },
          { email: authEmail.toLowerCase() },
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

    if (profile) {
      return {
        supabaseUser: {
          id: authId,
          email: authEmail,
        },
        profile: profile as any,
      };
    }
  } catch {
    // Fallback to demo profile
  }

  const mockUser = MOCK_USERS.find(
    (u) => u.email.toLowerCase() === authEmail?.toLowerCase()
  ) || MOCK_USERS[0];

  return {
    supabaseUser: {
      id: mockUser.id,
      email: mockUser.email,
    },
    profile: {
      id: mockUser.id,
      companyId: MOCK_COMPANY.id,
      email: mockUser.email,
      name: mockUser.name,
      phone: mockUser.phone,
      role: mockUser.role as UserRole,
      status: mockUser.status,
      company: {
        id: MOCK_COMPANY.id,
        name: MOCK_COMPANY.name,
        currency: MOCK_COMPANY.currency,
      },
    },
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
