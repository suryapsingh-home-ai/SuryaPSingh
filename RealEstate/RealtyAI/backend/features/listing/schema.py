"""
LISTING SCHEMA — the only backend file to edit when cloning for jobs, cars, etc.
================================================================================
Change `id`, labels, home, listing, and `fields`. Model, API, admin, lister UI,
and routes are built automatically. Keep in sync with listing.schema.ts (frontend).

Guide: NEW_LISTING_TYPE.md
After changing fields: python manage.py makemigrations && python manage.py migrate
"""

LISTING_SCHEMA = {
    "id": "properties",
    "product_name": "RealtyAI",
    "labels": {"singular": "Property", "plural": "Properties"},
    # How long approved listings stay visible (override with LISTING_DEFAULT_DURATION_DAYS env)
    "listing": {"default_duration_days": 15},
    "home": {
        "headline": "Find your next home with RealtyAI",
        "subheadline": (
            "Browse verified properties for sale and rent, explore featured listings, "
            "and get a fast demo-ready experience."
        ),
        "browse_cta": "Browse all properties",
        "featured_title": "Featured Properties",
    },
    "fields": [
        {
            "name": "title",
            "type": "string",
            "label": "Title",
            "required": True,
            "search": True,
            "show_in_list": True,
            "show_in_detail": True,
        },
        {
            "name": "description",
            "type": "text",
            "label": "Description",
            "search": True,
            "show_in_detail": True,
        },
        {
            "name": "price",
            "type": "money",
            "label": "Price",
            "filter": "range",
            "sortable": True,
            "show_in_list": True,
            "show_in_detail": True,
        },
        {
            "name": "bedrooms",
            "type": "integer",
            "label": "Bedrooms",
            "filter": "range",
            "sortable": True,
            "show_in_list": True,
            "show_in_detail": True,
        },
        {
            "name": "bathrooms",
            "type": "integer",
            "label": "Bathrooms",
            "filter": "range",
            "sortable": True,
            "show_in_list": True,
            "show_in_detail": True,
        },
        {
            "name": "area_sqft",
            "type": "integer",
            "label": "Area (sqft)",
            "filter": "range",
            "sortable": True,
            "show_in_list": True,
            "show_in_detail": True,
        },
        {
            "name": "property_type",
            "type": "choice",
            "label": "Property Type",
            "choices": [
                ("apartment", "Apartment"),
                ("house", "House"),
                ("condo", "Condo"),
                ("land", "Land"),
            ],
            "filter": "exact",
            "search": True,
            "show_in_list": True,
            "show_in_detail": True,
        },
        {
            "name": "status",
            "type": "choice",
            "label": "Status",
            "choices": [
                ("sale", "For Sale"),
                ("rent", "For Rent"),
                ("sold", "Sold"),
            ],
            "default": "sale",
            "filter": "exact",
            "show_in_detail": True,
        },
        {
            "name": "address",
            "type": "string",
            "label": "Address",
            "show_in_list": True,
            "show_in_detail": True,
        },
        {
            "name": "city",
            "type": "string",
            "label": "City",
            "search": True,
            "filter": "exact",
            "show_in_list": True,
            "show_in_detail": True,
        },
        {
            "name": "state",
            "type": "string",
            "label": "State",
            "filter": "exact",
            "search": True,
            "show_in_list": True,
            "show_in_detail": True,
        },
        {
            "name": "zipcode",
            "type": "string",
            "label": "Zip Code",
            "search": True,
            "show_in_detail": True,
        },
        {
            "name": "image_url",
            "type": "url",
            "label": "Image URL",
            "show_in_list": True,
            "show_in_detail": True,
        },
    ],
}

# ─── JOBS EXAMPLE (replace LISTING_SCHEMA above when cloning) ────────────────
#
# LISTING_SCHEMA = {
#     "id": "jobs",
#     "product_name": "JobList",
#     "labels": {"singular": "Job", "plural": "Jobs"},
#     "home": {
#         "headline": "Find your next role with JobList",
#         "subheadline": "Browse open positions from top employers.",
#         "browse_cta": "Browse all jobs",
#         "featured_title": "Featured Jobs",
#     },
#     "fields": [
#         {"name": "title", "type": "string", "label": "Job Title", "required": True, "search": True, "show_in_list": True, "show_in_detail": True},
#         {"name": "description", "type": "text", "label": "Description", "search": True, "show_in_detail": True},
#         {"name": "company", "type": "string", "label": "Company", "search": True, "filter": "exact", "show_in_list": True, "show_in_detail": True},
#         {"name": "location", "type": "string", "label": "Location", "search": True, "filter": "exact", "show_in_list": True, "show_in_detail": True},
#         {"name": "salary_min", "type": "money", "label": "Salary (min)", "filter": "range", "sortable": True, "show_in_list": True, "show_in_detail": True},
#         {"name": "salary_max", "type": "money", "label": "Salary (max)", "filter": "range", "sortable": True, "show_in_detail": True},
#         {"name": "employment_type", "type": "choice", "label": "Employment Type", "choices": [("full_time", "Full-time"), ("contract", "Contract"), ("remote", "Remote")], "filter": "exact", "show_in_list": True, "show_in_detail": True},
#         {"name": "image_url", "type": "url", "label": "Logo URL", "show_in_list": True, "show_in_detail": True},
#     ],
# }
