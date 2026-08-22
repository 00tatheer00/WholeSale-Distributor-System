"use client";

import * as React from "react";
import { Settings, Shield, Building2, Users, FileText, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { updateCompanySettingsAction } from "@/server/actions/settings.actions";
import { CompanySettingsInput } from "@/validations/settings.schema";
import { formatDate } from "@/lib/utils";

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
  const [activeTab, setActiveTab] = React.useState("company");
  const [companyData, setCompanyData] = React.useState<CompanySettingsInput>({
    name: initialCompany.name || "",
    tradeLicenseNo: initialCompany.tradeLicenseNo || "",
    drugLicenseNo: initialCompany.drugLicenseNo || "",
    taxIdTin: initialCompany.taxIdTin || "",
    email: initialCompany.email || "",
    phone: initialCompany.phone || "",
    address: initialCompany.address || "",
    city: initialCompany.city || "Dhaka",
    country: initialCompany.country || "Bangladesh",
    currency: initialCompany.currency || "BDT",
    defaultCreditDays: initialCompany.defaultCreditDays || 30,
    defaultVatPercent: initialCompany.defaultVatPercent || 0,
    enableFefoStrict: initialCompany.enableFefoStrict ?? true,
    lowStockThreshold: initialCompany.lowStockThreshold || 20,
    nearExpiryDays: initialCompany.nearExpiryDays || 90,
    invoiceFooterText: initialCompany.invoiceFooterText || "",
  });

  const [isSaving, setIsSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    const res = await updateCompanySettingsAction(companyData);
    setIsSaving(false);

    if (res.success) {
      setFeedback(res.message || "Company settings saved.");
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Administration & Settings"
        description="Company licensing parameters, user accounts & role-based access control (RBAC), and immutable security audit logs."
        badge={<Badge variant="outline">Module M16</Badge>}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="company">Company Profile</TabsTrigger>
          <TabsTrigger value="users">Users & RBAC</TabsTrigger>
          <TabsTrigger value="audit">Audit Log Explorer</TabsTrigger>
        </TabsList>

        {/* Tab 1: Company Profile */}
        <TabsContent value="company" className="space-y-4 pt-2">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                Enterprise Company & Regulatory Licensing
              </CardTitle>
              <CardDescription className="text-xs">
                These credentials appear on all generated Wholesale Tax Invoices and Delivery Challans
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {feedback && (
                <div className="mb-4 p-3 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {feedback}
                </div>
              )}

              <form onSubmit={handleSaveCompany} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Enterprise Name *</Label>
                    <Input
                      value={companyData.name}
                      onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                      required
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Wholesale Drug License No *</Label>
                    <Input
                      value={companyData.drugLicenseNo || ""}
                      onChange={(e) => setCompanyData({ ...companyData, drugLicenseNo: e.target.value })}
                      required
                      className="text-xs h-9 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Trade License No</Label>
                    <Input
                      value={companyData.tradeLicenseNo || ""}
                      onChange={(e) => setCompanyData({ ...companyData, tradeLicenseNo: e.target.value })}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Tax ID / TIN</Label>
                    <Input
                      value={companyData.taxIdTin || ""}
                      onChange={(e) => setCompanyData({ ...companyData, taxIdTin: e.target.value })}
                      className="text-xs h-9 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Default Credit Days</Label>
                    <Input
                      type="number"
                      value={companyData.defaultCreditDays}
                      onChange={(e) => setCompanyData({ ...companyData, defaultCreditDays: parseInt(e.target.value) || 30 })}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Official Email</Label>
                    <Input
                      type="email"
                      value={companyData.email || ""}
                      onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Official Phone</Label>
                    <Input
                      value={companyData.phone || ""}
                      onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Registered Warehouse / Head Office Address</Label>
                  <Input
                    value={companyData.address || ""}
                    onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Invoice Footer Regulatory Disclaimer</Label>
                  <Input
                    value={companyData.invoiceFooterText || ""}
                    onChange={(e) => setCompanyData({ ...companyData, invoiceFooterText: e.target.value })}
                    className="text-xs h-9"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Company Configuration"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Users & RBAC */}
        <TabsContent value="users" className="space-y-4 pt-2">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                User Accounts & Role-Based Access Control (RBAC)
              </CardTitle>
              <CardDescription className="text-xs">
                Granular permissions matrix for Super Admins, Sales Managers, Medical Reps, and Warehouse Officers
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-3">User Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/30">
                      <td className="p-3 font-semibold text-foreground">{u.name}</td>
                      <td className="p-3 text-muted-foreground">{u.email}</td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-[10px]">
                          {u.role.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">{u.phone}</td>
                      <td className="p-3 text-center">
                        <Badge variant="success" className="text-[10px]">
                          {u.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Audit Logs */}
        <TabsContent value="audit" className="space-y-4 pt-2">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-600" />
                Immutable System Audit Logs
              </CardTitle>
              <CardDescription className="text-xs">
                Append-only regulatory and security audit ledger tracking all critical transactions and credit overrides
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-3">Action</th>
                    <th className="p-3">Entity</th>
                    <th className="p-3">Triggered By</th>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-mono">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/30 text-[11px]">
                      <td className="p-3 font-bold text-primary">{log.action}</td>
                      <td className="p-3 text-muted-foreground">{log.entityName}</td>
                      <td className="p-3 font-sans font-medium text-foreground">{log.userName}</td>
                      <td className="p-3 text-muted-foreground">{log.timestamp}</td>
                      <td className="p-3 font-sans text-muted-foreground">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
