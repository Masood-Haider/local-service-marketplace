# HomeServicesHub — Local Services Marketplace

A modern, full-stack, real-time marketplace platform connecting homeowners and customers with verified local service providers (Plumbers, Electricians, Cleaners, HVAC technicians, Carpenters, Tutors, Movers, and Handymen).

Built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, **shadcn/Radix UI**, and **Firebase** (Authentication, Cloud Firestore, Cloud Storage, and Firebase Hosting).

---

## 🚀 Key Features

### 1. Customer Experience
- **Interactive Directory & Multi-Criteria Filtering**: Filter specialists by trade category, starting rates, and verified customer ratings with live search refinement.
- **Job Posting & Quotes**: Post service requests with preferred dates, budgets, locations, and details. Receive and evaluate provider quotes in a dedicated subcollection (`jobs/{jobId}/quotes`).
- **Quote Acceptance & Booking Workflow**: Seamless quote acceptance with chosen time slots that atomics create scheduled bookings.
- **Booking Management**: Track appointments through live lifecycle states (`pending`, `confirmed`, `in_progress`, `completed`, `cancelled`).
- **Atomic Customer Reviews**: Submit 1-to-5 star ratings and reviews once a booking is marked `completed`. A Firestore atomic transaction automatically recalculates the provider's `avgRating` and `totalReviews`.

### 2. Provider Hub
- **Provider Profile & Portfolio**: Manage service categories, bio, hourly price ranges, service regions, and high-resolution portfolio images.
- **Quote Dispatching**: Browse open customer jobs in the marketplace and submit competitive quotes.
- **Job Scheduling**: Calendar schedule management with sequential status progression (`pending` → `confirmed` → `in_progress` → `completed`).
- **Reputation Tracking**: View verified reviews and feedback left by customers.

### 3. Administrator Console
- **Platform Analytics & KPI Overview**: Real-time GMV calculations, platform fee metrics, bookings timeline chart, and category distribution graphs.
- **User Accounts Management**: Full moderation table to inspect UIDs, toggle account disabled status, or delete accounts.
- **Provider Verification**: Approve, flag, or reject onboarding provider profiles.
- **Job & Booking Controls**: Platform-wide booking table with administrative status overrides.
- **Platform Settings & One-Click Demo Seeder**: Adjust commission take-rates, emergency support lines, and instantly seed sample marketplace data.

### 4. Real-Time In-App Notifications
- **Firestore `onSnapshot` Listener**: Real-time notifications powered by the `notifications` collection (`userId`, `message`, `type`, `read`, `createdAt`).
- **Automated Triggers**:
  - Provider receives a new quote request.
  - Customer or provider is notified when a quote is accepted.
  - Booking participants are notified when booking statuses transition.
  - Admin overrides notify affected customer and provider.
- **Interactive Navbar Bell**: Displays unread badge counter, relative timestamps, type icons, mark-as-read, and mark-all-as-read actions via a responsive shadcn `Popover`.

### 5. Production Security Rules
- **Firestore Security Rules (`firestore.rules`)**:
  - Enforces profile ownership and prevents role self-escalation.
  - Only the job's customer can post or edit that job.
  - Only registered providers can quote on open jobs.
  - Only the job's customer can accept a quote.
  - Booking status transitions restricted to participants according to valid lifecycle steps.
  - Only admins can approve providers, delete users, or override booking status.
  - Reviews can only be created by the customer on their own completed booking, exactly once.
- **Storage Security Rules (`storage.rules`)**:
  - Strict size and MIME type validation for profile avatars (<5MB images), provider portfolios and licenses (<10MB images & PDFs), and job attachments (<10MB images).

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19, TypeScript |
| **Bundler & Tooling** | Vite 8, Oxlint |
| **Styling** | Tailwind CSS 3, Tailwind Animate |
| **UI Components** | Radix UI primitives, shadcn-inspired components, Lucide Icons |
| **Data Visualization** | Recharts |
| **Notifications & Toast** | Sonner |
| **Backend & Cloud Services** | Firebase (Auth, Cloud Firestore, Cloud Storage, Hosting) |

---

## 📁 Folder Structure

