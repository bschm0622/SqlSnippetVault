# Phase 2 PRD — GitHub Login via Supabase

## Goal
Implement GitHub login using Supabase Auth. This will provide secure user authentication and establish the foundation for tying paid features (like GitHub sync) to a user account.

---

## Tech Stack
- **Auth**: Supabase Auth with GitHub Provider
- **Client Storage**: Supabase client session
---

## Functional Requirements

### 1. GitHub Login Integration
- [x] Set up Supabase project (if not already)
- [x] Enable GitHub as an Auth provider in Supabase
- [x] Configure Supabase with GitHub OAuth keys
- [x] Display a **"Log in with GitHub"** button if the user is not logged in
- [x] Store session securely on the client (no token in localStorage if avoidable)
- [x] Persist session across reloads

### 2. Post-Login UI Changes
- [x] Display basic user info after login:
  - GitHub username or email
  - Small avatar (optional)
- [x] Add a **"Log out"** button
- [x] Store logged-in user in a reactive state (Alpine or Astro store)

---

## Non-Functional Requirements
- [x] Session should auto-refresh via Supabase's built-in mechanisms
- [x] Auth state should persist across page reloads
- [x] Fallback UI: Show a generic welcome message and login prompt if not logged in

---

## Supabase Configuration
- GitHub OAuth Provider Enabled
- Redirect URL: `http://localhost:4321` (for local dev, update in production)
- Scopes: **default only** (no Gist scope needed yet)

---

## Notes
- This phase does not yet gate any features or require payment.
- This phase does not need backend functions or sync logic yet.
- Ensure login experience is smooth — no full-page redirects, ideally just a popup or redirect flow.

---

## Future Phases (not included here)
- Store `is_paid` flag in Supabase for paid users
- Use Supabase Edge Functions to manage GitHub tokens and sync

