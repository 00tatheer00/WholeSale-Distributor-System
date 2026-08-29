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
  ChevronLeft,
  ChevronRight,
  Globe,
  Clock,
  CheckCircle2,
  AlertTriangle,
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

type Language = "ps" | "ur" | "en";

interface ChapterData {
  id: string;
  title: string;
  fullTitle: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
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

export function InfoGuideModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [lang, setLang] = React.useState<Language>("ps");
  const [activeTab, setActiveTab] = React.useState<string>("quickstart");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Pashto Chapters (پښتو)
  const pashtoChapters: ChapterData[] = [
    {
      id: "quickstart",
      title: "۱. لومړی پیل",
      fullTitle: "۱. لومړی پیل او ۵ اساسي مرحلې",
      shortDesc: "د سیسټم د لومړي ځل پیل او تنظیم بشپړه کړنلاره",
      icon: Sparkles,
      badge: "حیاتي",
      content: {
        heading: "د نوي کار پیلولو لپاره ۵ اساسي مرحلې",
        subheading: "د درملو عمده پلور د پیل لپاره لاندې ۵ ګامونه په ترتیب سره واخلئ:",
        sections: [
          {
            title: "۱. د درمل جوړوونکي شرکت / عرضه کوونکي ثبت (Suppliers)",
            description: (
              <span>
                له چپ مینو څخه <strong>&ldquo;Suppliers&rdquo;</strong> ته لاړ شئ او د درمل جوړوونکې کمپنۍ نوم، د اړیکې شمیره، پته او د پاتې پورونو معلومات په افغانیو ثبت کړئ.
              </span>
            ),
          },
          {
            title: "۲. د درملو او کټګوریو کټالوګ (Medicines & Categories)",
            description: (
              <span>
                د <strong>&ldquo;Medicines&rdquo;</strong> پاڼې ته لاړ شئ او د درملو تجارتي نوم (لکه Amoxicillin 500mg)، جینریک نوم، ډوز، او کټګوري وټاکئ.
              </span>
            ),
          },
          {
            title: "۳. د نوي پېرود ثبت او ګودام ته د مال داخلول (Purchases / GRN)",
            description: (
              <span>
                <strong>&ldquo;Purchases&rdquo; &rarr; &ldquo;New Purchase&rdquo;</strong> ته لاړ شئ. د فابریکې بسته نمبر (Batch)، د ختمېدو نیټه (Expiry)، او د پیرود اصلي بیه (AFN) داخل کړئ ترڅو سټاک ګودام ته اضافه شي.
              </span>
            ),
          },
          {
            title: "۴. د پیرودونکو درملتونونو ثبتول او د پور حد (Customers)",
            description: (
              <span>
                په <strong>&ldquo;Customers&rdquo;</strong> کې د پیرودونکي درملتون نوم، د ډاکټر اړیکه او د پور اعظمي حد <strong>(Credit Limit)</strong> وټاکئ ترڅو د پورونو خطر صفر شي.
              </span>
            ),
          },
          {
            title: "۵. د عمده پلور بل او د تحویلۍ چلاني صادرول (Sales & Invoicing)",
            description: (
              <span>
                په <strong>&ldquo;Sales&rdquo; &rarr; &ldquo;New Sale&rdquo;</strong> کې درملتون وټاکئ. سیسټم په اتومات ډول د FEFO له مخې بسته ټاکي او تاسو ته د رسمي بل او بې بیې چلاني (Delivery Challan) د چاپ اجازه درکوي.
              </span>
            ),
          },
        ],
      },
    },
    {
      id: "medicines",
      title: "۲. درمل او FEFO",
      fullTitle: "۲. درمل، بستې (Batches) او د FEFO قانون",
      shortDesc: "د تاریخ انقضاء دقیق کنټرول او اتومات سټاک وتل",
      icon: Pill,
      badge: "د سټاک کنټرول",
      content: {
        heading: "د درملو کټالوګ او د انقضاء د خطر مخنیوی",
        subheading: "د درملو په عمده پلور کې د انقضاء ضایعات په لاندې ډول کنټرولېږي:",
        sections: [
          {
            title: "د FEFO قانون څه شی دی؟",
            description: "په دې سیسټم کې کله چې تاسو یو درمل پلورئ، سیسټم په اتومات ډول هغه بسته (Batch) مخکې کوي چې د ختمېدو نیټه یې تر ټولو نږدې وي. دا چاره په ګودام کې د درملو د پاتې کېدو او تاریخ تېرېدو مخه نیسي.",
            type: "default",
          },
          {
            title: "د انقضاء د خطر رنګونه",
            description: "شین رنګ (له ۶ میاشتو زیات وخت لري)، ژېړ رنګ (په ۶ میاشتو کې ختمېږي - باید ژر وپلورل شي)، او سور رنګ (تر ۹۰ ورځو پورې ختمېږي او سیسټم یې په بل کې له پلور څخه منع کوي).",
            type: "alert",
          },
          {
            title: "د تاریخ تېرو درملو اتومات بلاک",
            description: "که د کوم درمل د ختمېدو نیټه پوره شي، سیسټم په کلکه سره اجازه نه ورکوي چې په کوم بل کې وپلورل شي ترڅو قانوني او صحي ستونزې جوړې نشي.",
            type: "danger",
          },
        ],
      },
    },
    {
      id: "purchases",
      title: "۳. د درملو پېرود",
      fullTitle: "۳. د نوي پېرود او وارداتو ثبت (Purchases)",
      shortDesc: "د فابریکې او عرضه کوونکو څخه د سټاک داخلول",
      icon: ReceiptText,
      badge: "سټاک داخلېدل",
      content: {
        heading: "ګودام ته د نوي مال داخلول او د پېرود بل",
        subheading: "د فابریکو او واردوونکو شرکتونو د مال د ثبتولو طریقه:",
        sections: [
          {
            title: "د نوي پېرود داخلولو مرحلې",
            description: "۱. د عرضه کوونکي کمپنۍ وټاکئ او د فابریکې د بل نمبر ولیکئ. ۲. د درملو نوم، د فابریکې بېچ نمبر، د تولید او انقضاء نیټه او تعداد داخل کړئ. ۳. د پیرود نرخ (AFN) او د پلور نرخ وټاکئ او ثبت یې کړئ.",
            type: "default",
          },
          {
            title: "د ګودام او پور اتومات تازه کېدل",
            description: "د پېرود په ثبتېدو سره په فوري ډول اړوند درمل ستاسو د ګودام په سټاک کې زیاتېږي او د شرکت په حساب کې د پور رقم جمع کېږي.",
            type: "success",
          },
        ],
      },
    },
    {
      id: "suppliers",
      title: "۴. شرکتونه (AP)",
      fullTitle: "۴. د درمل جوړوونکو شرکتونو حسابونه (AP)",
      shortDesc: "د عرضه کوونکو پاتې پیسې او د تادیې واؤچرونه",
      icon: Truck,
      badge: "پورونه",
      content: {
        heading: "د شرکتونو د حسابونو او تادیاتو مدیریت",
        subheading: "د هغو کمپنیو مالي راکړه ورکړه چې تاسو ترې درمل اخلئ:",
        sections: [
          {
            title: "د تادیې واؤچر ثبتول (Payment Voucher)",
            description: "د شرکت په پروفایل کې 'Record Payment' ووهئ، د صرافۍ، بانک یا نغدو پیسې ولیکئ. د شرکت له ټولیز پور څخه به په اتومات ډول دا رقم منفي شي.",
            type: "default",
          },
        ],
      },
    },
    {
      id: "sales",
      title: "۵. عمده پلور او بلونه",
      fullTitle: "۵. د عمده پلور آرډر او د بلونو صادرول",
      shortDesc: "د درملتونونو بلونه، د FEFO اتومات ټاکل او چلاني",
      icon: ShoppingCart,
      badge: "پلور او انوائس",
      content: {
        heading: "د عمده پلور د بل صادرولو چټکه پروسه",
        subheading: "په لوړ سرعت سره د لسګونو درملو بل جوړ کړئ:",
        sections: [
          {
            title: "د بل جوړولو مرحلې",
            description: "۱. درملتون وټاکئ (سیسټم سمدستي د درملتون پخوانی پور ښيي). ۲. بازاریاب وټاکئ. ۳. درمل او تعداد ولیکئ، تخفیف که وي ور زیات کړئ. ۴. تایید کړئ ترڅو بل او چلاني چاپ شي.",
            type: "default",
          },
          {
            title: "د موټر چلوونکي د تحویلۍ چلاني (Delivery Challan)",
            description: "د موټر چلوونکي لپاره ځانګړی سند چاپ کړئ چې هیڅ مالي نرخ نه لري؛ یوازې کارتنونه، بکسونه او د بستو شمیرې لري ترڅو درملتون ته تسلیم شي.",
            type: "alert",
          },
        ],
      },
    },
    {
      id: "customers",
      title: "۶. درملتونونه (AR)",
      fullTitle: "۶. د درملتونونو پورونه او د کرډیټ حد (AR)",
      shortDesc: "د پیرودونکو درملتونونو د پورونو کنټرول او لېجر",
      icon: Building2,
      badge: "د پیرودونکو پور",
      content: {
        heading: "د درملتونونو د پورونو او مالیاتو کنټرول",
        subheading: "په بازار کې د خپلو پیسو او درملتونونو د پور خوندیتوب:",
        sections: [
          {
            title: "د پور اعظمي حد (Credit Limit)",
            description: "که د یو درملتون د پور حد ۵۰۰،۰۰۰ افغانۍ وټاکل شي او د هغه پور له دې کچې واوړي، سیسټم تر هغې نوی پور بل نه ورکوي تر څو پخوانۍ پیسې تادیه نکړي.",
            type: "danger",
          },
          {
            title: "د درملتون مالي لېجر (Customer Statement)",
            description: "د درملتون په پروفایل کې په یوه کلیک سره د هغه د ټولو بلونو، تادیاتو او پاتې حساب بشپړ تاریخي لېجر وګورئ او چاپ یې کړئ.",
            type: "default",
          },
        ],
      },
    },
    {
      id: "payments",
      title: "۷. د پیسو راټولول",
      fullTitle: "۷. د پیسو راټولول او رسیدات (Collections)",
      shortDesc: "د نغدو، صرافۍ او بانکي تادیاتو ثبتول او د رسید چاپ",
      icon: FileSpreadsheet,
      badge: "د نغدو جریان",
      content: {
        heading: "د پیرودونکو د پیسو راټولول او زړو بلونو تصفیه",
        subheading: "د پیسو د راټولولو اصول او د رسید صادرول:",
        sections: [
          {
            title: "د زړو پورونو اتومات خلاصول (FIFO Settlement)",
            description: "کله چې له یوه درملتون څخه پیسې ترلاسه شي، سیسټم دا پیسې په اتومات ډول د هغه تر ټولو پخواني او زړه ناخلاصه شوي بل ته ورکوي ترڅو زوړ پور خلاص شي.",
            type: "success",
          },
        ],
      },
    },
    {
      id: "distributors",
      title: "۸. بازاریابان او وېشونکي",
      fullTitle: "۸. د بازاریابانو او ویزټورانو مدیریت (Salesmen)",
      shortDesc: "د بازاریابانو ټارګټونه، پلور او د وصولۍ راپور",
      icon: Users2,
      badge: "بازاریابان",
      content: {
        heading: "د ساحوي وېشونکو او بازاریابانو ۳۶۰ درجې ارزونه",
        subheading: "د هر بازاریاب د فعالیت، پلور او پیسو راټولولو څارنه:",
        sections: [
          {
            title: "د وصولۍ او ریکورۍ راپور (Recovery Report)",
            description: "په اسانۍ سره وګورئ چې هر بازاریاب په روانه ورځ او میاشت کې څومره درمل پلورلي او څومره نغدې او صرافي پیسې یې شرکت ته راوړې دي.",
            type: "default",
          },
        ],
      },
    },
    {
      id: "profit",
      title: "۹. ګټه او لګښتونه",
      fullTitle: "۹. د ناخالصې او خالصې ګټې تحلیل (P&L)",
      shortDesc: "د هر درمل او بل ریښتینې ګټه او ۵ معیاري لګښتونه",
      icon: TrendingUp,
      badge: "مالي استخبارات",
      content: {
        heading: "د ګټې، لګښتونو او د هر درمل د مفاد پوهه",
        subheading: "د ریښتینې سوداګریزې ګټې حسابي فورمولونه:",
        sections: [
          {
            title: "حسابي فورمولونه (Financial Formulas)",
            description: (
              <div className="space-y-1.5 font-mono text-[11px] bg-background/80 p-2.5 rounded-xl border border-emerald-300">
                <p>• ناخالصه ګټه = ټول پلور - د پېرود اصلي قیمت (Historical COGS)</p>
                <p>• خالصه ګټه = ناخالصه ګټه - ټول عملیاتي لګښتونه (Expenses)</p>
              </div>
            ),
            type: "formula",
          },
          {
            title: "۵ معیاري عملیاتي لګښتونه",
            description: "۱. د ګودام کرایه (EXP-RENT)، ۲. ورځني لګښتونه (EXP-DAILY)، ۳. د بازاریاب معاشونه (EXP-SALESMAN)، ۴. میلمستیا (EXP-VISITOR)، ۵. د ډاکټرانو او بازارموندنې لګښت (EXP-DOC-MKT).",
            type: "default",
          },
        ],
      },
    },
    {
      id: "reports",
      title: "۱۰. راپورونه او Excel",
      fullTitle: "۱۰. د سیسټم جامع راپورونه او Excel اکسپورټ",
      shortDesc: "د پلور، سټاک، انقضاء، کم سټاک او پورونو راپورونه",
      icon: BarChart3,
      badge: "راپورونه",
      content: {
        heading: "د ټولو سوداګریزو راپورونو کتنه او اکسپورټ",
        subheading: "په `/reports` کې شته ۱۰ فرعي راپورونه د نیټې له مخې فلټر کړئ:",
        sections: [
          {
            title: "شته راپورونه",
            description: "د پلور راپور، د پېرود راپور، د سټاک مالي ارزښت، د انقضاء خبرداری (Expiry)، د کم سټاک خبرداری (Low Stock)، او د ټولو درملتونونو د پاتې پورونو تفصیلي لړلیک.",
            type: "default",
          },
          {
            title: "Excel / CSV ته ډاونلوډ",
            description: "په هر راپور کې د 'Export CSV' تڼۍ شتون لري چې په یوه ثانیه کې معلومات د ایکسل بڼې ته اړوي.",
            type: "success",
          },
        ],
      },
    },
    {
      id: "settings",
      title: "۱۱. تنظیمات او امنیت",
      fullTitle: "۱۱. تنظیمات، د شرکت پته او امنیتي لاګونه",
      shortDesc: "د کاروونکو د کړنو څارنه او د بلونو تنظیمات",
      icon: Settings,
      badge: "اداره",
      content: {
        heading: "د سیسټم اداره او امنیتي خوندیتوب",
        subheading: "د شرکت پروفایل او نه بدلېدونکي امنیتي لاګونه:",
        sections: [
          {
            title: "امنیتي لاګونه (Audit Logs - `/audit-logs`)",
            description: "که هر کارمند بل بدل کړي، لګښت ووهي یا د درملو سټاک سم کړي، د هغه کارونکي نوم او دقیقه نیټه د تل لپاره په لاګ کې خوندي کېږي.",
            type: "alert",
          },
        ],
      },
    },
    {
      id: "daily-routine",
      title: "۱۲. ورځنی مهالوېش",
      fullTitle: "۱۲. د ورځني کار منظم مهالوېش (Daily SOP)",
      shortDesc: "د سهار، غرمې او ماښام د حسابونو بندولو لارښود",
      icon: Clock,
      badge: "ورځنۍ کړنلاره",
      content: {
        heading: "د کارمندانو او مدیریت لپاره ورځنی مهالوېش",
        subheading: "د شرکت د منظم کار لپاره لاندې مهالوېش عملي کړئ:",
        sections: [
          {
            title: "سهار (۰۸:۰۰ تر ۰۹:۰۰):",
            description: "ډشبورډ وګورئ، د کم سټاک او انقضاء خبرداري وڅارئ او د درملتونونو د پورونو لړلیک بازاریابانو ته ورکړئ.",
            type: "default",
          },
          {
            title: "د ورځې په جریان کې:",
            description: "نوي راغلي پېرودونه سمدستي ثبت کړئ، د بازاریابانو آرډرونه تایید کړئ او د موټر د تحویلۍ چلاني چاپ کړئ.",
            type: "default",
          },
          {
            title: "ماښام (۰۴:۰۰ تر ۰۵:۰۰):",
            description: "د بازاریابانو راوړل شوې نغدې او صرافي تادیات ثبت کړئ، ورځني لګښتونه دننه کړئ او د ورځې ټولیزه ګټه او پلور وڅارئ.",
            type: "success",
          },
        ],
      },
    },
  ];

