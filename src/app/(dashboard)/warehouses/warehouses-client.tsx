"use client";

import * as React from "react";
import {
  Warehouse as WarehouseIcon,
  Plus,
  Search,
  MapPin,
  Boxes,
  Edit2,
  Trash2,
  Power,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Star,
  Layers,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  getWarehousesAction,
  createWarehouseAction,
  updateWarehouseAction,
  toggleWarehouseStatusAction,
  deleteWarehouseAction,
} from "@/server/actions/warehouse.actions";
import { WarehouseInput } from "@/validations/warehouse.schema";
import { formatCurrency } from "@/lib/utils";

interface WarehouseRecord {
  id: string;
  name: string;
  code: string;
  location: string;
  isDefault: boolean;
  isActive: boolean;
  batchesCount: number;
  totalUnitsOnHand: number;
  totalCostValue: number;
  totalTradeValue: number;
  hasHistory: boolean;
  createdAt: string;
}

interface WarehousesClientProps {
  initialWarehouses: WarehouseRecord[];
}

export function WarehousesClient({ initialWarehouses }: WarehousesClientProps) {
  const [warehouses, setWarehouses] = React.useState<WarehouseRecord[]>(initialWarehouses);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Modal state
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<WarehouseInput>({
    name: "",
    code: "",
    location: "",
    isDefault: false,
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  // Delete modal state
  const [deleteCandidate, setDeleteCandidate] = React.useState<WarehouseRecord | null>(null);
  const [deleteWarning, setDeleteWarning] = React.useState<string | null>(null);
  const [canDeactivateInstead, setCanDeactivateInstead] = React.useState(false);

  const fetchWarehouses = async () => {
    const res = await getWarehousesAction();
    if (res.success && res.data) {
      setWarehouses(res.data);
    }
  };

  const filteredWarehouses = warehouses.filter(
    (w) =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalFacilities = warehouses.length;
  const totalStockUnits = warehouses.reduce((acc, w) => acc + w.totalUnitsOnHand, 0);
  const totalStockValuation = warehouses.reduce((acc, w) => acc + w.totalCostValue, 0);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: "",
      code: `WH-${Math.floor(10 + Math.random() * 90)}`,
      location: "",
      isDefault: warehouses.length === 0,
      isActive: true,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (w: WarehouseRecord) => {
    setEditingId(w.id);
    setFormData({
      name: w.name,
      code: w.code,
      location: w.location === "Main Premises" ? "" : w.location,
      isDefault: w.isDefault,
      isActive: w.isActive,
    });
    setIsFormOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const res = editingId
      ? await updateWarehouseAction(editingId, formData)
      : await createWarehouseAction(formData);

    setIsSubmitting(false);

    if (res.success) {
      setIsFormOpen(false);
      setFeedback({ type: "success", message: res.message || "Warehouse saved successfully." });
      fetchWarehouses();
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: "error", message: res.error || "Failed to save warehouse." });
    }
  };

  const handleToggleStatus = async (w: WarehouseRecord) => {
    const nextStatus = !w.isActive;
    const res = await toggleWarehouseStatusAction(w.id, nextStatus);
    if (res.success) {
      setFeedback({ type: "success", message: res.message || "Status updated." });
      fetchWarehouses();
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const initiateDelete = (w: WarehouseRecord) => {
    setDeleteCandidate(w);
    setDeleteWarning(null);
    setCanDeactivateInstead(false);

    if (w.totalUnitsOnHand > 0) {
      setDeleteWarning(
        `This warehouse holds active inventory (${w.totalUnitsOnHand.toLocaleString()} units). You must transfer all stock to another warehouse before deletion, or Deactivate this facility.`
      );
      setCanDeactivateInstead(true);
    } else if (w.hasHistory) {
      setDeleteWarning(
        `Historical purchases and stock movements reference this warehouse. Please Deactivate it instead of permanently deleting.`
      );
      setCanDeactivateInstead(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;
    setIsSubmitting(true);

    const res = await deleteWarehouseAction(deleteCandidate.id);
    setIsSubmitting(false);

    if (res.success) {
      setDeleteCandidate(null);
      setFeedback({ type: "success", message: res.message || "Warehouse deleted." });
      fetchWarehouses();
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setDeleteWarning(res.error || "Failed to delete.");
      if (res.canDeactivate) {
        setCanDeactivateInstead(true);
      }
    }
  };

  const handleDeactivateFromDeleteModal = async () => {
    if (!deleteCandidate) return;
    await handleToggleStatus(deleteCandidate);
    setDeleteCandidate(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Warehouses & Storage Facilities"
        description="Physical distribution hubs, central warehouses, and secondary stock locations."
      >
        <Button onClick={handleOpenAdd} className="gap-2 shadow-sm font-semibold">
          <Plus className="h-4 w-4" />
          Add Warehouse
        </Button>
      </PageHeader>

      {/* Global Feedback */}
      {feedback && (
        <div
          className={`flex items-center gap-2 p-3.5 rounded-xl border text-sm font-medium transition-all ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border shadow-none">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Storage Facilities</p>
              <h3 className="text-xl font-bold text-foreground mt-0.5">{totalFacilities}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Active distribution points</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <WarehouseIcon className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-none">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Stock on Hand</p>
              <h3 className="text-xl font-bold text-foreground mt-0.5">{totalStockUnits.toLocaleString()} units</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Across all facilities</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
              <Boxes className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-none">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Inventory Cost Valuation</p>
              <h3 className="text-xl font-bold text-foreground mt-0.5">{formatCurrency(totalStockValuation)}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Total acquisition value</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="border shadow-none">
        <CardContent className="p-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search warehouse by name, code, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Warehouses Table */}
      <Card className="border shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 text-muted-foreground font-semibold uppercase tracking-wider border-b">
              <tr>
                <th className="px-4 py-3">Warehouse Name</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Physical Address / City</th>
                <th className="px-4 py-3 text-center">Batches</th>
                <th className="px-4 py-3 text-right">Units on Hand</th>
                <th className="px-4 py-3 text-right">Inventory Valuation</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredWarehouses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <WarehouseIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
                    <p className="font-semibold text-sm">No warehouses found</p>
                    <p className="text-xs mt-1">Add storage facilities to allocate incoming purchase consignments.</p>
                    <Button onClick={handleOpenAdd} variant="outline" size="sm" className="mt-4 gap-1.5">
                      <Plus className="h-3.5 w-3.5" />
                      Add Warehouse
                    </Button>
                  </td>
                </tr>
              ) : (
                filteredWarehouses.map((w) => (
                  <tr key={w.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <WarehouseIcon className="h-4 w-4 text-primary shrink-0" />
                        <span>{w.name}</span>
                        {w.isDefault && (
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] gap-1 font-semibold">
                            <Star className="h-3 w-3 fill-primary" />
                            DEFAULT
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-muted-foreground">{w.code}</td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                        <span>{w.location}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono">{w.batchesCount}</td>
                    <td className="px-4 py-3.5 text-right font-bold">{w.totalUnitsOnHand.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(w.totalCostValue)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge
                        className={
                          w.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-muted text-muted-foreground border-border"
                        }
                      >
                        {w.isActive ? "ACTIVE" : "INACTIVE"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(w)}
                          className="h-8 px-2 text-xs gap-1"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(w)}
                          className={`h-8 px-2 text-xs gap-1 ${
                            w.isActive ? "text-amber-600 hover:text-amber-700" : "text-emerald-600 hover:text-emerald-700"
                          }`}
                        >
                          <Power className="h-3.5 w-3.5" />
                          {w.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => initiateDelete(w)}
                          className="h-8 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit Warehouse Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSubmitForm} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <WarehouseIcon className="h-5 w-5 text-primary" />
                {editingId ? "Edit Storage Facility" : "Add Warehouse Facility"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Physical distribution center, cold room storage, or regional dispatch hub.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-1">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">
                  Facility Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  placeholder="e.g. Central Distribution Hub, Lahore Depot"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">
                  Warehouse Code <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  placeholder="e.g. WH-KHI-01, WH-LHR-02"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="h-9 text-xs font-mono uppercase"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Physical Location / Address</Label>
                <Input
                  placeholder="e.g. Plot 45, Korangi Industrial Area, Karachi"
                  value={formData.location || ""}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="pt-2 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="rounded text-primary h-4 w-4"
                  />
                  <span className="font-semibold">Set as Primary Default Warehouse (Used for auto-allocation)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded text-primary h-4 w-4"
                  />
                  <span className="font-semibold">Active Facility (Available for purchase intake & billing)</span>
                </label>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingId ? "Update Warehouse" : "Save Warehouse"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Safe Deletion & Dependency Dialog */}
      <Dialog open={!!deleteCandidate} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <ShieldAlert className="h-5 w-5" />
              Delete Warehouse Verification
            </DialogTitle>
            <DialogDescription className="text-xs">
              Confirm inventory dependencies before removing storage facility.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <p className="text-sm font-semibold">
              Are you sure you want to delete warehouse:{" "}
              <span className="text-primary font-bold">"{deleteCandidate?.name}"</span>?
            </p>

            {deleteWarning ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Inventory Dependencies Detected
                </div>
                <p>{deleteWarning}</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                This warehouse has no active stock or transaction history and can be safely deleted.
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setDeleteCandidate(null)}>
              Cancel
            </Button>
            {canDeactivateInstead ? (
              <Button
                variant="default"
                size="sm"
                onClick={handleDeactivateFromDeleteModal}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Deactivate Instead (Recommended)
              </Button>
            ) : (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Deleting..." : "Permanently Delete"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
