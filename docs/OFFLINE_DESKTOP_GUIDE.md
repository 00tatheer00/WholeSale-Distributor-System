# PharmaDist Wholesale ERP — Offline Desktop Delivery & Multi-PC Setup Guide

## 1. Overview (Software Overview)
* **Application Type:** 100% Offline Standalone Desktop ERP (Electron + Next.js + SQLite).
* **Target OS:** Windows 10 / Windows 11 (64-bit).
* **Database:** Embedded SQLite (`wmdms.db` — zero installation, zero server maintenance).
* **Authentication:** Local bcrypt encryption with role-based access control.

---

## 2. Client Delivery Methods (Client ko Software Dena)

### Tariqa 1: Online Download Link (Google Drive / WeTransfer) — Sabse Asaan
1. `npm run electron:build` chalane par `dist/` folder ke andar setup installer ban jayega:
   `dist/PharmaDist Wholesale ERP Setup 1.0.0.exe` (~150-200 MB).
2. Is `.exe` file ko apni **Google Drive** ya **WeTransfer** par upload karein.
3. Client ko WhatsApp ya Email par **Download Link** bhej dein.
4. Client link se download karega aur apne computer par double-click karke install kar lega!

### Tariqa 2: USB Drive se Dena
1. `PharmaDist Wholesale ERP Setup 1.0.0.exe` ko kisi bhi standard USB Drive mein copy karein.
2. Client ke PC par USB lagayein aur setup file ko copy karke run karein.

---

## 3. Client PC par 2-Click Installation (Jese MS Word / Chrome)
1. Client `PharmaDist Wholesale ERP Setup 1.0.0.exe` par **Double Click** karega.
2. Standard Windows Setup Wizard khulay ga $\rightarrow$ Client **"Next"** aur **"Install"** dabaye ga.
3. **Desktop par automatic shortcut icon** ban jayega: **"PharmaDist Wholesale ERP"**.
4. **Start Menu** mein bhi app add ho jayegi.
5. Client bas Desktop icon par double-click karega aur software 100% offline open ho jayega!

---

## 4. Default Seeded Credentials (Shuruati Login Data)

| Role | Login Email | Default Password | Access Level |
|---|---|---|---|
| **Super Admin (Owner)** | `admin@pharmadist.com` | `admin123` | Full Executive & System Control |
| **Sales Manager** | `sales.manager@pharmadist.com` | `sales123` | Sales Orders, Customers & Invoices |
| **Warehouse Officer** | `warehouse@pharmadist.com` | `warehouse123` | Purchases, Batches, GRN & FEFO |
| **Accounts Officer** | `accounts@pharmadist.com` | `accounts123` | Ledger, Vouchers & Financial Collections |

> **Custom Credentials Note:** Client login karne ke baad **Settings $\rightarrow$ Team & Security** mein jaa kar kisi bhi account ka Email aur Password apne mutabiq tabdeel kar sakta hai. Naya password SQLite mein permanently save ho jata hai.

---

## 5. Multi-PC & Mobile Connection (Baaqi Computers aur Mobile se Connect Karna)

Agar client ke office me **multiple computers ya mobile phones** se software use karna ho:

1. **Main PC:**
   * Main PC par PharmaDist ERP open rakhein.
   * Application menu me **File > Local Network IP** par click karein. Wahan aapko IP address dikhega (e.g. `http://192.168.1.50:3000`).
2. **Dusre PCs aur Mobiles (Client Devices):**
   * Dusre devices ko **same Office Wi-Fi ya Router** se connect karein.
   * Browser (Google Chrome / Safari) kholein aur wo IP address dalein:
     ```text
     http://192.168.1.50:3000
     ```
   * **Kisi bhi dusre computer ya mobile par kuch bhi install karne ki zaroorat nahi hai.**
   * Sab devices aik hi real-time database se connect ho jayengi.

---

## 6. Database Backup & Safety (Data Mehfooz Rakhna)

* SQLite database file `prisma/wmdms.db` (ya installation directory) me store hoti hai.
* Rozana ya hafte me aik baar is `wmdms.db` file ko USB me copy karke safe rakh sakte hain.
* Agar PC kharab bhi ho jaye, toh sirf naye PC par `.exe` install karke `wmdms.db` file replace karne se poora purana data wapis aa jayega!
