# Full-Featured E-Commerce Storefront
## Production-Grade Implementation Guide

**Stack:** Next.js 15 (App Router) + TypeScript · Node.js + Express.js + TypeScript · MongoDB + Mongoose · NextAuth.js (Auth.js) / Clerk

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Full-Stack Monorepo Structure](#3-full-stack-monorepo-structure)
4. [Weekly Development Roadmap (12 Weeks)](#4-weekly-development-roadmap)
5. [Next.js Concepts Deep Dive](#5-nextjs-concepts-deep-dive)
6. [Backend (Express.js) Concepts Deep Dive](#6-backend-expressjs-concepts-deep-dive)
7. [MongoDB & Mongoose Deep Dive](#7-mongodb--mongoose-deep-dive)
8. [Authentication & Authorization](#8-authentication--authorization)
9. [Middleware Strategy (middleware.ts)](#9-middleware-strategy)
10. [E-Commerce Feature Implementation](#10-e-commerce-feature-implementation)
11. [Testing Strategy](#11-testing-strategy)
12. [Deployment Guide](#12-deployment-guide)
13. [Production Security Checklist](#13-production-security-checklist)

---

## 1. Project Overview

### 1.1 Purpose

This guide walks through building **StoreFront** — a production-ready, full-stack e-commerce application — from an empty folder to a deployed, secure, scalable system. It is written as a real-world engineering roadmap: the kind of plan a senior engineer would hand a team starting a greenfield project, but detailed enough for a motivated beginner to follow every step without getting lost.

### 1.2 Goals

- Ship a fully functional storefront: browsing, search, cart, checkout, payments, orders, and an admin dashboard.
- Use an industry-standard separation of concerns: a Next.js frontend consuming a dedicated Express.js REST API, backed by MongoDB.
- Demonstrate production practices: typed code end-to-end, validated inputs, secure auth, RBAC, logging, testing, and CI-friendly deployment.
- Teach *why* each decision is made, not just *what* to type.

### 1.3 Key Features

| Category | Features |
|---|---|
| Customer-facing | Product catalogue, categories, search, filters/sort, product detail pages, cart, wishlist, checkout, order history, profile, email confirmations |
| Admin | Product CRUD, inventory management, order management, coupon management, basic analytics |
| Platform | Google/GitHub/Email auth, RBAC (customer/admin), Stripe or Paystack payments, responsive UI, SEO metadata, image optimization |

### 1.4 Expected Outcomes

By the end of this roadmap you will have:

- A deployed frontend (Vercel) and backend (Render/Railway/VPS) talking to a MongoDB Atlas cluster.
- A codebase that mirrors what you'd find in a well-run startup: typed contracts shared between client and server, layered backend architecture, and tested critical paths.
- Working knowledge of every Next.js App Router primitive and every core Express/Mongoose pattern used in production APIs today.

---

## 2. System Architecture

### 2.1 High-Level Diagram (textual)

```
┌─────────────────────────┐        HTTPS/JSON        ┌──────────────────────────┐
│        CLIENT            │  ───────────────────▶   │         SERVER            │
│  Next.js 15 (App Router)  │  ◀───────────────────   │  Express.js + TypeScript  │
│  - Server Components      │                         │  - Controllers/Services   │
│  - Client Components      │                         │  - Auth middleware        │
│  - Server Actions          │                         │  - Validation (zod)       │
│  - NextAuth.js / Clerk     │                         │  - Rate limiting/logging  │
└─────────────┬─────────────┘                         └─────────────┬────────────┘
              │                                                       │
              │ session/JWT                                          │ Mongoose ODM
              ▼                                                       ▼
     Auth Provider (Google/GitHub)                          ┌──────────────────┐
                                                              │   MongoDB Atlas   │
                                                              │  (Products, Users,│
                                                              │   Orders, Carts)  │
                                                              └──────────────────┘
                       ▲
                       │ Webhooks / API
              ┌────────┴─────────┐
              │ Stripe / Paystack │
              └───────────────────┘
```

### 2.2 How the Pieces Interact

1. **Client (Next.js)** renders product pages using **Server Components** that fetch data directly from the Express API at request/build time (fast, SEO-friendly, no client-side waterfall).
2. **Interactive UI** (add-to-cart buttons, filters, forms) is built with **Client Components**, which call the Express API from the browser using `fetch`, or invoke **Server Actions** for mutations that should run on the server without a manual API route.
3. **Authentication** is handled by NextAuth.js/Clerk in the Next.js app. On sign-in, a session (JWT or database session) is created. Every request from the client to the Express API includes this token, which the backend verifies independently (shared secret / JWKS) — the backend never trusts the frontend blindly.
4. **Express.js backend** exposes a versioned REST API (`/api/v1/...`). It is the single source of truth for business logic: pricing, inventory, order state transitions, and payment confirmation (via Stripe/Paystack webhooks) all live here — never trust client-computed totals.
5. **MongoDB**, accessed through Mongoose, stores all persistent data. Mongoose provides schema validation, hooks (pre/post save), and query building.
6. **Payment provider** (Stripe or Paystack) handles the actual charge. The backend creates a payment intent/transaction, the client confirms it, and a **webhook** back to the Express server is the authoritative signal that payment succeeded — this is what actually marks an order as "paid."

### 2.3 Why a Separate Backend Instead of Only Next.js Route Handlers?

Next.js *can* do a lot of backend work itself via Route Handlers and Server Actions. This guide deliberately uses a **separate Express.js service** because:

- It mirrors real-world systems where the API is consumed by more than one client (web, future mobile app, admin panel).
- It keeps deployment and scaling of compute-heavy API logic independent from the frontend.
- It's a common interview/production pattern worth learning explicitly: layered Express architecture (routes → controllers → services → models).

Route Handlers are still used in the Next.js app for thin, frontend-specific concerns (e.g., NextAuth's own API routes, image proxying), while all core business/data logic lives in Express.

---

## 3. Full-Stack Monorepo Structure

### 3.1 Top-Level Tree

```
ecommerce-store/
├── client/                      # Next.js frontend (App Router, TS)
├── server/                      # Express.js backend (TS)
├── shared/                      # Shared types, constants, validation schemas
├── docs/                        # Architecture notes, API docs, ADRs
├── .github/
│   └── workflows/               # CI pipelines (lint, test, build)
├── .gitignore
├── .editorconfig
├── README.md
├── package.json                 # Root workspace config (npm workspaces)
└── turbo.json                   # (optional) Turborepo pipeline config
```

### 3.2 `client/` — Next.js Frontend

```
client/
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout (fonts, providers, nav/footer)
│   │   ├── page.tsx                    # Home page
│   │   ├── globals.css
│   │   ├── loading.tsx                 # Global loading UI
│   │   ├── error.tsx                   # Global error boundary
│   │   ├── not-found.tsx
│   │   ├── (marketing)/                # Route group: public marketing pages
│   │   │   └── about/page.tsx
│   │   ├── (shop)/                     # Route group: storefront
│   │   │   ├── products/
│   │   │   │   ├── page.tsx            # Catalogue + filters
│   │   │   │   └── [slug]/page.tsx     # Product detail (dynamic route)
│   │   │   ├── categories/[slug]/page.tsx
│   │   │   ├── cart/page.tsx
│   │   │   ├── wishlist/page.tsx
│   │   │   └── checkout/
│   │   │       ├── page.tsx
│   │   │       └── success/page.tsx
│   │   ├── (account)/
│   │   │   ├── layout.tsx              # Nested layout for account section
│   │   │   ├── profile/page.tsx
│   │   │   └── orders/
│   │   │       ├── page.tsx
│   │   │       └── [orderId]/page.tsx
│   │   ├── (admin)/
│   │   │   ├── layout.tsx              # Protected nested layout for admin
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── products/page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   └── coupons/page.tsx
│   │   └── api/
│   │       └── auth/[...nextauth]/route.ts   # NextAuth route handler
│   ├── components/
│   │   ├── ui/                         # Buttons, inputs, modal, primitives
│   │   ├── product/                    # ProductCard, ProductGrid, Gallery
│   │   ├── cart/                       # CartDrawer, CartItem
│   │   └── layout/                     # Navbar, Footer, Sidebar
│   ├── lib/
│   │   ├── api.ts                      # Typed fetch wrapper for Express API
│   │   ├── auth.ts                     # NextAuth config/options
│   │   └── utils.ts
│   ├── hooks/                          # useCart, useWishlist, etc.
│   ├── store/                          # Client state (Zustand/Context)
│   ├── types/                          # Frontend-only types
│   └── middleware.ts                   # Route protection (checkout, admin)
├── public/                             # Static assets, favicon
├── next.config.ts
├── tsconfig.json
├── package.json
└── .env.local
```

**Why route groups `(shop)`, `(account)`, `(admin)`?** Parentheses create a route group — it organizes files without adding a URL segment, and lets each section have its own nested `layout.tsx` (e.g., the admin layout renders a sidebar; the shop layout doesn't).

### 3.3 `server/` — Express.js Backend

```
server/
├── src/
│   ├── config/
│   │   ├── env.ts                      # Validated environment variables
│   │   ├── db.ts                       # MongoDB connection
│   │   └── logger.ts                   # Winston/pino logger setup
│   ├── models/
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Category.ts
│   │   ├── Cart.ts
│   │   ├── Order.ts
│   │   ├── Coupon.ts
│   │   └── Review.ts
│   ├── routes/
│   │   ├── index.ts                    # Mounts all v1 routes
│   │   ├── product.routes.ts
│   │   ├── category.routes.ts
│   │   ├── cart.routes.ts
│   │   ├── order.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── coupon.routes.ts
│   │   └── admin.routes.ts
│   ├── controllers/
│   │   ├── product.controller.ts
│   │   ├── cart.controller.ts
│   │   ├── order.controller.ts
│   │   └── ...
│   ├── services/
│   │   ├── product.service.ts          # Business logic, DB queries
│   │   ├── payment.service.ts          # Stripe/Paystack integration
│   │   ├── email.service.ts
│   │   └── inventory.service.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts          # Verify JWT/session
│   │   ├── role.middleware.ts          # RBAC guard
│   │   ├── validate.middleware.ts      # zod schema validation
│   │   ├── error.middleware.ts         # Centralized error handler
│   │   └── rateLimiter.middleware.ts
│   ├── validators/
│   │   └── *.schema.ts                 # zod schemas per resource
│   ├── utils/
│   │   ├── ApiError.ts
│   │   ├── ApiResponse.ts
│   │   └── asyncHandler.ts
│   ├── app.ts                          # Express app assembly
│   └── server.ts                       # Entry point (listens on PORT)
├── tests/
│   ├── unit/
│   └── integration/
├── tsconfig.json
├── package.json
└── .env
```

### 3.4 `shared/` — Cross-Boundary Contracts

```
shared/
├── types/
│   ├── product.ts       # Product, ProductVariant interfaces
│   ├── order.ts
│   ├── user.ts
│   └── api.ts            # ApiResponse<T>, PaginatedResponse<T>
├── constants/
│   └── roles.ts           # 'customer' | 'admin'
└── package.json            # Published as an internal workspace package
```

Both `client` and `server` depend on `shared` via npm workspaces (`"shared": "*"` in each `package.json`), so a `Product` type is defined once and imported in both places — eliminating drift between frontend expectations and backend responses.

### 3.5 Root `package.json` (npm workspaces)

```json
{
  "name": "ecommerce-store",
  "private": true,
  "workspaces": ["client", "server", "shared"],
  "scripts": {
    "dev:client": "npm run dev -w client",
    "dev:server": "npm run dev -w server",
    "build": "npm run build -w shared && npm run build -w server && npm run build -w client"
  }
}
```

### 3.6 How Frontend and Backend Communicate

- In development: `client` runs on `http://localhost:3000`, `server` on `http://localhost:5000`. `NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1` is set in `client/.env.local`.
- Server Components fetch directly server-to-server (no CORS concern since it's not a browser request).
- Client Components/browser calls require CORS to be configured on the Express side (`cors({ origin: process.env.CLIENT_URL, credentials: true })`).
- Auth tokens are passed as `Authorization: Bearer <token>` headers or via secure cookies, depending on the NextAuth session strategy chosen (JWT strategy is used here so the same token can be verified by Express).


---

## 4. Weekly Development Roadmap

The project is organized into **12 weeks**, each a self-contained phase with its own objectives, deliverables, and daily plan (5 working days/week, leaving 2 days buffer for review/catch-up). Adjust pacing to your own speed — the sequence of tasks matters more than the calendar.

### Roadmap at a Glance

| Week | Phase | Focus |
|---|---|---|
| 1 | Foundation | Monorepo setup, tooling, DB connection, basic Express skeleton |
| 2 | Data Layer | Mongoose models, relationships, seeding, CRUD APIs |
| 3 | Frontend Foundations | Next.js setup, layouts, routing, design system |
| 4 | Catalogue | Product listing, detail pages, categories, search/filter/sort |
| 5 | Authentication | NextAuth.js/Clerk, Google/GitHub/Email, sessions, RBAC |
| 6 | Middleware & Protected Routes | middleware.ts, protected checkout/admin, backend auth guard |
| 7 | Cart & Wishlist | Cart persistence, client state, server sync |
| 8 | Checkout & Payments | Stripe/Paystack integration, order creation, webhooks |
| 9 | Orders & Profile | Order history, order detail, user profile management |
| 10 | Admin Dashboard | Product/inventory/coupon management, admin analytics |
| 11 | Testing & Hardening | Unit/integration/API tests, security pass, performance |
| 12 | Deployment | Vercel, Render/Railway/VPS, Atlas, env config, launch checklist |

---

### WEEK 1 — Foundation & Environment Setup

**Weekly Objectives:** Establish the monorepo, configure TypeScript/ESLint/Prettier across packages, stand up a minimal Express server with a working MongoDB connection, and confirm the Next.js app boots.

**Deliverables:** Running `npm run dev:server` prints "Server listening" and `/api/v1/health` returns `200 OK`; running `npm run dev:client` shows the default Next.js home page; MongoDB Atlas cluster is connected from the backend.

**Technologies Covered:** npm workspaces, TypeScript, ESLint/Prettier, Express.js basics, MongoDB Atlas, Mongoose connection, dotenv/env validation.

**Skills Learned:** Monorepo tooling, environment configuration discipline, Express app bootstrapping, connecting a Node process to a cloud database.

**Milestone:** A running, connected, lint-clean skeleton for both apps.

#### Day 1 — Monorepo & Tooling Setup

- **Objective:** Create the root repository with npm workspaces for `client`, `server`, and `shared`.
- **Tasks:**
  1. `mkdir ecommerce-store && cd ecommerce-store && git init`
  2. Create root `package.json` with `"workspaces": ["client", "server", "shared"]`.
  3. Create `.gitignore` (node_modules, .env, .next, dist, coverage).
  4. Create `.editorconfig` and a root `.eslintrc` / `eslint.config.js` shared by all packages.
  5. Initialize `shared/` as a minimal TypeScript package (`tsc --init`, `package.json` with `"main": "dist/index.js"`).
- **Why this matters:** A consistent monorepo layout from day one avoids painful restructuring later, and a shared lint config keeps code style uniform across two very different runtimes (browser vs Node).
- **Expected Output:** `npm install` at the root succeeds; `ls` shows `client/ server/ shared/` (empty placeholders for client/server so far).
- **Common Mistakes:** Forgetting to set `"private": true` in root `package.json` (npm will refuse to install workspaces without it in some configurations); committing `.env` files.
- **Best Practices:** Commit a `.env.example` for every package instead of the real `.env`; use `engines` field in `package.json` to pin Node version.
- **Testing Checklist:** `git status` shows no `node_modules` staged; `npm ls --workspaces` lists all three packages.

#### Day 2 — Express.js Backend Skeleton

- **Objective:** Scaffold `server/` with TypeScript, Express, and a `/health` route.
- **Tasks:**
  1. `cd server && npm init -y && npm i express dotenv cors helmet morgan`
  2. `npm i -D typescript ts-node-dev @types/express @types/node @types/cors`
  3. `npx tsc --init` — set `target: ES2022`, `module: commonjs` (or `NodeNext`), `outDir: dist`, `rootDir: src`, `strict: true`.
  4. Create `src/app.ts` (Express app, middleware registration, health route) and `src/server.ts` (imports `app`, calls `app.listen`).
  5. Add `dev` script: `"dev": "ts-node-dev --respawn --transpile-only src/server.ts"`.
- **Internals:** `helmet` sets secure HTTP headers; `morgan` logs requests; `cors` will later be scoped to `CLIENT_URL` only, not `*`, once auth cookies are involved.
- **Expected Output:** `curl http://localhost:5000/api/v1/health` → `{"status":"ok"}`.
- **Common Mistakes:** Using `app.listen` inside `app.ts` (couples app creation with startup, breaks testability — keep them separate as shown).
- **Best Practices:** Version the API from day one (`/api/v1/...`) so future breaking changes don't require a new domain.
- **Testing Checklist:** Server restarts automatically on file save; health endpoint responds under 100ms locally.

#### Day 3 — MongoDB Atlas & Mongoose Connection

- **Objective:** Provision a free MongoDB Atlas cluster and connect it from Express.
- **Tasks:**
  1. Create an Atlas project + free (M0) cluster, add your IP (or `0.0.0.0/0` for dev only) to network access, create a DB user.
  2. Copy the connection string into `server/.env` as `MONGO_URI`.
  3. `npm i mongoose`. Create `src/config/db.ts` exporting an async `connectDB()`.
  4. Call `connectDB()` before `app.listen` in `server.ts`; exit process on connection failure.
  5. Create `src/config/env.ts` that validates required env vars exist at boot (fail fast with a clear error rather than a cryptic runtime crash later).
- **Why validate env vars?** A missing `MONGO_URI` should crash immediately with "MONGO_URI is not set" — not three files deep inside a Mongoose error.
- **Expected Output:** Console log "MongoDB connected" on `npm run dev`.
- **Common Mistakes:** Committing the real connection string; leaving Atlas network access open to `0.0.0.0/0` in production.
- **Best Practices:** Use a dedicated database user with least-privilege access (not the Atlas admin account) for the application.
- **Testing Checklist:** Stopping network access temporarily and re-running confirms the app fails fast with a readable error.

#### Day 4 — Next.js App Bootstrap

- **Objective:** Scaffold `client/` with the App Router and TypeScript.
- **Tasks:**
  1. `npx create-next-app@latest client --typescript --app --eslint --tailwind --src-dir --import-alias "@/*"`
  2. Remove boilerplate content from `src/app/page.tsx`; confirm `npm run dev` shows a blank/custom home page at `localhost:3000`.
  3. Add `client/.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1`.
  4. Create `src/lib/api.ts`: a small typed `fetch` wrapper (`get`, `post`, `put`, `del`) that prefixes `NEXT_PUBLIC_API_URL` and parses JSON.
- **Expected Output:** Visiting `localhost:3000` shows the custom placeholder home page; a test call from a Server Component to `/api/v1/health` renders "ok".
- **Common Mistakes:** Using a non-`NEXT_PUBLIC_` env var for something read in the browser (it silently returns `undefined` on the client).
- **Best Practices:** Keep server-only secrets (never `NEXT_PUBLIC_`) separate from public config.
- **Testing Checklist:** `npm run build` succeeds with zero TypeScript errors.

#### Day 5 — Review, CI, and Week Wrap-Up

- **Objective:** Add a minimal CI workflow and review the week's work.
- **Tasks:**
  1. Add `.github/workflows/ci.yml` running `npm install`, lint, and build for both `client` and `server` on push.
  2. Write `README.md` covering setup instructions (`.env` variables required, how to run dev servers).
  3. Manually test: backend health check, frontend loads, DB connects — all three simultaneously.
- **Expected Output:** A green CI run on GitHub for the initial commit.
- **Testing Checklist:** Fresh clone + `npm install` + following the README exactly reproduces a working local environment.

**Week 1 Learning Outcomes:** Monorepo tooling with npm workspaces; a working, lint-clean Express + TypeScript skeleton connected to MongoDB Atlas; a bootstrapped Next.js App Router project; the discipline of environment-variable validation and CI from day one. You are ready to start modeling real data in Week 2.


### WEEK 2 — Data Layer: Mongoose Models & Core CRUD APIs

**Weekly Objectives:** Design and implement Mongoose schemas for Product, Category, User, and Review; build the layered Express architecture (routes → controllers → services); ship working CRUD endpoints for products and categories with validation.

**Deliverables:** `/api/v1/products` supports GET (list + single), POST, PUT, DELETE with zod-validated payloads; database is seeded with sample data.

**Technologies Covered:** Mongoose schemas/models, relationships (`ref`/`populate`), zod validation, layered Express architecture, error handling middleware.

**Skills Learned:** Data modeling for e-commerce, RESTful route design, request validation, centralized error handling.

**Milestone:** A fully working, validated, seeded product/category API.

#### Day 1 — Schema Design

- **Objective:** Design `Product`, `Category`, `User`, `Review` schemas.
- **Tasks:**
  1. `src/models/Category.ts`: `{ name, slug, description, parent? (self-ref for subcategories) }`.
  2. `src/models/Product.ts`: `{ name, slug, description, price, compareAtPrice?, images: string[], category: ObjectId ref Category, stock, sku, variants?: [{name, options}], ratingsAverage, ratingsCount, isFeatured, isActive }`, with timestamps.
  3. `src/models/User.ts`: `{ name, email (unique), passwordHash?, provider, role: 'customer'|'admin', avatar }`.
  4. `src/models/Review.ts`: `{ product: ObjectId ref Product, user: ObjectId ref User, rating, comment }`, with a compound unique index on `(product, user)` to prevent duplicate reviews.
- **Internals:** `ref` stores an ObjectId pointer; `.populate('category')` performs a client-side join at query time — MongoDB itself has no native joins, so populate is a convenience layered on top of two queries.
- **Expected Output:** `mongoose.model('Product', productSchema)` compiles with no TS errors; schema has `unique: true` on `slug`.
- **Common Mistakes:** Forgetting indexes on frequently-queried fields (`slug`, `category`) — causes slow queries as data grows.
- **Best Practices:** Add `schema.index({ name: 'text', description: 'text' })` early to enable text search later without a migration.
- **Testing Checklist:** Creating two products with the same slug throws a duplicate-key error as expected.

#### Day 2 — Service & Repository Layer

- **Objective:** Build `product.service.ts` containing all DB queries; controllers stay thin.
- **Tasks:**
  1. `getProducts({ page, limit, category, search, sort })` — builds a Mongoose query dynamically with pagination (`.skip().limit()`), filtering (`category` match), search (`$text` or regex), and sorting (`price`, `-createdAt`, etc.).
  2. `getProductBySlug(slug)`, `createProduct(data)`, `updateProduct(id, data)`, `deleteProduct(id)`.
  3. Wrap all DB calls in `try/catch` at the controller level using a shared `asyncHandler` utility so you never repeat `try/catch` boilerplate.
- **Why separate services from controllers?** Controllers translate HTTP ↔ domain calls; services contain business/DB logic and are directly unit-testable without spinning up Express.
- **Expected Output:** `productService.getProducts({ page: 1, limit: 12 })` returns `{ items, total, page, pages }`.
- **Common Mistakes:** Putting `req`/`res` objects inside the service layer — this couples business logic to HTTP and blocks reuse (e.g., from a CLI seed script).
- **Best Practices:** Return plain data/DTOs from services; let controllers shape the HTTP response.
- **Testing Checklist:** Pagination math verified with a seeded set of 25 products at `limit=10` (expect 3 pages).

#### Day 3 — Controllers, Routes, and Validation

- **Objective:** Wire up `product.routes.ts` and `product.controller.ts`, add zod request validation.
- **Tasks:**
  1. Define `productCreateSchema` in `validators/product.schema.ts` using `zod` (name, price > 0, category must be a valid ObjectId string, etc.).
  2. `validate.middleware.ts`: a generic `validate(schema) => (req, res, next)` that parses `req.body` and calls `next(new ApiError(400, ...))` on failure.
  3. Routes: `GET /products`, `GET /products/:slug`, `POST /products` (admin-only, validated), `PUT /products/:id`, `DELETE /products/:id`.
  4. Mount in `routes/index.ts` under `/api/v1`.
- **Expected Output:** `POST /api/v1/products` with an invalid price (`-5`) returns `400` with a clear message; a valid payload returns `201` with the created product.
- **Common Mistakes:** Validating in the controller with manual `if` checks instead of a schema — brittle and hard to keep in sync with the frontend's expectations.
- **Best Practices:** Export the same zod schemas (or their inferred types) from `shared/` so the frontend form validation matches the backend exactly.
- **Testing Checklist:** Postman/Thunder Client collection covering happy path + 3 invalid-payload cases per route.

#### Day 4 — Centralized Error Handling & ApiResponse

- **Objective:** Standardize success/error responses across the whole API.
- **Tasks:**
  1. `utils/ApiError.ts`: class extending `Error` with `statusCode`.
  2. `utils/ApiResponse.ts`: `{ success, data, message }` shape helper.
  3. `middlewares/error.middleware.ts`: last-mounted Express error handler; distinguishes `ApiError` (known, safe to show message) from unexpected errors (log full stack, return generic 500 message).
  4. Register a 404 handler for unmatched routes before the error middleware.
- **Expected Output:** Every response — success or failure — follows the same JSON envelope, which the frontend's `api.ts` wrapper can rely on.
- **Common Mistakes:** Leaking stack traces or internal error messages to the client in production.
- **Best Practices:** Log the real error server-side (via the logger from Day 3 of Week 1) regardless of what's sent to the client.
- **Testing Checklist:** Force a DB disconnect and confirm the client receives a clean `500` JSON, not an HTML stack trace.

#### Day 5 — Seeding & Category CRUD

- **Objective:** Build a seed script and finish Category CRUD.
- **Tasks:**
  1. `src/scripts/seed.ts`: connects to DB, clears collections, inserts ~10 categories and ~40 products with realistic data (can be generated with `@faker-js/faker`).
  2. Add `"seed": "ts-node src/scripts/seed.ts"` script.
  3. Mirror the product CRUD pattern for `category.routes.ts`/`controller`/`service` (simpler — no pagination needed unless categories are numerous).
- **Expected Output:** `npm run seed` populates Atlas with sample data visible in Atlas's data explorer.
- **Testing Checklist:** `GET /api/v1/products?category=<id>&page=1&limit=12` returns filtered, paginated results matching the seed data.

**Week 2 Learning Outcomes:** Real-world Mongoose schema design including relationships and indexes; a clean layered Express architecture that scales to many resources; consistent validation and error handling; a repeatable database seeding workflow.


### WEEK 3 — Frontend Foundations & Design System

**Weekly Objectives:** Build the Next.js layout system (root + nested layouts), design system primitives, navigation, and connect the frontend to the live backend for the first time.

**Deliverables:** A styled, responsive shell (navbar, footer) wraps every page; the home page renders featured products fetched server-side from the Express API.

**Technologies Covered:** App Router layouts, Server Components, Tailwind design tokens, Metadata API, Image Optimization, loading/error UI.

**Skills Learned:** Composing nested layouts, fetching data in Server Components, building a small reusable component library.

**Milestone:** A visually coherent, data-connected shell for the storefront.

#### Day 1 — Root Layout, Fonts, and Global Providers

- **Objective:** Build `app/layout.tsx` with fonts, metadata defaults, and global providers.
- **Tasks:**
  1. Configure `next/font` (e.g., `Inter`) and apply the font class to `<body>`.
  2. Set default `metadata` export (`title`, `description`, `openGraph`) in the root layout — the Metadata API automatically injects `<head>` tags.
  3. Wrap children in a `<Providers>` client component (holds React Query/Zustand/theme providers) — keep the root layout itself a Server Component and isolate `"use client"` to `Providers`.
- **Internals:** The root layout renders once per navigation within the same route tree — it does not re-render on every page change, which is why global providers belong here.
- **Expected Output:** Every page inherits the font and base metadata without repeating code.
- **Common Mistakes:** Marking the entire root layout `"use client"` — this forces the whole tree to hydrate on the client, losing the performance benefit of Server Components.
- **Best Practices:** Push `"use client"` as far down the tree as possible ("leaf" components only).
- **Testing Checklist:** View page source and confirm meta tags are present in the initial HTML (not injected after hydration).

#### Day 2 — Navbar, Footer, and Design Tokens

- **Objective:** Build reusable UI primitives and the site chrome.
- **Tasks:**
  1. `components/ui/Button.tsx`, `Input.tsx`, `Badge.tsx` — variant-driven with `class-variance-authority` or a simple `cn()` helper.
  2. `components/layout/Navbar.tsx` (logo, nav links, cart icon with count, auth state placeholder) and `Footer.tsx`.
  3. Define Tailwind theme tokens (`tailwind.config.ts`): brand colors, spacing scale, font sizes — avoid ad hoc hex values scattered through components.
- **Expected Output:** A consistent navbar/footer on every route once added to the root layout.
- **Common Mistakes:** Hardcoding colors inline instead of using theme tokens — makes a future rebrand or dark-mode pass painful.
- **Best Practices:** Co-locate component-specific styles with the component; keep only truly global tokens in the Tailwind config.
- **Testing Checklist:** Resize the viewport to mobile width and confirm the navbar collapses/adjusts sensibly.

#### Day 3 — Home Page: Server Component Data Fetching

- **Objective:** Fetch featured products server-side and render a grid.
- **Tasks:**
  1. `app/page.tsx` (Server Component, default — no `"use client"` needed): `const products = await api.get<Product[]>('/products?featured=true')`.
  2. `components/product/ProductGrid.tsx` and `ProductCard.tsx` — pure presentational components receiving `products` as props.
  3. Use `next/image` for product images with explicit `width`/`height` (or `fill` + a sized container) for automatic optimization/lazy-loading.
- **Internals:** Because `page.tsx` is a Server Component, the `fetch` runs on the server during rendering — the browser receives fully-formed HTML, improving both SEO and first paint.
- **Expected Output:** Home page shows a responsive grid of real product cards from the seeded database.
- **Common Mistakes:** Fetching data in a `useEffect` in a Client Component for content that could be Server-rendered — unnecessarily slower and worse for SEO.
- **Best Practices:** Only convert a component to a Client Component when it needs interactivity (state, event handlers, browser APIs).
- **Testing Checklist:** Disable JavaScript in devtools and confirm the product grid still renders (proof it's truly server-rendered).

#### Day 4 — Loading & Error UI, Not Found

- **Objective:** Add `loading.tsx` and `error.tsx` boundaries.
- **Tasks:**
  1. `app/loading.tsx`: a skeleton grid shown automatically by Next.js via React Suspense while the route's data is fetching.
  2. `app/error.tsx` (`"use client"` required — error boundaries must be client components): friendly message + "try again" button calling the provided `reset()` function.
  3. `app/not-found.tsx`: custom 404 page.
- **Internals:** Next.js automatically wraps each route segment in a `<Suspense>` boundary when a sibling `loading.tsx` exists, and in an error boundary when `error.tsx` exists — no manual wiring needed.
- **Expected Output:** Throttling network in devtools shows the skeleton briefly before real content "pops in."
- **Common Mistakes:** Forgetting `"use client"` on `error.tsx` (build fails).
- **Best Practices:** Keep `loading.tsx` visually similar in layout to the real content to avoid layout shift.
- **Testing Checklist:** Temporarily throw inside `page.tsx` and confirm `error.tsx` catches it instead of crashing the whole app.

#### Day 5 — Nested Layout for Account Section + Review

- **Objective:** Demonstrate nested layouts with the `(account)` route group.
- **Tasks:**
  1. `app/(account)/layout.tsx`: a sidebar layout (Profile / Orders links) wrapping only account pages, distinct from the root layout's navbar.
  2. Placeholder `app/(account)/profile/page.tsx` and `orders/page.tsx`.
  3. Manual QA pass across all pages built this week on both desktop and mobile widths.
- **Expected Output:** Navigating between `/profile` and `/orders` keeps the sidebar mounted (no full-page reload), while navigating to `/` shows the normal navbar/footer instead.
- **Testing Checklist:** Confirm the account layout does not appear on non-account routes, and vice versa.

**Week 3 Learning Outcomes:** Composable App Router layouts and route groups; the Server vs. Client Component decision framework; automatic loading/error boundaries via file conventions; the Metadata and Image Optimization APIs in practice.


### WEEK 4 — Catalogue: Listing, Detail, Search, Filter, Sort

**Weekly Objectives:** Build the full product catalogue experience: listing page with filters/sort/pagination, dynamic product detail pages, category pages, and search.

**Deliverables:** `/products` supports query-string-driven filters (`?category=&sort=&search=&page=`); `/products/[slug]` renders full product detail with gallery and reviews; ISR is configured for product pages.

**Technologies Covered:** Dynamic Routing, Static Site Generation, Incremental Static Regeneration, `generateStaticParams`, `generateMetadata`, URL search params in Server Components.

**Skills Learned:** Building filterable/sortable listing UIs backed by URL state (shareable, back-button-friendly), balancing SSG/ISR/SSR tradeoffs for e-commerce content.

**Milestone:** A fully browsable, SEO-friendly catalogue.

#### Day 1 — Listing Page with URL-Driven Filters

- **Objective:** Build `/products` reading filters from `searchParams`.
- **Tasks:**
  1. `app/(shop)/products/page.tsx` receives `{ searchParams }: { searchParams: Promise<{ category?: string; sort?: string; search?: string; page?: string }> }` (Next.js 15: `searchParams` is now a Promise — must `await` it).
  2. Pass parsed params to `api.get('/products', { params })`.
  3. Build `<FilterSidebar>` and `<SortDropdown>` as Client Components that update the URL via `useRouter().push` / `useSearchParams` — this keeps filter state shareable and bookmarkable instead of living only in local state.
- **Internals:** Because filters live in the URL, the Server Component re-fetches with new params on navigation — no client-side data-fetching library required for this page.
- **Expected Output:** Selecting a category updates the URL (`?category=electronics`) and the grid without a full page reload (client-side navigation).
- **Common Mistakes:** Storing filter state only in `useState` — loses shareability and breaks the back button.
- **Best Practices:** Debounce the search input before pushing to the URL to avoid a fetch per keystroke.
- **Testing Checklist:** Copy a filtered URL, open in a new tab, confirm the same filtered results render.

#### Day 2 — Dynamic Product Detail Page

- **Objective:** Build `app/(shop)/products/[slug]/page.tsx`.
- **Tasks:**
  1. Fetch `getProductBySlug(slug)`; call `notFound()` from `next/navigation` if missing.
  2. Build `<ProductGallery>` (image carousel, Client Component for interactivity) and `<ProductInfo>` (price, stock, variant selector, add-to-cart).
  3. Add `generateMetadata({ params })` returning dynamic `title`/`description`/`openGraph.images` per product for SEO/social sharing.
- **Expected Output:** Visiting `/products/blue-running-shoes` shows correct data; sharing the link on social media (tested via a metadata debugger) shows the right image/title.
- **Common Mistakes:** Forgetting `notFound()` for invalid slugs — results in a broken page instead of a proper 404.
- **Best Practices:** Keep the add-to-cart button's interactivity isolated to a small Client Component, not the whole page.
- **Testing Checklist:** Visiting a nonexistent slug renders the custom 404 page from Week 3.

#### Day 3 — Static Generation & ISR for Product Pages

- **Objective:** Pre-render popular product pages at build time and revalidate periodically.
- **Tasks:**
  1. Export `generateStaticParams()` in `[slug]/page.tsx` returning the slugs of, e.g., the top 50 products — these are built at deploy time (SSG).
  2. Set `export const revalidate = 3600;` (ISR) so pages regenerate in the background at most once per hour, picking up price/stock changes without a full redeploy.
  3. For slugs not pre-rendered, Next.js falls back to on-demand rendering and caches the result (dynamic params allowed by default).
- **Internals:** ISR gives static-page performance with periodic freshness — a good fit for product pages where price changes aren't instant but shouldn't require a redeploy either.
- **Expected Output:** `next build` output lists pre-rendered product paths; after 1 hour (or a forced revalidation), price changes in the DB appear without redeploying.
- **Common Mistakes:** Setting `revalidate` too low for high-traffic pages (hammers the backend) or too high for fast-changing data like stock count during a flash sale.
- **Best Practices:** For inventory-critical moments (checkout), always read live data — never rely on a stale ISR cache for the actual purchase decision.
- **Testing Checklist:** Manually update a product's price in MongoDB, wait past the revalidate window, confirm the price updates on the (still statically served) page.

#### Day 4 — Category Pages & Server-Side Search

- **Objective:** Build `/categories/[slug]` and a text-search API.
- **Tasks:**
  1. `app/(shop)/categories/[slug]/page.tsx` reuses the product-grid components, fetching by category.
  2. Backend: add a MongoDB text index (`{ name: 'text', description: 'text' }`) and a `search` query param using `$text: { $search: query }`, sorted by `textScore` when a search term is present.
  3. Build a `<SearchBar>` in the navbar (Client Component) that navigates to `/products?search=...` on submit.
- **Expected Output:** Typing "shoes" and submitting shows only matching products, ranked by relevance.
- **Common Mistakes:** Using a case-sensitive regex search instead of a proper text index — slow and misses partial relevance ranking.
- **Best Practices:** Combine `$text` search with existing filters (category, price range) in the same aggregation/query rather than two separate round trips.
- **Testing Checklist:** Searching a term present in only the description (not the name) still returns the product.

#### Day 5 — Reviews Display & Week Review

- **Objective:** Show product reviews and ratings on the detail page; polish and review the week.
- **Tasks:**
  1. `GET /api/v1/products/:id/reviews` — paginated list; display average rating and review count (already stored denormalized on `Product` from Week 2, updated via a Mongoose post-save hook on `Review`).
  2. `<ReviewList>` and `<RatingStars>` components.
  3. Full manual QA pass: browse → filter → search → view detail → confirm all URLs are shareable.
- **Expected Output:** Product detail pages show real aggregated ratings that update when a new review is added (tested manually via API call for now — the review submission UI comes with the authenticated user flow in a later week).
- **Testing Checklist:** Adding a review via API updates `ratingsAverage`/`ratingsCount` on the product document correctly (verify the aggregation math with a few sample reviews).

**Week 4 Learning Outcomes:** The full spectrum of Next.js rendering strategies (SSR-by-default Server Components, SSG via `generateStaticParams`, ISR via `revalidate`); URL-driven UI state for shareable filters; dynamic SEO metadata; MongoDB text search.


### WEEK 5 — Authentication (NextAuth.js/Clerk: Google, GitHub, Email)

**Weekly Objectives:** Implement full authentication with Google, GitHub, and Email/password, wire sessions into both the Next.js app and the Express API, and establish RBAC (customer/admin).

**Deliverables:** Users can sign in with Google, GitHub, or email/password; the signed-in session is verifiable by the Express backend; a `role` field controls access to admin-only endpoints.

**Technologies Covered:** NextAuth.js (Auth.js) v5 / Clerk, OAuth providers, JWT session strategy, RBAC, password hashing (bcrypt), refresh tokens.

**Skills Learned:** OAuth flow mechanics, session vs. JWT tradeoffs, sharing auth identity across two separate services.

**Milestone:** Working multi-provider auth with role-based access.

#### Day 1 — NextAuth.js Setup & Providers

- **Objective:** Install and configure NextAuth.js with Google and GitHub providers.
- **Tasks:**
  1. `npm i next-auth@beta` (Auth.js v5) in `client/`.
  2. Create OAuth apps in the Google Cloud Console and GitHub Developer Settings; get `CLIENT_ID`/`CLIENT_SECRET` for each; set authorized redirect URI to `http://localhost:3000/api/auth/callback/google` (and `/github`).
  3. `src/lib/auth.ts`: `NextAuth({ providers: [Google({...}), GitHub({...}), Credentials({...})], session: { strategy: 'jwt' }, callbacks: {...} })`.
  4. `app/api/auth/[...nextauth]/route.ts`: `export const { GET, POST } = handlers`.
- **Internals:** OAuth providers redirect the user to Google/GitHub, which redirects back with an authorization code; NextAuth exchanges it server-side for profile info and creates a session — your app never sees the user's Google password.
- **Expected Output:** A "Sign in with Google" button redirects, authenticates, and returns the user to your app, signed in.
- **Common Mistakes:** Mismatched redirect URI between the OAuth app console and NextAuth's expected callback URL (most common OAuth setup bug).
- **Best Practices:** Use separate OAuth app credentials for local/dev vs. production (different redirect URIs).
- **Testing Checklist:** Sign in, inspect the session cookie/JWT in devtools, confirm it contains no sensitive secrets.

#### Day 2 — Email/Password (Credentials Provider) & Password Hashing

- **Objective:** Add email/password sign-up and sign-in.
- **Tasks:**
  1. Backend: `POST /api/v1/auth/register` (hash password with `bcrypt`, `saltRounds >= 10`, store `passwordHash`, never the raw password) and `POST /api/v1/auth/login` (compare hash, issue a JWT signed with `JWT_SECRET`).
  2. Frontend: NextAuth `Credentials` provider's `authorize()` calls the Express `/auth/login` endpoint and returns the user object (or `null` on failure) to NextAuth, which then issues its own session JWT.
  3. Build `/login` and `/register` pages with client-side form validation (zod + react-hook-form).
- **Internals:** Two JWTs exist here conceptually: the Express-issued token proving identity to the API, and NextAuth's own session token for the Next.js app — the `jwt` callback in NextAuth is used to persist the Express token inside the NextAuth session so it can be attached to later API calls.
- **Expected Output:** A new user can register, then log in, and see their name reflected in the navbar.
- **Common Mistakes:** Storing plaintext passwords (never do this); using a weak `JWT_SECRET` or committing it to git.
- **Best Practices:** Enforce password complexity and rate-limit the login endpoint to slow brute-force attempts.
- **Testing Checklist:** Attempting to register with an already-used email returns a clear `409 Conflict`.

#### Day 3 — Sharing Sessions with the Express Backend

- **Objective:** Make the Express API able to verify the identity of requests coming from the Next.js frontend.
- **Tasks:**
  1. Sign the backend-issued JWT with a secret shared (via env var) between `client` and `server`, OR have Express independently verify NextAuth's JWT if using NextAuth's own JWT (matching `NEXTAUTH_SECRET`).
  2. `middlewares/auth.middleware.ts`: reads `Authorization: Bearer <token>`, verifies it with `jsonwebtoken.verify`, attaches `req.user` on success, else `401`.
  3. Frontend `lib/api.ts`: attach the token from the current session (`await auth()` in a Server Component, or `useSession()` in a Client Component) to every request's `Authorization` header.
- **Internals:** The backend must **never** trust a `role` or `userId` sent directly in a request body — identity always comes from the verified token, not client-supplied fields.
- **Expected Output:** An authenticated request to a protected endpoint (e.g., `GET /api/v1/users/me`) returns the correct user; an unauthenticated request returns `401`.
- **Common Mistakes:** Trusting `req.body.userId` for "who is making this request" instead of `req.user.id` from the verified token.
- **Best Practices:** Keep token expiry short (e.g., 15 min) and use refresh tokens (Day 4) for long-lived sessions rather than one long-lived access token.
- **Testing Checklist:** Tampering one character of a valid JWT causes verification to fail with `401`, not a crash.

#### Day 4 — Refresh Tokens & RBAC Middleware

- **Objective:** Add refresh token rotation and role-based route guarding.
- **Tasks:**
  1. Issue a short-lived access token (15 min) and a long-lived refresh token (7–30 days, stored hashed in the `User` document or a separate `RefreshToken` collection) at login.
  2. `POST /api/v1/auth/refresh`: validates the refresh token, issues a new access token (and optionally rotates the refresh token, invalidating the old one).
  3. `middlewares/role.middleware.ts`: `requireRole('admin')` — checks `req.user.role` after `auth.middleware.ts` has run; returns `403` if mismatched.
  4. Apply `requireRole('admin')` to all `admin.routes.ts` and product-mutation routes.
- **Expected Output:** A customer-role token hitting `POST /api/v1/products` gets `403 Forbidden`; an admin token succeeds.
- **Common Mistakes:** Checking roles only in the frontend UI (hiding a button) without also enforcing it server-side — this is not real security, just UX.
- **Best Practices:** Always enforce authorization server-side; frontend role checks are for UX only.
- **Testing Checklist:** A test suite covering: no token → 401, valid customer token on admin route → 403, valid admin token → 200.

#### Day 5 — Profile Page & Week Review

- **Objective:** Build the authenticated profile page and test the full auth matrix.
- **Tasks:**
  1. `app/(account)/profile/page.tsx`: Server Component reading the session, displaying name/email/avatar, with a form to update profile (via a Server Action, previewed here and built fully in Week 6/9).
  2. Sign-out flow (`signOut()` from NextAuth).
  3. Full regression test: Google login, GitHub login, email login/register, sign-out, admin vs. customer access to a protected endpoint.
- **Expected Output:** All three auth methods work end-to-end and correctly populate `req.user` on the backend.
- **Testing Checklist:** A checklist of all auth paths (3 providers × sign-in/out) manually verified and recorded in `docs/`.

**Week 5 Learning Outcomes:** Multi-provider OAuth + credentials auth with NextAuth.js; secure password hashing; JWT access/refresh token patterns; enforceable server-side RBAC — the foundation every protected feature from here on depends on.

### WEEK 6 — Middleware & Protected Routes

**Weekly Objectives:** Use `middleware.ts` on the frontend to gate checkout and admin routes before they even render, and harden backend route protection.

**Deliverables:** Unauthenticated users hitting `/checkout` or `/admin/*` are redirected to `/login`; non-admins hitting `/admin/*` are redirected to a "not authorized" page; all mutating backend routes require valid auth.

**Technologies Covered:** Next.js `middleware.ts`, Edge Runtime constraints, route matchers, backend security middleware (helmet, rate limiting, sanitization).

**Skills Learned:** Request-time route protection before rendering, defense-in-depth (frontend + backend both enforce access).

**Milestone:** No protected page or endpoint is reachable without correct auth/role.

#### Day 1 — `middleware.ts` Fundamentals

- **Objective:** Understand and scaffold Next.js middleware.
- **Tasks:**
  1. Create `client/src/middleware.ts` exporting a `middleware(request: NextRequest)` function and a `config.matcher` array limiting which paths it runs on (e.g., `['/checkout/:path*', '/admin/:path*', '/profile/:path*', '/orders/:path*']`).
  2. Read the session token via `auth()` (Auth.js v5 exposes a middleware-compatible helper) or `getToken()` from `next-auth/jwt`.
  3. If no token and path matches a protected matcher, `NextResponse.redirect(new URL('/login', request.url))`.
- **Internals:** Middleware runs on the **Edge Runtime** — a restricted environment (no full Node APIs, no direct DB access) that executes before the request reaches any page, so protection happens before any protected content is even computed.
- **Expected Output:** Visiting `/checkout` while signed out immediately redirects to `/login?callbackUrl=/checkout`.
- **Common Mistakes:** Trying to query MongoDB directly inside middleware (Edge Runtime cannot use the Node MongoDB driver/Mongoose) — only lightweight token checks belong here.
- **Best Practices:** Keep the matcher list as narrow as possible — running middleware on every single request (including static assets) adds latency.
- **Testing Checklist:** Confirm `/products` (public) is unaffected by middleware while `/checkout` is gated.

#### Day 2 — Role-Based Middleware for Admin Routes

- **Objective:** Extend middleware to check role, not just presence of a session.
- **Tasks:**
  1. Decode the token's `role` claim (set during the `jwt` callback in Week 5) inside middleware.
  2. For `/admin/:path*`, redirect to `/` (or a `/403` page) if `role !== 'admin'`, even if signed in.
  3. Create `app/(admin)/layout.tsx` with a defense-in-depth server-side check too — even though middleware already blocked it, the layout re-verifies role in case middleware config ever changes.
- **Expected Output:** A signed-in customer visiting `/admin/dashboard` is redirected; an admin sees the dashboard.
- **Common Mistakes:** Relying on middleware alone and skipping the server-side check in the layout — a future refactor to the matcher could silently reopen the hole.
- **Best Practices:** Treat middleware as the first line of defense, not the only one — always re-check authorization in Server Components/Route Handlers/Express too.
- **Testing Checklist:** Manually edit the JWT payload in a test token to a fake role and confirm the *signature* check (not just field presence) rejects it.

#### Day 3 — Backend Hardening: Rate Limiting & Sanitization

- **Objective:** Add production security middleware to Express.
- **Tasks:**
  1. `npm i express-rate-limit express-mongo-sanitize hpp`.
  2. Global rate limiter (e.g., 100 req/15min per IP); a stricter limiter specifically on `/auth/login` and `/auth/register` (e.g., 5 req/15min) to blunt brute-force/credential-stuffing attempts.
  3. `express-mongo-sanitize` strips `$`/`.` operators from user input to prevent NoSQL injection (e.g., `{"email": {"$ne": null}}` login bypass attempts).
  4. `hpp` guards against HTTP parameter pollution.
- **Expected Output:** Rapid repeated login attempts get `429 Too Many Requests`; a crafted injection payload in the login body is sanitized and simply fails auth normally instead of bypassing it.
- **Common Mistakes:** Rate-limiting by a shared proxy IP without configuring `trust proxy` correctly behind a load balancer (locks out all users behind that proxy).
- **Best Practices:** Log rate-limit violations for later review — repeated triggers can indicate an attack in progress.
- **Testing Checklist:** A NoSQL injection attempt against `/auth/login` (`{"email":{"$gt":""},"password":{"$gt":""}}`) fails cleanly.

#### Day 4 — CORS, Helmet, and Cookie Security

- **Objective:** Lock down cross-origin and transport security settings for production readiness.
- **Tasks:**
  1. Configure `cors({ origin: [process.env.CLIENT_URL], credentials: true })` — never `origin: '*'` once cookies/credentials are involved.
  2. Review `helmet()` defaults; explicitly set `Content-Security-Policy` if serving any HTML directly from Express (not strictly needed for a pure JSON API, but good to understand).
  3. Ensure auth cookies (if using NextAuth's cookie session instead of pure JWT-in-header) are `httpOnly`, `secure` (in production), and `sameSite: 'lax'` or `'strict'`.
- **Expected Output:** A request from an unauthorized origin (tested via a quick script from a different local port) is blocked by CORS.
- **Common Mistakes:** Leaving `origin: '*'` with `credentials: true` — browsers actually reject this combination, but it signals a misconfigured security posture even where it "works."
- **Best Practices:** Maintain an explicit allow-list of origins per environment (dev/staging/prod) via env vars.
- **Testing Checklist:** `curl` with a forged `Origin` header confirms the request is rejected outside allowed origins (when tested via a real browser context).

#### Day 5 — Full Route-Protection Audit

- **Objective:** Systematically verify every route (frontend + backend) has correct protection.
- **Tasks:**
  1. Build a table in `docs/route-protection.md`: every frontend route and backend endpoint, its required auth state, and required role.
  2. Manually (or with a small script) test each entry: unauthenticated, wrong-role, correct-role.
  3. Fix any gaps found.
- **Expected Output:** A signed-off protection matrix with no gaps.
- **Testing Checklist:** Every row in the matrix has a passing manual test recorded.

**Week 6 Learning Outcomes:** Edge middleware for pre-render route protection; defense-in-depth authorization (middleware + layout + backend); core Express security hardening (rate limiting, sanitization, CORS, cookie flags) that any production API needs.


### WEEK 7 — Cart & Wishlist

**Weekly Objectives:** Build a persistent shopping cart (guest + logged-in) and a wishlist, with client state synced to the backend.

**Deliverables:** Adding/removing/updating cart items works for both guest sessions (localStorage-backed, client-only) and logged-in users (persisted server-side in MongoDB and merged on login); wishlist toggling from any product card.

**Technologies Covered:** Server Actions, Client Components with local state (Zustand), Mongoose subdocuments, cart-merge logic.

**Skills Learned:** Deciding what belongs in client vs. server state, merging anonymous and authenticated state on login, optimistic UI updates.

**Milestone:** A working, persistent cart and wishlist.

#### Day 1 — Cart Data Model & API

- **Objective:** Design the `Cart` schema and CRUD service.
- **Tasks:**
  1. `src/models/Cart.ts`: `{ user: ObjectId ref User (unique, sparse), items: [{ product: ObjectId ref Product, quantity, priceAtAdd }] }`.
  2. `cart.service.ts`: `getOrCreateCart(userId)`, `addItem`, `updateItemQuantity`, `removeItem`, `clearCart` — always re-fetch the product's *current* price/stock server-side rather than trusting the client's cached price.
  3. Routes: `GET/POST/PUT/DELETE /api/v1/cart` (all behind `auth.middleware`).
- **Why store `priceAtAdd`?** Useful for showing "price changed since you added this" UX, while the checkout step (Week 8) always recalculates the *actual* charge from the live product price.
- **Expected Output:** Adding an item twice increments quantity rather than duplicating the line item.
- **Common Mistakes:** Trusting a client-supplied `price` field when adding to cart — always derive price server-side from the product record.
- **Best Practices:** Validate stock availability at add-time and again at checkout (stock can change between the two moments).
- **Testing Checklist:** Adding an out-of-stock product returns a clear error instead of silently succeeding.

#### Day 2 — Guest Cart (Client-Only State)

- **Objective:** Support a cart for unauthenticated visitors.
- **Tasks:**
  1. `store/cartStore.ts` using Zustand with a `persist` middleware writing to `localStorage` (client-only; guest cart never touches the DB).
  2. `hooks/useCart.ts`: a unified interface that reads/writes to the Zustand store when signed out, and calls the backend API when signed in.
  3. `<CartDrawer>` Client Component showing items, quantity steppers, remove buttons, and subtotal.
- **Expected Output:** A signed-out visitor can add items to a slide-out cart drawer that persists across a page refresh.
- **Common Mistakes:** Trying to persist guest cart server-side without a user id — there's no reliable "anonymous user" identity without extra session-id machinery, so client-only storage is the simpler, correct choice here.
- **Best Practices:** Cap guest cart item count reasonably and validate against real stock/price only at the checkout boundary.
- **Testing Checklist:** Refreshing the page preserves the guest cart contents.

#### Day 3 — Cart Merge on Login

- **Objective:** Merge the guest cart into the server cart when a guest signs in.
- **Tasks:**
  1. On successful sign-in (a `useEffect` in a small client component listening to session state, or a NextAuth `events.signIn` callback), read the current localStorage cart.
  2. Call `POST /api/v1/cart/merge` with the guest items; the backend combines quantities for matching products into the user's server-side cart.
  3. Clear localStorage cart after a successful merge.
- **Expected Output:** Adding 2 items as a guest, then logging in, results in a server cart containing those 2 items (plus any pre-existing server cart items, summed).
- **Common Mistakes:** Merging on every render instead of only once right after sign-in — causes duplicate merges.
- **Best Practices:** Make the merge endpoint idempotent-safe (clamp quantities, dedupe by product id) in case of an accidental double call.
- **Testing Checklist:** Log in twice in a row (second time with an already-empty guest cart) and confirm no unwanted duplication occurs.

#### Day 4 — Wishlist

- **Objective:** Build wishlist toggle and page, following the same guest/auth pattern as cart (but simpler — no quantities).
- **Tasks:**
  1. `User.wishlist: [ObjectId ref Product]` (or a dedicated `Wishlist` collection if it needs its own metadata later).
  2. `POST/DELETE /api/v1/wishlist/:productId`, `GET /api/v1/wishlist`.
  3. Heart-icon toggle button on `<ProductCard>`, wired to a Server Action for logged-in users (see Day 5) that revalidates the wishlist page.
- **Expected Output:** Toggling the heart icon updates instantly (optimistic UI) and persists after refresh for logged-in users.
- **Testing Checklist:** Toggling twice quickly doesn't leave the product in a duplicated or inconsistent state (idempotent add/remove).

#### Day 5 — Server Actions for Mutations

- **Objective:** Replace some client-side `fetch` calls with Server Actions where appropriate.
- **Tasks:**
  1. `app/(shop)/wishlist/actions.ts`: `"use server"` function `toggleWishlist(productId)` that calls the Express API server-side (attaching the session token from `auth()`) and calls `revalidatePath('/wishlist')`.
  2. Wire the heart button (a small Client Component) to call this Server Action directly via a form `action` or `startTransition`.
  3. Compare this pattern against the guest cart's client-only Zustand approach and document in `docs/` when to use each: Server Actions for authenticated, server-of-record mutations with revalidation needs; client state for ephemeral/local-only data.
- **Expected Output:** Server Action mutation updates the wishlist and refreshes server-rendered content without a manual client refetch.
- **Common Mistakes:** Using a Server Action for something that's purely client-local (like guest cart) — adds unnecessary server round-trips for state that doesn't need to be authoritative server-side.
- **Best Practices:** Use `revalidatePath`/`revalidateTag` after a Server Action mutates data so subsequently rendered Server Components reflect the change.
- **Testing Checklist:** After toggling wishlist via the Server Action, navigating to `/wishlist` shows the updated list without a stale cache.

**Week 7 Learning Outcomes:** Server Actions as a first-class mutation mechanism with automatic revalidation; the client-state vs. server-state decision for cart/wishlist; a real-world guest-to-authenticated data merge pattern.

### WEEK 8 — Checkout & Payments (Stripe/Paystack)

**Weekly Objectives:** Build a secure checkout flow that creates a server-authoritative order, integrates a payment provider, and confirms payment via webhook — never via a client-reported "success" alone.

**Deliverables:** A customer can check out, pay via Stripe (or Paystack), and see an order confirmation only after the backend has verified payment through a webhook.

**Technologies Covered:** Stripe/Paystack SDKs, webhooks, Mongoose transactions, order state machine.

**Skills Learned:** Why payment confirmation must be server/webhook-driven, atomic stock-decrement + order-creation, idempotency in payment flows.

**Milestone:** A real, secure, end-to-end checkout.

#### Day 1 — Order Data Model & Checkout Page

- **Objective:** Design the `Order` schema and build the checkout UI shell.
- **Tasks:**
  1. `src/models/Order.ts`: `{ user, items: [{ product, name, price, quantity }], shippingAddress, subtotal, discount, total, status: 'pending'|'paid'|'shipped'|'delivered'|'cancelled', paymentProvider, paymentReference }`.
  2. `app/(shop)/checkout/page.tsx`: reads the current cart (server-side for logged-in users), renders shipping address form + order summary.
  3. Recompute the order total **server-side** from live product prices at the moment of order creation — never trust a total sent from the client.
- **Expected Output:** Checkout page shows an accurate summary matching the cart, with a "Place Order" button.
- **Common Mistakes:** Accepting a `total` field from the client request body and charging that amount — a classic e-commerce vulnerability.
- **Best Practices:** Treat the client as untrusted input for anything financial; only IDs and quantities should come from the client, prices always looked up server-side.
- **Testing Checklist:** Manually tamper a request to include a fake lower total and confirm the server ignores it and recalculates correctly.

#### Day 2 — Creating a Pending Order & Payment Intent

- **Objective:** Wire "Place Order" to create a `pending` order and initiate payment.
- **Tasks:**
  1. `POST /api/v1/orders`: validates cart isn't empty, re-checks stock for every item, creates an `Order` with `status: 'pending'` inside a Mongoose **transaction** alongside decrementing stock (both succeed or both roll back).
  2. `payment.service.ts`: `createPaymentIntent(order)` — calls Stripe's `paymentIntents.create({ amount: order.total * 100, currency, metadata: { orderId } })` (or Paystack's equivalent transaction-initialize call).
  3. Return the `clientSecret` (Stripe) or authorization URL (Paystack) to the frontend.
- **Internals:** A Mongoose transaction (`session.startTransaction()`) ensures you never decrement stock without a corresponding order, or vice versa — critical under concurrent checkouts for the same low-stock item.
- **Expected Output:** Placing an order creates a `pending` order in MongoDB and returns a valid client secret from Stripe's sandbox.
- **Common Mistakes:** Decrementing stock and creating the order as two separate, non-transactional writes — a crash between them corrupts data consistency.
- **Best Practices:** Use `findOneAndUpdate` with a stock `$gte: quantity` condition as an extra atomic guard against overselling under race conditions, in addition to the transaction.
- **Testing Checklist:** Simulate two near-simultaneous checkouts for the last unit of a product; confirm only one succeeds and the other gets a clear "out of stock" error.

#### Day 3 — Stripe Elements / Paystack Checkout on the Frontend

- **Objective:** Collect and confirm payment client-side.
- **Tasks:**
  1. `npm i @stripe/stripe-js @stripe/react-stripe-js` (client) — wrap the payment form in `<Elements stripe={stripePromise} options={{ clientSecret }}>`.
  2. Build `<CheckoutForm>` (Client Component) using `<PaymentElement>` and `stripe.confirmPayment()` on submit, redirecting to `/checkout/success?order_id=...` on completion.
  3. For Paystack: redirect to the hosted checkout URL returned in Day 2, with a callback URL back to your success page.
- **Expected Output:** Using Stripe's test card (`4242 4242 4242 4242`) completes payment in the sandbox and redirects to the success page.
- **Common Mistakes:** Marking the order as "paid" directly from the frontend redirect — the redirect only means the *browser* thinks it's done, not that the *money actually moved*; the webhook (Day 4) is the only trustworthy signal.
- **Best Practices:** Show a "processing your order" state on the success page until the backend confirms via webhook (poll or use a lightweight status endpoint).
- **Testing Checklist:** A failed test card (`4000 0000 0000 9995`, insufficient funds) surfaces a clear error and does not create a false "paid" state.

#### Day 4 — Webhook: The Source of Truth

- **Objective:** Implement the Stripe/Paystack webhook endpoint that actually marks orders as paid.
- **Tasks:**
  1. `POST /api/v1/webhooks/stripe` — **must** use the raw request body (not JSON-parsed) to verify the signature via `stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)`.
  2. On `payment_intent.succeeded`: look up the order via `metadata.orderId`, set `status: 'paid'`, trigger `email.service.ts` to send an order confirmation.
  3. Make the handler **idempotent**: if the order is already `paid`, ignore duplicate webhook deliveries (Stripe retries webhooks and can send the same event more than once).
  4. Use the Stripe CLI (`stripe listen --forward-to localhost:5000/api/v1/webhooks/stripe`) to test locally.
- **Internals:** Webhook signature verification proves the event genuinely came from Stripe/Paystack, not a forged request pretending payment succeeded.
- **Expected Output:** Completing a real (sandbox) payment triggers the webhook, which flips the order to `paid` and sends a confirmation email.
- **Common Mistakes:** Applying `express.json()` globally *before* the webhook route — this consumes the raw body needed for signature verification, breaking it. Mount the webhook route with `express.raw({ type: 'application/json' })` *before* the global JSON body parser, or exclude the webhook path from the global parser.
- **Best Practices:** Log every webhook event received (even ignored/duplicate ones) for auditability.
- **Testing Checklist:** Use the Stripe CLI to resend the same event twice and confirm the order isn't double-processed (e.g., double email sent).

#### Day 5 — Order Success Page & Coupon Application

- **Objective:** Build the success page and add basic coupon/discount support to checkout.
- **Tasks:**
  1. `app/(shop)/checkout/success/page.tsx`: polls `GET /api/v1/orders/:id` (or uses a short client-side polling interval) until `status === 'paid'`, then shows the confirmation with order number and items.
  2. `src/models/Coupon.ts`: `{ code, discountType: 'percentage'|'fixed', value, expiresAt, minOrderValue, usageLimit, usedCount }`.
  3. `POST /api/v1/coupons/validate`: checks expiry, usage limit, and min order value; checkout recalculates `total` server-side after applying a valid coupon (again — never trust a client-supplied discounted total).
- **Expected Output:** Applying a valid coupon code reduces the total correctly; an expired or invalid code shows a clear error; the success page reflects final "paid" status once the webhook fires.
- **Testing Checklist:** An expired coupon and a coupon below `minOrderValue` are both correctly rejected.

**Week 8 Learning Outcomes:** Why financial state must be verified server-side via webhooks, never trusted from the client; Mongoose transactions for consistency under concurrency; a real payment integration end-to-end, including idempotent webhook handling — one of the most important production patterns in any e-commerce system.


### WEEK 9 — Orders History & User Profile

**Weekly Objectives:** Build order history/detail pages, profile editing, and email notification touchpoints.

**Deliverables:** `/orders` lists a user's past orders with status; `/orders/[orderId]` shows full detail; profile page supports editing name/avatar and (for email-auth users) changing password.

**Technologies Covered:** Route Handlers for file uploads (avatar), Server Actions for profile updates, transactional email templates.

**Skills Learned:** Building account-management UX, handling file uploads safely, structuring transactional emails.

**Milestone:** A complete customer account experience.

#### Day 1 — Order History List

- **Objective:** Build `/orders`.
- **Tasks:**
  1. `GET /api/v1/orders?page=&limit=` — scoped to `req.user.id` only (a user must never be able to fetch another user's orders by guessing an ID).
  2. `app/(account)/orders/page.tsx` (Server Component): fetch and render a paginated list with status badges (pending/paid/shipped/delivered/cancelled).
- **Expected Output:** A logged-in user sees only their own orders, newest first.
- **Common Mistakes:** Implementing `GET /api/v1/orders/:id` without checking `order.user.equals(req.user.id)` (or admin role) — an IDOR (Insecure Direct Object Reference) vulnerability letting any user view any order by guessing/incrementing IDs.
- **Best Practices:** Apply the ownership check in the service layer so it can't be accidentally skipped by a future new route.
- **Testing Checklist:** Attempting to fetch another user's order ID directly returns `403`/`404`, not the order data.

#### Day 2 — Order Detail Page

- **Objective:** Build `/orders/[orderId]` with full item breakdown and status timeline.
- **Tasks:**
  1. `GET /api/v1/orders/:id` (ownership-checked as above), populated with product snapshots (name/price *as recorded on the order*, not re-fetched from the live product — prices can change after purchase, and order history must reflect what was actually paid).
  2. `<OrderStatusTimeline>` component visualizing pending → paid → shipped → delivered.
  3. `notFound()` for invalid/foreign order IDs.
- **Expected Output:** Order detail accurately reflects the price paid at time of purchase, even if the product's current price has since changed.
- **Common Mistakes:** Populating live product price into historical orders — breaks the historical accuracy of receipts.
- **Best Practices:** Store enough of a "snapshot" on the order (name, price, image URL) that it renders correctly even if the product is later deleted.
- **Testing Checklist:** Change a product's price after an order exists; confirm the old order still shows the original price.

#### Day 3 — Profile Editing & Avatar Upload

- **Objective:** Let users update their name and avatar.
- **Tasks:**
  1. Backend: `PUT /api/v1/users/me` (name, etc.) and `POST /api/v1/users/me/avatar` using `multer` (memory storage) validating file type/size, then uploading to a cloud storage bucket (e.g., Cloudinary or S3) — never store uploaded files directly on the API server's local disk in production (ephemeral filesystems on most hosts, plus scaling issues).
  2. Frontend: a profile form using a Server Action that calls the backend and revalidates the profile page.
- **Expected Output:** Uploading a JPEG/PNG under the size limit updates the visible avatar; oversized or wrong-type files are rejected with a clear message.
- **Common Mistakes:** Trusting the client-reported MIME type instead of validating the actual file signature/content server-side.
- **Best Practices:** Resize/optimize images on upload (or rely on the storage provider's transformation API) rather than storing full-resolution originals for avatars.
- **Testing Checklist:** Upload a renamed `.exe` file with a `.jpg` extension and confirm server-side validation rejects it.

#### Day 4 — Password Change & Account Security

- **Objective:** Support password change for email/password accounts.
- **Tasks:**
  1. `PUT /api/v1/users/me/password`: requires current password verification (bcrypt compare) before allowing a new one.
  2. For OAuth-only accounts (Google/GitHub), hide the password-change form entirely (there is no password to change) — check `user.provider`.
  3. Send a security notification email on password change ("your password was just changed — contact support if this wasn't you").
- **Expected Output:** Password change requires the correct current password; OAuth users never see a broken/irrelevant password form.
- **Common Mistakes:** Allowing password change without re-verifying the current password (lets a hijacked, still-logged-in session lock out the real owner permanently).
- **Best Practices:** Invalidate other active sessions/refresh tokens on password change.
- **Testing Checklist:** Wrong current password is rejected; correct one succeeds and a notification email is logged/sent (via a test email service like Mailtrap/Ethereal in dev).

#### Day 5 — Transactional Emails & Week Review

- **Objective:** Build a clean email templating setup and finish the account experience.
- **Tasks:**
  1. `email.service.ts` using `nodemailer` (dev: Ethereal/Mailtrap; prod: SendGrid/SES/Resend) with templates for: welcome, order confirmation, password changed, order shipped.
  2. Use a templating approach (React Email or simple HTML templates) kept in `server/src/templates/`.
  3. Full manual QA: register → order → view order history → edit profile → change password, verifying each email fires appropriately.
- **Expected Output:** All key account/order lifecycle emails render correctly and are triggered at the right moments.
- **Testing Checklist:** Each of the four email types is triggered and inspected (via Ethereal's preview URL) at least once.

**Week 9 Learning Outcomes:** Secure, ownership-checked account data access (avoiding IDOR); historical data snapshotting for financial records; safe file upload handling; a working transactional email pipeline.

### WEEK 10 — Admin Dashboard

**Weekly Objectives:** Build the admin-only dashboard: product/inventory management, order management, coupon management, and basic analytics.

**Deliverables:** Admins can create/edit/delete products, adjust stock, update order status, manage coupons, and view basic sales metrics — all gated by the RBAC/middleware built in Weeks 5–6.

**Technologies Covered:** Data tables, optimistic UI, MongoDB aggregation pipelines for analytics, bulk operations.

**Skills Learned:** Building internal admin tooling, writing aggregation pipelines for reporting, safe bulk-update patterns.

**Milestone:** A fully functional admin back-office.

#### Day 1 — Admin Layout & Product Management Table

- **Objective:** Build the admin shell and product list/CRUD UI.
- **Tasks:**
  1. `app/(admin)/layout.tsx`: sidebar (Dashboard/Products/Orders/Coupons), server-side role check (defense-in-depth alongside middleware from Week 6).
  2. `app/(admin)/products/page.tsx`: a data table (search, pagination, sort) with edit/delete actions; a modal/route for create/edit forms.
  3. Reuse the zod schemas from `shared/` for the admin product form so validation matches the backend exactly.
- **Expected Output:** An admin can view all products (including inactive/out-of-stock ones, unlike the public catalogue) and edit any field.
- **Common Mistakes:** Reusing the *public* product list endpoint (which might filter out inactive products) for the admin table instead of a dedicated admin endpoint that returns everything.
- **Best Practices:** Keep admin endpoints under a distinct `/api/v1/admin/*` prefix, all behind `requireRole('admin')`, for a clear security boundary.
- **Testing Checklist:** Deleting a product that has existing orders referencing it doesn't break order history (verify Week 9's snapshot approach holds).

#### Day 2 — Inventory Management

- **Objective:** Add stock-adjustment tooling and low-stock alerts.
- **Tasks:**
  1. `PATCH /api/v1/admin/products/:id/stock` — supports both absolute set and relative adjust (`{ delta: -5 }`) operations, logged to an `InventoryLog` collection for audit history.
  2. Dashboard widget/badge showing products below a configurable low-stock threshold.
  3. Bulk stock import via CSV upload (parse with a library like `csv-parse`, validate rows, report errors per row rather than failing the whole batch).
- **Expected Output:** Adjusting stock reflects immediately in the product list and is reflected in the audit log.
- **Common Mistakes:** A bulk import that fails entirely on one bad row instead of reporting which specific rows failed and why.
- **Best Practices:** Always log *who* changed stock and *when* for accountability.
- **Testing Checklist:** Importing a CSV with one intentionally malformed row still successfully imports the valid rows and reports the bad one clearly.

#### Day 3 — Order Management

- **Objective:** Let admins view all orders and update their status.
- **Tasks:**
  1. `GET /api/v1/admin/orders?status=&page=` — all orders, filterable by status.
  2. `PATCH /api/v1/admin/orders/:id/status` — enforce valid state transitions only (e.g., can't go from `pending` directly to `delivered`; must pass through `paid` → `shipped` → `delivered`), triggering a "shipped" email on that specific transition.
  3. Admin order detail view mirroring the customer one, plus an internal notes field.
- **Expected Output:** Updating an order to `shipped` sends the customer a shipping notification email automatically.
- **Common Mistakes:** Allowing arbitrary status transitions (e.g., accidentally marking a `pending` order `delivered`, skipping payment entirely) — enforce a state machine, not a free-text status field.
- **Best Practices:** Define the valid transition graph explicitly in code (a simple lookup object) rather than scattering `if` checks.
- **Testing Checklist:** Attempting an invalid transition (e.g., `pending` → `delivered`) is rejected with a clear error naming the allowed next states.

#### Day 4 — Coupon Management & Bulk Actions

- **Objective:** Full CRUD for coupons and bulk product actions.
- **Tasks:**
  1. `app/(admin)/coupons/page.tsx` + backend CRUD for `Coupon` (from Week 8), including toggling active/expired state manually.
  2. Bulk actions on the product table: select multiple rows → bulk activate/deactivate/delete, with a confirmation dialog.
  3. Guard destructive bulk actions with a double-confirmation UX pattern (type the count to confirm, or a two-step modal).
- **Expected Output:** Coupons can be created, edited, deactivated; bulk product actions apply correctly to only the selected rows.
- **Common Mistakes:** A bulk delete that silently also removes products currently referenced in *pending* orders — check for active order references first, or soft-delete (`isActive: false`) rather than hard-delete.
- **Best Practices:** Prefer soft-delete (`isActive`) for products over hard-delete, preserving historical/order integrity.
- **Testing Checklist:** Bulk-deactivating 5 selected products leaves all others untouched.

#### Day 5 — Analytics Dashboard & Week Review

- **Objective:** Build a basic sales analytics widget using MongoDB aggregation.
- **Tasks:**
  1. `GET /api/v1/admin/analytics/summary` — an aggregation pipeline computing: total revenue (sum of `paid`+ orders' totals), order count by status, top 5 best-selling products (via `$unwind` on order items, `$group` by product, `$sort`, `$limit`).
  2. `app/(admin)/dashboard/page.tsx`: cards for revenue/order counts, a simple bar/line chart (e.g., `recharts`) for revenue over the last 30 days (`$group` by day).
  3. Full regression pass across all admin features built this week.
- **Expected Output:** Dashboard shows accurate, real-time-computed metrics matching the seeded/test order data.
- **Common Mistakes:** Computing analytics by looping over documents in application code instead of using MongoDB's aggregation pipeline — far less efficient at any real scale.
- **Best Practices:** Add appropriate indexes (`status`, `createdAt`) to keep aggregation queries fast as order volume grows.
- **Testing Checklist:** Manually verify the "top 5 products" output against a hand-calculated expectation from the seed/test data.

**Week 10 Learning Outcomes:** Building secure, distinct admin tooling with its own API surface; enforceable state machines for order status; MongoDB aggregation pipelines for real reporting; safe bulk-operation UX patterns.


### WEEK 11 — Testing & Hardening

**Weekly Objectives:** Write unit, integration, and API tests for critical paths; run a security review; perform a performance pass.

**Deliverables:** A test suite covering auth, cart, checkout, and order-status transitions; a documented security review; measured and improved load times.

**Technologies Covered:** Jest/Vitest, Supertest, React Testing Library, Lighthouse, MongoDB Memory Server.

**Skills Learned:** Testing pyramids in practice, mocking external services (payment provider) in tests, performance auditing.

**Milestone:** A tested, hardened, production-candidate codebase.

#### Day 1 — Backend Unit Tests

- **Objective:** Unit-test service-layer logic in isolation.
- **Tasks:**
  1. `npm i -D jest ts-jest @types/jest mongodb-memory-server` in `server/`.
  2. Configure Jest to spin up an in-memory MongoDB instance (`mongodb-memory-server`) for tests — fast, isolated, no dependency on a real Atlas cluster during CI.
  3. Write unit tests for `product.service.ts` (pagination math, filtering logic), `cart.service.ts` (add/merge logic), and coupon validation logic.
- **Expected Output:** `npm test` runs green with clear per-function coverage of edge cases (empty cart, invalid coupon, zero-stock add attempt).
- **Common Mistakes:** Testing against the real Atlas dev database — slow, flaky, and risks polluting real data.
- **Best Practices:** Reset the in-memory DB between tests (`beforeEach`) to keep tests independent and order-agnostic.
- **Testing Checklist:** Running the suite twice in a row produces identical results (no test pollution).

#### Day 2 — Backend Integration/API Tests

- **Objective:** Test full HTTP request/response cycles with Supertest.
- **Tasks:**
  1. `npm i -D supertest`. Import the Express `app` (not `server.ts`, which calls `.listen`) directly into tests.
  2. Cover: registration → login → protected route access with token; `403` on wrong-role admin route access; full checkout flow with a **mocked** payment provider (never hit real Stripe/Paystack APIs in tests).
  3. Mock `payment.service.ts` calls (Jest `jest.mock`) so checkout tests run without network calls or real charges.
- **Expected Output:** A full "register → login → add to cart → checkout → webhook simulation → order status paid" integration test passes end-to-end against the in-memory DB.
- **Common Mistakes:** Accidentally calling the real Stripe API in CI (costs money/rate limits, and is non-deterministic).
- **Best Practices:** Keep integration tests focused on *your* code's behavior; the payment provider's own correctness is their responsibility, not yours to re-test.
- **Testing Checklist:** CI runs the full integration suite with zero real external network calls (verify via a network-blocking test config if needed).

#### Day 3 — Frontend Component & Interaction Tests

- **Objective:** Test critical Client Components with React Testing Library.
- **Tasks:**
  1. `npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom` in `client/`.
  2. Test `<AddToCartButton>` (click → cart count increments), `<FilterSidebar>` (selecting a filter updates the URL param), and the login form's validation error states.
  3. Mock `next/navigation`'s `useRouter`/`useSearchParams` as needed for components that read/write URL state.
- **Expected Output:** Component tests pass, covering both the happy path and at least one error/edge case per component.
- **Common Mistakes:** Testing implementation details (internal state) rather than user-visible behavior (what's rendered, what happens on click) — makes tests brittle to refactors.
- **Best Practices:** Query by role/text (`getByRole`, `getByText`) as a real user would, not by CSS class or test-only IDs unless necessary.
- **Testing Checklist:** Renaming an internal variable/prop that doesn't change visible behavior doesn't break any test.

#### Day 4 — Security Review Pass

- **Objective:** Systematically re-audit security across the app.
- **Tasks:**
  1. Re-verify the Week 6 route-protection matrix is still accurate after all features added since.
  2. Check for IDOR on every `:id`-based route (orders, wishlist, cart, reviews) — confirm ownership/role checks exist everywhere.
  3. Run `npm audit` (and address high/critical findings) on both `client` and `server`; check for any secrets accidentally committed (`git log -p` scan or a tool like `gitleaks`).
  4. Confirm all admin/mutating routes require auth, all financial calculations are server-derived, and webhook signatures are verified.
- **Expected Output:** A written security review document (`docs/security-review.md`) listing what was checked and any fixes made.
- **Common Mistakes:** Treating a security review as a one-time Week 1 task instead of revisiting it after every major feature (auth, payments, admin) is added.
- **Best Practices:** Keep a running checklist that gets re-run before every deployment, not just once.
- **Testing Checklist:** Every item in `docs/security-review.md` has a pass/fail result recorded, with fixes applied for any fails.

#### Day 5 — Performance Pass & Week Review

- **Objective:** Measure and improve load performance.
- **Tasks:**
  1. Run Lighthouse (or `next build && next start` + Chrome DevTools) against the home, product listing, and product detail pages; note Core Web Vitals (LCP, CLS, INP).
  2. Address obvious issues: unoptimized images, render-blocking scripts, missing `priority` on the hero/above-the-fold image, overly large client bundles (check with `@next/bundle-analyzer`).
  3. Add MongoDB indexes for any slow queries identified via `.explain()` on frequent queries (product listing filters, order lookups by user).
- **Expected Output:** Improved Lighthouse scores and a documented before/after for the top 3 pages.
- **Common Mistakes:** Optimizing without measuring first — always profile before changing code.
- **Best Practices:** Re-run Lighthouse after each change to confirm it actually helped rather than assuming.
- **Testing Checklist:** LCP under ~2.5s on the product listing page on a throttled "Fast 3G" profile, or a documented reason why not yet.

**Week 11 Learning Outcomes:** A real testing pyramid (unit → integration → component) with proper isolation and mocking; a repeatable security review process; performance profiling and targeted optimization grounded in Core Web Vitals.

### WEEK 12 — Deployment

**Weekly Objectives:** Deploy the frontend to Vercel, the backend to Render/Railway/VPS, finalize MongoDB Atlas for production, configure environment variables and monitoring, and run a final launch checklist.

**Deliverables:** A live, publicly accessible, working storefront with real (or sandbox) payments, monitored and backed up.

**Technologies Covered:** Vercel deployment, Render/Railway/VPS deployment, MongoDB Atlas production config, environment variable management, uptime/error monitoring.

**Skills Learned:** Production deployment workflows, environment parity, post-launch monitoring.

**Milestone:** A deployed, production-ready application.

#### Day 1 — MongoDB Atlas Production Configuration

- **Objective:** Prepare the production database.
- **Tasks:**
  1. Create a separate production Atlas cluster (or a separate production database within the same cluster) — never share the dev/test database with production.
  2. Restrict network access to only the backend host's IP (or Atlas's own "allow from Render/Railway" integration if available) instead of `0.0.0.0/0`.
  3. Enable Atlas's automated backups; create a dedicated production DB user with least-privilege access scoped to the production database only.
- **Expected Output:** A production connection string that only your deployed backend can reach.
- **Common Mistakes:** Reusing dev credentials/network rules in production.
- **Best Practices:** Store the production `MONGO_URI` only in the hosting platform's secret/environment variable manager — never in a file committed to the repo, even a private one.
- **Testing Checklist:** Attempting to connect to the production URI from a local machine (outside the allow-list) fails as expected.

#### Day 2 — Backend Deployment (Render/Railway/VPS)

- **Objective:** Deploy `server/` to a production host.
- **Tasks:**
  1. **Render/Railway path:** connect the GitHub repo, set the root directory to `server/`, build command `npm install && npm run build`, start command `npm start` (running compiled `dist/server.js`); configure all env vars (`MONGO_URI`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CLIENT_URL`, etc.) in the platform's dashboard.
  2. **VPS path (alternative):** provision a small VPS, install Node via `nvm`, use `pm2` to run the app as a managed process (`pm2 start dist/server.js --name storefront-api`), configure Nginx as a reverse proxy with a Let's Encrypt TLS certificate (`certbot`).
  3. Point the payment provider's webhook URL (Stripe dashboard/Paystack dashboard) to the new production endpoint (`https://api.yourdomain.com/api/v1/webhooks/stripe`) and update `STRIPE_WEBHOOK_SECRET` to the production signing secret.
- **Expected Output:** `https://api.yourdomain.com/api/v1/health` responds `200` from the public internet.
- **Common Mistakes:** Forgetting to update the webhook URL/secret for production — payments will appear to "hang" forever since the webhook never reaches the new server.
- **Best Practices:** Enable health-check-based auto-restart on the hosting platform (or a `pm2` watchdog on a VPS) so a crashed process recovers automatically.
- **Testing Checklist:** A full checkout with a real sandbox payment against the *production* backend succeeds and the order flips to `paid` via the production webhook.

#### Day 3 — Frontend Deployment (Vercel)

- **Objective:** Deploy `client/` to Vercel.
- **Tasks:**
  1. Import the repo into Vercel; set the project root to `client/` (Vercel auto-detects Next.js).
  2. Configure environment variables in the Vercel dashboard: `NEXT_PUBLIC_API_URL` (pointing to the production backend), `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, OAuth provider production client IDs/secrets, `STRIPE_PUBLISHABLE_KEY`.
  3. Update the Google/GitHub OAuth app dashboards with the production redirect URIs (`https://yourdomain.com/api/auth/callback/google`, etc.) alongside the existing dev ones.
- **Expected Output:** Visiting the production Vercel URL shows the live storefront, connected to the production API.
- **Common Mistakes:** Leaving `NEXTAUTH_URL` unset or pointing at `localhost` in production — breaks OAuth callback resolution.
- **Best Practices:** Use Vercel's preview deployments (automatic per-PR) to test changes before merging to the production branch.
- **Testing Checklist:** All three auth methods (Google, GitHub, email) work correctly against the production deployment.

#### Day 4 — Production Optimizations & Custom Domain

- **Objective:** Fine-tune for production and attach a custom domain.
- **Tasks:**
  1. Attach a custom domain in Vercel (frontend) and the backend host (or set up a subdomain like `api.yourdomain.com` via DNS `CNAME`/`A` record).
  2. Verify caching headers on static assets, confirm ISR revalidation windows are appropriate for real traffic patterns (Week 4), and confirm images are served through Next.js's optimization pipeline in production.
  3. Set up basic uptime monitoring (e.g., a free tier of UptimeRobot or Better Uptime) pinging the health-check endpoint, and error monitoring (e.g., Sentry) for both frontend and backend.
- **Expected Output:** The site is reachable at the custom domain over HTTPS with valid certificates; an alert fires (tested manually) if the backend goes down.
- **Common Mistakes:** No monitoring at all — the first sign of an outage becomes an angry customer email rather than an automated alert.
- **Best Practices:** Set up a status page or at least an internal alert channel (email/Slack webhook) before launch, not after the first incident.
- **Testing Checklist:** Manually stop the backend for a minute and confirm the uptime monitor fires an alert within its expected check interval.

#### Day 5 — Final Launch Checklist & Retrospective

- **Objective:** Run a final go/no-go checklist and reflect on the whole project.
- **Tasks:**
  1. Walk the full security checklist (Section 13 below) end-to-end against the live production deployment.
  2. Perform one complete real-world (or sandbox) purchase flow from a fresh browser profile: browse → search → add to cart → sign up → checkout → pay → receive confirmation email → view order in history.
  3. Write a short retrospective in `docs/retrospective.md`: what went well, what you'd do differently, and a prioritized backlog of "nice to have" features (e.g., product recommendations, multi-currency, subscriptions) for a future iteration.
- **Expected Output:** A signed-off, live, working e-commerce storefront and a documented list of next steps.
- **Testing Checklist:** Every item in Section 13's checklist is explicitly checked off against production, not just staging/dev.

**Week 12 Learning Outcomes:** End-to-end production deployment across two independently hosted services and a managed database; environment parity discipline; monitoring and incident-readiness basics; the habit of a pre-launch checklist and post-launch retrospective.


---

## 5. Next.js Concepts Deep Dive

This section is a standing reference for concepts used throughout the roadmap above.

### 5.1 App Router vs. Pages Router

The App Router (`src/app/`) is the current standard for new Next.js projects. It's built around React Server Components, file-based conventions (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`), and nested layouts. This guide uses the App Router exclusively.

### 5.2 Server Components (Default)

Every component under `app/` is a **Server Component** unless marked `"use client"`. They:
- Render on the server (or at build time), sending HTML (not JS) to the browser for that part of the tree.
- Can directly `await` data (database calls, `fetch`) without `useEffect`/loading state boilerplate.
- Cannot use hooks like `useState`/`useEffect`, or browser-only APIs, or event handlers (`onClick`).

**When to use:** data fetching, static content, SEO-critical content, anything without interactivity.

### 5.3 Client Components (`"use client"`)

Opt in by adding `"use client"` at the top of the file. They:
- Hydrate in the browser and support state, effects, and event handlers.
- Should be as small/leaf-level as possible — wrapping a whole page in `"use client"` forfeits Server Component benefits for that entire subtree.

**When to use:** forms, dropdowns, modals, anything with `onClick`/`onChange`, anything reading `localStorage` or browser APIs.

### 5.4 Server Actions

Functions marked `"use server"` (either at the top of a file or inline inside a Server Component) that can be called directly from the client — as a form `action`, or invoked programmatically — without manually building a Route Handler.

```tsx
// app/(shop)/wishlist/actions.ts
"use server";
import { revalidatePath } from "next/cache";

export async function toggleWishlist(productId: string) {
  // ...call backend, using the session server-side
  revalidatePath("/wishlist");
}
```

Server Actions are ideal for authenticated mutations that should trigger revalidation of server-rendered content, replacing a lot of "client fetch + manual refetch" boilerplate.

### 5.5 Dynamic Routing

Folders in brackets create dynamic segments: `app/products/[slug]/page.tsx` matches `/products/anything`. `params` (a Promise in Next.js 15+) provides the matched value: `const { slug } = await params;`.

### 5.6 Nested Layouts

Every folder can have its own `layout.tsx`, which wraps all pages within that folder (and its children) without affecting siblings outside it. Layouts persist across navigations within their scope — no re-mount, no re-fetch of layout-level data, which is why they're ideal for sidebars/navigation shells.

### 5.7 Metadata API

Static metadata: `export const metadata = { title: '...', description: '...' }`. Dynamic per-route metadata: `export async function generateMetadata({ params }) { ... return { title: product.name } }`. Next.js merges metadata from parent layouts down to the page, with page-level values taking precedence.

### 5.8 Route Handlers (API Routes)

`app/api/.../route.ts` files exporting `GET`, `POST`, etc. Used sparingly in this project (mainly for NextAuth's own auth routes) since core business logic lives in the separate Express API.

### 5.9 Image Optimization

`next/image` automatically serves resized, modern-format (WebP/AVIF) images, lazy-loads by default, and requires explicit dimensions (or a sized parent + `fill`) to prevent layout shift. Remote images (e.g., from Cloudinary/S3) require the domain to be allow-listed in `next.config.ts`'s `images.remotePatterns`.

### 5.10 SSG, ISR, and SSR — Choosing the Right Strategy

| Strategy | How | Best for |
|---|---|---|
| SSG | `generateStaticParams()`, no `revalidate` | Content that rarely changes (About page, policy pages) |
| ISR | `generateStaticParams()` + `export const revalidate = N` | Product pages: static speed, periodic freshness |
| SSR (dynamic) | Default behavior when a page reads request-specific data (cookies, `searchParams`, uncached `fetch`) | Cart, checkout, account pages, filtered search results |

### 5.11 Environment Variables

- `NEXT_PUBLIC_*` prefixed variables are inlined into the client bundle at build time — visible in the browser. Never put secrets here.
- Non-prefixed variables are server-only (usable in Server Components, Route Handlers, Server Actions) and never sent to the browser.

### 5.12 Middleware

See Section 9 for a full treatment. In short: `middleware.ts` runs on the Edge Runtime before a request reaches a route, ideal for auth-gate redirects, but cannot access a full Node.js runtime or a direct MongoDB connection.

### 5.13 Loading & Error UI

`loading.tsx` and `error.tsx` are automatically wired by Next.js into Suspense and error boundaries respectively for the route segment they live in — no manual `<Suspense>` JSX needed for the common case.

### 5.14 Caching & Revalidation

Next.js caches `fetch()` calls in Server Components by default (`force-cache` behavior) unless the request is inherently dynamic (uses cookies/headers) or you explicitly opt out with `{ cache: 'no-store' }`. `revalidatePath(path)` and `revalidateTag(tag)` (paired with `fetch(url, { next: { tags: [...] } })`) let Server Actions/Route Handlers invalidate specific cached data on demand.

---

## 6. Backend (Express.js) Concepts Deep Dive

### 6.1 Layered Architecture

```
Route → Controller → Service → Model
```

- **Routes** map HTTP verb + path to a controller function, and attach middleware (auth, validation).
- **Controllers** parse `req`, call the relevant service, and shape the HTTP response — no business logic here.
- **Services** contain the actual business/DB logic, are framework-agnostic, and are directly unit-testable.
- **Models** (Mongoose) define schema, validation, and hooks.

### 6.2 RESTful API Design

Resources are nouns (`/products`, `/orders`), verbs are HTTP methods (`GET`/`POST`/`PUT`/`PATCH`/`DELETE`). Nesting reflects ownership (`/orders/:id/items` if needed), and the API is versioned (`/api/v1`) so breaking changes don't require a new domain.

### 6.3 Middleware Pipeline

Express middleware runs in registration order: `helmet` → `cors` → body parsers → rate limiter → routes → 404 handler → centralized error handler (always last). Auth/role/validation middlewares are applied per-route, composed like `router.post('/', auth, requireRole('admin'), validate(schema), controller.create)`.

### 6.4 Error Handling

A custom `ApiError` class carries a `statusCode`; a single centralized error-handling middleware (4-argument signature: `(err, req, res, next)`) is the only place that formats error responses, keeping every route's error handling consistent and DRY via the shared `asyncHandler` wrapper that forwards thrown/rejected errors to `next()`.

### 6.5 Request Validation

Using `zod` schemas (shared with the frontend via the `shared/` package) parsed in a `validate(schema)` middleware ensures invalid requests never reach controller/business logic, with consistent, descriptive `400` responses.

### 6.6 Security Best Practices (Summary)

`helmet` for headers, `cors` scoped to known origins, `express-rate-limit` (especially on auth routes), `express-mongo-sanitize` against NoSQL injection, `hpp` against parameter pollution, bcrypt for passwords, short-lived JWTs + refresh tokens, and never trusting client-supplied prices/roles/user IDs.

### 6.7 Logging

A structured logger (Winston or pino) replacing raw `console.log`, with log levels (`info`, `warn`, `error`), and `morgan` piping HTTP access logs through it in a consistent format — essential for debugging production issues after the fact.

### 6.8 File Uploads

`multer` with memory storage (not disk storage, on most modern hosts) piping directly to cloud storage (Cloudinary/S3), with server-side MIME/size validation — never trust the client's declared content type alone.

### 6.9 Pagination, Filtering, Searching, Sorting

A consistent query-param contract across list endpoints: `?page=1&limit=12&sort=-createdAt&category=...&search=...`, translated into `.skip((page-1)*limit).limit(limit)`, dynamic `$match` conditions, and MongoDB text search (`$text`) or regex fallback, returning a consistent `{ items, total, page, pages }` envelope.

---

## 7. MongoDB & Mongoose Deep Dive

### 7.1 Schema Design for E-Commerce

Products, categories, users, orders, reviews, and coupons as outlined in Week 2/8 — designed around read patterns (product listing/detail are read far more often than written, so some denormalization like `ratingsAverage` on `Product` is intentional to avoid an aggregation on every page view).

### 7.2 Relationships: Reference vs. Embed

- **Reference (`ref` + `populate`)** — used for Product↔Category, Order↔User, Review↔Product/User: entities that exist and are queried independently.
- **Embed (subdocuments)** — used for Cart/Order line items: data that's always accessed together with its parent and doesn't need independent querying.

### 7.3 CRUD Operations

Standard Mongoose methods: `Model.create()`, `Model.find()`/`findOne()`/`findById()`, `Model.findByIdAndUpdate()`, `Model.findByIdAndDelete()` — always combined with `.select()` to exclude sensitive fields (like `passwordHash`) from query results by default (`select: false` in the schema).

### 7.4 Aggregation

The aggregation pipeline (`$match`, `$group`, `$unwind`, `$sort`, `$lookup`, `$limit`) powers reporting (Week 10's analytics) and complex queries that plain `find()` can't express efficiently, executing server-side inside MongoDB rather than in application memory.

### 7.5 Population

`.populate('category')` replaces an ObjectId reference with the referenced document at query time. Use `.select()` inside `populate()` to avoid over-fetching (`populate({ path: 'category', select: 'name slug' })`).

### 7.6 Indexing

Indexes on `slug` (unique), `category`, text indexes on `name`/`description`, and compound indexes (e.g., `Review`'s `{ product: 1, user: 1 }` unique index) are the single biggest lever for query performance as data grows — verified via `.explain('executionStats')`.

### 7.7 Transactions

Mongoose sessions (`mongoose.startSession()`, `session.startTransaction()`) ensure multi-document writes (stock decrement + order creation in Week 8) are atomic — both succeed or both roll back, critical for financial/inventory consistency. Requires a replica set (Atlas provides this by default even on the free tier).

### 7.8 Validation

Schema-level validation (`required`, `min`/`max`, custom validators) is the last line of defense inside the database layer, complementing (not replacing) the zod validation at the API boundary — defense in depth.

### 7.9 Performance Optimization

Lean queries (`.lean()`) for read-only data (skips Mongoose document overhead), projecting only needed fields (`.select()`), pagination on every list endpoint, and appropriate indexes are the core performance levers used throughout this project.

---

## 8. Authentication & Authorization

(Full implementation detail in Week 5.) Summary of the model used:

- **Providers:** Google OAuth, GitHub OAuth, and Credentials (email/password with bcrypt).
- **Session strategy:** JWT-based, so the same signed token's claims (`sub`, `role`) can be independently verified by the Express backend without a shared session store.
- **RBAC:** A `role` field (`customer` | `admin`) on the `User` model, checked via `requireRole('admin')` middleware on the backend and mirrored (for UX only, never for real security) in the frontend to hide/show admin UI.
- **Refresh tokens:** Short-lived access tokens (15 min) paired with longer-lived refresh tokens, rotated on use, enabling both security (limited blast radius if an access token leaks) and UX (users aren't logged out every 15 minutes).

---

## 9. Middleware Strategy (`middleware.ts`)

`client/src/middleware.ts` is the frontend's first line of defense, running on every request matching its `config.matcher` before any page renders:

```ts
export const config = {
  matcher: ["/checkout/:path*", "/admin/:path*", "/profile/:path*", "/orders/:path*"],
};

export async function middleware(request: NextRequest) {
  const session = await auth(); // Auth.js v5 edge-compatible session read
  const { pathname } = request.nextUrl;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && session.user.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}
```

This handles: redirecting unauthenticated users away from checkout/admin/profile/orders, and further restricting `/admin/*` to admin-role users. It is paired with (not a replacement for) server-side checks in layouts and the Express backend's own `auth`/`role` middleware, per the defense-in-depth principle from Week 6.

---

## 10. E-Commerce Feature Implementation

A consolidated feature-to-week map for quick reference:

| Feature | Primary Week(s) |
|---|---|
| Product catalogue, categories | 2, 4 |
| Search, filters, sorting | 4 |
| Product detail pages | 4 |
| Shopping cart | 7 |
| Wishlist | 7 |
| Checkout | 8 |
| Orders (customer view) | 9 |
| User profile | 9 |
| Admin dashboard | 10 |
| Product/inventory management | 10 |
| Coupon system | 8, 10 |
| Payment integration | 8 |
| Email notifications | 9 |

---

## 11. Testing Strategy

A three-layer pyramid: **unit tests** (service-layer logic, in-memory DB, fast and numerous), **integration/API tests** (Supertest against the real Express `app` with a mocked payment provider), and **component tests** (React Testing Library for critical interactive UI). Manual QA checklists (documented per-week above) cover full user journeys that automated tests don't yet reach. See Week 11 for the full implementation plan.

---

## 12. Deployment Guide

See Week 12 for the full step-by-step. Summary:

- **Frontend → Vercel:** auto-detected Next.js build, environment variables in the dashboard, custom domain + automatic HTTPS.
- **Backend → Render/Railway (recommended) or a VPS with pm2 + Nginx + Certbot:** compiled TypeScript run via `npm start`, environment variables set in the platform, health-check endpoint for auto-restart.
- **Database → MongoDB Atlas:** separate production cluster/database, IP allow-listing, automated backups, least-privilege DB user.
- **Payments:** production webhook URL and signing secret updated in the Stripe/Paystack dashboard; production API keys swapped in.

---

## 13. Production Security Checklist

- [ ] All secrets (`JWT_SECRET`, `MONGO_URI`, `STRIPE_SECRET_KEY`, OAuth secrets) live only in the hosting platform's environment variable manager, never in the repo.
- [ ] `cors` origin is an explicit allow-list, never `*`, wherever credentials are involved.
- [ ] All mutating and user-data-returning routes require valid authentication; admin routes additionally require `role === 'admin'`, enforced server-side (not just hidden in the UI).
- [ ] Every `:id`-based route checks resource ownership (or admin role) before returning data — no IDOR gaps.
- [ ] Passwords are hashed with bcrypt (never stored plaintext); password changes require re-verifying the current password.
- [ ] Rate limiting is applied globally and more strictly on `/auth/*` routes.
- [ ] `express-mongo-sanitize` and `hpp` are active on the backend.
- [ ] All financial totals (cart, checkout, coupons) are recalculated server-side from live/authoritative data — never trusted from the client.
- [ ] Payment confirmation is driven exclusively by verified, signature-checked webhooks — never by a client-side redirect alone.
- [ ] Webhook handlers are idempotent (safe against duplicate delivery).
- [ ] MongoDB Atlas network access is restricted (not `0.0.0.0/0`) in production, with a least-privilege database user.
- [ ] `npm audit` (or equivalent) has been run on both `client` and `server`, with high/critical issues addressed.
- [ ] No secrets appear anywhere in git history.
- [ ] Uptime and error monitoring are configured and verified to actually alert.
- [ ] The full route-protection matrix (Week 6) and this checklist have both been re-verified against the live production deployment, not just staging.

---

*End of guide. Treat each week as a milestone-driven sprint — validate the "Expected Output" and "Testing Checklist" items before moving on, since later weeks (especially Checkout in Week 8 and Admin in Week 10) build directly on the data models and auth guarantees established earlier.*
