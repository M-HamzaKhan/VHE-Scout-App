# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Development server (localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint
npm run lint
```

No test suite is configured.

## Environment Setup

Copy `.env.example` to `.env.local` and fill in Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
```

Both values come from the Supabase dashboard under project Settings > API. The app degrades gracefully when these are missing — `hasEnvVars` in `lib/utils.ts` gates real content vs. onboarding instructions.

## Architecture

### Supabase Client Split

There are three distinct Supabase clients — using the wrong one in the wrong context will break session handling:

| File | Use in |
|---|---|
| `lib/supabase/client.ts` | Client Components (`"use client"`) |
| `lib/supabase/server.ts` | Server Components, Route Handlers, Server Actions |
| `lib/supabase/proxy.ts` | `proxy.ts` edge proxy only |

**Never create a Supabase client in a module-level global** — always instantiate within the function body. This is required for Next.js Fluid compute correctness (stale closures across requests).

### Session Management via Edge Proxy

`proxy.ts` at the project root is a Next.js **Fluid compute proxy** (not a traditional `middleware.ts`). It exports a named `proxy` function with a `matcher` config and calls `updateSession()` from `lib/supabase/proxy.ts` on every request.

`updateSession` does two things:
1. Refreshes the Supabase session cookie on each request (critical — omitting `getClaims()` here will cause random logouts)
2. Redirects unauthenticated users to `/auth/login` for any path that isn't `/`, `/login/*`, or `/auth/*`

**Do not add code between `createServerClient` and `supabase.auth.getClaims()` inside `updateSession`** — this is documented in the source and causes hard-to-debug session issues.

### Auth Flow

- **Login / Sign-up**: Client Components in `components/` call `lib/supabase/client.ts` directly and navigate with `useRouter` after success.
- **Email verification**: `app/auth/confirm/route.ts` — a Route Handler that receives `token_hash` + `type` from the email link and calls `supabase.auth.verifyOtp()`.
- **Password reset**: `ForgotPasswordForm` sends a reset email; the link redirects to `/auth/update-password` where `UpdatePasswordForm` calls `supabase.auth.updateUser({ password })`.
- **Auth state in Server Components**: Use `supabase.auth.getClaims()` (reads JWT locally, no network call) instead of `getUser()` (makes a network round-trip to Supabase).

### Route Structure

- `/` — public landing page with setup tutorial when env vars are missing
- `/auth/*` — login, sign-up, forgot-password, update-password, confirm, error
- `/protected/*` — authenticated section; has its own layout (`app/protected/layout.tsx`) that renders the same nav/footer shell as the root

### UI Layer

shadcn/ui is configured in `components.json` with:
- Style: `new-york`
- Base color: `neutral`
- CSS variables for theming (defined in `app/globals.css`, extended in `tailwind.config.ts`)
- Icon library: `lucide-react`
- Path alias `@/*` maps to the project root

Add new shadcn/ui components with: `npx shadcn@latest add <component>`

Dark mode is handled by `next-themes` (`ThemeProvider` wraps the app in `app/layout.tsx`) with `attribute="class"`.

The `cn()` utility in `lib/utils.ts` combines `clsx` + `tailwind-merge` — use it for all conditional className construction.
