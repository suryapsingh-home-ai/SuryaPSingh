"""
OpenAPI / Swagger settings — title and description follow listing schema.
=========================================================================
SHELL: drf-spectacular reads this via settings.SPECTACULAR_SETTINGS.
When schema.id changes (e.g. jobs), /api/docs/ updates automatically.
"""

from features.listing.schema import LISTING_SCHEMA


def build_spectacular_settings() -> dict:
    """Build drf-spectacular config from LISTING_SCHEMA product name and paths."""
    product = LISTING_SCHEMA["product_name"]
    resource_id = LISTING_SCHEMA["id"]
    plural = LISTING_SCHEMA["labels"]["plural"]

    return {
        "TITLE": f"{product} API",
        "DESCRIPTION": (
            f"Schema-driven REST API for {plural.lower()}. "
            f"Main resource: `/api/{resource_id}/`. "
            f"When you clone for jobs or cars, change `schema.py` only — "
            f"this page updates automatically.\n\n"
            "**Auth:** send `Authorization: Token <key>` after login.\n\n"
            f"- Admin login: `POST /api/auth/admin-login/`\n"
            f"- Lister login: `POST /api/auth/login/`\n"
            f"- Register lister: `POST /api/auth/register/`"
        ),
        "VERSION": "1.0.0",
        "SERVE_INCLUDE_SCHEMA": False,
        "COMPONENT_SPLIT_REQUEST": True,
        "SCHEMA_PATH_PREFIX": r"/api/",
        "TAGS": [
            {"name": resource_id, "description": f"{plural} list, create, approve, renew"},
            {"name": "auth", "description": "Admin and lister tokens"},
        ],
        "PREPROCESSING_HOOKS": [],
        "POSTPROCESSING_HOOKS": [],
    }
