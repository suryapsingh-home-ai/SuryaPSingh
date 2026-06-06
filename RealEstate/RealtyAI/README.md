# Listing Platform Template

Clone this repo, edit **two schema files**, and you get a full listings product (properties, jobs, cars, …).

Public browse, search, filters, detail pages, **admin approval**, **lister accounts**, expiry, and renewals are all **generic shell code** — driven by the schema.

> **Creating jobs, cars, or another product?** → [NEW_LISTING_TYPE.md](./NEW_LISTING_TYPE.md)

---

## Only 2 files required to clone

| File | Purpose |
|------|---------|
| [`backend/features/listing/schema.py`](backend/features/listing/schema.py) | API path (`id`), branding, home copy, fields, listing duration |
| [`frontend/src/app/core/listing.schema.ts`](frontend/src/app/core/listing.schema.ts) | Same schema for UI — **keep in sync** |

**Optional** (not required for a new product type):

- [`frontend/src/index.html`](frontend/src/index.html) — browser tab title
- [`backend/features/listing/fixtures/listing_seed.json`](backend/features/listing/fixtures/listing_seed.json) — demo data
- This `README.md` — product name / example URLs

After changing **fields** in the schema:

```powershell
cd backend
python manage.py makemigrations
python manage.py migrate
```

---

## What the schema drives (automatic)

| Layer | From schema |
|-------|-------------|
| Django model, serializer, filters, search, sort | `fields[]` |
| API | `/api/{id}/` |
| Public UI routes | `/{id}`, `/{singular}/:id` |
| Admin UI | `/admin/{id}`, `/admin/login` |
| Lister UI | `/account/{id}`, `/account/login`, `/account/register` |
| Nav, home page, list/detail forms | `product_name`, `labels`, `home`, `fields` |
| Listing visibility period | `listing.default_duration_days` (default 15) |
| Swagger / OpenAPI title & resource paths | `product_name`, `id`, `labels.plural` |

**Shell (do not edit when cloning):** `backend/config/` (incl. `api_docs.py`), `backend/features/listing/engine.py`, `views.py`, `auth_views.py`, `frontend/src/app/shared/`.

---

## Local setup

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py loaddata listing_seed.json
python manage.py createsuperuser
python manage.py runserver
```

- API: `http://localhost:8000/api/{schema.id}/` (RealtyAI example: `/api/properties/`)
- **Swagger UI:** `http://localhost:8000/api/docs/`
- **OpenAPI schema:** `http://localhost:8000/api/schema/`
- **ReDoc:** `http://localhost:8000/api/redoc/`
- Django admin: `http://localhost:8000/admin/`

### Frontend

```powershell
cd frontend
npm install
npm start
```

- UI: `http://localhost:4200/` (or next free port — check terminal output)
- Backend must be running on port **8000** for data to load

In `DEBUG` mode, CORS allows **any** `http://localhost:PORT` automatically.

### Roles

| Role | How to create | UI |
|------|---------------|-----|
| **Admin** | `createsuperuser` | `/admin/login` → `/admin/{id}` |
| **Lister** (agent / owner) | `/account/register` | `/account/login` → `/account/{id}` |

Admin approves lister submissions. Approved listings stay live for `listing.default_duration_days` (override with `LISTING_DEFAULT_DURATION_DAYS` in `.env`).

Public browse shows only **approved, non-expired** listings.

### Docker (backend + DB)

```powershell
docker compose up --build
```

Run the frontend separately with `npm start`.

---

## This repo (RealtyAI example)

Schema `id` is `"properties"`:

- API: `/api/properties/`
- Swagger: `/api/docs/` (title updates from `product_name` in schema)
- Browse: `/properties`, `/property/:id`
- Admin: `/admin/properties`
- Lister: `/account/properties`

---

## Code comment standard

Source files use a **read top-to-bottom** style: a one-line purpose comment appears **immediately before** each function and before non-obvious variables.

```python
# Map one schema field to a Django model column.
def _django_field(field_spec: dict) -> models.Field:
    field_type = field_spec["type"]
```

Best reference: [`backend/features/listing/engine.py`](backend/features/listing/engine.py). Full rules → [codewalkthrough.md](./codewalkthrough.md#code-comment-standard).

When cloning, edit **schema only** — shell files stay documented but unchanged.

---

## Documentation

| File | Purpose |
|------|---------|
| [NEW_LISTING_TYPE.md](./NEW_LISTING_TYPE.md) | Clone guide — jobs, cars, field reference, troubleshooting |
| [codewalkthrough.md](./codewalkthrough.md) | How the codebase works, file-by-file reference, **comment standard** |
