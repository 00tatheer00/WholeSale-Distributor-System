"use client";

import * as React from "react";
import Link from "next/link";
import {
  Printer,
  ArrowLeft,
  Store,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { InvoiceDetailRecord } from "@/server/services/invoice.service";

interface InvoiceDetailsClientProps {
  invoice: InvoiceDetailRecord;
}

export function InvoiceDetailsClient({ invoice }: InvoiceDetailsClientProps) {
  const [activeTab, setActiveTab] = React.useState<"INVOICE" | "CHALLAN">("INVOICE");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto pb-20 print:p-0 print:m-0 print:max-w-none">
      {/* 1. Print & Navigation Toolbar (Hidden in Print) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-foreground rounded-xl"
        >
          <Link href="/invoices">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Invoices
          </Link>
        </Button>

        <div className="flex items-center gap-3">
          {/* Document Switcher */}
          <div className="bg-muted/40 p-1 rounded-xl border border-border/60 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("INVOICE")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "INVOICE"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Wholesale Tax Invoice
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("CHALLAN")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "CHALLAN"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Delivery Challan
            </button>
          </div>

          {/* Print Button */}
          <Button
            onClick={handlePrint}
            className="bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl text-xs h-9 px-4 shadow-sm"
          >
            <Printer className="h-4 w-4 mr-1.5" />
            Print 1-Page {activeTab === "INVOICE" ? "Invoice" : "Challan"}
          </Button>
        </div>
      </div>

      {/* 2. Printable Invoice Document Container (Single-Page Fit) */}
      <div className="printable-invoice-sheet bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-sm print:border-none print:shadow-none print:p-0 print:m-0 text-foreground font-sans text-xs space-y-4">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start pb-3 border-b-2 border-primary/20 gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                <Store className="h-4 w-4 text-[#0071E3]" />
              </div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                {invoice.companyName}
              </h1>
            </div>
            <p className="text-[11px] text-muted-foreground max-w-sm">{invoice.companyAddress}</p>
            <div className="text-[10px] text-muted-foreground space-y-0.5 pt-0.5">
              <div>Phone: <span className="font-mono text-foreground">{invoice.companyPhone}</span> • Email: {invoice.companyEmail}</div>
              <div>Drug Lic: <strong className="font-mono text-foreground">{invoice.companyDrugLicense}</strong> • Trade Lic: {invoice.companyTradeLicense}</div>
            </div>
          </div>

          {/* Document Title & Number */}
          <div className="sm:text-right space-y-0.5">
            <Badge
              variant="outline"
              className="text-xs px-2.5 py-0.5 font-bold tracking-wider uppercase border-primary/40 bg-primary/5 text-[#0071E3]"
            >
              {activeTab === "INVOICE" ? "Wholesale Tax Invoice" : "Goods Delivery Challan"}
            </Badge>
            <div className="font-mono font-extrabold text-lg text-foreground pt-0.5">
              {activeTab === "INVOICE" ? invoice.invoiceNumber : invoice.challanNumber}
            </div>
            <div className="text-[11px] text-muted-foreground font-mono">
              Order Ref: <span className="text-foreground font-semibold">{invoice.saleNumber}</span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              Issue Date: <strong className="text-foreground font-mono">{formatDate(invoice.issueDate)}</strong>
            </div>
            {activeTab === "INVOICE" && (
              <div className="text-[11px] text-muted-foreground">
                Due Date: <strong className="text-foreground font-mono">{formatDate(invoice.dueDate)}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Customer / Billed-To Block */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2.5 border-b border-border/60 text-[11px]">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Billed To (Licensed Pharmacy / Client)
            </span>
            <div className="text-xs font-bold text-foreground">{invoice.customerName}</div>
            <div className="text-muted-foreground">Proprietor: <span className="text-foreground font-medium">{invoice.customerProprietor}</span></div>
            <div className="text-muted-foreground">{invoice.customerAddress}</div>
            <div className="text-muted-foreground">Phone: <span className="font-mono text-foreground">{invoice.customerPhone}</span></div>
            <div className="pt-0.5">
              <span className="inline-block px-1.5 py-0.5 rounded bg-muted font-mono font-bold text-foreground text-[10px]">
                Drug Lic: {invoice.customerDrugLicense}
              </span>
            </div>
          </div>

          <div className="space-y-0.5 sm:text-right">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Dispatch & Representative Details
            </span>
            <div className="text-xs font-bold text-foreground">{invoice.salesmanName}</div>
            <div className="text-muted-foreground">Delivery Status: <span className="font-semibold text-foreground">{invoice.deliveryStatus}</span></div>
            {invoice.deliveryDate && (
              <div className="text-muted-foreground">Delivery Date: <span className="font-mono text-foreground">{formatDate(invoice.deliveryDate)}</span></div>
            )}
            <div className="pt-0.5">
              <Badge
                className={`text-[9px] font-semibold ${
                  invoice.paymentStatus === "PAID"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : invoice.paymentStatus === "PARTIALLY_PAID"
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                Payment: {invoice.paymentStatus.replace("_", " ")}
              </Badge>
            </div>
          </div>
        </div>

        {/* Medicines / Batch Breakdown Table */}
        <div className="py-2 overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="border-b border-border/80 font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
                <th className="py-1.5 px-1.5 w-6">#</th>
                <th className="py-1.5 px-1.5">Medicine Brand & Generic</th>
                <th className="py-1.5 px-1.5">Batch #</th>
                <th className="py-1.5 px-1.5">Expiry</th>
                <th className="py-1.5 px-1.5 text-center">Billed Qty</th>
                <th className="py-1.5 px-1.5 text-center">Bonus</th>
                {activeTab === "INVOICE" && (
                  <>
                    <th className="py-1.5 px-1.5 text-right">Unit TP</th>
                    <th className="py-1.5 px-1.5 text-right">Unit MRP</th>
                    <th className="py-1.5 px-1.5 text-right">Amount</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-mono">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-muted/10">
                  <td className="py-1.5 px-1.5 text-muted-foreground">{idx + 1}</td>
                  <td className="py-1.5 px-1.5 font-sans font-semibold text-foreground">
                    <div>{item.medicineName}</div>
                    <div className="text-[9px] text-muted-foreground font-normal">
                      {item.genericName} • {item.dosageForm}
                    </div>
                  </td>
                  <td className="py-1.5 px-1.5 font-bold">{item.batchNumber}</td>
                  <td className="py-1.5 px-1.5 text-muted-foreground">{formatDate(item.expiryDate)}</td>
                  <td className="py-1.5 px-1.5 text-center font-bold">{item.quantity}</td>
                  <td className="py-1.5 px-1.5 text-center text-emerald-700">
                    {item.bonusQuantity && item.bonusQuantity > 0 ? `+${item.bonusQuantity}` : "—"}
                  </td>
                  {activeTab === "INVOICE" && (
                    <>
                      <td className="py-1.5 px-1.5 text-right">{formatCurrency(item.tradePrice || item.unitPrice)}</td>
                      <td className="py-1.5 px-1.5 text-right text-muted-foreground">{formatCurrency(item.mrp || item.unitPrice)}</td>
                      <td className="py-1.5 px-1.5 text-right font-bold text-foreground">{formatCurrency(item.totalAmount)}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Settlement Block (Only on Invoice) */}
        {activeTab === "INVOICE" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/80 text-[11px]">
            {/* Money Receipts & Allocations */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Payment Allocations & Money Receipts
              </span>
              {invoice.paymentAllocations && invoice.paymentAllocations.length > 0 ? (
                <div className="space-y-1">
                  {invoice.paymentAllocations.map((p, i) => (
                    <div
                      key={i}
                      className="p-1.5 rounded-lg bg-muted/20 border border-border/60 flex items-center justify-between text-[10px]"
                    >
                      <div>
                        <div className="font-mono font-bold text-foreground">{p.receiptNumber}</div>
                        <div className="text-[9px] text-muted-foreground">
                          {formatDate(p.paymentDate)} • {p.paymentMethod.replace("_", " ")}
                        </div>
                      </div>
                      <div className="font-mono font-bold text-emerald-700">
                        {formatCurrency(p.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic text-[10px]">
                  No upfront payment allocated. Balance is on 30-day wholesale credit terms.
                </p>
              )}
            </div>

            {/* Financial Grand Totals */}
            <div className="space-y-1 font-mono sm:pl-8 text-[11px]">
              <div className="flex justify-between text-muted-foreground py-0.5">
                <span>Subtotal (TP):</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>

              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-rose-600 py-0.5">
                  <span>Wholesale Discount:</span>
                  <span>−{formatCurrency(invoice.discountAmount)}</span>
                </div>
              )}

              {invoice.taxAmount > 0 && (
                <div className="flex justify-between text-muted-foreground py-0.5">
                  <span>VAT / Taxes:</span>
                  <span>+{formatCurrency(invoice.taxAmount)}</span>
                </div>
              )}

              <div className="pt-1 border-t border-foreground flex justify-between font-bold text-xs text-foreground">
                <span>Invoice Grand Total:</span>
                <span>{formatCurrency(invoice.grandTotal)}</span>
              </div>

              <div className="flex justify-between text-emerald-700 font-bold py-0.5">
                <span>Paid / Collected:</span>
                <span>−{formatCurrency(invoice.paidAmount)}</span>
              </div>

              <div className="flex justify-between text-amber-700 font-extrabold text-xs pt-0.5 border-t border-dashed border-border">
                <span>Remaining Due:</span>
                <span>{formatCurrency(invoice.dueAmount)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Terms & Signatures (Single-Page Fit) */}
        <div className="pt-6 space-y-4 text-[10px]">
          {/* Signatures */}
          <div className="grid grid-cols-3 gap-4 text-center text-muted-foreground">
            <div>
              <div className="border-b border-dashed border-border pt-6 mb-1"></div>
              <p className="font-semibold text-foreground">Warehouse / Dispenser</p>
              <p className="text-[9px]">Apex Pharma Dist.</p>
            </div>

            <div>
              <div className="border-b border-dashed border-border pt-6 mb-1"></div>
              <p className="font-semibold text-foreground">Sales Representative</p>
              <p className="text-[9px]">Dispatch In-charge</p>
            </div>

            <div>
              <div className="border-b border-dashed border-border pt-6 mb-1"></div>
              <p className="font-semibold text-foreground">Customer Pharmacy Receiver</p>
              <p className="text-[9px]">Signature & Seal</p>
            </div>
          </div>

          {/* DGDA Compliance Notice */}
          <div className="text-[9px] text-muted-foreground border-t border-border/40 pt-2 text-center">
            {invoice.companyInvoiceFooter}
            <br />
            Subject to DGDA wholesale regulations. Computer-generated tax document.
          </div>
        </div>
      </div>
    </div>
  );
}
