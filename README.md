# Tailoring Web — Stitching with Love

A full-stack web application for a tailoring and alterations business. It combines a **marketing site** (about, services, portfolio, contact), **appointment booking**, an **online shop** (catalog, cart, checkout), **user accounts**, an **admin area** for orders and appointments, and a **virtual try-on** canvas powered by Fabric.js.

If you have never seen this codebase before, read this document top to bottom once; it explains what each part does and how to run everything locally or in production.

---

## Table of contents

1. [What this project does](#what-this-project-does)
2. [High-level architecture](#high-level-architecture)
3. [Repository layout](#repository-layout)
4. [Technology stack](#technology-stack)
5. [Prerequisites](#prerequisites)
6. [Local development](#local-development)
7. [Environment variables](#environment-variables)
8. [How the app fits together](#how-the-app-fits-together)
9. [Backend API overview](#backend-api-overview)
10. [Payments (Stripe)](#payments-stripe)
11. [User roles and admin](#user-roles-and-admin)
12. [Background jobs](#background-jobs)
13. [Deployment](#deployment)
14. [Troubleshooting](#troubleshooting)
15. [Optional / legacy notes](#optional--legacy-notes)

---

## What this project does

| Area | Description |
|------|-------------|
| **Public pages** | Home, About, Portfolio, Services, Contact — typical business presence. |
| **Shop** | Browse products (`/products`), add to cart, go to checkout. Products are stored in MongoDB and managed by admins. |
| **Cart** | Server-backed cart per logged-in user (not guest checkout in code as written). |
| **Checkout** | Uses **Stripe Checkout** (redirect). Creates a provisional order, then confirms payment on return. |
| **Orders** | Users see paid orders; admins see all orders and can update delivery-style status and notes. |
| **Auth** | Register, login, JWT stored in the browser; profile endpoint for the current user. |
| **Appointments** | Logged-in users submit booking requests; admins list them and set status (`pending` / `confirmed`). |
| **Try-on** | `/tryon` — upload a person image and garment image on an HTML canvas (Fabric.js) for a simple visual preview (client-side only). |
| **Dashboards** | `/admin` for admins; `/user` for regular users (UI routes exist alongside `/orders`). |

---

## High-level architecture

```text
┌─────────────────┐     HTTPS / REST      ┌─────────────────┐
│  React (Vite)   │ ◄──────────────────► │  Express API     │
│  frontend/      │   JSON + JWT        │  server/         │
└────────┬────────┘                     └────────┬─────────┘
         │                                       │
         │  Vite dev: /api proxied to            │  Mongoose
         │  http://localhost:5000                ▼
         │                               ┌───────────────┐
         └──────────────────────────────►│  MongoDB      │
                                         └───────────────┘
```

- **Frontend** (`frontend/`): React 19, React Router, Tailwind CSS 4, Axios, Framer Motion, Fabric.js.
- **Backend** (`server/`): Express 5, MongoDB via Mongoose, JWT auth, Stripe for payments.
- **Database**: MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas)).

---

## Repository layout

```text
tailoring-web/
├── README.md                 ← This file (project overview)
├── DEPLOYMENT.md             ← Step-by-step Vercel + Render + Atlas + Stripe
├── frontend/                 ← React SPA (Vite)
│   ├── src/
│   │   ├── App.jsx           ← All routes
│   │   ├── components/     ← Navbar, Footer, cards, TryOnCanvas, etc.
│   │   ├── context/         ← AuthContext, CartContext
│   │   ├── pages/           ← One file per screen
│   │   ├── services/
│   │   │   └── api.js       ← Axios client + API helpers
│   │   └── index.css
│   ├── env.example          ← Copy to .env.local for Vite vars
│   ├── vite.config.js       ← Dev server + /api → localhost:5000 proxy
│   └── vercel.json          ← SPA rewrites for Vercel
└── server/                   ← REST API
    ├── server.js            ← App entry: CORS, routes, optional static SPA
    ├── config/
    │   └── db.js            ← Mongo connection
    ├── controllers/         ← Route logic
    ├── middleware/          ← JWT (protect), admin guard, errors
    ├── models/              ← User, Product, Cart, Order, Appointment
    ├── routes/              ← Mounted under /api/...
    ├── utils/               ← Stripe (and Razorpay helper — see legacy note)
    ├── env.example          ← Copy to .env
    └── render.yaml          ← Example Render service definition
```

There is **no root `package.json`**; install and run **each** of `frontend/` and `server/` separately.

---

## Technology stack

| Layer | Choices |
|-------|---------|
| UI | React 19, Vite 7, Tailwind CSS 4, Radix icons, Lucide, Framer Motion |
| Routing | React Router 7 |
| HTTP | Axios (`frontend/src/services/api.js`) |
| API | Express 5, `express-async-handler`, CORS, `body-parser` / `express.json` |
| Data | Mongoose 8, MongoDB |
| Auth | `bcryptjs`, `jsonwebtoken` (Bearer token) |
| Payments | **Stripe** Checkout (live keys expected in production per `DEPLOYMENT.md`) |

---

## Prerequisites

- **Node.js** (LTS recommended, e.g. 20.x)
- **npm** (comes with Node)
- **MongoDB** — local instance or Atlas connection string

---

## Local development

### 1. Clone and install

```bash
cd tailoring-web

# Backend dependencies
cd server
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 2. Configure environment

- **Server**: copy `server/env.example` to `server/.env` and set at least `MONGO_URI` and `JWT_SECRET`. For checkout to work, add Stripe keys and `FRONTEND_BASE_URL` (see [Environment variables](#environment-variables)).
- **Frontend**: copy `frontend/env.example` to `frontend/.env.local`. For local dev you can **omit** `VITE_API_BASE_URL` so the app uses the default `/api` base URL (recommended with the Vite proxy).

### 3. Run MongoDB

Point `MONGO_URI` at your database (e.g. `mongodb://127.0.0.1:27017/tailoring_web` for a local default).

### 4. Start backend and frontend (two terminals)

**Terminal A — API (port 5000 by default)**

```bash
cd server
npm run dev
```

Uses `nodemon` to restart on file changes (`server/package.json`).

**Terminal B — Vite dev server (port 5173)**

```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

The Vite config proxies `/api` to `http://localhost:5000`, so the browser talks to the same origin for API calls when `VITE_API_BASE_URL` is unset — **no CORS configuration needed for that setup**.

> **Note:** If you set `VITE_API_BASE_URL` to `http://localhost:5000/api` (full URL), the browser will call the API on a different origin. The production `server.js` CORS list is tuned for the deployed frontend URL; for that hybrid setup you would need to add `http://localhost:5173` to the server’s CORS `origin` configuration. Prefer the proxy + relative `/api` for local work.

---

## Environment variables

### Backend (`server/.env`)

| Variable | Purpose |
|----------|---------|
| `PORT` | HTTP port (default `5000`) |
| `NODE_ENV` | `development` or `production` |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs (use a long random string in production) |
| `STRIPE_SECRET_KEY` | Stripe secret key — required for `/api/payments/*` |
| `FRONTEND_BASE_URL` | Used in Stripe success/cancel URLs (e.g. `http://localhost:5173` locally) |
| `SERVE_FRONTEND` | Set to `true` with `NODE_ENV=production` only if you build the SPA into `frontend/dist` next to the server and want Express to serve static files (optional combined hosting) |

Optional (see [Optional / legacy notes](#optional--legacy-notes)):

| Variable | Purpose |
|----------|---------|
| `RAZORPAY_KEY_ID` | Razorpay (not wired to current checkout UI) |
| `RAZORPAY_KEY_SECRET` | Razorpay |

### Frontend (`frontend/.env.local`)

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | Base URL for API calls, **must include `/api` suffix** if set, e.g. `https://your-backend.onrender.com/api`. If unset, defaults to `/api` (ideal for local dev with Vite proxy). |

Vite only exposes variables prefixed with `VITE_`.

---

## How the app fits together

1. **Authentication** — On login/register, the API returns a JWT. The frontend stores it (e.g. `localStorage`) and Axios attaches `Authorization: Bearer <token>` (`api.js`). A `401` response clears auth and sends the user to `/login`.

2. **Cart** — Cart is persisted per user on the server (`Cart` model). Adding or updating quantities requires a logged-in session.

3. **Checkout** — `Checkout.jsx` calls `POST /api/payments/create-session` with line items and shipping-style fields. The server creates a **pending** `Order` and a Stripe Checkout Session, then returns `url` for redirect.

4. **After payment** — Stripe redirects to `/payment/success?orderId=...&session_id=...`. The page calls `GET /api/payments/confirm` to verify the session and mark the order **paid**, then clears the cart client-side and routes to `/orders`.

5. **Orders list** — `GET /api/orders/my` returns orders with `paymentStatus: 'paid'` for the current user.

---

## Backend API overview

Base path: **`/api`** (e.g. `GET /api/products`).

| Prefix | Auth | Purpose |
|--------|------|---------|
| `GET /` | No | Health-style message (`Backend Running`) on server root, not under `/api`. |
| `/api/auth/register` | No | Create user, return JWT + user payload |
| `/api/auth/login` | No | Login, return JWT |
| `/api/auth/profile` | Yes | Current user document |
| `/api/products` | No for GET | List / get by id |
| `/api/products` POST/PUT/DELETE | Admin | Create / update / delete products |
| `/api/cart` | Yes | Get cart |
| `/api/cart/add`, `/api/cart/update` | Yes | Mutate cart |
| `/api/orders/my` | Yes | Current user’s paid orders |
| `/api/orders` | Admin | All orders |
| `/api/orders/:id/track` | Admin | Update `orderStatus` + tracking note |
| `/api/orders/:id/cancel` | Yes (owner) | Mark order cancelled |
| `/api/appointments` POST | Yes | Create appointment request |
| `/api/appointments/admin/list` | Admin | List appointments |
| `/api/appointments/:id/status` | Admin | Set appointment status |
| `/api/payments/create-session` | Yes | Stripe Checkout + pending order |
| `/api/payments/confirm` | Yes | Confirm Stripe session, set order paid |

Exact request/response shapes are defined in `server/controllers/` and `server/routes/`.

---

## Payments (Stripe)

- Currency in Stripe session creation is **INR** (Indian Rupees) in code — align your Stripe account and product pricing with that.
- You need `STRIPE_SECRET_KEY` and `FRONTEND_BASE_URL` set correctly so redirects return to your app.
- For production keys and webhooks (if you add them later), follow your Stripe dashboard documentation; the current flow relies on session retrieval in `/confirm` after redirect.

---

## User roles and admin

- Users have `role`: **`user`** (default) or **`admin`** (`server/models/User.js`).
- New registrations are always **`user`**. To make an admin, update that user’s `role` to `admin` directly in MongoDB (or via a one-off script — there is no public “promote to admin” API).
- Admin-only routes use `protect` + `admin` middleware (`server/middleware/authMiddleware.js`).

---

## Background jobs

- **Pending order cleanup** — `server/server.js` runs an interval (every 5 minutes) that sets `paymentStatus` to `cancelled` for **pending** orders older than **30 minutes** (Stripe sessions abandoned or never completed). This keeps the database tidy.

---

## Deployment

The project is set up for a common split:

- **Frontend**: Vercel (root directory `frontend`, output `dist`).
- **Backend**: Render (root directory `server`), with env vars for MongoDB, JWT, Stripe, and frontend URL.

Follow the detailed checklist in **[DEPLOYMENT.md](./DEPLOYMENT.md)** (build commands, CORS, Atlas IP allowlist, Stripe live vs test).

**Important:** In `server/server.js`, the CORS `origin` is set to a specific production frontend URL. After you deploy your own site, **update that origin** to your real Vercel (or other) URL, or local development will not be able to call the API from a different deployed domain.

---

## Troubleshooting

| Symptom | What to check |
|---------|----------------|
| API calls fail in browser with CORS | Frontend origin must match server CORS config, or use Vite `/api` proxy locally without a full cross-origin API URL. |
| `503` on payment | `STRIPE_SECRET_KEY` missing or invalid (`server/utils/stripe.js`). |
| Mongo errors | `MONGO_URI`, network, Atlas IP allowlist (`0.0.0.0/0` for managed hosts like Render). |
| Always redirected to login | Token expired or invalid; JWT default expiry is **7 days** in `authController.js`. |
| Empty products | Seed or create products via an **admin** account and `POST /api/products`. |

---

## Optional / legacy notes

- **Razorpay** — The server includes Razorpay utilities and controller logic (`server/utils/razorpay.js`, parts of `orderController.js`), but the **current checkout page uses Stripe only**. The `orderRoutes.js` file does not register Razorpay payment routes; treat Razorpay as optional / future use unless you wire it back in.
- **Frontend `package.json` scripts** — Entries like `dev:server` / `dev:all` reference a non-existent `server/index.js` inside `frontend/`. Use the real **`server/`** app with `npm run dev` or `npm start` from `server/` instead.
- **Combined hosting** — If `NODE_ENV=production` and `SERVE_FRONTEND=true`, Express can serve `frontend/dist`. Most teams still deploy the SPA separately (e.g. Vercel) as documented.

---

## Scripts reference

**`server/package.json`**

| Script | Command |
|--------|---------|
| `npm start` | `node server.js` |
| `npm run dev` | `nodemon server.js` |

**`frontend/package.json`**

| Script | Command |
|--------|---------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | ESLint |

---

## Contributing and license

This repository does not include a root LICENSE file in the tree that was scanned. Add one if you open-source the project.

For code style, match existing patterns: ES modules (`"type": "module"`), async route handlers, and the same naming as surrounding files.

---

**Summary:** Install `server` and `frontend`, configure `.env` / `.env.local`, run MongoDB, start Express on port 5000 and Vite on 5173, create an admin user in the database if you need product and order management, and use Stripe for checkout. Use **[DEPLOYMENT.md](./DEPLOYMENT.md)** when going to production.
