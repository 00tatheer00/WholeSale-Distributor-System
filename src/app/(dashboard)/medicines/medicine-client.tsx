"use client";

import * as React from "react";
import {
  ColumnDef,
} from "@tanstack/react-table";
import { Pill, Plus, Thermometer, ShieldAlert, FileText, CheckCircle2 } from "lucide-react";
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
import { formatCurrency } from "@/lib/utils";
import { createMedicineAction } from "@/server/actions/medicine.actions";
import { MedicineInput } from "@/validations/medicine.schema";

interface MedicineClientProps {
  initialMedicines: any[];
  categories: any[];
  suppliers: any[];
}

export function MedicineClient({
  initialMedicines,
  categories,
  suppliers,
}: MedicineClientProps) {
  const [medicines, setMedicines] = React.useState(initialMedicines);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form State
  const [formData, setFormData] = React.useState<MedicineInput>({
    brandName: "",
    genericName: "",
    strength: "",
    dosageForm: "TABLET",
    categoryId: categories[0]?.id || "",
    supplierId: suppliers[0]?.id || "",
    unitTradePrice: 0,
    unitMrp: 0,
    wholesaleBasePrice: 0,
    vatPercent: 0,
    storageCondition: "ROOM_TEMPERATURE",
    reorderAlertLevel: 50,
    isPrescriptionRequired: true,
    isColdChain: false,
    isNarcotic: false,
    primaryUnitName: "Box (20x10)",
    secondaryUnitName: "Strip",
    unitConversionRatio: 10,
    status: "ACTIVE",
  });

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "brandName",
      header: "Brand & Formulation",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-foreground flex items-center gap-1.5">
            {row.original.brandName}
            {row.original.isColdChain && (
              <span title="Cold Chain (2-8°C)">
                <Thermometer className="h-3.5 w-3.5 text-blue-500" />
              </span>
            )}
            {row.original.isNarcotic && (
              <span title="Controlled Substance / Narcotic">
                <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
              </span>
            )}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {row.original.genericName} • <strong>{row.original.strength}</strong>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "categoryName",
      header: "Category",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-[11px] font-normal">
          {row.original.categoryName}
        </Badge>
      ),
    },
    {
      accessorKey: "dosageForm",
      header: "Dosage Form",
      cell: ({ row }) => (
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {row.original.dosageForm}
        </span>
      ),
    },
    {
      accessorKey: "unitTradePrice",
      header: "Trade Price (TP)",
      cell: ({ row }) => (
        <span className="font-semibold text-foreground">
          {formatCurrency(row.original.unitTradePrice)}
        </span>
      ),
    },
    {
      accessorKey: "unitMrp",
      header: "MRP",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatCurrency(row.original.unitMrp)}
        </span>
      ),
    },
    {
      accessorKey: "totalStockOnHand",
      header: "Stock Balance",
      cell: ({ row }) => {
        const stock = row.original.totalStockOnHand;
        const low = row.original.reorderAlertLevel;
        return (
          <div className="space-y-0.5">
            <span
              className={`font-bold ${
                stock <= low ? "text-rose-600" : "text-foreground"
              }`}
            >
              {stock} units
            </span>
            {stock <= low && (
              <div className="text-[10px] text-rose-500 font-medium">Reorder Alert</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "supplierName",
      header: "Manufacturer",
      cell: ({ row }) => (
        <span className="text-[11px] text-muted-foreground">
          {row.original.supplierName}
        </span>
      ),
    },
  ];

  const handleCreateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const result = await createMedicineAction(formData);
    setIsSubmitting(false);

    if (result.success) {
      setFeedback({ type: "success", message: result.message || "Medicine registered." });
      setMedicines((prev) => [
        {
          ...formData,
          id: `med-${Date.now()}`,
          categoryName: categories.find((c) => c.id === formData.categoryId)?.name || "General",
          supplierName: suppliers.find((s) => s.id === formData.supplierId)?.name || "Direct",
          totalStockOnHand: 0,
        },
        ...prev,
      ]);
      setTimeout(() => {
        setIsAddOpen(false);
        setFeedback(null);
      }, 1000);
    } else {
      setFeedback({ type: "error", message: result.error || "Failed to create." });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medicine Catalog & Master Data"
        description="Comprehensive master database of pharmaceutical drugs, generic formulations, packaging conversion ratios, and wholesale pricing."
        badge={<Badge variant="outline">Module M03</Badge>}
        actions={
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 text-xs h-9">
                <Plus className="h-3.5 w-3.5" />
                Add New Medicine
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-base font-bold">Register New Medicine</DialogTitle>
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

              <form onSubmit={handleCreateMedicine} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="brandName" className="text-xs font-medium">
                      Brand Trade Name *
                    </Label>
                    <Input
                      id="brandName"
                      placeholder="e.g. Napa Extra, Seclo 20"
                      value={formData.brandName}
                      onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                      required
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="genericName" className="text-xs font-medium">
                      Generic Formulation *
                    </Label>
                    <Input
                      id="genericName"
                      placeholder="e.g. Paracetamol + Caffeine"
                      value={formData.genericName}
                      onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                      required
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="strength" className="text-xs font-medium">
                      Strength / Potency *
                    </Label>
                    <Input
                      id="strength"
                      placeholder="e.g. 500mg, 20mg"
                      value={formData.strength}
                      onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                      required
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Dosage Form</Label>
                    <Select
                      value={formData.dosageForm}
                      onValueChange={(val: any) => setFormData({ ...formData, dosageForm: val })}
                    >
                      <SelectTrigger className="text-xs h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TABLET">Tablet</SelectItem>
                        <SelectItem value="CAPSULE">Capsule</SelectItem>
                        <SelectItem value="SYRUP">Syrup</SelectItem>
                        <SelectItem value="INJECTION">Injection</SelectItem>
                        <SelectItem value="OINTMENT">Ointment</SelectItem>
                        <SelectItem value="DROPS">Drops</SelectItem>
                        <SelectItem value="IV_INFUSION">IV Infusion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Category</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
                    >
                      <SelectTrigger className="text-xs h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="unitTradePrice" className="text-xs font-medium">
                      Unit Trade Price (TP ৳) *
                    </Label>
                    <Input
                      id="unitTradePrice"
                      type="number"
                      step="0.01"
                      placeholder="2.20"
                      value={formData.unitTradePrice || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, unitTradePrice: parseFloat(e.target.value) || 0 })
                      }
                      required
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="unitMrp" className="text-xs font-medium">
                      Maximum Retail Price (MRP ৳) *
                    </Label>
                    <Input
                      id="unitMrp"
                      type="number"
                      step="0.01"
                      placeholder="2.50"
                      value={formData.unitMrp || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, unitMrp: parseFloat(e.target.value) || 0 })
                      }
                      required
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="wholesaleBasePrice" className="text-xs font-medium">
                      Wholesale Base (৳) *
                    </Label>
                    <Input
                      id="wholesaleBasePrice"
                      type="number"
                      step="0.01"
                      placeholder="2.05"
                      value={formData.wholesaleBasePrice || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          wholesaleBasePrice: parseFloat(e.target.value) || 0,
                        })
                      }
                      required
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Manufacturer / Supplier</Label>
                    <Select
                      value={formData.supplierId || ""}
                      onValueChange={(val) => setFormData({ ...formData, supplierId: val })}
                    >
                      <SelectTrigger className="text-xs h-9">
                        <SelectValue placeholder="Select manufacturer" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="reorderAlertLevel" className="text-xs font-medium">
                      Low Stock Reorder Threshold
                    </Label>
                    <Input
                      id="reorderAlertLevel"
                      type="number"
                      value={formData.reorderAlertLevel}
                      onChange={(e) =>
                        setFormData({ ...formData, reorderAlertLevel: parseInt(e.target.value) || 50 })
                      }
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 p-3 rounded-md bg-muted/40 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isColdChain}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isColdChain: e.target.checked,
                          storageCondition: e.target.checked
                            ? "COLD_CHAIN_2_TO_8_C"
                            : "ROOM_TEMPERATURE",
                        })
                      }
                      className="rounded border-input text-primary"
                    />
                    <span>Cold Chain (2-8°C Storage)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isNarcotic}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isNarcotic: e.target.checked,
                          storageCondition: e.target.checked
                            ? "CONTROLLED_SUBSTANCE_NARCOTIC"
                            : "ROOM_TEMPERATURE",
                        })
                      }
                      className="rounded border-input text-primary"
                    />
                    <span>Narcotic / Controlled Safe</span>
                  </label>
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
                  <Button type="submit" disabled={isSubmitting} className="gap-1.5">
                    {isSubmitting ? "Saving..." : "Save Medicine"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable
        columns={columns}
        data={medicines}
        searchKey="brandName"
        searchPlaceholder="Search brand name or generic..."
      />
    </div>
  );
}
