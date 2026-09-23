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
  AlertTriangle,
  Lock,
  Eye,
  Plus,
  Edit2,
  KeyRound,
  UserX,
  UserCheck,
  MoreHorizontal,
  HardDrive,
  Download,
  RefreshCw,
  FileCheck2,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  updateCompanySettingsAction,
  createUserAction,
  updateUserAction,
  resetUserPasswordAction,
  toggleUserStatusAction,
  createDatabaseSnapshotAction,
  listDatabaseSnapshotsAction,
} from "@/server/actions/settings.actions";
import {
  CompanySettingsInput,
  CreateUserInput,
  UpdateUserInput,
} from "@/validations/settings.schema";
import { formatDate } from "@/lib/utils";

interface SettingsClientProps {
  initialCompany: any;
  users: any[];
  auditLogs: any[];
}

export function SettingsClient({
  initialCompany,
  users: initialUsers,
  auditLogs,
}: SettingsClientProps) {
  const [activeTab, setActiveTab] = React.useState<
    "business" | "invoice" | "tax" | "inventory" | "credit" | "notifications" | "users" | "backup"
  >("business");

  const [users, setUsers] = React.useState<any[]>(initialUsers);

  // Admin login credentials state (Super easy direct access for client)
  const adminUser = users.find((u) => u.role === "SUPER_ADMIN" || u.role === "ADMIN") || users[0];
  const [adminCredentials, setAdminCredentials] = React.useState({
    email: adminUser?.email || "admin@pharmadist.com",
    password: "",
    confirmPassword: "",
  });
  const [isUpdatingAdminCreds, setIsUpdatingAdminCreds] = React.useState(false);
  const [adminCredsFeedback, setAdminCredsFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  const [settings, setSettings] = React.useState<CompanySettingsInput>({
    name: initialCompany.name || "PharmaDist Wholesale Medicine Distribution Ltd.",
    tradeLicenseNo: initialCompany.tradeLicenseNo || "TR-KHI-2026-8891",
    drugLicenseNo: initialCompany.drugLicenseNo || "DRAP-DL-9842-W",
    taxIdTin: initialCompany.taxIdTin || "NTN-89342019-2026",
    email: initialCompany.email || "info@pharmadist.pk",
    phone: initialCompany.phone || "+92 21 3589 1234",
    address: initialCompany.address || "Plot 45, Sector 15, Korangi Industrial Area",
    city: initialCompany.city || "Karachi",
    country: initialCompany.country || "Pakistan",
    currency: initialCompany.currency || "PKR",
    logoUrl: initialCompany.logoUrl || null,
    invoiceFooterText:
      initialCompany.invoiceFooterText ||
      "Goods once sold cannot be returned without original cash memo & DRAP compliance verification.",

    // Invoice settings
    invoicePrefix: initialCompany.invoicePrefix || "INV-",
    showTaxOnInvoice: initialCompany.showTaxOnInvoice ?? true,
    showDiscountOnInvoice: initialCompany.showDiscountOnInvoice ?? true,
    showBatchOnInvoice: initialCompany.showBatchOnInvoice ?? true,
    showExpiryOnInvoice: initialCompany.showExpiryOnInvoice ?? true,

    // Tax & Discount
    defaultVatPercent: initialCompany.defaultVatPercent ?? 0,
    enableGlobalDiscount: initialCompany.enableGlobalDiscount ?? true,
    maxDiscountPercent: initialCompany.maxDiscountPercent ?? 20,

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
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // User Management Dialog States
  const [isAddUserOpen, setIsAddUserOpen] = React.useState(false);
  const [newUser, setNewUser] = React.useState<CreateUserInput>({
    name: "",
    email: "",
    phone: "",
    role: "INVENTORY_OFFICER",
    password: "",
    status: "ACTIVE",
  });

  const [editingUser, setEditingUser] = React.useState<UpdateUserInput | null>(null);
  const [isEditUserOpen, setIsEditUserOpen] = React.useState(false);

  const [resetUser, setResetUser] = React.useState<{ id: string; name: string; password: string; confirmPassword: string } | null>(null);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = React.useState(false);

  const [deactivateUser, setDeactivateUser] = React.useState<{ id: string; name: string; status: string } | null>(null);
  const [isDeactivateOpen, setIsDeactivateOpen] = React.useState(false);

  const [isUserProcessing, setIsUserProcessing] = React.useState(false);

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setFeedback(null);
    setErrorMessage(null);

    const res = await updateCompanySettingsAction(settings);
    setIsSaving(false);

    if (res.success) {
      setFeedback(res.message || "Settings saved successfully.");
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setErrorMessage(res.error || "Failed to update settings.");
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  // User Action Handlers
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUserProcessing(true);
    const res = await createUserAction(newUser);
    setIsUserProcessing(false);

    if (res.success) {
      setIsAddUserOpen(false);
      setNewUser({
        name: "",
        email: "",
        phone: "",
        role: "INVENTORY_OFFICER",
        password: "",
        status: "ACTIVE",
      });
      setFeedback(res.message || "Staff member enrolled successfully.");
      setTimeout(() => setFeedback(null), 4000);
      window.location.reload();
    } else {
      alert(res.error || "Failed to create user account.");
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsUserProcessing(true);
    const res = await updateUserAction(editingUser);
    setIsUserProcessing(false);

    if (res.success) {
      setIsEditUserOpen(false);
      setEditingUser(null);
      setFeedback(res.message || "User updated successfully.");
      setTimeout(() => setFeedback(null), 4000);
      window.location.reload();
    } else {
      alert(res.error || "Failed to update user account.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUser) return;
    if (resetUser.password !== resetUser.confirmPassword) {
      alert("Passwords do not match. Please verify your new password and confirmation password.");
      return;
    }
    if (resetUser.password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }
    setIsUserProcessing(true);
    const res = await resetUserPasswordAction({
      userId: resetUser.id,
      newPassword: resetUser.password,
    });
    setIsUserProcessing(false);

    if (res.success) {
      setIsResetPasswordOpen(false);
      setResetUser(null);
      setFeedback(res.message || "Password reset successfully.");
      setTimeout(() => setFeedback(null), 4000);
    } else {
      alert(res.error || "Failed to reset password.");
    }
  };

  const handleUpdateAdminCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUser) return;

    if (adminCredentials.password) {
      if (adminCredentials.password.length < 6) {
        setAdminCredsFeedback({ type: "error", message: "Password must be at least 6 characters long." });
        return;
      }
      if (adminCredentials.password !== adminCredentials.confirmPassword) {
        setAdminCredsFeedback({ type: "error", message: "Passwords do not match. Please verify confirmation password." });
        return;
      }
    }

    setIsUpdatingAdminCreds(true);
    setAdminCredsFeedback(null);

    try {
      if (adminCredentials.email && adminCredentials.email !== adminUser.email) {
        const emailRes = await updateUserAction({
          id: adminUser.id,
          name: adminUser.name,
          email: adminCredentials.email,
          phone: adminUser.phone === "N/A" ? "" : (adminUser.phone || ""),
          role: adminUser.role,
          status: adminUser.status,
        });
        if (!emailRes.success) {
          setAdminCredsFeedback({ type: "error", message: emailRes.error || "Failed to update email address." });
          setIsUpdatingAdminCreds(false);
          return;
        }
      }

      if (adminCredentials.password) {
        const passRes = await resetUserPasswordAction({
          userId: adminUser.id,
          newPassword: adminCredentials.password,
        });
        if (!passRes.success) {
          setAdminCredsFeedback({ type: "error", message: passRes.error || "Failed to update password." });
          setIsUpdatingAdminCreds(false);
          return;
        }
      }

      setAdminCredsFeedback({
        type: "success",
        message: "Admin login credentials updated successfully! You can now use these details to login.",
      });
      setAdminCredentials((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      setTimeout(() => setAdminCredsFeedback(null), 6000);
    } catch (err: any) {
      setAdminCredsFeedback({ type: "error", message: err?.message || "An unexpected error occurred." });
    } finally {
      setIsUpdatingAdminCreds(false);
    }
  };

  const handleToggleUserStatus = async () => {
    if (!deactivateUser) return;
    setIsUserProcessing(true);
    const res = await toggleUserStatusAction(deactivateUser.id, deactivateUser.status);
    setIsUserProcessing(false);

    if (res.success) {
      setIsDeactivateOpen(false);
      setDeactivateUser(null);
      setFeedback(res.message || "Account status updated.");
      setTimeout(() => setFeedback(null), 4000);
      window.location.reload();
    } else {
      alert(res.error || "Failed to toggle account status.");
    }
  };

  const [snapshots, setSnapshots] = React.useState<Array<{ filename: string; sizeBytes: number; createdAt: string }>>([]);
  const [isSnapshotLoading, setIsSnapshotLoading] = React.useState(false);
  const [isCreatingSnapshot, setIsCreatingSnapshot] = React.useState(false);

  React.useEffect(() => {
    if (activeTab === "backup") {
      loadSnapshots();
    }
  }, [activeTab]);

  const loadSnapshots = async () => {
    setIsSnapshotLoading(true);
    const res = await listDatabaseSnapshotsAction();
    if (res.success && res.data) {
      setSnapshots(res.data);
    }
    setIsSnapshotLoading(false);
  };

  const handleCreateSnapshot = async () => {
    setIsCreatingSnapshot(true);
    const res = await createDatabaseSnapshotAction();
    if (res.success) {
      setFeedback(res.message || "Snapshot created successfully.");
      setTimeout(() => setFeedback(null), 4000);
      loadSnapshots();
    } else {
      setErrorMessage(res.error || "Failed to create snapshot.");
      setTimeout(() => setErrorMessage(null), 4000);
    }
    setIsCreatingSnapshot(false);
  };

  const navItems = [
    { id: "business", label: "Business Profile", icon: Building2, desc: "Company details & license" },
    { id: "invoice", label: "Invoice & Print", icon: FileText, desc: "Print headers, toggles & layout" },
    { id: "tax", label: "Tax & Discount", icon: Percent, desc: "VAT rates & discount caps" },
    { id: "inventory", label: "Inventory & FEFO", icon: Boxes, desc: "Expiry safety & reorders" },
    { id: "credit", label: "Credit & Aging", icon: CreditCard, desc: "Receivable hold barriers" },
    { id: "notifications", label: "Alerts & Notifications", icon: Bell, desc: "Watchdog triggers" },
    { id: "users", label: "Team & Security", icon: Users2, desc: "Staff access & roles" },
    { id: "backup", label: "Backup & Maintenance", icon: HardDrive, desc: "Database snapshot & restore" },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-20">
      {/* 1. Header */}
      <PageHeader
        title="System Settings & Administration"
        description="Configure pharmaceutical distributor business details, DRAP compliance rules, FEFO stock safety, customer credit barriers, and staff permissions."
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
              Forensic Audit Logs
            </Link>
          </Button>

          {activeTab !== "users" && activeTab !== "backup" && (
            <Button
              onClick={() => handleSaveSettings()}
              disabled={isSaving}
              className="bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl text-xs h-9 px-4 shadow-sm"
            >
              <Save className="h-4 w-4 mr-1.5" />
              {isSaving ? "Saving Settings..." : "Save Settings"}
            </Button>
          )}
        </div>
      </PageHeader>

      {feedback && (
        <div className="p-3.5 rounded-2xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          {feedback}
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-2xl text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-2 shadow-sm">
          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* 2. Main Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left: Navigation Tabs */}
        <div className="md:col-span-1 space-y-3">
          <div className="bg-card border border-border/80 rounded-2xl p-2 shadow-sm space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                    isActive
                      ? "bg-[#0071E3] text-white shadow-sm font-bold"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0" />
                    <div>
                      <span className="text-xs block">{item.label}</span>
                      <span
                        className={`text-[10px] block ${
                          isActive ? "text-white/80" : "text-muted-foreground"
                        }`}
                      >
                        {item.desc}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-4 bg-muted/30 border border-border/60 rounded-2xl text-[11px] text-muted-foreground space-y-1.5">
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-[#0071E3]" /> Audit Trail Active
            </p>
            <p>
              Every configuration change is atomically logged with timestamp, previous values, and
              administrator credentials.
            </p>
          </div>
        </div>

        {/* Right: Active Settings Card */}
        <div className="md:col-span-3">
          {/* Section 1: Business Profile & Admin Credentials */}
          {activeTab === "business" && (
            <div className="space-y-6">
              {/* TOP PRIORITY CARD: ADMIN LOGIN CREDENTIALS & PASSWORD */}
              <Card className="border-2 border-primary/40 bg-gradient-to-br from-primary/5 via-blue-500/5 to-card rounded-2xl shadow-sm">
                <CardHeader className="border-b bg-primary/10 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                      <div className="h-7 w-7 rounded-lg bg-primary text-white flex items-center justify-center shadow-sm">
                        <KeyRound className="h-4 w-4" />
                      </div>
                      Admin Login Email & Password (Apna Login & Password Badlein)
                    </CardTitle>
                    <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-bold uppercase">
                      Direct Access
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Easily change your system login email address and account password directly here anytime without technical hassle.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleUpdateAdminCredentials} className="space-y-4">
                    {adminCredsFeedback && (
                      <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                        adminCredsFeedback.type === "success" 
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-rose-50 text-rose-800 border-rose-200"
                      }`}>
                        {adminCredsFeedback.type === "success" ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />}
                        {adminCredsFeedback.message}
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Admin Login Email Address</Label>
                        <Input
                          type="email"
                          required
                          value={adminCredentials.email}
                          onChange={(e) => setAdminCredentials({ ...adminCredentials, email: e.target.value })}
                          className="rounded-xl text-xs h-9 bg-background font-medium"
                          placeholder="admin@pharmadist.com"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">New Password</Label>
                        <Input
                          type="password"
                          value={adminCredentials.password}
                          onChange={(e) => setAdminCredentials({ ...adminCredentials, password: e.target.value })}
                          className="rounded-xl text-xs h-9 bg-background font-mono"
                          placeholder="Min. 6 characters"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Confirm New Password</Label>
                        <Input
                          type="password"
                          value={adminCredentials.confirmPassword}
                          onChange={(e) => setAdminCredentials({ ...adminCredentials, confirmPassword: e.target.value })}
                          className="rounded-xl text-xs h-9 bg-background font-mono"
                          placeholder="Re-type password"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-border/60">
                      <p className="text-[11px] text-muted-foreground">
                        Leave password empty if you only want to change your email address.
                      </p>
                      <Button
                        type="submit"
                        disabled={isUpdatingAdminCreds}
                        className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-xs h-9 px-5 shadow-sm shrink-0"
                      >
                        {isUpdatingAdminCreds ? "Updating..." : "Save My Email & Password"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Business Profile */}
              <Card className="border border-border/80 rounded-2xl shadow-sm">
                <CardHeader className="border-b bg-muted/20 pb-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-[#0071E3]" />
                  Distributor Enterprise Profile & Licensing
                </CardTitle>
                <CardDescription className="text-xs">
                  Legal company details that appear on all DRAP wholesale tax invoices, delivery
                  challans, and customer money receipts.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Distributor / Company Name</Label>
                    <Input
                      value={settings.name}
                      onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                      className="rounded-xl text-xs h-9 bg-muted/30"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">DRAP Wholesale Drug License #</Label>
                    <Input
                      value={settings.drugLicenseNo || ""}
                      onChange={(e) => setSettings({ ...settings, drugLicenseNo: e.target.value })}
                      className="rounded-xl text-xs h-9 font-mono bg-muted/30"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Trade License / Incorporation #</Label>
                    <Input
                      value={settings.tradeLicenseNo || ""}
                      onChange={(e) => setSettings({ ...settings, tradeLicenseNo: e.target.value })}
                      className="rounded-xl text-xs h-9 font-mono bg-muted/30"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">National Tax Number (NTN / STRN)</Label>
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

                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs font-semibold">Warehouse / Physical Godown Address</Label>
                    <Input
                      value={settings.address || ""}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      className="rounded-xl text-xs h-9 bg-muted/30"
                    />
                  </div>

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
                      value={settings.country || "Pakistan"}
                      onChange={(e) => setSettings({ ...settings, country: e.target.value })}
                      className="rounded-xl text-xs h-9 bg-muted/30"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs font-semibold">Tax Invoice Legal Disclaimer Footer</Label>
                    <Textarea
                      rows={2}
                      value={settings.invoiceFooterText || ""}
                      onChange={(e) => setSettings({ ...settings, invoiceFooterText: e.target.value })}
                      className="rounded-xl text-xs bg-muted/30 resize-none"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Appears at the bottom of all printed wholesale tax invoices and delivery challans.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-end">
                  <Button
                    type="button"
                    onClick={() => handleSaveSettings()}
                    disabled={isSaving}
                    className="bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl text-xs h-9 px-4"
                  >
                    <Save className="h-4 w-4 mr-1.5" />
                    {isSaving ? "Saving..." : "Save Business Profile"}
                  </Button>
                </div>
              </CardContent>
            </Card>
            </div>
          )}

          {/* Section 2: Invoice & Print Settings */}
          {activeTab === "invoice" && (
            <Card className="border border-border/80 rounded-2xl shadow-sm">
              <CardHeader className="border-b bg-muted/20 pb-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#0071E3]" />
                  Tax Invoice & Delivery Challan Print Preferences
                </CardTitle>
                <CardDescription className="text-xs">
                  Customize invoice prefixes and choose which columns appear on printed wholesale documents.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1.5 max-w-sm">
                  <Label className="text-xs font-semibold">Invoice Serial Prefix</Label>
                  <Input
                    value={settings.invoicePrefix || "INV-"}
                    onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                    className="rounded-xl text-xs h-9 font-mono bg-muted/30"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Example format: INV-2026-00001
                  </p>
                </div>

                <div className="pt-2 space-y-3">
                  <Label className="text-xs font-semibold block">Printed Document Columns</Label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border/70 bg-muted/20 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showTaxOnInvoice}
                      onChange={(e) => setSettings({ ...settings, showTaxOnInvoice: e.target.checked })}
                      className="rounded text-[#0071E3]"
                    />
                    <div className="text-xs">
                      <span className="font-bold block">Show Tax / VAT Column on Invoice</span>
                      <span className="text-muted-foreground text-[11px]">
                        Displays line-level sales tax rates and amounts.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border/70 bg-muted/20 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showDiscountOnInvoice}
                      onChange={(e) =>
                        setSettings({ ...settings, showDiscountOnInvoice: e.target.checked })
                      }
                      className="rounded text-[#0071E3]"
                    />
                    <div className="text-xs">
                      <span className="font-bold block">Show Commercial Discount Column</span>
                      <span className="text-muted-foreground text-[11px]">
                        Displays percentage and monetary discounts per medicine item.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border/70 bg-muted/20 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showBatchOnInvoice}
                      onChange={(e) =>
                        setSettings({ ...settings, showBatchOnInvoice: e.target.checked })
                      }
                      className="rounded text-[#0071E3]"
                    />
                    <div className="text-xs">
                      <span className="font-bold block">Show Batch Numbers</span>
                      <span className="text-muted-foreground text-[11px]">
                        Mandatory for DRAP pharmaceutical traceability on both invoices and delivery challans.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border/70 bg-muted/20 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showExpiryOnInvoice}
                      onChange={(e) =>
                        setSettings({ ...settings, showExpiryOnInvoice: e.target.checked })
                      }
                      className="rounded text-[#0071E3]"
                    />
                    <div className="text-xs">
                      <span className="font-bold block">Show Batch Expiry Dates</span>
                      <span className="text-muted-foreground text-[11px]">
                        Prints batch MM/YY expiry dates beside each dispensed item.
                      </span>
                    </div>
                  </label>
                </div>

                <div className="pt-4 border-t flex justify-end">
                  <Button
                    type="button"
                    onClick={() => handleSaveSettings()}
                    disabled={isSaving}
                    className="bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl text-xs h-9 px-4"
                  >
                    <Save className="h-4 w-4 mr-1.5" />
                    {isSaving ? "Saving..." : "Save Invoice Settings"}
                  </Button>
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
                  Tax & Commercial Discount Policies
                </CardTitle>
                <CardDescription className="text-xs">
                  Configure default sales tax rates and safeguard against unauthorized discounting.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Default VAT / Sales Tax Rate (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step="0.01"
                      value={settings.defaultVatPercent}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          defaultVatPercent: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="rounded-xl text-xs h-9 bg-muted/30"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Applied automatically to newly booked wholesale order lines.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Maximum Allowable Order Discount (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={settings.maxDiscountPercent}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          maxDiscountPercent: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="rounded-xl text-xs h-9 bg-muted/30"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Discounts exceeding this limit require Sales Manager approval.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border/70 bg-muted/20 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableGlobalDiscount}
                      onChange={(e) =>
                        setSettings({ ...settings, enableGlobalDiscount: e.target.checked })
                      }
                      className="rounded text-[#0071E3]"
                    />
                    <div className="text-xs">
                      <span className="font-bold block">Enable Special Order-Level Discounts</span>
                      <span className="text-muted-foreground text-[11px]">
                        Allows booking staff to apply overall consignment discounts in addition to line-item discounts.
                      </span>
                    </div>
                  </label>
                </div>

                <div className="pt-4 border-t flex justify-end">
                  <Button
                    type="button"
                    onClick={() => handleSaveSettings()}
                    disabled={isSaving}
                    className="bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl text-xs h-9 px-4"
                  >
                    <Save className="h-4 w-4 mr-1.5" />
                    {isSaving ? "Saving..." : "Save Tax Policies"}
                  </Button>
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
                <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-100 flex items-start gap-3">
                  <Shield className="h-5 w-5 text-sky-700 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-sky-900">DRAP Strict FEFO Allocation Standard</p>
                    <p className="text-[11px] text-sky-700 leading-relaxed">
                      Pharmaceutical distribution regulations mandate dispatching stock with the earliest expiry dates first. The system prioritizes earliest batches automatically.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Low Stock Reorder Threshold (Units)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={settings.lowStockThreshold}
                      onChange={(e) =>
                        setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value, 10) || 10 })
                      }
                      className="rounded-xl text-xs h-9 bg-muted/30"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Triggers low stock reorder alerts when inventory drops below this number.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Near-Expiry Warning Window (Days)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={settings.nearExpiryDays}
                      onChange={(e) =>
                        setSettings({ ...settings, nearExpiryDays: parseInt(e.target.value, 10) || 90 })
                      }
                      className="rounded-xl text-xs h-9 bg-muted/30"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Flag batches expiring within this number of days as high risk.
                    </p>
                  </div>
                </div>

                <div className="pt-2 space-y-3">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border/70 bg-muted/20 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableFefoStrict}
                      onChange={(e) =>
                        setSettings({ ...settings, enableFefoStrict: e.target.checked })
                      }
                      className="rounded text-[#0071E3]"
                    />
                    <div className="text-xs">
                      <span className="font-bold block">Enforce Strict FEFO Allocation</span>
                      <span className="text-muted-foreground text-[11px]">
                        Automatically locks order booking to the earliest expiring active batches.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.allowExpiredSales}
                      onChange={(e) =>
                        setSettings({ ...settings, allowExpiredSales: e.target.checked })
                      }
                      className="rounded text-rose-600"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-rose-900 block flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                        Allow Sales of Expired Stock (Emergency Testing Only)
                      </span>
                      <span className="text-rose-700 text-[11px]">
                        STRICT SAFETY WARNING: Under DRAP regulations, selling expired medicines is illegal. Keep this unchecked for live wholesale operations.
                      </span>
                    </div>
                  </label>
                </div>

                <div className="pt-4 border-t flex justify-end">
                  <Button
                    type="button"
                    onClick={() => handleSaveSettings()}
                    disabled={isSaving}
                    className="bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl text-xs h-9 px-4"
                  >
                    <Save className="h-4 w-4 mr-1.5" />
                    {isSaving ? "Saving..." : "Save Inventory Policies"}
                  </Button>
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
                  Customer Credit Limit & Receivable Guardrails
                </CardTitle>
                <CardDescription className="text-xs">
                  Control credit exposure, maximum payment days, and automatic sales order hold policies.
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
                      onChange={(e) =>
                        setSettings({ ...settings, defaultCreditDays: parseInt(e.target.value, 10) || 30 })
                      }
                      className="rounded-xl text-xs h-9 bg-muted/30"
                    />
                    <p className="text-[11px] text-muted-foreground">Standard invoice payment grace period.</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Credit Warning Utilization Threshold (%)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={settings.creditWarningThresholdPercent}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          creditWarningThresholdPercent: parseFloat(e.target.value) || 80,
                        })
                      }
                      className="rounded-xl text-xs h-9 bg-muted/30"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Warns staff when customer balances reach this percentage of their sanctioned limit.
                    </p>
                  </div>
                </div>

                <div className="pt-2 space-y-3">
                  <label className="flex items-center gap-2.5 p-3.5 rounded-xl border border-border/70 bg-muted/20 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enforceCreditLimit}
                      onChange={(e) =>
                        setSettings({ ...settings, enforceCreditLimit: e.target.checked })
                      }
                      className="rounded text-[#0071E3]"
                    />
                    <div className="text-xs">
                      <span className="font-bold block">Enforce Strict Credit Limit Hold</span>
                      <span className="text-muted-foreground text-[11px]">
                        Automatically blocks checkout when customer outstanding balance exceeds their sanctioned credit limit.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3.5 rounded-xl border border-border/70 bg-muted/20 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.requireApprovalOnCreditExceed}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          requireApprovalOnCreditExceed: e.target.checked,
                        })
                      }
                      className="rounded text-[#0071E3]"
                    />
                    <div className="text-xs">
                      <span className="font-bold block">Require Manager Override on Overdue Accounts</span>
                      <span className="text-muted-foreground text-[11px]">
                        Requires explicit sales manager authorization reason to book orders for blocked pharmacies.
                      </span>
                    </div>
                  </label>
                </div>

                <div className="pt-4 border-t flex justify-end">
                  <Button
                    type="button"
                    onClick={() => handleSaveSettings()}
                    disabled={isSaving}
                    className="bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl text-xs h-9 px-4"
                  >
                    <Save className="h-4 w-4 mr-1.5" />
                    {isSaving ? "Saving..." : "Save Credit Policies"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section 6: Alerts & Notifications */}
          {activeTab === "notifications" && (
            <Card className="border border-border/80 rounded-2xl shadow-sm">
              <CardHeader className="border-b bg-muted/20 pb-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Bell className="h-4 w-4 text-sky-600" />
                  System Watchdog & Notification Center Preferences
                </CardTitle>
                <CardDescription className="text-xs">
                  Toggle real-time alerts generated in the top header bell popover and system watchdog center.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border/70 bg-muted/20 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifyLowStock}
                    onChange={(e) =>
                      setSettings({ ...settings, notifyLowStock: e.target.checked })
                    }
                    className="rounded text-[#0071E3]"
                  />
                  <div className="text-xs">
                    <span className="font-bold block">Low Stock & Reorder Alerts</span>
                    <span className="text-muted-foreground text-[11px]">
                      Notify when medicine units on hand drop below minimum threshold.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border/70 bg-muted/20 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifyNearExpiry}
                    onChange={(e) =>
                      setSettings({ ...settings, notifyNearExpiry: e.target.checked })
                    }
                    className="rounded text-[#0071E3]"
                  />
                  <div className="text-xs">
                    <span className="font-bold block">Near-Expiry Watchdog Alerts</span>
                    <span className="text-muted-foreground text-[11px]">
                      Notify when active batches enter the near-expiry warning window.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border/70 bg-muted/20 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifyExpiredStock}
                    onChange={(e) =>
                      setSettings({ ...settings, notifyExpiredStock: e.target.checked })
                    }
                    className="rounded text-[#0071E3]"
                  />
                  <div className="text-xs">
                    <span className="font-bold block">Expired Medicine Quarantine Alerts</span>
                    <span className="text-muted-foreground text-[11px]">
                      Immediate alerts when any batch passes its expiration date.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border/70 bg-muted/20 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifyCreditBreach}
                    onChange={(e) =>
                      setSettings({ ...settings, notifyCreditBreach: e.target.checked })
                    }
                    className="rounded text-[#0071E3]"
                  />
                  <div className="text-xs">
                    <span className="font-bold block">Customer Credit Limit Breach Alerts</span>
                    <span className="text-muted-foreground text-[11px]">
                      Notify when a customer pharmacy balance exceeds authorized credit limit.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border/70 bg-muted/20 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifySupplierDues}
                    onChange={(e) =>
                      setSettings({ ...settings, notifySupplierDues: e.target.checked })
                    }
                    className="rounded text-[#0071E3]"
                  />
                  <div className="text-xs">
                    <span className="font-bold block">Supplier Payment Due Reminders</span>
                    <span className="text-muted-foreground text-[11px]">
                      Notify when supplier consignment payment vouchers are approaching due date.
                    </span>
                  </div>
                </label>

                <div className="pt-4 border-t flex justify-end">
                  <Button
                    type="button"
                    onClick={() => handleSaveSettings()}
                    disabled={isSaving}
                    className="bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl text-xs h-9 px-4"
                  >
                    <Save className="h-4 w-4 mr-1.5" />
                    {isSaving ? "Saving..." : "Save Notification Preferences"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section 7: Team / User Management */}
          {activeTab === "users" && (
            <Card className="border border-border/80 rounded-2xl shadow-sm">
              <CardHeader className="border-b bg-muted/20 pb-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Users2 className="h-4 w-4 text-[#0071E3]" />
                    Staff Accounts & Access Management
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Enroll team members, assign operational roles, reset passwords, and manage active status.
                  </CardDescription>
                </div>

                <Button
                  type="button"
                  onClick={() => setIsAddUserOpen(true)}
                  className="bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl text-xs h-9 px-3.5 shadow-sm"
                >
                  <Plus className="h-4 w-4 mr-1.5" /> Add Staff Member
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Custom Credentials Announcement Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-slate-900 border border-blue-200/70 dark:border-blue-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl bg-[#0071E3] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <KeyRound className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-foreground">Custom Login Credentials & Password Management</h4>
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] py-0">Local SQLite</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        You have full ownership of your credentials. You can set and reset custom login emails and secure passwords for any staff or admin account below. All updates are saved locally into your desktop SQLite database.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/40 border-b font-semibold text-muted-foreground uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Staff Name</th>
                        <th className="px-4 py-3">Email Address</th>
                        <th className="px-4 py-3">Phone</th>
                        <th className="px-4 py-3 text-center">Assigned Role</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
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
                              {u.role.replace(/_/g, " ")}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {u.status === "ACTIVE" ? (
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                                Active
                              </Badge>
                            ) : (
                              <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px]">
                                {u.status}
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingUser({
                                    id: u.id,
                                    name: u.name,
                                    email: u.email,
                                    phone: u.phone === "N/A" ? "" : u.phone,
                                    role: u.role,
                                    status: u.status,
                                  });
                                  setIsEditUserOpen(true);
                                }}
                                className="h-7 px-2 text-[11px] rounded-lg gap-1 border-sky-200 text-sky-700 hover:bg-sky-50 dark:border-sky-900/50 dark:text-sky-400"
                                title="Change login email and role"
                              >
                                <Edit2 className="h-3 w-3" />
                                <span className="hidden sm:inline">Edit Email</span>
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setResetUser({
                                    id: u.id,
                                    name: u.name,
                                    password: "",
                                    confirmPassword: "",
                                  });
                                  setIsResetPasswordOpen(true);
                                }}
                                className="h-7 px-2 text-[11px] rounded-lg gap-1 border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-900/50 dark:text-amber-400"
                                title="Reset login password"
                              >
                                <KeyRound className="h-3 w-3" />
                                <span className="hidden sm:inline">Reset Password</span>
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44 text-xs">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setEditingUser({
                                        id: u.id,
                                        name: u.name,
                                        email: u.email,
                                        phone: u.phone === "N/A" ? "" : u.phone,
                                        role: u.role,
                                        status: u.status,
                                      });
                                      setIsEditUserOpen(true);
                                    }}
                                    className="cursor-pointer gap-2"
                                  >
                                    <Edit2 className="h-3.5 w-3.5 text-sky-600" />
                                    Edit Account & Role
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={() => {
                                      setResetUser({
                                        id: u.id,
                                        name: u.name,
                                        password: "",
                                        confirmPassword: "",
                                      });
                                      setIsResetPasswordOpen(true);
                                    }}
                                    className="cursor-pointer gap-2"
                                  >
                                    <KeyRound className="h-3.5 w-3.5 text-amber-600" />
                                    Reset Password
                                  </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() => {
                                    setDeactivateUser({
                                      id: u.id,
                                      name: u.name,
                                      status: u.status,
                                    });
                                    setIsDeactivateOpen(true);
                                  }}
                                  className={`cursor-pointer gap-2 ${
                                    u.status === "ACTIVE"
                                      ? "text-rose-600 focus:text-rose-600"
                                      : "text-emerald-600 focus:text-emerald-600"
                                  }`}
                                >
                                  {u.status === "ACTIVE" ? (
                                    <>
                                      <UserX className="h-3.5 w-3.5" /> Deactivate Account
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="h-3.5 w-3.5" /> Activate Account
                                    </>
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 8: BACKUP & DISASTER RECOVERY */}
          {activeTab === "backup" && (
            <div className="space-y-6">
              {/* Primary Backup Action */}
              <Card className="rounded-2xl border-border/80 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/20 pb-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <HardDrive className="h-4 w-4 text-[#0071E3]" />
                        Offline SQLite Database Backup
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Download a standalone, portable snapshot of the complete distribution database.
                      </CardDescription>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                      100% Offline Storage
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    In the offline desktop edition, all records—including medicines, stock batches, purchase invoices, customer balances, sales ledgers, and forensic audit logs—are securely stored in a single embedded SQLite database file (<code className="font-mono text-foreground font-semibold">prisma/wmdms.db</code>).
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Button
                      asChild
                      className="bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl text-xs h-9 px-4 shadow-sm gap-2"
                    >
                      <a href="/api/backup/download" download>
                        <Download className="h-4 w-4" />
                        Download Live Database (.db)
                      </a>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCreateSnapshot}
                      disabled={isCreatingSnapshot}
                      className="rounded-xl text-xs h-9 px-4 gap-2 border-border/80"
                    >
                      <FileCheck2 className="h-4 w-4 text-purple-600" />
                      {isCreatingSnapshot ? "Creating Snapshot..." : "Create Local Snapshot"}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={loadSnapshots}
                      disabled={isSnapshotLoading}
                      className="rounded-xl text-xs h-9 w-9 p-0"
                      title="Refresh snapshots"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isSnapshotLoading ? "animate-spin text-[#0071E3]" : ""}`} />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Local Snapshots Table */}
              <Card className="rounded-2xl border-border/80 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/20 pb-3 border-b">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Local Database Snapshots ({snapshots.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {snapshots.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground">
                      No local snapshots created yet. Click &ldquo;Create Local Snapshot&rdquo; to store a backup in <code className="font-mono font-semibold text-foreground">prisma/backups/</code>.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-muted/30 text-muted-foreground font-medium border-b">
                          <tr>
                            <th className="px-4 py-2.5">Snapshot Filename</th>
                            <th className="px-4 py-2.5">Size</th>
                            <th className="px-4 py-2.5">Date Created</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60 font-mono text-[11px]">
                          {snapshots.map((s) => (
                            <tr key={s.filename} className="hover:bg-muted/30">
                              <td className="px-4 py-2.5 font-semibold text-foreground">{s.filename}</td>
                              <td className="px-4 py-2.5 text-muted-foreground">{(s.sizeBytes / 1024).toFixed(1)} KB</td>
                              <td className="px-4 py-2.5 text-muted-foreground">{new Date(s.createdAt).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Disaster Recovery Runbook Guide */}
              <Card className="rounded-2xl border-amber-200 bg-amber-50/40 dark:bg-amber-950/20 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-900 dark:text-amber-200">
                    <Shield className="h-4 w-4 text-amber-700" />
                    Disaster Recovery & Database Restore Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                  <p>
                    Because SQLite operates as an in-process, zero-install file database, restoring from a backup requires replacing the active database file when the server is stopped.
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 font-medium pl-1">
                    <li><strong className="text-foreground">Stop the ERP application:</strong> Close the Electron desktop window or terminate the local terminal process.</li>
                    <li><strong className="text-foreground">Locate your application directory:</strong> Navigate to the <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded">prisma/</code> folder.</li>
                    <li><strong className="text-foreground">Preserve safety copy:</strong> Rename the current file from <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded">wmdms.db</code> to <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded">wmdms.db.old</code>.</li>
                    <li><strong className="text-foreground">Restore backup file:</strong> Copy your downloaded backup file into the <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded">prisma/</code> folder and rename it to <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded">wmdms.db</code>.</li>
                    <li><strong className="text-foreground">Restart PharmaDist:</strong> Launch the application. All 28 data tables and historical accounting ledgers will be active immediately.</li>
                  </ol>
                  <div className="p-2.5 rounded-xl bg-amber-100/70 dark:bg-amber-900/40 text-[11px] font-semibold text-amber-950 dark:text-amber-100 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>Never hot-swap or overwrite <code className="font-mono">wmdms.db</code> while the software is running, as active write-ahead locks could corrupt open transactions.</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: ADD STAFF MEMBER */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <form onSubmit={handleCreateUser}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Users2 className="h-5 w-5 text-[#0071E3]" />
                Enroll New Staff Member
              </DialogTitle>
              <DialogDescription className="text-xs">
                Create login credentials and designate role-based permissions for distribution operations.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-4">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Full Name *</Label>
                <Input
                  required
                  placeholder="e.g. Tariq Mehmood"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="rounded-xl text-xs h-9 bg-muted/30"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Email Address (Login Username) *</Label>
                <Input
                  required
                  type="email"
                  placeholder="e.g. tariq@pharmadist.pk"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="rounded-xl text-xs h-9 bg-muted/30"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Contact Phone</Label>
                <Input
                  placeholder="e.g. +92 300 1234567"
                  value={newUser.phone || ""}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="rounded-xl text-xs h-9 bg-muted/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Assigned Role *</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(val: any) => setNewUser({ ...newUser, role: val })}
                  >
                    <SelectTrigger className="rounded-xl text-xs h-9 bg-muted/30">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SUPER_ADMIN">Super Administrator</SelectItem>
                      <SelectItem value="SALES_MANAGER">Sales Manager</SelectItem>
                      <SelectItem value="SALESMAN">Field Salesman</SelectItem>
                      <SelectItem value="WAREHOUSE_MANAGER">Warehouse Manager</SelectItem>
                      <SelectItem value="INVENTORY_OFFICER">Inventory Officer</SelectItem>
                      <SelectItem value="ACCOUNTS_OFFICER">Accounts Officer</SelectItem>
                      <SelectItem value="CASHIER">Cashier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Account Status</Label>
                  <Select
                    value={newUser.status}
                    onValueChange={(val: any) => setNewUser({ ...newUser, status: val })}
                  >
                    <SelectTrigger className="rounded-xl text-xs h-9 bg-muted/30">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Initial Login Password *</Label>
                <Input
                  required
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="rounded-xl text-xs h-9 bg-muted/30"
                />
                <p className="text-[11px] text-muted-foreground">
                  Hashed securely with bcrypt before committing to the database.
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddUserOpen(false)}
                className="rounded-xl text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUserProcessing}
                className="bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl text-xs h-9 px-4"
              >
                {isUserProcessing ? "Creating Account..." : "Create Account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: EDIT STAFF MEMBER */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          {editingUser && (
            <form onSubmit={handleUpdateUser}>
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <Edit2 className="h-5 w-5 text-sky-600" />
                  Edit Staff Details & Permissions
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Update staff profile information, phone, role classification, and account status.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3.5 py-4">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Full Name *</Label>
                  <Input
                    required
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="rounded-xl text-xs h-9 bg-muted/30"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Email Address *</Label>
                  <Input
                    required
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="rounded-xl text-xs h-9 bg-muted/30"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Phone Number</Label>
                  <Input
                    value={editingUser.phone || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="rounded-xl text-xs h-9 bg-muted/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Operational Role</Label>
                    <Select
                      value={editingUser.role}
                      onValueChange={(val: any) => setEditingUser({ ...editingUser, role: val })}
                    >
                      <SelectTrigger className="rounded-xl text-xs h-9 bg-muted/30">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SUPER_ADMIN">Super Administrator</SelectItem>
                        <SelectItem value="SALES_MANAGER">Sales Manager</SelectItem>
                        <SelectItem value="SALESMAN">Field Salesman</SelectItem>
                        <SelectItem value="WAREHOUSE_MANAGER">Warehouse Manager</SelectItem>
                        <SelectItem value="INVENTORY_OFFICER">Inventory Officer</SelectItem>
                        <SelectItem value="ACCOUNTS_OFFICER">Accounts Officer</SelectItem>
                        <SelectItem value="CASHIER">Cashier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Account Status</Label>
                    <Select
                      value={editingUser.status}
                      onValueChange={(val: any) => setEditingUser({ ...editingUser, status: val })}
                    >
                      <SelectTrigger className="rounded-xl text-xs h-9 bg-muted/30">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                        <SelectItem value="SUSPENDED">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditUserOpen(false)}
                  className="rounded-xl text-xs h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUserProcessing}
                  className="bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl text-xs h-9 px-4"
                >
                  {isUserProcessing ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL 3: RESET PASSWORD */}
      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          {resetUser && (
            <form onSubmit={handleResetPassword}>
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-amber-600" />
                  Reset Staff Password
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Set a new password for <span className="font-bold text-foreground">{resetUser.name}</span>.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-4">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">New Password (Minimum 6 characters) *</Label>
                  <Input
                    required
                    type="password"
                    placeholder="Enter new secure password"
                    value={resetUser.password}
                    onChange={(e) => setResetUser({ ...resetUser, password: e.target.value })}
                    className="rounded-xl text-xs h-9 bg-muted/30"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Confirm New Password *</Label>
                  <Input
                    required
                    type="password"
                    placeholder="Re-type new password"
                    value={resetUser.confirmPassword}
                    onChange={(e) => setResetUser({ ...resetUser, confirmPassword: e.target.value })}
                    className="rounded-xl text-xs h-9 bg-muted/30"
                  />
                  {resetUser.confirmPassword.length > 0 && resetUser.password !== resetUser.confirmPassword && (
                    <p className="text-[10px] text-rose-500 font-medium">Passwords do not match</p>
                  )}
                  {resetUser.confirmPassword.length > 0 && resetUser.password === resetUser.confirmPassword && (
                    <p className="text-[10px] text-emerald-600 font-medium">Passwords match</p>
                  )}
                </div>
              </div>

              <DialogFooter className="gap-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsResetPasswordOpen(false)}
                  className="rounded-xl text-xs h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isUserProcessing ||
                    resetUser.password.length < 6 ||
                    resetUser.password !== resetUser.confirmPassword
                  }
                  className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs h-9 px-4"
                >
                  {isUserProcessing ? "Resetting..." : "Reset Password"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL 4: DEACTIVATE / ACTIVATE CONFIRMATION */}
      <Dialog open={isDeactivateOpen} onOpenChange={setIsDeactivateOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          {deactivateUser && (
            <div>
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  {deactivateUser.status === "ACTIVE" ? (
                    <>
                      <UserX className="h-5 w-5 text-rose-600" />
                      Confirm Account Deactivation
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-5 w-5 text-emerald-600" />
                      Confirm Account Reactivation
                    </>
                  )}
                </DialogTitle>
                <DialogDescription className="text-xs leading-relaxed pt-1">
                  {deactivateUser.status === "ACTIVE" ? (
                    <>
                      Are you sure you want to deactivate{" "}
                      <span className="font-bold text-foreground">{deactivateUser.name}</span>?
                      <br />
                      <span className="text-rose-700 font-semibold block mt-1.5">
                        Deactivating immediately revokes login access while preserving all historical sales orders, ledger entries, and audit logs.
                      </span>
                    </>
                  ) : (
                    <>
                      Reactivate account for{" "}
                      <span className="font-bold text-foreground">{deactivateUser.name}</span> to restore system login and operations.
                    </>
                  )}
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="gap-2 pt-4 border-t mt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDeactivateOpen(false)}
                  className="rounded-xl text-xs h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleToggleUserStatus}
                  disabled={isUserProcessing}
                  className={`rounded-xl text-xs h-9 px-4 text-white ${
                    deactivateUser.status === "ACTIVE"
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  {isUserProcessing
                    ? "Updating..."
                    : deactivateUser.status === "ACTIVE"
                    ? "Deactivate Account"
                    : "Activate Account"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
