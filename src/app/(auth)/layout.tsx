import * as React from "react";
import { Cross } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left Branding Hero Panel (Desktop) */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-slate-900 text-white overflow-hidden">
        {/* Background Gradient & Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg">
            <Cross className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white">
              {APP_NAME}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Enterprise Wholesale ERP
            </p>
          </div>
        </div>

        {/* Center Pharmaceutical Value Proposition */}
        <div className="relative z-10 max-w-md space-y-4">
          <blockquote className="space-y-2">
            <p className="text-xl font-medium leading-relaxed text-slate-200">
              “Automating batch-level FEFO traceability, customer credit control, and real-time COGS profit intelligence for modern pharmaceutical distribution.”
            </p>
            <footer className="text-xs text-slate-400 font-mono">
              Designed for Wholesalers & Licensed Stockists
            </footer>
          </blockquote>
        </div>

        {/* Footer Meta */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400">
          <span>Production Release v1.0.0</span>
          <span>Regulatory Compliance (FEFO / DAR)</span>
        </div>
      </div>

      {/* Right Form Container */}
      <div className="flex flex-col justify-between p-6 sm:p-12 relative">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>

        <div className="mx-auto w-full max-w-md my-auto">
          {children}
        </div>

        <div className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {APP_NAME}. Secure B2B Pharmaceutical System.
        </div>
      </div>
    </div>
  );
}
