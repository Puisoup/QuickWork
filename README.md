# QuickWork PoC

QuickWork is a platform connecting users (Customers) with companies for home improvement jobs, vetted by Experts.

## Features

*   **Role-Based Access**:
    *   **Customer**: Create requests, view offers, chat with experts/companies, rate completed work.
    *   **Expert**: Review customer requests, chat to clarify details, create "Frameworks" (Gutachten) with budget/timeline estimates.
    *   **Company**: Browse verified requests, place bids/offers, manage active jobs, schedule execution dates.
    *   **Admin**: User management.
*   **Workflow**:
    1.  Customer creates a Request.
    2.  Expert reviews, chats, and creates a Framework.
    3.  Companies place Offers (Bids) based on the Framework.
    4.  Customer accepts an Offer.
    5.  Company executes work; Customer rates the service.
*   **Chat System**: Integrated two-way chat for Customer-Expert and Customer-Company.
*   **File Uploads**: Attachments support for Offers and Frameworks.
*   **Settings**: Logged-in users can adjust appearance (light/dark/system), notification preferences, and other options from the dashboard.
*   **Profiles**: Kunden, Unternehmen und Experten bearbeiten unter `/dashboard/profile` (zusätzliche Felder je Rolle). Öffentliche Ansicht: `/profile/[userId]` — bei **Unternehmen** inkl. **Bewertungen** (Feedback aus abgeschlossenen Aufträgen). **Profilbild** optional; ohne Bild **Initialen-Avatar**. Zugriff im Dashboard über **Avatar oben rechts** (Menü: Profil, Einstellungen, öffentliches Profil, Abmelden).

## Tech Stack

*   **Framework**: Next.js 16 (App Router)
*   **Database**: PostgreSQL on [Supabase](https://supabase.com) (via Prisma ORM)
*   **Optional**: `@supabase/supabase-js` + `@supabase/ssr` for Supabase client helpers and session middleware
*   **Styling**: Tailwind CSS
*   **Language**: TypeScript

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy the example file and fill in your values (never commit real secrets):

```bash
cp .env.example .env
# Windows (PowerShell): Copy-Item .env.example .env
```

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Prisma → Supabase Postgres. From Supabase **Project Settings → Connect → URI** (use `?sslmode=require` at the end). |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (optional if you only use Prisma). Put in `.env.local` or `.env`. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Supabase anon/publishable key for the browser client (optional for Prisma-only usage). |

See `.env.example` for placeholders.

### 3. Database schema & demo users

```bash
npx prisma db push
npm run seed
```

`seed` creates demo accounts (password `password` for all):

* `customer@example.com`
* `expert@example.com`
* `company@example.com`
* `admin@quickwork.com`

Skip `seed` if you prefer registering users via the UI.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Note:** If your Supabase project is **paused**, resume it in the Supabase dashboard first, or database requests will fail.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js in development |
| `npm run build` / `npm start` | Production build / run |
| `npm run seed` | Seed demo users (`prisma/seed.ts`) |

## Security Note

This is a Proof of Concept (PoC). Authentication uses simple cookies and plain password checks in places—**not** production-grade. Do not expose real user data without hardening (e.g. password hashing, proper auth).

## License

Private / Educational Purpose.
