# Wholesale Medicine Distribution Management System (WMDMS)

> **Enterprise Web-Based ERP for Wholesale Pharmaceutical Distributors, Stockists, and Drug Suppliers**

---

## 1. Project Overview

The **Wholesale Medicine Distribution Management System (WMDMS)** is an enterprise web application designed exclusively for high-volume, multi-tier pharmaceutical wholesale distribution. 

### Core Differentiators:
- **Wholesale Only**: Tailored strictly for B2B wholesale pharmaceutical business (Manufacturer $\rightarrow$ Purchase $\rightarrow$ Warehouse/FEFO $\rightarrow$ Sales Rep $\rightarrow$ Customer Pharmacy $\rightarrow$ Invoicing $\rightarrow$ AR Dues $\rightarrow$ COGS/Profit).
- **Batch & FEFO Enforcement**: Automated First-Expire, First-Out queue allocation with mandatory expiration date tracking.
- **Credit Risk Protection**: Automated customer credit limits and overdue aging thresholds to prevent bad debt exposure.
- **Accurate Margin Accounting**: Real-time batch-specific Cost of Goods Sold (COGS) tracking for authentic Gross and Net profit calculation.
- **Double-Entry Traceability**: Immutable audit logs and double-entry stock movement tracking.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router, Server Components & Server Actions) |
| **Language** | TypeScript (Strict Mode) |
| **Styling & Design System** | Tailwind CSS + shadcn/ui + Lucide Icons |
| **Theme** | Light / Dark Mode via `next-themes` |
| **Database** | Supabase PostgreSQL 15+ |
| **ORM & Migrations** | Prisma ORM with connection pooling |
| **Authentication** | Supabase Auth (`@supabase/ssr`) with Cookie Session Management |
| **Storage** | Supabase Storage (License Documents, Invoices, Attachments) |
| **Data Validation** | Zod (End-to-End Type Validation) |
| **Form Handling** | React Hook Form + `@hookform/resolvers` |
| **Data Tables** | TanStack Table v8 |
| **Charts & Analytics** | Recharts |
| **Transactional Email** | Resend API |
| **Deployment Target** | Vercel Edge / Serverless Platform |

---

## 3. Directory Structure

```
├── .env.example                     # Environment template with security notes
├── .env.local                       # Local environment variables
├── components.json                  # shadcn/ui configuration
├── MASTER_BLUEPRINT.md              # Approved Phase 0 Master Technical Specification
├── next.config.mjs                  # Next.js 15 configuration
├── package.json                     # Core dependencies and scripts
├── postcss.config.mjs               # PostCSS & Tailwind integration
├── prisma/
│   └── schema.prisma                # Prisma PostgreSQL datasource & generator
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── layout.tsx           # Authentication hero layout
│   │   │   └── login/page.tsx       # System sign-in screen
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx           # Protected layout with AppShell
│   │   │   ├── dashboard/page.tsx   # Distribution command center
│   │   │   ├── medicines/page.tsx   # Drug catalog master
│   │   │   ├── inventory/page.tsx   # Warehouse & FEFO batch control
│   │   │   ├── suppliers/page.tsx   # Vendor directory & AP
│   │   │   ├── purchases/page.tsx   # Procurement, PO & GRN
│   │   │   ├── customers/page.tsx   # Pharmacy directory & credit
│   │   │   ├── sales/page.tsx       # Sales orders & picking slips
│   │   │   ├── invoices/page.tsx    # Wholesale tax billing & challans
│   │   │   ├── payments/page.tsx    # Customer AR receipts & supplier AP
│   │   │   ├── distributors/page.tsx# Salesmen routes & beats
│   │   │   ├── expenses/page.tsx    # Operational expenses & petty cash
│   │   │   ├── reports/page.tsx     # BI, COGS, and P&L analytics
│   │   │   └── settings/page.tsx    # System admin, RBAC & audit logs
│   │   ├── error.tsx                # Runtime error boundary
│   │   ├── global-error.tsx         # Root error boundary
│   │   ├── globals.css              # Tailwind and CSS variable tokens
│   │   ├── layout.tsx               # Root HTML shell & ThemeProvider
│   │   ├── loading.tsx              # Root loading skeleton
│   │   ├── not-found.tsx            # Custom 404 page
│   │   └── page.tsx                 # Root redirect to /dashboard
│   ├── components/
│   │   ├── layout/                  # Shell, Sidebar, Header, Breadcrumbs, UserNav
│   │   ├── shared/                  # EmptyState, ErrorState, StatCard, Skeletons
│   │   ├── theme-provider.tsx       # Theme provider wrapper
│   │   ├── theme-toggle.tsx         # Dark/Light toggle
│   │   └── ui/                      # shadcn/ui primitives (Button, Card, Badge, etc.)
│   ├── lib/
│   │   ├── constants.ts             # Navigation hierarchy & app constants
│   │   ├── prisma.ts                # Server-only Prisma client singleton
│   │   ├── supabase/                # Client, server, middleware & admin clients
│   │   └── utils.ts                 # Class merging & currency/date helpers
│   ├── middleware.ts                # Next.js edge session refresh middleware
│   ├── types/                       # Shared TypeScript interfaces & roles
│   └── validations/                 # Zod validation schemas
├── tailwind.config.ts               # Custom enterprise color tokens & animations
└── tsconfig.json                    # Strict TypeScript configuration
```

---

## 4. Local Development Setup

### 4.1 Prerequisites
- **Node.js**: v20+ or v22+
- **npm**: v10+

### 4.2 Installation
```bash
# Clone the repository
git clone <repository-url>
cd "Wholesale Distributor Management Software"

# Install project dependencies
npm install

# Generate Prisma Client
npm run prisma:generate
```

### 4.3 Environment Configuration
Copy the `.env.example` file to create your `.env.local`:
```bash
cp .env.example .env.local
```
Fill in the following variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon public key.
- `SUPABASE_SERVICE_ROLE_KEY`: Your server-only service role key (keep secret).
- `DATABASE_URL`: Transaction pooler connection string (Port 6543).
- `DIRECT_URL`: Direct session connection string (Port 5432).
- `RESEND_API_KEY`: API key from Resend for transactional invoices and notifications.

---

## 5. Development Commands

| Command | Action |
|---|---|
| `npm run dev` | Start local development server at `http://localhost:3000` |
| `npm run build` | Compile Next.js production build |
| `npm run start` | Start Next.js production server |
| `npm run lint` | Run ESLint static code analysis |
| `npm run typecheck` | Run strict TypeScript compiler verification |
| `npm run prisma:generate` | Regenerate Prisma client from schema |

---

## 6. Security & Architectural Rules

1. **Client / Server Isolation**: Secret keys (`SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`) are strictly guarded with `import "server-only";` and can never be imported into client components.
2. **Double-Entry Stock Accounting**: Every physical medicine movement generates an immutable record in `StockMovement`.
3. **No Direct Model Deletion**: Production records use soft deletion or status transitions to guarantee historical financial and regulatory audits.
4. **Strict Phase Control**: Phase 1 establishes the clean project foundation. Business database schemas and models are designed in Phase 2.

---

## 7. Production Deployment (Vercel & Supabase)

1. Connect GitHub repository to **Vercel**.
2. Configure environment variables in Vercel Project Settings matching `.env.example`.
3. Ensure `DIRECT_URL` and `DATABASE_URL` point to Supabase Connection Pooler.
4. Build command: `npm run prisma:generate && next build`.
