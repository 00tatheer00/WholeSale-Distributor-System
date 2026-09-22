# 📖 PharmaDist Wholesale ERP — Easy Step-by-Step User Guide & Video Script
### (Full Abbreviations, UI Screen Locations & Step-by-Step Practical Manual)

**Software Name**: PharmaDist Wholesale Medicine Distribution Management System (WMDMS)  
**Printable PDF Available At**: [`docs/PharmaDist_Easy_English_Guide.pdf`](./PharmaDist_Easy_English_Guide.pdf)  
**Primary Currency**: Pakistani Rupee (`PKR / Rs.`)  
**Regulatory Standard**: Drug Regulatory Authority of Pakistan (DRAP) Wholesale Drug Licensing  
**System Architecture**: 100% Offline (No Internet Required), Local Wi-Fi Multi-PC Network  

---

## 📑 Table of Contents

1. [All Short Forms with Full Names & Plain-English Meaning](#1-all-short-forms-with-full-names--plain-english-meaning)
2. [Connecting Other Office PCs & Mobile Devices via Local Wi-Fi](#2-connecting-other-office-pcs--mobile-devices-via-local-wi-fi)
3. [Pre-Configured System Login Accounts](#3-pre-configured-system-login-accounts)
4. [Initial Setup: One-Time Configuration](#4-initial-setup-one-time-configuration)
   - [Step 1: Company Profile & DRAP License Setup](#step-1-company-profile--drap-license-setup)
   - [Step 2: Warehouse (Godown) & Storage Racks Architecture](#step-2-warehouse-godown--storage-racks-architecture)
   - [Step 3: Manufacturers & Supplier Principals](#step-3-manufacturers--supplier-principals)
   - [Step 4: Medicines (Master Drug Catalog) Registration](#step-4-medicines-master-drug-catalog-registration)
   - [Step 5: Customer Pharmacies & Credit Limit Governance](#step-5-customer-pharmacies--credit-limit-governance)
   - [Step 6: Sales Representatives & Field Order Bookers](#step-6-sales-representatives--field-order-bookers)
5. [Daily Wholesale Operations Workflow](#5-daily-wholesale-operations-workflow)
   - [Step 7: Receiving Factory Shipments (Purchase Intake GRN)](#step-7-receiving-factory-shipments-purchase-intake-grn)
   - [Step 8: Wholesale Order Booking (Strict FEFO Batch Engine)](#step-8-wholesale-order-booking-strict-fefo-batch-engine)
   - [Step 9: Printing DRAP Form 2-A Tax Invoices & Delivery Challans](#step-9-printing-drap-form-2-a-tax-invoices--delivery-challans)
   - [Step 10: Market Recovery Collections & Printable Money Receipts (RCT)](#step-10-market-recovery-collections--printable-money-receipts-rct)
   - [Step 11: Operating Business Expenses Logging](#step-11-operating-business-expenses-logging)
   - [Step 12: Executive Profit Cockpit (Gross Profit vs Net Profit)](#step-12-executive-profit-cockpit-gross-profit-vs-net-profit)
   - [Step 13: Management Reports Hub & Excel / CSV Export](#step-13-management-reports-hub--excel--csv-export)
   - [Step 14: Database Backup Download & Instant Disaster Recovery](#step-14-database-backup-download--instant-disaster-recovery)
6. [Scene-by-Scene Client Demonstration Video Script (8 Scenes)](#6-scene-by-scene-client-demonstration-video-script)
7. [Operational Troubleshooting FAQ](#7-operational-troubleshooting-faq)

---

## 1. All Short Forms with Full Names & Plain-English Meaning

| Short Form | Full Name | What It Means in Plain English |
| :--- | :--- | :--- |
| **TP** | Trade Price | The manufacturer's wholesale price at which distributors purchase and bill to pharmacies. |
| **MRP** | Maximum Retail Price | The consumer price printed on the medicine box for retail patients. |
| **GRN** | Goods Receipt Note | The official warehouse intake voucher recorded when factory consignments arrive (Stock-In). |
| **FEFO** | First-Expire, First-Out | The system automatically selects the earliest-expiring batch first to eliminate expired stock losses. |
| **FIFO** | First-In, First-Out | When receiving customer payments, the oldest unpaid bill is cleared first. |
| **AR** | Accounts Receivable | Total credit money owed to your agency by pharmacies and medical stores. |
| **AP** | Accounts Payable | Total unpaid debt your agency owes to pharma manufacturers and vendors. |
| **COGS** | Cost of Goods Sold | The exact original purchase cost of the items sold, used to calculate true profit. |
| **DRAP** | Drug Regulatory Authority of Pakistan | The federal government regulatory body governing pharmaceutical licensing, sales, and labeling. |
| **NTN / STRN** | National Tax No. / Sales Tax Reg. No. | Official FBR tax registration numbers printed on legal wholesale invoices. |
| **SKU** | Stock Keeping Unit | The unique catalog code assigned to each medicine in the database. |
| **P&L** | Profit and Loss | The financial accounting statement showing business Gross and Net Profit. |
| **RCT** | Receipt | Payment collection voucher serial (e.g. `RCT-2026-00001`). |
| **INV** | Invoice | Wholesale sales invoice serial (e.g. `INV-2026-00001`). |

---

## 2. Connecting Other Office PCs & Mobile Devices via Local Wi-Fi

PharmaDist is **100% Offline**. No internet connection is ever required. Multiple computers and phones communicate seamlessly over your local office Wi-Fi router:

1. **Main Server Computer**:
   - Holds the master database (`wmdms.db`). Runs at: `http://localhost:3000`
2. **Billing Counter Workstation (PC 2)**:
   - Check the Server's Local IPv4 Address (open Command Prompt on the server, type `ipconfig`, e.g. `172.20.100.127`).
   - On PC 2, open any browser and type: `http://172.20.100.127:3000`
3. **Salesman Mobile / Tablet**:
   - Connect to office Wi-Fi and open: `http://172.20.100.127:3000`

---

## 3. Pre-Configured System Login Accounts

| Role | Login Email | Default Password | Assigned Capabilities |
| :--- | :--- | :--- | :--- |
| **Super Admin** (Owner) | `admin@pharmadist.com` | `admin123` | Full unrestricted access, settings, backups, user accounts, and audit logs. |
| **Sales Manager** | `sales.manager@pharmadist.com` | `sales123` | Create orders, manage customer rates, approve credit limit overrides. |
| **Warehouse Officer** | `warehouse@pharmadist.com` | `warehouse123` | Receive factory consignments (GRN), inspect batches, transfer stock. |
| **Accounts Officer** | `accounts@pharmadist.com` | `accounts123` | Record recoveries, print money receipts, log expenses, audit P&L. |

---

## 4. Initial Setup: One-Time Configuration

### Step 1: Company Profile & DRAP License Setup
- **Screen Location**: `Left Sidebar Menu` $\rightarrow$ `Administration` $\rightarrow$ `System Settings` (`/settings`) $\rightarrow$ `Tab 1: General`.
- **What to Do**: Enter your official registered wholesale firm name, DRAP Wholesale Drug License No. (e.g. `DRAP/WDL/LHR-4921`), NTN, STRN, warehouse address, and bank account information. Click the blue button at bottom-right: **"Save Changes"**.

### Step 2: Warehouse (Godown) & Storage Racks Architecture
- **Screen Location**: `Left Sidebar Menu` $\rightarrow$ `Inventory` $\rightarrow$ `Warehouses` (`/warehouses`) $\rightarrow$ Top-Right button `+ New Warehouse`.
- **What to Do**: Create your storage facility name (e.g. `Central Main Warehouse`). Inside, configure rack coordinates (e.g. `Rack A-01 (Antibiotics)`, `Cold Chain #1 (Insulin)`) so staff know exactly where each medicine is stored.

### Step 3: Manufacturers & Supplier Principals
- **Screen Location**: `Left Sidebar Menu` $\rightarrow$ `Master Data` $\rightarrow$ `Manufacturers` (`/manufacturers`) and `Suppliers` (`/suppliers`) $\rightarrow$ Top-Right button `+ Add Supplier`.
- **What to Do**: Register pharmaceutical manufacturing companies (GSK, Abbott Laboratories, Getz Pharma, Searle). Record contact persons, phone numbers, NTN, and credit payment duration (e.g. 30 Days Net).

### Step 4: Medicines (Master Drug Catalog) Registration
- **Screen Location**: `Left Sidebar Menu` $\rightarrow$ `Master Data` $\rightarrow$ `Medicines` (`/medicines`) $\rightarrow$ Top-Right button `+ Add Medicine`.
- **What to Do**: Fill in the modal form:
  - **Medicine Name**: e.g. `Augmentin 625mg Tablets`
  - **Generic Formula**: e.g. `Amoxicillin + Clavulanic Acid`
  - **Manufacturer**: Select company from dropdown (e.g. `GSK`)
  - **Dosage Form**: `Tablet`, `Syrup`, `Injection`, or `Capsule`
  - **Trade Price (TP)**: Wholesale cost rate (e.g. `Rs. 240.00`)
  - **Retail Price (MRP)**: Box retail price (e.g. `Rs. 280.00`)
  - **Wholesale Discount**: e.g. `5%`
  - **Reorder Alert Level**: e.g. `50 Packs`
  - Click **"Save Medicine"**.

### Step 5: Customer Pharmacies & Credit Limit Governance
- **Screen Location**: `Left Sidebar Menu` $\rightarrow$ `Master Data` $\rightarrow$ `Customer Pharmacies` (`/customers`) $\rightarrow$ Top-Right button `+ Add Customer`.
- **What to Do**: Register retail pharmacies (`Al-Shifa Medicos`), Drug License No (`DL-2026-9812`), contact number, sales territory route, and set the strict **Credit Limit (PKR)** (e.g. `Rs. 250,000`) and **Credit Max Days** (e.g. `15 Days`).
- *Protection: If Al-Shifa Medicos exceeds their Rs. 250,000 credit ceiling, the system locks their order automatically.*

### Step 6: Sales Representatives & Field Order Bookers
- **Screen Location**: `Left Sidebar Menu` $\rightarrow$ `Master Data` $\rightarrow$ `Sales Representatives` (`/distributors`) $\rightarrow$ Top-Right button `+ Add Rep`.
- **What to Do**: Register order booking agents, assign sales routes, and specify monthly recovery quotas to evaluate performance and commissions.

---

## 5. Daily Wholesale Operations Workflow

### Step 7: Receiving Factory Shipments (Purchase Intake GRN)
- **Screen Location**: `Left Sidebar Menu` $\rightarrow$ `Procurement` $\rightarrow$ `Purchase Intake` (`/purchases/new`).
- **What to Do**:
  1. **Select Supplier**: Choose manufacturer (e.g. `Getz Pharma`).
  2. **Delivery Challan No**: Manufacturer invoice number.
  3. **Select Medicine**: Choose medicine (e.g. `Augmentin 625mg`).
  4. **Batch Number**: Batch printed on carton (e.g. `BT-9942`).
  5. **Expiry Date**: Expiry printed on carton (e.g. `2028-06-30`).
  6. **Quantity Received**: Number of boxes (e.g. `500 Packs`).
  7. **Unit Purchase Cost**: Cost rate per box (e.g. `Rs. 200.00`).
  8. **Warehouse Rack**: Physical location (e.g. `Rack B-04`).
  9. Click **"Submit Purchase Consignment"**. 500 boxes are added to stock, Batch BT-9942 is registered, and Accounts Payable (AP) liability is recorded.

### Step 8: Wholesale Order Booking (Strict FEFO Batch Engine)
- **Screen Location**: `Left Sidebar Menu` $\rightarrow$ `Wholesale Sales` $\rightarrow$ `New Sale Order` (`/sales/new`).
- **What to Do**:
  1. **Select Customer**: Pharmacy (e.g. `Al-Shifa Medicos`). Their live credit gauge appears.
  2. **Select Sales Rep**: Booking agent.
  3. **Add Medicine**: Choose medicine and box quantity (e.g. `50 Packs`).
  4. **FEFO Advantage**: The system automatically pulls the **earliest-expiring valid batch** to guarantee no expired stock is left in the warehouse.
  5. Click **"Confirm & Create Sale Order"**.

### Step 9: Printing DRAP Form 2-A Tax Invoices & Delivery Challans
- **Screen Location**: `Left Sidebar Menu` $\rightarrow$ `Wholesale Sales` $\rightarrow$ `Tax Invoices` (`/invoices`) $\rightarrow$ Action column Print icon (🖨️).
- **What to Do**: In the modal, choose:
  - **Print Tax Invoice (A4 Standard)**: Legal wholesale invoice with Batch No, Expiry, TP, MRP, discount, and signature blocks for the customer.
  - **Print Delivery Challan**: Non-priced dispatch note for delivery drivers containing only quantities and batch numbers.

### Step 10: Market Recovery Collections & Printable Money Receipts (RCT)
- **Screen Location**: `Left Sidebar Menu` $\rightarrow$ `Finance & Accounts` $\rightarrow$ `Collections & Receipts` (`/payments`) $\rightarrow$ Top-Right button `+ Record Collection`.
- **What to Do**: Select pharmacy, enter amount collected (e.g. `Rs. 50,000`), choose Cash or Cheque, and click **"Confirm Collection"**. The system clears the customer's oldest pending invoices first (FIFO) and opens a printable **Money Receipt (RCT-2026-0001)**.

### Step 11: Operating Business Expenses Logging
- **Screen Location**: `Left Sidebar Menu` $\rightarrow$ `Finance & Accounts` $\rightarrow$ `Operating Expenses` (`/expenses`) $\rightarrow$ Top-Right button `+ Record Expense`.
- **What to Do**: Record warehouse rent, utility bills, tea/stationery, salesman fuel allowances, and promotions to calculate true Net Profit.

### Step 12: Executive Profit Cockpit (Gross Profit vs Net Profit)
- **Screen Location**: `Left Sidebar Menu` $\rightarrow$ `Finance & Accounts` $\rightarrow$ `Profit & Financials` (`/profit`).
- **What to Do**: Review the 4 core cards:
  - **Sales Revenue**: Total invoiced sales.
  - **COGS (Purchase Cost)**: Original cost basis of sold items.
  - **Gross Profit**: Gross trading margin (Sales minus COGS).
  - **Net Profit**: Operational profit remaining after deducting overhead expenses.

### Step 13: Management Reports Hub & Excel / CSV Export
- **Screen Location**: `Left Sidebar Menu` $\rightarrow$ `Reports & Analytics` $\rightarrow$ `Reports Hub` (`/reports`).
- **What to Do**: Generate Customer Balances (AR), Supplier Liabilities (AP), Stock Valuation, and 30-Day Batch Expiry Watchdog reports. Click **"Export Excel (.xls)"** to download anytime.

### Step 14: Database Backup Download & Instant Disaster Recovery
- **Screen Location**: `Left Sidebar Menu` $\rightarrow$ `Administration` $\rightarrow$ `System Settings` (`/settings`) $\rightarrow$ `Tab 8: Backup & Maintenance`.
- **What to Do**: Click **"Download Live Database (.db)"**. Save the file to an external USB drive.
- *Disaster Recovery: If the server computer crashes, simply copy this backup file into the `prisma/` folder as `wmdms.db` on your replacement computer. In 60 seconds, 100% of data is restored!*

---

## 6. Scene-by-Scene Client Demonstration Video Script

- **Scene 1: Introduction (45s)**: Dashboard screen: *"Welcome! Today we are demonstrating PharmaDist Wholesale ERP — built specifically for pharmaceutical stockists, wholesale distributors, and medicine agencies. Operating 100% offline with zero internet required, PharmaDist connects all office PCs and field mobile bookers over local Wi-Fi."*
- **Scene 2: Dashboard Metrics (30s)**: Dashboard cards: *"Here distributors gain immediate visibility into today's sales, market collections, pharmacy debt receivables, and supplier liabilities, along with live 30-day batch expiry alerts."*
- **Scene 3: Factory Stock Intake (60s)**: `/purchases/new` screen: *"Now let's receive a factory consignment. We select Getz Pharma, choose Augmentin 625mg, enter the batch number, expiry date, purchase cost, and warehouse rack location. Submitting updates stock and accounts payable immediately."*
- **Scene 4: Wholesale Order Booking (90s)**: `/sales/new` screen: *"Next, we book an order for Al-Shifa Medicos. The live credit gauge appears. As we add medicine, PharmaDist's FEFO engine automatically selects the earliest-expiring batch to eliminate expired stock loss."*
- **Scene 5: DRAP Invoices & Challan (45s)**: `/invoices` screen: *"With one click, PharmaDist generates a single-page DRAP-compliant Wholesale Tax Invoice with batch numbers, expiry dates, TP, MRP, and legal seals. Simultaneously, a non-priced Delivery Challan is generated for delivery drivers."*
- **Scene 6: Recovery & Receipts (45s)**: `/payments` screen: *"When field agents return, we record payments. PharmaDist applies FIFO settlement against the oldest unpaid bills and prints an official Money Receipt voucher for the pharmacy."*
- **Scene 7: Profit Cockpit (45s)**: `/profit` screen: *"Here on the Profit Cockpit, distributors analyze exact Gross Margins and Net Operational Profit after deducting warehouse expenses and staff allowances."*
- **Scene 8: Backup & Closing (30s)**: Settings Backup tab: *"Finally, in the Backup tab, administrators download a full SQLite database snapshot with one click to guarantee complete data security. Thank you!"*

---

## 7. Operational Troubleshooting FAQ

- **Q: Why does an order display "Stock Depleted"?**  
  **Answer**: The selected batch has reached zero units. Create a new purchase consignment in `Purchases -> Purchase Intake`.
- **Q: What does "Credit Limit Exceeded" alert mean?**  
  **Answer**: The pharmacy's outstanding dues exceed their configured limit. Collect payment or request a Sales Manager credit override approval.
- **Q: Can expired medicines be billed?**  
  **Answer**: Strictly prohibited. The system automatically quarantines expired batches from the active sales queue to ensure full DRAP compliance.
- **Q: How to restore data if the computer crashes?**  
  **Answer**: Simply copy your latest downloaded `pharmadist-backup.db` file into the `prisma/` folder and name it `wmdms.db`. Restart the application to resume operations seamlessly.
