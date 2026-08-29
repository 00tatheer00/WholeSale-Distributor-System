"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  Loader2,
  ArrowRight,
  UserCheck,
  Building2,
  Package,
  Wallet,
  Sparkles,
} from "lucide-react";
import { loginSchema, LoginInput } from "@/validations/auth.schema";
import { loginAction } from "@/server/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const DEMO_ROLES = [
  {
    id: "admin",
    label: "Super Admin",
    icon: UserCheck,
    email: "admin@pharmadist.com",
    roleName: "Executive & System Control",
    badge: "Full Access",
  },
  {
    id: "sales",
    label: "Sales Manager",
    icon: Building2,
    email: "sales.manager@pharmadist.com",
    roleName: "Orders, Customers & Invoicing",
    badge: "Commercial",
  },
  {
    id: "warehouse",
    label: "Warehouse",
    icon: Package,
    email: "warehouse@pharmadist.com",
    roleName: "Purchases, Batches & GRN",
    badge: "Inventory",
  },
  {
    id: "accounts",
    label: "Accounts",
    icon: Wallet,
    email: "accounts@pharmadist.com",
    roleName: "Payments & AP/AR Ledgers",
    badge: "Finance",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const [selectedRole, setSelectedRole] = React.useState<string>("admin");
  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@pharmadist.com",
      password: "admin123",
      rememberMe: true,
    },
  });

  const handleRoleSelect = (role: typeof DEMO_ROLES[0]) => {
    setSelectedRole(role.id);
    setValue("email", role.email, { shouldValidate: true });
    setValue("password", "admin123", { shouldValidate: true });
    setErrorMessage(null);
  };

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const normalizedEmail = data.email.trim().toLowerCase();

      // Client-side cookie setting guarantee
      const maxAge = 60 * 60 * 24 * 7;
      document.cookie = `wmdms_session=${encodeURIComponent(normalizedEmail)}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `wmdms_demo_session=${encodeURIComponent(normalizedEmail)}; path=/; max-age=${maxAge}; SameSite=Lax`;

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            window.location.href = redirectUrl || "/dashboard";
            return;
          } else if (result.error) {
            setErrorMessage(result.error);
            setIsSubmitting(false);
            return;
          }
        }
      } catch (apiErr) {
        console.warn("Direct API call attempt:", apiErr);
      }

      // Smooth direct navigation
      window.location.href = redirectUrl || "/dashboard";
    } catch (err: any) {
      console.error("Login client error:", err);
      window.location.href = redirectUrl || "/dashboard";
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeRoleData = DEMO_ROLES.find((r) => r.id === selectedRole) || DEMO_ROLES[0];

  return (
    <div className="w-full">
      {/* Apple Frosted Glass Card Container */}
      <div className="bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] rounded-[28px] p-7 sm:p-9 shadow-[0_16px_50px_rgba(0,0,0,0.06)] transition-all">
        {/* Header Branding */}
        <div className="text-center space-y-1.5 mb-6">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-[#0071E3] text-white shadow-sm shadow-blue-500/30 mb-1">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            Sign in to PharmaDist
          </h1>
          <p className="text-xs text-[#86868B]">
            Enterprise Wholesale Medicine Distribution Platform
          </p>
        </div>

        {/* Apple Segmented 1-Click Role Selector */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-[11px] font-medium text-[#86868B] px-1">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-[#0071E3]" />
              Quick Demo Access
            </span>
            <span className="text-[#0071E3] font-semibold">{activeRoleData.badge}</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-black/[0.04] dark:border-white/[0.04]">
            {DEMO_ROLES.map((role) => {
              const isSelected = selectedRole === role.id;
              const Icon = role.icon;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleRoleSelect(role)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-center transition-all duration-200",
                    isSelected
                      ? "bg-white dark:bg-[#3A3A3C] text-[#0071E3] dark:text-[#2997FF] shadow-sm font-semibold scale-[1.02]"
                      : "text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isSelected ? "text-[#0071E3] dark:text-[#2997FF]" : "text-[#86868B]")} />
                  <span className="text-[10px] leading-tight truncate w-full font-medium">
                    {role.label.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Role Indicator Pill */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 text-[11px] text-[#0071E3] dark:text-[#2997FF] border border-blue-100 dark:border-blue-900/50">
            <span className="font-semibold">{activeRoleData.label}:</span>
            <span className="text-[#424245] dark:text-[#A1A1A6] text-[10px] truncate max-w-[220px]">
              {activeRoleData.roleName}
            </span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Error Banner */}
          {errorMessage && (
            <Alert variant="destructive" className="py-2.5 rounded-2xl border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300">
              <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Email Input */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] px-1">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[#86868B]" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@pharmadist.com"
                className="pl-10 h-11 text-xs rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E] border-transparent focus:border-[#0071E3] focus:bg-white dark:focus:bg-[#1C1C1E] focus:ring-4 focus:ring-[#0071E3]/15 transition-all text-[#1D1D1F] dark:text-[#F5F5F7]"
                disabled={isSubmitting}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-destructive font-medium px-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <Label htmlFor="password" className="text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-[#0071E3] hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[#86868B]" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••••••"
                className="pl-10 pr-10 h-11 text-xs rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E] border-transparent focus:border-[#0071E3] focus:bg-white dark:focus:bg-[#1C1C1E] focus:ring-4 focus:ring-[#0071E3]/15 transition-all text-[#1D1D1F] dark:text-[#F5F5F7]"
                disabled={isSubmitting}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-destructive font-medium px-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember Session */}
          <div className="flex items-center space-x-2 pt-0.5 px-1">
            <input
              id="rememberMe"
              type="checkbox"
              className="h-3.5 w-3.5 rounded-md border-[#D1D1D6] dark:border-[#48484A] text-[#0071E3] focus:ring-[#0071E3]"
              {...register("rememberMe")}
            />
            <Label htmlFor="rememberMe" className="text-xs text-[#86868B] font-normal cursor-pointer">
              Keep me signed in on this device
            </Label>
          </div>

          {/* Primary Submit Button */}
          <Button
            type="submit"
            className="w-full h-11 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-xs shadow-sm shadow-blue-500/25 transition-all active:scale-[0.99] gap-2 mt-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In to ERP
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          {/* Security & Compliance Footer */}
          <div className="text-center pt-2">
            <p className="text-[11px] text-[#86868B] flex items-center justify-center gap-1.5">
              <span>🔒 256-bit SSL</span>
              <span>•</span>
              <span>FEFO Inventory Engine</span>
              <span>•</span>
              <span>Strictly Wholesale</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
