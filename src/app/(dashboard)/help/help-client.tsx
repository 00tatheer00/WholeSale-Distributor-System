"use client";

import * as React from "react";
import Link from "next/link";
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
  Clock,
  CheckCircle2,
  AlertTriangle,
  Printer,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  Boxes,
  Lock,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Language = "ps" | "ur" | "en";

interface Chapter {
  id: string;
  number: string;
  title: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  routeHref: string;
  routeTitle: string;
  content: {
    heading: string;
    subheading: string;
    sections: {
      title: string;
      description: string | React.ReactNode;
      type?: "default" | "alert" | "danger" | "success" | "formula";
    }[];
  };
}

export function HelpClient() {
  const [lang, setLang] = React.useState<Language>("ps");
  const [activeTab, setActiveTab] = React.useState<string>("quickstart");
  const [searchQuery, setSearchQuery] = React.useState("");

  const pashtoChapters: Chapter[] = [
    {
      id: "quickstart",
      number: "۰۱",
      title: "لومړی پیل او ۵ اساسي مرحلې",
      shortDesc: "د سیسټم د لومړي ځل پیل، د شرکتونو او درملو اضافه کولو بشپړه کړنلاره",
      icon: Sparkles,
      badge: "اساسي لارښود",
      routeHref: "/dashboard",
      routeTitle: "ډشبورډ ته لاړ شئ",
      content: {
        heading: "د نوي کار پیلولو لپاره ۵ اساسي مرحلې",
        subheading: "د درملو د عمده پلور پیل لپاره لاندې ۵ ګامونه په منظم ډول ترسره کړئ:",
        sections: [
          {
            title: "۱. د درمل جوړوونکي شرکت / عرضه کوونکي ثبتول (Suppliers)",
            description: "له مینو څخه Suppliers ته لاړ شئ او د فابریکې نوم، د اړیکې شمیره، او لایسنس په افغانیو ثبت کړئ.",
            type: "default",
          },
          {
            title: "۲. د درملو کټالوګ او کټګورۍ جوړول (Medicines & Categories)",
            description: "په Medicines کې د درملو تجارتي نوم (Brand)، جینریک فارمول او د بستو واحدونه (بکس، پاکټ) وټاکئ.",
            type: "default",
          },
          {
            title: "۳. د نوي پېرود ثبت او ګودام ته د مال داخلول (Purchases / GRN)",
            description: "په Purchases -> New Purchase کې د فابریکې بسته نمبر (Batch)، د ختمېدو نیټه (Expiry) او د پیرود اصلي بیه (AFN) داخل کړئ.",
            type: "success",
          },
          {
            title: "۴. د پیرودونکو درملتونونو ثبتول او د پور حد (Customers)",
            description: "په Customers کې درملتون ثبت کړئ او د پور اعظمي حد (Credit Limit) وټاکئ ترڅو له حد زیات پور بلاک شي.",
            type: "alert",
          },
          {
            title: "۵. د عمده پلور بل او د موټر د تحویلۍ چلاني صادرول (Sales & Invoicing)",
            description: "په Sales -> New Sale کې درملتون وټاکئ؛ سیسټم په اتومات ډول د FEFO له مخې بسته ټاکي او بل او بې بیې چلاني درکوي.",
            type: "success",
          },
        ],
      },
    },
    {
      id: "medicines",
      number: "۰۲",
      title: "درمل، کټګورۍ او د FEFO انقضاء کنټرول",
      shortDesc: "د ختمېدو د نیټو اتومات څارنه او د زیان مخنیوی",
      icon: Pill,
      badge: "د سټاک کنټرول",
      routeHref: "/medicines",
      routeTitle: "د درملو کټالوګ",
      content: {
        heading: "د درملو کټالوګ او د تاریخ انقضاء دقیق مدیریت",
        subheading: "په عمده پلور کې د درملو د خرابېدو مخنیوی:",
        sections: [
          {
            title: "د FEFO قانون (First-Expire, First-Out)",
            description: "هر کله چې تاسو بل جوړوئ، سیسټم په خپله هغه بسته مخکې کوي چې د انقضاء نیټه یې تر ټولو نږدې وي ترڅو په ګودام کې پاتې نشي.",
            type: "default",
          },
          {
            title: "د تاریخ تېرو درملو بشپړ بندیز",
            description: "هغه درمل چې تاریخ یې تېر شوی وي په هیڅ صورت په پلور کې نه راځي ترڅو ستاسو شرکت له قانوني او مسلکي ستونزو خوندي وي.",
            type: "danger",
          },
        ],
      },
    },
    {
      id: "purchases",
      number: "۰۳",
      title: "د درملو پېرود او واردات (Purchases)",
      shortDesc: "د فابریکو څخه د مال داخلول او د بېچونو ثبتول",
      icon: ReceiptText,
      badge: "واردات",
      routeHref: "/purchases/new",
      routeTitle: "نوی پېرود ثبت کړئ",
      content: {
        heading: "ګودام ته د نوي مال داخلول او د پېرود ثبت",
        subheading: "د درمل جوړوونکو شرکتونو د مال د ثبت کړنلاره:",
        sections: [
          {
            title: "د پېرود ثبتول",
            description: "د شرکت نوم، د فابریکې بل نمبر، د درملو بسته (Batch)، د تولید او ختمېدو نیټه او د پېرود اصلي قیمت په افغانیو ولیکئ.",
            type: "default",
          },
          {
            title: "د سټاک او لېجر تازه کېدل",
            description: "د ثبت په کلیک کولو سره په یوه ثانیه کې ستاسو ګودام ډېرېږي او د شرکت په پور کې پیسې جمع کېږي.",
            type: "success",
          },
        ],
      },
    },
    {
      id: "suppliers",
      number: "۰۴",
      title: "د شرکتونو او عرضه کوونکو پورونه (Suppliers)",
      shortDesc: "د فابریکو پاتې پیسې او د تادیې واؤچرونه",
      icon: Truck,
      badge: "پورونه",
      routeHref: "/suppliers",
      routeTitle: "د شرکتونو لیست",
      content: {
        heading: "د درمل جوړوونکو شرکتونو د حسابونو تصفیه",
        subheading: "د عرضه کوونکو د حسابونو مدیریت:",
        sections: [
          {
            title: "د تادیې واؤچر (Payment Voucher)",
            description: "شرکت ته د پیسو لېږلو پر مهال (صرافي، بانک، نغدې) تادیه ثبت کړئ؛ د هغوی له پاتې حساب څخه منفي کېږي.",
            type: "default",
          },
        ],
      },
    },
    {
      id: "sales",
      number: "۰۵",
      title: "د عمده پلور بلونه او د چلاني چاپ (Sales)",
      shortDesc: "د درملتونونو بلونه او د ډرایور بې بیې چلاني",
      icon: ShoppingCart,
      badge: "پلور او بل",
      routeHref: "/sales/new",
      routeTitle: "نوی بل صادر کړئ",
      content: {
        heading: "د عمده پلور چټک بل جوړول",
        subheading: "د لسګونو قلمونو آرډر په خورا لوړ سرعت ثبت کړئ:",
        sections: [
          {
            title: "د بل د صادرولو مرحلې",
            description: "درملتون او بازاریاب وټاکئ، درمل اضافه کړئ. سیسټم د FEFO بیچ او نرخ ټاکي. تایید کړئ او بل چاپ کړئ.",
            type: "default",
          },
          {
            title: "د موټر چلوونکي تحویلي چلاني (Delivery Challan)",
            description: "د موټر چلوونکي لپاره ځانګړی سند چاپ کړئ چې نرخونه نه ښيي، یوازې کارتنونه او بیچونه ښيي.",
            type: "alert",
          },
        ],
      },
    },
    {
      id: "customers",
      number: "۰۶",
      title: "د درملتونونو پورونه او د کرډیټ حد (Customers)",
      shortDesc: "د درملتونونو مالي لېجر او د پور کنټرول",
      icon: Building2,
      badge: "پیرودونکي",
      routeHref: "/customers",
      routeTitle: "د درملتونونو لیست",
      content: {
        heading: "د درملتونونو د حسابونو او پورونو خوندیتوب",
        subheading: "په بازار کې د خپلو پیسو د ضایع کېدو مخنیوی:",
        sections: [
          {
            title: "د پور اعظمي حد (Credit Limit)",
            description: "که د یوه درملتون پور له ټاکلي حد زیات شي، سیسټم نوی بل بندوي تر څو پخوانۍ پیسې تادیه نکړي.",
            type: "danger",
          },
        ],
      },
    },
    {
      id: "payments",
      number: "۰۷",
      title: "د پیسو راټولول او رسیدات (Collections)",
      shortDesc: "د نغدو، صرافۍ او بانکي تادیاتو رسید",
      icon: FileSpreadsheet,
      badge: "د نغدو جریان",
      routeHref: "/payments",
      routeTitle: "د تادیاتو پاڼه",
      content: {
        heading: "د پیرودونکو د پیسو راټولول او زړو بلونو تصفیه",
        subheading: "د پورونو اتومات خلاصېدل په لومړیتوب سره:",
        sections: [
          {
            title: "د زړو پورونو تصفیه (FIFO Settlement)",
            description: "ترلاسه شوې پیسې لومړی د درملتون پر تر ټولو زاړه بل وضع کېږي ترڅو زاړه پورونه بند شي.",
            type: "success",
          },
        ],
      },
    },
    {
      id: "distributors",
      number: "۰۸",
      title: "د وېشونکو او بازاریابانو کوکپیټ (Salesmen)",
      shortDesc: "د بازاریابانو میاشتنی پلور او د وصولۍ راپور",
      icon: Users2,
      badge: "بازاریابان",
      routeHref: "/distributors",
      routeTitle: "د بازاریابانو لیست",
      content: {
        heading: "د بازاریابانو او ویزټورانو هر اړخیزه څارنه",
        subheading: "د هر استازي د پلور او نغدو پیسو تفکیک:",
        sections: [
          {
            title: "د وصولۍ راپور (Recovery Report)",
            description: "په اسانۍ وګورئ چې هر استازي په روانه ورځ او میاشت کې څومره درمل پلورلي او څومره پیسې یې راوړې دي.",
            type: "default",
          },
        ],
      },
    },
    {
      id: "profit",
      number: "۰۹",
      title: "د ناخالصې او خالصې ګټې شننه (Profit P&L)",
      shortDesc: "د هر درمل اصلي خرید قیمت او ۵ معیاري لګښتونه",
      icon: TrendingUp,
      badge: "مالي ګټه",
      routeHref: "/profit",
      routeTitle: "د ګټې کوکپیټ",
      content: {
        heading: "د ریښتینې سوداګریزې ګټې او لګښتونو حساب",
        subheading: "په افغانیو د اصلي عاید او لګښت شفاف حساب:",
        sections: [
          {
            title: "حسابي فورمولونه (Financial Formulas)",
            description: (
              <div className="space-y-1.5 font-mono text-[11px] bg-background/80 p-3 rounded-xl border border-emerald-300">
                <p>• ناخالصه ګټه = ټول پلور - د پېرود اصلي قیمت (Historical COGS)</p>
                <p>• خالصه ګټه = ناخالصه ګټه - ټول عملیاتي لګښتونه (Expenses)</p>
              </div>
            ),
            type: "formula",
          },
          {
            title: "۵ معیاري لګښتونه",
            description: "۱. ګودام او دفتر کرایه (EXP-RENT)، ۲. ورځني مصارف (EXP-DAILY)، ۳. معاشونه (EXP-SALESMAN)، ۴. میلمستیا (EXP-VISITOR)، ۵. د ډاکټرانو او مارکیټینګ لګښت (EXP-DOC-MKT).",
            type: "default",
          },
        ],
      },
    },
    {
      id: "reports",
      number: "۱۰",
      title: "د سیسټم ۱۰ جامع راپورونه او Excel ډاونلوډ",
      shortDesc: "د پلور، سټاک، انقضاء، کم سټاک او پورونو راپورونه",
      icon: BarChart3,
      badge: "راپورونه",
      routeHref: "/reports",
      routeTitle: "د راپورونو مرکز",
      content: {
        heading: "د راپورونو مرکزي اداره او Excel ته اکسپورټ",
        subheading: "ټول راپورونه د نیټې له مخې فلټر کړئ او ډانلوډ کړئ:",
        sections: [
          {
            title: "شتون لرونکي راپورونه",
            description: "د پلور، پېرود، سټاک ارزښت، انقضاء، کم سټاک، او د پیرودونکو د پورونو بشپړ راپورونه.",
            type: "default",
          },
          {
            title: "د CSV او Excel اکسپورټ",
            description: "په یوه کلیک سره د ټولو راپورونو فایل په ایکسل فارمټ کې ترلاسه کړئ.",
            type: "success",
          },
        ],
      },
    },
    {
      id: "settings",
      number: "۱۱",
      title: "تنظیمات او امنیتي لاګونه (Audit Logs)",
      shortDesc: "د شرکت معلومات او د کاروونکو د ټولو کړنو لاګ",
      icon: Settings,
      badge: "امنیت",
      routeHref: "/audit-logs",
      routeTitle: "امنیتي لاګونه",
      content: {
        heading: "د شرکت تنظیمات او څارنه",
        subheading: "د ټولو معاملو او کارمندانو روڼوالی:",
        sections: [
          {
            title: "نه بدلېدونکي امنیتي لاګونه (Audit Trail)",
            description: "که هر کارمند بل بدل کړي، لګښت ووهي یا سټاک سم کړي، د هغه نوم او وخت د تل لپاره ثبتېږي.",
            type: "alert",
          },
        ],
      },
    },
    {
      id: "daily-routine",
      number: "۱۲",
      title: "د ورځني کار منظم مهالوېش (Daily SOP)",
      shortDesc: "د سهار، غرمې او ماښام د حسابونو بندولو کړنلاره",
      icon: Clock,
      badge: "ورځنی مهالوېش",
      routeHref: "/dashboard",
      routeTitle: "اصلي ډشبورډ",
      content: {
        heading: "د درملو عمده پلور لپاره د کار منظم مهالوېش",
        subheading: "د سوداګرۍ د ښه پرمختګ لپاره لاندې مهالوېش پلي کړئ:",
        sections: [
          {
            title: "سهار (۰۸:۰۰ تر ۰۹:۰۰):",
            description: "ډشبورډ وګورئ، د کم سټاک او انقضاء خبرداري وڅارئ او بازاریابانو ته د پورونو لړلیک ورکړئ.",
            type: "default",
          },
          {
            title: "د ورځې په اوږدو کې:",
            description: "نوي راغلي مالونه په Purchases کې داخل کړئ، آرډرونه تایید کړئ او د تحویلۍ چلاني چاپ کړئ.",
            type: "default",
          },
          {
            title: "ماښام (۰۴:۰۰ تر ۰۵:۰۰):",
            description: "د بازاریابانو راوړل شوې پیسې په Payments کې ثبت کړئ، ورځني لګښتونه دننه کړئ او د ورځې ګټه وڅارئ.",
            type: "success",
          },
        ],
      },
    },
  ];

  const urduChapters: Chapter[] = [
    {
      id: "quickstart",
      number: "01",
      title: "Quick Start (5 Asaan Steps)",
      shortDesc: "Pehli dafa system shuru karne ka mukammal tariqa",
      icon: Sparkles,
      badge: "Quick Start",
      routeHref: "/dashboard",
      routeTitle: "Open Dashboard",
      content: {
        heading: "Pehli Dafa Shuru Karne Ke 5 Zaroori Steps",
        subheading: "Naya distributor account setup karne ke baad in 5 steps ko follow karein:",
        sections: [
          {
            title: "1. Supplier / Medicine Manufacturer Add Karein",
            description: "Left menu se 'Suppliers' par jayein aur pharmaceutical company ki detail, license aur contact save karein.",
          },
          {
            title: "2. Medicine Catalog & Categories Banayein",
            description: "'Medicines' page par jaakar Brand Name (e.g. Napa Extra), Generic Name aur Category choose karein.",
          },
          {
            title: "3. Purchase Intake (GRN) Se Stock Warehouse Mein Layein",
            description: "'Purchases' -> 'New Purchase Intake' par jayein. Factory invoice number, batch number, expiry date aur purchase cost price (AFN) daal kar submit karein.",
          },
          {
            title: "4. Customer Pharmacy / Clinic Register Karein",
            description: "'Customers' par jaakar pharmacy ka naam aur unki Credit Limit (AFN) set karein.",
          },
          {
            title: "5. Wholesale Sales Order Book Karein & Invoice Print Karein",
            description: "'Sales' -> 'Book Wholesale Order' par pharmacy select karein, system automatically FEFO batch allocate karega.",
          },
        ],
      },
    },
  ];

  const englishChapters: Chapter[] = [
    {
      id: "quickstart",
      number: "01",
      title: "Quick Start (5 Essential Steps)",
      shortDesc: "Step-by-step setup guide for first-time operation",
      icon: Sparkles,
      badge: "Quick Start",
      routeHref: "/dashboard",
      routeTitle: "Open Dashboard",
      content: {
        heading: "5 Steps to Get Started with Wholesale ERP",
        subheading: "Follow these operational steps to start distributing pharmaceuticals:",
        sections: [
          {
            title: "1. Register Suppliers (Pharma Manufacturers)",
            description: "Navigate to 'Suppliers' and add drug manufacturers with licensing, contact info, and payment terms in AFN.",
          },
          {
            title: "2. Build Medicine Catalog & Categories",
            description: "Under 'Medicines', add brand names, generic formulations, dosage forms, and packaging units (Box, Strip).",
          },
          {
            title: "3. Perform Purchase Intake (GRN)",
            description: "Go to 'Purchases' -> 'New Purchase', enter manufacturer batch numbers, expiry dates, and unit cost price.",
          },
          {
            title: "4. Register Customer Pharmacies & Credit Limits",
            description: "Add client pharmacies under 'Customers' and set maximum credit limits in AFN to prevent bad debt exposure.",
          },
          {
            title: "5. Book Wholesale Sales & Print Challans",
            description: "Create sales orders under 'Sales' with automated FEFO batch selection and print DGDA tax invoices and delivery challans.",
          },
        ],
      },
    },
  ];

  const chaptersMap: Record<Language, Chapter[]> = {
    ps: pashtoChapters,
    ur: urduChapters.length === pashtoChapters.length ? urduChapters : pashtoChapters,
    en: englishChapters.length === pashtoChapters.length ? englishChapters : pashtoChapters,
  };

  const currentChapters = chaptersMap[lang];
  const activeChapter = currentChapters.find((c) => c.id === activeTab) || currentChapters[0];

  const filteredChapters = currentChapters.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.shortDesc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isRtl = lang === "ps" || lang === "ur";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <PageHeader
            title={
              lang === "ps"
                ? "د سیسټم بشپړ کاري لارښود او مرسته"
                : lang === "ur"
                ? "System Guide & User Manual"
                : "System Guide & Operations Manual"
            }
            description={
              lang === "ps"
                ? "د درملو عمده پلور، FEFO ګودام، بلونو او مالي ګټې د مدیریت هراړخیز لارښود (AFN / ؋)"
                : "Wholesale Pharmaceutical Distribution ERP User Guide & Standard Operating Procedures"
            }
            className="pb-0 border-b-0 mb-0"
          />
        </div>

        {/* Right Actions: Language Switcher & Print */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Language Switcher */}
          <div className="flex items-center rounded-2xl bg-muted/80 p-1 border border-border/80 text-xs shadow-sm">
            <button
              onClick={() => setLang("ps")}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                lang === "ps"
                  ? "bg-[#0071E3] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🇦🇫 پښتو
            </button>
            <button
              onClick={() => setLang("ur")}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                lang === "ur"
                  ? "bg-[#0071E3] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🇵🇰 اردو
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                lang === "en"
                  ? "bg-[#0071E3] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🇬🇧 English
            </button>
          </div>

          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="rounded-xl h-9 gap-1.5 font-semibold text-xs border-border/80"
          >
            <Printer className="h-4 w-4" />
            <span>{lang === "ps" ? "لارښود چاپ کړئ" : "Print Manual"}</span>
          </Button>
        </div>
      </div>

      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Card className="rounded-2xl border-emerald-200/80 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold shrink-0">
              ؋
            </div>
            <div>
              <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                {lang === "ps" ? "مالي اسعار" : "Currency"}
              </p>
              <p className="text-xs font-bold text-foreground">افغانۍ (AFN / ؋)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-blue-200/80 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-blue-800 dark:text-blue-300">
                {lang === "ps" ? "د انقضاء کنټرول" : "Batch Policy"}
              </p>
              <p className="text-xs font-bold text-foreground">Strict FEFO Engine</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-purple-200/80 dark:border-purple-900 bg-purple-50/40 dark:bg-purple-950/20 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-purple-800 dark:text-purple-300">
                {lang === "ps" ? "د پورونو کنټرول" : "Credit Control"}
              </p>
              <p className="text-xs font-bold text-foreground">Automated Credit Limit Hold</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Two-Column Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Left Side: Chapter Navigation Index */}
        <div className="md:col-span-4 space-y-3">
          <div className="relative">
            <Search
              className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${
                isRtl ? "right-3" : "left-3"
              }`}
            />
            <Input
              placeholder={
                lang === "ps"
                  ? "د موضوع یا برخې پلټنه..."
                  : "Search topics or chapters..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`h-9 text-xs rounded-xl bg-background border-border/80 ${
                isRtl ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left"
              }`}
            />
          </div>

          <div className="space-y-1.5">
            {filteredChapters.map((ch) => {
              const Icon = ch.icon;
              const isActive = activeTab === ch.id;

              return (
                <button
                  key={ch.id}
                  onClick={() => setActiveTab(ch.id)}
                  className={`w-full p-3 rounded-2xl border text-xs transition-all flex items-center justify-between gap-2.5 ${
                    isRtl ? "text-right" : "text-left"
                  } ${
                    isActive
                      ? "bg-[#0071E3] text-white border-transparent shadow-md font-bold"
                      : "bg-card hover:bg-muted/60 border-border/70 text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`h-7 w-7 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-muted text-[#0071E3]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold truncate">{ch.title}</p>
                      <p
                        className={`text-[10px] truncate ${
                          isActive ? "text-white/80" : "text-muted-foreground"
                        }`}
                      >
                        {ch.shortDesc}
                      </p>
                    </div>
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
        </div>

        {/* Right Side: Active Chapter Detail Card */}
        <div className="md:col-span-8">
          <Card className="rounded-[24px] border-border/80 shadow-md">
            <CardHeader className="border-b pb-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center font-bold shrink-0">
                    {React.createElement(activeChapter.icon, {
                      className: "h-5 w-5",
                    })}
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                      {activeChapter.content.heading}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                      {activeChapter.content.subheading}
                    </CardDescription>
                  </div>
                </div>

                {activeChapter.routeHref && (
                  <Link href={activeChapter.routeHref}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-xl text-xs gap-1.5 text-[#0071E3] border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 font-semibold"
                    >
                      <span>{activeChapter.routeTitle}</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-4">
              {activeChapter.content.sections.map((sec, idx) => {
                let boxClass = "bg-muted/30 border-border/80 text-foreground";
                let titleClass = "text-foreground font-bold";

                if (sec.type === "alert") {
                  boxClass =
                    "bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100";
                  titleClass = "text-amber-900 dark:text-amber-200 font-bold";
                } else if (sec.type === "danger") {
                  boxClass =
                    "bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100";
                  titleClass = "text-rose-900 dark:text-rose-200 font-bold";
                } else if (sec.type === "success" || sec.type === "formula") {
                  boxClass =
                    "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100";
                  titleClass = "text-emerald-900 dark:text-emerald-200 font-bold";
                }

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all space-y-1.5 leading-relaxed text-xs ${boxClass}`}
                  >
                    <div className="flex items-center gap-2">
                      {sec.type === "danger" && (
                        <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                      )}
                      {sec.type === "success" && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      )}
                      <span className={titleClass}>{sec.title}</span>
                    </div>
                    <div className="text-muted-foreground/90 dark:text-muted-foreground/90 leading-relaxed">
                      {sec.description}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
