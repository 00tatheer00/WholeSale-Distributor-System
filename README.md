# Wholesale Medicine Distribution Management System (WMDMS)

> **Enterprise Web-Based ERP for Wholesale Pharmaceutical Distributors, Stockists, and Drug Suppliers**

---

## 1. Project Overview

The **Wholesale Medicine Distribution Management System (WMDMS)** is an enterprise web application designed exclusively for high-volume, multi-tier pharmaceutical wholesale distribution. 

### Core Architectural Guardrails:
- **Wholesale Pharma ERP Only**: Tailored strictly for B2B wholesale pharmaceutical business (Manufacturer $\rightarrow$ Purchase $\rightarrow$ Warehouse/FEFO $\rightarrow$ Sales Rep $\rightarrow$ Customer Pharmacy $\rightarrow$ Invoicing $\rightarrow$ AR Dues $\rightarrow$ COGS/Profit).
- **Batch & FEFO Enforcement**: Automated First-Expire, First-Out queue allocation with mandatory expiration date tracking and DGDA quarantine guards.
- **Credit Risk Protection**: Automated customer credit limits and overdue aging thresholds to prevent bad debt exposure.
- **Accurate Margin Accounting**: Real-time batch-specific Cost of Goods Sold (COGS) tracking for authentic Gross and Net profit calculation ($\text{Revenue} - \text{COGS} = \text{Gross Profit}$).
- **Double-Entry Traceability**: Immutable audit logs and double-entry stock movement tracking.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router, Server Components & Server Actions) |
| **Language** | TypeScript 5 (Strict Mode) |
| **Styling & Design System** | Tailwind CSS + shadcn/ui + Lucide Icons (Apple-Inspired Aesthetic) |
| **Theme** | Light / Dark Mode via `next-themes` |
| **Database** | Supabase PostgreSQL 15+ |
| **ORM & Migrations** | Prisma 6 with transaction pooling |
| **Authentication** | Supabase Auth (`@supabase/ssr`) with Cookie Session Management |
| **Storage** | Supabase Storage (`company-logos`, `documents`) |
| **Data Validation** | Zod (End-to-End Type Validation) |
| **Form Handling** | React Hook Form + `@hookform/resolvers` |
| **Data Tables** | TanStack Table v8 |
| **Charts & Analytics** | Recharts |
| **Transactional Email** | Resend API |
| **Deployment Target** | Vercel Edge / Serverless Platform |

---

## 3. Implemented Enterprise Modules (M01 – M16)

1. **Authentication & RBAC**: Supabase Auth with server-side middleware route guards (`/login`, `/reset-password`).
2. **Distribution Command Dashboard (`/dashboard`)**: Real-time business KPIs, sales/purchase trajectories, top medicines, receivables, and payables.
3. **Medicine & Therapeutic Master (`/medicines`, `/categories`)**: Drug catalog, generic formulations, dosage forms, and unit conversions.
4. **FEFO Batch & Expiry Engine (`/medicines/[id]`, `/inventory`)**: Batch creation, unit trade price, MRP, acquisition cost, and expiry tracking.
5. **Inventory & Stock Ledgers (`/inventory/movements`, `/inventory/adjustments`)**: Immutable double-entry stock movement ledger with negative stock prevention.
6. **Manufacturer Suppliers & AP (`/suppliers`, `/suppliers/[id]`)**: Vendor directory, accounts payable (AP) balance ledger, and payment terms.
7. **Procurement & Consignments (`/purchases`, `/purchases/new`, `/purchases/[id]`)**: Multi-item purchase intake, batch creation, and safe rollback reversal.
8. **Customer Pharmacies & AR (`/customers`, `/customers/[id]`, `/customers/[id]/ledger`)**: Licensed pharmacy directory, credit gauge, and chronological statement ledger.
9. **Wholesale Sales & Invoicing (`/sales`, `/sales/new`, `/sales/[id]`)**: High-speed booking, atomic FEFO batch allocation, historical COGS capture, and credit barrier checks.
10. **DGDA Wholesale Tax Invoices (`/invoices`, `/invoices/[id]`)**: DGDA-compliant invoices and printable delivery challans.
11. **Collections & Money Receipts (`/payments`)**: Customer collections, FIFO invoice settlement, and supplier disbursement vouchers.
12. **Medical Representatives (`/distributors`, `/distributors/[id]`)**: Representative directory, 360° sales & collection cockpits, and net contribution.
13. **Operating Expenses (`/expenses`)**: Direct and overhead expense heads, expense vouchers (`EXP-YYYY-XXXXX`), and cancellation.
14. **Profit & Financials (`/profit`)**: Exact P&L intelligence with historical batch COGS preservation, gross margins, and net margins.
15. **Reports Center & Analytics (`/reports`)**: 10+ sub-reports (`/reports/sales`, `/reports/purchases`, `/reports/inventory`, `/reports/expiry`, `/reports/low-stock`, `/reports/customer-dues`, `/reports/supplier-dues`, `/reports/medicines`, `/reports/payments`) with filtered CSV export.
16. **System Administration & Audit Logs (`/settings`, `/audit-logs`, `/notifications`)**: System settings, immutable audit explorer with payload diffs, and real-time business alerts.

---

## 4. Local Development Setup

### 1. Prerequisites
- Node.js 20+
- PostgreSQL database or Supabase project

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/00tatheer00/WholeSale-Distributor-System.git
cd "WholeSale-Distributor-System"

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
```

### 3. Database Schema Setup
```bash
# Generate Prisma Client
npx prisma generate

# Apply migrations
npx prisma migrate dev

# Seed base demonstration data (development only)
npm run seed
```

### 4. Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the application.

---

## 5. Production Deployment & Disaster Recovery

- **Production Deployment Runbook**: [`docs/production-deployment.md`](./docs/production-deployment.md)
- **Disaster Recovery & Backup Runbook**: [`docs/backup-recovery.md`](./docs/backup-recovery.md)
- **Project Progress & Phase Continuation**: [`docs/PROJECT_STATUS.md`](./docs/PROJECT_STATUS.md)

---

## 6. Verification & Quality Assurance

```bash
# Run strict TypeScript check
npm run typecheck

# Run production build
npm run build
```
*(All 46 Next.js App Router routes compile and optimize cleanly with 0 errors).*
