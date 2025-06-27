# 🧾 Mini Reconciliation Tool

This is a lightweight web app that simulates a real-world finance ops workflow — reconciling transactions between an internal system and a payment provider.

> Built using HTML, CSS, and vanilla JavaScript

---

## 💡 Problem

Finance and treasury teams often need to verify that their internal records match those from payment providers. This tool helps identify discrepancies by comparing two CSV files.

---

## ✅ Features

- Upload two CSV files:
  - Internal System Export
  - Provider Statement
- Automatically compares transactions using `transaction_reference`
- Highlights:
  - ✅ Matched Transactions
  - ⚠️ Transactions only in Internal file
  - ❌ Transactions only in Provider file
  - 🔴 Mismatched `amount` or `status`
- Export each category as a downloadable CSV
- Clean, responsive UI with color-coded sections

---

## 📂 Sample CSV Format

```csv
transaction_reference,amount,status
TXN001,100.00,completed
TXN002,50.00,pending

---

## 🔧 Tech Stack

- HTML5
- CSS3
- JavaScript (ES6)
- Replit (for deployment)

---

## 🛠️ Potential Improvements

- Handle quoted CSV fields and special characters using a library like [PapaParse](https://www.papaparse.com/)
- Upload Excel files (`.xlsx`)
- Filter by date or transaction status
- Add authentication and user-specific data views
- Save history or logs using a backend