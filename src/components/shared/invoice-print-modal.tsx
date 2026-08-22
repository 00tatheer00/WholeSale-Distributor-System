"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, Building2, CheckCircle2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface InvoicePrintItem {
  medicineName: string;
  genericName?: string;
  dosageForm?: string;
  batchNumber: string;
  expiryDate: string | Date;
  quantity: number;
  bonusQuantity?: number;
  unitPrice: number;
  tradePrice?: number;
  mrp?: number;
  discountPercent?: number;
  totalAmount: number;
}

export interface InvoicePrintData {
  invoiceNumber: string;
  issueDate: string | Date;
  dueDate: string | Date;
  challanNumber?: string;
  company: {
    name: string;
    tradeLicenseNo?: string;
    drugLicenseNo?: string;
    taxIdTin?: string;
    email?: string;
    phone?: string;
    address?: string;
    invoiceFooterText?: string;
  };
  customer: {
    tradeName: string;
    proprietorName?: string;
    drugLicenseNo?: string;
    phone?: string;
    address?: string;
    tinNumber?: string;
  };
  salesmanName?: string;
  items: InvoicePrintItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  deliveryCharge?: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  status: "ISSUED" | "PAID" | "CANCELLED";
}

interface InvoicePrintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: InvoicePrintData | null;
}

