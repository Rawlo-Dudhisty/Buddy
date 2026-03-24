# StudyAI — Full-Stack EdTech App

AI-powered study platform built with **Next.js 15**, **Prisma**, **PostgreSQL**, **NextAuth v5**, and **Anthropic Claude**. Deploy to Vercel in minutes.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🤖 **AI Tutor** | Real Claude AI chat with full conversation history per user |
| 🃏 **Flashcards** | SM-2 spaced repetition algorithm, browse & study modes |
| 📅 **Schedule** | Add/manage study sessions with timeline view |
| 📊 **Subjects** | Per-subject progress tracking |
| 🔐 **Auth** | NextAuth v5 credentials login + registration |
| 🏆 **Gamification** | XP, levels, streak tracking |
| 🗄️ **Database** | Full Prisma ORM with PostgreSQL (Neon recommended) |

---

## 🚀 Deploy to Vercel (Step-by-Step)

### Step 1 — Create a Neon Database (free)

1. Go to [neon.tech](https://neon.tech) → Create account → New Project → Name it `studyai`
2. On the project page click **Connection Details**
3. Copy the **Connection string** — you need TWO versions:
   - **Pooled** (for `DATABASE_URL`): contains `?pgbouncer=true`
   - **Direct** (for `DIRECT_URL`): no pgbouncer param

### Step 2 — Get an Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. API Keys → Create Key → copy it

### Step 3 — Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
gh repo create studyai --public --push
# or: git remote add origin https://github.com/YOUR_USER/studyai.git && git push -u origin main
```

### Step 4 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import your GitHub repo
2. Add these **Environment Variables** in Vercel dashboard:

```
DATABASE_URL        = postgresql://USER:PASS@HOST/studyai?sslmode=require&pgbouncer=true
DIRECT_URL          = postgresql://USER:PASS@HOST/studyai?sslmode=require
AUTH_SECRET         = <run: openssl rand -base64 32>
NEXTAUTH_URL        = https://your-app.vercel.app
ANTHROPIC_API_KEY   = sk-ant-...
```

3. Click **Deploy**

### Step 5 — Run DB Migrations

After first deploy, in your local terminal:

```bash
npm install
npx prisma db push        # push schema to Neon
npm run db:seed           # optional: seed demo data
```

Or add a Vercel build command override:
```
prisma db push && prisma generate && next build
```

---

## 🛠️ Local Development

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Fill in your DATABASE_URL, DIRECT_URL, AUTH_SECRET, ANTHROPIC_API_KEY

# 3. Push DB schema
npx prisma db push

# 4. Seed demo data (optional)
npm run db:seed
# Demo login: demo@studyai.app / demo1234

# 5. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
studyai/
├── prisma/
│   ├── schema.prisma          # Database models
│   └── seed.ts                # Demo seed data
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # NextAuth + register
│   │   │   ├── chat/          # AI chat (Claude)
│   │   │   ├── flashcards/    # CRUD + SM-2 review
│   │   │   ├── sessions/      # Study session tracking
│   │   │   ├── schedule/      # Schedule CRUD
│   │   │   ├── subjects/      # Subject progress
│   │   │   └── stats/         # Dashboard stats
│   │   ├── dashboard/         # Protected pages
│   │   │   ├── chat/
│   │   │   ├── flashcards/
│   │   │   ├── schedule/
│   │   │   └── subjects/
│   │   ├── login/
│   │   ├── register/
│   │   └── globals.css
│   ├── components/
│   │   ├── DashboardClient.tsx
│   │   ├── ChatPageClient.tsx
│   │   ├── FlashcardsClient.tsx
│   │   ├── ScheduleClient.tsx
│   │   ├── Sidebar.tsx
│   │   └── Topbar.tsx
│   └── lib/
│       ├── auth.ts            # NextAuth config
│       ├── prisma.ts          # Prisma singleton
│       └── srs.ts             # SM-2 algorithm
└── package.json
```

---

## 🗄️ Database Models

| Model | Purpose |
|---|---|
| `User` | Auth + XP/streak/level |
| `Account` / `Session` | NextAuth OAuth adapters |
| `Flashcard` | Cards with SM-2 fields (interval, easeFactor, nextReview) |
| `StudySession` | Tracked study sessions with XP |
| `ChatMessage` | Persistent AI chat history per user |
| `SubjectProgress` | Per-subject progress % |
| `ScheduleItem` | Daily schedule items |

---

## 🔑 API Routes

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create account |
| POST | `/api/auth/signin` | Public | NextAuth signin |
| GET | `/api/stats` | ✅ | Dashboard stats |
| GET/POST | `/api/flashcards` | ✅ | List/create cards |
| POST | `/api/flashcards/[id]/review` | ✅ | SM-2 review |
| GET/POST | `/api/chat` | ✅ | AI chat (Claude) |
| GET/POST | `/api/sessions` | ✅ | Study sessions |
| GET/POST/PATCH | `/api/schedule` | ✅ | Schedule items |
| GET | `/api/subjects` | ✅ | Subject progress |

---

## ⚙️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL via Neon (serverless)
- **ORM**: Prisma 5
- **Auth**: NextAuth v5 (JWT strategy)
- **AI**: Anthropic Claude (claude-sonnet-4)
- **Styling**: CSS-in-JS (inline styles, CSS variables)
- **Deployment**: Vercel

---

## 🎓 Demo Account

After seeding: `demo@studyai.app` / `demo1234`
