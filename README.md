# HabitBank

Vite + React + Tailwind app, converted from the original single-file HTML prototype. Backend is Supabase (Auth + Postgres).

## Supabase setup (one-time)

1. Create a project at https://supabase.com/dashboard.
2. Project Settings -> API -> copy the "Project URL" and the "anon public" key into `.env.local`:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=xxxx
   ```
3. SQL Editor -> New query -> paste the contents of `supabase/schema.sql` -> Run.
4. That's it — email/password auth, habits, checkins and balances are now backed by Postgres with row-level security.

Google sign-in button is wired to `supabase.auth.signInWithOAuth`; it will error until you enable the Google provider under Authentication -> Providers in the Supabase dashboard (optional).

## Run

```bash
npm install
npm run dev
```

Opens at http://localhost:5173

## Build

```bash
npm run build
npm run preview
```
