# PharmaDist Wholesale ERP — Offline Desktop Delivery & Multi-PC Setup Guide

## 1. Overview (Software Overview)
* **Application Type:** 100% Offline Standalone Desktop ERP (Electron + Next.js + SQLite).
* **Target OS:** Windows 10 / Windows 11 (64-bit).
* **Database:** Embedded SQLite (`wmdms.db` — zero installation, zero server maintenance).
* **Authentication:** Local bcrypt encryption with role-based access control.

---

## 2. Client Delivery via USB (USB se Client ko Dena)

1. **Setup File:**
   * Build ke baad `dist/` folder me `PharmaDist Wholesale ERP Setup.exe` file hogi (Size: ~150–250 MB).
   * Is `.exe` file ko kisi bhi standard **4 GB ya 8 GB USB Drive** me copy karein.
2. **Client PC par Installation:**
   * Client ke **Main PC** par USB lagayein aur `PharmaDist Wholesale ERP Setup.exe` par double click karein.
   * Software automatic install ho jayega aur Desktop par **"PharmaDist Wholesale ERP"** ka icon ban jayega.
   * Double click karte hi software 100% offline open ho jayega!

---

## 3. Default Login Credentials (Shuruati Login Data)

| Role | Email | Default Password | Access Level |
|---|---|---|---|
| **Super Admin** | `admin@erp.com` | `admin@123` | Full Executive & System Privileges |
| **Sales Manager** | `manager@erp.com` | `manager@123` | Sales, Approvals & Distributors |
| **Cashier** | `cashier@erp.com` | `cashier@123` | Invoicing, Receipts & POS Billing |

> **Security Note:** Pehle login ke baad Admin settings (`Settings > Profile`) se apna password zaroor tabdeel karein.

---

## 4. Multi-PC & Mobile Connection (Baaqi Computers aur Mobile se Connect Karna)

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

## 5. Database Backup & Safety (Data Mehfooz Rakhna)

* SQLite database file `prisma/wmdms.db` (ya installation directory) me store hoti hai.
* Rozana ya hafte me aik baar is `wmdms.db` file ko USB me copy karke safe rakh sakte hain.
* Agar PC kharab bhi ho jaye, toh sirf naye PC par `.exe` install karke `wmdms.db` file replace karne se poora purana data wapis aa jayega!
