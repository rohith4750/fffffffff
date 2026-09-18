# FinFlow - Microfinance & Field Collection ERP

FinFlow is an enterprise-grade Finance Management System designed for weekly and monthly microfinance operations, borrower customer management, field agent collections with GPS verification, 3-tier interest & penalty reconciliation, double-entry audit ledgers, and Cloudinary document storage.

---

## 🌟 Key Features

### 1. Dual-Role Experience (Admin & Field Agent)
- **Admin Portal**: Portfolio KPIs, customer KYC directory, loan approval & disbursement engine, live GPS field tracking, double-entry general ledger, P&L reporting, and audit trail.
- **Field Agent Mobile Mode**: Optimized mobile-first view for daily collection queues, one-tap collections, auto GPS capture, payment split preview, and thermal PDF receipt printing.

### 2. Loan Management (Weekly & Monthly Operations)
- **Weekly Finance**: `Interest = Principal × Weekly Interest Rate` (e.g. 2%/week) with weekly amortization schedules.
- **Monthly Finance**: `Interest = Principal × Monthly Interest Rate` (e.g. 5%/month) with monthly tenure tracking.
- **Lifecycle Engine**: `PENDING -> APPROVED -> DISBURSED -> ACTIVE -> OVERDUE -> CLOSED`.
- **Loan Closure Rule**: Closed only when `Principal Outstanding == 0`, `Interest Outstanding == 0`, and `Penalty Outstanding == 0`.

### 3. Strict 3-Tier Payment Distribution Engine
Payments are automatically allocated with immutable precedence:
```
Collected Amount
      ↓
1. Penalty (Accrued late fees)
      ↓
2. Interest (Weekly / Monthly interest yield)
      ↓
3. Principal (Loan capital recovery)
```

### 4. GPS-Based Collection Verification & Receipts
- Real-time GPS coordinates (latitude, longitude, accuracy in meters) auto-captured with every collection.
- Instant thermal PDF receipt generation (`jsPDF` & `jspdf-autotable`) with borrower info, split breakdown, and GPS audit stamp.

### 5. Cloudinary Document & Photo Storage
- Direct unsigned upload preset integration for Aadhaar Card (Front/Back), PAN Card, Customer Photo, and collection proof images.
- Instant fallback local object preview ensures seamless offline testing.

### 6. Double-Entry General Ledger & Reports
- Every disbursement and payment split creates double-entry transaction records.
- Real-time Profit & Loss statement, daily Cash vs UPI collection breakdown, and agent performance leaderboard.
- Immutable Audit Trail recording user, action, device, and IP address.

---

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Start Vite Development Server
npm run dev
```

### Build for Production

```bash
npm run build
```

---

## 🛠️ Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Mapping & Geolocation**: Leaflet, Browser Geolocation API
- **Document & Receipt Generation**: jsPDF, jsPDF-AutoTable
- **Cloud Storage**: Cloudinary Direct REST API + local fallback store
- **Build Tool**: Vite 6
