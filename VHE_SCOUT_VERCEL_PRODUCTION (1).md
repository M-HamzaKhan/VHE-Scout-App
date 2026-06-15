# VHE Scout App — Vercel Production Deployment Guide
> Stack: Next.js 16.2.9 · @supabase/ssr · TypeScript · Tailwind CSS
> Supabase Project: qahnrwpdnynicbzcisgy (us-east-1)
> GitHub: https://github.com/M-HamzaKhan/Scout-App
> Last updated: June 2026

---

## HOW TO USE THIS FILE
Read this completely before every deployment.
Every [ ] item must be verified or resolved before going live.
Do not skip any section.

---

## SECTION 1 — PRE-DEPLOYMENT CHECKS

Run these locally before pushing to GitHub:

```bash
cd "C:\Users\PMLS\Desktop\scout app\vhe-scout"

# Check 1 — TypeScript errors (must be zero)
npx tsc --noEmit

# Check 2 — Production build (must pass)
npm run build

# Check 3 — No credentials committed
git status
git ls-files .env.local
```

Checklist:
- [ ] `npx tsc --noEmit` — zero output (zero errors)
- [ ] `npm run build` — completes with "Compiled successfully"
- [ ] `git ls-files .env.local` — returns nothing (not tracked)
- [ ] `.env.local` not in `git status` output

---

## SECTION 2 — ENVIRONMENT VARIABLES

### 2.1 Local .env.local (never commit this)

```env
NEXT_PUBLIC_SUPABASE_URL=https://qahnrwpdnynicbzcisgy.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaG5yd3BkbnluaWNiemNpc2d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMDk2MTUsImV4cCI6MjA5NjY4NTYxNX0.CtiXEFM5s14kHwczW29a6YPc_DPYytRj_BpdghciYwY
```

### 2.2 Vercel Dashboard Environment Variables

Go to: vercel.com → vhe-scout project → Settings → Environment Variables

Add BOTH for ALL environments (Production + Preview + Development):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://qahnrwpdnynicbzcisgy.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | (the key from .env.local above) |

CRITICAL NOTES:
- Variable name is `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` NOT `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Both variables are used in: client.ts, server.ts, proxy.ts, lib/utils.ts
- After adding variables → redeploy for them to take effect

Checklist:
- [ ] Both variables added in Vercel dashboard
- [ ] Set for Production + Preview + Development
- [ ] Variable names match exactly (PUBLISHABLE_KEY not ANON_KEY)
- [ ] No hardcoded Supabase URLs in any component files

---

## SECTION 3 — SUPABASE CONFIGURATION

### 3.1 Auth Settings

Go to: supabase.com/dashboard/project/qahnrwpdnynicbzcisgy/auth/providers

Email provider settings:
- [ ] Email provider enabled
- [ ] "Confirm email" toggle ON (confirmation emails work via Gmail SMTP)
- [ ] Gmail SMTP configured (tbumer38@gmail.com, port 587)

### 3.2 Auth URL Configuration

Go to: supabase.com/dashboard/project/qahnrwpdnynicbzcisgy/auth/url-configuration

- [ ] Site URL set to production Vercel URL (e.g. https://vhe-scout.vercel.app)
- [ ] Redirect URLs includes:
  - `https://vhe-scout.vercel.app/**`
  - `http://localhost:3000/**` (keep for local dev)

IMPORTANT: After getting Vercel URL, update Site URL in Supabase.
Password reset emails use Site URL to build the reset link.

### 3.3 Email Templates

Go to: supabase.com/dashboard/project/qahnrwpdnynicbzcisgy/auth/templates

Reset Password template must use token_hash (not ConfirmationURL):
```html
<h2>Reset your password</h2>
<p>Follow the link below to reset your password.</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/auth/update-password">Reset password</a></p>
```

- [ ] Reset Password template uses TokenHash not ConfirmationURL
- [ ] Site URL in template matches production URL

### 3.4 RLS Policies

