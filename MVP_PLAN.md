# MVP Build Plan — Freelancer Finance SaaS

Solo-builder pace assumed. Each phase should be independently shippable/demoable. Don't start a phase until the previous one works end-to-end.

---

## Phase 0 — Foundation (no user-facing features)
- Repo scaffold: Next.js App Router + TS + Tailwind + shadcn init
- `lib/db.ts` cached Mongo connection
- Auth.js setup: email/password or magic link to start (skip OAuth providers for v1)
- Base layout: sidebar nav, top bar, empty dashboard shell
- `User` model + protected route middleware

**Done when:** you can sign up, log in, log out, and hit a protected `/dashboard` route.

---

## Phase 1 — Clients & Projects (Completed)
- `Client` model (name, email, company, notes) — CRUD via Server Actions
- `Project` model (linked to client, name, status: active/archived, rate type: hourly/fixed)
- List + detail pages, create/edit forms (RHF + Zod)
- Soft delete for both

**Done when:** you can add a client, attach 1+ projects to them, edit/archive.

---

## Phase 2 — Income & Expenses (Completed)
- `Income` model: amount, date, client/project link (optional), source, notes
- `Expense` model: amount, date, category (enum: software, travel, equipment, marketing, other), project link (optional), receipt file (Cloudinary upload), notes
- Quick-add forms for both (this is the daily-use feature — keep it fast, minimal fields required)
- List views with filter by date range, client, category
- Dashboard: this-month income, this-month expenses, net, simple Recharts bar/line for last 6 months

**Done when:** you use this yourself for a week to log real income/expenses without friction.

---

## Phase 3 — Invoices (Completed)
- `Invoice` model: client, project, line items (description, qty, rate), status (draft/sent/paid/overdue), due date, invoice number (auto-increment per user)
- Invoice builder UI (client component, Zustand for draft state)
- PDF generation/export (pick one library, don't over-engineer — react-pdf or a simple HTML-to-PDF route)
- Mark-as-paid action that optionally creates a linked `Income` record
- Simple "send" flow: generate a shareable/public read-only link OR email via a basic transactional email provider (decide before building — don't build both)

**Done when:** you can create a real invoice, export it as a PDF, and mark it paid.

---

## Phase 4 — AI-Assisted Bookkeeping (Completed)
- Expense categorization suggestion: on expense create, call OpenAI with description → suggested category (user can override)
- Invoice line-item description helper: rough notes in → polished line-item description out
- No agents, no OCR, no RAG — just two narrow, single-purpose API calls

**Done when:** both features work and degrade gracefully if the OpenAI call fails (never block form submission on AI).

---

## Phase 5 — Polish & Launch Readiness (Completed)
- Empty states for every list view
- Loading/skeleton states for dashboard and lists
- Error boundaries on key routes
- Basic onboarding (first-login checklist: add a client, log an expense, send an invoice)
- Settings page: profile, currency display (single currency for v1, just configurable label), logout/delete account

**Done when:** a stranger could sign up and use it without you explaining anything.

---

## Explicitly Deferred (v2+, do not build into v1)
- Reports/exports beyond the dashboard charts (P&L, tax summaries)
- Receipt OCR
- Recurring invoices / subscriptions
- Multi-currency
- Team accounts / roles
- Bank sync

---

## Working Agreement with the Agent
- Reference the **current phase** explicitly when assigning tasks (e.g. "Phase 2, expense quick-add form").
- If a task description implies something from a later phase or the deferred list, the agent should flag it rather than silently building it.
- Each phase ends with a manual smoke test before moving on — don't let phases overlap into half-finished states.