  // Urdu Chapters (اردو)
  const urduChapters: ChapterData[] = [
    {
      id: "quickstart",
      title: "1. Quick Start",
      fullTitle: "1. Quick Start (5 Asaan Steps)",
      shortDesc: "Pehli dafa system shuru karne ka mukammal tariqa",
      icon: Sparkles,
      badge: "Zaroori",
      content: {
        heading: "Pehli Dafa Shuru Karne Ke 5 Zaroori Steps",
        subheading: "Naya distributor account setup karne ke baad in 5 steps ko follow karein:",
        sections: [
          {
            title: "1. Supplier / Medicine Manufacturer Add Karein",
            description: "Left menu se 'Suppliers' par jayein aur pharmaceutical company ki detail, drug license, contact aur credit days save karein.",
          },
          {
            title: "2. Medicine Catalog & Categories Banayein",
            description: "'Medicines' page par jaakar dawai ka Brand Name (e.g. Napa Extra), Generic Name (Paracetamol), Dosage Form aur Category choose karein.",
          },
          {
            title: "3. Purchase Intake (GRN) Se Stock Warehouse Mein Layein",
            description: "'Purchases' -> 'New Purchase Intake' par jayein. Factory invoice number, batch number, expiry date aur purchase cost price (AFN) daal kar submit karein.",
          },
          {
            title: "4. Customer Pharmacy / Clinic Register Karein",
            description: "'Customers' par jaakar pharmacy ka naam, owner phone number aur unki Credit Limit (AFN) set karein taake udhaar limit se zyada na jaye.",
          },
          {
            title: "5. Wholesale Sales Order Book Karein & Invoice Print Karein",
            description: "'Sales' -> 'Book Wholesale Order' par pharmacy select karein, dawai select karein, system automatically FEFO batch allocate karega.",
          },
        ],
      },
    },
    {
      id: "medicines",
      title: "2. Medicines & FEFO",
      fullTitle: "2. Medicines & FEFO Stock",
      shortDesc: "Dawaiyon ka catalog, batches, TP, MRP aur Expiry",
      icon: Pill,
      badge: "Stock Control",
      content: {
        heading: "Medicines, Batches & FEFO Stock Rule",
        subheading: "Dawaiyon ka master catalog aur automated First-Expire, First-Out (FEFO) nizam.",
        sections: [
          {
            title: "FEFO Rule Kia Hai?",
            description: "Wholesale pharma me jo dawai sabse pehle expire hone wali hoti hai, system sales ke waqt usi batch ko pehle select karta hai.",
          },
          {
            title: "Expired Medicine Block",
            description: "Agar kisi batch ki expiry date guzar chuki ho, toh system use kisi bhi sales order me add nahi hone deta.",
            type: "danger",
          },
        ],
      },
    },
    {
      id: "purchases",
      title: "3. Purchases",
      fullTitle: "3. Purchases & Factory Stock-In",
      shortDesc: "Manufacturer se stock kharidna aur GRN banana",
      icon: ReceiptText,
      badge: "Inward Stock",
      content: {
        heading: "Purchases & Goods Received Note (GRN)",
        subheading: "Manufacturer company se stock kharidne aur warehouse me dakhil karne ka tariqa.",
        sections: [
          {
            title: "New Purchase Kaise Dalein?",
            description: "Supplier select karein, batch number, expiry date aur purchase cost (AFN) daal kar submit karein.",
          },
        ],
      },
    },
    {
      id: "suppliers",
      title: "4. Suppliers (AP)",
      fullTitle: "4. Suppliers & Khata (AP)",
      shortDesc: "Medicine manufacturers ke baqaya paise aur vouchers",
      icon: Truck,
      badge: "Payables",
      content: {
        heading: "Suppliers & Accounts Payable (AP)",
        subheading: "Dawai banane wali companies ka hisab kitab aur payment vouchers.",
        sections: [
          {
            title: "Supplier Payment Kaise Karein?",
            description: "Supplier profile par jaakar 'Record Payment Voucher' dabayein. Cash ya Bank select karein. Baqaya balance foran kam ho jayega.",
          },
        ],
      },
    },
    {
      id: "sales",
      title: "5. Sales & Invoices",
      fullTitle: "5. Sales Orders & Invoicing",
      shortDesc: "Wholesale bill, FEFO batch allocation aur challan",
      icon: ShoppingCart,
      badge: "Billing",
      content: {
        heading: "Wholesale Sales Orders & Invoicing",
        subheading: "Pharmacies aur hospitals ko wholesale bill banane ka step-by-step tariqa.",
        sections: [
          {
            title: "Order Booking Process",
            description: "Sales -> Book Wholesale Order par jayein. Customer select karein, medicines add karein, system automatically FEFO batch choose karega.",
          },
          {
            title: "Delivery Challan (Gate Pass)",
            description: "Delivery van ya rider ke liye baghair price wala dispatch challan print karein taake rider sirf quantity match kare.",
            type: "alert",
          },
        ],
      },
    },
    {
      id: "customers",
      title: "6. Customers (AR)",
      fullTitle: "6. Customer Pharmacies & Dues (AR)",
      shortDesc: "Pharmacy credit limit, dues recovery aur ledgers",
      icon: Building2,
      badge: "Receivables",
      content: {
        heading: "Customer Pharmacies & Credit Limit (AR)",
        subheading: "Pharmacies ka udhaar (Credit Limit) control aur recovery ledger.",
        sections: [
          {
            title: "Credit Limit Protection",
            description: "Agar kisi pharmacy ki credit limit 100,000 AFN hai aur unka due 100,000 se barh jaye, toh system naya udhaar order lock kar deta hai.",
            type: "danger",
          },
        ],
      },
    },
    {
      id: "payments",
      title: "7. Collections",
      fullTitle: "7. Collections & Money Receipts",
      shortDesc: "Cash, bank aur hawala receipts ki entry",
      icon: FileSpreadsheet,
      badge: "Cash Flow",
      content: {
        heading: "Customer Collections & Money Receipts",
        subheading: "Order booker ya cashier ke zariye paise jama karne ka tareeqa.",
        sections: [
          {
            title: "FIFO Invoice Settlement",
            description: "System purani unpaid invoices ko FIFO (First-In, First-Out) ke hisab se paid mark karta hai.",
            type: "success",
          },
        ],
      },
    },
    {
      id: "distributors",
      title: "8. Salesmen / Reps",
      fullTitle: "8. Salesmen / Medical Reps",
      shortDesc: "Order bookers ke targets aur field expenses",
      icon: Users2,
      badge: "Field Reps",
      content: {
        heading: "Distributors / Field Sales Representatives",
        subheading: "Salesmen ki performance, targets aur recovery ka hisab.",
        sections: [
          {
            title: "Recovery Report",
            description: "Har salesman ki book ki hui sales aur recover ki hui recovery alag se track hoti hai.",
          },
        ],
      },
    },
    {
      id: "profit",
      title: "9. Profit & P&L",
      fullTitle: "9. Profit & Expenses (P&L)",
      shortDesc: "Asli Gross aur Net Munafa (COGS Formula)",
      icon: TrendingUp,
      badge: "Finance",
      content: {
        heading: "Profit & Financial Intelligence (P&L)",
        subheading: "Asli munafa aur karobari kharchon ka hisab.",
        sections: [
          {
            title: "COGS & Profit Formulas",
            description: (
              <div className="font-mono text-[11px] p-2 bg-background rounded-xl border">
                <p>• Gross Profit = Sales Revenue - Batch Purchase Cost (COGS)</p>
                <p>• Net Profit = Gross Profit - Operating Expenses</p>
              </div>
            ),
            type: "formula",
          },
        ],
      },
    },
    {
      id: "reports",
      title: "10. Reports",
      fullTitle: "10. Reports & Excel Export",
      shortDesc: "Rozana, hafta-war aur mahana business reports",
      icon: BarChart3,
      badge: "Analytics",
      content: {
        heading: "Reports Center & Excel / CSV Export",
        subheading: "Accounting aur tax audit ke liye mukammal export reports.",
        sections: [
          {
            title: "Dastyab Reports",
            description: "Sales Report, Inventory Valuation, Customer Dues, Expiry Watchdog, Low Stock Report.",
          },
        ],
      },
    },
    {
      id: "settings",
      title: "11. Settings & Audit",
      fullTitle: "11. Settings & Audit Logs",
      shortDesc: "Company license, tax rules aur security logs",
      icon: Settings,
      badge: "Admin",
      content: {
        heading: "System Settings & Audit Trail",
        subheading: "Company profile, invoice customization aur security ledger.",
        sections: [
          {
            title: "Immutable Security Audit Logs",
            description: "System me koi bhi order cancel kare ya stock adjust kare, uska timestamp aur user ID Security Audit Log me hamesha save rehta hai.",
            type: "alert",
          },
        ],
      },
    },
    {
      id: "daily-routine",
      title: "12. Daily Routine",
      fullTitle: "12. Daily Operating Routine (SOP)",
      shortDesc: "Subah, dopahar aur shaam ke accounts band karne ka tareeqa",
      icon: Clock,
      badge: "SOP",
      content: {
        heading: "Rozana Ka Munazzam Kaam",
        subheading: "Distributor office ke liye subah se shaam tak ka schedule:",
        sections: [
          {
            title: "Subah (08:00 - 09:00):",
            description: "Dashboard check karein, low stock aur expiry alerts dekhein aur dues list salesmen ko dein.",
          },
          {
            title: "Din Ke Waqt:",
            description: "Naye purchase GRN dalein, sales orders book karein aur delivery challan print karein.",
          },
          {
            title: "Shaam (04:00 - 05:00):",
            description: "Salesmen ki collections receipt me dalein, rozana kharche dalein aur daily profit check karein.",
            type: "success",
          },
        ],
      },
    },
  ];

