# 🛡️ NeuraSec — AI-Powered Cybersecurity Platform for Students

**NeuraSec** is a modern, student-focused cybersecurity platform built with AI, offering real-time phishing detection, URL scanning, file malware detection, and more. It integrates powerful analyzer tools to help users stay safe in a digital world.

---

## 🚀 Tech Stack

| Layer      | Tech Used                                         |
| ---------- | ------------------------------------------------- |
| Frontend   | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| UI Library | ShadCN UI, Aceternity UI                          |
| Auth       | Clerk Authentication                              |
| ORM & DB   | Prisma + PostgreSQL (via Supabase)                |
| Backend    | Python Flask API                                  |
| Hosting    | Vercel (Frontend), Render (Backend)               |

---

## 📂 Project Structure

The project has been restructured for better organization and maintainability:

- `src/` - Next.js frontend application
- `backend/` - Flask API backend
- `api_keys.json` - Central reference file for API keys (not used in runtime)
- `tests/` & `backend/tests/` - Test files organized in dedicated directories

For more details, see `project_structure.md`.

---

## 🚀 Getting Started

To start the application:

- **Windows**: Run `.\start.ps1` in PowerShell
- **Unix/Linux/macOS**: Run `./start.sh` in Terminal

These scripts will:

1. Check for and create the necessary .env files
2. Set up Python virtual environment for the backend
3. Install dependencies for both frontend and backend
4. Start both servers concurrently

---

## 🔑 Authentication

The project uses [Clerk.dev](https://clerk.dev) for secure login/signup. Authenticated users can:

- Access scan tools.
- View their history (`My Scans`).
- Get auto-generated reports (`Submitted Reports`).
- Edit profile and settings.

---

## 🧭 Navigation & Pages

> Pages below are **routed, protected by Clerk**, and each has real, usable content with visual UI via ShadCN + Aceternity UI components.

### 🖥️ `/dashboard` – Main Hub

- Project vision, features, architecture
- Stats (scans done, threats caught)
- Quick access buttons to all analyzers
- Tech stack section with tooltips/icons
- Animated hero section (Aceternity style)

---

### 🌐 `/url-analyzer`

- Enter a website URL
- Checks for malicious content using threat intel + AI
- Renders site preview (optional)
- Score + verdict (safe / risky / dangerous)

---

### 🧠 `/threat-analyzer`

- Paste any script/log/code snippet
- AI explains if it's malicious, suspicious, or benign
- Gives threat level, severity, and what it could do

---

## 🔌 API Integration

The application integrates with several external APIs:

- **VirusTotal API** - For URL and file scanning
- **AlienVault OTX** - For threat intelligence data
- **Google Gemini API** - For AI-powered analysis of threats

API keys are stored in environment variables, with templates provided in `.env.example` files.

---

## 🚀 Deployment

For deployment information, see:

- `DEPLOYMENT_CHECKLIST.md`: A comprehensive deployment checklist
- `AWS_DEPLOYMENT_GUIDE.md`: Guide for deploying on AWS

---

## 🛠️ Development Notes

- All API keys must be stored in environment variables, not hardcoded
- The `api_keys.json` file is provided for reference only and should never be committed to version control or used in production
- Tests are organized in dedicated directories for better maintainability

---

## 🎯 Project Scope & Vision

NeuraSec empowers college students and beginner hackers with automated AI-driven cybersecurity tools. It includes:

- ⚡ **Quick analyzers** to scan emails, URLs, and files.
- 🧠 **AI threat analyzer** to explain logs or code in simple terms.
- 📊 **Central dashboard** showing scan stats and platform insights.
- 🏆 **Leaderboards & rewards** to gamify cybersecurity learning.

---

### 📊 `/threat-intelligence`

- Shows logs of all submitted threats across the platform
- Filter by scan type, severity, or date
- Helps track threat trends

---

### 🏆 `/leaderboard`

- Lists top contributors by number of scans
- Ranks by points
- Real-time updates with user info from Clerk

---

### 🎁 `/rewards`

- Gamified page to see available rewards
- Earn points for every scan or report
- Progress bars, badges, claim buttons

---

## 👤 User Profile Menu

When users click their avatar (top-right), show dropdown with:

- `👤 My Profile` – Edit name, email, picture
- `📂 My Scans` – View personal scan history
- `📝 Submitted Reports` – AI-generated incident reports
- `⚙️ Settings` – Notification prefs, theme toggle, etc.

> Uses Clerk's `userButton` and `userProfile` components for auth integration.

// "sbp_615f273fb424b3e68b6b0e906ba241512a81f0fd"// "sbp_615f273fb424b3e68b6b0e906ba241512a81f0fd"// "sbp_615f273fb424b3e68b6b0e906ba241512a81f0fd"// "sbp_615f273fb424b3e68b6b0e906ba241512a81f0fd"// "sbp_615f273fb424b3e68b6b0e906ba241512a81f0fd"// "sbp_615f273fb424b3e68b6b0e906ba241512a81f0fd"// "sbp_615f273fb424b3e68b6b0e906ba241512a81f0fd"// "sbp_615f273fb424b3e68b6b0e906ba241512a81f0fd"

---

## 🧱 Prisma Models

```prisma
model User {
  id        String  @id @default(cuid())
  clerkId   String  @unique
  email     String  @unique
  scans     Scan[]
  reports   Report[]
  leaderboard LeaderboardEntry?
  createdAt DateTime @default(now())
}

model Scan {
  id        String   @id @default(cuid())
  userId    String
  type      String   // "email" | "url" | "file" | "custom"
  input     String
  result    String
  score     Float
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}

model Report {
  id        String   @id @default(cuid())
  userId    String
  details   String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}

model LeaderboardEntry {
  id        String   @id @default(cuid())
  userId    String   @unique
  points    Int
  user      User     @relation(fields: [userId], references: [id])
}

model Reward {
  id        String   @id @default(cuid())
  name      String
  description String
  points    Int
}


```
