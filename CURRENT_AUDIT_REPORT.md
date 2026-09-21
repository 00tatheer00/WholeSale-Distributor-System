# PHARMADIST ERP — SENIOR DEVELOPER TECHNICAL & FUNCTIONAL AUDIT REPORT
**Document Name**: `CURRENT_AUDIT_REPORT.md`  
**Date**: September 21, 2026  
**Project**: Wholesale Medicine Distribution Management System (WMDMS) / PharmaDist ERP  
**Repository**: `https://github.com/00tatheer00/WholeSale-Distributor-System.git` (`main`)  
**Audit Type**: Senior Developer Technical & Functional Discovery Phase  
**Auditor**: Lead Systems Architect  

---

## EXECUTIVE SUMMARY

This document provides a comprehensive technical and functional audit of the **PharmaDist Wholesale Medicine Distribution Management System (WMDMS)**. It details what is implemented, what is partially implemented, what is missing, what is broken, and what requires modification for client requirements.

No application source code or database structures were altered during this audit phase.

---

## PART 1 — ACTUAL TECHNOLOGY STACK

| Layer / Component | Technology | Version | Source File / Verification |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router, Server Actions, Standalone) | `15.5.23` | `package.json` |
| **Frontend Runtime** | React & React DOM | `19.0.0` | `package.json` |
| **Language** | TypeScript (Strict Mode) | `5.7.3` | `package.json`, `tsconfig.json` |
| **Desktop Runtime** | Electron | `34.2.0` | `package.json`, `electron/main.js` |
| **Desktop Packager**| Electron-Builder | `25.1.8` | `package.json` |
| **Database Engine** | Embedded SQLite (`prisma/wmdms.db`) | SQLite 3 | `.env`, `.env.local`, `prisma/schema.prisma` |
| **Database ORM** | Prisma Client & CLI | `6.3.1` | `package.json`, `prisma/schema.prisma` |
| **Authentication** | Local Bcrypt Password Hashing + HttpOnly Session Cookies | `bcryptjs 3.0.3` | `src/server/actions/auth.actions.ts`, `src/lib/auth/session.ts` |
| **UI Components** | Radix UI Primitives + Lucide React (`shadcn/ui` pattern) | Radix 1.1 / 2.1, Lucide `0.475.0` | `package.json`, `src/components/ui/*` |
| **CSS Framework** | Vanilla Tailwind CSS + PostCSS + Tailwind Animate | `3.4.17` | `tailwind.config.ts`, `src/app/globals.css` |
| **Form Library** | React Hook Form | `7.54.2` | `package.json` |
| **Validation Library** | Zod + HookForm Resolvers | `3.24.1` | `package.json`, `src/validations/*` |
| **Table Library** | TanStack React Table | `8.20.6` | `package.json`, `src/components/shared/data-table.tsx` |
| **Chart Library** | Recharts | `2.15.1` | `package.json` |
| **Printing System** | Browser Native Print (`window.print()`) via `@media print` CSS | Browser Native | `src/components/shared/invoice-print-modal.tsx` |
| **PDF System** | Browser Print-to-PDF (No server-side PDF binary installed) | Client OS Native | No `jspdf`, `pdfmake`, or `puppeteer` |
| **Excel Export** | Client-side CSV/TSV Blob Generator (`exportToCSV`) | Custom Utility | `src/lib/export-utils.ts` (No binary `.xlsx` engine) |
| **Build & Dev Orchestration** | Next Build Standalone + Electron Concurrently + Wait-On | `9.1.2` / `8.0.2` | `package.json` |

---

## PART 2 — PROJECT ARCHITECTURE

### Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Electron Main Process                           │
│  - electron/main.js (Window lifecycle, auto-starts background Next.js) │
│  - electron/preload.js (contextBridge: electronAPI)                    │
│  - Multi-PC LAN IP Discovery (0.0.0.0:[PORT] broadcast)               │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Spawns / Connects HTTP (Port 3000)
┌──────────────────────────────────▼─────────────────────────────────────┐
│                 Next.js 15 App Router Server Layer                    │
│  - Route Groups: src/app/(auth) & src/app/(dashboard)                  │
│  - Route Protection: src/middleware.ts -> src/lib/auth/middleware.ts   │
│  - Client-Server RPC: src/server/actions/*.actions.ts (19 Files)       │
│  - REST API: src/app/api/auth/login/route.ts (External LAN clients)   │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Server-side Domain Services
┌──────────────────────────────────▼─────────────────────────────────────┐
│                 Business Logic & Service Layer                         │
│  - src/server/services/*.service.ts (14 Files)                         │
│  - Atomic Multi-Model DB Transactions ($transaction)                   │
│  - FEFO Allocation, Historical COGS, AP/AR Double-Entry Ledgers        │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Prisma ORM Queries
┌──────────────────────────────────▼─────────────────────────────────────┐
│                      Prisma 6 & SQLite Database                        │
│  - schema: prisma/schema.prisma (28 Models, 21 Enums)                  │
│  - file: prisma/wmdms.db (Single-file zero-install storage)            │
└────────────────────────────────────────────────────────────────────────┘
```

### Folder Structure Summary

- `electron/`: Main script (`main.js`) handling standalone Node server child process spawn, port discovery, and window management. Preload script (`preload.js`).
- `prisma/`: Database definition (`schema.prisma`), offline seed data (`seed-offline.ts`), and SQLite database file (`wmdms.db`).
- `src/app/`: Next.js 15 App Router. Contains route groups `(auth)` and `(dashboard)`, plus API route `/api/auth/login`.
- `src/components/`:
  - `layout/`: `app-shell`, `sidebar`, `header`, `breadcrumbs`, `info-guide-modal`
  - `shared/`: `data-table`, `invoice-print-modal`, `credit-limit-gauge`, `fefo-batch-badge`, `stat-card`
  - `ui/`: 17 atomic Radix UI primitives
- `src/lib/`: Database client (`prisma.ts`), authentication session & middleware guards (`auth/`), currency & date formatting (`utils.ts`), FEFO calculation (`expiry-utils.ts`), CSV export (`export-utils.ts`), navigation configuration (`constants.ts`).
- `src/server/actions/`: 19 Server Actions files for RPC mutations.
- `src/server/services/`: 14 Domain service files containing core business rules, transactional database operations, and accounting formulas.
- `src/validations/`: 14 Zod validation schemas.

---

## PART 3 — DATABASE AUDIT (PRISMA SCHEMA & SQLITE)

The database schema contains **28 models** and **21 enums**:

| Model Name | Key Fields | Relationships | Status / Deletion Support | Important Constraints & Indexes |
| :--- | :--- | :--- | :--- | :--- |
| **`Company`** | name, tradeLicenseNo, drugLicenseNo, taxIdTin, currency, defaultCreditDays, defaultVatPercent, enableFefoStrict, lowStockThreshold, nearExpiryDays | Has many Users, Medicines, Suppliers, Customers, Distributors, Warehouses, Expenses | Timestamps. No soft delete. | Single record tenant configuration. |
| **`User`** | email, passwordHash, name, phone, role (`UserRole`), status (`UserStatus`) | Belongs to Company; has many Purchases, Sales, Invoices, Payments, Expenses, AuditLogs | `status` (ACTIVE, INACTIVE, SUSPENDED). | Unique on `email`. Indexes on `companyId`, `role`, `status`. |
| **`MedicineCategory`**| name, code, description, isActive | Has many Medicines | `isActive` (Boolean). | Unique on `name`, `code`. |
| **`Medicine`** | brandName, genericName, skuCode, darNumber, dosageForm, strength, unitOfMeasure, packSize, stripPerBox, minReorderLevel, defaultTradePrice, defaultMrp, vatPercent, status | Belongs to Category, Supplier; has many Batches, PurchaseItems, SaleItems, StockMovements | `status` (ACTIVE, INACTIVE, DISCONTINUED). | Unique on `skuCode`. Indexes on `categoryId`, `supplierId`, `brandName`, `genericName`. |
| **`Warehouse`** | name, code, location, isDefault, isActive | Belongs to Company; has many Racks, Batches, Purchases, StockMovements | `isActive` (Boolean). | Unique on `code`. |
| **`Rack`** | rackCode, zone (`StorageZone`), description | Belongs to Warehouse; has many Batches | Timestamps. | Unique on `[warehouseId, rackCode]`. |
| **`MedicineBatch`** | batchNumber, mfgDate, expiryDate, purchaseCostPrice, tradePrice, mrp, quantityOnHand, quantityReserved, quantityAvailable, status | Belongs to Medicine, Warehouse, Rack, Supplier, PurchaseItem; has many SaleItems, Adjustments, Movements | `status` (ACTIVE, NEAR_EXPIRY, EXPIRED, QUARANTINED, EXHAUSTED). | Unique on `[medicineId, warehouseId, batchNumber]`. Indexes on `expiryDate`, `status`. |
| **`Supplier`** | name, code, contactPerson, phone, email, address, city, drugLicenseNo, taxTin, creditPeriodDays, openingBalance, currentDue, totalPurchased, totalPaid, status | Belongs to Company; has many Medicines, Batches, Purchases, SupplierPayments | `status` (ACTIVE, INACTIVE, DISCONTINUED). | Unique on `code`. Indexes on `name`, `status`. |
| **`Purchase`** | purchaseNumber, purchaseDate, expectedDeliveryDate, subtotalAmount, discountAmount, taxAmount, grandTotal, paidAmount, dueAmount, paymentStatus, status, cancellationReason | Belongs to Supplier, Warehouse, createdBy User; has many PurchaseItems, SupplierPayments | `status` (DRAFT, ORDERED, RECEIVED, CANCELLED). | Unique on `purchaseNumber`. Indexes on `supplierId`, `purchaseDate`, `status`. |
| **`PurchaseItem`** | batchNumber, mfgDate, expiryDate, quantity, bonusQuantity, unitPurchaseCost, unitTradePrice, unitMrp, discountPercent, taxPercent, subtotal, totalAmount | Belongs to Purchase, Medicine; has many Batches | Cascade delete on Purchase deletion. | Indexes on `purchaseId`, `medicineId`, `batchNumber`. |
| **`SupplierPayment`** | voucherNumber, amount, paymentDate, paymentMethod, referenceNumber, bankName, chequeNumber, status | Belongs to Supplier, Purchase, createdBy User | `status` (CONFIRMED, VOIDED). | Unique on `voucherNumber`. Indexes on `supplierId`, `paymentDate`. |
| **`Customer`** | pharmacyName, proprietorName, customerCode, drugLicenseNo, phone, address, creditLimit, creditDaysLimit, openingBalance, currentDue, totalPurchased, totalPaid, customerType, status | Belongs to Company, Distributor; has many Sales, Invoices, CustomerPayments | `status` (ACTIVE, BLOCKED_OVERDUE, INACTIVE). | Unique on `customerCode`. Indexes on `distributorId`, `pharmacyName`, `status`. |
| **`Distributor`** | name, employeeCode, phone, assignedTerritory, assignedRoute, commissionRatePercent, monthlySalesTarget, status | Belongs to Company, User; has many Customers, Sales, Invoices, DistributorSales, DistributorExpenses | `status` (ACTIVE, INACTIVE, ON_LEAVE). (Represents Sales Rep). | Unique on `employeeCode`, `userId`. |
| **`Sale`** | saleNumber, saleDate, subtotalAmount, discountAmount, taxAmount, deliveryCharge, grandTotal, totalCogs, paidAmount, dueAmount, paymentStatus, deliveryStatus, status, creditOverrideApproved | Belongs to Customer, Distributor, createdBy User; has many SaleItems, has one Invoice, DistributorSale | `status` (DRAFT, CONFIRMED, DELIVERED, CANCELLED). | Unique on `saleNumber`. Indexes on `customerId`, `distributorId`, `saleDate`. |
| **`SaleItem`** | quantity, bonusQuantity, unitCostPrice, unitTradePrice, unitMrp, discountPercent, taxPercent, lineCogs, lineTotal | Belongs to Sale, Medicine, MedicineBatch | Preserves historical batch unit cost price. | Indexes on `saleId`, `medicineId`, `batchId`. |
| **`Invoice`** | invoiceNumber, invoiceDate, dueDate, subtotalAmount, discountAmount, taxAmount, grandTotal, paidAmount, dueAmount, paymentStatus, status, challanNumber | Belongs to Sale (1-to-1), Customer, Distributor, createdBy User; has many PaymentInvoiceAllocations | `status` (ISSUED, PAID, CANCELLED). | Unique on `invoiceNumber`, `saleId`. |
| **`CustomerPayment`** | receiptNumber, amount, paymentDate, paymentMethod, referenceNumber, bankName, chequeNumber, chequeStatus, status | Belongs to Customer, Distributor, createdBy User; has many PaymentInvoiceAllocations | `status` (CONFIRMED, VOIDED). Cheque status tracking. | Unique on `receiptNumber`. Indexes on `customerId`, `paymentDate`, `paymentMethod`. |
| **`PaymentInvoiceAllocation`**| allocatedAmount | Belongs to CustomerPayment, Invoice | FIFO invoice settlement allocation. | Indexes on `customerPaymentId`, `invoiceId`. |
| **`DistributorSale`**| salesAmount, collectedAmount, commissionPercent, commissionEarned, isSettled | Belongs to Distributor, Sale (1-to-1) | Tracks rep commission and settlement. | Unique on `saleId`. Index on `distributorId`. |
| **`ExpenseCategory`**| name, code, isDirectCost, isActive | Belongs to Company; has many BusinessExpenses, DistributorExpenses | `isActive` (Boolean). | Unique on `[companyId, name]`, unique on `code`. |
| **`BusinessExpense`**| voucherNumber, expenseDate, amount, paymentMethod, paidTo, description, status | Belongs to Company, ExpenseCategory, createdBy User, approvedBy User | `status` (PENDING, APPROVED, REJECTED). | Unique on `voucherNumber`. Indexes on `companyId`, `categoryId`, `expenseDate`. |
| **`DistributorExpense`**| expenseDate, amount, description, status | Belongs to Distributor, ExpenseCategory, approvedBy User | `status` (PENDING, APPROVED, REJECTED). | Indexes on `distributorId`, `categoryId`, `expenseDate`. |
| **`Tax`** | name, code, ratePercent, isDefault, isActive | Standalone tax configuration | `isActive` (Boolean). | Unique on `code`. |
| **`Discount`** | name, discountType, value, startDate, endDate, isActive | Standalone promotional discount | `isActive` (Boolean). | Primary key on `id`. |
| **`StockAdjustment`**| adjustmentType, quantityBefore, quantityDelta, quantityAfter, unitCostPrice, reason, referenceNumber | Belongs to MedicineBatch, createdBy User | Immutable stock adjustment audit voucher. | Indexes on `batchId`, `adjustmentType`, `createdAt`. |
| **`StockMovement`** | movementType, quantityDelta, quantityBefore, quantityAfter, unitCostPrice, referenceNumber, reason, notes | Belongs to Medicine, MedicineBatch, Warehouse, createdBy User | Immutable physical inventory movement ledger. | Indexes on `medicineId`, `batchId`, `movementType`, `createdAt`. |
| **`AuditLog`** | action, entityName, entityId, oldValues, newValues, ipAddress, userAgent | Belongs to User | Append-only forensic audit trail. | Indexes on `userId`, `action`, `entityName`, `entityId`, `createdAt`. |
| **`Notification`** | type, title, message, link, isRead, readAt | Belongs to User | Automated watchdog system alerts. | Indexes on `userId`, `type`, `isRead`. |

---

## PART 4 — AUTHENTICATION & USER MANAGEMENT AUDIT

| Feature | Current State | Verification Detail |
| :--- | :--- | :--- |
| **Login** | ✅ **IMPLEMENTED** | Local SQLite authentication using `bcrypt.compare` in `loginAction`. Auto-hashes default bootstrap credentials (`admin@123`, `password`) into SQLite on initial login. Sets 7-day HttpOnly cookie `wmdms_session`. |
| **Logout** | ✅ **IMPLEMENTED** | `logoutAction` removes session cookies, revalidates cache, and redirects to `/login`. |
| **Password Change** | ✅ **IMPLEMENTED** | Implemented at `/settings/profile` via `updatePasswordAction`. Computes `bcrypt.hash(newPassword, 10)`, updates SQLite, and logs an audit record. |
| **Password Reset** | 🟡 **PARTIALLY IMPLEMENTED** | Routes `/forgot-password` and `/reset-password` exist with forms, but because system operates offline without SMTP, actions return static messages advising contact with Administrator. |
| **Sessions** | ✅ **IMPLEMENTED** | HttpOnly cookie-based session authenticated via `getCurrentUser()` with SQLite user profile retrieval. |
| **Roles** | ✅ **IMPLEMENTED** | 7 discrete roles defined in `UserRole` enum (`SUPER_ADMIN`, `SALES_MANAGER`, `SALESMAN`, `WAREHOUSE_MANAGER`, `INVENTORY_OFFICER`, `ACCOUNTS_OFFICER`, `CASHIER`). |
| **Permissions** | 🟡 **PARTIALLY IMPLEMENTED** | Guard functions `requireAuth()` and `requireAdmin()` enforce access for `SUPER_ADMIN` and `SALES_MANAGER`. No dynamic per-permission matrix exists. |
| **Protected Routes**| ✅ **IMPLEMENTED** | Next.js middleware guards 13 protected route trees, redirecting unauthenticated requests to `/login?redirect=...`. |
| **User Management** | 🟡 **PARTIALLY IMPLEMENTED** | `/settings` tab "users" displays a read-only table of users. **There are no buttons or forms to create, edit, change roles, or deactivate users.** |
| **Profile** | ✅ **IMPLEMENTED** | `/settings/profile` allows logged-in users to update display name and phone number. |
| **Security Settings**| 🟡 **PARTIALLY IMPLEMENTED** | Security headers configured in `next.config.mjs`, and forensic audit logs captured in `/audit-logs`. No 2FA or session timeout settings. |

---

## PART 5 — MEDICINE & CATALOG MANAGEMENT AUDIT

| Feature / Action | Current State | Technical Details |
| :--- | :--- | :--- |
| **Add Medicine** | ✅ **IMPLEMENTED** | Modal dialog on `/medicines` calls `createMedicineAction`. Validated with Zod `medicineSchema`. |
| **Edit Medicine** | ✅ **IMPLEMENTED** | Prefilled modal dialog on `/medicines` and `/medicines/[id]` calls `updateMedicineAction`. |
| **View Medicine** | ✅ **IMPLEMENTED** | Route `/medicines/[id]` displays 360° catalog profile, packaging ratios, total stock, and batch breakdown. |
| **Delete Medicine** | ❌ **MISSING** | **No `deleteMedicineAction` exists in code, and no delete button exists in UI.** Only status toggle exists. |
| **Deactivate Medicine** | ✅ **IMPLEMENTED** | Status dropdown toggle calls `toggleMedicineStatusAction` setting `INACTIVE` or `DISCONTINUED`. |
| **Activate Medicine** | ✅ **IMPLEMENTED** | Status dropdown toggle sets medicine back to `ACTIVE`. |
| **Manufacturer** | ❌ **MISSING** | **No separate `Manufacturer` model or field exists.** The system relies entirely on `Supplier`. |
| **Supplier** | ✅ **IMPLEMENTED** | `supplierId` foreign key to `Supplier` model. |
| **Category** | ✅ **IMPLEMENTED** | `categoryId` foreign key to `MedicineCategory` with dedicated CRUD at `/categories`. |
| **SKU / Code** | ✅ **IMPLEMENTED** | Unique `skuCode` field on `Medicine`. |
| **Batch Management**| ✅ **IMPLEMENTED** | Tracked via `MedicineBatch` records with individual stock and expiration dates. |
| **Expiry Tracking** | ✅ **IMPLEMENTED** | Visual badges (`fefo-batch-badge.tsx`) categorize batches: Green (>90d), Amber (<90d), Red (Expired). |
| **Purchase Price** | 🟡 **PARTIAL** | Not stored on `Medicine` master. Stored strictly at batch level (`purchaseCostPrice`) and purchase consignment level. |
| **Selling / Wholesale Price** | ✅ **IMPLEMENTED** | `defaultTradePrice` (Wholesale Base Price) and `defaultMrp` (MRP) on `Medicine` master, overridden at batch level. |

---

## PART 6 — INVENTORY MANAGEMENT AUDIT

| Feature | Current State | Functional Details |
| :--- | :--- | :--- |
| **Stock In** | ✅ **WORKING** | Increments batch stock via Purchases (`PURCHASE_IN`) or Manual Adjustments (`COUNT_DISCREPANCY_ADD` -> `MANUAL_IN`). |
| **Stock Out** | ✅ **WORKING** | Decrements batch stock via Sales (`SALE_OUT`) or Manual Deductions (`COUNT_DISCREPANCY_DEDUCT` -> `MANUAL_OUT`). |
| **Manual Adjustment** | ✅ **WORKING** | Route `/inventory/adjustments` allows recording adjustment vouchers via `performStockAdjustmentAction` and `adjustStock()`. Negative stock is strictly prevented. |
| **Damage Write-Off** | ✅ **WORKING** | Adjustment type `DAMAGE_WRITE_OFF` decrements batch stock and records `DAMAGE` stock movement. |
| **Expired Stock Removal** | ✅ **WORKING** | Adjustment type `EXPIRY_REMOVAL` decrements batch stock and records `EXPIRED` stock movement. |
| **Stock Movement History** | ✅ **WORKING** | Route `/inventory/movements` provides an immutable audit ledger of all physical stock changes. |
| **Batch Stock (Authoritative)**| ✅ **WORKING** | Inventory is tracked strictly at the `MedicineBatch` level (`quantityOnHand`, `quantityReserved`, `quantityAvailable`). |
| **FEFO Allocation** | ✅ **WORKING** | Wholesale order booking preselects and sorts batches by `expiryDate: 'asc'`, ensuring earliest expiring batches are sold first. |
| **Warehouse Location** | 🟡 **PARTIAL** | `Warehouse` model exists in DB, but **no UI exists to create or manage warehouses**. System assigns first default warehouse. |
| **Rack / Shelf / Zone** | 🟡 **PARTIAL** | `Rack` model exists in DB with `StorageZone` enum, but **no UI exists to manage racks**, and purchase form omits rack selection. |
| **Stock Transfer** | ❌ **MISSING** | **No feature exists to transfer stock between warehouses or locations.** |

---

## PART 7 — SUPPLIERS AUDIT

| Operation | Current State | Functional Details |
| :--- | :--- | :--- |
| **Add Supplier** | ✅ **IMPLEMENTED** | Modal dialog on `/suppliers` calls `createSupplierAction`. |
| **Edit Supplier** | ✅ **IMPLEMENTED** | Action in table and `/suppliers/[id]` header calls `updateSupplierAction`. |
| **View Supplier** | ✅ **IMPLEMENTED** | Route `/suppliers/[id]` displays contact info, AP balance, consignment history, and AP ledger. |
| **Activate / Deactivate** | ✅ **IMPLEMENTED** | `toggleSupplierStatusAction` toggles between `ACTIVE` and `INACTIVE`. |
| **Delete Supplier** | ❌ **MISSING** | **No delete supplier action exists** in UI or backend. |
| **Contact & Address** | ✅ **IMPLEMENTED** | Contact person, phone, email, address, city, drug license, TIN, and credit terms are tracked. |
| **Manufacturer Relation** | ❌ **MISSING** | No link to a separate Manufacturer entity. |
| **Purchase History** | ✅ **IMPLEMENTED** | `/suppliers/[id]` lists all consignments received from this supplier. |
| **Supplier AP Ledger** | ✅ **IMPLEMENTED** | Chronological statement of purchase invoices (debit to AP) and payment vouchers (credit to AP) with running balance. |
| **Supplier Payment** | ✅ **IMPLEMENTED** | "Record Payment" button invokes `recordSupplierPaymentAction`, creates Payment Voucher `PV-YYYY-XXXXX`, allocates against unpaid purchases (FIFO), and updates `Supplier.currentDue`. |
| **Supplier Balance / Due** | ✅ **IMPLEMENTED** | `currentDue`, `totalPurchased`, and `totalPaid` are dynamically tracked on the `Supplier` record. |

---

## PART 8 — PURCHASES / INTAKE / GRN AUDIT

| Feature / Control | Current State | Functional Details |
| :--- | :--- | :--- |
| **Consignments List** | ✅ **IMPLEMENTED** | Route `/purchases` lists all consignments with search, supplier, payment status, and order status filters. |
| **New Purchase Consignment** | ✅ **IMPLEMENTED** | Route `/purchases/new` provides a high-speed multi-item purchase intake form. |
| **Purchase Details View** | ✅ **IMPLEMENTED** | Route `/purchases/[id]` displays consignment metadata, line item batches, payment transactions, and supplier details. |
| **Add / Remove Items** | ✅ **IMPLEMENTED** | Dynamic table rows allowing addition and removal of multiple medicines in a single consignment. |
| **Direct Intake / GRN** | ✅ **IMPLEMENTED** | Direct ingestion: submitting commits consignment immediately with status `RECEIVED`, creates or increments `MedicineBatch` records, and creates `PURCHASE_IN` movements. |
| **Batch Creation on Intake** | ✅ **IMPLEMENTED** | Form requires batch number, expiry date, and optional mfg date. Creates new batch or increments existing batch. |
| **Stock & AP Update** | ✅ **IMPLEMENTED** | Increments `MedicineBatch.quantityOnHand` and updates `Supplier.totalPurchased` and `Supplier.currentDue` in an atomic transaction. |
| **Upfront Payment on Intake** | ✅ **IMPLEMENTED** | Form accepts upfront paid amount and payment method. Automatically generates `SupplierPayment` voucher if `paidAmount > 0`. |
| **Cancellation & Reversal** | ✅ **IMPLEMENTED** | "Cancel Consignment" button on `/purchases/[id]` calls `cancelPurchaseAction`. Verifies stock has not been sold, deducts batch stock with `PURCHASE_CANCEL_RETURN`, and reverses supplier AP balance. |
| **Print / PDF Consignment** | ✅ **IMPLEMENTED** | "Print Consignment" button triggers native print layout. |
| **Warehouse / Location Input** | ❌ **MISSING IN UI** | **Warehouse is not selectable on `/purchases/new`.** Backend hardcodes default warehouse assignment. Rack location input is omitted. |

---

## PART 9 — CUSTOMER PHARMACIES AUDIT

### Definition in PharmaDist ERP
A **"Customer Pharmacy"** is a licensed B2B commercial client (retail pharmacy, hospital dispensary, clinic, or sub-distributor) purchasing pharmaceutical stock under credit or cash terms.

| Feature | Current State | Functional Details |
| :--- | :--- | :--- |
| **Add Customer** | ✅ **IMPLEMENTED** | Route `/customers/new` captures pharmacy name, proprietor, drug license, TIN, territory, credit limit, and assigned salesman. |
| **Edit Customer** | ✅ **IMPLEMENTED** | Route `/customers/[id]/edit` allows updating contact info, salesman assignment, and credit terms. |
| **View 360° Profile** | ✅ **IMPLEMENTED** | Route `/customers/[id]` displays profile, credit gauge, sales orders, payment receipts, and balance summary. |
| **Customer AR Ledger** | ✅ **IMPLEMENTED** | Route `/customers/[id]/ledger` provides an immutable chronological double-entry statement (Invoices vs Receipts with running balance). Includes CSV export and Print actions. |
| **Activate / Deactivate** | ✅ **IMPLEMENTED** | Dropdown toggle updates status between `ACTIVE`, `BLOCKED_OVERDUE`, and `INACTIVE`. |
| **Delete Customer** | ❌ **MISSING** | **No delete customer action exists** in UI or backend to protect historical sales ledger integrity. |
| **Credit Limit & Aging** | ✅ **IMPLEMENTED** | `creditLimit` and `creditDaysLimit` enforced. Visual gauge (`credit-limit-gauge.tsx`) indicates utilization percentage. |
| **Confusing Terminology** | ⚠️ **NEEDS ATTENTION** | Model name `Distributor` is used for sales reps. Lingering references to Bangladeshi currency (`৳`) and cities ("Tejgaon", "Dhaka") exist in fallback messages. |

---

## PART 10 — WHOLESALE SALES WORKFLOW AUDIT

| Step / Feature | Current State | Functional Details |
| :--- | :--- | :--- |
| **Initiate Sale** | ✅ **WORKING** | "Create Wholesale Order" button on `/sales` navigates to `/sales/new` (`sale-order-form.tsx`). |
| **Customer Selection** | ✅ **WORKING** | Dropdown loads customer list, displays active credit limit, current due, and blocks `BLOCKED_OVERDUE` accounts unless overridden. |
| **Salesman Assignment** | ✅ **WORKING** | Dropdown assigns field sales representative (`distributorId`) for commission attribution. |
| **Medicine Selection** | ✅ **WORKING** | Medicine picker populates available batch options for that medicine. |
| **Batch Selection & FEFO** | ✅ **WORKING** | Dropdown lists non-exhausted, non-expired batches sorted by expiry date ascending (FEFO). Preselects earliest expiring batch. |
| **Quantity & Bonus Qty** | ✅ **WORKING** | Captures billed `quantity` and promotional `bonusQuantity`. Total deducted stock = `quantity + bonusQuantity`. |
| **Pricing & Margin Calculation** | ✅ **WORKING** | Unit Trade Price (TP) prefilled from batch. Unit Cost Price is captured from batch snapshot to preserve **Historical Batch COGS**. |
| **Discounts & VAT** | ✅ **WORKING** | Line item discount % and VAT %, plus overall order special discount % and delivery charge. |
| **Credit Barrier Verification** | ✅ **WORKING** | If `projectedDue = currentDue + grandTotal - paidAmount > creditLimit`, submission is blocked unless "Credit Override Approved" is checked with a mandatory reason. |
| **Payment at Booking** | ✅ **WORKING** | Options: `CREDIT` (unpaid), `FULL` (immediate total settlement), `PARTIAL` (partial upfront cash/transfer). |
| **Atomic Order Commit** | ✅ **WORKING** | `createSale()` commits in a single transaction: creates `Sale`, `SaleItem`, `Invoice`, `Challan`, deducts batch stock, logs `SALE_OUT`, updates customer AR balance, and records receipt if upfront payment was made. |
| **Order Cancellation** | ✅ **WORKING** | "Cancel Order" button on `/sales/[id]` calls `cancelSale()`, restoring batch inventory (`SALE_CANCEL_RETURN`), reversing customer AR due, and voiding the invoice. |

---

## PART 11 — TAX INVOICES & CHALLANS AUDIT

| Feature | Current State | Functional Details |
| :--- | :--- | :--- |
| **Invoice Creation** | ✅ **IMPLEMENTED** | Automatically generated simultaneously with sales order booking via `createSale()`. |
| **Invoice Numbering** | ✅ **IMPLEMENTED** | Serial format: `INV-YYYY-XXXXX`. Delivery Challan: `CH-YYYY-XXXXX`. |
| **Invoice Details View** | ✅ **IMPLEMENTED** | Route `/invoices/[id]` displays company trade license, customer drug license, line item batch numbers, expiry dates, subtotal, discount, VAT, payments received, and net balance due. |
| **Invoice Printing & PDF** | ✅ **IMPLEMENTED** | "Print Invoice" button opens `InvoicePrintModal` with `@media print` styles and triggers `window.print()`. Users save as PDF via system print dialog. |
| **Delivery Challan** | ✅ **IMPLEMENTED** | Challan number and delivery details are rendered on invoice view and print modal. |
| **Cancellation** | ✅ **IMPLEMENTED** | Invoices cannot be cancelled independently; cancelling the underlying sales order updates invoice status to `CANCELLED`. |

---

## PART 12 — COLLECTIONS & RECEIPTS AUDIT

| Feature | Current State | Functional Details |
| :--- | :--- | :--- |
| **Payment Intake** | ✅ **IMPLEMENTED** | "Record Collection" button in `/payments` opens modal dialog calling `recordCustomerPaymentAction`. |
| **Receipt Generation** | ✅ **IMPLEMENTED** | Standardized receipt serial generated: `RCT-YYYY-XXXXX`. |
| **Payment Methods** | ✅ **IMPLEMENTED** | Supports `CASH`, `BANK_TRANSFER`, `CHEQUE`, and `MFS_BKASH_NAGAD`. Captures bank name, cheque number, and cheque maturity date. |
| **FIFO Invoice Allocation** | ✅ **IMPLEMENTED** | `recordCustomerPayment()` automatically allocates collected funds across oldest unpaid customer invoices, updating `Invoice.paidAmount`, `Invoice.dueAmount`, and creating `PaymentInvoiceAllocation` records. |
| **Customer Balance Update** | ✅ **IMPLEMENTED** | Decrements `Customer.currentDue` and increments `Customer.totalPaid` inside the atomic transaction. |
| **Receipt Print / View** | ✅ **IMPLEMENTED** | Modal in `/payments` displays receipt summary, allocated invoice breakdown, and triggers browser print. |

---

## PART 13 — FIELD SALES / REPRESENTATIVES AUDIT

| Feature | Current State | Functional Details |
| :--- | :--- | :--- |
| **Sales Rep Directory** | ✅ **IMPLEMENTED** | Route `/distributors` lists all field representatives with employee code, territory, assigned route, target progress, and sales summary. |
| **Enroll Representative** | ✅ **IMPLEMENTED** | "Add Sales Representative" modal calls `createDistributorAction`. |
| **360° Rep Cockpit** | ✅ **IMPLEMENTED** | Route `/distributors/[id]` displays monthly target attainment gauge, total sales, collections, commissions earned, assigned pharmacies list, and order history. |
| **Customer Assignment** | ✅ **IMPLEMENTED** | Customers have a `distributorId` foreign key assigning them to a specific sales representative. |
| **Commissions Tracking** | ✅ **IMPLEMENTED** | Every sale creates a `DistributorSale` record tracking `salesAmount`, `commissionPercent`, and `commissionEarned`. |
| **Salesman Recovery Report** | ✅ **IMPLEMENTED** | Sub-report at `/reports/payments` includes dedicated Salesman filter and recovery summary KPIs. |

---

## PART 14 — OPERATING EXPENSES AUDIT

| Feature | Current State | Functional Details |
| :--- | :--- | :--- |
| **Expense Recording** | ✅ **IMPLEMENTED** | "Record Expense" button in `/expenses` opens modal calling `createExpenseAction`. Generates voucher `EXP-YYYY-XXXXX`. |
| **Standard Categories** | ✅ **IMPLEMENTED** | 5 standard pre-seeded categories: `EXP-RENT` (Warehouse Rent), `EXP-DAILY` (Daily Tea/Lunch), `EXP-SALESMAN` (Salesman TA/DA), `EXP-VISITOR` (Guest Entertainment), `EXP-DOC-MKT` (Doctor Marketing / Samples). Custom categories can be added via "Manage Categories". |
| **Expense Cancellation** | ✅ **IMPLEMENTED** | "Cancel Expense" button triggers `cancelExpenseAction` requiring a cancellation reason and updating status to `REJECTED`. |
| **Edit Expense** | ❌ **MISSING** | **No `updateExpenseAction` exists** in UI or backend. If an expense is entered with wrong amounts, it must be cancelled and re-recorded. |
| **Financial Integration** | ✅ **IMPLEMENTED** | Operating expenses are dynamically deducted from Gross Profit in `/profit` to compute Net Profit. |

---

## PART 15 — PROFIT & FINANCIAL INTELLIGENCE AUDIT

All financial calculations in `profit.service.ts` are **REAL DYNAMIC CALCULATIONS** (not hardcoded):

| Metric / Calculation | Computational Method |
| :--- | :--- |
| **Sales Revenue** | $\sum \text{Sale.grandTotal}$ for all `CONFIRMED` sales within the selected date range. |
| **Cost of Goods Sold (COGS)** | $\sum \text{SaleItem.lineCogs}$ where $\text{lineCogs} = (\text{quantity} + \text{bonusQuantity}) \times \text{batch.purchaseCostPrice}$. Preserves authentic historical batch cost. |
| **Gross Profit & Margin %** | $\text{Gross Profit} = \text{Sales Revenue} - \text{Historical COGS}$. $\text{Gross Margin \%} = (\text{Gross Profit} / \text{Revenue}) \times 100$. |
| **Operating Expenses** | $\sum \text{BusinessExpense.amount} + \sum \text{DistributorExpense.amount}$ for approved vouchers. |
| **Net Profit & Margin %** | $\text{Net Profit} = \text{Gross Profit} - \text{Total Expenses}$. $\text{Net Margin \%} = (\text{Net Profit} / \text{Revenue}) \times 100$. |
| **Financial Trends Chart** | Recharts multi-line chart plotting daily Revenue, COGS, Gross Profit, Expenses, and Net Profit across the date range. |
| **Product Profitability** | Tabular breakdown aggregating revenue, COGS, gross margin, and margin % per individual medicine. |
| **Salesman Profitability** | Tabular breakdown calculating total sales, collections, earned commissions, and recovery rates per sales rep. |

---

## PART 16 — REPORTS & ANALYTICS AUDIT

| Report Sub-Module | Route | Filters & Capabilities | Status |
| :--- | :--- | :--- | :--- |
| **Reports Hub** | `/reports` | Overview hub with navigation cards to all 9 specialized reporting engines. | ✅ Working |
| **Wholesale Sales** | `/reports/sales` | Filters: Date range, Customer, Salesman, Status. Summary KPIs. Export CSV, Print. | ✅ Working |
| **Purchases & Intake** | `/reports/purchases` | Filters: Date range, Supplier, Payment Status. Summary KPIs. Export CSV, Print. | ✅ Working |
| **Warehouse Inventory** | `/reports/inventory` | Filters: Warehouse, Category, Stock Level. Valuation KPIs (Cost vs TP). Export CSV, Print. | ✅ Working |
| **FEFO Expiry Watchdog** | `/reports/expiry` | Filters: Expiry Risk Horizon (30/60/90/180 days). At-risk stock valuation. Export CSV, Print. | ✅ Working |
| **Low Stock & Depletion**| `/reports/low-stock` | Filters: Category, Supplier. Reorder quantity recommendations. Export CSV, Print. | ✅ Working |
| **Customer Dues (AR)** | `/reports/customer-dues` | Filters: Territory, Aging Bracket (0-30, 31-60, 61-90, 90+ days). Total AR due. Export CSV, Print. | ✅ Working |
| **Supplier Dues (AP)** | `/reports/supplier-dues` | Filters: Supplier, Due Range. Total AP payables. Export CSV, Print. | ✅ Working |
| **Drug Performance** | `/reports/medicines` | Filters: Category, Dosage Form, Fast/Slow Moving. Units sold, revenue, stock. Export CSV, Print. | ✅ Working |
| **Collections & Recovery**| `/reports/payments` | Filters: Date range, Payment Method, Salesman. Salesman recovery breakdown. Export CSV, Print. | ✅ Working |

*Note: All exports produce `.csv` format via `exportToCSV()`. Dedicated binary `.xlsx` generation is not installed.*

---

## PART 17 — SYSTEM SETTINGS AUDIT

| Section | Page Exists? | Form Inputs | Save Button? | Persisted to DB? | Audit Findings & Defect Analysis |
| :--- | :---: | :--- | :---: | :---: | :--- |
| **Business Profile** | Yes | Name, Trade License, Drug License, TIN, Email, Phone, Address, City, Country, Currency, Invoice Footer | Yes | ✅ **YES** | Updates `Company` record in SQLite via `updateCompanySettingsAction`. Works correctly. |
| **Invoice & Print** | Yes | Invoice Prefix, Show Tax, Show Discount, Show Batch, Show Expiry | Yes | ❌ **NO** | **DEFECT**: `Company` model in SQLite has no columns for these toggles. Values exist only in UI state and are lost on reload. |
| **Tax & Discount** | Yes | Default VAT %, Enable Global Discount, Max Discount % | Yes | 🟡 **PARTIAL** | `defaultVatPercent` is saved to `Company`. `enableGlobalDiscount` and `maxDiscountPercent` are not in the schema and are discarded. |
| **Inventory & FEFO** | Yes | Strict FEFO, Allow Expired Sales, Low Stock Threshold, Near Expiry Days | Yes | 🟡 **PARTIAL** | `enableFefoStrict`, `lowStockThreshold`, and `nearExpiryDays` are saved to `Company`. `allowExpiredSales` is not in schema and is discarded. |
| **Credit & Aging** | Yes | Strict Credit Hold, Default Credit Days, Credit Warning Threshold % | Yes | 🟡 **PARTIAL** | `defaultCreditDays` is saved to `Company`. `enforceCreditLimit` and `creditWarningThresholdPercent` are not in schema and are discarded. |
| **Alerts & Notifications**| Yes | Low Stock Alert, Near Expiry Alert, Expired Alert, Credit Breach Alert, Supplier Due Alert | Yes | ❌ **NO** | **DEFECT**: None of the notification toggle preferences exist on the `Company` model. They are not persisted. |
| **Team & Security** | Yes | Staff Accounts Table (Name, Email, Phone, Role, Status) | No | 🟡 **READ-ONLY** | Table renders active users from SQLite. **No "Add Staff", "Edit Role", or "Reset Password" buttons exist.** |
| **User Profile Subroute**| `/settings/profile` | Display Name, Phone, New Password, Confirm Password | Yes | ✅ **YES** | Updates user name/phone and hashes new password into SQLite via `updatePasswordAction`. Works correctly. |

---

## PART 18 — FORENSIC AUDIT LOGS AUDIT

| Feature | Current State | Functional Details |
| :--- | :--- | :--- |
| **Audit Ingestion** | ✅ **WORKING** | Server utility `recordAuditLog()` logs user ID, action, entity name, entity ID, old values, new values, IP, and user agent into `AuditLog` table. |
| **Secret Sanitization** | ✅ **WORKING** | Sanitizer automatically redacts passwords, tokens, API keys, and hashes before writing to SQLite. |
| **Query & Filters** | ✅ **WORKING** | Route `/audit-logs` provides filtering by Action, Entity Name, User ID, Date Range, and Search. |
| **Detail Inspection** | ✅ **WORKING** | "View Payload" modal renders formatted JSON showing before/after property diffs. |
| **Pagination** | ✅ **WORKING** | Server-side pagination (30 records per page). |
| **Forensic Immutability** | ✅ **WORKING** | No edit, modify, or delete buttons exist in UI or backend. Strictly append-only. |

---

## PART 19 — COMPLETE ROUTE & PAGE INVENTORY (48 ROUTES)

```
AUTH (4 Routes):
  - /                          -> Redirects to /dashboard or /login
  - /login                     -> Sign-in with local SQLite bcrypt credentials
  - /forgot-password           -> Offline instruction notice
  - /reset-password            -> Offline instruction notice

DASHBOARD & HELP (2 Routes):
  - /dashboard                 -> Real-time executive cockpit (KPIs, trends, alerts)
  - /help                      -> Trilingual Operations Manual (Pashto / Urdu / English)

MEDICINES & CATALOG (3 Routes):
  - /medicines                 -> Drug catalog directory, search, filter, Add/Edit modals
  - /medicines/[id]            -> 360° drug details & batch inventory ledger
  - /categories                -> Category CRUD management & drug counts

INVENTORY (3 Routes):
  - /inventory                 -> Batch valuation cockpit, FEFO indicators, export
  - /inventory/adjustments     -> Manual stock adjustment vouchers & reconciliation
  - /inventory/movements       -> Immutable physical stock movement ledger

SUPPLIERS (2 Routes):
  - /suppliers                 -> Supplier directory, AP balance cards, Add modal
  - /suppliers/[id]            -> Supplier profile, purchase history, AP balance ledger

PURCHASES (3 Routes):
  - /purchases                 -> Consignments list, status filters, cancellation
  - /purchases/new             -> High-speed multi-item purchase intake & batch creation
  - /purchases/[id]            -> Consignment details, batch breakdown, print view

CUSTOMERS (5 Routes):
  - /customers                 -> Pharmacy directory, search, filters, credit gauges
  - /customers/new             -> Client pharmacy onboarding form
  - /customers/[id]            -> 360° pharmacy profile, credit status, order history
  - /customers/[id]/edit       -> Pharmacy edit form & credit guardrail configuration
  - /customers/[id]/ledger     -> Chronological AR customer statement & running balance

SALES (3 Routes):
  - /sales                     -> Wholesale orders list, credit status, cancel order
  - /sales/new                 -> Wholesale billing engine, FEFO allocation, credit checks
  - /sales/[id]                -> Order details, batch breakdowns, invoice linkage

INVOICES & PAYMENTS (3 Routes):
  - /invoices                  -> Tax invoices directory, payment status filters
  - /invoices/[id]             -> DGDA wholesale tax invoice & delivery challan view
  - /payments                  -> Customer money receipts directory & collection modal

DISTRIBUTORS & EXPENSES (3 Routes):
  - /distributors              -> Field sales representatives directory & targets
  - /distributors/[id]         -> 360° salesman cockpit, orders, commissions, recovery
  - /expenses                  -> Business expense vouchers, category manager, cancellation

PROFIT & FINANCIALS (1 Route):
  - /profit                    -> Executive profit intelligence (Gross/Net margins, COGS)

REPORTS & ANALYTICS (10 Routes):
  - /reports                   -> Reports & Analytics navigation hub
  - /reports/sales             -> Wholesale Sales Analytics Report
  - /reports/purchases         -> Procurement & Consignments Report
  - /reports/inventory         -> Inventory Valuation & Stock Report
  - /reports/expiry            -> FEFO Expiry Risk Watchdog Report
  - /reports/low-stock         -> Stock Depletion & Reorder Report
  - /reports/customer-dues     -> Accounts Receivable (AR) Aging Report
  - /reports/supplier-dues     -> Accounts Payable (AP) Aging Report
  - /reports/medicines         -> Drug Movement & Catalog Matrix Report
  - /reports/payments          -> Collections & Salesman Recovery Report

SETTINGS & AUDIT (4 Routes):
  - /notifications             -> System alerts & watchdog notification center
  - /settings                  -> Multi-tab company profile, policies & staff list
  - /settings/profile          -> Personal user profile editor & password change
  - /audit-logs                -> Immutable forensic audit trail

API (1 Route):
  - /api/auth/login            -> REST endpoint for external LAN clients
```

---

## PART 20 — BUTTON & ACTION AUDIT

| Page / Section | Action / Control | Visual State | Actual Behavior | Audit Verdict |
| :--- | :--- | :--- | :--- | :--- |
| **`/dashboard`** | "New Sale" / "New Purchase" | Primary Buttons | Navigates to `/sales/new` and `/purchases/new` | ✅ Works |
| **`/dashboard`** | "Add Medicine" / "Collect Payment" | Secondary Buttons | Opens modal / navigates to `/payments` | ✅ Works |
| **`/dashboard`** | Date Range Presets | Dropdown | Updates date query and refreshes KPI numbers | ✅ Works |
| **`/medicines`** | "Add Medicine" | Primary Button | Opens modal dialog; creates medicine in SQLite | ✅ Works |
| **`/medicines`** | Table Row / "View" | Clickable Row | Navigates to `/medicines/[id]` | ✅ Works |
| **`/medicines`** | "Edit Medicine" | Dropdown Item | Opens prefilled modal; updates medicine in SQLite | ✅ Works |
| **`/medicines`** | "Deactivate / Activate" | Dropdown Item | Toggles status between ACTIVE / INACTIVE / DISCONTINUED | ✅ Works |
| **`/medicines`** | "Delete Medicine" | **NON-EXISTENT**| No delete button exists in table or modal | ❌ Missing Action |
| **`/inventory`** | "Stock Adjustments" | Outline Button | Navigates to `/inventory/adjustments` | ✅ Works |
| **`/inventory`** | "Stock Movement Ledger" | Outline Button | Navigates to `/inventory/movements` | ✅ Works |
| **`/inventory`** | "Export CSV" | Outline Button | Triggers `exportToCSV()` browser download | ✅ Works |
| **`/inventory/adjustments`** | "New Adjustment" | Primary Button | Opens modal dialog; executes atomic `adjustStock()` | ✅ Works |
| **`/inventory`** | "Stock Transfer" | **NON-EXISTENT**| No stock transfer action exists | ❌ Missing Action |
| **`/suppliers`** | "Add Supplier" | Primary Button | Opens modal dialog; creates supplier in SQLite | ✅ Works |
| **`/suppliers`** | "Record Payment" | Secondary Button | Opens Payment Voucher modal; executes FIFO AP settlement | ✅ Works |
| **`/suppliers`** | "Delete Supplier" | **NON-EXISTENT**| No delete action exists | ❌ Missing Action |
| **`/purchases/new`**| "Add Medicine Item" | Outline Button | Appends new row to purchase consignment form | ✅ Works |
| **`/purchases/new`**| "Confirm & Intake Purchase" | Primary Button | Commits atomic transaction, creates batches, increments stock | ✅ Works |
| **`/purchases/new`**| Warehouse / Location Input | **NON-EXISTENT**| Form omits warehouse and rack selection | ❌ Missing Control |
| **`/purchases/[id]`**| "Cancel Consignment" | Destructive | Opens modal; reverses batch stock & reverses supplier AP | ✅ Works |
| **`/purchases/[id]`**| "Print Consignment" | Secondary Button | Opens print view and triggers `window.print()` | ✅ Works |
| **`/customers/new`**| "Save Customer Pharmacy" | Primary Button | Validates with Zod; creates record in SQLite | ✅ Works |
| **`/customers`** | "View 360° Profile" | Table Row Action | Navigates to `/customers/[id]` | ✅ Works |
| **`/customers`** | "Customer Ledger" | Table Row Action | Navigates to `/customers/[id]/ledger` | ✅ Works |
| **`/customers`** | "Delete Customer" | **NON-EXISTENT**| No delete button exists | ❌ Missing Action |
| **`/sales/new`** | Customer & Salesman Picker | Dropdown Select | Populates customer credit limits and salesman routes | ✅ Works |
| **`/sales/new`** | Medicine & Batch Picker | Dropdown Select | Displays FEFO batches, auto-selects earliest expiry | ✅ Works |
| **`/sales/new`** | "Credit Override Approved" | Checkbox | Bypasses credit hold when authorized reason is provided | ✅ Works |
| **`/sales/new`** | "Submit Order & Generate Invoice" | Primary Button | Commits atomic sale, deducts stock, creates invoice & challan | ✅ Works |
| **`/sales/[id]`** | "Cancel Order" | Destructive | Restores batch stock (`SALE_CANCEL_RETURN`), reverses balance | ✅ Works |
| **`/invoices/[id]`**| "Print Invoice" | Primary Button | Opens `InvoicePrintModal` and triggers `window.print()` | ✅ Works |
| **`/payments`** | "Record Collection" | Primary Button | Opens modal; executes FIFO invoice settlement & creates receipt | ✅ Works |
| **`/expenses`** | "Record Expense" | Primary Button | Opens modal; commits expense voucher | ✅ Works |
| **`/expenses`** | "Cancel Expense" | Table Row Action | Prompts reason; marks voucher `REJECTED` | ✅ Works |
| **`/expenses`** | "Edit Expense" | **NON-EXISTENT**| No edit action exists | ❌ Missing Action |
| **`/profit`** | Date Preset Selector | Dropdown | Recomputes Revenue, COGS, Gross and Net profit dynamically | ✅ Works |
| **`/profit`** | "Export Summary" | Outline Button | Generates CSV download of financial summary | ✅ Works |
| **`/reports/*`** | "Export CSV" / "Print Report" | Header Buttons | Generates CSV file or opens browser print dialog | ✅ Works |
| **`/reports/*`** | "Export to Excel (.xlsx)" | **NON-EXISTENT**| Only CSV is supported; no binary Excel export | ❌ Missing Feature |
| **`/settings`** | "Save Changes" | Primary Button | Updates `Company` record for Business Profile only | 🟡 Partial Save |
| **`/settings`** | Policy Toggles (Invoice, Tax, Alerts) | Checkboxes | Checkboxes toggle in local state but **do not save to DB** | 🔴 Broken (Not Persisted) |
| **`/settings`** | "Add Staff User" / "Edit Role" | **NON-EXISTENT**| User table is strictly read-only | ❌ Missing Action |
| **`/settings/profile`** | "Update Profile" / "Change Password" | Primary Buttons | Updates name/phone and hashes new password into SQLite | ✅ Works |

---

## PART 21 — ERROR AUDIT & CODE INTEGRITY

1. **TypeScript Typecheck (`tsc --noEmit`)**:
   - `0 Errors`. Codebase passes full strict TypeScript verification with exit code 0.
2. **Build Verification (`next build`)**:
   - All 48 routes compile, bundle, and generate static/server artifacts without build-breaking errors.
3. **Database Integrity (`prisma/wmdms.db`)**:
   - SQLite database is active and relational constraints are intact.
4. **Hardcoded Regional & Currency Strings**:
   - `src/server/services/purchase.service.ts` line 456 contains hardcoded `৳` symbol in validation error message.
   - `src/server/services/sales.service.ts` line 550 contains hardcoded `৳` in credit barrier error message.
   - `src/server/services/payment.service.ts` line 214 defaults company address to `"Tejgaon Industrial Area, Dhaka"`.
   - `prisma/schema.prisma` line 205 defaults currency to `"BDT"` instead of `"AFN"`.
5. **Settings Persistence Bug**:
   - Submitting policy changes under Invoice & Print, Tax & Discount extra fields, Credit warning threshold, and Notification alerts in `/settings` silently drops the values because corresponding columns are missing from the `Company` model in SQLite.

---

## PART 22 — CLIENT REQUIREMENTS MAPPING MATRIX

| # | Client Requirement | Current Status | Existing Route | Existing Model | Missing Work & Technical Recommendations |
| :---: | :--- | :---: | :--- | :--- | :--- |
| **1** | **Login / Logout / Password** | ✅ **FULLY IMPLEMENTED** | `/login`, `/settings/profile` | `User` | Complete with bcrypt local SQLite hashing. Forgot-password returns offline notice. |
| **2** | **Item Deletion / Removal** | ❌ **MISSING** | `/medicines` | `Medicine` | Currently only soft-status (`INACTIVE`/`DISCONTINUED`) exists. Need safe deletion logic (check zero sales history, zero batch balance, or archive flag). |
| **3** | **Stock Add / Remove / Update** | ✅ **FULLY IMPLEMENTED** | `/inventory/adjustments`, `/inventory/movements` | `StockAdjustment`, `StockMovement`, `MedicineBatch` | Complete with negative stock protection, audit recording, and movement ledger. |
| **4** | **Manufacturer / Supplier Details** | 🟡 **PARTIALLY IMPLEMENTED** | `/suppliers`, `/medicines` | `Supplier` | Suppliers are fully managed, but **no separate `Manufacturer` model or attribute exists**. Need Manufacturer field on Medicine or Manufacturer entity. |
| **5** | **Open-Ended Warehouse Location** | 🟡 **PARTIALLY IMPLEMENTED** | `/inventory`, `/purchases/new` | `Warehouse`, `Rack` | `Warehouse` and `Rack` models exist, but **no UI exists to create/edit warehouses**, and purchase form omits location entry. Needs an open-ended location text field or rack selector on intake. |
| **6** | **Purchases & Intake Actions** | ✅ **FULLY IMPLEMENTED** | `/purchases`, `/purchases/new`, `/purchases/[id]` | `Purchase`, `PurchaseItem`, `MedicineBatch` | Multi-item intake, direct batch stock commitment, payment voucher creation, cancellation reversal all work. Missing warehouse/rack input in form. |
| **7** | **Suppliers & Accounts Actions** | ✅ **FULLY IMPLEMENTED** | `/suppliers`, `/suppliers/[id]` | `Supplier`, `SupplierPayment` | Complete with 360° profile, AP ledger, payment vouchers (`PV-YYYY-XXXXX`), FIFO settlement. Only deletion is missing. |
| **8** | **Clear Wholesale Sales Workflow** | ✅ **FULLY IMPLEMENTED** | `/sales`, `/sales/new`, `/sales/[id]` | `Sale`, `SaleItem`, `MedicineBatch` | Complete end-to-end workflow: customer credit check, FEFO batch selection, historical COGS capture, invoice generation, cancellation. |
| **9** | **Tax Invoice Actions** | ✅ **FULLY IMPLEMENTED** | `/invoices`, `/invoices/[id]` | `Invoice`, `Sale` | Complete with DGDA-compliant layout, Challan number, print/PDF modal via browser print. |
| **10**| **Collections & Receipts** | ✅ **FULLY IMPLEMENTED** | `/payments` | `CustomerPayment`, `PaymentInvoiceAllocation` | Complete with money receipt serials (`RCT-YYYY-XXXXX`), FIFO allocation across invoices, cheque tracking. |
| **11**| **Field Sales Representatives** | ✅ **FULLY IMPLEMENTED** | `/distributors`, `/distributors/[id]` | `Distributor`, `DistributorSale` | Complete 360° rep cockpit, targets, commission calculations, assigned customer tracking. Model name `Distributor` should be clarified to `SalesRep`. |
| **12**| **Operating Expenses** | 🟡 **PARTIALLY IMPLEMENTED** | `/expenses` | `BusinessExpense`, `ExpenseCategory` | Add expense, cancellation, and 5 standard categories work. **Editing an existing expense voucher is missing.** |
| **13**| **Profit & Financials** | ✅ **FULLY IMPLEMENTED** | `/profit` | `Sale`, `SaleItem`, `BusinessExpense` | Real calculations (not hardcoded): Sales Revenue, Historical COGS, Gross Profit, Expenses, Net Profit, daily trends, medicine & salesman breakdowns. |
| **14**| **Customer Pharmacies** | ✅ **FULLY IMPLEMENTED** | `/customers`, `/customers/new`, `/customers/[id]`, `/customers/[id]/ledger` | `Customer` | Complete onboarding, 360° profile, credit gauge, chronological AR ledger. Only deletion is missing. |
| **15**| **Warehouse Inventory** | 🟡 **PARTIALLY IMPLEMENTED** | `/inventory`, `/inventory/adjustments`, `/inventory/movements` | `MedicineBatch`, `StockMovement` | Batch-level FEFO valuation and adjustment ledgers are complete. **Warehouse CRUD and stock transfers between locations are missing.** |
| **16**| **Reports & Analytics** | ✅ **FULLY IMPLEMENTED** | `/reports` (9 sub-reports) | Multiple models | Complete reporting hub with search, date filters, summary cards, CSV export, and print. Binary `.xlsx` export missing. |
| **17**| **System Settings** | 🟡 **PARTIALLY IMPLEMENTED** | `/settings`, `/settings/profile` | `Company`, `User` | Business Profile and User Profile work. **Invoice, notification, and credit policy toggles do not persist to SQLite. User management is read-only.** |
| **18**| **Security Audit Logs** | ✅ **FULLY IMPLEMENTED** | `/audit-logs` | `AuditLog` | Append-only forensic ledger capturing user actions, old/new diffs, sanitizing secrets. View payload works. Read-only by design. |

---

## PART 23 — AUDIT DISCOVERY CONCLUSIONS FOR SENIOR DEVELOPER

1. **Architecture & Foundation**: The core architecture is robust. Next.js 15 Server Actions, atomic Prisma SQLite transactions, FEFO stock allocation, and double-entry accounting ledgers are properly designed and functional.
2. **Key Functional Gaps to Address in Next Phase**:
   - **Entity Deletion**: Add safe deletion workflows for Medicines, Customers, and Suppliers (with safety checks preventing deletion if transaction history exists).
   - **Manufacturer Master**: Decouple Manufacturer from Supplier or add explicit Manufacturer attribute.
   - **Warehouse Management**: Add open-ended warehouse / rack / shelf location inputs on the purchase intake form and inventory cockpit.
   - **Settings Model Alignment**: Add missing configuration columns to the `Company` Prisma schema so policy toggles actually persist to SQLite.
   - **User Management CRUD**: Implement Add User, Edit Role, and Deactivate User actions in `/settings`.
   - **Expense Editing**: Implement edit capabilities for draft/pending expense vouchers.
   - **Regional Clean-Up**: Normalize all error messages and database schema defaults from Bangladeshi Taka (`৳` / `BDT`) and Dhaka references to Afghanistan Afghani (`AFN` / `؋`) and Kabul references.
