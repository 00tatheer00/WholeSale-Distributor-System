# ENTERPRISE BACKUP, DISASTER RECOVERY & DATA PROTECTION RUNBOOK

**Project**: Wholesale Medicine Distribution Management System (WMDMS)  
**Database**: Supabase PostgreSQL 15+  
**ORM / Data Layer**: Prisma ORM with Strict Database Transactions (`$transaction`)  
**Storage**: Supabase Storage  
**Application**: Next.js 15 (App Router) on Vercel  

---

## 1. Executive Summary & Objective

This document defines the production backup strategy, data retention policy, and disaster recovery procedures for the Wholesale Pharmaceutical Distributor ERP. 

In a wholesale pharmaceutical distribution enterprise, data integrity is paramount:
1. **DGDA Regulatory Compliance**: Historical drug batches, expiry dates, and wholesale tax invoices must be preserved without loss.
2. **Financial Precision**: Double-entry customer receivables (AR) and supplier payables (AP) ledgers must remain mathematically sound across all recovery operations.
3. **Stock Auditing**: Historical unit cost prices (COGS) and stock adjustment movement trails cannot be retroactively altered.

---

## 2. Automated Database Backup Architecture (Supabase PostgreSQL)

### A. Point-In-Time Recovery (PITR)
- **Mechanism**: Continuous Write-Ahead Log (WAL) archiving combined with daily physical base backups.
- **Granularity**: Allows restoring the database to any exact second within the retention window (e.g., restoring to 1 second prior to a data corruption event).
- **Target RPO (Recovery Point Objective)**: $< 2\text{ minutes}$.
- **Target RTO (Recovery Time Objective)**: $< 15\text{ minutes}$.

### B. Daily Snapshot Backups
- **Schedule**: Automated daily physical database snapshots at `02:00 UTC` (low-traffic window).
- **Retention Period**:
  - Daily Snapshots: Retained for **30 days**.
  - Weekly Snapshots: Retained for **90 days**.
  - Monthly Compliance Snapshots: Retained for **7 years** (DGDA fiscal audit requirement).

### C. Manual & Pre-Migration Backups (`pg_dump`)
Before running any schema migrations (`prisma migrate deploy` or major data alterations), an on-demand logical backup must be generated:

```bash
# Export compressed PostgreSQL database dump
pg_dump -h db.supabase.co -U postgres -d postgres -F c -b -v -f "backups/wmdms_backup_$(date +%Y%m%d_%H%M%S).dump"
```

---

## 3. Data Protection & Encryption

| Domain | Protection Level | Implementation |
| :--- | :--- | :--- |
| **Data at Rest** | AES-256 Encryption | Supabase PostgreSQL encrypted storage volumes. |
| **Data in Transit** | TLS 1.3 / SSL | Enforced SSL connections (`sslmode=require`) across all Prisma and Supabase client calls. |
| **Secrets & Keys** | Redacted from Logs | Environment variables (`DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) are kept in Vercel / server-side only. |
| **Audit Logs** | Append-Only Immutability | `AuditLog` table has no delete/update endpoints in the application API. |

---

## 4. Disaster Recovery Scenarios & Step-by-Step Runbooks

### Scenario 1: Accidental Transaction Cancellation or Data Mutation
- **Classification**: Logical application-level error (e.g., accidental bulk batch adjustment).
- **Procedure**:
  1. Inspect the immutable audit log at `/audit-logs` to identify the exact actor ID, timestamp, and payload diff (`oldValues` vs `newValues`).
  2. Use the application's built-in reconciliation endpoints or counter-adjustments (e.g., `StockAdjustment` with `adjustmentType: COUNT_DISCREPANCY_ADD`).
  3. If widespread corruption occurred, initiate PITR restoration to the timestamp immediately preceding the event.

### Scenario 2: Failed Database Migration during Deployment
- **Classification**: Schema migration failure.
- **Procedure**:
  1. Halt application traffic via Vercel Maintenance Mode.
  2. Restore the pre-migration snapshot taken before `prisma migrate deploy`.
  3. Execute Prisma rollback script or resolve migration discrepancies locally:
     ```bash
     npx prisma migrate resolve --rolled-back "<migration_name>"
     ```
  4. Verify schema integrity with `npx prisma validate`.
  5. Redeploy previous stable commit on Vercel.

### Scenario 3: Supabase Regional Database Outage
- **Classification**: Cloud infrastructure failure.
- **Procedure**:
  1. Monitor Supabase Status Page (`status.supabase.com`).
  2. For extended regional disaster ($> 1\text{ hour}$), spin up secondary hot-standby Supabase instance in an alternate availability zone.
  3. Restore the latest WAL snapshot into the secondary cluster.
  4. Update `DATABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL` environment variables in Vercel.
  5. Trigger instant Vercel redeployment without cache.

### Scenario 4: Supabase Storage Asset Recovery (Logos & Attachments)
- **Classification**: Object storage failure.
- **Procedure**:
  1. Buckets are mirrored across multi-AZ S3-compatible cloud storage.
  2. Company logos and printable challan assets are re-synced from cold storage backup.

---

## 5. Distinction Between Backups and Version Control

> [!IMPORTANT]
> **Git is NOT a database backup.**
> Git repository (`https://github.com/00tatheer00/WholeSale-Distributor-System.git`) stores the application source code, Prisma schemas, and migration SQL files. It does **not** store customer ledgers, live batch quantities, or transaction records. Database backups must be managed exclusively through Supabase PostgreSQL automated tools and scheduled `pg_dump` snapshots.

---

## 6. Verification & Disaster Recovery Drill Schedule

To guarantee operational readiness, the engineering team executes periodic recovery drills:
- **Bi-Weekly**: Verify Supabase automated backup completion and snapshot storage size.
- **Quarterly**: Test PITR restoration to a staging environment and verify that all 45 ERP routes load without data inconsistencies.
- **Annually**: Full disaster recovery simulation including DNS switch and multi-user RBAC integrity validation.
