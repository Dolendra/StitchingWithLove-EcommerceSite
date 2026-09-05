# Stitching With Love — Made-to-Measure Fashion Ecommerce

**v1.0** full-stack platform for a bespoke tailoring business: design selection, personalized measurements, customization, Stripe checkout, production tracking, fittings, alterations, wishlist, reorder, and reviews.

> Feature scope is **frozen** after local QA. Next milestones are deploy → production smoke → demo/interview prep.

---

## Positioning

A made-to-measure fashion ecommerce platform that manages the complete customer journey:

**Discover → Customize → Measure → Pay → Produce → Fit / Alter → Review → Reorder**

---

## Retention loop

```text
Saved measurements
        ↓
Wishlist
        ↓
Reorder
        ↓
Customization + notes
        ↓
Order tracking
        ↓
Alterations
        ↓
Reviews
        ↓
Return
```

---

## Tech stack

| Layer | Stack |
|-------|--------|
| Frontend | React 19, Vite 7, React Router 7, Tailwind CSS 4, Framer Motion, Axios |
| Backend | Express 5, Mongoose 8, JWT + bcrypt |
| Database | MongoDB |
| Payments | Stripe Checkout (INR) |
| Deploy target | Frontend → Vercel · Backend → Render · DB → Atlas |

---

## Repository layout

```text
tailoring-web/
├── README.md
├── DEPLOYMENT.md
├── frontend/                 # React SPA (Vite)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   ├── config/brand.js
│   │   ├── context/          # Auth, Cart, Toast
│   │   ├── pages/
│   │   └── services/api.js
│   ├── env.example
│   └── vercel.json
└── server/                   # Express API
    ├── server.js
    ├── models/
    ├── routes/
    ├── controllers/
    ├── services/             # orderPricing, notify
    ├── scripts/seedDemo.js
    ├── env.example
    └── render.yaml
```

There is **no root `package.json`**. Install and run `frontend/` and `server/` separately.

---

## Features (v1.0)

### Customer
- Shop with category / search / sort
- Product detail: standard size **or** custom measurements
- Measurement profiles (wizard, inches/cm, validation, edit/duplicate)
- Customization + tailor notes
- Server-backed cart (size, customization, measurement **snapshot**)
- Stripe checkout with measurement confirmation step
- Order list + detail with visual production timeline
- Fitting options (studio / delivery / alteration)
- Alteration requests
- Wishlist, reorder, reviews
- Appointments with date/slot booking
- In-app notification bell
- Account dashboard

### Admin
- Overview stats
- Production kanban
- Order status updates (customer-facing notes + optional internal notes)
- Alterations queue
- Product create/list
- Appointment management

### Production hardening
- Server-side pricing (never trusts client totals)
- Order references like `SWL-2026-000001`
- Idempotent payment confirmation (refresh-safe)
- Cart cleared only after successful payment
- Payment cancel keeps cart for retry
- Measurement snapshots immutable vs live profiles
- Cancel rules enforced on API
- Stock checks + decrement on paid confirm
- Customer APIs hide internal tracking notes

---

## Local development

### 1. Install

```bash
cd server && npm install
cd ../frontend && npm install
```

### 2. Environment

**`server/.env`** (from `server/env.example`):

| Variable | Purpose |
|----------|---------|
| `PORT` | Default `5000` |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `FRONTEND_BASE_URL` | e.g. `http://localhost:5173` |
| `NODE_ENV` | `development` / `production` |

**`frontend/.env.local`** (recommended for local):

```env
VITE_API_BASE_URL=/api
```

Vite proxies `/api` → `http://localhost:5000`. For production, set this to your Render URL ending in `/api`.

### 3. Run (two terminals)

