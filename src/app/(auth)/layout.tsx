import * as React from "react";
import Link from "next/link";
import { Cross, ShieldCheck, Sparkles } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative flex flex-col justify-between bg-[#FBFBFD] dark:bg-[#000000] text-foreground antialiased overflow-hidden">
      {/* Apple-style Soft Ambient Lighting Effects */}
      <div className="absolute top-[-10%] left-[20%] w-[550px] h-[550px] rounded-full bg-blue-400/10 dark:bg-blue-600/10 blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] rounded-full bg-emerald-400/10 dark:bg-emerald-600/10 blur-[140px] pointer-events-none -z-10" />

      {/* Top Navbar */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <Link
          href="/login"
          className="flex items-center gap-3 group transition-transform hover:scale-[1.02]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0071E3] text-white shadow-sm shadow-blue-500/25">
            <Cross className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
              {APP_NAME}
            </span>
            <span className="text-[10px] font-medium tracking-wider uppercase text-[#86868B]">
              Cloud ERP Platform
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-[11px] font-medium text-[#424245] dark:text-[#A1A1A6] border border-black/[0.04] dark:border-white/[0.06]">
            <span className="h-2 w-2 rounded-full bg-[#34C759] animate-pulse" />
            <span>v1.0 Production ERP</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-[460px]">
          {children}
        </div>
      </main>

      {/* Minimal Apple Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#86868B] z-10 border-t border-black/[0.04] dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#0071E3]" />
          <span>Licensed Wholesale Pharmaceutical Distribution Management System</span>
        </div>
        <div>
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
