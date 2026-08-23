"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, Eye, EyeOff, ShieldAlert, Loader2, ArrowRight } from "lucide-react";
import { loginSchema, LoginInput } from "@/validations/auth.schema";
import { loginAction } from "@/server/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const result = await loginAction(data);

      if (!result.success) {
        setErrorMessage(result.error || "Invalid email or password.");
        return;
      }

      // Success: Navigate to requested redirect route or dashboard
      router.push(redirectUrl);
      router.refresh();
    } catch {
      setErrorMessage("An unexpected network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border border-border/80 shadow-lg bg-card">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold tracking-tight">
            Distributor Sign In
          </CardTitle>
          <span className="flex h-2 w-2 rounded-full bg-emerald-500" title="System Operational" />
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Enter your authorized credentials to access the wholesale ERP platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Error Alert Banner */}
          {errorMessage && (
            <Alert variant="destructive" className="py-2.5">
              <ShieldAlert className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Email Address Field */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@pharmadist.com"
                className="pl-9 text-xs"
                disabled={isSubmitting}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field with Show/Hide Toggle */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-medium">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••••••"
                className="pl-9 pr-9 text-xs"
                disabled={isSubmitting}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember Session Checkbox */}
          <div className="flex items-center space-x-2 pt-1">
            <input
              id="rememberMe"
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-muted text-primary focus:ring-primary"
              {...register("rememberMe")}
            />
            <Label htmlFor="rememberMe" className="text-xs text-muted-foreground font-normal cursor-pointer">
              Remember my session on this device
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full gap-2 text-xs font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                Sign In to ERP
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>

          {/* Quick Demo Fill Section */}
          <div className="pt-2 border-t border-border/60">
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              ⚡ Quick Demo Credentials (Click to fill)
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-auto py-1.5 px-2 flex flex-col items-start text-left text-[11px]"
                onClick={() => {
                  setValue("email", "admin@pharmadist.com");
                  setValue("password", "admin123");
                }}
              >
                <span className="font-semibold text-foreground">Super Admin</span>
                <span className="text-[10px] text-muted-foreground truncate w-full">admin@pharmadist.com</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-auto py-1.5 px-2 flex flex-col items-start text-left text-[11px]"
                onClick={() => {
                  setValue("email", "sales.manager@pharmadist.com");
                  setValue("password", "admin123");
                }}
              >
                <span className="font-semibold text-foreground">Sales Manager</span>
                <span className="text-[10px] text-muted-foreground truncate w-full">sales.manager@pharmadist.com</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-auto py-1.5 px-2 flex flex-col items-start text-left text-[11px]"
                onClick={() => {
                  setValue("email", "warehouse@pharmadist.com");
                  setValue("password", "admin123");
                }}
              >
                <span className="font-semibold text-foreground">Warehouse Mgr</span>
                <span className="text-[10px] text-muted-foreground truncate w-full">warehouse@pharmadist.com</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-auto py-1.5 px-2 flex flex-col items-start text-left text-[11px]"
                onClick={() => {
                  setValue("email", "accounts@pharmadist.com");
                  setValue("password", "admin123");
                }}
              >
                <span className="font-semibold text-foreground">Accounts Officer</span>
                <span className="text-[10px] text-muted-foreground truncate w-full">accounts@pharmadist.com</span>
              </Button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="rounded-md bg-muted/40 p-2.5 border border-border/60 text-[11px] text-muted-foreground flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-primary shrink-0" />
            <span>Authorized distributor personnel only. All access attempts are logged.</span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
