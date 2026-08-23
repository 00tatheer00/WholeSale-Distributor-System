"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  FileText,
  Percent,
  Boxes,
  CreditCard,
  Bell,
  Users2,
  Save,
  CheckCircle2,
  Shield,
  Upload,
  AlertTriangle,
  Lock,
  Eye,
  ExternalLink,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateCompanySettingsAction } from "@/server/actions/settings.actions";
import { CompanySettingsInput } from "@/validations/settings.schema";
import { formatCurrency, formatDate } from "@/lib/utils";

interface SettingsClientProps {
  initialCompany: any;
  users: any[];
  auditLogs: any[];
}

export function SettingsClient({
  initialCompany,
  users,
  auditLogs,
}: SettingsClientProps) {
  const [activeTab, setActiveTab] = React.useState<
    "business" | "invoice" | "tax" | "inventory" | "credit" | "notifications" | "users"
  >("business");

  const [settings, setSettings] = React.useState<CompanySettingsInput>({
    name: initialCompany.name || "Apex Pharma Dist Ltd.",
    tradeLicenseNo: initialCompany.tradeLicenseNo || "TR-DHK-2026-8891",
    drugLicenseNo: initialCompany.drugLicenseNo || "DGDA-DL-9842-W",
    taxIdTin: initialCompany.taxIdTin || "TIN-89342019-2026",
    email: initialCompany.email || "accounts@apexpharma.com.bd",
    phone: initialCompany.phone || "+880 1711-223344",
    address: initialCompany.address || "Plot 14, Tejgaon Commercial Area",
    city: initialCompany.city || "Dhaka",
    country: initialCompany.country || "Bangladesh",
    currency: initialCompany.currency || "BDT",
    logoUrl: initialCompany.logoUrl || null,
    invoiceFooterText: initialCompany.invoiceFooterText || "Goods once sold cannot be returned without original cash memo & DGDA compliance verification.",
    
    // Invoice settings
    invoicePrefix: initialCompany.invoicePrefix || "INV-",
    showTaxOnInvoice: initialCompany.showTaxOnInvoice ?? true,
    showDiscountOnInvoice: initialCompany.showDiscountOnInvoice ?? true,
    showBatchOnInvoice: initialCompany.showBatchOnInvoice ?? true,
    showExpiryOnInvoice: initialCompany.showExpiryOnInvoice ?? true,

    // Tax & Discount
    defaultVatPercent: initialCompany.defaultVatPercent || 0,
    enableGlobalDiscount: initialCompany.enableGlobalDiscount ?? true,
    maxDiscountPercent: initialCompany.maxDiscountPercent || 20,

    // Inventory & FEFO
    enableFefoStrict: initialCompany.enableFefoStrict ?? true,
    allowExpiredSales: initialCompany.allowExpiredSales ?? false,
    lowStockThreshold: initialCompany.lowStockThreshold || 20,
    nearExpiryDays: initialCompany.nearExpiryDays || 90,

    // Credit
    enforceCreditLimit: initialCompany.enforceCreditLimit ?? true,
    defaultCreditDays: initialCompany.defaultCreditDays || 30,
    creditWarningThresholdPercent: initialCompany.creditWarningThresholdPercent || 80,
    requireApprovalOnCreditExceed: initialCompany.requireApprovalOnCreditExceed ?? true,

    // Notifications
    notifyLowStock: initialCompany.notifyLowStock ?? true,
    notifyNearExpiry: initialCompany.notifyNearExpiry ?? true,
    notifyExpiredStock: initialCompany.notifyExpiredStock ?? true,
    notifyCreditBreach: initialCompany.notifyCreditBreach ?? true,
    notifySupplierDues: initialCompany.notifySupplierDues ?? true,
  });

  const [isSaving, setIsSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    const res = await updateCompanySettingsAction(settings);
    setIsSaving(false);

    if (res.success) {
      setFeedback(res.message || "Settings updated successfully.");
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const navItems = [
    { id: "business", label: "Business Profile", icon: Building2 },
    { id: "invoice", label: "Invoice & Print", icon: FileText },
    { id: "tax", label: "Tax & Discount", icon: Percent },
    { id: "inventory", label: "Inventory & FEFO", icon: Boxes },
    { id: "credit", label: "Credit & Aging", icon: CreditCard },
    { id: "notifications", label: "Alerts & Notifications", icon: Bell },
    { id: "users", label: "Team & Security", icon: Users2 },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-20">
      {/* 1. Header */}
      <PageHeader
        title="System Administration & Enterprise Settings"
        description="Configure pharmaceutical distributor parameters, DGDA licensing, FEFO stock rules, customer credit barriers, and security policies."
      >
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl text-xs h-9 border-border/80"
          >
            <Link href="/audit-logs">
              <Shield className="h-4 w-4 mr-1.5 text-purple-600" />
              Security Audit Log Explorer
            </Link>
          </Button>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl text-xs h-9 px-4 shadow-sm"
          >
            <Save className="h-4 w-4 mr-1.5" />
            {isSaving ? "Saving Settings..." : "Save All Changes"}
          </Button>
        </div>
      </PageHeader>

      {feedback && (
        <div className="p-3.5 rounded-2xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          {feedback}
        </div>
      )}

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left: Settings Sidebar Navigation */}
        <div className="md:col-span-1 space-y-1">
          <div className="bg-card border border-border/80 rounded-2xl p-2 shadow-sm space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#0071E3] text-white shadow-sm font-bold"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="p-4 bg-muted/30 border border-border/60 rounded-2xl text-[11px] text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Security Guardrail</p>
            <p>All modifications are logged to the immutable audit trail with timestamp and admin actor ID.</p>
          </div>
        </div>

        {/* Right: Active Settings Panel */}
        <div className="md:col-span-3">
          <form onSubmit={handleSave}>
            {/* Section 1: Business Profile */}
            {activeTab === "business" && (
              <Card className="border border-border/80 rounded-2xl shadow-sm">
                <CardHeader className="border-b bg-muted/20 pb-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#0071E3]" />
                    Distributor Enterprise Profile & Licensing
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Legal company details that appear on all DGDA wholesale tax invoices, delivery challans, and money receipts.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Distributor / Business Name</Label>
                      <Input
                        value={settings.name}
                        onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                        className="rounded-xl text-xs h-9 bg-muted/30"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">DGDA Drug License #</Label>
                      <Input
                        value={settings.drugLicenseNo || ""}
                        onChange={(e) => setSettings({ ...settings, drugLicenseNo: e.target.value })}
                        className="rounded-xl text-xs h-9 font-mono bg-muted/30"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">City Corporation Trade License #</Label>
                      <Input
                        value={settings.tradeLicenseNo || ""}
                        onChange={(e) => setSettings({ ...settings, tradeLicenseNo: e.target.value })}
                        className="rounded-xl text-xs h-9 font-mono bg-muted/30"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Tax ID / TIN Number</Label>
                      <Input
                        value={settings.taxIdTin || ""}
                        onChange={(e) => setSettings({ ...settings, taxIdTin: e.target.value })}
                        className="rounded-xl text-xs h-9 font-mono bg-muted/30"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Official Contact Phone</Label>
                      <Input
                        value={settings.phone || ""}
                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                        className="rounded-xl text-xs h-9 bg-muted/30"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Billing & Accounts Email</Label>
                      <Input
                        type="email"
                        value={settings.email || ""}
                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                        className="rounded-xl text-xs h-9 bg-muted/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Warehouse / Physical Address</Label>
                    <Input
                      value={settings.address || ""}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      className="rounded-xl text-xs h-9 bg-muted/30"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">City</Label>
                      <Input
                        value={settings.city || ""}
                        onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                        className="rounded-xl text-xs h-9 bg-muted/30"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Country</Label>
                      <Input
                        value={settings.country}
                        onChange={(e) => setSettings({ ...settings, country: e.target.value })}
                        className="rounded-xl text-xs h-9 bg-muted/30"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Currency Code</Label>
                      <Input
                        value={settings.currency}
                        onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                        className="rounded-xl text-xs h-9 font-mono bg-muted/30"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Section 2: Invoice & Print Configuration */}
            {activeTab === "invoice" && (
              <Card className="border border-border/80 rounded-2xl shadow-sm">
                <CardHeader className="border-b bg-muted/20 pb-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#0071E3]" />
                    Wholesale Tax Invoice & Print Formatting
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Configure document prefixing, batch transparency, and terms printed on physical invoices.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Invoice Number Prefix</Label>
                      <Input
                        value={settings.invoicePrefix}
                        onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                        className="rounded-xl text-xs h-9 font-mono bg-muted/30"
                      />
                      <p className="text-[11px] text-muted-foreground">e.g. INV-YYYY-XXXXX</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <Label className="text-xs font-bold text-foreground">Print Line Visibility</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border/70 bg-muted/20 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.showBatchOnInvoice}
                          onChange={(e) => setSettings({ ...settings, showBatchOnInvoice: e.target.checked })}
                          className="rounded text-[#0071E3]"
                        />
                        <span className="text-xs font-medium">Show Batch Numbers</span>
                      </label>

                      <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border/70 bg-muted/20 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.showExpiryOnInvoice}
                          onChange={(e) => setSettings({ ...settings, showExpiryOnInvoice: e.target.checked })}
                          className="rounded text-[#0071E3]"
                        />
                        <span className="text-xs font-medium">Show Batch Expiry Dates</span>
                      </label>

                      <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border/70 bg-muted/20 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.showTaxOnInvoice}
                          onChange={(e) => setSettings({ ...settings, showTaxOnInvoice: e.target.checked })}
                          className="rounded text-[#0071E3]"
                        />
                        <span className="text-xs font-medium">Show DGDA VAT Breakdown</span>
                      </label>

                      <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border/70 bg-muted/20 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.showDiscountOnInvoice}
                          onChange={(e) => setSettings({ ...settings, showDiscountOnInvoice: e.target.checked })}
                          className="rounded text-[#0071E3]"
                        />
                        <span className="text-xs font-medium">Show Trade Discounts</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <Label className="text-xs font-semibold">Invoice Terms & Legal Footer</Label>
                    <Textarea
                      rows={3}
                      value={settings.invoiceFooterText || ""}
                      onChange={(e) => setSettings({ ...settings, invoiceFooterText: e.target.value })}
                      className="rounded-xl text-xs bg-muted/30"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Section 3: Tax & Discount */}
            {activeTab === "tax" && (
              <Card className="border border-border/80 rounded-2xl shadow-sm">
                <CardHeader className="border-b bg-muted/20 pb-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Percent className="h-4 w-4 text-emerald-600" />
                    Tax (VAT) & Trade Discount Controls
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Configure default VAT rates and cashier maximum allowable trade discounts.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Default VAT Rate (%)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step="0.01"
                        value={settings.defaultVatPercent}
                        onChange={(e) => setSettings({ ...settings, defaultVatPercent: parseFloat(e.target.value) || 0 })}
                        className="rounded-xl text-xs h-9 bg-muted/30"
                      />
                      <p className="text-[11px] text-muted-foreground">Historical invoices maintain their transaction-time VAT.</p>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Max Allowable Discount (%)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={settings.maxDiscountPercent}
                        onChange={(e) => setSettings({ ...settings, maxDiscountPercent: parseFloat(e.target.value) || 0 })}
                        className="rounded-xl text-xs h-9 bg-muted/30"
                      />
                      <p className="text-[11px] text-muted-foreground">Discounts above this threshold require manager approval.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Section 4: Inventory & FEFO */}
            {activeTab === "inventory" && (
              <Card className="border border-border/80 rounded-2xl shadow-sm">
                <CardHeader className="border-b bg-muted/20 pb-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Boxes className="h-4 w-4 text-indigo-600" />
                    FEFO Allocation & Inventory Protection
                  </CardTitle>
                  <CardDescription className="text-xs">
                    First-Expire, First-Out rules and safety blocks preventing dispatch of expired stock.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-100 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-rose-700 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-rose-900">DGDA Expired Medicine Block</p>
                      <p className="text-[11px] text-rose-700 leading-relaxed">
                        Under national pharmaceutical regulations, batches with expiry date &lt; today are strictly prohibited from sales booking and automated FEFO queues.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Default Low Stock Reorder Threshold (Units)</Label>
                      <Input
                        type="number"
                        min={1}
                        value={settings.lowStockThreshold}
                        onChange={(e) => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value, 10) || 10 })}
                        className="rounded-xl text-xs h-9 bg-muted/30"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Near-Expiry Warning Window (Days)</Label>
                      <Input
                        type="number"
                        min={1}
                        value={settings.nearExpiryDays}
                        onChange={(e) => setSettings({ ...settings, nearExpiryDays: parseInt(e.target.value, 10) || 90 })}
                        className="rounded-xl text-xs h-9 bg-muted/30"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Section 5: Credit & Aging */}
            {activeTab === "credit" && (
              <Card className="border border-border/80 rounded-2xl shadow-sm">
                <CardHeader className="border-b bg-muted/20 pb-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-purple-600" />
                    Customer Credit Limit & Receivable Barriers
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Control credit exposure, maximum payment terms, and automatic sales order hold policies.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Default Customer Credit Terms (Days)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={settings.defaultCreditDays}
                        onChange={(e) => setSettings({ ...settings, defaultCreditDays: parseInt(e.target.value, 10) || 30 })}
                        className="rounded-xl text-xs h-9 bg-muted/30"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Credit Warning Threshold (%)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={settings.creditWarningThresholdPercent}
                        onChange={(e) => setSettings({ ...settings, creditWarningThresholdPercent: parseFloat(e.target.value) || 80 })}
                        className="rounded-xl text-xs h-9 bg-muted/30"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2.5 p-3.5 rounded-xl border border-border/70 bg-muted/20 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.enforceCreditLimit}
                        onChange={(e) => setSettings({ ...settings, enforceCreditLimit: e.target.checked })}
                        className="rounded text-[#0071E3]"
                      />
                      <div>
                        <span className="text-xs font-bold block">Enforce Strict Credit Limit Hold</span>
                        <span className="text-[11px] text-muted-foreground">
                          Automatically hold wholesale order booking when pharmacy current due exceeds authorized credit limit.
                        </span>
                      </div>
                    </label>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Section 6: Notification Toggles */}
            {activeTab === "notifications" && (
              <Card className="border border-border/80 rounded-2xl shadow-sm">
                <CardHeader className="border-b bg-muted/20 pb-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Bell className="h-4 w-4 text-sky-600" />
                    Internal Watchdog & Notification Preferences
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Toggle real-time alerts generated in the top header and system watchdog center.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border/70 bg-muted/20 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifyLowStock}
                      onChange={(e) => setSettings({ ...settings, notifyLowStock: e.target.checked })}
                      className="rounded text-[#0071E3]"
                    />
                    <div className="text-xs">
                      <span className="font-bold block">Low Stock & Reorder Alerts</span>
                      <span className="text-muted-foreground text-[11px]">Notify when inventory on hand falls below minimum threshold.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border/70 bg-muted/20 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifyNearExpiry}
                      onChange={(e) => setSettings({ ...settings, notifyNearExpiry: e.target.checked })}
                      className="rounded text-[#0071E3]"
                    />
                    <div className="text-xs">
                      <span className="font-bold block">Near-Expiry Warning Alerts</span>
                      <span className="text-muted-foreground text-[11px]">Notify when medicine batches enter the warning window.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border/70 bg-muted/20 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifyCreditBreach}
                      onChange={(e) => setSettings({ ...settings, notifyCreditBreach: e.target.checked })}
                      className="rounded text-[#0071E3]"
                    />
                    <div className="text-xs">
                      <span className="font-bold block">Customer Credit Limit Breach Alerts</span>
                      <span className="text-muted-foreground text-[11px]">Notify when a customer exceeds their sanctioned credit limit.</span>
                    </div>
                  </label>
                </CardContent>
              </Card>
            )}

            {/* Section 7: Users & Security */}
            {activeTab === "users" && (
              <Card className="border border-border/80 rounded-2xl shadow-sm">
                <CardHeader className="border-b bg-muted/20 pb-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Users2 className="h-4 w-4 text-[#0071E3]" />
                    Authorized Staff Accounts & Role-Based Access Control
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Active team members and their designated ERP operational permissions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/40 border-b font-semibold text-muted-foreground uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Staff Name</th>
                          <th className="px-4 py-3">Email Address</th>
                          <th className="px-4 py-3">Phone</th>
                          <th className="px-4 py-3 text-center">Assigned Role</th>
                          <th className="px-4 py-3 text-center">Account Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3 font-semibold text-foreground">{u.name}</td>
                            <td className="px-4 py-3 text-muted-foreground font-mono">{u.email}</td>
                            <td className="px-4 py-3 text-muted-foreground font-mono">{u.phone}</td>
                            <td className="px-4 py-3 text-center">
                              <Badge variant="outline" className="text-[10px] font-mono">
                                {u.role}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                                {u.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
