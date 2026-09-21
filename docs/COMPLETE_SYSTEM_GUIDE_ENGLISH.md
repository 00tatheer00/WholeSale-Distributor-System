# 📖 PharmaDist Wholesale ERP — Comprehensive Operating Guide & Video Demo Script
### (Standard English Operating Manual & Production Blueprint)

**Software Platform**: PharmaDist Wholesale Medicine Distribution Management System (WMDMS)  
**Primary Currency**: Pakistani Rupee (`PKR / Rs.`)  
**Regulatory Standard**: Drug Regulatory Authority of Pakistan (DRAP) Wholesale Drug Licensing  
**System Architecture**: 100% Offline, Zero Cloud Dependency, Multi-PC LAN Network  
**Printable PDF Available At**: [`docs/PharmaDist_Complete_System_Guide.pdf`](./PharmaDist_Complete_System_Guide.pdf)  

---

## 📑 Table of Contents

1. [Core Purpose: Wholesale ERP vs. Retail POS](#1-core-purpose-wholesale-erp-vs-retail-pos)
2. [System Startup & Login Authentication](#2-system-startup--login-authentication)
3. [Multi-PC & Mobile LAN Setup (Local Office Wi-Fi)](#3-multi-pc--mobile-lan-setup)
4. [Step-by-Step Business Workflow (Standard Operating Procedures)](#4-step-by-step-business-workflow)
   - [Step 1: Company Profile & DRAP License Setup](#step-1-company-profile--drap-license-setup)
   - [Step 2: Warehouse Godown & Rack Architecture](#step-2-warehouse-godown--rack-architecture)
   - [Step 3: Manufacturers & Supplier Principals](#step-3-manufacturers--supplier-principals)
   - [Step 4: Medicine Master Formulary Registration](#step-4-medicine-master-formulary-registration)
   - [Step 5: Purchase Consignment Intake (Goods Receipt Note - GRN)](#step-5-purchase-consignment-intake-grn)
   - [Step 6: Customer Pharmacies & Credit Limit Governance](#step-6-customer-pharmacies--credit-limit-governance)
   - [Step 7: Sales Representatives & Order Bookers](#step-7-sales-representatives--order-bookers)
   - [Step 8: Wholesale Order Booking with Strict FEFO Dispatch](#step-8-wholesale-order-booking-with-strict-fefo-dispatch)
   - [Step 9: DRAP Form 2-A Tax Invoice & Non-Valued Delivery Challan](#step-9-drap-form-2-a-tax-invoice--delivery-challan)
   - [Step 10: Market Recovery Collections & FIFO Settlement](#step-10-market-recovery-collections--fifo-settlement)
   - [Step 11: Operational Overhead Expense Logging](#step-11-operational-overhead-expense-logging)
   - [Step 12: Executive Profit Cockpit (Gross Margin vs. Net Profit)](#step-12-executive-profit-cockpit)
   - [Step 13: Management Reports Suite & Excel/CSV Export](#step-13-management-reports-suite--excelcsv-export)
   - [Step 14: SQLite Database Backup & Disaster Recovery](#step-14-sqlite-database-backup--disaster-recovery)
   - [Step 15: Staff Team Governance & Forensic Audit Trails](#step-15-staff-team-governance--forensic-audit-trails)
5. [Client Demonstration Video Production Script](#5-client-demonstration-video-production-script)
6. [Operational Troubleshooting FAQ](#6-operational-troubleshooting-faq)

---

## 1. Core Purpose: Wholesale ERP vs. Retail POS

PharmaDist is an enterprise wholesale distribution ERP designed for authorized pharmaceutical distributors, stockists, and wholesale agencies. It adheres strictly to commercial and regulatory rules distinct from retail pharmacy counters:

| Operational Dimension | Retail Pharmacy POS | PharmaDist Wholesale ERP |
| :--- | :--- | :--- |
| **Customer Base** | Walk-in individual patients (loose strips, single units). | Licensed Medical Stores, Pharmacies, Hospital Formularies. |
| **Batch Tracking** | Optional or basic SKU-level tracking. | **Mandatory Batch Tracking** linked to every item sold. |
| **Inventory Queue** | FIFO or random unmanaged shelf picking. | **Strict FEFO (First-Expire, First-Out)** auto-prioritization. |
| **Credit Control** | Immediate cash payment / card tap. | **Credit Limit Barrier Engine** with manager approval workflows. |
| **Documentation** | Thermal roll receipts (80mm / 58mm). | **DRAP Form 2-A Wholesale Tax Invoices & Delivery Challans (A4)**. |

---

## 2. System Startup & Login Authentication

### Starting the Application:
In development mode, execute:
```bash
npm run dev
```
Once the console reports ready, launch your browser and navigate to:
👉 **`http://localhost:3000`**

### Pre-Configured System Credentials:

| Role | Login Email | Default Password | Assigned Capabilities |
| :--- | :--- | :--- | :--- |
| **Super Administrator** | `admin@pharmadist.com` | `admin123` | Full unrestricted access, settings, backups, user accounts & audit logs. |
| **Sales Manager** | `sales.manager@pharmadist.com` | `sales123` | Sales orders, pricing adjustments, credit limit override approvals. |
| **Warehouse Officer** | `warehouse@pharmadist.com` | `warehouse123` | Factory stock intake (GRN), batch verification, inter-warehouse transfers. |
| **Accounts Officer** | `accounts@pharmadist.com` | `accounts123` | Collections, payment vouchers, supplier settlements & P&L audits. |

---

## 3. Multi-PC & Mobile LAN Setup (Local Office Wi-Fi)

PharmaDist operates 100% offline. Multiple workstations and field devices connect over your office Wi-Fi router without requiring any internet connection:

1. **Host Server PC**: Runs the master instance on `http://localhost:3000`.
2. Find the Host Server's Local IPv4 Address (e.g., `172.20.100.127` or `192.168.1.50`).
3. **Client Workstations & Tablets**: Open any browser on the same Wi-Fi network and navigate to:  
   👉 **`http://172.20.100.127:3000`**
4. All workstations share real-time access to the centralized database with instantaneous synchronization.

---

## 4. Step-by-Step Business Workflow

Follow this logical 15-step operational sequence:

### Step 1: Company Profile & DRAP License Setup
- **Path**: `Settings -> General` (`/settings`)
- Enter your Registered Wholesale Firm Name, DRAP Wholesale Drug License No. (e.g., `DRAP/WDL/LHR-4921`), NTN, STRN, warehouse address, and bank payment instructions. These credentials are automatically printed on all legal invoices and dispatch challans.

### Step 2: Warehouse Godown & Rack Architecture
- **Path**: `Inventory -> Warehouses` (`/inventory/warehouses`)
- Establish your primary central godown and configure shelf/rack designations (e.g., `Rack A-01 (Antibiotics)`, `Cold Chain Unit #2 (Insulins)`).

### Step 3: Manufacturers & Supplier Principals
- **Path**: `Purchases -> Suppliers` (`/purchases/suppliers`)
- Register licensed pharmaceutical manufacturing companies (e.g., GlaxoSmithKline, Abbott Laboratories, Getz Pharma, Searle, Highnoon). Record supplier NTN, payment credit duration, and contact persons.

### Step 4: Medicine Master Formulary Registration
- **Path**: `Medicines -> Catalog` (`/medicines`)
- Register medicine catalog items specifying Generic salt names, dosage forms, Trade Price (TP), Maximum Retail Price (MRP), wholesale discount percentages, and minimum inventory reorder levels.

### Step 5: Purchase Consignment Intake (GRN)
- **Path**: `Purchases -> New Consignment` (`/purchases/new`)
- Record incoming factory shipments. Select the supplier, input the delivery challan number, and specify batch numbers, manufacturing dates, expiry dates, purchase unit rates, and rack locations. Submitting updates warehouse stock and Accounts Payable liabilities synchronously.

### Step 6: Customer Pharmacies & Credit Limit Governance
- **Path**: `Customers -> Directory` (`/customers`)
- Register retail pharmacies, clinics, and hospital pharmacies. Input Pharmacy Drug License numbers, owner contact details, sales territories, and strict credit limits (e.g., Rs. 300,000 with a 15-day maximum duration).

### Step 7: Sales Representatives & Order Bookers
- **Path**: `Sales Reps -> Teams` (`/sales-reps`)
- Register field booking agents and territory sales officers. Assign sales routes and monthly recovery quotas.

### Step 8: Wholesale Order Booking with Strict FEFO Dispatch
- **Path**: `Sales -> New Wholesale Order` (`/sales/new`)
- Select customer pharmacy. The credit gauge displays current dues against the credit limit. As medicines are added, the system automatically pulls the earliest expiring valid batch (Strict FEFO). Orders breaching customer credit limits enforce manager approval overrides.

### Step 9: DRAP Form 2-A Tax Invoice & Non-Valued Delivery Challan
- **Path**: `Invoices -> Print Engine` (`/invoices`)
- Click **Print Invoice** to generate standard single-page A4 wholesale documents with complete batch tracking, Trade Price, MRP, warranty clauses, and authorized signature blocks. Click **Print Challan** to generate warehouse dispatch notes without commercial prices for delivery drivers.

### Step 10: Market Recovery Collections & FIFO Settlement
- **Path**: `Payments -> New Collection` (`/payments`)
- Record market recoveries against Cash, Cheque, Bank Transfer, or Raast. The FIFO allocation engine automatically clears the oldest pending invoices first and produces an official printable **Money Receipt (RCT)**.

### Step 11: Operational Overhead Expense Logging
- **Path**: `Expenses -> Ledger` (`/expenses`)
- Record warehouse rent, utilities, tea/stationery, field allowances, and marketing promotions. Expenses deduct immediately from gross margins to reflect true Net Profit.

### Step 12: Executive Profit Cockpit
- **Path**: `Profit & Loss -> Executive Cockpit` (`/profit`)
- Track financial health via four core metrics: **Sales Revenue**, **Cost of Goods Sold (COGS)**, **Gross Profit**, and **Net Profit**. Breakdowns reveal profit per individual medicine and per sales representative.

### Step 13: Management Reports Suite & Excel/CSV Export
- **Path**: `Reports -> Reporting Center` (`/reports`)
- Access 9 dedicated reports: Customer Balances (AR), Supplier Liabilities (AP), Inventory Valuation, Batch Expiry Watchdog (30/60/90 Days), Low Stock Reorder, and Sales Rep Targets. Export any report to Excel (.xls) or CSV with a single click.

### Step 14: SQLite Database Backup & Disaster Recovery
- **Path**: `Settings -> Backup & Maintenance` (`/settings`)
- Download live single-file SQLite database backups (`.db`) directly to your USB drive or cloud backup storage. In case of hardware replacement, copying your backup file back into `prisma/wmdms.db` restores 100% of transactions, accounts, and batch history instantly.

### Step 15: Staff Team Governance & Forensic Audit Trails
- **Path**: `Audit Logs -> Forensic Logs` (`/audit-logs`)
- Role-Based Access Control (RBAC) isolates permissions across Super Admins, Sales Managers, Accounts Officers, and Cashiers. All critical events (price adjustments, cancellations, credit overrides) are immutably logged with exact user IDs, timestamps, and previous/new values.

---

## 5. Client Demonstration Video Production Script

| Scene | Target Screen | Narration Focus | Target Duration |
| :--- | :--- | :--- | :--- |
| **Scene 1** | Dashboard (`/dashboard`) | Welcome & platform overview: 100% offline, zero internet dependency, multi-PC office LAN network. | 45 Seconds |
| **Scene 2** | Dashboard KPI Cards | Real-time cockpit: Today's sales, market collections, pharmacy receivables, and supplier liabilities. | 30 Seconds |
| **Scene 3** | New Purchase (`/purchases/new`) | Receiving factory consignments, recording manufacturer batch numbers, expiry dates, and rack coordinates. | 60 Seconds |
| **Scene 4** | Wholesale Sale (`/sales/new`) | Customer credit check, automated First-Expire First-Out (FEFO) batch allocation, and credit limit guardrails. | 90 Seconds |
| **Scene 5** | Print Invoice (`/invoices`) | Single-page DRAP Wholesale Tax Invoice and non-priced Delivery Challan generation. | 45 Seconds |
| **Scene 6** | Payments (`/payments`) | Field market recovery, FIFO automated bill clearance, and Money Receipt voucher printing. | 45 Seconds |
| **Scene 7** | Profit Intelligence (`/profit`) | Real-time Gross vs. Net Profit, batch COGS tracking, and margin analysis. | 45 Seconds |
| **Scene 8** | Backup & Settings (`/settings`) | One-click SQLite database download, data protection, and closing remarks. | 30 Seconds |

---

## 6. Operational Troubleshooting FAQ

- **Q: Why does an order display "Stock Depleted"?**  
  **A**: The selected batch has reached zero units. Enter a new purchase consignment or select an alternative available batch.
- **Q: What triggers a "Credit Limit Exceeded" alert?**  
  **A**: The client pharmacy's outstanding dues exceed their configured limit. Either collect market payments or request a Sales Manager credit override approval.
- **Q: Does the system permit selling expired medicines?**  
  **A**: Strictly prohibited. The system automatically quarantines expired batches from the active sales queue to ensure full DRAP compliance.
- **Q: How can data be restored following hardware failure?**  
  **A**: Simply copy your latest downloaded `pharmadist-backup.db` file into the `prisma/` folder and name it `wmdms.db`. Restart the application to resume operations seamlessly.
