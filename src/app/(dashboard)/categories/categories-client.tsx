"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Layers,
  Plus,
  Search,
  Edit,
  Power,
  Pill,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CategoryRecord } from "@/types/models";
import { categoryFormSchema, CategoryFormValues } from "@/validations/category.schema";
import {
  createCategoryAction,
  updateCategoryAction,
  toggleCategoryStatusAction,
  deleteCategoryAction,
  getCategoriesAction,
} from "@/server/actions/category.actions";

interface CategoriesClientProps {
  initialCategories: CategoryRecord[];
}

export function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const [categories, setCategories] = React.useState<CategoryRecord[]>(initialCategories);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [isLoading, setIsLoading] = React.useState(false);

  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<CategoryRecord | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);

  // React Hook Form for Create / Edit
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      isActive: true,
    },
  });

  const refreshList = async (q = search, st = statusFilter) => {
    setIsLoading(true);
    try {
      const res = await getCategoriesAction(q, st);
      if (res.success && res.data) {
        setCategories(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    refreshList(val, statusFilter);
  };

  const handleStatusChange = (val: string) => {
    const st = val as "ALL" | "ACTIVE" | "INACTIVE";
    setStatusFilter(st);
    refreshList(search, st);
  };

  const handleOpenCreate = () => {
    setFormError(null);
    reset({
      name: "",
      code: "",
      description: "",
      isActive: true,
    });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (category: CategoryRecord) => {
    setFormError(null);
    setEditingCategory(category);
    setValue("name", category.name);
    setValue("code", category.code || "");
    setValue("description", category.description || "");
    setValue("isActive", category.isActive);
  };

  const onSubmitCreate = async (values: CategoryFormValues) => {
    setFormError(null);
    const res = await createCategoryAction(values);
    if (!res.success) {
      setFormError(res.error || "Failed to create category");
      return;
    }
    setIsCreateOpen(false);
    setActionMessage(`Category "${values.name}" created successfully.`);
    setTimeout(() => setActionMessage(null), 3000);
    refreshList();
  };

  const onSubmitEdit = async (values: CategoryFormValues) => {
    if (!editingCategory) return;
    setFormError(null);
    const res = await updateCategoryAction(editingCategory.id, values);
    if (!res.success) {
      setFormError(res.error || "Failed to update category");
      return;
    }
    setEditingCategory(null);
    setActionMessage(`Category "${values.name}" updated successfully.`);
    setTimeout(() => setActionMessage(null), 3000);
    refreshList();
  };

  const handleToggleStatus = async (category: CategoryRecord) => {
    const newStatus = !category.isActive;
    await toggleCategoryStatusAction(category.id, newStatus);
    setActionMessage(`Category "${category.name}" is now ${newStatus ? "ACTIVE" : "INACTIVE"}.`);
    setTimeout(() => setActionMessage(null), 3000);
    refreshList();
  };

  const handleDeleteCategory = async (category: CategoryRecord) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) return;
    const res = await deleteCategoryAction(category.id);
    if (!res.success) {
      alert(res.error);
      return;
    }
    setActionMessage(`Category "${category.name}" removed.`);
    setTimeout(() => setActionMessage(null), 3000);
    refreshList();
  };

  const totalActive = categories.filter((c) => c.isActive).length;
  const totalMedicines = categories.reduce((sum, c) => sum + (c.medicineCount || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medicine Categories"
        description="Therapeutic classifications, pharmacological categories, and master drug groupings."
        badge={<Badge variant="outline">Master Catalog</Badge>}
        actions={
          <Button onClick={handleOpenCreate} size="sm" className="h-9 text-xs gap-1.5 font-semibold">
            <Plus className="h-4 w-4" />
            Add New Category
          </Button>
        }
      />

      {actionMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-medium animate-in fade-in">
          {actionMessage}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border border-border/70 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground uppercase">Total Categories</div>
              <div className="text-2xl font-extrabold text-foreground mt-1">{categories.length}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground uppercase">Active Categories</div>
              <div className="text-2xl font-extrabold text-emerald-600 mt-1">{totalActive}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600">
              <Power className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground uppercase">Linked Medicines</div>
              <div className="text-2xl font-extrabold text-violet-600 mt-1">{totalMedicines}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-violet-500/10 text-violet-600">
              <Pill className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3 rounded-lg border">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search category by name or code..."
            value={search}
            onChange={handleSearchChange}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Status:</span>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-36 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              <SelectItem value="ACTIVE">Active Only</SelectItem>
              <SelectItem value="INACTIVE">Inactive Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Categories Table */}
      <Card className="border shadow-sm">
        <CardContent className="p-0">
          {categories.length === 0 ? (
            <div className="p-10 text-center text-xs text-muted-foreground">
              No categories found matching your query.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-3.5">Category Name</th>
                    <th className="p-3.5">Code</th>
                    <th className="p-3.5">Description</th>
                    <th className="p-3.5 text-center">Medicines</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5 font-bold text-foreground flex items-center gap-2">
                        <Layers className="h-4 w-4 text-primary shrink-0" />
                        <span>{cat.name}</span>
                      </td>
                      <td className="p-3.5 font-mono text-muted-foreground">
                        {cat.code || "—"}
                      </td>
                      <td className="p-3.5 text-muted-foreground max-w-xs truncate">
                        {cat.description || "No description"}
                      </td>
                      <td className="p-3.5 text-center font-bold">
                        <Badge variant="outline" className="text-[11px]">
                          {cat.medicineCount || 0} SKUs
                        </Badge>
                      </td>
                      <td className="p-3.5 text-center">
                        <Badge
                          variant={cat.isActive ? "success" : "secondary"}
                          className="text-[10px]"
                        >
                          {cat.isActive ? "ACTIVE" : "INACTIVE"}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(cat)}
                          className="h-7 w-7"
                          title="Edit Category"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(cat)}
                          className={`h-7 w-7 ${
                            cat.isActive ? "text-amber-600 hover:text-amber-700" : "text-emerald-600 hover:text-emerald-700"
                          }`}
                          title={cat.isActive ? "Deactivate Category" : "Activate Category"}
                        >
                          <Power className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCategory(cat)}
                          className="h-7 w-7 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          title="Delete Category"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Category Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Add Medicine Category
            </DialogTitle>
            <DialogDescription className="text-xs">
              Define a new therapeutic or pharmacological classification.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmitCreate)} className="space-y-3.5 py-1">
            <div className="space-y-1">
              <Label className="text-xs">Category Name *</Label>
              <Input
                {...register("name")}
                placeholder="e.g. Antibiotics & Anti-infectives"
                className="h-9 text-xs"
              />
              {errors.name && <p className="text-[11px] text-rose-600">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Short Code (Optional)</Label>
              <Input
                {...register("code")}
                placeholder="e.g. ANTIBIO"
                className="h-9 text-xs uppercase"
              />
              {errors.code && <p className="text-[11px] text-rose-600">{errors.code.message}</p>}
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Textarea
                {...register("description")}
                placeholder="Describe therapeutic usage or indications..."
                className="text-xs resize-none"
                rows={3}
              />
              {errors.description && <p className="text-[11px] text-rose-600">{errors.description.message}</p>}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateOpen(false)}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-9 text-xs font-semibold" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Category Modal */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Edit className="h-4 w-4 text-primary" />
              Edit Category: {editingCategory?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Update category naming and classification description.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-3.5 py-1">
            <div className="space-y-1">
              <Label className="text-xs">Category Name *</Label>
              <Input
                {...register("name")}
                className="h-9 text-xs"
              />
              {errors.name && <p className="text-[11px] text-rose-600">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Short Code</Label>
              <Input
                {...register("code")}
                className="h-9 text-xs uppercase"
              />
              {errors.code && <p className="text-[11px] text-rose-600">{errors.code.message}</p>}
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Textarea
                {...register("description")}
                className="text-xs resize-none"
                rows={3}
              />
              {errors.description && <p className="text-[11px] text-rose-600">{errors.description.message}</p>}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingCategory(null)}
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
