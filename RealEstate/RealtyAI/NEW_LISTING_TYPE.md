# Create a New Listing Product (Jobs, Cars, …)

Copy this repository. Change **only two schema files**. Everything else adapts automatically.

---

## Quick start

1. Copy / fork the repo
2. Edit **`backend/features/listing/schema.py`**
3. Edit **`frontend/src/app/core/listing.schema.ts`** (mirror backend — TypeScript syntax)
4. Run migrations (if fields changed)
5. Optionally update seed data and `index.html` title

You do **not** edit views, components, routes, admin modules, or engine code.

---

## The 2 schema files

| # | File |
|---|------|
| 1 | `backend/features/listing/schema.py` |
| 2 | `frontend/src/app/core/listing.schema.ts` |

Keep both in sync: same `id`, `labels`, `home`, `listing`, and `fields`.

```powershell
cd backend
python manage.py makemigrations
python manage.py migrate
python manage.py loaddata listing_seed.json   # after updating seed (optional)
```

Use a **fresh database** when switching to a very different field set, or run migrations on an empty DB.

---

## Schema top-level keys

| Key | Example | Drives |
|-----|---------|--------|
| `id` | `"jobs"` | API `/api/jobs/`, routes `/jobs`, admin `/admin/jobs`, account `/account/jobs` |
| `product_name` | `"JobList"` | Site header + Swagger API title |
| `labels.singular` | `"Job"` | Detail route `/job/:id` |
| `labels.plural` | `"Jobs"` | List route `/jobs`, nav link, Swagger description |
| `listing.default_duration_days` | `15` | Days an **approved** listing stays public (env override: `LISTING_DEFAULT_DURATION_DAYS`) |
| `home.*` | headline, subheadline, … | Landing page |
| `fields` | array | DB columns, filters, forms, cards, detail rows |

---

## What builds automatically from schema

| Layer | Source |
|-------|--------|
| Django `Listing` model | `fields[].type` → CharField, DecimalField, … |
| REST serializer & filters | `search`, `filter`, `sortable` on fields |
| Public API | `GET/POST /api/{id}/` (+ approve/reject/renew actions) |
| Swagger / OpenAPI docs | `/api/docs/`, `/api/schema/` (reads `product_name`, `id` from schema) |
| Angular list, detail, home | `show_in_list`, `show_in_detail`, `home` |
| Admin add/edit table & forms | `labels`, `fields` |
| Lister add/edit forms | Same `fields` (submissions → pending approval) |
| All manage URLs | `/admin/{id}`, `/account/{id}` |

### Shell features (same for every product — no schema edit)

- Staff admin login, approve / reject, instant publish for staff-created items
- Lister registration (agent / owner roles), my-listings dashboard, renew
- Contact block on detail page (lister name, email, phone from profile)
- Expiry: public sees only approved listings where `expires_at >= now`

### Do not edit when cloning

```
backend/config/              # includes api_docs.py (Swagger — reads schema)
backend/features/listing/engine.py
backend/features/listing/views.py
backend/features/listing/auth_views.py
backend/features/listing/serializers.py
frontend/src/app/shared/listing/
frontend/src/app/shared/admin/
frontend/src/app/shared/seller/
frontend/src/app/app.component.ts
frontend/src/app/app.routes.ts
```

---

## Field reference

Each object in `fields`:

| Key | Values | Effect |
|-----|--------|--------|
| `name` | string | DB column + API key |
| `type` | `string`, `text`, `money`, `integer`, `choice`, `url` | Storage & formatting |
| `label` | string | UI label |
| `required` | bool | Required on create (usually `title`) |
| `search` | bool | API text search |
| `filter` | `"exact"` or `"range"` | List sidebar filter |
| `sortable` | bool | Sort dropdown |
| `show_in_list` | bool | Card on browse page |
| `show_in_detail` | bool | Row on detail page |
| `choices` | `[["value", "Label"], …]` | For `type: "choice"` |
| `default` | string | Default for choice fields |

### Field types

| Type | Backend | UI |
|------|---------|-----|
| `string` | CharField | Text |
| `text` | TextField | Paragraph |
| `money` | DecimalField | USD currency |
| `integer` | PositiveIntegerField | Number |
| `choice` | CharField + choices | Label from choices |
| `url` | URLField | Image on cards/detail |

### Layout hints (optional conventions)

- Field named **`city`** with `filter: "exact"` → geolocation helper on list page
- Fields **`title`**, **`price`**, **`image_url`** → prominent card layout when present
- For jobs, use `salary_min` instead of `price` — cards still work; prominence follows field names above

---

## Example: jobs

Replace `LISTING_SCHEMA` in **both** files.

**Backend** (`schema.py`):

