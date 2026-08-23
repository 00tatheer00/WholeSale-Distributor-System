"use client";

import * as React from "react";
import Link from "next/link";
import {
  ColumnDef,
} from "@tanstack/react-table";
import {
  Pill,
  Plus,
  Thermometer,
  ShieldAlert,
  Search,
  Eye,
  Edit,
  Power,
  ChevronLeft,
  ChevronRight,
  Boxes,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import {
  createMedicineAction,
  updateMedicineAction,
  toggleMedicineStatusAction,
  getMedicinesAction,
} from "@/server/actions/medicine.actions";
import { MedicineInput } from "@/validations/medicine.schema";
import { MedicineRecord, CategoryRecord } from "@/types/models";

interface MedicineClientProps {
  initialMedicines: MedicineRecord[];
  categories: CategoryRecord[];
  suppliers: { id: string; name: string }[];
  totalCount: number;
  totalPages: number;
  initialPage: number;
}

export function MedicineClient({
  initialMedicines,
  categories,
  suppliers,
  totalCount: initialTotalCount,
  totalPages: initialTotalPages,
  initialPage,
}: MedicineClientProps) {
  const [medicines, setMedicines] = React.useState<MedicineRecord[]>(initialMedicines);
  const [totalCount, setTotalCount] = React.useState(initialTotalCount);
  const [totalPages, setTotalPages] = React.useState(initialTotalPages);
  const [page, setPage] = React.useState(initialPage);
  const [pageSize] = React.useState(20);

  // Filters State
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("ALL");
  const [selectedDosage, setSelectedDosage] = React.useState("ALL");
  const [selectedStatus, setSelectedStatus] = React.useState("ALL");
  const [sortBy, setSortBy] = React.useState<"brandName" | "genericName" | "createdAt" | "defaultTradePrice">("brandName");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");
  const [isLoading, setIsLoading] = React.useState(false);

  // Modals & Feedback
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [editingMedicine, setEditingMedicine] = React.useState<MedicineRecord | null>(null);
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
    primaryUnitName: "Box",
    secondaryUnitName: "Strip",
    unitConversionRatio: 10,
    status: "ACTIVE",
  });

  const refreshMedicines = async (
    newPage = page,
    q = search,
    cat = selectedCategory,
    dos = selectedDosage,
    st = selectedStatus,
    sb = sortBy,
    so = sortOrder
  ) => {
    setIsLoading(true);
    try {
      const res = await getMedicinesAction({
        page: newPage,
        pageSize,
        search: q,
        categoryId: cat,
        dosageForm: dos,
        status: st,
        sortBy: sb,
        sortOrder: so,
      });

      if (res.success && res.data) {
        setMedicines(res.data);
        if (res.totalCount !== undefined) setTotalCount(res.totalCount);
        if (res.totalPages !== undefined) setTotalPages(res.totalPages);
        setPage(newPage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    refreshMedicines(1, val, selectedCategory, selectedDosage, selectedStatus, sortBy, sortOrder);
  };

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    refreshMedicines(1, search, val, selectedDosage, selectedStatus, sortBy, sortOrder);
  };

  const handleDosageChange = (val: string) => {
    setSelectedDosage(val);
    refreshMedicines(1, search, selectedCategory, val, selectedStatus, sortBy, sortOrder);
  };

  const handleStatusChange = (val: string) => {
    setSelectedStatus(val);
    refreshMedicines(1, search, selectedCategory, selectedDosage, val, sortBy, sortOrder);
  };

  const handleOpenAdd = () => {
    setFeedback(null);
    setFormData({
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
      primaryUnitName: "Box",
      secondaryUnitName: "Strip",
      unitConversionRatio: 10,
      status: "ACTIVE",
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (med: MedicineRecord) => {
    setFeedback(null);
    setEditingMedicine(med);
    setFormData({
      brandName: med.brandName,
      genericName: med.genericName,
      strength: med.strength,
      dosageForm: med.dosageForm as any,
      categoryId: med.categoryId,
      supplierId: med.supplierId || "",
      unitTradePrice: med.unitTradePrice,
      unitMrp: med.unitMrp,
      wholesaleBasePrice: med.wholesaleBasePrice,
      vatPercent: med.vatPercent,
      storageCondition: med.storageCondition as any,
      reorderAlertLevel: med.reorderAlertLevel,
      isPrescriptionRequired: med.isPrescriptionRequired,
      isColdChain: med.isColdChain,
      isNarcotic: med.isNarcotic,
      primaryUnitName: med.primaryUnitName,
      secondaryUnitName: "Strip",
      unitConversionRatio: med.stripPerBox || 10,
      status: med.status as any,
    });
  };

  const handleCreateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const result = await createMedicineAction(formData);
    setIsSubmitting(false);

    if (result.success) {
      setFeedback({ type: "success", message: result.message || "Medicine registered." });
      setTimeout(() => {
        setIsAddOpen(false);
        setFeedback(null);
        refreshMedicines();
      }, 1000);
    } else {
      setFeedback({ type: "error", message: result.error || "Failed to create medicine." });
    }
  };

  const handleUpdateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedicine) return;
    setIsSubmitting(true);
    setFeedback(null);

    const result = await updateMedicineAction(editingMedicine.id, formData);
    setIsSubmitting(false);

    if (result.success) {
      setFeedback({ type: "success", message: result.message || "Medicine updated." });
      setTimeout(() => {
        setEditingMedicine(null);
        setFeedback(null);
        refreshMedicines();
      }, 1000);
    } else {
      setFeedback({ type: "error", message: result.error || "Failed to update medicine." });
    }
  };

  const handleToggleStatus = async (med: MedicineRecord) => {
    const nextStatus = med.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const res = await toggleMedicineStatusAction(med.id, nextStatus as any);
    if (res.success) {
      refreshMedicines();
    }
  };

  const columns: ColumnDef<MedicineRecord>[] = [
    {
      accessorKey: "brandName",
      header: "Brand & Generic Formulation",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-foreground flex items-center gap-1.5">
            <Link
              href={`/medicines/${row.original.id}`}
              className="text-primary hover:underline font-bold"
            >
              {row.original.brandName}
            </Link>
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
      header: "Stock (Batches)",
      cell: ({ row }) => {
        const stock = row.original.totalStockOnHand;
        const low = row.original.reorderAlertLevel;
        return (
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span
                className={`font-bold ${
                  stock === 0
                    ? "text-rose-600"
                    : stock <= low
                    ? "text-amber-600"
                    : "text-foreground"
                }`}
              >
                {stock.toLocaleString()} units
              </span>
              <Badge
                variant="secondary"
                className="text-[10px] font-medium px-2 py-0.5 h-5 whitespace-nowrap shrink-0 border border-border/50 bg-muted/80 text-muted-foreground"
              >
                {(row.original.batchesCount || 0) === 1
                  ? "1 batch"
                  : `${row.original.batchesCount || 0} batches`}
              </Badge>
            </div>
            {stock <= low && stock > 0 && (
              <div className="text-[10px] text-amber-600 font-medium">Low Stock Alert</div>
            )}
            {stock === 0 && (
              <div className="text-[10px] text-rose-600 font-medium">Out of Stock</div>
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
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={row.original.status === "ACTIVE" ? "success" : "secondary"}
          className="text-[10px]"
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-7 w-7"
            title="View Details & Batches"
          >
            <Link href={`/medicines/${row.original.id}`}>
              <Eye className="h-3.5 w-3.5 text-primary" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleOpenEdit(row.original)}
            className="h-7 w-7"
            title="Edit Medicine"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleToggleStatus(row.original)}
            className={`h-7 w-7 ${
              row.original.status === "ACTIVE"
                ? "text-amber-600 hover:text-amber-700"
                : "text-emerald-600 hover:text-emerald-700"
            }`}
            title={row.original.status === "ACTIVE" ? "Deactivate" : "Activate"}
          >
            <Power className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medicine Catalog & Master Data"
        description="Comprehensive master database of pharmaceutical drugs, generic formulations, packaging conversion ratios, and wholesale pricing."
        badge={<Badge variant="outline">Master Catalog</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" asChild className="h-9 text-xs gap-1.5">
              <Link href="/categories">
                <Boxes className="h-3.5 w-3.5" />
                Categories
              </Link>
            </Button>

            <Button onClick={handleOpenAdd} size="sm" className="h-9 text-xs gap-1.5 font-semibold">
              <Plus className="h-4 w-4" />
              Register New Medicine
            </Button>
          </div>
        }
      />

      {/* Search & Multi-Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 bg-card p-3 rounded-lg border">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by brand name, generic, DAR, SKU..."
            value={search}
            onChange={handleSearchChange}
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Dosage Form Filter */}
        <Select value={selectedDosage} onValueChange={handleDosageChange}>
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="All Dosage Forms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Dosage Forms</SelectItem>
            <SelectItem value="TABLET">Tablet</SelectItem>
            <SelectItem value="CAPSULE">Capsule</SelectItem>
            <SelectItem value="SYRUP">Syrup</SelectItem>
            <SelectItem value="INJECTION">Injection</SelectItem>
            <SelectItem value="OINTMENT">Ointment</SelectItem>
            <SelectItem value="SUSPENSION">Suspension</SelectItem>
            <SelectItem value="IV_INFUSION">IV Infusion</SelectItem>
            <SelectItem value="DROPS">Drops</SelectItem>
            <SelectItem value="INHALER">Inhaler</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={selectedStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active Only</SelectItem>
            <SelectItem value="INACTIVE">Inactive Only</SelectItem>
            <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Medicine Table */}
      <DataTable
        columns={columns}
        data={medicines}
        searchKey="brandName"
        searchPlaceholder="Filter listed brand names..."
      />

      {/* Pagination Controls */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <div>
          Showing {medicines.length} of {totalCount} total medicines (Page {page} of {totalPages || 1})
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshMedicines(page - 1)}
            disabled={page <= 1 || isLoading}
            className="h-8 text-xs gap-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshMedicines(page + 1)}
            disabled={page >= totalPages || isLoading}
            className="h-8 text-xs gap-1"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Add Medicine Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              Register New Medicine in Master Catalog
            </DialogTitle>
            <DialogDescription className="text-xs">
              Ensure accurate therapeutic classification, pricing, and packaging unit conversions.
            </DialogDescription>
          </DialogHeader>

          {feedback && (
            <div
              className={`p-3 rounded-lg text-xs font-medium ${
                feedback.type === "success"
                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                  : "bg-rose-500/10 text-rose-600 border border-rose-500/30"
              }`}
            >
              {feedback.message}
            </div>
          )}

          <form onSubmit={handleCreateMedicine} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Brand Name *</Label>
                <Input
                  required
                  placeholder="e.g. Napa Extra"
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Generic Formulation *</Label>
                <Input
                  required
                  placeholder="e.g. Paracetamol + Caffeine"
                  value={formData.genericName}
                  onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Strength *</Label>
                <Input
                  required
                  placeholder="e.g. 500mg + 65mg"
                  value={formData.strength}
                  onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Dosage Form</Label>
                <Select
                  value={formData.dosageForm}
                  onValueChange={(val: any) => setFormData({ ...formData, dosageForm: val })}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TABLET">Tablet</SelectItem>
                    <SelectItem value="CAPSULE">Capsule</SelectItem>
                    <SelectItem value="SYRUP">Syrup</SelectItem>
                    <SelectItem value="INJECTION">Injection</SelectItem>
                    <SelectItem value="OINTMENT">Ointment</SelectItem>
                    <SelectItem value="SUSPENSION">Suspension</SelectItem>
                    <SelectItem value="IV_INFUSION">IV Infusion</SelectItem>
                    <SelectItem value="DROPS">Drops</SelectItem>
                    <SelectItem value="INHALER">Inhaler</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Category *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select Category" />
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Manufacturer / Supplier</Label>
                <Select
                  value={formData.supplierId || ""}
                  onValueChange={(val) => setFormData({ ...formData, supplierId: val })}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select Manufacturer" />
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
                <Label className="text-xs">Storage Condition</Label>
                <Select
                  value={formData.storageCondition}
                  onValueChange={(val: any) =>
                    setFormData({
                      ...formData,
                      storageCondition: val,
                      isColdChain: val === "COLD_CHAIN_2_TO_8_C",
                      isNarcotic: val === "CONTROLLED_SUBSTANCE_NARCOTIC",
                    })
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ROOM_TEMPERATURE">Room Temperature (&lt;25°C)</SelectItem>
                    <SelectItem value="COLD_CHAIN_2_TO_8_C">Cold Chain (2°C - 8°C)</SelectItem>
                    <SelectItem value="CONTROLLED_SUBSTANCE_NARCOTIC">Narcotics Safe (Locked)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Wholesale Pricing Structure */}
            <div className="p-3 bg-muted/40 rounded-lg border space-y-3">
              <div className="text-xs font-bold text-foreground">Standard B2B Pricing Structure</div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Trade Price (TP) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={formData.unitTradePrice || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        unitTradePrice: parseFloat(e.target.value) || 0,
                        wholesaleBasePrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Maximum Retail Price (MRP) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={formData.unitMrp || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, unitMrp: parseFloat(e.target.value) || 0 })
                    }
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Min Reorder Level</Label>
                  <Input
                    type="number"
                    value={formData.reorderAlertLevel || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, reorderAlertLevel: parseInt(e.target.value) || 50 })
                    }
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Packaging Unit Conversion Ratios */}
            <div className="p-3 bg-muted/40 rounded-lg border space-y-3">
              <div className="text-xs font-bold text-foreground">Packaging Unit Hierarchy &amp; Conversion</div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Primary Unit (Base Selling)</Label>
                  <Input
                    placeholder="e.g. Box"
                    value={formData.primaryUnitName}
                    onChange={(e) =>
                      setFormData({ ...formData, primaryUnitName: e.target.value })
                    }
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Secondary Unit</Label>
                  <Input
                    placeholder="e.g. Strip"
                    value={formData.secondaryUnitName || "Strip"}
                    onChange={(e) =>
                      setFormData({ ...formData, secondaryUnitName: e.target.value })
                    }
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Units per Primary Box</Label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={formData.unitConversionRatio || 10}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        unitConversionRatio: parseInt(e.target.value) || 10,
                      })
                    }
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddOpen(false)}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-9 text-xs font-semibold" disabled={isSubmitting}>
                {isSubmitting ? "Registering..." : "Save to Catalog"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Medicine Dialog */}
      <Dialog open={!!editingMedicine} onOpenChange={(open) => !open && setEditingMedicine(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              Edit Medicine: {editingMedicine?.brandName}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Update drug pricing, formulation details, and category associations.
            </DialogDescription>
          </DialogHeader>

          {feedback && (
            <div
              className={`p-3 rounded-lg text-xs font-medium ${
                feedback.type === "success"
                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                  : "bg-rose-500/10 text-rose-600 border border-rose-500/30"
              }`}
            >
              {feedback.message}
            </div>
          )}

          <form onSubmit={handleUpdateMedicine} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Brand Name *</Label>
                <Input
                  required
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Generic Formulation *</Label>
                <Input
                  required
                  value={formData.genericName}
                  onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Strength *</Label>
                <Input
                  required
                  value={formData.strength}
                  onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Dosage Form</Label>
                <Select
                  value={formData.dosageForm}
                  onValueChange={(val: any) => setFormData({ ...formData, dosageForm: val })}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TABLET">Tablet</SelectItem>
                    <SelectItem value="CAPSULE">Capsule</SelectItem>
                    <SelectItem value="SYRUP">Syrup</SelectItem>
                    <SelectItem value="INJECTION">Injection</SelectItem>
                    <SelectItem value="OINTMENT">Ointment</SelectItem>
                    <SelectItem value="SUSPENSION">Suspension</SelectItem>
                    <SelectItem value="IV_INFUSION">IV Infusion</SelectItem>
                    <SelectItem value="DROPS">Drops</SelectItem>
                    <SelectItem value="INHALER">Inhaler</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Category *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
                >
                  <SelectTrigger className="h-9 text-xs">
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

            {/* Wholesale Pricing Structure */}
            <div className="p-3 bg-muted/40 rounded-lg border space-y-3">
              <div className="text-xs font-bold text-foreground">Standard Pricing Structure</div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Trade Price (TP) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    required
                    value={formData.unitTradePrice || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        unitTradePrice: parseFloat(e.target.value) || 0,
                        wholesaleBasePrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Maximum Retail Price (MRP) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    required
                    value={formData.unitMrp || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, unitMrp: parseFloat(e.target.value) || 0 })
                    }
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Min Reorder Level</Label>
                  <Input
                    type="number"
                    value={formData.reorderAlertLevel || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, reorderAlertLevel: parseInt(e.target.value) || 50 })
                    }
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingMedicine(null)}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-9 text-xs font-semibold" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
