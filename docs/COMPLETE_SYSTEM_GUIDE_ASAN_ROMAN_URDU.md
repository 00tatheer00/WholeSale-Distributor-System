# 📖 PharmaDist Wholesale ERP — Asan Roman Urdu Step-by-Step Manual & Video Script
### (Har Short Form Ki Full Form + Har Button Aur Option Ki Exact Screen Location Ke Sath)

**Software Name**: PharmaDist Wholesale Medicine Distribution Management System (WMDMS)  
**Printable PDF Available At**: [`docs/PharmaDist_Asan_Urdu_Guide.pdf`](./PharmaDist_Asan_Urdu_Guide.pdf)  
**Primary Currency**: Pakistani Rupee (`PKR / Rs.`)  
**Regulatory Standard**: Drug Regulatory Authority of Pakistan (DRAP) Wholesale Drug Licensing  
**System Architecture**: 100% Offline (Baghair Internet), Local Wi-Fi Multi-PC Network  

---

## 📑 Feexist (Table of Contents)

1. [Tamam Short Forms Ki Full Forms Aur Asan Matlab](#1-tamam-short-forms-ki-full-forms-aur-asan-matlab)
2. [Local Wi-Fi Par Doosre Computers / Mobiles Connect Karna](#2-local-wi-fi-par-doosre-computers--mobiles-connect-karna)
3. [Pre-Created Login Accounts (Pehle Se Bane Huay Logins)](#3-pre-created-login-accounts)
4. [Pehle Din Ka Setup (One-Time Initial Setup)](#4-pehle-din-ka-setup)
   - [Step 1: Company Profile Aur DRAP Wholesale License Setup](#step-1-company-profile-aur-drap-license)
   - [Step 2: Warehouse (Godown) Aur Racks Structure Banana](#step-2-warehouse-godown-aur-racks)
   - [Step 3: Manufacturers (Pharma Companies) Aur Suppliers Add Karna](#step-3-manufacturers-aur-suppliers)
   - [Step 4: Medicines (Dawaiyon Ka Master Catalog) Add Karna](#step-4-medicines-master-catalog)
   - [Step 5: Customer Pharmacies (Medical Stores) & Credit Limit Setup](#step-5-customer-pharmacies--credit-limit)
   - [Step 6: Sales Representatives (Order Bookers / Field Staff)](#step-6-sales-representatives-order-bookers)
5. [Rozana Ka Karobari Chakar (Daily Wholesale Operations)](#5-rozana-ka-karobari-chakar)
   - [Step 7: Factory Se Maal Dakhil Karna (Purchase Intake GRN)](#step-7-purchase-intake-grn)
   - [Step 8: Wholesale Order Book Karna (Strict FEFO Engine)](#step-8-wholesale-order-booking-fefo)
   - [Step 9: DRAP Form 2-A Tax Invoice Aur Delivery Challan Print Karna](#step-9-tax-invoice-aur-delivery-challan)
   - [Step 10: Market Recovery Collections & Money Receipt (RCT)](#step-10-market-recovery-collections--receipt)
   - [Step 11: Rozmarrah Ke Kharchay (Business Operating Expenses)](#step-11-rozmarrah-ke-kharchay)
   - [Step 12: Executive Profit Cockpit (Gross Profit vs Net Profit)](#step-12-executive-profit-cockpit)
   - [Step 13: Reports Suite & Excel / CSV Data Export](#step-13-reports-suite--excel-export)
   - [Step 14: Database Backup Download & Disaster Recovery](#step-14-database-backup-download)
6. [Client Ko Video Bna Kar Dikhane Ka Lafz-ba-Lafz Script (8 Scenes)](#6-client-video-recording-script)
7. [Khas Sawalaat Aur Asaan Jawabaat (Troubleshooting FAQ)](#7-troubleshooting-faq)

---

## 1. Tamam Short Forms Ki Full Forms Aur Asan Matlab

Pharma distribution mein jo mukhtasir alfaaz (abbreviations) aate hain, unka asan feham matlab:

| Short Form | Poora Naam (Full Form) | Asan Roman Urdu Mein Matlab |
| :--- | :--- | :--- |
| **TP** | Trade Price | Factory ki wholesale qeemat (jis rate par distributor khareedta ya medical store ko deta hai). |
| **MRP** | Maximum Retail Price | Dhabbe par chappi hui aam qeemat (jis rate par medical store mareez ko bechta hai). |
| **GRN** | Goods Receipt Note | Factory se consignment godown mein dakhil karne ki raseed (Stock-In). |
| **FEFO** | First-Expire, First-Out | Jo dawai pehle expire hogi, system pehle usi ko bechega taake godown mein zaya na ho. |
| **FIFO** | First-In, First-Out | Recovery aane par customer ka sab se purana bill pehle clear karna. |
| **AR** | Accounts Receivable | Pharmacies par kul udhaar jo humne market se wasool karna hai. |
| **AP** | Accounts Payable | Factory ya medicine company ko jo baqaya paise humne ada karne hain. |
| **COGS** | Cost of Goods Sold | Bikay huay maal ki asal khareed qeemat (asal lagat). |
| **DRAP** | Drug Regulatory Authority of Pakistan | Pakistan mein dawaiyon aur licensing ka sarkari idara. |
| **NTN** | National Tax Number | FBR ka tax registration number jo legal wholesale invoice par chapta hai. |
| **STRN** | Sales Tax Registration Number | Sales tax ka number. |
| **SKU** | Stock Keeping Unit | Dawai ka system ke andar unique pehchan code. |
| **P&L** | Profit and Loss | Karobar ka asal munafa aur nuqsan ka hisaab kitab. |
| **RCT** | Receipt | Payment wasooli raseed ka serial code (e.g. RCT-2026-00001). |
| **INV** | Invoice | Wholesale sale bill ka serial code (e.g. INV-2026-00001). |

---

## 2. Local Wi-Fi Par Doosre Computers / Mobiles Connect Karna

Yeh software **100% Offline** hai. Internet na bhi ho toh office ke tamam computers aur salesmen ke mobiles chalte hain:

1. **Host Server PC (Main Computer)**:
   - Asal database (`wmdms.db`) is computer par chalti hai: `http://localhost:3000`
2. **Billing Counter (Computer 2)**:
   - Main computer ka IP note karein (Command Prompt mein `ipconfig` likh kar `IPv4 Address` dekhein, maslan `172.20.100.127`).
   - Doosre computer ke browser mein likhein: `http://172.20.100.127:3000`
3. **Salesman Mobile / Tablet**:
   - Office Wi-Fi se connect karein aur mobile browser mein likhein: `http://172.20.100.127:3000`

---

## 3. Pre-Created Login Accounts

| Role (Uhda) | Login Email | Password | Ikhtiyarat |
| :--- | :--- | :--- | :--- |
| **Super Admin** (Owner) | `admin@pharmadist.com` | `admin123` | Har cheez ka full access, settings, backup, team aur audit logs. |
| **Sales Manager** | `sales.manager@pharmadist.com` | `sales123` | Naye orders banana, rate lagana, credit limit override approve karna. |
| **Warehouse Officer** | `warehouse@pharmadist.com` | `warehouse123` | Factory se maal dakhil karna (GRN), batches check karna, transfer. |
| **Accounts Officer** | `accounts@pharmadist.com` | `accounts123` | Market recovery dakhil karna, money receipts, expenses, munafa dekhna. |

---

## 4. Pehle Din Ka Setup (One-Time Initial Setup)

### Step 1: Company Profile Aur DRAP Wholesale License Setup
- **Screen Location**: `Left Sidebar Menu` $\rightarrow$ `Administration` $\rightarrow$ `System Settings` (`/settings`) $\rightarrow$ `Tab 1: General`.
- **Kia Karna Hai**: Apni wholesale agency ka official registered naam, DRAP License Number (e.g. `DRAP/WDL/LHR-4921`), NTN, STRN, aur Godown ka mukammal pata likh kar neelay button **"Save Changes"** par click karein. Yeh saari details printed bills par aayengi.

### Step 2: Warehouse (Godown) Aur Racks Structure Banana
- **Screen Location**: `Left Sidebar Menu` $\rightarrow$ `Inventory` $\rightarrow$ `Warehouses` (`/warehouses`) $\rightarrow$ Top-Right button `+ New Warehouse`.
- **Kia Karna Hai**: Apne Main Godown ka naam banayein (e.g. `Central Main Warehouse`), aur uske andar racks designate karein (e.g. `Rack A-01 (Antibiotics)`, `Cold Chain #1 (Insulin)`).

### Step 3: Manufacturers (Pharma Companies) Aur Suppliers Add Karna
- **Screen Location**: `Left Sidebar Menu` $\rightarrow$ `Master Data` $\rightarrow$ `Manufacturers` (`/manufacturers`) aur `Suppliers` (`/suppliers`) $\rightarrow$ Top-Right button `+ Add Supplier`.
- **Kia Karna Hai**: Factory companies (GSK, Abbott, Getz Pharma, Searle) ko register karein. Supplier ka naam, phone number, NTN, aur payment credit terms (30 din ka udhaar) likh kar save karein.

### Step 4: Medicines (Dawaiyon Ka Master Catalog) Add Karna
- **Screen Location**: `Left Sidebar Menu` $\rightarrow$ `Master Data` $\rightarrow$ `Medicines` (`/medicines`) $\rightarrow$ Top-Right button `+ Add Medicine`.
- **Kia Karna Hai**: Pop-up dialog khulay ga:
  - **Medicine Name**: e.g. `Augmentin 625mg Tablets`
  - **Generic Name (Formula)**: e.g. `Amoxicillin + Clavulanic Acid`
  - **Manufacturer**: Dropdown se company chunein (e.g. `GSK`)
  - **Dosage Form**: `Tablet`, `Syrup`, `Injection`, ya `Capsule`
  - **Trade Price (TP)**: Factory wholesale rate (e.g. `Rs. 240.00`)
  - **Retail Price (MRP)**: Dhabbe par likhi qeemat (e.g. `Rs. 280.00`)
  - **Wholesale Discount**: e.g. `5%`
  - **Reorder Alert Level**: e.g. `50 Packs`
  - Click karein **"Save Medicine"**.

### Step 5: Customer Pharmacies (Medical Stores) & Credit Limit Setup
- **Screen Location**: `Left Sidebar Menu` $\rightarrow$ `Master Data` $\rightarrow$ `Customer Pharmacies` (`/customers`) $\rightarrow$ Top-Right button `+ Add Customer`.
- **Kia Karna Hai**: Medical store ka naam (`Al-Shifa Medicos`), Drug License No (`DL-2026-9812`), maalik ka mobile no, route (`Mall Road`), aur sab se zaroori **Credit Limit (PKR)** (e.g. `Rs. 250,000`) aur **Credit Max Days** (e.g. `15 Days`) set karein. Agar kisi pharmacy ka udhaar limit se barh jaye, toh bill banate waqt system foran warning dega.

### Step 6: Sales Representatives (Order Bookers / Field Staff) Setup
- **Screen Location**: `Left Sidebar Menu` $\rightarrow$ `Master Data` $\rightarrow$ `Sales Representatives` (`/distributors`) $\rightarrow$ Top-Right button `+ Add Rep`.
- **Kia Karna Hai**: Field salesman ka naam, mobile number, assigned market route aur monthly recovery target enter karein.

---

## 5. Rozana Ka Karobari Chakar (Daily Operations)

### Step 7: Factory Se Maal Dakhil Karna (Purchase Intake GRN)
- **Screen Location**: `Left Sidebar Menu` $\rightarrow$ `Procurement` $\rightarrow$ `Purchase Intake` (`/purchases/new`).
- **Kia Karna Hai**:
  1. **Select Supplier**: Dropdown se factory chunein (e.g. `Getz Pharma`).
  2. **Delivery Challan No**: Factory invoice number daalein.
  3. **Select Medicine**: Dawai chunein (e.g. `Augmentin 625mg`).
  4. **Batch Number**: Dhabbe par likha batch daalein (e.g. `BT-9942`).
  5. **Expiry Date**: Expiry date select karein (e.g. `2028-06-30`).
  6. **Quantity Received**: Dhabbon ki tadad likhein (e.g. `500 Packs`).
  7. **Unit Purchase Cost**: Khareed qeemat likhein (e.g. `Rs. 200.00`).
  8. **Warehouse Rack**: Location chunein (e.g. `Rack B-04`).
  9. Click karein **"Submit Purchase Consignment"**. Godown stock aur Accounts Payable (AP) liability foran update ho jayegi!

### Step 8: Wholesale Order Book Karna (Strict FEFO Engine)
- **Screen Location**: `Left Sidebar Menu` $\rightarrow$ `Wholesale Sales` $\rightarrow$ `New Sale Order` (`/sales/new`).
- **Kia Karna Hai**:
  1. **Select Customer**: Pharmacy chunein (e.g. `Al-Shifa Medicos`). Saamne inka credit gauge show hoga.
  2. **Select Sales Rep**: Booking karne wala salesman chunein.
  3. **Add Medicine**: Dawai chunein aur dhabbon ki tadad likhein (e.g. `50 Packs`).
  4. **FEFO Ka Faida**: System godown ke batches mein se **sab se pehle expire hone wala batch khud utha lega** taake godown mein koi purana batch expire na ho.
  5. Click karein **"Confirm & Create Sale Order"**.

### Step 9: DRAP Form 2-A Tax Invoice Aur Delivery Challan Print Karna
- **Screen Location**: `Left Sidebar Menu` $\rightarrow$ `Wholesale Sales` $\rightarrow$ `Tax Invoices` (`/invoices`) $\rightarrow$ Action column mein Print icon (🖨️).
- **Kia Karna Hai**: Pop-up mein do options nazar aayenge:
  - **Print Tax Invoice (A4 Size)**: Poora qanooni bill jisme Batch No, Expiry, TP, MRP, discount, total dues aur legal signatures hotay hain.
  - **Print Delivery Challan**: Delivery boy ke liye bina qeemat wala challan.

### Step 10: Market Recovery Collections & Money Receipt (RCT)
- **Screen Location**: `Left Sidebar Menu` $\rightarrow$ `Finance & Accounts` $\rightarrow$ `Collections & Receipts` (`/payments`) $\rightarrow$ Top-Right button `+ Record Collection`.
- **Kia Karna Hai**: Pharmacy chunein, wasool shuda raqam (e.g. `Rs. 50,000`) daalein, Cash ya Cheque select karein aur click karein **"Confirm Collection"**. System FIFO ke mutabiq purane bills pehle clear karega aur foran **Print Money Receipt (RCT-2026-0001)** khol dega.

### Step 11: Rozmarrah Ke Kharchay (Business Operating Expenses)
- **Screen Location**: `Left Sidebar Menu` $\rightarrow$ `Finance & Accounts` $\rightarrow$ `Operating Expenses` (`/expenses`) $\rightarrow$ Top-Right button `+ Record Expense`.
- **Kia Karna Hai**: Kiraya, bijli, chai, salesman petrol allowance darj karein taake asal net profit calculate ho sakay.

### Step 12: Executive Profit Cockpit (Gross Profit vs Net Profit)
- **Screen Location**: `Left Sidebar Menu` $\rightarrow$ `Finance & Accounts` $\rightarrow$ `Profit & Financials` (`/profit`).
- **Kia Karna Hai**: Chaar baray cards dekhein:
  - **Sales Revenue**: Total kitne ka maal bika.
  - **Cost of Goods Sold (COGS)**: In dhabbon ki asal khareed qeemat.
  - **Gross Profit**: Khaam munafa (Sales minus COGS).
  - **Net Profit**: Tamam office kharchay nikaal kar jo pocket mein bacha.

### Step 13: Reports Suite & Excel / CSV Data Export
- **Screen Location**: `Left Sidebar Menu` $\rightarrow$ `Reports & Analytics` $\rightarrow$ `Reports Hub` (`/reports`).
- **Kia Karna Hai**: Customer Balances (AR), Supplier Liabilities (AP), Inventory Valuation, aur 30-Day Expiry Watchdog reports ko **"Export Excel (.xls)"** button se download karein.

### Step 14: Database Backup Download & Disaster Recovery
- **Screen Location**: `Left Sidebar Menu` $\rightarrow$ `Administration` $\rightarrow$ `System Settings` (`/settings`) $\rightarrow$ `Tab 8: Backup & Maintenance`.
- **Kia Karna Hai**: **"Download Live Database (.db)"** par click karein. File download ho kar aapke computer mein aa jayegi. Ise USB mein mehfooz karein. Agar computer kharab ho jaye, toh naye computer ke `prisma/` folder mein is file ko `wmdms.db` bana dein; 1 minute mein 100% data wapas aa jayega!

---

## 6. Client Ko Video Bna Kar Dikhane Ka Lafz-ba-Lafz Script

Screen recorder on karein aur microphone par yeh 8 scenes bolein:

- **Scene 1: Introduction (45s)**: Dashboard par: *"Assalam-o-Alaikum! Aaj hum PharmaDist Wholesale Medicine Distribution ERP ka live walkthrough dekhenge. Yeh software 100% offline chalta hai aur office ke tamam computers aur salesmen ke mobiles ko Wi-Fi ke zariye connect karta hai."*
- **Scene 2: Dashboard Metrics (30s)**: Dashboard cards par: *"Yahan aaj ki total sale, recovery, total udhaar (Receivables), aur factory ke baqaya paise live update hotay hain, sath hi 30-day batch expiry alerts bhi hain."*
- **Scene 3: Factory Stock Intake (60s)**: `/purchases/new` par: *"Hum factory se consignment receive karte hain. Supplier chuna, Augmentin select ki, batch number, expiry date aur rack location daali. Submit karte hi yeh stock mein shamil ho gaya."*
- **Scene 4: Wholesale Sale & FEFO (90s)**: `/sales/new` par: *"Ab pharmacy ko bill banate hain. Al-Shifa Medicos chuna — inka credit limit gauge aa gaya. Dawai add karte hi system ne FEFO ke mutabiq sab se pehle expire hone wala batch khud pick kar liya."*
- **Scene 5: DRAP Invoices & Challan (45s)**: `/invoices` par: *"System ne foran DRAP ke mutabiq A4 single-page Tax Invoice generate kar diya jisme batch, expiry, TP, MRP aur warranty stamp hai. Sath hi delivery driver ke liye baghair rate wala Delivery Challan bhi generate ho jata hai."*
- **Scene 6: Recovery & Receipts (45s)**: `/payments` par: *"Salesman market se recovery laya, humne Rs. 50,000 enter kiye. System ne FIFO rule ke mutabiq purana bill clear kia aur instant Money Receipt print ho gayi."*
- **Scene 7: Profit Cockpit (45s)**: `/profit` par: *"Distributor yahan apna asal Gross Profit aur tamam kharchay nikaal kar Net Profit live dekh sakta hai."*
- **Scene 8: Backup & Closing (30s)**: Settings Backup tab par: *"Aakhri baat: Ek click par live database backup download karein aur data safe rakhein. Shukriya!"*

---

## 7. Khas Sawalaat Aur Asaan Jawabaat (Troubleshooting FAQ)

- **Q: Order banate waqt "Stock Error" aaye toh?**  
  **Jawab**: Is batch mein stock khatam hai. `Purchases -> Purchase Intake` mein naya consignment dakhil karein.
- **Q: "Credit Limit Exceeded" alert ka matlab kia hai?**  
  **Jawab**: Customer ka udhaar unki tay-shuda limit se barh gaya hai. Pehle purani recovery daalein ya Sales Manager se override approve karwayein.
- **Q: Kia expired dawai bik sakti hai?**  
  **Jawab**: **Hargiz nahi!** System expired batch ko sales queue se khud ba khud block kar deta hai taake koi ghalti na ho.
- **Q: Computer kharab ho jaye toh data kaise wapas aayega?**  
  **Jawab**: Apni backup file ko naye computer ke `prisma/` folder mein copy karein aur uska naam `wmdms.db` rakh kar app start kar dein.
