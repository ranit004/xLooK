# XL👀k — URL Safety Checker

> Instantly check if any URL is safe before you click it.

**XL👀k** is a free, open-source URL safety analysis tool. Paste any link and get a real-time security report powered by VirusTotal, Google Safe Browsing, and AI analysis.

---

## ✨ Features

- 🛡️ **VirusTotal Scan** — checks against 90+ antivirus engines
- 🔍 **Google Safe Browsing** — detects phishing & malware in real time
- 🤖 **AI Analysis** — uses `openai/gpt-oss-120b` via Groq for contextual verdict
- 📜 **Scan History** — logged-in users get a full history of all their URL checks
- 🌙 **Dark / Light mode** — system-aware theme with smooth toggle and theme-aware logo
- 🔐 **Auth** — JWT-based signup/login with httpOnly cookies

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | PostgreSQL (Neon Cloud DB) via Prisma ORM |
| Auth | JWT + httpOnly cookies + bcrypt |
| AI | Groq API — `openai/gpt-oss-120b` |
| Animations | Framer Motion |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/{login,logout,me,signup}/  ← Auth endpoints
│   │   ├── check-url/                      ← URL scanning endpoint
│   │   ├── url-check-history/              ← Scan history endpoint
│   │   └── user/profile/                  ← User profile
│   ├── history/        ← Scan history page (auth-protected)
│   ├── login/
│   ├── signup/
│   └── page.tsx        ← Home (URL scanner)
├── components/
│   ├── auth/           ← Login/signup forms, user menu
│   ├── ui/             ← shadcn base components
│   └── *.tsx           ← Page sections (hero, features, faq, etc.)
├── contexts/
│   └── AuthContext.tsx ← Global auth state
└── lib/
    ├── analyzeUrlWithAI.ts  ← Groq AI integration
    ├── prisma.ts            ← DB client
    ├── jwt.ts               ← Token helpers
    └── auth-utils.ts        ← Request auth helpers
prisma/
└── schema.prisma       ← User + UrlCheckHistory models (PostgreSQL)
scripts/                ← Dev/test utility scripts
```

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/ranit004/xLooK.git
cd xLooK
npm install
```

### 2. Set Up Environment

Create a `.env` file in the project root. Use `.env.example` as a template:

```bash
cp .env.example .env
```

Fill in your values:

```env
# Database (PostgreSQL via Neon)
DATABASE_URL="postgresql://neondb_owner:...@ep-...neon.tech/neondb?sslmode=require"

# Auth
JWT_SECRET="your-strong-random-secret-min-64-chars"
JWT_EXPIRES_IN="7d"

# AI Analysis
GROQ_API_KEY="gsk_..."          # Get from console.groq.com

# Security APIs (optional but recommended)
VIRUSTOTAL_API_KEY="..."        # virustotal.com
GOOGLE_SAFE_BROWSING_API_KEY="..." # console.cloud.google.com
```

### 3. Set Up Database

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 API Keys

| Service | Where to get | Required? |
|---|---|---|
| Groq | [console.groq.com/keys](https://console.groq.com/keys) | Yes (AI analysis) |
| VirusTotal | [virustotal.com/gui/join-us](https://www.virustotal.com/gui/join-us) | Recommended |
| Google Safe Browsing | [Google Cloud Console](https://console.cloud.google.com/) | Recommended |

> **Free tiers are sufficient** for personal/dev use.

---

## 🔒 Security

- `.env` is gitignored — secrets never committed
- Passwords hashed with `bcrypt` (12 salt rounds)
- Auth tokens stored in `httpOnly` cookies (XSS-safe)
- JWT secret is a 128-char random hex string
- No secrets exposed via `NEXT_PUBLIC_` env vars
- All API keys only read via `process.env` server-side

---

## 📜 License

MIT — free to use, modify, and distribute.

---

Built by [@Ranit_bro](https://x.com/Ranit_bro)
