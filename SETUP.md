# LeaveTracker — Setup Guide

## Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project

---

## 1. Supabase Setup

### Create Tables
1. Go to your Supabase project → **SQL Editor**
2. Paste the contents of `supabase-schema.sql` (in the project root)
3. Click **Run**

This creates three tables (`profiles`, `leave_allocations`, `leaves`) with Row-Level Security and auto-setup triggers. It will **not** affect existing tables.

### Get Credentials
1. Go to **Settings → API**
2. Copy the **Project URL** and **anon public** key

---

## 2. Configure Environment

```bash
# Copy the example env file
cp .env.example .env
```

Edit `.env` and fill in your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 3. Install & Run

```bash
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 4. Create Users

1. Go to `/signup` and create a regular user account
2. If email confirmation is enabled in Supabase, confirm via the email link
3. Login at `/login`

### Make an Admin
After signing up the admin account, run this in Supabase SQL Editor:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-admin@example.com';
```

Admins see an extra **Admin Panel** nav item with access to all users' stats and password reset.

---

## Project Structure

```
src/
├── components/
│   ├── AdminRoute.jsx       # Admin-only route guard
│   ├── Layout.jsx           # Sidebar + main layout
│   ├── LeaveForm.jsx        # Add/edit leave modal
│   └── ProtectedRoute.jsx   # Auth route guard
├── context/
│   └── AuthContext.jsx       # Auth state + Supabase auth
├── hooks/
│   ├── useAdmin.js           # Admin data fetching
│   ├── useAllocations.js     # Leave quota CRUD
│   └── useLeaves.js          # Leave entry CRUD
├── lib/
│   ├── constants.js          # Leave types, colors
│   └── supabaseClient.js     # Supabase init
├── pages/
│   ├── admin/
│   │   └── AdminDashboard.jsx
│   ├── Allocations.jsx
│   ├── CalendarView.jsx
│   ├── Dashboard.jsx
│   ├── LeaveList.jsx
│   ├── Login.jsx
│   └── Signup.jsx
├── App.jsx
├── index.css
└── main.jsx
```
