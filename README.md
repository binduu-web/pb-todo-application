# Taskflow — React & Supabase TODO List Application

A modern, responsive TODO List dashboard built with React, TypeScript, Tailwind CSS, and Supabase for real-time PostgreSQL CRUD persistence.

## Features
- **Full Supabase CRUD**: Create, read, update, toggle completion, and delete tasks directly in PostgreSQL via `@supabase/supabase-js`.
- **Search & Filtering**: Instant search by task title, filter by status (`All`, `Pending`, `Completed`), and filter by priority (`High`, `Medium`, `Low`).
- **Live Summary Counts**: Displays Total, Pending, and Completed task counts with tabular numerals.
- **Responsive Dashboard**: Adaptive sidebar + top header layout across desktop, tablet, and mobile viewports.
- **Accessible Controls**: Keyboard-friendly dialogs, confirmation prompt before permanent deletion, loading skeletons, and toast notifications.

---

## 1. Connect to Your Supabase Project

1. Sign in to [Supabase](https://supabase.com) and create a new project (or open an existing one).
2. Open **SQL Editor** in the Supabase sidebar, click **New query**, paste the contents of `supabase/schema.sql`, and click **Run**.
   - This creates the `public.tasks` table, adds helpful indexes, enables Row Level Security (RLS), and creates the `SELECT`, `INSERT`, `UPDATE`, and `DELETE` policies.
3. Go to **Project Settings → API** and copy:
   - **Project URL** (e.g. `https://xyzcompany.supabase.co`)
   - **anon / public key** (publishable key — **never** use your `service_role` key in frontend code)

---

## 2. Configure Environment Variables

Create a `.env` file in the project root by copying `.env.example`:

```bash
cp .env.example .env
```

Fill in your Supabase credentials:

```env
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-publishable-key"
```

---

## 3. Run Locally

```bash
# Install dependencies
npm install

# Start the development server on http://localhost:3000
npm run dev
```

To build for production:

```bash
npm run build
```
