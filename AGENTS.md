# AGENTS DIRECTIVE & REPOSITORY CONTINUATION POLICY

## 1. Remote Repository Rule
- **Primary Remote**: `https://github.com/00tatheer00/WholeSale-Distributor-System.git`
- **Main Branch**: `main`
- **Auto-Push Requirement**: Always commit and push all newly implemented code, schema changes, and documentation directly to `origin main` upon completing tasks or phases without needing additional prompts.

## 2. Project State Persistence
- Before starting new work, read `docs/PROJECT_STATUS.md` and `MASTER_BLUEPRINT.md` to identify current progress and exact phase boundaries.
- After completing work or any session changes, update `docs/PROJECT_STATUS.md` with:
  - Last completed phase/deliverable
  - Current verification state (`npm run typecheck`, `npm run build`)
  - Next planned phase
- Commit and push `docs/PROJECT_STATUS.md` along with project source code.

## 3. Strict Domain Guardrails
- Wholesale Pharmaceutical Distributor ERP ONLY (Not retail POS).
- Strictly adhere to FEFO (First-Expire, First-Out) queuing, historical batch COGS preservation, credit limit holds, and BDT currency formatting.
