"""
Listing duration config — days an approved listing stays public.
================================================================
Reads LISTING_DEFAULT_DURATION_DAYS env first, then schema.listing.default_duration_days.
Used by views.py on approve/create and by frontend via listing.schema.ts mirror.
"""

import os

from features.listing.schema import LISTING_SCHEMA


# Resolve listing visibility period: env override wins, then schema default (15).
def get_default_listing_duration_days() -> int:
    env_val = os.environ.get("LISTING_DEFAULT_DURATION_DAYS")
    if env_val:
        return int(env_val)
    return LISTING_SCHEMA.get("listing", {}).get("default_duration_days", 15)
