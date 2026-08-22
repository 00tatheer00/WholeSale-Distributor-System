"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Store, Plus, Phone, MapPin, ShieldAlert, CheckCircle2, FileText } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CreditLimitGauge } from "@/components/shared/credit-limit-gauge";
import { createCustomerAction } from "@/server/actions/customer.actions";
import { CustomerInput } from "@/validations/customer.schema";

interface CustomersClientProps {
  initialCustomers: any[];
}

export function CustomersClient({ initialCustomers }: CustomersClientProps) {
  const [customers, setCustomers] = React.useState(initialCustomers);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  const [formData, setFormData] = React.useState<CustomerInput>({
    tradeName: "",
    proprietorName: "",
    customerType: "RETAIL_PHARMACY",
    drugLicenseNo: "",
    drugLicenseExpiry: "2027-12-31",
    tradeLicenseNo: "",
    taxIdTin: "",
    phone: "",
    email: "",
    deliveryAddress: "",
    city: "Dhaka",
    assignedRoute: "Route 1: Mirpur - Pallabi",
    creditLimit: 200000,
    maxDueDays: 30,
    defaultDiscountPercent: 2.0,
    status: "ACTIVE",
    notes: "",
  });

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "tradeName",
      header: "Pharmacy & Proprietor",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-foreground flex items-center gap-1.5">
            {row.original.tradeName}
            {row.original.status === "BLOCKED_OVERDUE" && (
              <Badge variant="destructive" className="text-[9px] px-1 py-0">
                OVERDUE HOLD
              </Badge>
            )}
          </div>
          <div className="text-[11px] text-muted-foreground">
            Prop: <strong>{row.original.proprietorName || "N/A"}</strong>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "customerType",
      header: "Classification",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-[10px] font-normal">
          {row.original.customerType.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      accessorKey: "drugLicenseNo",
      header: "Drug License",
      cell: ({ row }) => {
        const exp = new Date(row.original.drugLicenseExpiry);
        const isExpiring = exp.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000;
        return (
          <div className="space-y-0.5 text-[11px]">
            <div className="font-mono font-medium">{row.original.drugLicenseNo}</div>
            <div className={`text-[10px] ${isExpiring ? "text-rose-600 font-semibold" : "text-muted-foreground"}`}>
              Exp: {formatDate(row.original.drugLicenseExpiry)}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "assignedRoute",
      header: "Territory / Route",
      cell: ({ row }) => (
        <div className="space-y-0.5 text-xs">
          <div className="text-foreground font-medium">{row.original.assignedRoute}</div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Phone className="h-3 w-3" /> {row.original.phone}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "creditLimit",
      header: "Credit Risk & Dues",
      cell: ({ row }) => (
        <div className="w-48">
          <CreditLimitGauge
            creditLimit={row.original.creditLimit}
            currentDue={row.original.currentDue}
            maxDueDays={row.original.maxDueDays}
            oldestOverdueDays={row.original.oldestOverdueDays}
            compact={true}
          />
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={row.original.status === "ACTIVE" ? "success" : "destructive"}
          className="text-[10px]"
        >
          {row.original.status}
        </Badge>
      ),
    },
  ];

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const res = await createCustomerAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      setFeedback({ type: "success", message: res.message || "Customer enrolled." });
      setCustomers((prev) => [
        {
          ...formData,
          id: `cust-${Date.now()}`,
          currentDue: 0,
          oldestOverdueDays: 0,
          totalSales: 0,
        },
        ...prev,
      ]);
      setTimeout(() => {
        setIsAddOpen(false);
        setFeedback(null);
      }, 1000);
    } else {
      setFeedback({ type: "error", message: res.error || "Failed to onboard customer." });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Pharmacies & Institutions"
        description="Customer directory, drug regulatory license compliance, automated credit limit barriers, and overdue aging ledgers."
        badge={<Badge variant="outline">Module M06</Badge>}
        actions={
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 text-xs h-9">
                <Plus className="h-3.5 w-3.5" />
                Onboard Pharmacy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-base font-bold">Onboard Customer Pharmacy / Hospital</DialogTitle>
              </DialogHeader>

              {feedback && (
                <div
                  className={`p-3 rounded-md text-xs font-medium ${
                    feedback.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {feedback.message}
                </div>
              )}

              <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="tradeName" className="text-xs font-medium">
                      Pharmacy / Hospital Trade Name *
                    </Label>
                    <Input
                      id="tradeName"
                      placeholder="e.g. Popular Model Pharmacy"
                      value={formData.tradeName}
                      onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                      required
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="proprietorName" className="text-xs font-medium">
                      Proprietor / Pharmacist-in-Charge
                    </Label>
                    <Input
                      id="proprietorName"
                      placeholder="e.g. Dr. Mainul Islam"
                      value={formData.proprietorName || ""}
                      onChange={(e) => setFormData({ ...formData, proprietorName: e.target.value })}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Customer Type</Label>
                    <Select
                      value={formData.customerType}
                      onValueChange={(val: any) => setFormData({ ...formData, customerType: val })}
                    >
                      <SelectTrigger className="text-xs h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RETAIL_PHARMACY">Retail Pharmacy</SelectItem>
                        <SelectItem value="HOSPITAL_DISPENSARY">Hospital Dispensary</SelectItem>
                        <SelectItem value="CLINIC_INSTITUTION">Clinic / Institution</SelectItem>
                        <SelectItem value="SUB_DISTRIBUTOR">Sub-Distributor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="drugLicenseNo" className="text-xs font-medium">
                      Drug License No *
                    </Label>
                    <Input
                      id="drugLicenseNo"
                      placeholder="DL-DH-84910"
                      value={formData.drugLicenseNo}
                      onChange={(e) => setFormData({ ...formData, drugLicenseNo: e.target.value })}
                      required
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="drugLicenseExpiry" className="text-xs font-medium">
                      License Expiry Date *
                    </Label>
                    <Input
                      id="drugLicenseExpiry"
                      type="date"
                      value={formData.drugLicenseExpiry}
                      onChange={(e) => setFormData({ ...formData, drugLicenseExpiry: e.target.value })}
                      required
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-medium">Phone Number *</Label>
                    <Input
                      id="phone"
                      placeholder="+880 1711..."
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="creditLimit" className="text-xs font-medium">Credit Limit (৳) *</Label>
                    <Input
                      id="creditLimit"
                      type="number"
                      value={formData.creditLimit}
                      onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
                      required
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="maxDueDays" className="text-xs font-medium">Max Overdue Days *</Label>
                    <Input
                      id="maxDueDays"
                      type="number"
                      value={formData.maxDueDays}
                      onChange={(e) => setFormData({ ...formData, maxDueDays: parseInt(e.target.value) || 30 })}
                      required
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="deliveryAddress" className="text-xs font-medium">
                      Delivery Address *
                    </Label>
                    <Input
                      id="deliveryAddress"
                      placeholder="Shop #, Market / Road"
                      value={formData.deliveryAddress}
                      onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                      required
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="assignedRoute" className="text-xs font-medium">
                      Assigned Sales Route / Beat
                    </Label>
                    <Input
                      id="assignedRoute"
                      placeholder="e.g. Route 1: Mirpur - Pallabi"
                      value={formData.assignedRoute || ""}
                      onChange={(e) => setFormData({ ...formData, assignedRoute: e.target.value })}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Enrolling..." : "Onboard Pharmacy"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable
        columns={columns}
        data={customers}
        searchKey="tradeName"
        searchPlaceholder="Search pharmacy trade name, license..."
      />
    </div>
  );
}
