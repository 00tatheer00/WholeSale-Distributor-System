"use client";

import * as React from "react";
import {
  Info,
  LayoutDashboard,
  Pill,
  ReceiptText,
  Truck,
  ShoppingCart,
  ShieldCheck,
  Building2,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function InfoGuideModal() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 gap-1.5 rounded-full border-blue-200 dark:border-blue-800/60 bg-blue-50/60 dark:bg-blue-950/40 text-[#0071E3] hover:bg-blue-100/80 hover:text-blue-700 transition-all text-xs font-semibold shadow-sm"
          title="System Help & Guide (Roman Urdu)"
        >
          <Info className="h-4 w-4 stroke-[2.5]" />
          <span className="hidden sm:inline">System Guide</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-[24px] border border-border bg-white dark:bg-[#1C1C1E] p-6 shadow-2xl">
        <DialogHeader className="space-y-2 pb-3 border-b border-border/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-blue-500/10 text-[#0071E3]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Wholesale ERP Asaan Rehnumai Guide
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Software ke tamam main features ko asani se samjhne ke liye Roman Urdu guide
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-sm text-foreground">
          {/* Module 1: Dashboard */}
          <div className="p-3.5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/50 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sky-950 dark:text-sky-100">
                <LayoutDashboard className="h-4 w-4 text-[#0071E3]" />
                1. Dashboard (Rozana Ka Jaiza)
              </div>
              <Badge className="bg-sky-600/15 text-sky-700 dark:text-sky-300 border-none text-[10px]">Markazi Screen</Badge>
            </div>
            <p className="text-xs text-sky-900/80 dark:text-sky-200/80 leading-relaxed">
              Yahan aapko rozana ki <strong>Sales</strong>, <strong>Purchases</strong>, <strong>Munafa (Profit)</strong>, aur <strong>Warehouse Stock Value</strong> 1 glance mein milti hai. Sath hi Low Stock aur Expire hone wali dawaiyon ke alerts bhi samne show hotay hain.
            </p>
          </div>

          {/* Module 2: Medicines & Stock */}
          <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-purple-950 dark:text-purple-100">
                <Pill className="h-4 w-4 text-purple-600" />
                2. Medicines & Batches (Dawaiyon Ka Stock)
              </div>
              <Badge className="bg-purple-600/15 text-purple-700 dark:text-purple-300 border-none text-[10px]">Catalog & FEFO</Badge>
            </div>
            <p className="text-xs text-purple-900/80 dark:text-purple-200/80 leading-relaxed">
              Har medicine ki <strong>Trade Price (TP)</strong>, <strong>MRP</strong>, <strong>Batch Number</strong> aur <strong>Expiry Date</strong> yahan save hoti hai. System automatically FEFO (jo dawai pehle expire hogi wo pehle sale hogi) apply karta hai.
            </p>
          </div>

          {/* Module 3: Purchases & Intake */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-emerald-950 dark:text-emerald-100">
                <ReceiptText className="h-4 w-4 text-emerald-600" />
                3. Purchases & GRN (Company Se Stock Kharidna)
              </div>
              <Badge className="bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border-none text-[10px]">Inward Stock</Badge>
            </div>
            <p className="text-xs text-emerald-900/80 dark:text-emerald-200/80 leading-relaxed">
              Jab manufacturer company (e.g. Square, Beximco) se factory invoice ya stock aaye, toh yahan <strong>Direct Purchase Intake</strong> mein entry karein. Stock foran warehouse mein add ho jayega.
            </p>
          </div>

          {/* Module 4: Suppliers & AP */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-amber-950 dark:text-amber-100">
                <Truck className="h-4 w-4 text-amber-600" />
                4. Suppliers (Vendor & Payment Ledger)
              </div>
              <Badge className="bg-amber-600/15 text-amber-700 dark:text-amber-300 border-none text-[10px]">Payables</Badge>
            </div>
            <p className="text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
              Kis dawai banane wali company ke kitne paise baqi hain aur kitne de chuke hain, unka poora khata (Accounts Payable) aur payment vouchers yahan check karein.
            </p>
          </div>

          {/* Module 5: Sales & Invoices */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-blue-950 dark:text-blue-100">
                <ShoppingCart className="h-4 w-4 text-[#0071E3]" />
                5. Sales & Invoicing (Wholesale Bill & Dispatch)
              </div>
              <Badge className="bg-blue-600/15 text-blue-700 dark:text-blue-300 border-none text-[10px]">Outward Billing</Badge>
            </div>
            <p className="text-xs text-blue-900/80 dark:text-blue-200/80 leading-relaxed">
              Customer pharmacy ya hospital ko wholesale order book karein. System automatically available batches select karke invoice print aur delivery challan ready kar deta hai.
            </p>
          </div>

          {/* Golden Rule: Strict Wholesale Safeguard */}
          <div className="p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 flex items-start gap-2.5">
            <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Zaroori Note:</strong> Yeh system sirf <strong>Wholesale Medicine Distribution</strong> ke liye hai (koi retail walk-in counter nahi). Har transaction mein batch tracking aur trade price lazmi hoti hai.
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            onClick={() => setIsOpen(false)}
            className="rounded-full px-6 bg-[#0071E3] hover:bg-blue-600 text-white text-xs font-semibold"
          >
            Samajh Aa Gaya
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
