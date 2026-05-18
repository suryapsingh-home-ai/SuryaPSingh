# Shopping Demo — Project Plan & Tracker

## Architecture

```
browser (Vue  :5173)  ─┐
                        ├──► Django API :8000 ──► SQLite (dev) / PostgreSQL (prod)
browser (React :5174) ─┘         │
                                  └──► Stripe Checkout (hosted)
                                  └◄── Stripe Webhook  POST /api/webhooks/stripe/
```

Both frontends run **simultaneously**. They share a single backend. CORS is
already configured to allow both origins (:5173 and :5174).

---

## Port Map

| Process               | Port |
|-----------------------|------|
| Django API            | 8000 |
| Vue dev server        | 5173 |
| React dev server      | 5174 |
| PostgreSQL (Docker)   | 5432 |

---

## Milestones & Task Tracker

Legend: `[x]` done · `[ ]` pending · `[~]` in progress

---

### M1 — Project foundation
- [x] Monorepo layout: `backend/`, `frontend-vue/`, `frontend-react/`
- [x] Django project (`config/`) + `shop` app
- [x] `requirements.txt` and Python venv (`.venv/`)
- [x] `backend/.env.example`
- [x] `docker-compose.yml` for local PostgreSQL
- [x] `.gitignore`
- [x] `README.md`

---

### M2 — Django data models + migrations
- [x] `Product` (id UUID, name, slug, description, price, image_url, stock, is_active)
- [x] `Order` (id UUID, customer_email, status, total, stripe_checkout_session_id)
- [x] `OrderItem` (FK order, FK product, quantity, unit_price)
- [x] Initial migration applied (`shop/migrations/0001_initial.py`)
- [x] Django admin registered for all three models (inline OrderItems)
- [x] `seed_demo` management command — seeds 3 demo products

---

### M3 — REST API endpoints
- [x] `GET  /api/health/`
- [x] `GET  /api/products/`                         active + in-stock
- [x] `GET  /api/products/<slug>/`                  product detail
- [x] `POST /api/checkout/`                         creates Order + Stripe Session → `checkout_url`
- [x] `GET  /api/orders/status/?session_id=…`       order lookup by Stripe session
- [x] `GET  /api/orders/status/?order_id=…`         order lookup by UUID
- [x] `POST /api/webhooks/stripe/`                  webhook: mark paid + decrement stock
- [x] CORS for :5173 and :5174 (both frontends)

---

### M4 — Vue 3 frontend (port 5173)
- [x] Vite 2.9 scaffold (Node 14 compatible)
- [x] Product catalog grid with product images
- [x] Add-to-cart + quantity increment/decrement
- [x] Cart sidebar with email field and running total
- [x] "Pay with card (Stripe)" → redirect to Stripe Checkout
- [x] `#/success` page reads `session_id` from URL hash, shows order status
- [x] `frontend-vue/.env.example` (`VITE_API_URL`)
- [x] Production build verified (`npm run build`)

---

### M5 — React 18 frontend (port 5174)
- [x] Vite 2.9 scaffold (Node 14 compatible)
- [x] Same feature set as Vue — identical API calls
- [x] Distinct purple accent colour (blue in Vue) for easy side-by-side demo
- [x] `frontend-react/.env.example` (`VITE_API_URL`)
- [x] Production build verified (`npm run build`)

---

### M6 — End-to-end verification  `[IN PROGRESS]`
- [x] Run all three processes simultaneously (no port conflicts)
      Django :8000 ✓  Vue :5173 ✓  React :5174 ✓
- [x] `GET /api/health/` → `{"status":"ok"}` ✓
- [x] `GET /api/products/` returns 3 seeded products ✓
- [x] `GET /api/products/canvas-tote/` product detail ✓
- [x] CORS `access-control-allow-origin: http://localhost:5173` for Vue ✓
- [x] CORS `access-control-allow-origin: http://localhost:5174` for React ✓
- [x] `POST /api/checkout/` without key → 503 "Stripe is not configured" ✓
- [x] `GET /api/orders/status/?session_id=fake` → 404 "Order not found" ✓
- [ ] Add STRIPE_SECRET_KEY to backend/.env and restart Django
- [ ] Vue full flow: add items → email → Stripe test card → success page
- [ ] React full flow: same as above
- [ ] Stripe CLI webhook → order status flips from `pending` to `paid`
- [ ] Stock decrements visible in Django admin after a paid order

---

### M7 — PostgreSQL integration  `[PENDING]`
- [ ] `docker-compose up -d` (Postgres 16)
- [ ] `backend/.env` with `PG_HOST / PG_DATABASE / PG_USER / PG_PASSWORD`
- [ ] `python manage.py migrate` against Postgres
- [ ] `python manage.py seed_demo`
- [ ] All API calls confirmed hitting Postgres (check Django logs)

---

### M8 — UI polish & hardening  `[IN PROGRESS]`
- [x] Amazon-style white-background redesign (both Vue + React)
- [x] Sticky dark navbar (#131921) with logo, search bar, cart icon + badge
- [x] Live product search (filters by name + description, shows hint bar)
- [x] Product cards: blue title, red price, star rating, stock count, hover zoom
- [x] Cart sidebar: thumbnail, qty ±, Delete link, subtotal, pill checkout button
- [x] Mobile: cart slides in from right as drawer
- [x] Success page: green checkmark, paid badge, order line items
- [ ] Loading spinner on product fetch
- [ ] Out-of-stock badge on product cards (stock = 0)
- [ ] Cancel URL returns to cart with items preserved (use sessionStorage)
- [ ] `python manage.py createsuperuser` documented and tested

---

### M9 — User accounts & auth  `[OPTIONAL / NOT STARTED]`
- [ ] JWT login / register endpoints (`djangorestframework-simplejwt`)
- [ ] Order history endpoint (auth-gated, per-user)
- [ ] Admin-only product CRUD API
- [ ] "My Orders" page in both frontends

---

## How to run everything in parallel

Open **three separate terminals**:

```powershell
# Terminal 1 — Django API
cd backend
..\.venv\Scripts\Activate.ps1
python manage.py runserver 8000

# Terminal 2 — Vue UI
cd frontend-vue
npm run dev       # http://localhost:5173

# Terminal 3 — React UI
cd frontend-react
npm run dev       # http://localhost:5174
```

Both UIs talk to `http://127.0.0.1:8000`. CORS is already open for both ports.

For Stripe webhooks (optional, Terminal 4):
```powershell
stripe listen --forward-to http://127.0.0.1:8000/api/webhooks/stripe/
# Copy the printed whsec_... into backend/.env as STRIPE_WEBHOOK_SECRET
# Then restart Terminal 1
```

---

## Acceptance criteria for "demo-ready"

1. Both `npm run dev` servers start without errors.
2. Product grid shows 3 seeded products on both UIs simultaneously.
3. A test Stripe payment (card `4242 4242 4242 4242`) redirects to the success
   page and shows the order ID + line items.
4. (With Stripe CLI) Order status changes from `pending` → `paid` within
   a few seconds of payment.
5. Django admin `/admin/` shows the order, its items, and the updated stock.
