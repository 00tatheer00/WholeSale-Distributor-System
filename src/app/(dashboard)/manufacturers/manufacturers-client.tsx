"use client";

import * as React from "react";
import {
  Factory,
  Plus,
  Search,
  Building2,
  Phone,
  Mail,
  MapPin,
  Pill,
  Edit2,
  Trash2,
  ShieldAlert,
  Power,
  CheckCircle2,
  AlertTriangle,
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
  createManufacturerAction,
  updateManufacturerAction,
  toggleManufacturerStatusAction,
  deleteManufacturerAction,
  getManufacturersAction,
} from "@/server/actions/manufacturer.actions";
import { ManufacturerInput } from "@/validations/manufacturer.schema";

interface ManufacturerRecord {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  country: string;
  isActive: boolean;
  medicinesCount: number;
  createdAt: string;
}

interface ManufacturersClientProps {
  initialManufacturers: ManufacturerRecord[];
}

export function ManufacturersClient({ initialManufacturers }: ManufacturersClientProps) {
  const [manufacturers, setManufacturers] = React.useState<ManufacturerRecord[]>(initialManufacturers);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Modal states
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<ManufacturerInput>({
    name: "",
    code: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    country: "Pakistan",
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  // Safe delete dialog state
  const [deleteCandidate, setDeleteCandidate] = React.useState<ManufacturerRecord | null>(null);
  const [deleteWarning, setDeleteWarning] = React.useState<string | null>(null);
  const [canDeactivateInstead, setCanDeactivateInstead] = React.useState(false);

  const fetchManufacturers = async () => {
    const res = await getManufacturersAction({
      search: searchQuery,
      isActive: statusFilter === "ALL" ? undefined : statusFilter === "ACTIVE",
    });
    if (res.success && res.data) {
      setManufacturers(res.data);
    }
  };

  React.useEffect(() => {
    fetchManufacturers();
  }, [searchQuery, statusFilter]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: "",
      code: `MFG-${Math.floor(100 + Math.random() * 900)}`,
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      country: "Pakistan",
      isActive: true,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (m: ManufacturerRecord) => {
    setEditingId(m.id);
    setFormData({
      name: m.name,
      code: m.code === "N/A" ? "" : m.code,
      contactPerson: m.contactPerson === "N/A" ? "" : m.contactPerson,
      phone: m.phone === "N/A" ? "" : m.phone,
      email: m.email === "N/A" ? "" : m.email,
      address: m.address === "N/A" ? "" : m.address,
      country: m.country || "Pakistan",
      isActive: m.isActive,
    });
    setIsFormOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const res = editingId
      ? await updateManufacturerAction(editingId, formData)
      : await createManufacturerAction(formData);

    setIsSubmitting(false);

    if (res.success) {
      setIsFormOpen(false);
      setFeedback({ type: "success", message: res.message || "Saved successfully." });
      fetchManufacturers();
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: "error", message: res.error || "Failed to save manufacturer." });
    }
  };

  const handleToggleStatus = async (m: ManufacturerRecord) => {
    const nextStatus = !m.isActive;
    const res = await toggleManufacturerStatusAction(m.id, nextStatus);
    if (res.success) {
      setFeedback({ type: "success", message: res.message || "Status updated." });
      fetchManufacturers();
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const initiateDelete = (m: ManufacturerRecord) => {
    setDeleteCandidate(m);
    setDeleteWarning(null);
    setCanDeactivateInstead(false);

    if (m.medicinesCount > 0) {
      setDeleteWarning(
        `This manufacturer cannot be permanently deleted because ${m.medicinesCount} active medicine catalog record(s) depend on it. You can safely Deactivate it instead to archive it from active operations.`
      );
      setCanDeactivateInstead(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;
    setIsSubmitting(true);

    const res = await deleteManufacturerAction(deleteCandidate.id);
    setIsSubmitting(false);

    if (res.success) {
      setDeleteCandidate(null);
      setFeedback({ type: "success", message: res.message || "Manufacturer deleted." });
      fetchManufacturers();
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
        title="Manufacturers"
        description="Pharmaceutical manufacturing laboratories and commercial drug formulation producers."
      >
        <Button onClick={handleOpenAdd} className="gap-2 shadow-sm font-semibold">
          <Plus className="h-4 w-4" />
          Add Manufacturer
        </Button>
      </PageHeader>

      {/* Global Feedback Alert */}
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

      {/* Filter and Search Bar */}
      <Card className="border shadow-none">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search manufacturer by name, code, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">Status:</Label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="h-9 px-3 rounded-lg border border-input bg-background text-xs"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Inactive Only</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manufacturers Table */}
      <Card className="border shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 text-muted-foreground font-semibold uppercase tracking-wider border-b">
              <tr>
                <th className="px-4 py-3">Manufacturer Name</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Contact Person</th>
                <th className="px-4 py-3">Phone & Email</th>
                <th className="px-4 py-3">Location / Address</th>
                <th className="px-4 py-3 text-center">Medicines</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {manufacturers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <Factory className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
                    <p className="font-semibold text-sm">No manufacturers found</p>
                    <p className="text-xs mt-1">Register pharmaceutical manufacturers to categorize catalog medicines.</p>
                    <Button onClick={handleOpenAdd} variant="outline" size="sm" className="mt-4 gap-1.5">
                      <Plus className="h-3.5 w-3.5" />
                      Add Manufacturer
                    </Button>
                  </td>
                </tr>
              ) : (
                manufacturers.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <Factory className="h-4 w-4 text-primary shrink-0" />
                        <span>{m.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-muted-foreground">{m.code}</td>
                    <td className="px-4 py-3.5 text-foreground">{m.contactPerson}</td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      <div>{m.phone}</div>
                      {m.email !== "N/A" && <div className="text-[11px] text-muted-foreground/80">{m.email}</div>}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground max-w-xs truncate">{m.address}</td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge variant="outline" className="font-semibold">
                        <Pill className="h-3 w-3 mr-1 text-primary" />
                        {m.medicinesCount}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge
                        className={
                          m.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-muted text-muted-foreground border-border"
                        }
                      >
                        {m.isActive ? "ACTIVE" : "INACTIVE"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(m)}
                          className="h-8 px-2 text-xs gap-1"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(m)}
                          className={`h-8 px-2 text-xs gap-1 ${
                            m.isActive ? "text-amber-600 hover:text-amber-700" : "text-emerald-600 hover:text-emerald-700"
                          }`}
                        >
                          <Power className="h-3.5 w-3.5" />
                          {m.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => initiateDelete(m)}
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

      {/* Add / Edit Manufacturer Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSubmitForm} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Factory className="h-5 w-5 text-primary" />
                {editingId ? "Edit Manufacturer" : "Add Pharmaceutical Manufacturer"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Register drug manufacturing companies, laboratories, and primary brand owners.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-1">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">
                  Manufacturer Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  placeholder="e.g. Getz Pharma, GSK Pakistan, Abbott Laboratories"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Manufacturer Code</Label>
                  <Input
                    placeholder="e.g. MFG-GETZ"
                    value={formData.code || ""}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="h-9 text-xs font-mono uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Country</Label>
                  <Input
                    placeholder="Pakistan"
                    value={formData.country || "Pakistan"}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Contact Person</Label>
                  <Input
                    placeholder="Representative name"
                    value={formData.contactPerson || ""}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Phone Number</Label>
                  <Input
                    placeholder="+92 300 1234567"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Email Address</Label>
                <Input
                  type="email"
                  placeholder="info@manufacturer.com"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Plant / Office Address</Label>
                <Input
                  placeholder="e.g. Korangi Industrial Area, Karachi"
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded text-primary h-4 w-4"
                  />
                  <span className="font-semibold">Active Manufacturer (Authorized for new medicines)</span>
                </label>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingId ? "Update Manufacturer" : "Register Manufacturer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Safe Delete & Deactivation Dialog */}
      <Dialog open={!!deleteCandidate} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <ShieldAlert className="h-5 w-5" />
              Delete Manufacturer Verification
            </DialogTitle>
            <DialogDescription className="text-xs">
              Confirm safety rules before removing manufacturer record.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <p className="text-sm font-semibold">
              Are you sure you want to delete manufacturer:{" "}
              <span className="text-primary font-bold">"{deleteCandidate?.name}"</span>?
            </p>

            {deleteWarning ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Historical Dependencies Detected
                </div>
                <p>{deleteWarning}</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                This manufacturer has no dependent medicine records and can be safely removed.
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