```
marketplace-for-local-services/
├── public/                 # Static assets and favicon
├── scripts/
│   └── seed.js             # Standalone Node ESM Firestore seeding script
├── src/
│   ├── assets/             # Images and design assets
│   ├── components/
│   │   ├── layout/         # MainLayout, DashboardLayout, AdminLayout, Navbar, Footer
│   │   ├── notifications/  # NotificationBell (Popover, unread badge, actions)
│   │   ├── shared/         # ErrorBoundary, EmptyState, PageHeader, ProtectedRoute, ReviewDialog
│   │   └── ui/             # Radix / shadcn UI primitives (Button, Card, Dialog, Popover, Table, etc.)
│   ├── context/
│   │   └── AuthContext.tsx # Firebase Auth state, roles (customer/provider/admin), login, registration
│   ├── firebase/
│   │   └── config.ts       # Firebase app initialization with environment fallbacks
│   ├── hooks/              # Custom hooks (useAuth, useToast)
│   ├── lib/                # Utility helpers (cn class merger)
│   ├── pages/
│   │   ├── Landing.tsx          # Marketing homepage with hero, categories, featured pros, testimonials
│   │   ├── BrowseProviders.tsx  # Searchable, filterable directory with sorting
│   │   ├── ProviderDetail.tsx   # Provider public portfolio, reviews, quote request dialog
│   │   ├── PostJob.tsx          # Customer multi-step job submission form
│   │   ├── Login.tsx            # Sign in page with demo quick-login credentials
│   │   ├── Register.tsx         # Customer & provider sign up
│   │   ├── customer/            # Customer dashboard, job detail, bookings list, profile
│   │   ├── provider/            # Provider hub, schedule, services, onboarding
│   │   └── admin/               # Admin overview, users, providers, jobs, settings
│   ├── services/
│   │   ├── adminService.ts      # Administrative stats, user moderation, platform settings
│   │   ├── jobService.ts        # Jobs, quotes subcollection, bookings lifecycle
│   │   ├── notificationService.ts # Real-time in-app notifications
│   │   ├── providerService.ts   # Provider queries, profile save, storage upload
│   │   ├── reviewService.ts     # Transactional reviews & rating calculations
│   │   └── seedService.ts       # In-app demo database seeder
│   ├── App.tsx             # Root router wrapped with ErrorBoundary & Toaster
│   └── main.tsx            # React application entry point
├── firebase.json           # Firebase Hosting, Firestore rules, and Storage config
├── firestore.rules         # Strict role-based Firestore security rules
├── storage.rules           # Cloud Storage upload security rules
└── package.json            # Scripts, dependencies, and metadata
```

---

## ⚡ Setup & Run Instructions

### Prerequisites
- **Node.js**: v18 or higher recommended
- **npm** or **pnpm**
- **Firebase CLI** (optional, for deployment): `npm install -g firebase-tools`

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd "marketplace for local services"
npm install
```

### 2. Environment Configuration
Create a `.env` file in the project root (or reference `.env.example`):
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```
*(Note: A pre-configured test project configuration is provided in `src/firebase/config.ts` for immediate development).*

### 3. Seed Sample Demo Data
Populate Firestore with 12+ verified providers across all categories, sample jobs, bookings, and customer reviews:
```bash
npm run seed
```
> **Tip**: You can also seed at any time from the UI by navigating to `/admin/settings` and clicking **"Seed Sample Demo Data"**.

### 4. Start Local Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 5. Build for Production
```bash
npm run build
```
Creates an optimized, tree-shaken production bundle in the `dist/` directory.

---

## 🚢 Firebase Hosting & Rules Deployment

To deploy your security rules and application to Firebase:

1. **Login to Firebase**:
   ```bash
   firebase login
   ```

2. **Deploy Security Rules**:
   ```bash
   firebase deploy --only firestore:rules,storage
   ```

3. **Deploy Web Application to Firebase Hosting**:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

4. **Deploy Everything**:
   ```bash
   firebase deploy
   ```

---

## 👥 Demo Roles & Testing Guide

For quick testing during demos:
- **Customer Role**: Register with any email (or use demo accounts created during seeding: `sarah.connor@example.com`, `michael.chang@example.com`).
- **Provider Role**: Register selecting the "Service Provider" role.
- **Admin Access**: Sign in with an admin email (e.g. `admin@homeserviceshub.com`, `admin@example.com`, or any email configured in `HARDCODED_ADMIN_EMAILS` in `AuthContext.tsx`).