```python
LISTING_SCHEMA = {
    "id": "jobs",
    "product_name": "JobList",
    "labels": {"singular": "Job", "plural": "Jobs"},
    "listing": {"default_duration_days": 15},
    "home": {
        "headline": "Find your next role with JobList",
        "subheadline": "Browse open positions from top employers.",
        "browse_cta": "Browse all jobs",
        "featured_title": "Featured Jobs",
    },
    "fields": [
        {"name": "title", "type": "string", "label": "Job Title", "required": True, "search": True, "show_in_list": True, "show_in_detail": True},
        {"name": "description", "type": "text", "label": "Description", "search": True, "show_in_detail": True},
        {"name": "company", "type": "string", "label": "Company", "search": True, "filter": "exact", "show_in_list": True, "show_in_detail": True},
        {"name": "location", "type": "string", "label": "Location", "search": True, "filter": "exact", "show_in_list": True, "show_in_detail": True},
        {"name": "salary_min", "type": "money", "label": "Salary (min)", "filter": "range", "sortable": True, "show_in_list": True, "show_in_detail": True},
        {"name": "employment_type", "type": "choice", "label": "Type", "choices": [("full_time", "Full-time"), ("contract", "Contract"), ("remote", "Remote")], "filter": "exact", "show_in_list": True, "show_in_detail": True},
        {"name": "image_url", "type": "url", "label": "Logo", "show_in_list": True, "show_in_detail": True},
    ],
}
```

**Frontend** (`listing.schema.ts`) — same structure; TypeScript `[['full_time', 'Full-time'], …]` for choices.

**Result (zero component changes):**

| What | URL |
|------|-----|
| API | `http://localhost:8000/api/jobs/` |
| Swagger | `http://localhost:8000/api/docs/` |
| Browse | `http://localhost:4200/jobs` |
| Detail | `http://localhost:4200/job/5` |
| Admin | `http://localhost:4200/admin/jobs` |
| Lister | `http://localhost:4200/account/jobs` |

---

## Example: cars

Same two-file process:

```python
"id": "cars",
"product_name": "CarList",
"labels": {"singular": "Car", "plural": "Cars"},
"listing": {"default_duration_days": 15},
# fields: title, make, model, year, mileage, price, city, image_url, …
```

---

## Optional after cloning

| File | Why |
|------|-----|
| `frontend/src/index.html` | Browser tab title |
| `backend/features/listing/fixtures/listing_seed.json` | Demo listings (`approval_status: "approved"`, `expires_at` in future) |
| `README.md` | Describe your product |

Seed fixture model: `"listing.listing"`. Field names must match schema.

---

## How the engine works (brief)

```
schema.py  ──┐
             ├── same fields
listing.schema.ts ──┘
        │
        ▼
engine.py → Django model, serializer, viewset, admin columns
views.py  → approval, expiry, renew, lister permissions
shared/listing/ → Angular list, detail, home
shared/admin/   → staff manage UI (reads schema)
shared/seller/  → lister register, my listings (reads schema)
```

Browse flow: Angular list component reads filters from schema → `GET /api/{id}/?city=…&page=1` → ViewSet filters approved, non-expired rows → JSON → cards rendered from `show_in_list` fields.

---

## Clone checklist

- [ ] Edit `backend/features/listing/schema.py`
- [ ] Edit `frontend/src/app/core/listing.schema.ts` (match backend)
- [ ] `python manage.py makemigrations && python manage.py migrate`
- [ ] Update `listing_seed.json` (optional)
- [ ] Update `index.html` title (optional)
- [ ] `createsuperuser` for admin
- [ ] Start backend (`runserver`) + frontend (`npm start`)

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| API 404 | Schema `id` must match URL: `/api/{id}/` |
| Empty public list | Listings must be **approved** with future `expires_at`; approve in `/admin/{id}` |
| CORS errors | Backend running? In DEBUG, any `localhost:PORT` is allowed — restart Django after `.env` changes |
| Swagger 404 | Run `pip install -r requirements.txt` and restart Django; open `/api/docs/` |
| Wrong port | Use the port `ng serve` prints (not 8000 for UI) |
| `8000/` shows Django 404 | Normal — UI is on Angular port; API is `/api/{id}/` |
| Filters broken | Field has `filter` in schema? Both schema files in sync? |
| Migration errors | Run `makemigrations` after every field change |
| Admin login fails | `createsuperuser` → `/admin/login` (not `/account/login`) |
| Blank admin/seller pages | Use Chrome; ensure frontend dev server is running |

---

## See also

- [README.md](./README.md) — local setup and roles
- [codewalkthrough.md](./codewalkthrough.md) — how the codebase works (junior developer guide)