All required policies already applied. Verify they exist:

```sql
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('tasks', 'scouts', 'leads', 'task_types', 'documents')
ORDER BY tablename, policyname;
```

- [ ] scouts_read_own_profile — SELECT on scouts
- [ ] scouts_read_own_tasks — SELECT on tasks  
- [ ] scouts_update_own_tasks — UPDATE on tasks
- [ ] anyone_read_task_types — SELECT on task_types
- [ ] scouts_read_task_leads — SELECT on leads
- [ ] scouts_insert_documents — INSERT on documents
- [ ] scouts_read_own_documents — SELECT on documents

### 3.5 Storage

Bucket: Task-Photos
- [ ] Bucket exists in Supabase Storage
- [ ] Bucket is set to PUBLIC (required for photo URLs to work)
- [ ] Storage policies exist for authenticated users

---

## SECTION 4 — CODE ARCHITECTURE

### 4.1 Proxy (proxy.ts at root)

```typescript
// proxy.ts — Next.js 16 Fluid compute proxy
import { updateSession } from "@/lib/supabase/proxy";
import { type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/tasks/:path*',
    '/pay/:path*',
    '/history/:path*',
    '/submit/:path*',
  ],
};
```

Protected routes: /tasks, /pay, /history, /submit
Public routes (no auth required): /, /auth/*, static files

### 4.2 Supabase Client Split

| File | Use in | Auth method |
|------|--------|-------------|
| `lib/supabase/client.ts` | Client Components ("use client") | createBrowserClient |
| `lib/supabase/server.ts` | Server Components, Route Handlers | createServerClient + cookies() |
| `lib/supabase/proxy.ts` | proxy.ts only | createServerClient + getClaims() |

NEVER mix these. Never use server.ts in a Client Component.

### 4.3 Auth Flow

```
Sign up → email confirmation → /auth/confirm?token_hash=&type=signup
Login → email + password → /protected → redirect to /tasks
Forgot password → reset email → /auth/confirm?token_hash=&type=recovery → /auth/update-password
```

### 4.4 Route Structure

```
/ → redirects to /auth/login
/auth/login → LoginForm (email + password)
/auth/sign-up → SignUpForm
/auth/sign-up-success → confirmation screen
/auth/forgot-password → ForgotPasswordForm
/auth/update-password → UpdatePasswordForm
/auth/confirm → Route Handler (verifyOtp for email links)
/auth/error → error display
/tasks → My Tasks (protected, Server Component)
/tasks/[id] → Task Detail (protected, Server Component)
/tasks/[id]/submit → Submit Report (protected, Client Component)
/pay → My Pay (protected, Server Component)
/history → Task History (protected, Server Component)
/protected → redirects to /tasks
```

---

## SECTION 5 — VERCEL PROJECT SETUP

### 5.1 First Time Deploy

```bash
cd "C:\Users\PMLS\Desktop\scout app\vhe-scout"
npx vercel
```

Settings during setup:
- Link to existing project? No (create new)
- Project name: vhe-scout
- Framework: Next.js (auto-detected)
- Build Command: npm run build (default)
- Output Directory: .next (default)
- Node.js Version: 20.x

### 5.2 GitHub Integration

- [ ] GitHub repo connected: https://github.com/M-HamzaKhan/Scout-App
- [ ] Production branch: main
- [ ] Every push to main → automatic production deploy
- [ ] Every PR → Preview deployment

### 5.3 Vercel Build Settings

Go to: Vercel Dashboard → vhe-scout → Settings → General

- [ ] Framework Preset: Next.js
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `.next`
- [ ] Install Command: `npm install`
- [ ] Node.js Version: 20.x

---

## SECTION 6 — GIT PUSH TO GITHUB

```bash
cd "C:\Users\PMLS\Desktop\scout app\vhe-scout"

# Stage all changes
git add .

# Verify .env.local is NOT staged
git status

# Commit
git commit -m "VHE Scout App — production ready"

# Set branch to main
git branch -M main

# Connect to GitHub
git remote remove origin
git remote add origin https://github.com/M-HamzaKhan/Scout-App.git

# Push
git push -u origin main --force
```

Checklist:
- [ ] `.env.local` does NOT appear in `git status` staged files
- [ ] All new files staged: app/tasks/, app/pay/, app/history/, components/
- [ ] Commit message is clear
- [ ] Push successful

---

## SECTION 7 — SECURITY CHECKS

```bash
# Check for hardcoded Supabase keys
grep -r "eyJ" app/ --include="*.ts" --include="*.tsx"
grep -r "supabase.co" app/ --include="*.ts" --include="*.tsx"

# Check for console.log
grep -r "console.log" app/ --include="*.ts" --include="*.tsx"
```

- [ ] No hardcoded Supabase keys in any component
- [ ] No `console.log` in production code
- [ ] All external links use `rel="noopener noreferrer"`
- [ ] Photo uploads validated (image type, max 5MB) before upload
- [ ] No service role key anywhere in this project

---

## SECTION 8 — POST-DEPLOYMENT TESTING

After Vercel deploy completes test these flows:

**Auth:**
- [ ] Sign up with new email → confirmation email arrives → click link → confirmed
- [ ] Sign in → redirects to /tasks
- [ ] Forgot password → reset email arrives → click link → update password works
- [ ] Refresh page while logged in → stays logged in (session persists)

**Tasks:**
- [ ] Tasks load from Supabase
- [ ] Rush badge shows on rush tasks
- [ ] Tap task → task detail loads
- [ ] Accept task → status updates
- [ ] Decline task → status updates

**Submit Report:**
- [ ] Photo picker opens
- [ ] Photos upload to Supabase Storage
- [ ] Submit → task marked Completed

**Pay:**
- [ ] Earnings load correctly
- [ ] Tier progress shows
- [ ] Sprint bonuses show

**Mobile:**
- [ ] Works on iPhone Safari
- [ ] Works on Android Chrome
- [ ] No horizontal scroll
- [ ] Text readable without zooming

---

## SECTION 9 — AFTER DEPLOYMENT

### Update Supabase Site URL

Once you have the Vercel URL (e.g. https://vhe-scout.vercel.app):

1. Go to: supabase.com/dashboard/project/qahnrwpdnynicbzcisgy/auth/url-configuration
2. Set Site URL to: `https://vhe-scout.vercel.app`
3. Add to Redirect URLs: `https://vhe-scout.vercel.app/**`
4. Save

Then test password reset on production — this is the most common post-deploy failure.

### Known Production Notes

1. **Gmail SMTP rate limit** — Supabase free tier + Gmail SMTP has rate limits.
   For high-volume signups consider upgrading to Resend or SendGrid.

2. **Scout approval required** — New scouts who sign up cannot receive tasks
   until Ops Manager approves them in the desktop app Scouts tab.

3. **Photo storage** — Task-Photos bucket is public. URLs are permanent.
   Deleting via desktop app Storage tab removes from both bucket and database.

4. **Task assignment** — Scouts only see tasks assigned to them by Ops Manager
   via the desktop app Tasks tab.

---

## QUICK REFERENCE

| Item | Value |
|------|-------|
| Supabase Project | qahnrwpdnynicbzcisgy |
| Supabase Dashboard | supabase.com/dashboard/project/qahnrwpdnynicbzcisgy |
| Auth Settings | /auth/providers |
| URL Config | /auth/url-configuration |
| Email Templates | /auth/templates |
| SQL Editor | /sql/new |
| Storage | /storage |
| GitHub Repo | github.com/M-HamzaKhan/Scout-App |

## VHE Brand Colors

```
navy:          #0F1E3C
vhe-blue:      #2E5FA3  
bg:            #f0f4fb
border:        #e2e8f5
text-muted:    #64748b
green:         #16a34a
red:           #DC2626
```

---
*Read this file completely before every production deployment.*
