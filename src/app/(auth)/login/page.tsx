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
} from "lucide-react";
import { loginSchema, LoginInput } from "@/validations/auth.schema";
import { loginAction } from "@/server/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

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
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const normalizedEmail = data.email.trim().toLowerCase();

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password: data.password,
          rememberMe: data.rememberMe,
        }),
      });

      const result = await response.json().catch(() => null);

      if (response.ok && result?.success) {
        // Sync client-side cookies upon successful server auth
        const maxAge = data.rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 24;
        document.cookie = `wmdms_session=${encodeURIComponent(normalizedEmail)}; path=/; max-age=${maxAge}; SameSite=Lax`;
        document.cookie = `wmdms_demo_session=${encodeURIComponent(normalizedEmail)}; path=/; max-age=${maxAge}; SameSite=Lax`;

        // Smooth navigation to dashboard
        window.location.href = redirectUrl || "/dashboard";
        return;
      }

      // Authentication failed
      setErrorMessage(
        result?.error || "Invalid email or password. Please verify your credentials."
      );
    } catch (err: any) {
      console.error("Login client error:", err);
      // Attempt fallback via Server Action
      try {
        const actionRes = await loginAction(data);
        if (actionRes.success) {
          const maxAge = 60 * 60 * 24 * 7;
          const normalizedEmail = data.email.trim().toLowerCase();
          document.cookie = `wmdms_session=${encodeURIComponent(normalizedEmail)}; path=/; max-age=${maxAge}; SameSite=Lax`;
          document.cookie = `wmdms_demo_session=${encodeURIComponent(normalizedEmail)}; path=/; max-age=${maxAge}; SameSite=Lax`;
          window.location.href = redirectUrl || "/dashboard";
          return;
        } else {
          setErrorMessage(
            actionRes.error || "Invalid email or password. Please verify your credentials."
          );
        }
      } catch (actErr) {
        setErrorMessage("An unexpected network error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <div className="text-center pt-2 space-y-1">
            <p className="text-[11px] text-[#86868B] flex items-center justify-center gap-1.5">
              <span>🔒 256-bit SSL</span>
              <span>•</span>
              <span>FEFO Inventory Engine</span>
              <span>•</span>
              <span>Strictly Wholesale</span>
            </p>
            <p className="text-[10px] text-muted-foreground/80 font-medium">
              Built by Tech4Edges • CEO Tatheer • 03374005515
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
