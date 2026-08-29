import "server-only";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { cookies } from "next/headers";
import { MOCK_USERS, MOCK_COMPANY } from "@/server/actions/mock-data";

export interface AuthenticatedUserContext {
  authUser: {
    id: string;
    email: string;
  };
  supabaseUser?: {
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
 * Retrieves the current session cookie value.
 */
export async function getCurrentSession() {
  const cookieStore = await cookies();
  const sessionEmail =
    cookieStore.get("wmdms_session")?.value ||
    cookieStore.get("wmdms_demo_session")?.value;

  if (!sessionEmail) {
    return null;
  }

  return { email: sessionEmail };
}

/**
 * Retrieves the authenticated user and their matching Prisma database profile.
 * 100% Offline with local SQLite database lookup.
 */
export async function getCurrentUser(): Promise<AuthenticatedUserContext | null> {
  const cookieStore = await cookies();
  const sessionEmail =
    cookieStore.get("wmdms_session")?.value ||
    cookieStore.get("wmdms_demo_session")?.value;

  if (!sessionEmail) {
    return null;
  }

  const normalizedEmail = sessionEmail.trim().toLowerCase();

  // Find corresponding user profile in local SQLite database
  try {
    const profile = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
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
      const userContext: AuthenticatedUserContext = {
        authUser: {
          id: profile.id,
          email: profile.email,
        },
        supabaseUser: {
          id: profile.id,
          email: profile.email,
        },
        profile: profile as any,
      };
      return userContext;
    }
  } catch (err) {
    console.error("Local SQLite session lookup error:", err);
  }

  // Fallback to mock user profile if database is initialising
  const mockUser =
    MOCK_USERS.find((u) => u.email.toLowerCase() === normalizedEmail) ||
    MOCK_USERS[0];

  return {
    authUser: {
      id: mockUser.id,
      email: mockUser.email,
    },
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
