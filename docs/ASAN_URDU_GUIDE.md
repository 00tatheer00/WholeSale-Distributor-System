# PharmaDist ERP — Asan Roman Urdu User Guide (انتہائی آسان گائیڈ)

Yeh guide khaas tor par medicine wholesale distributors, godown in-charge aur munshi hazraat ke liye likhi gayi hai. Har step aasan zaban me asli screenshots aur 1-2-3 steps ke saath samjhaya gaya hai.

---

## 1. Dashboard Aur 6 Jadoo-i Quick Action Buttons
Jab aap system login karte hain toh samnay Wholesale Distribution Cockpit (Dashboard) khulta hai. Wahan 6 barray buttons hain:

| Button | Rang | Kaam |
| :--- | :--- | :--- |
| **+ New Sale Bill** | 🟢 Sabz | Customer medical store ko dawa bechein aur foran bill print karein |
| **+ Add Factory Stock** | 🔵 Neela | Factory se aayi hui dawa aur batch godown me dakhil karein |
| **+ Add Pharmacy** | 🟣 Jamni | Nayi customer pharmacy / medical store register karein |
| **+ Add Supplier** | 🟠 Pila | Nayi dawa banane wali company add karein |
| **+ Add Godown** | 🟢 Ferozi | Naya godown ya kamra banayein |
| **+ Record Expense** | 🔴 Surkh | Dukan ka kiraya, bijli, petrol, chai aur tankhwah ka kharcha dakhil karein |

![Dashboard Screenshot](screenshots/01_dashboard.png)

---

## 2. Apna Login Email Aur Password Kaise Badlein?
Kisi software wale ko phone karne ki zaroorat nahi hai:
1. Left side ke menu me sab se neechay **System Settings** par click karein.
2. Sab se ooper neela card nazar aayega: **"Admin Login Email & Password (Apna Login & Password Badlein)"**.
3. Apna naya Email address likhein.
4. **New Password** aur **Confirm New Password** ke khanay me naya password type karein (kam az kam 6 haroof).
5. Neela button **"Save My Email & Password"** daba dein. Foran naya password chal jayega!

![Settings Screenshot](screenshots/06_settings.png)

---

## 3. Factory Se Stock Dakhil Karna (Purchase Intake & Batches)
Jab factory se gari aye aur peti godown me dakhil ho:
1. Dashboard par neela button **+ Add Factory Stock** dabayein.
2. **Supplier** select karein (Agar company list me nahi hai, toh dropdown ke saath hi `+ New Supplier` ka button dabayein!).
3. **Godown** select karein (saath hi `+ New Godown` ka button bhi majood hai).
4. Factory ka **Invoice #** likhein.
5. Dawa select karein, Peti par likha **Batch Number** (e.g. BX-2026-01) likhein, calendar se **Expiry Date** select karein, taadad (Qty), Bonus, Kharid Price (Cost Rs.) aur Wholesale Trade Price (TP Rs.) likhein.
6. Neela button **Save & Receive Factory Stock** daba dein. Stock foran godown me add ho jayega!

![Purchase Intake Screenshot](screenshots/03_new_purchase.png)

---

## 4. Customer Ko Dawa Bechna Aur Naya Bill Banana (FEFO Sale)
Medical store ko bill bana kar dene ka 3-step aasan tareeqa:
1. **Step 1:** Pharmacy select karein (Agar pehli dafa aayi hai toh ooper `+ New Customer` dabayein aur 10 second me register karein). Salesman / Booker select karein.
2. **Step 2:** Dawa select karein. **System khud-b-khud sab se pehle expire hone wala batch select kar lega** (saath sabz rang ka `FEFO (Earliest Expiry)` badge nazar aayega!). Taadad (Qty) likhein.
3. **Step 3:** Sabz button **Create & Print Sale Invoice** dabayein. Foran print out nikal aayega!

![New Sale Screenshot](screenshots/02_new_sale.png)

---

## 5. Stock Check Karna Aur Kharab / Tooti Dawa Theek Karna
Godown ka stock dekhne ke liye menu me **Stock & Batches (Inventory)** par jayein:
- **Agar koi shishi toot gayi ya expire ho gayi:** Ooper peela button **± Correct Stock / Damage** dabayein, dawa aur batch select karein, taadad me `-2` likhein aur submit karein.
- **Near Expiry Alerts:** Agar koi dawa aglay 90 din me expire hone wali hogi toh system Dashboard aur Inventory par pehle hi alert de dega taake aap usay factory wapis bhej sakein ya foran discount par nikaal sakein.

![Inventory Screenshot](screenshots/04_inventory.png)

---

## 6. Rozana Ka Kharcha Record Karna (Expenses)
- Dashboard se surkh card **+ Record Expense** dabayein.
- Category select karein (Rent, Electricity, Fuel, Staff Tea, Salaries).
- Raqam (Rs.) likhein aur Save karein. Yeh kharcha aap ke rozana munafay (Net Profit) se khud minus ho jayega.

![Expenses Screenshot](screenshots/05_expenses.png)

---

## 7. Munshi Rozana Schedule (Daily SOP)
- **Subah:** Dashboard khol kar Low Stock aur Near Expiry alerts dekhein. Salesmen ko recovery list dein.
- **Din:** Factory se aane wala stock dakhil karein aur sales bills banayein.
- **Shaam:** Salesmen se aane wali recovery receive karein, rozana ka kharcha dalein, aur Dashboard par **Today's Net Profit** dekh kar hisab band karein!
