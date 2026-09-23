"use client";

import * as React from "react";
import {
  ArrowLeftRight,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  Filter,
  Package,
  Plus,
  Search,
  Warehouse as WarehouseIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createStockTransferAction,
  getTransferEligibleBatchesAction,
  getStockTransfersAction,
} from "@/server/actions/transfer.actions";
import { formatDate, formatDateTime } from "@/lib/utils";

interface TransfersClientProps {
  initialTransfers: any[];
  warehouses: any[];
}

export function TransfersClient({
  initialTransfers,
  warehouses,
}: TransfersClientProps) {
  const [transfers, setTransfers] = React.useState(initialTransfers);
  const [search, setSearch] = React.useState("");
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = React.useState("ALL");

  // Transfer Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [loadingBatches, setLoadingBatches] = React.useState(false);
  const [eligibleBatches, setEligibleBatches] = React.useState<any[]>([]);

  // Form fields
  const [sourceWarehouseId, setSourceWarehouseId] = React.useState("");
  const [destWarehouseId, setDestWarehouseId] = React.useState("");
  const [selectedBatchId, setSelectedBatchId] = React.useState("");
  const [transferQuantity, setTransferQuantity] = React.useState<number | "">("");
  const [destLocation, setDestLocation] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  // Selected batch reference
  const selectedBatch = React.useMemo(() => {
    return eligibleBatches.find((b) => b.id === selectedBatchId);
  }, [eligibleBatches, selectedBatchId]);

  // Handle source warehouse change
  const handleSourceWarehouseChange = async (whId: string) => {
    setSourceWarehouseId(whId);
    setSelectedBatchId("");
    setTransferQuantity("");
    setEligibleBatches([]);

    if (destWarehouseId === whId) {
      setDestWarehouseId("");
    }

    if (whId) {
      setLoadingBatches(true);
      const res = await getTransferEligibleBatchesAction(whId);
      if (res.success && res.data) {
        setEligibleBatches(res.data);
      }
      setLoadingBatches(false);
    }
  };

  const handleOpenModal = () => {
    setFormError(null);
    setSourceWarehouseId("");
    setDestWarehouseId("");
    setSelectedBatchId("");
    setTransferQuantity("");
    setDestLocation("");
    setNotes("");
    setEligibleBatches([]);
    setIsModalOpen(true);
  };

  const handleSubmitTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!sourceWarehouseId) {
      setFormError("Please select a source warehouse.");
      return;
    }
    if (!destWarehouseId) {
      setFormError("Please select a destination warehouse.");
      return;
    }
    if (sourceWarehouseId === destWarehouseId) {
      setFormError("Source and destination warehouses cannot be the same.");
      return;
    }
    if (!selectedBatchId || !selectedBatch) {
      setFormError("Please select a medicine batch to transfer.");
      return;
    }
    const qty = Number(transferQuantity);
    if (!qty || qty <= 0) {
      setFormError("Transfer quantity must be a positive number.");
      return;
    }
    if (qty > selectedBatch.quantityAvailable) {
      setFormError(
        `Quantity cannot exceed available stock (${selectedBatch.quantityAvailable} units).`
      );
      return;
    }

    setSubmitting(true);
    const res = await createStockTransferAction({
      sourceWarehouseId,
      destWarehouseId,
      medicineId: selectedBatch.medicineId,
      batchId: selectedBatch.id,
      quantity: qty,
      destinationLocation: destLocation.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setSubmitting(false);

    if (res.success) {
      setIsModalOpen(false);
      setFeedback({ type: "success", text: res.message || "Stock transfer executed successfully!" });
      // Refresh list
      const updated = await getStockTransfersAction();
      if (updated.success && updated.data) {
        setTransfers(updated.data);
      }
    } else {
      setFormError(res.error || "Failed to complete transfer.");
    }
  };

  // Filtered transfers
  const filteredTransfers = React.useMemo(() => {
    return transfers.filter((t) => {
      const matchesSearch =
        search === "" ||
        t.transferNumber?.toLowerCase().includes(search.toLowerCase()) ||
        t.medicine?.brandName?.toLowerCase().includes(search.toLowerCase()) ||
        t.batch?.batchNumber?.toLowerCase().includes(search.toLowerCase());

      const matchesWarehouse =
        selectedWarehouseFilter === "ALL" ||
        t.sourceWarehouseId === selectedWarehouseFilter ||
        t.destWarehouseId === selectedWarehouseFilter;

      return matchesSearch && matchesWarehouse;
    });
  }, [transfers, search, selectedWarehouseFilter]);

  const totalTransfers = transfers.length;
  const totalUnitsTransferred = transfers.reduce((acc, t) => acc + (t.quantity || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ArrowLeftRight className="h-6 w-6 text-teal-600" />
            Stock Transfers
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Safely transfer medicine batches between warehouses and storage locations with automatic double-entry inventory tracking.
          </p>
        </div>
        <Button
          onClick={handleOpenModal}
          className="bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-sm flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Initiate Stock Transfer
        </Button>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4" />
            {feedback.text}
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Transfers Executed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalTransfers}</div>
            <p className="text-xs text-slate-500 mt-1">Full audit history preserved</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Units Relocated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">
              {totalUnitsTransferred.toLocaleString()} <span className="text-sm font-normal text-slate-500">units</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Across all storage facilities</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Storage Facilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{warehouses.length}</div>
            <p className="text-xs text-slate-500 mt-1">Available for stock distribution</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by Transfer #, Medicine, or Batch #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 border-slate-200 focus:border-teal-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <Select
            value={selectedWarehouseFilter}
            onValueChange={setSelectedWarehouseFilter}
          >
            <SelectTrigger className="w-[200px] h-9 border-slate-200 text-xs">
              <SelectValue placeholder="All Warehouses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Warehouses</SelectItem>
              {warehouses.map((wh) => (
                <SelectItem key={wh.id} value={wh.id}>
                  {wh.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Transfer History Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-200 py-3 px-4">
          <CardTitle className="text-sm font-semibold text-slate-800 flex items-center justify-between">
            <span>Transfer History & Ledger</span>
            <span className="text-xs font-normal text-slate-500">
              Showing {filteredTransfers.length} of {transfers.length} records
            </span>
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="font-semibold text-xs text-slate-600">Transfer #</TableHead>
                <TableHead className="font-semibold text-xs text-slate-600">Date & Time</TableHead>
                <TableHead className="font-semibold text-xs text-slate-600">Medicine</TableHead>
                <TableHead className="font-semibold text-xs text-slate-600">Batch #</TableHead>
                <TableHead className="font-semibold text-xs text-slate-600">Source Warehouse</TableHead>
                <TableHead className="font-semibold text-xs text-slate-600 text-center">→</TableHead>
                <TableHead className="font-semibold text-xs text-slate-600">Destination</TableHead>
                <TableHead className="font-semibold text-xs text-slate-600 text-right">Quantity</TableHead>
                <TableHead className="font-semibold text-xs text-slate-600">Initiator</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransfers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ArrowLeftRight className="h-8 w-8 text-slate-300" />
                      <p className="text-sm font-medium">No stock transfers found</p>
                      <p className="text-xs text-slate-400">
                        {search || selectedWarehouseFilter !== "ALL"
                          ? "Try clearing your search filters."
                          : "Click 'Initiate Stock Transfer' to move inventory between facilities."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransfers.map((t) => (
                  <TableRow key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="font-mono text-xs font-semibold text-teal-700">
                      {t.transferNumber}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 whitespace-nowrap">
                      {formatDateTime(t.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-semibold text-slate-900">
                        {t.medicine?.brandName}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                        {t.medicine?.genericName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[11px] bg-slate-50">
                        {t.batch?.batchNumber}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-slate-700">
                      {t.sourceWarehouse?.name}
                    </TableCell>
                    <TableCell className="text-center text-teal-600">
                      <ArrowRight className="h-4 w-4 mx-auto inline" />
                    </TableCell>
                    <TableCell className="text-xs font-medium text-emerald-700">
                      {t.destWarehouse?.name}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-slate-900 text-right">
                      {t.quantity.toLocaleString()} units
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {t.createdBy?.name || t.createdBy?.username || "System"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Initiate Transfer Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <ArrowLeftRight className="h-5 w-5 text-teal-600" />
              Initiate Inter-Warehouse Transfer
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Relocate active stock from one warehouse to another. Inventory records and stock movements will be updated atomically.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs font-medium text-rose-700">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmitTransfer} className="space-y-4 pt-2">
            {/* Source & Destination Facility Selectors */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Source Warehouse *
                </Label>
                <Select
                  value={sourceWarehouseId}
                  onValueChange={handleSourceWarehouseChange}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select Origin" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((wh) => (
                      <SelectItem key={wh.id} value={wh.id}>
                        {wh.name} {wh.isDefault ? "(Default)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <WarehouseIcon className="h-3.5 w-3.5 text-teal-600" />
                  Destination Godown / Warehouse *
                </Label>
                <Select
                  value={destWarehouseId}
                  onValueChange={setDestWarehouseId}
                  disabled={!sourceWarehouseId}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select Destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses
                      .filter((wh) => wh.id !== sourceWarehouseId)
                      .map((wh) => (
                        <SelectItem key={wh.id} value={wh.id}>
                          {wh.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Batch Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-slate-700">
                  Select Medicine Batch to Move *
                </Label>
                {loadingBatches && (
                  <span className="text-[11px] text-teal-600 animate-pulse">
                    Loading warehouse stock...
                  </span>
                )}
              </div>

              <Select
                value={selectedBatchId}
                onValueChange={setSelectedBatchId}
                disabled={!sourceWarehouseId || loadingBatches || eligibleBatches.length === 0}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue
                    placeholder={
                      !sourceWarehouseId
                        ? "Select source warehouse first"
                        : eligibleBatches.length === 0
                        ? "No available stock in this warehouse"
                        : "Select batch to transfer"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {eligibleBatches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.medicine?.brandName} — Batch #{b.batchNumber} ({b.quantityAvailable} avail)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Batch Details Callout */}
            {selectedBatch && (
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-md text-xs space-y-1 text-teal-900">
                <div className="font-semibold flex items-center justify-between">
                  <span>{selectedBatch.medicine?.brandName}</span>
                  <span className="text-teal-700 font-mono">Batch #{selectedBatch.batchNumber}</span>
                </div>
                <div className="text-[11px] text-teal-800">
                  Generic: {selectedBatch.medicine?.genericName} • Strength: {selectedBatch.medicine?.strength || "N/A"}
                </div>
                <div className="flex justify-between pt-1 border-t border-teal-200/60 text-[11px]">
                  <span>Available to Move: <strong>{selectedBatch.quantityAvailable} units</strong></span>
                  <span>Expires: {formatDate(selectedBatch.expiryDate)}</span>
                </div>
              </div>
            )}

            {/* Quantity & Location */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Transfer Quantity *
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={selectedBatch ? selectedBatch.quantityAvailable : 999999}
                  placeholder="e.g. 50"
                  value={transferQuantity}
                  onChange={(e) =>
                    setTransferQuantity(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="h-9 text-xs"
                  disabled={!selectedBatch}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Destination Location (Optional)
                </Label>
                <Input
                  placeholder="e.g. Rack B, Shelf 2"
                  value={destLocation}
                  onChange={(e) => setDestLocation(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Transfer Reason / Notes (Optional)
              </Label>
              <Textarea
                placeholder="e.g. Rebalancing regional warehouse stock"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="text-xs resize-none"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
                className="text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || !selectedBatch || !transferQuantity}
                className="text-xs h-9 bg-teal-600 hover:bg-teal-700 text-white font-medium"
              >
                {submitting ? "Processing Transfer..." : "Confirm & Transfer Stock"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
