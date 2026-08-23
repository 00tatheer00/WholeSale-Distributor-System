# ENTERPRISE PRODUCTION DEPLOYMENT RUNBOOK

**Application**: Wholesale Medicine Distribution Management System (WMDMS)  
**Hosting Target**: Vercel (Next.js 15 App Router)  
**Database**: Supabase Managed PostgreSQL (AWS / Region)  
**ORM / Schema**: Prisma 6  
**Authentication**: Supabase Auth (JWT & Session Cookies)  
**Storage**: Supabase Storage (`company-logos`, `documents`)  

---

## 1. Supabase PostgreSQL Production Setup

### A. Database Connection Strings (Session vs Transaction Pooling)
In serverless deployments (Vercel), Prisma must connect through **PgBouncer** connection pooler to prevent PostgreSQL connection exhaustion.

1. **`DATABASE_URL`** (Transaction Mode - Port 6543):
   ```env
   DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
   ```
2. **`DIRECT_URL`** (Session Mode - Port 5432):
   ```env
   DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
   ```

### B. Applying Safe Production Migrations
Never run `prisma db push` or `prisma migrate reset` against production. Run:
```bash
npx prisma migrate deploy
```
This safely applies unapplied SQL migrations sequentially and records them in the `_prisma_migrations` table.

---

## 2. Vercel Deployment Configuration

### A. Project Build Settings in Vercel Dashboard
- **Framework Preset**: Next.js
- **Root Directory**: `./`
- **Build Command**: `npx prisma generate && next build`
- **Output Directory**: `.next`
- **Node.js Version**: `20.x` or `22.x`

### B. Required Vercel Environment Variables
Set these variables in the Vercel Project Settings $\rightarrow$ Environment Variables:

| Variable Name | Environment | Target | Description |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Production | Server Only | Supabase transaction pooler URI (Port 6543) with `?pgbouncer=true` |
| `DIRECT_URL` | Production | Server Only | Supabase direct connection URI (Port 5432) |
| `NEXT_PUBLIC_SUPABASE_URL` | Production | Public (Browser & Server) | Supabase project API URL (`https://[PROJECT_REF].supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production | Public (Browser & Server) | Supabase public anon API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Production | Server Only | Supabase high-privilege service role key (Never exposed to client) |
| `NEXT_PUBLIC_APP_URL` | Production | Public (Browser & Server) | Canonical production domain (e.g. `https://erp.apexpharma.com.bd`) |
| `RESEND_API_KEY` | Production | Server Only | Transactional email API key |
| `EMAIL_FROM` | Production | Server Only | Verified email sender domain |

---

## 3. Supabase Auth & Redirect Configuration

1. In the Supabase Dashboard $\rightarrow$ **Authentication** $\rightarrow$ **URL Configuration**:
   - **Site URL**: `https://erp.apexpharma.com.bd`
   - **Redirect URLs**:
     - `https://erp.apexpharma.com.bd/**`
     - `https://erp.apexpharma.com.bd/login`
     - `https://erp.apexpharma.com.bd/reset-password`
2. **Email Auth Provider**: Ensure Email & Password sign-in is enabled.

---

## 4. Supabase Storage Bucket Configuration

1. Create Bucket: `company-logos` (Public read, Authenticated write).
2. Create Bucket: `documents` (Private read/write for invoice PDFs and export files).

---

## 5. Production Smoke Test Checklist (Post-Deployment)

Execute this strict 10-step smoke test immediately upon live launch:

1. **Authentication**: Admin login at `/login` with valid credentials.
2. **Dashboard Cockpit**: Confirm `/dashboard` loads live KPIs and Recharts trends without errors.
3. **Master Medicine Master**: Create test medicine at `/medicines` with dosage form and unit conversion.
4. **Purchase Consignment Intake**: Book PO at `/purchases/new` $\rightarrow$ verify batch stock created in `MedicineBatch` and logged in `StockMovement`.
5. **Wholesale Sales Order Booking**: Create wholesale order at `/sales/new` $\rightarrow$ verify atomic FEFO batch allocation and historical COGS snapshot.
6. **Wholesale Invoice Generation**: View tax invoice at `/invoices/[id]` $\rightarrow$ verify DGDA formatting and print layout.
7. **Customer Collections**: Record money receipt at `/payments` $\rightarrow$ verify FIFO invoice settlement and customer AR balance deduction.
8. **Financial Cockpit**: Verify `/profit` reflects strict mathematical formula ($\text{Revenue} - \text{COGS} = \text{Gross Profit}$).
9. **Reports Center**: Export filtered CSV from `/reports/sales` and `/reports/inventory`.
10. **Security Audit Log**: Confirm all actions above are recorded in `/audit-logs` with timestamp and actor ID.

---

## 6. Rollback & Emergency Runbook

If an unexpected production defect occurs:
1. **Instant Vercel Rollback**: Navigate to Vercel $\rightarrow$ Deployments $\rightarrow$ Select previous stable deployment $\rightarrow$ Click **"Instant Rollback"** ($< 5\text{ seconds}$).
2. **Database Rollback**: If a schema migration failed, execute:
   ```bash
   npx prisma migrate resolve --rolled-back "<failed_migration_name>"
   ```
3. **Health Status Monitoring**: Monitor real-time logs via Vercel Runtime Logs and Supabase Database Metrics.
