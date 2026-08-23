"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Building2 } from "lucide-react";
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 print:p-0 print:m-0 print:max-w-none print:border-none print:shadow-none print:overflow-visible">
        {/* Modal Toolbar (hidden in print) */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/95 px-6 py-3 backdrop-blur print:hidden">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-base font-semibold">
              Wholesale Tax Invoice: {invoice.invoiceNumber}
            </DialogTitle>
            <Badge
              variant={
                invoice.status === "PAID"
                  ? "outline"
                  : invoice.status === "ISSUED"
                  ? "outline"
                  : "destructive"
              }
              className="text-xs"
            >
              {invoice.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handlePrint} className="gap-1.5 bg-[#0071E3] hover:bg-[#0077ED] text-white">
              <Printer className="h-4 w-4" />
              Print 1-Page Invoice
            </Button>
          </div>
        </div>

        {/* Invoice Printable Sheet (Single-Page Fit) */}
        <div className="printable-invoice-sheet p-6 sm:p-8 print:p-0 text-foreground bg-card space-y-4 font-sans text-xs">
          {/* Header Section */}
          <div className="flex justify-between items-start border-b pb-3">
            <div>
              <div className="flex items-center gap-1.5">
                <Building2 className="h-5 w-5 text-primary" />
                <h1 className="text-lg font-bold tracking-tight text-primary">
                  {invoice.company.name}
                </h1>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 max-w-sm">
                {invoice.company.address}
              </p>
              <div className="flex flex-wrap gap-x-3 text-[10px] text-muted-foreground mt-1">
                {invoice.company.drugLicenseNo && (
                  <span><strong>Drug Lic:</strong> {invoice.company.drugLicenseNo}</span>
                )}
                {invoice.company.tradeLicenseNo && (
                  <span><strong>Trade Lic:</strong> {invoice.company.tradeLicenseNo}</span>
                )}
                {invoice.company.phone && (
                  <span><strong>Tel:</strong> {invoice.company.phone}</span>
                )}
              </div>
            </div>

            <div className="text-right space-y-0.5">
              <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary rounded">
                Wholesale Tax Invoice
              </span>
              <div className="text-xs font-bold font-mono pt-0.5">
                {invoice.invoiceNumber}
              </div>
              <div className="text-[11px] text-muted-foreground">
                Date: <strong>{formatDate(invoice.issueDate)}</strong>
              </div>
              <div className="text-[11px] text-muted-foreground">
                Due: <strong>{formatDate(invoice.dueDate)}</strong>
              </div>
              {invoice.challanNumber && (
                <div className="text-[11px] text-muted-foreground">
                  Challan #: <span className="font-mono">{invoice.challanNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Billed To / Shipping Address */}
          <div className="grid grid-cols-2 gap-4 bg-muted/20 p-2.5 rounded-lg text-[11px] border border-border/50">
            <div>
              <div className="font-bold uppercase tracking-wider text-muted-foreground text-[10px] mb-0.5">
                Billed To (Customer Pharmacy)
              </div>
              <div className="font-bold text-xs text-foreground">
                {invoice.customer.tradeName}
              </div>
              {invoice.customer.proprietorName && (
                <div className="text-muted-foreground">
                  Prop: {invoice.customer.proprietorName}
                </div>
              )}
              <div className="text-muted-foreground">
                {invoice.customer.address}
              </div>
              <div className="mt-0.5 space-x-2 text-[10px] text-muted-foreground">
                {invoice.customer.drugLicenseNo && (
                  <span><strong>Drug Lic:</strong> {invoice.customer.drugLicenseNo}</span>
                )}
                {invoice.customer.phone && (
                  <span><strong>Phone:</strong> {invoice.customer.phone}</span>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="font-bold uppercase tracking-wider text-muted-foreground text-[10px] mb-0.5">
                Sales & Delivery Reference
              </div>
              <div className="text-foreground">
                <strong>Sales Rep:</strong> {invoice.salesmanName || "Direct / HQ"}
              </div>
              <div className="text-muted-foreground">
                <strong>Terms:</strong> Net 30 Days Credit
              </div>
              <div className="text-muted-foreground">
                <strong>Dispatch:</strong> Wholesale Road Delivery
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="rounded border overflow-hidden">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-muted/50 text-muted-foreground font-semibold border-b text-[10px]">
                <tr>
                  <th className="p-1.5 w-6">#</th>
                  <th className="p-1.5">Medicine Description</th>
                  <th className="p-1.5 font-mono">Batch #</th>
                  <th className="p-1.5">Expiry</th>
                  <th className="p-1.5 text-right">Qty</th>
                  <th className="p-1.5 text-right">Bonus</th>
                  <th className="p-1.5 text-right">Unit TP</th>
                  <th className="p-1.5 text-right">MRP</th>
                  <th className="p-1.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-muted/10">
                    <td className="p-1.5 text-muted-foreground">{idx + 1}</td>
                    <td className="p-1.5">
                      <div className="font-semibold text-foreground">{item.medicineName}</div>
                      {item.genericName && (
                        <div className="text-[9px] text-muted-foreground">
                          {item.genericName} {item.dosageForm ? `(${item.dosageForm})` : ""}
                        </div>
                      )}
                    </td>
                    <td className="p-1.5 font-mono text-[10px] font-medium">{item.batchNumber}</td>
                    <td className="p-1.5 text-muted-foreground">{formatDate(item.expiryDate)}</td>
                    <td className="p-1.5 text-right font-medium">{item.quantity}</td>
                    <td className="p-1.5 text-right text-emerald-700 font-medium">
                      {item.bonusQuantity ? `+${item.bonusQuantity}` : "-"}
                    </td>
                    <td className="p-1.5 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="p-1.5 text-right text-muted-foreground">
                      {item.mrp ? formatCurrency(item.mrp) : "-"}
                    </td>
                    <td className="p-1.5 text-right font-bold">
                      {formatCurrency(item.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Calculation */}
          <div className="flex justify-end pt-1">
            <div className="w-64 space-y-1 text-[11px]">
              <div className="flex justify-between py-0.5 border-b border-border/40">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-semibold">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.discountTotal > 0 && (
                <div className="flex justify-between py-0.5 text-emerald-700 border-b border-border/40">
                  <span>Trade Discount:</span>
                  <span>-{formatCurrency(invoice.discountTotal)}</span>
                </div>
              )}
              {invoice.taxTotal > 0 && (
                <div className="flex justify-between py-0.5 border-b border-border/40">
                  <span className="text-muted-foreground">VAT / Tax:</span>
                  <span>+{formatCurrency(invoice.taxTotal)}</span>
                </div>
              )}
              {invoice.deliveryCharge ? (
                <div className="flex justify-between py-0.5 border-b border-border/40">
                  <span className="text-muted-foreground">Delivery Charge:</span>
                  <span>+{formatCurrency(invoice.deliveryCharge)}</span>
                </div>
              ) : null}
              <div className="flex justify-between py-1 text-xs font-bold border-b border-primary">
                <span>Grand Total:</span>
                <span className="text-primary">{formatCurrency(invoice.grandTotal)}</span>
              </div>
              <div className="flex justify-between py-0.5 text-muted-foreground">
                <span>Paid Amount:</span>
                <span>{formatCurrency(invoice.paidAmount)}</span>
              </div>
              <div className="flex justify-between py-0.5 font-bold text-rose-700">
                <span>Balance Due:</span>
                <span>{formatCurrency(invoice.dueAmount)}</span>
              </div>
            </div>
          </div>

          {/* Signatures (Compact for 1-page fit) */}
          <div className="pt-4 border-t grid grid-cols-3 gap-4 text-center text-[10px]">
            <div>
              <div className="border-b border-dashed border-border pt-6 mb-1"></div>
              <div className="text-muted-foreground font-semibold">Customer Received & Seal</div>
            </div>
            <div>
              <div className="border-b border-dashed border-border pt-6 mb-1"></div>
              <div className="text-muted-foreground font-semibold">Warehouse Dispatcher</div>
            </div>
            <div>
              <div className="border-b border-dashed border-border pt-6 mb-1"></div>
              <div className="text-muted-foreground font-semibold">Authorized Signatory</div>
            </div>
          </div>

          {/* Regulatory & Policy Footer */}
          <div className="text-[9px] text-muted-foreground text-center pt-2 border-t">
            <p>{invoice.company.invoiceFooterText || "Licensed Wholesale Pharmaceutical Distributor. Computer generated wholesale tax invoice."}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
