# 📖 PHARMADIST WHOLESALE ERP — MUKAMMAL SYSTEM GUIDE & VIDEO DEMO SCRIPT
### (Roman Urdu Mein Step-by-Step Training Manual aur Client Video Guide)

**Software Name**: PharmaDist Wholesale Medicine Distribution Management System (WMDMS)  
**Target Audience**: Distributors, Wholesale Staff, Cashiers, Order Bookers, aur Video Banane Walay Developers  
**Architecture**: 100% Offline, Zero Internet Dependency, Multi-PC LAN Network, DRAP Compliant  

---

## 📑 FEHRIST (TABLE OF CONTENTS)

1. [Software Ka Asal Maqsad (Retail vs Wholesale Ka Farq)](#1-software-ka-asal-maqsad)
2. [System Start & Login Karne Ka Tareeqa](#2-system-start--login-karne-ka-tareeqa)
3. [Daftar Ke Doosre Computers / Mobiles Ko Connect Karna (Wi-Fi LAN)](#3-daftar-ke-doosre-computers--mobiles-ko-connect-karna)
4. [Step-by-Step Business Workflow (Sequence Jo Follow Karni Hai)](#4-step-by-step-business-workflow)
   - [Step 1: Apni Company Ki Settings & DRAP License Setup](#step-1-company-settings--drap-license-setup)
   - [Step 2: Warehouse (Godown) Aur Racks Setup](#step-2-warehouse-godown-aur-racks-setup)
   - [Step 3: Manufacturers Aur Suppliers (Factory Vendors) Add Karna](#step-3-manufacturers-aur-suppliers-add-karna)
   - [Step 4: Medicines (Dawaiyon Ka Master Catalog) Register Karna](#step-4-medicines-master-catalog-register-karna)
   - [Step 5: Purchase Intake / Stock-In (Factory Se Maal Dakhil Karna - GRN)](#step-5-purchase-intake-grn)
   - [Step 6: Customer Pharmacies (Medical Stores) Add Karna](#step-6-customer-pharmacies-add-karna)
   - [Step 7: Sales Representatives (Order Bookers / Field Staff) Setup](#step-7-sales-representatives-order-bookers-setup)
   - [Step 8: Wholesale Order Book Karna (Strict FEFO Engine)](#step-8-wholesale-order-book-karna-strict-fefo-engine)
   - [Step 9: DRAP Tax Invoice Aur Delivery Challan Print Karna](#step-9-drap-tax-invoice-aur-delivery-challan-print-karna)
   - [Step 10: Cash / Cheque Recovery Aur Money Receipt Print Karna](#step-10-cash--cheque-recovery-aur-money-receipt)
   - [Step 11: Rozmarrah Ke Kharchay (Business Expenses) Darj Karna](#step-11-rozmarrah-ke-kharchay-business-expenses)
   - [Step 12: Asal Munafa (Gross Profit vs Net Profit) Dekhna](#step-12-asal-munafa-gross-profit-vs-net-profit)
   - [Step 13: Reports Aur Excel / CSV Export](#step-13-reports-aur-excel--csv-export)
   - [Step 14: Database Backup Download Aur Disaster Recovery](#step-14-database-backup-download-aur-disaster-recovery)
   - [Step 15: Naye Staff Ko Add Karna Aur Forensic Audit Logs](#step-15-naye-staff-add-karna-aur-audit-logs)
5. [Client Ke Liye Video Banane Ka Mukammal Script & Scene Plan](#5-client-ke-liye-video-banane-ka-script)
6. [Khas Sawalaat Aur Unke Asaan Jawabaat (Troubleshooting FAQ)](#6-troubleshooting-faq)

---

## 1. SOFTWARE KA ASAL MAQSAD

### Retail POS Aur Wholesale ERP Mein Kia Farq Hai?
- **Retail Pharmacy POS (Medical Store)**: Yahan aam mareez aate hain aur 1 goli ya 1 syp khareedte hain. Yahan expiry tracking aur credit limit zaroori nahi hoti.
- **Wholesale Pharmaceutical ERP (Aapka System)**:
  1. Yahan sirf **Medical Stores, Clinics, aur Hospitals** ko poore cartons aur boxes beche jaate hain.
  2. Har dawai ke sath **Manufacturer Batch Number** aur **Expiry Date** lazmi judi hoti hai.
  3. **Strict FEFO (First-Expire, First-Out)**: Jo batch pehle expire hone wala hai, system pehle usi ko bechega taake godown mein dawai zaya na ho.
  4. **Credit Limit (Udhaar Ki Hadh)**: Agar kisi pharmacy ki udhaar limit Rs. 200,000 hai aur unka udhaar 200,000 se barh jaye, toh system order lock kar deta hai (jab tak manager override na kare).
  5. **DRAP Wholesale Invoices & Challan**: DRAP (Drug Regulatory Authority of Pakistan) ke mutabiq A4 size ka mukammal Tax Invoice aur warehouse dispatch ke liye Delivery Challan nikalta hai.

---

## 2. SYSTEM START & LOGIN KARNE KA TAREEQA

### System Start Karna:
Agar software local development mode mein chalana ho toh terminal mein yeh command run hoti hai:
```bash
npm run dev
```
Jab terminal par `Ready in ...s` likha aa jaye, toh apne browser (Chrome / Edge) mein yeh link open karein:
👉 **`http://localhost:3000`**

### Login Credentials (Peo-Created Accounts):

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Super Admin** (Owner / CEO) | `admin@pharmadist.com` *(ya `admin@erp.com`)* | `admin123` | Har cheez ka full access, settings, backup, aur audit logs |
| **Sales Manager** (Order In-charge) | `sales.manager@pharmadist.com` | `sales123` | Naya order banana, rate lagana, credit limit override |
| **Warehouse Manager** (Godown In-charge) | `warehouse@pharmadist.com` | `warehouse123` | Naya maal dakhil karna (GRN), batches check karna, transfer |
| **Accounts Officer** (Munshi / Accountant) | `accounts@pharmadist.com` | `accounts123` | Paise wasool karna, voucher banana, expenses, munafa dekhna |

> 💡 **Tip**: Video demo ke liye hamesha **`admin@pharmadist.com`** se login karein taake aapko saare buttons aur tabs nazar aayein.

---

## 3. DAFTAR KE DOOSRE COMPUTERS / MOBILES KO CONNECT KARNA

Agar aap chahte hain ke:
- Computer 1 par Admin baithe.
- Computer 2 par Billing operator baithe.
- Mobile par Order Booker dukano par jaye.

Toh kisi internet ki zaroorat **NAHI** hai! Sirf sab devices ek hi Wi-Fi router se connected honi chahiye.

1. Main computer ka IP address note karein (jaise `172.20.100.127` ya `192.168.1.15`).
2. Doosre computer ya mobile ke browser mein yeh link likhein:
   👉 **`http://172.20.100.127:3000`**
3. Saamne login screen aa jayegi aur dono computers ek hi database par real-time kaam karenge!

---

## 4. STEP-BY-STEP BUSINESS WORKFLOW

Aapko software chalane ke liye hamesha yeh **15 qadam (steps)** isi tarteeb se follow karne hain:

```
Step 1: Settings (Company Profile)
   ↓
Step 2: Warehouses (Godown & Racks)
   ↓
Step 3: Manufacturers & Suppliers (Pharma Companies)
   ↓
Step 4: Medicines (Master Catalog)
   ↓
Step 5: Purchase Intake (GRN / Stock Inward)
   ↓
Step 6: Customer Pharmacies (Retail Clients)
   ↓
Step 7: Sales Representatives (Order Bookers)
   ↓
Step 8: Wholesale Sale (FEFO Order Booking)
   ↓
Step 9: Invoice & Delivery Challan Print
   ↓
Step 10: Collections & Money Receipts
   ↓
Step 11: Business Expenses
   ↓
Step 12: Profit & Financial Intelligence
   ↓
Step 13: Reports & Excel Exports
   ↓
Step 14: Database Backup & Recovery
   ↓
Step 15: Staff Management & Audit Logs
```

---

### Step 1: Company Settings & DRAP License Setup
**Kahan Jana Hai**: Left Menu $\rightarrow$ **Settings**

1. **Business Profile Tab**:
   - **Distributor Name**: Apni distribution ka naam daalein (e.g. `PharmaDist Wholesale Medicine Distributors`).
   - **Trade License No**: Shehar ka trade license number.
   - **DRAP Drug License No**: Distributor wholesale license (e.g. `DRAP-DL-KHI-09182-W`).
   - **NTN / Tax ID**: National Tax Number.
   - **Address & Phone**: Office ka address aur phone number (e.g. `+92 21 3589 1234`).
   - **Currency**: `PKR (Rs.)` select karein.
   - **Invoice Footer Text**: Invoice ke neeche jo terms likhni hon (jaise: *"Goods once sold cannot be returned without original cash memo & DRAP compliance verification."*).
2. Click karein **"Save Settings"** par.

---

### Step 2: Warehouse (Godown) Aur Racks Setup
**Kahan Jana Hai**: Left Menu $\rightarrow$ **Warehouses** (`/warehouses`)

1. Yahan aapke storage godown nazar aate hain (e.g. `Central Warehouse Karachi`, `Regional Depot Lahore`).
2. Agar naya godown banana ho:
   - Click karein **"Add Warehouse"**.
   - Godown ka naam likhein (e.g. `Cold Storage Depot`).
   - Code likhein (e.g. `WH-COLD-01`).
   - Location likhein (e.g. `Basement Zone A`).
   - Save kar dein.

---

### Step 3: Manufacturers Aur Suppliers Add Karna
**Kahan Jana Hai**: Left Menu $\rightarrow$ **Manufacturers** aur **Suppliers**

1. **Manufacturers (`/manufacturers`)**:
   - Dawai banane wali factory ka record (e.g. `Getz Pharma`, `GSK Pakistan`, `Hilton Pharma`, `Sami Pharmaceuticals`, `Ferozsons Laboratories`).
   - Click karein **"Add Manufacturer"** aur factory ka naam, mulk (`Pakistan`), aur contact daal kar save karein.
2. **Suppliers (`/suppliers`)**:
   - Yeh wo party hai jisse aap maal khareedte hain aur jisko aapne paise dene hote hain (Accounts Payable).
   - Click karein **"Add Supplier"**.
   - Supplier ka naam, phone number (`+92 300 ...`), address, aur credit period (e.g. 30 days) likh kar save karein.

---

### Step 4: Medicines Master Catalog Register Karna
**Kahan Jana Hai**: Left Menu $\rightarrow$ **Medicines** (`/medicines`)

1. Click karein **"Add Medicine"** button par.
2. Form mein yeh cheezein bharein:
   - **Brand Name**: Dawai ka mashhoor commercial naam (e.g. `Augmentin 625mg Tab`, `Panadol Extra`, `Risek 40mg Cap`).
   - **Generic Formulation**: Scientific formula (e.g. `Amoxicillin + Clavulanic Acid`, `Omeprazole`).
   - **Dosage Form**: Tablet, Capsule, Syrup, Injection, ya Ointment.
   - **Strength**: 625mg, 500mg, 40mg وغیرہ.
   - **Pack Size**: e.g. `Box of 10x10s`, `120ml Bottle`.
   - **Manufacturer**: Manufacturer select karein (e.g. `Getz Pharma`).
   - **Supplier**: Supplier select karein.
   - **Default Trade Price (TP)**: Wo rate jispar aap pharmacy ko bechte hain (e.g. Rs. 280.00).
   - **Default MRP**: Maximum Retail Price jo dabbe par chapi hai (e.g. Rs. 320.00).
   - **Min Reorder Level**: Minimum stock alert limit (e.g. 50 boxes).
3. Click karein **"Save Medicine"**.

---

### Step 5: Purchase Intake (GRN)
*(Factory Se Maal Warehouse Mein Dakhil Karna)*

**Kahan Jana Hai**: Left Menu $\rightarrow$ **Purchases** $\rightarrow$ **New Purchase Intake** (`/purchases/new`)

1. **Consignment Header**:
   - **Supplier Select Karein**: Kis company se maal aaya hai.
   - **Warehouse Select Karein**: Kis godown mein maal rakhna hai.
   - **Factory Invoice No**: Company ke chalaan ya bill ka number.
   - **Purchase Date**: Maal aane ki tareekh.
2. **Line Items (Batches Dakhil Karna)**:
   - Click karein **"Add Medicine Item"**.
   - Dawai select karein (e.g. `Augmentin 625mg`).
   - **Batch Number**: Dawai ke dabbe par likha factory batch (e.g. `B-78921`).
   - **Mfg Date**: Banne ki tareekh.
   - **Expiry Date**: Khatam hone ki tareekh (e.g. `2027-08-31`).
   - **Quantity Received**: Kitne dabbe aaye (e.g. `500`).
   - **Bonus Qty**: Agar company ne scheme mein muft dabbe diye hain (e.g. `50`).
   - **Purchase Cost (Rate)**: Aapko factory se kis rate par mila (e.g. Rs. 230.00).
   - **Trade Price (TP)**: Aap aage kitne ka bechenge (e.g. Rs. 280.00).
   - **MRP**: Dabbe par chapa rate (e.g. Rs. 320.00).
   - **Storage Location (Rack/Bin)**: Godown mein kahan rakha gaya (e.g. `Rack B-4, Shelf 2`).
3. **Payment Terms**:
   - Agar aapne foran kuch cash/bank diya hai toh `Paid Amount` daalein, warna `0` rehne dein (yeh supplier ke udhaar khate mein jama ho jayega).
4. Click karein **"Confirm & Intake Purchase"**.
   - ✨ **Asar**: Dawai ka stock godown mein barh jayega, FEFO queue mein batch activate ho jayega, aur supplier ka khata update ho jayega!

---

### Step 6: Customer Pharmacies Add Karna
**Kahan Jana Hai**: Left Menu $\rightarrow$ **Customers** $\rightarrow$ **New Customer** (`/customers/new`)

1. Form mein details daalein:
   - **Pharmacy / Clinic Name**: e.g. `Al-Shifa Medicos`, `Fazal Din Pharma Plus`.
   - **Proprietor Name**: Dukandar ka naam (e.g. `Dr. Asim Farooq`).
   - **Phone Number**: WhatsApp / Mobile number (e.g. `+92 300 9876543`).
   - **DRAP Drug License No**: Medical store ka official license (e.g. `DRAP-RET-KHI-44211`).
   - **Address & City**: Dukaan ka mukammal pata (e.g. `Shop 4, Saddar Commercial Area, Karachi`).
   - **Credit Limit (Rs.)**: Is dukan ko aap kitna udhaar de sakte hain (e.g. `Rs. 250,000`).
   - **Credit Days**: Kitne dinon mein paise wapas lene hain (e.g. `30 days`).
   - **Opening Balance**: Agar is dukan par purana koi udhaar baqi tha.
2. Click karein **"Save Customer Pharmacy"**.

---

### Step 7: Sales Representatives (Order Bookers) Setup
**Kahan Jana Hai**: Left Menu $\rightarrow$ **Distributors** (`/distributors`)

1. Yahan aapke field salesmen (order bookers) hotay hain jo market se order le kar aate hain.
2. Naya salesman add karein:
   - Naam: e.g. `Muhammad Rizwan`.
   - Employee Code: `REP-001`.
   - Assigned Territory / Route: e.g. `Route 1: Saddar & Clifton`.
   - Monthly Sales Target: e.g. `Rs. 2,000,000`.
   - Commission Rate: e.g. `1.5%`.

---

### Step 8: Wholesale Order Book Karna (Strict FEFO Engine)
**Kahan Jana Hai**: Left Menu $\rightarrow$ **Sales** $\rightarrow$ **Book Wholesale Order** (`/sales/new`)

Yeh software ka sab se ahem aur power-packed screen hai!

1. **Customer Select Karein**:
   - Pharmacy select karein (e.g. `Al-Shifa Medicos`).
   - Saamne live gauge card aa jayega jo batayega:
     - Is dukan ka purana udhaar kitna hai.
     - Iski credit limit kitni hai (e.g. Rs. 250,000).
     - Kitni limit baqi bachi hai.
2. **Salesman Select Karein**: Kis order booker ne yeh order laya.
3. **Medicine & FEFO Batch Selection**:
   - Dawai select karein (e.g. `Augmentin 625mg`).
   - ✨ **FEFO Magic**: System automatically wo batch pehle select karega jo sab se pehle expire hone wala hai!
   - Batch chip par likha aayega: `Batch: B-78921 | Exp: Aug 2027 | Stock: 500`.
   - Quantity daalein (e.g. `50 boxes`).
   - Agar scheme deni ho toh `Bonus Qty` daalein (e.g. `5 boxes free`).
   - Discount percent (e.g. `5%`).
4. **Credit Barrier Check**:
   - Agar bill banate waqt customer ka udhaar unki limit se barh raha hoga, toh screen par **Red Alert** aa jayega aur order ruk jayega!
   - Agar Sales Manager allow kare, toh checkbox tick karein: *"Credit Override Approved"* aur wajah likhein.
5. **Payment Mode**:
   - Agar customer ne foran kuch cash ya cheque diya hai toh `Paid Amount` likhein, warna `0` rehne dein (pure bill ka udhaar ban jayega).
6. Click karein **"Submit Order & Generate Invoice"**.

---

### Step 9: DRAP Tax Invoice Aur Delivery Challan Print Karna
**Kahan Jana Hai**: Order submit hotay hi ya **Invoices** page par kisi bhi invoice par click karein.

1. **Tax Invoice Tab**:
   - Yahan standard single-page A4 print aata hai.
   - Isme Distributor ki company details, DRAP license, Customer ki pharmacy details, itemized batch numbers, expiry dates, Trade Price (TP), MRP, Discount, aur Net Total likha hota hai.
   - Neeche 3 signature lines hoti hain:
     1. Customer Received & Seal
     2. Warehouse Dispatcher
     3. Authorized Signatory
   - Click karein **"Print 1-Page Invoice"** $\rightarrow$ Printer se print nikal kar customer ko dein!
2. **Delivery Challan Tab (`?tab=CHALLAN`)**:
   - Yeh warehouse driver aur dispatch ladke ke liye hota hai.
   - Isme sirf items, carton quantity, aur batch number likha hota hai, **paise nahi likhe hote** taake driver ko rates ka pata na chale!
   - Is par dukan wale ki stamp aur signature le kar wapas office laya jata hai.

---

### Step 10: Cash / Cheque Recovery Aur Money Receipt
*(Pharmacy Se Paise Wasool Karna)*

**Kahan Jana Hai**: Left Menu $\rightarrow$ **Payments** (`/payments`)

Jab order booker market se recovery le kar aaye:

1. Click karein **"Record Collection"** button par.
2. Pharmacy select karein (e.g. `Al-Shifa Medicos`).
   - System foran batayega ke is dukan par total kitna udhaar baqi hai (e.g. Rs. 85,000).
3. **Amount Received**: Kitne paise jama huay (e.g. `Rs. 50,000`).
4. **Payment Method**: Cash, Bank Transfer, Cheque, ya Raast / JazzCash / EasyPaisa.
   - Agar Cheque ho toh Bank Name aur Cheque No daalein.
5. Click karein **"Confirm Collection"**.
6. ✨ **FIFO Settlement & Receipt**:
   - System khud ba khud purane unpaid bills ko pehle clear karega (First-In, First-Out).
   - Saamne **Printable Money Receipt (`RCT-2026-00001`)** khul jayegi.
   - Click karein **"Print Receipt"** aur pharmacy ko raseed issue kar dein!

---

### Step 11: Rozmarrah Ke Kharchay (Business Expenses)
**Kahan Jana Hai**: Left Menu $\rightarrow$ **Expenses** (`/expenses`)

Daftar aur godown ke jo kharche hote hain wo yahan darj hote hain taake asal net profit calculate ho sake:

1. Click karein **"Record Expense"**.
2. Category choose karein:
   - `EXP-RENT`: Godown ya office ka kiraya.
   - `EXP-DAILY`: Bijli, paani, chai, stationary.
   - `EXP-SALESMAN`: Salesman ka petrol aur daily allowance (TA/DA).
   - `EXP-VISITOR`: Mehmaan-nawazi.
   - `EXP-DOC-MKT`: Doctor marketing aur promotion.
3. Amount likhein (e.g. `Rs. 15,000`), paid to kisko diye, aur tareekh select karein.
4. Save kar dein.

---

### Step 12: Asal Munafa (Gross Profit vs Net Profit) Dekhna
**Kahan Jana Hai**: Left Menu $\rightarrow$ **Profit** (`/profit`)

Owner / CEO ke liye yeh sab se zaroori screen hai:

1. **Date Filter**: Chunein `Today`, `This Month`, `This Year`, ya Custom range.
2. **4 Big Metric Cards**:
   - **Sales Revenue**: Total kitne ka maal bika (e.g. Rs. 1,500,000).
   - **Cost of Goods Sold (COGS)**: In bikay huay dabbo ki asal khareed qeemat kitni thi (e.g. Rs. 1,200,000).
   - **Gross Profit (Khaam Munafa)**: Bika qeemat minus khareed qeemat = Rs. 300,000 (20.0%).
   - **Net Profit (Khaalas Munafa)**: Gross Profit mein se tamam office expenses nikaal kar jo pocket mein bacha = Rs. 240,000 (16.0%).
3. **Breakdowns**:
   - Neeche table mein har dawai ka alag alag munafa nazar aayega ke kis dawai ne kitna profit kamaya.
   - Har salesman ki performance nazar aayegi ke kisne kitna munafa diya.

---

### Step 13: Reports Aur Excel / CSV Export
**Kahan Jana Hai**: Left Menu $\rightarrow$ **Reports** (`/reports`)

Yahan 4 categories mein 9 specialized reports mojood hain:
1. **Sales Summary Report**: Rozana ki sales ka record.
2. **Customer Balances (AR) Report**: Tamam medical stores ki udhaar fehrist.
3. **Purchase Consignments Report**: Factory se khareedari ka hisaab.
4. **Supplier Liabilities (AP) Report**: Kin pharma companies ko kitne paise dene hain.
5. **Inventory Valuation Report**: Godown mein is waqt kitne lakh ka stock pada hai.
6. **Batch Expiry Watchdog**: agle 30, 60, 90 dinon mein konsi dawaiyan expire hone wali hain.
7. **Low Stock Reorder Report**: Konsi dawaiyan khatam hone ke qareeb hain.
8. **Customer Payments Report**: Daily recovery ledger.
9. **Sales Rep Target Report**: Order bookers ki recovery percentage.

> 📥 **Export**: Har report ke ooper **"Export Excel (.xls)"** aur **"Export CSV"** ka button hai. Ek click par file aapke computer mein download ho jati hai.

---

### Step 14: Database Backup Download Aur Disaster Recovery
**Kahan Jana Hai**: Left Menu $\rightarrow$ **Settings** $\rightarrow$ **Backup & Maintenance Tab**

Chunkay yeh software 100% offline aapke computer par chalta hai, is liye database backup lena intehayi ahem hai:

1. **Live Database Download**:
   - Click karein **"Download Live Database (.db)"**.
   - Aapke computer mein `pharmadist-backup-YYYY-MM-DD.db` download ho jayegi. Ise kisi USB flash drive ya Google Drive par mehfooz kar lein.
2. **Local Snapshot Banana**:
   - Click karein **"Create Local Snapshot"**.
   - System foran `prisma/backups/` folder mein snapshot bana dega aur table mein show kar dega.
3. **Agar Computer Kharab Ho Jaye Toh Restore Kaise Karein?**
   - Step 1: Software / Electron band karein.
   - Step 2: Apne computer mein `prisma/` folder kholen.
   - Step 3: Purani file `wmdms.db` ko rename karke `wmdms.db.old` kar dein.
   - Step 4: Apni backup file ko yahan copy karein aur uska naam **`wmdms.db`** rakh dein.
   - Step 5: Software dobara start karein. Tamam purana data, bills, ledgers, aur medicines foran wapas aa jayenge!

---

### Step 15: Naye Staff Add Karna Aur Forensic Audit Logs
**Kahan Jana Hai**: Left Menu $\rightarrow$ **Settings** $\rightarrow$ **Team & Security Tab** aur **Audit Logs**

1. **Staff Management**:
   - Click karein **"Add Staff Member"**.
   - Naam, Email, Password aur Role chunein (Super Admin, Sales Manager, Warehouse Officer, Accounts Officer, ya Cashier).
   - Agar koi mulazim naukri chhor jaye, toh 3-dots par click karke **"Deactivate Account"** kar dein. Uska login band ho jayega lekin uske banaye huay purane bills mehfooz rahenge.
2. **Forensic Audit Trail (`/audit-logs`)**:
   - Yahan har action ka record hota hai: Kis staff ne kab login kia, kab rate badla, kab order cancel kia, aur pehle kia value thi aur baad mein kia hui. Yeh record tamper-proof hai aur isko koi edit nahi kar sakta.

---

## 5. CLIENT KE LIYE VIDEO BANANE KA SCRIPT

Jab aap client ko demo video record kar ke bhejenge, toh screen recorder (OBS Studio ya Camtasia) on karein aur microphone par yeh script bolein:

### 🎬 Scene 1: Introduction (Duration: 45 Seconds)
- **Screen**: Dashboard (`/dashboard`)
- **Voiceover**:
  > *"Assalam o Alaikum! Aaj hum PharmaDist Wholesale Medicine Distribution ERP ka live walkthrough dekhenge. Yeh software khas taur par pharmaceutical stockists, distributors, aur medicine wholesale agencies ke liye design kia gaya hai. Yeh 100% offline chalta hai aur aapke office ke tamam computers aur order bookers ke mobiles ko local Wi-Fi ke zariye connect kar sakta hai."*

### 🎬 Scene 2: Dashboard Cockpit (Duration: 30 Seconds)
- **Screen**: Dashboard KPI cards aur charts
- **Voiceover**:
  > *"Dashboard par aapko ek glance mein pata chalta hai ke aaj ki total sales kitni hai, market se cash recovery kitni hui, customers par total kitna udhaar (Receivables) hai, aur humne factory suppliers ko kitne paise dene hain. Sath hi top selling medicines aur expiry alert cards live update hotay hain."*

### 🎬 Scene 3: Purchase Intake & Batch Creation (Duration: 60 Seconds)
- **Screen**: Navigate to `/purchases/new`
- **Voiceover**:
  > *"Chalein ab ek factory consignment receive karte hain. Hum Purchases -> New Purchase par gaye. Yahan humne supplier select kia Getz Pharma. Dawai select ki Augmentin 625mg. Factory ka batch number daala, expiry date daali, aur 500 boxes receive kiye. Sath hi humne godown location likh di Rack B-4. Jaise hi humne submit kia, yeh batch foran hamare warehouse stock mein shamil ho gaya."*

### 🎬 Scene 4: Customer Credit Check & FEFO Wholesale Sale (Duration: 90 Seconds)
- **Screen**: Navigate to `/sales/new`
- **Voiceover**:
  > *"Ab hum ek medical store ko wholesale bill bana kar bechte hain. Humne pharmacy select ki Al-Shifa Medicos. Notice karein ke screen par foran customer ka credit gauge aa gaya ke inki limit Rs. 250,000 hai. Ab jaise hi humne Augmentin select ki, system ne khud ba khud First-Expire First-Out (FEFO) ke tehat sab se pehle expire hone wala batch pick kar liya taake hamara koi batch godown mein expire na ho. Agar customer ki credit limit cross ho rahi ho toh system warning deta hai. Humne order confirm kia."*

### 🎬 Scene 5: DRAP Single-Page Tax Invoice & Challan Print (Duration: 45 Seconds)
- **Screen**: Open `/invoices` $\rightarrow$ Print Modal
- **Voiceover**:
  > *"Yeh dekhein, system ne foran DRAP standards ke mutabiq A4 size ka professional Wholesale Tax Invoice generate kar diya. Isme batch number, manufacturing date, expiry date, TP, MRP aur net amount likha hai, sath hi customer seal aur warehouse dispatcher ki signature lines hain. Sath hi delivery boy ke liye bina keemat wala Delivery Challan bhi generate ho jata hai."*

### 🎬 Scene 6: Money Receipt & Recovery (Duration: 45 Seconds)
- **Screen**: Navigate to `/payments`
- **Voiceover**:
  > *"Jab salesman market se paise le kar aata hai, toh hum Payments par ja kar Record Collection par click karte hain. Pharmacy choose ki, received amount Rs. 50,000 daali, aur submit kia. System ne FIFO rule ke mutabiq purana bill pehle settle kar diya aur customer ke liye instant Money Receipt print modal khol diya."*

### 🎬 Scene 7: Profit & Financial Intelligence (Duration: 45 Seconds)
- **Screen**: Navigate to `/profit`
- **Voiceover**:
  > *"Yahan Executive Profit cockpit par hum apna asal munafa dekh sakte hain. Yeh Gross Profit aur tamam office expenses nikaal kar Net Profit dikhata hai. Mazeed yeh ke har dawai aur har salesman ka alag alag munafa bhi yahan live derive hota hai."*

### 🎬 Scene 8: Offline Database Backup & Conclusion (Duration: 30 Seconds)
- **Screen**: Navigate to `/settings` $\rightarrow$ Backup & Maintenance Tab
- **Voiceover**:
  > *"Aakhri cheez: Data protection. Settings mein Backup & Maintenance tab par jaakar aap ek click par poore system ka live database backup file download kar sakte hain taake aapka saara karobari data hamesha aapke paas safe rahe. Yeh hai PharmaDist Wholesale ERP — fast, reliable aur pharmaceutical wholesale ke liye mukammal solution. Shukriya!"*

---

## 6. TROUBLESHOOTING FAQ (KHAS SAWALAAT & JAWABAAT)

### Q1: Agar order book karte waqt "Stock Error" aa jaye toh kia karein?
**Jawab**: Iska matlab hai ke jis batch ko aap bechna chah rahe hain usme utna stock baqi nahi hai. `Purchases -> New Purchase` mein ja kar naya stock dakhil karein ya batch dropdown mein se doosra batch select karein.

### Q2: Agar bill banate waqt "Credit Barrier Exceeded" aa jaye toh kia karein?
**Jawab**: Iska matlab hai ke us pharmacy ka purana udhaar uski tay-shuda limit se barh raha hai. Ya toh pharmacy se pehle purana udhaar wasool karein (`/payments`), ya Sales Manager se bol kar "Credit Override Approved" ka checkmark tick karein.

### Q3: Agar koi dawai expire ho jaye toh kia system use bechne dega?
**Jawab**: **Hargiz nahi!** System expired dawai ko sales queue se foran block kar deta hai taake koi bhi staff ghalti se bhi expired batch ka bill na bana sakay.

### Q4: Kya hum doosre shehar ke branch godown ko maal bhej sakte hain?
**Jawab**: Ji haan! `/inventory/transfers` par jayein aur source warehouse se destination warehouse stock transfer kar dein. Dono godowns ka stock automatically update ho jayega.

---

*Yeh document PharmaDist Wholesale ERP repository ka official hissa hai aur client demonstration aur training ke liye tayar kia gaya hai.*
