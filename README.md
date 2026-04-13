# Fulbari Restora — Inventory & POS System

A Next.js-based inventory and point-of-sale system for Fulbari Restora, supporting multiple outlets (Restaurant, Cafe, Chai Joint).

---

## Environments

| Environment | Repo | Vercel URL | Database |
|---|---|---|---|
| **Production** | `Fulbari_restora_Inventory` | `fulbari-restora-inventory.vercel.app` | Supabase (Production) |
| **QA / Staging** | `Fulbari_restora_inventory_QA` | *(your QA vercel URL)* | Supabase (QA — isolated) |

> ⚠️ **Production and QA databases are completely separate.** Changes in QA never affect live production data.

---

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Copy the template to set up your local or QA environment:

```bash
cp .env.qa.example .env.qa
```

Then fill in the actual Supabase QA credentials from the [Supabase Dashboard](https://app.supabase.com).

### Required Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase Transaction mode URL (port 6543) |
| `DIRECT_URL` | Supabase Session mode URL (port 5432) |
| `NEXTAUTH_SECRET` | Random secret string for session signing |
| `NEXTAUTH_URL` | Full URL of the deployment (e.g. `https://xyz.vercel.app`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |

---

## Setting Up the QA Environment

### 1. Create a new Supabase project
- Go to [app.supabase.com](https://app.supabase.com) → **New Project**
- Name: `fulbari-restora-qa`
- Region: `ap-northeast-1`
- After creation, get your connection strings from **Settings → Database**

### 2. Add env vars to Vercel QA project
In your QA Vercel project → **Settings → Environment Variables**, add all 7 variables with your QA Supabase credentials.

### 3. Initialize the QA database
After the first QA deploy, run migrations and seed users:

```bash
# Option A: via Vercel CLI (with QA env vars)
vercel env pull .env.qa --environment=production
DATABASE_URL="<qa-db-url>" npx prisma migrate deploy

# Option B: via the seed API endpoint
curl https://<YOUR-QA-VERCEL-URL>.vercel.app/api/seed
```

---

## Database & ORM

- **ORM**: Prisma v5
- **Database**: PostgreSQL via Supabase
- **Schema**: `prisma/schema.prisma`

To apply schema changes locally:
```bash
npx prisma migrate dev
```

To apply to QA/Production:
```bash
npx prisma migrate deploy
```

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL) + Prisma ORM
- **Auth**: NextAuth.js (PIN-based login)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
