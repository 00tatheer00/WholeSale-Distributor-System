"use client";

import * as React from "react";
import {
  Pill,
  ReceiptText,
  Truck,
  ShoppingCart,
  Building2,
  Sparkles,
  Users2,
  TrendingUp,
  BarChart3,
  Settings,
  Shield,
  Search,
  BookOpen,
  HelpCircle,
  FileSpreadsheet,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export function InfoGuideModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<string>("quickstart");
  const [searchQuery, setSearchQuery] = React.useState("");

  const chapters = [
    {
      id: "quickstart",
      title: "1. Quick Start (5 Asaan Steps)",
      shortDesc: "Pehli dafa system shuru karne ka mukammal tariqa",
      icon: Sparkles,
      badge: "Zaroori",
    },
    {
      id: "medicines",
      title: "2. Medicines & FEFO Stock",
      shortDesc: "Dawaiyon ka catalog, batches, TP, MRP aur Expiry",
      icon: Pill,
      badge: "Stock Control",
    },
    {
      id: "purchases",
      title: "3. Purchases & Factory Stock-In",
      shortDesc: "Manufacturer se stock kharidna aur GRN banana",
      icon: ReceiptText,
      badge: "Inward Stock",
    },
    {
      id: "suppliers",
      title: "4. Suppliers & Khata (AP)",
      shortDesc: "Medicine manufacturers ke baqaya paise aur vouchers",
      icon: Truck,
      badge: "Payables",
    },
    {
      id: "sales",
      title: "5. Sales Orders & Invoicing",
      shortDesc: "Wholesale bill, FEFO batch allocation aur challan",
      icon: ShoppingCart,
      badge: "Billing",
    },
    {
      id: "customers",
      title: "6. Customer Pharmacies & Dues (AR)",
      shortDesc: "Pharmacy credit limit, dues recovery aur ledgers",
      icon: Building2,
      badge: "Receivables",
    },
    {
      id: "payments",
      title: "7. Collections & Money Receipts",
      shortDesc: "Cash, bank aur hawala receipts ki entry",
      icon: FileSpreadsheet,
      badge: "Cash Flow",
    },
    {
      id: "distributors",
      title: "8. Salesmen / Medical Reps",
      shortDesc: "Order bookers ke targets aur field expenses",
      icon: Users2,
      badge: "Field Reps",
    },
    {
      id: "profit",
      title: "9. Profit & Expenses (P&L)",
      shortDesc: "Asli Gross aur Net Munafa (COGS Formula)",
      icon: TrendingUp,
      badge: "Finance",
    },
    {
      id: "reports",
      title: "10. Reports & Excel Export",
      shortDesc: "Rozana, hafta-war aur mahana business reports",
      icon: BarChart3,
      badge: "Analytics",
    },
    {
      id: "settings",
      title: "11. Settings & Audit Logs",
      shortDesc: "Company license, tax rules aur security logs",
      icon: Settings,
      badge: "Admin",
    },
  ];

  const filteredChapters = chapters.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.shortDesc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3.5 gap-2 rounded-full border-blue-200 dark:border-blue-800/60 bg-blue-50/70 dark:bg-blue-950/50 text-[#0071E3] hover:bg-[#0071E3] hover:text-white transition-all text-xs font-semibold shadow-sm"
          title="Complete System User Manual & Guide (Roman Urdu)"
        >
          <BookOpen className="h-4 w-4 stroke-[2.2]" />
          <span className="font-semibold">System Guide (Urdu)</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl max-h-[90vh] p-0 rounded-[28px] overflow-hidden border border-border bg-background shadow-2xl flex flex-col">
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-border/70 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center font-bold">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Wholesale Medicine ERP — Mukammal Rehnumai Guide
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Software ko shuru se aakhir tak chalane ka asaan Roman Urdu manual (Client Reference Guide)
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">
              Currency: AFN (؋)
            </Badge>
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 font-medium">
              Strict FEFO ERP
            </Badge>
          </div>
        </div>

        {/* Search & Main Two-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Column: Navigation Sidebar */}
          <div className="md:col-span-4 border-r border-border/70 p-3 bg-muted/10 flex flex-col gap-2 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="relative mb-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search topic ya feature..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8.5 h-8 text-xs rounded-xl bg-background border-border/80"
              />
            </div>

            <div className="space-y-1">
              {filteredChapters.map((ch) => {
                const Icon = ch.icon;
                const isActive = activeTab === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveTab(ch.id)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between ${
                      isActive
                        ? "bg-[#0071E3] text-white shadow-sm font-bold"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-[#0071E3]"}`} />
                      <span className="truncate">{ch.title}</span>
                    </div>
                    <Badge
                      className={`text-[9px] px-1.5 py-0 shrink-0 ${
                        isActive
                          ? "bg-white/20 text-white border-transparent"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {ch.badge}
                    </Badge>
                  </button>
                );
              })}
            </div>

            <div className="mt-auto p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 text-[11px] text-sky-800 dark:text-sky-200 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5" /> Madad / Support
              </p>
              <p>Koi masla ho toh administrator se rabta karein ya Settings me Audit Logs check karein.</p>
            </div>
          </div>

          {/* Right Column: Detailed Chapter View */}
          <div className="md:col-span-8 p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
            {/* Chapter 1: Quick Start */}
            {activeTab === "quickstart" && (
              <div className="space-y-5">
                <div className="border-b pb-3">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#0071E3]" />
                    Pehli Dafa Shuru Karne Ke 5 Zaroori Steps
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Naya distributor account setup karne ke baad in 5 steps ko follow karein:
                  </p>
                </div>

                <div className="space-y-3.5">
                  <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200/70 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-xs text-sky-900 dark:text-sky-100">
                      <span className="h-5 w-5 rounded-full bg-[#0071E3] text-white flex items-center justify-center text-[10px]">1</span>
                      Supplier / Medicine Manufacturer Add Karein
                    </div>
                    <p className="text-xs text-sky-900/80 dark:text-sky-200/80 leading-relaxed">
                      Left menu se <strong>&ldquo;Suppliers&rdquo;</strong> par jayein aur pharmaceutical company (e.g. Square, Getz, Pfizer) ki detail, drug license, contact aur payment credit days save karein.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/70 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-xs text-purple-900 dark:text-purple-100">
                      <span className="h-5 w-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">2</span>
                      Medicine Catalog & Therapeutic Categories Banayein
                    </div>
                    <p className="text-xs text-purple-900/80 dark:text-purple-200/80 leading-relaxed">
                      <strong>&ldquo;Medicines&rdquo;</strong> page par jaakar dawai ka Brand Name (e.g. Napa Extra), Generic Name (Paracetamol), Dosage Form (Tablet/Syrup), aur Category choose karein.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/70 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-xs text-emerald-900 dark:text-emerald-100">
                      <span className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">3</span>
                      Purchase Intake (GRN) Se Stock Warehouse Mein Layein
                    </div>
                    <p className="text-xs text-emerald-900/80 dark:text-emerald-200/80 leading-relaxed">
                      <strong>&ldquo;Purchases&rdquo; &rarr; &ldquo;New Purchase Intake&rdquo;</strong> par jayein. Factory invoice number, batch number, expiry date aur purchase cost price (AFN) daal kar submit karein. Stock foran inventory me add ho jayega.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-xs text-amber-900 dark:text-amber-100">
                      <span className="h-5 w-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">4</span>
                      Customer Pharmacy / Clinic Register Karein
                    </div>
                    <p className="text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
                      <strong>&ldquo;Customers&rdquo;</strong> par jaakar pharmacy ka naam, owner ka phone number aur unki <strong>Credit Limit (AFN)</strong> set karein taake udhaar limit se zyada na jaye.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/70 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-xs text-blue-900 dark:text-blue-100">
                      <span className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">5</span>
                      Wholesale Sales Order Book Karein & Invoice Print Karein
                    </div>
                    <p className="text-xs text-blue-900/80 dark:text-blue-200/80 leading-relaxed">
                      <strong>&ldquo;Sales&rdquo; &rarr; &ldquo;Book Wholesale Order&rdquo;</strong> par pharmacy select karein, dawai select karein, system automatically FEFO batch allocate karega. Order submit karte hi Tax Invoice aur Delivery Challan print ke liye tayar ho jayega.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Chapter 2: Medicines & FEFO */}
            {activeTab === "medicines" && (
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Pill className="h-5 w-5 text-purple-600" />
                    Medicines, Batches & FEFO Stock Rule
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Dawaiyon ka master catalog aur automated First-Expire, First-Out (FEFO) nizam.
                  </p>
                </div>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="p-3.5 bg-muted/30 rounded-2xl border space-y-1.5">
                    <p className="font-bold text-foreground">FEFO Rule Kia Hai?</p>
                    <p className="text-muted-foreground">
                      Wholesale pharma me jo dawai <strong>sabse pehle expire</strong> hone wali hoti hai, system sales ke waqt usi batch ko pehle select karta hai. Is se warehouse me stock expire hone ka nuqsan nahi hota.
                    </p>
                  </div>

                  <div className="p-3.5 bg-muted/30 rounded-2xl border space-y-1.5">
                    <p className="font-bold text-foreground">Unit Conversion (Box se Strip):</p>
                    <p className="text-muted-foreground">
                      Har medicine me aap <em>Units Per Strip</em> aur <em>Strips Per Box</em> define kar sakte hain. System automatically unit prices calculate karega.
                    </p>
                  </div>

                  <div className="p-3.5 bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 rounded-2xl space-y-1 text-rose-900 dark:text-rose-200">
                    <p className="font-bold">Expired Medicine Block:</p>
                    <p>
                      Agar kisi batch ki expiry date guzar chuki ho, toh system use kisi bhi sales order me add nahi hone deta (Regulatory Compliance Guard).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Chapter 3: Purchases */}
            {activeTab === "purchases" && (
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <ReceiptText className="h-5 w-5 text-emerald-600" />
                    Purchases & Goods Received Note (GRN)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Manufacturer company se stock kharidne aur warehouse me dakhil karne ka tariqa.
                  </p>
                </div>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="p-3.5 bg-muted/30 rounded-2xl border space-y-1.5">
                    <p className="font-bold text-foreground">New Purchase Kaise Dalein?</p>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li><strong>Purchases</strong> par jayein aur <strong>&ldquo;New Purchase Intake&rdquo;</strong> dabayein.</li>
                      <li>Supplier select karein aur unka Invoice # darj karein.</li>
                      <li>Dawai select karke Batch Number, Expiry Date, Quantity aur Purchase Cost (AFN) enter karein.</li>
                      <li>Submit karne par stock foran warehouse inventory me add ho jayega aur Supplier ke khate (AP) me due amount chali jayegi.</li>
                    </ol>
                  </div>

                  <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 rounded-2xl space-y-1 text-amber-900 dark:text-amber-200">
                    <p className="font-bold">Safe Cancellation:</p>
                    <p>
                      Agar ghalti se purchase book ho jaye, toh use Cancel kiya ja sakta hai bashart-e-k wo stock abhi tak kisi customer ko sale na kiya gaya ho.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Chapter 4: Suppliers */}
            {activeTab === "suppliers" && (
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Truck className="h-5 w-5 text-amber-600" />
                    Suppliers & Accounts Payable (AP)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Dawai banane wali companies ka hisab kitab aur payment vouchers.
                  </p>
                </div>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="p-3.5 bg-muted/30 rounded-2xl border space-y-1.5">
                    <p className="font-bold text-foreground">Supplier Payment Kaise Karein?</p>
                    <p className="text-muted-foreground">
                      Supplier ke profile par jaakar <strong>&ldquo;Record Payment Voucher&rdquo;</strong> dabayein. Cash ya Bank transfer select karein. Supplier ka baqaya due balance foran kam ho jayega aur unke ledger me entry ajayegi.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Chapter 5: Sales & Invoices */}
            {activeTab === "sales" && (
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-[#0071E3]" />
                    Wholesale Sales Orders & Invoicing
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Pharmacies aur hospitals ko wholesale bill banane ka step-by-step tariqa.
                  </p>
                </div>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="p-3.5 bg-muted/30 rounded-2xl border space-y-1.5">
                    <p className="font-bold text-foreground">Order Booking Process:</p>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li><strong>Sales &rarr; Book Wholesale Order</strong> par jayein.</li>
                      <li>Customer pharmacy aur Sales Representative select karein.</li>
                      <li>Dawai add karein. System khud Trade Price (TP) aur FEFO batch choose karega.</li>
                      <li>Agar cash mila ho toh <em>Paid Amount</em> daalein, warna <em>Credit Order</em> submit karein.</li>
                      <li>Order finalize hote hi Invoice Print aur Delivery Challan screen samne ajayegi.</li>
                    </ol>
                  </div>

                  <div className="p-3.5 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 rounded-2xl space-y-1 text-sky-900 dark:text-sky-200">
                    <p className="font-bold">Delivery Challan (Gate Pass):</p>
                    <p>
                      Delivery van ya rider ke liye baghair price wala dispatch challan print karein taake delivery person sirf quantity match kare.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Chapter 6: Customer Pharmacies & Credit Dues */}
            {activeTab === "customers" && (
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-indigo-600" />
                    Customer Pharmacies & Credit Limit (AR)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Pharmacies ka udhaar (Credit Limit) control aur recovery ledger.
                  </p>
                </div>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="p-3.5 bg-muted/30 rounded-2xl border space-y-1.5">
                    <p className="font-bold text-foreground">Credit Limit Protection:</p>
                    <p className="text-muted-foreground">
                      Agar kisi pharmacy ki credit limit 100,000 AFN hai aur unka due 100,000 se barh jaye, toh system naya udhaar order lock kar deta hai jab tak purane paise jama na hon.
                    </p>
                  </div>

                  <div className="p-3.5 bg-muted/30 rounded-2xl border space-y-1.5">
                    <p className="font-bold text-foreground">Customer Statement Ledger:</p>
                    <p className="text-muted-foreground">
                      Pharmacy ke profile par <strong>&ldquo;View Full Ledger&rdquo;</strong> dabayein. Yahan shuru se lekar ab tak ka poora hisab (Invoices, Receipts, Balance) date-wise print ho sakta hai.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Chapter 7: Payments & Collections */}
            {activeTab === "payments" && (
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                    Customer Collections & Money Receipts
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Order booker ya cashier ke zariye paise jama karne ka tareeqa.
                  </p>
                </div>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="p-3.5 bg-muted/30 rounded-2xl border space-y-1.5">
                    <p className="font-bold text-foreground">Money Receipt Entry:</p>
                    <p className="text-muted-foreground">
                      <strong>&ldquo;Payments&rdquo;</strong> page par <strong>&ldquo;Receive Customer Payment&rdquo;</strong> dabayein. Pharmacy select karein, amount daalein aur receipt submit karein. System purani unpaid invoices ko FIFO (First-In, First-Out) ke hisab se paid mark kar dega.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Chapter 8: Distributors / Sales Reps */}
            {activeTab === "distributors" && (
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Users2 className="h-5 w-5 text-[#0071E3]" />
                    Distributors / Field Sales Representatives
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Salesmen ki performance, targets aur travel allowance ka hisab.
                  </p>
                </div>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="p-3.5 bg-muted/30 rounded-2xl border space-y-1.5">
                    <p className="font-bold text-foreground">Sales Rep 360° Cockpit:</p>
                    <p className="text-muted-foreground">
                      Har salesman ka monthly target, unki book ki hui sales, unki recover ki hui recovery, aur unka field kharcha (TA/DA) alag se track hota hai taake net profit contribution pata chal sakay.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Chapter 9: Profit & Expenses */}
            {activeTab === "profit" && (
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    Profit & Financial Intelligence (P&L)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Asli munafa aur karobari kharchon ka hisab.
                  </p>
                </div>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 rounded-2xl space-y-1.5 text-emerald-950 dark:text-emerald-100">
                    <p className="font-bold">Historical Batch COGS Formula:</p>
                    <div className="font-mono bg-white/70 dark:bg-black/20 p-2.5 rounded-xl border border-emerald-300/60 text-[11px] space-y-1 text-emerald-950 dark:text-emerald-100">
                      <p>&bull; Gross Profit = Sales Revenue - Batch Purchase Cost (COGS)</p>
                      <p>&bull; Net Profit = Gross Profit - Operating Expenses</p>
                    </div>
                    <p className="text-emerald-800 dark:text-emerald-300">
                      System purane sales par wahi purchase cost lagata hai jo us waqt thi, chahe baad me dawai ki factory price barh jaye.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Chapter 10: Reports */}
            {activeTab === "reports" && (
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-sky-600" />
                    Reports Center & Excel / CSV Export
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Accounting aur tax audit ke liye mukammal export reports.
                  </p>
                </div>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="p-3.5 bg-muted/30 rounded-2xl border space-y-1.5">
                    <p className="font-bold text-foreground">Dastyab Reports:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>Sales Report</strong> &mdash; Itemized sales revenue aur gross profit.</li>
                      <li><strong>Inventory Valuation</strong> &mdash; Warehouse me mojood stock ki qeemat (AFN).</li>
                      <li><strong>Customer Dues</strong> &mdash; Tamam pharmacies ke baqaya udhaar ki list.</li>
                      <li><strong>Expiry Watchdog</strong> &mdash; 30/60/90 din me expire hone wali dawaiyan.</li>
                      <li><strong>Low Stock Report</strong> &mdash; Khatam hone wali dawaiyon ki reorder list.</li>
                    </ul>
                    <p className="pt-1 text-[#0071E3] font-semibold">Har report me &ldquo;Export CSV&rdquo; button mojood hai jo Excel me open ho jata hai.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Chapter 11: Settings & Security */}
            {activeTab === "settings" && (
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Settings className="h-5 w-5 text-purple-600" />
                    System Settings, Licensing & Audit Trail
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Company profile, invoice customization aur security ledger.
                  </p>
                </div>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="p-3.5 bg-muted/30 rounded-2xl border space-y-1.5">
                    <p className="font-bold text-foreground">Invoice Settings:</p>
                    <p className="text-muted-foreground">
                      Invoice Prefix (e.g. <code>INV-</code>), bill par batch show karna ya hide karna, aur footer me return policy likhna yahan se customize hota hai.
                    </p>
                  </div>

                  <div className="p-3.5 bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 rounded-2xl space-y-1 text-purple-900 dark:text-purple-100">
                    <p className="font-bold flex items-center gap-1.5">
                      <Shield className="h-4 w-4 text-purple-600" /> Immutable Security Audit Logs:
                    </p>
                    <p>
                      System me koi bhi order cancel kare, stock adjust kare ya setting badle, uska timestamp aur user ID <strong>Security Audit Log (`/audit-logs`)</strong> me hamesha ke liye save rehta hai.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="px-6 py-3.5 border-t border-border/70 bg-muted/20 flex items-center justify-between">
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
            Wholesale Medicine ERP v1.0 • Afghanistan Region Edition (AFN)
          </div>
          <Button
            onClick={() => setIsOpen(false)}
            className="rounded-xl px-6 bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold h-9 shadow-sm"
          >
            Guide Band Karein
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