```bash
# Terminal A
cd server && npm run dev

# Terminal B
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### 4. Seed demo data

```bash
cd server
node scripts/seedDemo.js
```

| Role | Email | Password |
|------|-------|----------|
| Customer | `demo@stitchingwithlove.in` | `Demo1234!` |
| Admin | `admin@stitchingwithlove.in` | `Admin1234!` |

Demo seed includes products, a measurement profile, wishlist, an active stitching order, and a delivered order.

---

## Main routes

| Path | Description |
|------|-------------|
| `/` | Conversion homepage |
| `/products`, `/products/:id` | Shop + product detail |
| `/custom` | Custom tailoring landing |
| `/measurements` | Measurement profiles |
| `/cart`, `/checkout` | Bag + multi-step checkout |
| `/orders`, `/orders/:id` | Orders + timeline |
| `/wishlist` | Saved designs |
| `/book` | Appointments |
| `/account` | Customer dashboard |
| `/admin` | Admin operations |
| `/tryon` | Style preview (Fabric.js overlay — not AI try-on) |

---

## API overview

Base: **`/api`**

| Area | Endpoints |
|------|-----------|
| Auth | `/auth/register`, `/auth/login`, `/auth/profile` |
| Products | `GET/POST/PUT/DELETE /products` |
| Cart | `GET /cart`, `POST /cart/add`, `PUT /cart/update`, `DELETE /cart` |
| Payments | `POST /payments/create-session`, `GET /payments/confirm`, `POST /payments/cancel-pending` |
| Orders | `/orders/my`, `/orders/:id`, `/orders/:id/track`, `/orders/:id/cancel`, fitting + alteration |
| Measurements | `/measurements` CRUD + fields + duplicate |
| Appointments | create, slots, `/my`, admin list/status |
| Wishlist | `GET /wishlist`, `POST /wishlist/toggle` |
| Notifications | list, mark read |
| Reviews | `GET /reviews/product/:id`, `POST /reviews` |
| Health | `GET /api/health` |

---

## Payments (Stripe)

1. `POST /payments/create-session` — server prices items, creates **pending** order + Stripe session  
2. Customer pays on Stripe  
3. Redirect to `/payment/success` → `GET /payments/confirm` marks **paid** (idempotent)  
4. Cart cleared; stock decremented for ready-made items  
5. Cancel → `/payment/cancel` — pending order cancelled; **cart remains** for retry  

Order IDs shown to customers: **`SWL-YYYY-NNNNNN`**.

---

## Deployment

Split hosting:

- **Frontend** → Vercel (`frontend/`, build `npm run build`, output `dist`)
- **Backend** → Render (`server/`, start `npm start`)
- **Database** → MongoDB Atlas

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the full checklist.

After deploy, set:

- Frontend `VITE_API_BASE_URL` → `https://<your-render>.onrender.com/api`
- Backend `FRONTEND_BASE_URL` → your Vercel URL
- Backend CORS / allowed origins to match the Vercel domain
- Stripe keys (test locally, live in production)
- Atlas network access for Render

Then run production smoke:

1. Stripe success / cancel / refresh  
2. Admin status → customer notification → timeline  
3. Payment → navigate → browser Back (no duplicate order)

---

## Background jobs

Every 5 minutes, pending unpaid orders older than 30 minutes are auto-cancelled (`server/server.js`).

---

## Scripts

**Server**

| Command | Action |
|---------|--------|
| `npm run dev` | Nodemon |
| `npm start` | Production |
| `node scripts/seedDemo.js` | Seed demo + admin |

**Frontend**

| Command | Action |
|---------|--------|
| `npm run dev` | Vite |
| `npm run build` | Production build |
| `npm run preview` | Preview build |

---

## Interview / portfolio story

```text
React + Vite UI
      ↓
Express REST API + JWT
      ↓
MongoDB / Mongoose
      ↓
Server-side pricing + Stripe
      ↓
Measurement profiles + snapshots
      ↓
Customization + tailor notes
      ↓
Production workflow + notifications
      ↓
Fittings / alterations
      ↓
Wishlist · reorder · reviews
```

**Style Preview** (`/tryon`) is a Fabric.js image overlay for inspiration — not computer-vision virtual try-on.

---

## Troubleshooting

| Symptom | Check |
|---------|--------|
| CORS errors | Use `/api` + Vite proxy locally; set production origin on the API |
| Payment 503 | `STRIPE_SECRET_KEY` missing |
| Mongo errors | `MONGO_URI`, Atlas IP allowlist |
| Empty shop | Run `seedDemo.js` or create products as admin |
| Redirected to login | JWT expired (7 days) or missing token |

---

## License

No root LICENSE file yet — add one if you open-source the project.

---

**v1.0 summary:** Install both apps, configure env, seed demo accounts, run Express `:5000` + Vite `:5173`, complete the measurement → checkout → tracking loop. Deploy with Vercel + Render when production smoke is ready.
