"""
Listing model — generated at import time from LISTING_SCHEMA via engine.py.
==========================================================================
SHELL: do not edit. Change schema.py and run makemigrations instead.
"""

from features.listing.engine import create_listing_model
from features.listing.schema import LISTING_SCHEMA

Listing = create_listing_model(LISTING_SCHEMA)
