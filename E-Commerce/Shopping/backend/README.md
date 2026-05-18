# Backend — Django REST API

This is the core **Django REST API** for the Shopping demo. It handles:
- Product catalog management
- Shopping cart checkout via Stripe
- Order processing and payment webhooks
- Database persistence

## Quick Start

### Prerequisites
- Python 3.9+
- pip

### Setup

1. **Create and activate a virtual environment:**
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # macOS/Linux:
   source .venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Apply database migrations:**
   ```bash
   python manage.py migrate
   ```

4. **Seed demo data (optional):**
   ```bash
   python manage.py seed_demo
   ```

5. **Run the development server:**
   ```bash
   python manage.py runserver
   ```
   The API will be available at `http://localhost:8000`

## Project Structure

### `/config/`
Django project configuration:
- **`settings.py`** — Core settings (installed apps, middleware, database, CORS, Stripe keys)
- **`urls.py`** — Routes all requests to the `shop` app
- **`asgi.py` / `wsgi.py`** — Application servers for production deployment

### `/shop/`
Main e-commerce app:

#### **`models.py`**
Defines the database schema:
- **`Category`** — Product categories (name, slug)
- **`Product`** — Individual products (UUID id, name, slug, description, price, image_url, stock, is_active, category FK)
- **`Order`** — Customer orders (UUID id, customer_email, status, total, stripe_checkout_session_id)
- **`OrderItem`** — Items within an order (FK to order and product, quantity, unit_price)

#### **`views.py`**
REST API endpoints:
- **`GET /api/health/`** — Health check
- **`GET /api/products/`** — List all active products with stock > 0
- **`GET /api/products/<slug>/`** — Get a single product by slug
- **`POST /api/checkout/`** — Create a Stripe Checkout Session and return checkout URL
- **`POST /api/webhooks/stripe/`** — Receive webhook from Stripe when payment completes

#### **`serializers.py`**
Converts Python models to/from JSON:
- **`ProductSerializer`** — Serialize Product model
- **`CheckoutSerializer`** — Validate checkout request (items array with product_id & quantity)
- **`OrderSerializer`** — Serialize Order model
- **`OrderLookupSerializer`** — Deserialize client order lookup requests

#### **`stripe_service.py`**
Stripe integration helper:
- **`build_line_items()`** — Format cart items for Stripe Checkout
- **`create_checkout_session()`** — Call Stripe API to create a payment session

#### **`urls.py`**
Maps URL paths to view functions:
```
/api/health/              → health()
/api/products/            → product_list()
/api/products/<slug>/     → product_detail()
/api/checkout/            → checkout()
/api/webhooks/stripe/     → stripe_webhook()
```

#### **`management/commands/seed_demo.py`**
Management command to populate the database with demo data (categories and products).

### `/migrations/`
Database schema history:
- **`0001_initial.py`** — Initial schema (Category, Product, Order, OrderItem)
- **`0002_category_product_category.py`** — Adds category FK to Product

## Configuration

### Environment Variables
Create a `.env` file in the backend directory:
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### CORS Settings
The API allows requests from:
- `http://localhost:5173` (Vue frontend)
- `http://localhost:5174` (React frontend)
- `http://localhost:4200` (Angular frontend)

Update `config/settings.py` `CORS_ALLOWED_ORIGINS` to add/remove origins.

### Database
By default, uses **SQLite** (`db.sqlite3`). For production, switch to PostgreSQL in `settings.py`.

## API Endpoints

### List Products
```http
GET /api/products/
```
Response:
```json
[
  {
    "id": "uuid",
    "name": "Product Name",
    "slug": "product-name",
    "description": "...",
    "price": "29.99",
    "image_url": "https://...",
    "stock": 10,
    "category": {"id": 1, "name": "Electronics"}
  }
]
```

### Get Product Details
```http
GET /api/products/product-slug/
```

### Create Checkout
```http
POST /api/checkout/
Content-Type: application/json

{
  "items": [
    {"product_id": "uuid", "quantity": 2},
    {"product_id": "uuid", "quantity": 1}
  ],
  "customer_email": "user@example.com",
  "success_url": "http://localhost:5173/success",
  "cancel_url": "http://localhost:5173"
}
```
Response:
```json
{
  "checkout_url": "https://checkout.stripe.com/pay/..."
}
```

### Stripe Webhook
```http
POST /api/webhooks/stripe/
```
Called automatically by Stripe. Updates order status to `paid` when payment succeeds.

## Key Concepts

### Payment Flow
1. Frontend sends cart items to `/api/checkout/`
2. Backend validates products and stock
3. Backend calls Stripe to create a Checkout Session
4. Backend returns `checkout_url` to frontend
5. Frontend redirects user to Stripe Checkout
6. User completes payment on Stripe
7. Stripe sends webhook to `/api/webhooks/stripe/`
8. Backend marks order as `paid` and reduces stock

### Stock Management
- Products show only if `stock > 0` and `is_active=True`
- Stock is decremented when order is marked as `paid`
- Pending orders do not affect stock

### Order Statuses
- **pending** — Checkout created, awaiting Stripe payment
- **paid** — Payment confirmed, stock deducted
- **failed** — Payment declined or cancelled

## Troubleshooting

### CORS Error
If frontend can't call the API, ensure:
1. Backend is running on `:8000`
2. Frontend origin is in `CORS_ALLOWED_ORIGINS` in `settings.py`
3. Browser console shows the blocked origin

### Stripe Key Missing
Set `STRIPE_SECRET_KEY` in `.env` to enable checkout.

### Database Locked
Delete `db.sqlite3` and run migrations again.

## Tech Stack
- **Framework:** Django 4.2
- **REST:** Django REST Framework 3.15
- **Payment:** Stripe 11.1
- **Database:** SQLite (dev) / PostgreSQL (prod)
- **CORS:** django-cors-headers