  // English Chapters (English)
  const englishChapters: ChapterData[] = [
    {
      id: "quickstart",
      title: "1. Quick Start",
      fullTitle: "1. Quick Start (5 Essential Steps)",
      shortDesc: "Step-by-step setup guide for first-time operation",
      icon: Sparkles,
      badge: "Essential",
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
    {
      id: "medicines",
      title: "2. Medicines & FEFO",
      fullTitle: "2. Medicines & FEFO Expiry Engine",
      shortDesc: "Batch tracking, shelf-life and automated queue allocation",
      icon: Pill,
      badge: "Stock",
      content: {
        heading: "Batch Tracking & FEFO Loss Prevention",
        subheading: "How First-Expire, First-Out (FEFO) protects wholesale margins:",
        sections: [
          {
            title: "The FEFO Rule",
            description: "When billing sales orders, the system automatically assigns the batch with the nearest expiration date first.",
          },
          {
            title: "Expired Medicine Quarantine",
            description: "Batches past their expiration date are strictly blocked from being billed in sales orders.",
            type: "danger",
          },
        ],
      },
    },
    {
      id: "purchases",
      title: "3. Purchases",
      fullTitle: "3. Procurement & Stock Receiving",
      shortDesc: "Inward shipments, batch creation and AP balances",
      icon: ReceiptText,
      badge: "Inward",
      content: {
        heading: "Procurement & Inward Consignments",
        subheading: "Receiving verified pharmaceutical shipments from manufacturers:",
        sections: [
          {
            title: "Receiving Consignments",
            description: "Enter manufacturer invoice numbers, itemized batches, expiry dates, and purchase cost in AFN.",
          },
        ],
      },
    },
    {
      id: "suppliers",
      title: "4. Suppliers (AP)",
      fullTitle: "4. Manufacturer Suppliers & Accounts Payable",
      shortDesc: "Vendor balances, chronological ledgers and payments",
      icon: Truck,
      badge: "Payables",
      content: {
        heading: "Vendor Balances & Accounts Payable",
        subheading: "Managing pharmaceutical manufacturer accounts:",
        sections: [
          {
            title: "Disbursement Vouchers",
            description: "Record payments to suppliers via cash, bank transfer, or Sarafi/Hawala to automatically update the AP ledger.",
          },
        ],
      },
    },
    {
      id: "sales",
      title: "5. Sales & Invoices",
      fullTitle: "5. Wholesale Orders & Tax Invoices",
      shortDesc: "High-speed booking, FEFO allocation and Challans",
      icon: ShoppingCart,
      badge: "Invoicing",
      content: {
        heading: "Wholesale Sales Orders & Delivery Challans",
        subheading: "B2B order booking and fulfillment:",
        sections: [
          {
            title: "Order Booking",
            description: "Select client pharmacy, add items with automatic FEFO batch allocation, apply trade discounts, and issue invoices.",
          },
          {
            title: "Delivery Challan (Gate Pass)",
            description: "Print a price-hidden delivery challan for drivers showing only batch numbers and carton/box quantities.",
            type: "alert",
          },
        ],
      },
    },
    {
      id: "customers",
      title: "6. Customers (AR)",
      fullTitle: "6. Customer Pharmacies & Credit Control",
      shortDesc: "Credit limits, aging thresholds and statement ledgers",
      icon: Building2,
      badge: "Receivables",
      content: {
        heading: "Customer Pharmacies & Accounts Receivable (AR)",
        subheading: "Safeguarding working capital with credit limits:",
        sections: [
          {
            title: "Credit Limit Guardrail",
            description: "If a customer's unpaid balance exceeds their credit limit, the system locks new credit orders until past dues are settled.",
            type: "danger",
          },
        ],
      },
    },
    {
      id: "payments",
      title: "7. Collections",
      fullTitle: "7. Collections & Money Receipts",
      shortDesc: "FIFO debt settlement, money receipts and cash flow",
      icon: FileSpreadsheet,
      badge: "Collections",
      content: {
        heading: "Customer Collections & FIFO Settlement",
        subheading: "Receiving payments from pharmacies and clinics:",
        sections: [
          {
            title: "FIFO Debt Settlement",
            description: "Collected payments automatically settle the customer's oldest overdue invoices first.",
            type: "success",
          },
        ],
      },
    },
    {
      id: "distributors",
      title: "8. Salesmen / Reps",
      fullTitle: "8. Field Sales Representatives & Cockpit",
      shortDesc: "Target tracking, sales recovery and net contribution",
      icon: Users2,
      badge: "Field Reps",
      content: {
        heading: "Medical Representatives & Sales Performance",
        subheading: "Tracking field representative targets and collections:",
        sections: [
          {
            title: "Sales & Recovery Reports",
            description: "Monitor daily and monthly booked sales versus cash and Sarafi recoveries per representative.",
          },
        ],
      },
    },
    {
      id: "profit",
      title: "9. Profit & P&L",
      fullTitle: "9. Profit & Financial Intelligence (P&L)",
      shortDesc: "Historical batch COGS preservation and operating expenses",
      icon: TrendingUp,
      badge: "P&L",
      content: {
        heading: "Authentic Gross and Net Profit Intelligence",
        subheading: "Preserving historical acquisition cost across all sales:",
        sections: [
          {
            title: "Financial Accounting Formulas",
            description: (
              <div className="font-mono text-[11px] p-2 bg-background rounded-xl border">
                <p>• Gross Profit = Sales Revenue - Batch Historical Cost (COGS)</p>
                <p>• Net Profit = Gross Profit - Operating Expenses</p>
              </div>
            ),
            type: "formula",
          },
        ],
      },
    },
    {
      id: "reports",
      title: "10. Reports",
      fullTitle: "10. Reports Hub & CSV / Excel Export",
      shortDesc: "Itemized sales, inventory valuation and dues lists",
      icon: BarChart3,
      badge: "Reports",
      content: {
        heading: "Enterprise Reports Hub",
        subheading: "Filtered reports with one-click CSV and Excel export:",
        sections: [
          {
            title: "Available Sub-Reports",
            description: "Sales, Purchases, Inventory Live Valuation, Expiry Watchdog, Low Stock Reorders, and Customer Dues.",
          },
        ],
      },
    },
    {
      id: "settings",
      title: "11. Settings & Audit",
      fullTitle: "11. Settings & Security Audit Logs",
      shortDesc: "Company profile, invoice formatting and immutable audit trail",
      icon: Settings,
      badge: "Admin",
      content: {
        heading: "System Administration & Audit Trail",
        subheading: "Complete operational governance and security:",
        sections: [
          {
            title: "Immutable Security Audit Logs",
            description: "Every order modification, stock adjustment, or voucher cancellation is recorded with user ID and timestamp in `/audit-logs`.",
            type: "alert",
          },
        ],
      },
    },
    {
      id: "daily-routine",
      title: "12. Daily Routine",
      fullTitle: "12. Standard Operating Routine (SOP)",
      shortDesc: "Morning opening, operational hours and evening reconciliation",
      icon: Clock,
      badge: "SOP",
      content: {
        heading: "Daily Operational Schedule",
        subheading: "Best practices for pharmaceutical wholesale operations:",
        sections: [
          {
            title: "Morning (08:00 - 09:00):",
            description: "Review dashboard KPIs, check low stock & expiry alerts, and distribute overdue collections list to salesmen.",
          },
          {
            title: "Operational Hours:",
            description: "Process new purchase intakes immediately, book customer sales orders, and issue delivery challans.",
          },
          {
            title: "Evening Close (16:00 - 17:00):",
            description: "Record salesmen collections, log operating expenses, and verify daily gross and net profit figures.",
            type: "success",
          },
        ],
      },
    },
  ];

  const chaptersMap: Record<Language, ChapterData[]> = {
    ps: pashtoChapters,
    ur: urduChapters,
    en: englishChapters,
  };

  const currentChapters = chaptersMap[lang];
  const activeChapter = currentChapters.find((c) => c.id === activeTab) || currentChapters[0];

  const currentIndex = currentChapters.findIndex((c) => c.id === activeTab);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setActiveTab(currentChapters[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < currentChapters.length - 1) {
      setActiveTab(currentChapters[currentIndex + 1].id);
    }
  };

  const filteredChapters = currentChapters.filter(
    (c) =>
      c.fullTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.shortDesc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isRtl = lang === "ps" || lang === "ur";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-2.5 sm:px-3.5 gap-1.5 sm:gap-2 rounded-full border-blue-200 dark:border-blue-800/60 bg-blue-50/70 dark:bg-blue-950/50 text-[#0071E3] hover:bg-[#0071E3] hover:text-white transition-all text-xs font-semibold shadow-sm"
          title="د سیسټم بشپړ لارښود / Complete User Guide (Pashto / Urdu / English)"
        >
          <BookOpen className="h-4 w-4 stroke-[2.2]" />
          <span className="hidden sm:inline font-semibold">د سیسټم لارښود (Guide)</span>
          <span className="sm:hidden font-semibold">Guide</span>
        </Button>
      </DialogTrigger>

      <DialogContent
        className={`max-w-5xl w-[95vw] sm:w-full max-h-[92vh] p-0 rounded-[24px] sm:rounded-[28px] overflow-hidden border border-border bg-background shadow-2xl flex flex-col ${
          isRtl ? "text-right" : "text-left"
        }`}
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Top Header Bar */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border/70 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center font-bold shrink-0">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <DialogTitle className="text-sm sm:text-base font-bold text-foreground">
                {lang === "ps"
                  ? "د درملو د عمده پلور مدیریت سیسټم جامع لارښود"
                  : lang === "ur"
                  ? "Wholesale Medicine ERP — User Manual"
                  : "Wholesale Medicine Distribution ERP — Operations Manual"}
              </DialogTitle>
              <DialogDescription className="text-[11px] sm:text-xs text-muted-foreground line-clamp-1">
                {lang === "ps"
                  ? "د افغانستان د سټاکیسټانو او عمده پلورونکو لپاره بشپړ عملي لارښود (AFN / FEFO)"
                  : lang === "ur"
                  ? "Software chalane ka asaan Roman Urdu manual (Client Reference Guide)"
                  : "Comprehensive enterprise operations manual for pharmaceutical wholesale distributors"}
              </DialogDescription>
            </div>
          </div>

          {/* Language Switcher & Badges */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {/* Language Switcher Buttons */}
            <div className="flex items-center rounded-xl bg-muted/80 p-1 border border-border/60 text-xs shrink-0">
              <button
                onClick={() => setLang("ps")}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                  lang === "ps"
                    ? "bg-[#0071E3] text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                🇦🇫 پښتو
              </button>
              <button
                onClick={() => setLang("ur")}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                  lang === "ur"
                    ? "bg-[#0071E3] text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                🇵🇰 اردو
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                  lang === "en"
                    ? "bg-[#0071E3] text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                🇬🇧 English
              </button>
            </div>

            <Badge
              variant="outline"
              className="text-[10px] sm:text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-medium"
            >
              AFN (؋)
            </Badge>
            <Badge
              variant="outline"
              className="text-[10px] sm:text-xs bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-medium"
            >
              FEFO ERP
            </Badge>
          </div>
        </div>

        {/* Mobile Horizontal Chapter Scroll Bar */}
        <div className="flex md:hidden overflow-x-auto gap-1.5 p-2 bg-muted/30 border-b border-border/60 no-scrollbar">
          {currentChapters.map((ch) => {
            const Icon = ch.icon;
            const isActive = activeTab === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => setActiveTab(ch.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                  isActive
                    ? "bg-[#0071E3] text-white shadow-sm font-bold"
                    : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-white" : "text-[#0071E3]"}`} />
                <span>{ch.title}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Main Two-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Column: Navigation Sidebar (Desktop) */}
          <div
            className={`hidden md:flex md:col-span-4 p-3 bg-muted/10 flex-col gap-2 overflow-y-auto max-h-[calc(92vh-140px)] ${
              isRtl ? "border-l border-border/70" : "border-r border-border/70"
            }`}
          >
            <div className="relative mb-1">
              <Search
                className={`absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground ${
                  isRtl ? "right-3" : "left-3"
                }`}
              />
              <Input
                placeholder={
                  lang === "ps"
                    ? "موضوع یا فیچر وپلټئ..."
                    : lang === "ur"
                    ? "Search topic ya feature..."
                    : "Search topics or modules..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`h-8 text-xs rounded-xl bg-background border-border/80 ${
                  isRtl ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left"
                }`}
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
                    className={`w-full p-2.5 rounded-xl text-xs transition-all flex items-center justify-between ${
                      isRtl ? "text-right" : "text-left"
                    } ${
                      isActive
                        ? "bg-[#0071E3] text-white shadow-sm font-bold"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-1 pl-1">
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-[#0071E3]"}`} />
                      <span className="truncate">{ch.fullTitle}</span>
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

            <div className="mt-auto p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 text-[11px] text-sky-800 dark:text-sky-200 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5" />{" "}
                {lang === "ps" ? "تخنیکي ملاتړ" : lang === "ur" ? "Madad / Support" : "Help & Documentation"}
              </p>
              <p className="leading-relaxed">
                {lang === "ps"
                  ? "ټول مالي او سوداګریز قوانین د افغانستان د درملو د عمده پلور معیارونو سره سم جوړ شوي دي."
                  : lang === "ur"
                  ? "Koi masla ho toh administrator se rabta karein ya Settings me Audit Logs check karein."
                  : "All accounting rules strictly conform to wholesale pharmaceutical ERP standards and AFN currency."}
              </p>
            </div>
          </div>

          {/* Right Column: Detailed Chapter View */}
          <div className="md:col-span-8 p-4 sm:p-6 overflow-y-auto max-h-[calc(92vh-140px)] space-y-5">
            <div className="border-b pb-3 space-y-1">
              <div className="flex items-center gap-2">
                {React.createElement(activeChapter.icon, {
                  className: "h-5 w-5 text-[#0071E3] shrink-0",
                })}
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  {activeChapter.content.heading}
                </h3>
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                {activeChapter.content.subheading}
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-3.5">
              {activeChapter.content.sections.map((sec, idx) => {
                let boxClass = "bg-muted/30 border-border/80 text-foreground";
                let titleClass = "text-foreground font-bold";

                if (sec.type === "alert") {
                  boxClass = "bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100";
                  titleClass = "text-amber-900 dark:text-amber-200 font-bold";
                } else if (sec.type === "danger") {
                  boxClass = "bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100";
                  titleClass = "text-rose-900 dark:text-rose-200 font-bold";
                } else if (sec.type === "success" || sec.type === "formula") {
                  boxClass = "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100";
                  titleClass = "text-emerald-900 dark:text-emerald-200 font-bold";
                }

                return (
                  <div
                    key={idx}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all space-y-1.5 leading-relaxed text-xs ${boxClass}`}
                  >
                    <div className="flex items-center gap-2">
                      {sec.type === "danger" && <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />}
                      {sec.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                      <span className={titleClass}>{sec.title}</span>
                    </div>
                    <div className="text-muted-foreground/90 dark:text-muted-foreground/90 leading-relaxed">
                      {sec.description}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Previous & Next Chapter Navigation Buttons */}
            <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="rounded-xl text-xs h-8 px-3"
              >
                {isRtl ? <ChevronRight className="h-3.5 w-3.5 ml-1" /> : <ChevronLeft className="h-3.5 w-3.5 mr-1" />}
                {lang === "ps" ? "پخوانی فصل" : lang === "ur" ? "Previous Chapter" : "Previous"}
              </Button>

              <div className="text-[11px] font-semibold text-muted-foreground">
                {currentIndex + 1} / {currentChapters.length}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentIndex === currentChapters.length - 1}
                className="rounded-xl text-xs h-8 px-3 text-[#0071E3]"
              >
                {lang === "ps" ? "راتلونکی فصل" : lang === "ur" ? "Next Chapter" : "Next"}
                {isRtl ? <ChevronLeft className="h-3.5 w-3.5 mr-1" /> : <ChevronRight className="h-3.5 w-3.5 ml-1" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-border/70 bg-muted/20 flex items-center justify-between">
          <div className="text-[11px] sm:text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
            <span>
              {lang === "ps"
                ? "د درملو عمده پلور ERP • افغانستان (AFN / ؋)"
                : "Wholesale Medicine ERP • Afghanistan (AFN / ؋)"}
            </span>
          </div>
          <Button
            onClick={() => setIsOpen(false)}
            className="rounded-xl px-5 bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold h-8.5 shadow-sm"
          >
            {lang === "ps" ? "لارښود بند کړئ" : lang === "ur" ? "Guide Band Karein" : "Close Guide"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
