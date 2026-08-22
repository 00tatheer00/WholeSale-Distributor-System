"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { FileText, Printer, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { InvoicePrintModal, InvoicePrintData } from "@/components/shared/invoice-print-modal";

interface InvoicesClientProps {
  initialInvoices: any[];
}

export function InvoicesClient({ initialInvoices }: InvoicesClientProps) {
  const [printInvoice, setPrintInvoice] = React.useState<InvoicePrintData | null>(null);
  const [isPrintOpen, setIsPrintOpen] = React.useState(false);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "Invoice #",
      cell: ({ row }) => (
        <div className="space-y-0.5 font-mono">
          <div className="font-bold text-foreground">{row.original.invoiceNumber}</div>
          <div className="text-[11px] text-muted-foreground">{row.original.challanNumber}</div>
        </div>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Customer Pharmacy",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-foreground">{row.original.customerName}</div>
          <div className="text-[11px] text-muted-foreground">{row.original.salesmanName}</div>
        </div>
      ),
    },
    {
      accessorKey: "issueDate",
      header: "Date Issued",
      cell: ({ row }) => (
        <div className="space-y-0.5 text-xs">
          <div>{formatDate(row.original.issueDate)}</div>
          <div className="text-[11px] text-muted-foreground">Due: {formatDate(row.original.dueDate)}</div>
        </div>
      ),
    },
    {
      accessorKey: "grandTotal",
      header: "Grand Total",
      cell: ({ row }) => (
        <span className="font-bold text-foreground">
          {formatCurrency(row.original.grandTotal)}
        </span>
      ),
    },
    {
      accessorKey: "cogsTotal",
      header: "COGS",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">
          {formatCurrency(row.original.cogsTotal)}
        </span>
      ),
    },
    {
      accessorKey: "grossProfit",
      header: "Gross Margin",
      cell: ({ row }) => (
        <span className="font-semibold text-emerald-600">
          +{formatCurrency(row.original.grossProfit)}
        </span>
      ),
    },
    {
      accessorKey: "dueAmount",
      header: "Outstanding Due",
      cell: ({ row }) => (
        <span className={`font-semibold ${row.original.dueAmount > 0 ? "text-amber-600" : "text-emerald-600"}`}>
          {formatCurrency(row.original.dueAmount)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={row.original.status === "PAID" ? "success" : "warning"}
          className="text-[10px]"
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Print / PDF",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setPrintInvoice({
              ...row.original,
              company: {
                name: "Apex Pharma Distributors Ltd.",
                tradeLicenseNo: "TRAD-DH-2024-8849",
                drugLicenseNo: "DL-DH-09182-W",
                taxIdTin: "8291039182",
                email: "info@apexpharmadist.com",
                phone: "+880 1711 000111",
                address: "Plot 14, Commercial Zone, Tejgaon Industrial Area, Dhaka",
              },
              customer: {
                tradeName: row.original.customerName,
                address: "Commercial Pharmacy Route",
                drugLicenseNo: "DL-DH-84910",
              },
            });
            setIsPrintOpen(true);
          }}
          className="h-8 px-2 text-xs gap-1"
        >
          <Printer className="h-3.5 w-3.5" />
          Print
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wholesale Tax Invoicing & Challans"
        description="Immutable billing register, batch-specific COGS tracking, trade discount audits, delivery challan numbers, and printable invoices."
        badge={<Badge variant="outline">Module M08</Badge>}
      />

      <DataTable
        columns={columns}
        data={initialInvoices}
        searchKey="invoiceNumber"
        searchPlaceholder="Search invoice #, challan # or customer..."
      />

      <InvoicePrintModal
        open={isPrintOpen}
        onOpenChange={setIsPrintOpen}
        invoice={printInvoice}
      />
    </div>
  );
}
