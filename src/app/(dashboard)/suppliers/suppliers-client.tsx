"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Truck, Plus, Phone, Mail, Building2, ShieldCheck } from "lucide-react";
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
import { formatCurrency } from "@/lib/utils";
import { createSupplierAction } from "@/server/actions/supplier.actions";
import { SupplierInput } from "@/validations/supplier.schema";

interface SuppliersClientProps {
  initialSuppliers: any[];
}

export function SuppliersClient({ initialSuppliers }: SuppliersClientProps) {
  const [suppliers, setSuppliers] = React.useState(initialSuppliers);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  const [formData, setFormData] = React.useState<SupplierInput>({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    city: "Dhaka",
    country: "Bangladesh",
    drugLicenseNo: "",
    tradeLicenseNo: "",
    taxIdTin: "",
    creditDays: 30,
    creditLimit: 5000000,
    status: "ACTIVE",
  });

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Manufacturer / Supplier",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-foreground">{row.original.name}</div>
          <div className="text-[11px] text-muted-foreground">
            Contact: <strong>{row.original.contactPerson || "HQ Desk"}</strong>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Contact Details",
      cell: ({ row }) => (
        <div className="space-y-0.5 text-xs">
          <div className="flex items-center gap-1 text-foreground">
            <Phone className="h-3 w-3 text-muted-foreground" />
            {row.original.phone}
          </div>
          {row.original.email && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Mail className="h-3 w-3" />
              {row.original.email}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "drugLicenseNo",
      header: "Licenses",
      cell: ({ row }) => (
        <div className="space-y-0.5 text-[11px]">
          <div>Drug Lic: <span className="font-mono">{row.original.drugLicenseNo || "N/A"}</span></div>
          <div className="text-muted-foreground">Trade: <span className="font-mono">{row.original.tradeLicenseNo || "N/A"}</span></div>
        </div>
      ),
    },
    {
      accessorKey: "creditDays",
      header: "Payment Terms",
      cell: ({ row }) => (
        <span className="text-xs font-medium">
          Net {row.original.creditDays} Days
        </span>
      ),
    },
    {
      accessorKey: "currentPayable",
      header: "Outstanding Payable (AP)",
      cell: ({ row }) => {
        const payable = row.original.currentPayable;
        return (
          <div className="space-y-0.5">
            <div className={`font-bold ${payable > 0 ? "text-amber-600" : "text-emerald-600"}`}>
              {formatCurrency(payable)}
            </div>
            <div className="text-[10px] text-muted-foreground">
              Limit: {formatCurrency(row.original.creditLimit)}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "ACTIVE" ? "success" : "secondary"} className="text-[10px]">
          {row.original.status}
        </Badge>
      ),
    },
  ];

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const res = await createSupplierAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      setFeedback({ type: "success", message: res.message || "Supplier saved." });
      setSuppliers((prev) => [
        {
          ...formData,
          id: `sup-${Date.now()}`,
          currentPayable: 0,
          totalPurchases: 0,
        },
        ...prev,
      ]);
      setTimeout(() => {
        setIsAddOpen(false);
        setFeedback(null);
      }, 1000);
    } else {
      setFeedback({ type: "error", message: res.error || "Failed to create supplier." });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supplier & Vendor Directory"
        description="Manage pharmaceutical manufacturers, licensed drug suppliers, procurement terms, and Accounts Payable (AP) ledgers."
        badge={<Badge variant="outline">Module M02</Badge>}
        actions={
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 text-xs h-9">
                <Plus className="h-3.5 w-3.5" />
                Add New Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-base font-bold">Register Drug Manufacturer / Supplier</DialogTitle>
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

              <form onSubmit={handleCreateSupplier} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-medium">Company Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Square Pharmaceuticals PLC"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contactPerson" className="text-xs font-medium">Contact Person</Label>
                    <Input
                      id="contactPerson"
                      placeholder="e.g. Dr. Asif Mahmud"
                      value={formData.contactPerson || ""}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
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
                    <Label htmlFor="email" className="text-xs font-medium">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="supply@company.com"
                      value={formData.email || ""}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="drugLicenseNo" className="text-xs font-medium">Drug License No</Label>
                    <Input
                      id="drugLicenseNo"
                      placeholder="MFG-DL-00192"
                      value={formData.drugLicenseNo || ""}
                      onChange={(e) => setFormData({ ...formData, drugLicenseNo: e.target.value })}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="creditDays" className="text-xs font-medium">Credit Days</Label>
                    <Input
                      id="creditDays"
                      type="number"
                      value={formData.creditDays}
                      onChange={(e) => setFormData({ ...formData, creditDays: parseInt(e.target.value) || 30 })}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="creditLimit" className="text-xs font-medium">Credit Limit (৳)</Label>
                    <Input
                      id="creditLimit"
                      type="number"
                      value={formData.creditLimit}
                      onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-xs font-medium">Office / Plant Address</Label>
                  <Input
                    id="address"
                    placeholder="Plot / Road, Area, City"
                    value={formData.address || ""}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="text-xs h-9"
                  />
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
                    {isSubmitting ? "Saving..." : "Save Supplier"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable
        columns={columns}
        data={suppliers}
        searchKey="name"
        searchPlaceholder="Search supplier name..."
      />
    </div>
  );
}
