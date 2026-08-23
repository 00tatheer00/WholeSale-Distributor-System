"use client";

import * as React from "react";
import Link from "next/link";
import {
  History,
  ArrowLeft,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  SlidersHorizontal,
  AlertTriangle,
  Clock,
  ShieldCheck,
  MapPin,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StockMovementRecord, StockMovementTypeEnum } from "@/types/inventory";
import { getStockMovementsAction } from "@/server/actions/inventory.actions";

interface MovementsClientProps {
  initialMovements: StockMovementRecord[];
}

export function MovementsClient({ initialMovements }: MovementsClientProps) {
  const [movements, setMovements] = React.useState<StockMovementRecord[]>(initialMovements);
  const [search, setSearch] = React.useState("");
  const [selectedType, setSelectedType] = React.useState("ALL");
  const [isLoading, setIsLoading] = React.useState(false);

  const refreshMovements = async (q = search, type = selectedType) => {
    setIsLoading(true);
    try {
      const res = await getStockMovementsAction({
        search: q,
        movementType: type,
        pageSize: 100,
      });

      if (res.success && res.data) {
        setMovements(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    refreshMovements(val, selectedType);
  };

  const handleTypeChange = (val: string) => {
    setSelectedType(val);
    refreshMovements(search, val);
  };

  const getMovementBadge = (type: StockMovementTypeEnum) => {
    switch (type) {
      case "PURCHASE_IN":
        return (
          <Badge variant="success" className="gap-1 text-[10px]">
            <ArrowDownLeft className="h-3 w-3" />
            PURCHASE IN
          </Badge>
        );
      case "SALE_OUT":
        return (
          <Badge variant="default" className="gap-1 text-[10px] bg-sky-600 hover:bg-sky-700">
            <ArrowUpRight className="h-3 w-3" />
            SALE OUT
          </Badge>
        );
      case "SALE_CANCEL_RETURN":
        return (
          <Badge variant="secondary" className="gap-1 text-[10px]">
            <RotateCcw className="h-3 w-3" />
            SALE CANCEL RETURN
          </Badge>
        );
      case "DAMAGE":
        return (
          <Badge variant="destructive" className="gap-1 text-[10px]">
            <AlertTriangle className="h-3 w-3" />
            DAMAGE WRITE-OFF
          </Badge>
        );
      case "EXPIRED":
        return (
          <Badge variant="destructive" className="gap-1 text-[10px]">
            <Clock className="h-3 w-3" />
            EXPIRED REMOVAL
          </Badge>
        );
      case "MANUAL_IN":
        return (
          <Badge variant="success" className="gap-1 text-[10px]">
            <SlidersHorizontal className="h-3 w-3" />
            MANUAL ADD
          </Badge>
        );
      case "MANUAL_OUT":
        return (
          <Badge variant="warning" className="gap-1 text-[10px]">
            <SlidersHorizontal className="h-3 w-3" />
            MANUAL DEDUCT
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px]">
            {type}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-9 w-9">
          <Link href="/inventory">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader
          title="Stock Movement Ledger"
          description="Complete immutable audit trail of all warehouse stock transactions, consignment intakes, wholesale shipments, and balance reconciliations."
          badge={<Badge variant="outline">Ledger M04-TX</Badge>}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-card p-3 rounded-lg border">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by Reference # (GRN, INV, ADJ), Batch #, Reason..."
            value={search}
            onChange={handleSearchChange}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <Select value={selectedType} onValueChange={handleTypeChange}>
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="All Movement Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Movement Types</SelectItem>
            <SelectItem value="PURCHASE_IN">Purchase In (GRN Consignment)</SelectItem>
            <SelectItem value="SALE_OUT">Sale Out (Order Dispatch)</SelectItem>
            <SelectItem value="SALE_CANCEL_RETURN">Sale Cancel Return</SelectItem>
            <SelectItem value="MANUAL_IN">Manual Stock Addition</SelectItem>
            <SelectItem value="MANUAL_OUT">Manual Stock Deduction</SelectItem>
            <SelectItem value="DAMAGE">Damage Write-Off</SelectItem>
            <SelectItem value="EXPIRED">Expired Removal</SelectItem>
            <SelectItem value="ADJUSTMENT">General Adjustment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Movement Ledger Table */}
      <Card className="border shadow-sm">
        <CardContent className="p-0">
          {movements.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center">
              <History className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <div className="font-semibold text-foreground">No stock movements found.</div>
              <div className="text-[11px] mt-1">Try adjusting your search query or movement type filter.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Medicine &amp; Batch</th>
                    <th className="p-3.5">Movement Type</th>
                    <th className="p-3.5 text-right">Quantity Delta</th>
                    <th className="p-3.5 text-center">Balance Impact</th>
                    <th className="p-3.5 text-right">Unit Cost</th>
                    <th className="p-3.5">Reference Voucher</th>
                    <th className="p-3.5">Audited Reason &amp; User</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {movements.map((mov) => (
                    <tr key={mov.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5 text-muted-foreground font-mono text-[11px]">
                        {formatDate(mov.createdAt)}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-foreground">{mov.medicineName}</div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                          <span>Batch: <strong>{mov.batchNumber}</strong></span>
                          <span>•</span>
                          <span>{mov.warehouseName}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        {getMovementBadge(mov.movementType)}
                      </td>
                      <td className="p-3.5 text-right font-extrabold font-mono text-sm">
                        <span className={mov.quantityDelta > 0 ? "text-emerald-600" : "text-rose-600"}>
                          {mov.quantityDelta > 0 ? `+${mov.quantityDelta}` : mov.quantityDelta}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-mono text-muted-foreground">
                        <span>{mov.quantityBefore}</span>
                        <span className="mx-1 text-primary font-bold">→</span>
                        <span className="font-bold text-foreground">{mov.quantityAfter}</span>
                      </td>
                      <td className="p-3.5 text-right text-muted-foreground font-medium">
                        {formatCurrency(mov.unitCostPrice)}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-foreground">
                        {mov.referenceNumber || "N/A"}
                      </td>
                      <td className="p-3.5">
                        <div className="text-foreground max-w-xs truncate font-medium">
                          {mov.reason || "Standard transactional ledger movement"}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Recorded by: {mov.userName || "System"}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