export function InvoicePrintModal({
  open,
  onOpenChange,
  invoice,
}: InvoicePrintModalProps) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 print:p-0 print:max-w-none">
        {/* Modal Toolbar (hidden in print) */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/95 px-6 py-3 backdrop-blur print:hidden">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-base font-semibold">
              Wholesale Tax Invoice: {invoice.invoiceNumber}
            </DialogTitle>
            <Badge
              variant={
                invoice.status === "PAID"
                  ? "success"
                  : invoice.status === "ISSUED"
                  ? "warning"
                  : "destructive"
              }
            >
              {invoice.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handlePrint} className="gap-1.5">
              <Printer className="h-4 w-4" />
              Print / Save PDF
            </Button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="p-8 print:p-6 text-foreground bg-card space-y-6 font-sans">
          {/* Header Section */}
          <div className="flex justify-between items-start border-b pb-6">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold tracking-tight text-primary">
                  {invoice.company.name}
                </h1>
              </div>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                {invoice.company.address}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground mt-2">
                {invoice.company.drugLicenseNo && (
                  <span><strong>Drug Lic:</strong> {invoice.company.drugLicenseNo}</span>
                )}
                {invoice.company.tradeLicenseNo && (
                  <span><strong>Trade Lic:</strong> {invoice.company.tradeLicenseNo}</span>
                )}
                {invoice.company.taxIdTin && (
                  <span><strong>TIN:</strong> {invoice.company.taxIdTin}</span>
                )}
                {invoice.company.phone && (
                  <span><strong>Tel:</strong> {invoice.company.phone}</span>
                )}
              </div>
            </div>

            <div className="text-right space-y-1">
              <span className="inline-block px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary rounded">
                Wholesale Tax Invoice
              </span>
              <div className="text-sm font-bold font-mono pt-1">
                {invoice.invoiceNumber}
              </div>
              <div className="text-xs text-muted-foreground">
                Date: {formatDate(invoice.issueDate)}
              </div>
              <div className="text-xs text-muted-foreground">
                Due: {formatDate(invoice.dueDate)}
              </div>
              {invoice.challanNumber && (
                <div className="text-xs text-muted-foreground">
                  Challan #: <span className="font-mono">{invoice.challanNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Billed To / Shipping Address */}
          <div className="grid grid-cols-2 gap-6 bg-muted/30 p-4 rounded-lg text-xs">
            <div>
              <div className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Billed To (Customer Pharmacy)
              </div>
              <div className="font-semibold text-sm text-foreground">
                {invoice.customer.tradeName}
              </div>
              {invoice.customer.proprietorName && (
                <div className="text-muted-foreground">
                  Attn: {invoice.customer.proprietorName}
                </div>
              )}
              <div className="text-muted-foreground mt-1">
                {invoice.customer.address}
              </div>
              <div className="mt-1 space-x-3 text-[11px] text-muted-foreground">
                {invoice.customer.drugLicenseNo && (
                  <span><strong>Drug Lic:</strong> {invoice.customer.drugLicenseNo}</span>
                )}
                {invoice.customer.phone && (
                  <span><strong>Phone:</strong> {invoice.customer.phone}</span>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Sales & Delivery Reference
              </div>
              <div className="text-foreground">
                <strong>Sales Representative:</strong> {invoice.salesmanName || "Direct / HQ"}
              </div>
              <div className="text-muted-foreground mt-1">
                <strong>Payment Terms:</strong> Net 30 Days
              </div>
              <div className="text-muted-foreground mt-1">
                <strong>Dispatch Type:</strong> Wholesale Road Delivery
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground font-semibold border-b">
                <tr>
                  <th className="p-2.5 w-8">#</th>
                  <th className="p-2.5">Medicine Description</th>
                  <th className="p-2.5 font-mono">Batch #</th>
                  <th className="p-2.5">Exp Date</th>
                  <th className="p-2.5 text-right">Qty</th>
                  <th className="p-2.5 text-right">Bonus</th>
                  <th className="p-2.5 text-right">Unit TP</th>
                  <th className="p-2.5 text-right">MRP</th>
                  <th className="p-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-muted/20">
                    <td className="p-2.5 text-muted-foreground">{idx + 1}</td>
                    <td className="p-2.5">
                      <div className="font-medium text-foreground">{item.medicineName}</div>
                      {item.genericName && (
                        <div className="text-[10px] text-muted-foreground">
                          {item.genericName} {item.dosageForm ? `(${item.dosageForm})` : ""}
                        </div>
                      )}
                    </td>
                    <td className="p-2.5 font-mono text-[11px] font-medium">{item.batchNumber}</td>
                    <td className="p-2.5 text-muted-foreground">{formatDate(item.expiryDate)}</td>
                    <td className="p-2.5 text-right font-medium">{item.quantity}</td>
                    <td className="p-2.5 text-right text-emerald-600 font-medium">
                      {item.bonusQuantity ? `+${item.bonusQuantity}` : "-"}
                    </td>
                    <td className="p-2.5 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="p-2.5 text-right text-muted-foreground">
                      {item.mrp ? formatCurrency(item.mrp) : "-"}
                    </td>
                    <td className="p-2.5 text-right font-bold">
                      {formatCurrency(item.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Calculation */}
          <div className="flex justify-end pt-2">
            <div className="w-72 space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-semibold">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.discountTotal > 0 && (
                <div className="flex justify-between py-1 text-emerald-600 border-b">
                  <span>Trade Discount:</span>
                  <span>-{formatCurrency(invoice.discountTotal)}</span>
                </div>
              )}
              {invoice.taxTotal > 0 && (
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">VAT / Tax:</span>
                  <span>+{formatCurrency(invoice.taxTotal)}</span>
                </div>
              )}
              {invoice.deliveryCharge ? (
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Delivery / Freight:</span>
                  <span>+{formatCurrency(invoice.deliveryCharge)}</span>
                </div>
              ) : null}
              <div className="flex justify-between py-2 text-sm font-bold border-b-2 border-primary">
                <span>Grand Total:</span>
                <span className="text-primary">{formatCurrency(invoice.grandTotal)}</span>
              </div>
              <div className="flex justify-between py-1 text-muted-foreground">
                <span>Paid Amount:</span>
                <span>{formatCurrency(invoice.paidAmount)}</span>
              </div>
              <div className="flex justify-between py-1 font-semibold text-rose-600">
                <span>Balance Due:</span>
                <span>{formatCurrency(invoice.dueAmount)}</span>
              </div>
            </div>
          </div>

          {/* Terms & Signatures */}
          <div className="pt-8 border-t grid grid-cols-3 gap-6 text-center text-xs">
            <div className="space-y-12">
              <div className="border-b border-dashed pt-8"></div>
              <div className="text-muted-foreground font-medium">Customer Received & Verified</div>
            </div>
            <div className="space-y-12">
              <div className="border-b border-dashed pt-8"></div>
              <div className="text-muted-foreground font-medium">Warehouse Dispatcher / Officer</div>
            </div>
            <div className="space-y-12">
              <div className="border-b border-dashed pt-8"></div>
              <div className="text-muted-foreground font-medium">Authorized Signatory</div>
            </div>
          </div>

          {/* Regulatory & Policy Footer */}
          <div className="text-[10px] text-muted-foreground text-center pt-4 border-t">
            <p>{invoice.company.invoiceFooterText || "Licensed Wholesale Pharmaceutical Distributor. Computer generated wholesale invoice."}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
