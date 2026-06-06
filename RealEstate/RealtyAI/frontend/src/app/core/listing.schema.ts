/**
 * LISTING SCHEMA — the only frontend file to edit when cloning for jobs, cars, etc.
 * ================================================================================
 * Keep in sync with: backend/features/listing/schema.py
 *
 * Architecture role:
 *   - Defines product id, labels, home copy, and field metadata
 *   - Helper functions build URLs, filters, and display formatting for shared UI
 *   - Imported by listing/, admin/, and seller/ modules (SHELL — do not edit those)
 *
 * Guide: NEW_LISTING_TYPE.md (repo root)
 */

export type FieldType = 'string' | 'text' | 'money' | 'integer' | 'choice' | 'url';

export interface ListingField {
  name: string;
  type: FieldType;
  label: string;
  required?: boolean;
  search?: boolean;
  filter?: 'exact' | 'range';
  sortable?: boolean;
  show_in_list?: boolean;
  show_in_detail?: boolean;
  choices?: [string, string][];
  default?: string;
  max_length?: number;
}

export interface ListingSchema {
  id: string;
  product_name: string;
  labels: { singular: string; plural: string };
  listing?: { default_duration_days: number };
  home: {
    headline: string;
    subheadline: string;
    browse_cta: string;
    featured_title: string;
  };
  fields: ListingField[];
}

export type ListingItem = Record<string, string | number | null | undefined> & {
  id: number;
  created_at?: string;
  updated_at?: string;
  approval_status?: 'pending' | 'approved' | 'rejected';
  expires_at?: string | null;
  rejection_reason?: string;
  created_by_username?: string;
  lister_name?: string | null;
  lister_email?: string | null;
  lister_phone?: string | null;
  lister_role?: string | null;
};

export const LISTING_SCHEMA: ListingSchema = {
  id: 'properties',
  product_name: 'RealtyAI',
  labels: { singular: 'Property', plural: 'Properties' },
  listing: { default_duration_days: 15 },
  home: {
    headline: 'Find your next home with RealtyAI',
    subheadline:
      'Browse verified properties for sale and rent, explore featured listings, and get a fast demo-ready experience.',
    browse_cta: 'Browse all properties',
    featured_title: 'Featured Properties',
  },
  fields: [
    { name: 'title', type: 'string', label: 'Title', required: true, search: true, show_in_list: true, show_in_detail: true },
    { name: 'description', type: 'text', label: 'Description', search: true, show_in_detail: true },
    { name: 'price', type: 'money', label: 'Price', filter: 'range', sortable: true, show_in_list: true, show_in_detail: true },
    { name: 'bedrooms', type: 'integer', label: 'Bedrooms', filter: 'range', sortable: true, show_in_list: true, show_in_detail: true },
    { name: 'bathrooms', type: 'integer', label: 'Bathrooms', filter: 'range', sortable: true, show_in_list: true, show_in_detail: true },
    { name: 'area_sqft', type: 'integer', label: 'Area (sqft)', filter: 'range', sortable: true, show_in_list: true, show_in_detail: true },
    {
      name: 'property_type',
      type: 'choice',
      label: 'Property Type',
      choices: [
        ['apartment', 'Apartment'],
        ['house', 'House'],
        ['condo', 'Condo'],
        ['land', 'Land'],
      ],
      filter: 'exact',
      search: true,
      show_in_list: true,
      show_in_detail: true,
    },
    {
      name: 'status',
      type: 'choice',
      label: 'Status',
      choices: [
        ['sale', 'For Sale'],
        ['rent', 'For Rent'],
        ['sold', 'Sold'],
      ],
      default: 'sale',
      filter: 'exact',
      show_in_detail: true,
    },
    { name: 'address', type: 'string', label: 'Address', show_in_list: true, show_in_detail: true },
    { name: 'city', type: 'string', label: 'City', search: true, filter: 'exact', show_in_list: true, show_in_detail: true },
    { name: 'state', type: 'string', label: 'State', filter: 'exact', search: true, show_in_list: true, show_in_detail: true },
    { name: 'zipcode', type: 'string', label: 'Zip Code', search: true, show_in_detail: true },
    { name: 'image_url', type: 'url', label: 'Image URL', show_in_list: true, show_in_detail: true },
  ],
};

/** API path segment — e.g. "properties" → GET /api/properties/ */
export function listingApiPath(): string {
  return LISTING_SCHEMA.id;
}

/** URL segment for detail pages — e.g. "property" from labels.singular */
export function listingDetailSegment(): string {
  return LISTING_SCHEMA.labels.singular.toLowerCase();
}

/** Full path string for detail link — e.g. /property/5 */
export function listingDetailPath(id: number | string): string {
  return `/${listingDetailSegment()}/${id}`;
}

/** RouterLink array for detail — e.g. ['/', 'property', 5] */
export function listingDetailRoute(id: number | string): (string | number)[] {
  return ['/', listingDetailSegment(), id];
}

/** Public browse list path — e.g. /properties */
export function listingListPath(): string {
  return `/${LISTING_SCHEMA.id}`;
}

/** Admin manage list path — e.g. /admin/properties */
export function adminManagePath(): string {
  return `/admin/${LISTING_SCHEMA.id}`;
}

/** Admin create form path — e.g. /admin/properties/new */
export function adminManageNewPath(): string {
  return `/admin/${LISTING_SCHEMA.id}/new`;
}

/** RouterLink array for admin manage — e.g. ['/admin', 'properties'] */
export function adminManageRoute(): string[] {
  return ['/admin', LISTING_SCHEMA.id];
}

/** RouterLink array for admin edit — e.g. ['/admin', 'properties', 5, 'edit'] */
export function adminManageEditRoute(listingId: number | string): (string | number)[] {
  return ['/admin', LISTING_SCHEMA.id, listingId, 'edit'];
}

/** Seller manage list path — e.g. /account/properties */
export function accountManagePath(): string {
  return `/account/${LISTING_SCHEMA.id}`;
}

/** Seller create form path — e.g. /account/properties/new */
export function accountManageNewPath(): string {
  return `/account/${LISTING_SCHEMA.id}/new`;
}

/** RouterLink array for seller manage — e.g. ['/account', 'properties'] */
export function accountManageRoute(): string[] {
  return ['/account', LISTING_SCHEMA.id];
}

/** RouterLink array for seller edit — e.g. ['/account', 'properties', 5, 'edit'] */
export function accountManageEditRoute(listingId: number | string): (string | number)[] {
  return ['/account', LISTING_SCHEMA.id, listingId, 'edit'];
}

/** Fields with filter=exact or filter=range for browse sidebar */
export function filterableFields(): ListingField[] {
  return LISTING_SCHEMA.fields.filter((field) => field.filter);
}

/** Fields with sortable=true for ordering dropdown */
export function sortableFields(): ListingField[] {
  return LISTING_SCHEMA.fields.filter((field) => field.sortable);
}

/** Fields with show_in_list=true for browse cards */
export function listDisplayFields(): ListingField[] {
  return LISTING_SCHEMA.fields.filter((field) => field.show_in_list);
}

/** Fields with show_in_detail=true for detail page */
export function detailDisplayFields(): ListingField[] {
  return LISTING_SCHEMA.fields.filter((field) => field.show_in_detail);
}

/** Resolve choice key to display label from field.choices */
export function choiceLabel(field: ListingField, value: string): string {
  const match = field.choices?.find(([key]) => key === value);
  return match ? match[1] : value;
}

/** Format a raw value for display (currency, choice label, etc.) */
export function formatFieldValue(field: ListingField, value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  if (field.type === 'money') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value));
  }
  if (field.type === 'choice') {
    return choiceLabel(field, String(value));
  }
  return String(value);
}

/** Format a field value from a listing item (use in templates) */
export function formatItemField(field: ListingField, item: ListingItem): string {
  return formatFieldValue(field, item[field.name]);
}

/** Placeholder image URL when listing has no image_url */
export function imagePlaceholder(): string {
  return `https://via.placeholder.com/800x480?text=${encodeURIComponent(LISTING_SCHEMA.labels.singular)}`;
}

/** Larger placeholder for detail page hero image */
export function detailImagePlaceholder(): string {
  return `https://via.placeholder.com/1200x600?text=${encodeURIComponent(LISTING_SCHEMA.labels.singular)}`;
}

/** Mirror of schema listing.default_duration_days (also overridable via env on backend) */
export function listingDefaultDurationDays(): number {
  return LISTING_SCHEMA.listing?.default_duration_days ?? 15;
}

/** Capitalize approval_status for UI badges */
export function formatApprovalStatus(status: string | undefined): string {
  if (!status) return '';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/** Format expires_at ISO string as locale date, or em dash if empty */
export function formatExpiresAt(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
}

/** True when expires_at is in the past */
export function isListingExpired(item: ListingItem): boolean {
  if (!item.expires_at) return false;
  return new Date(item.expires_at) < new Date();
}

/** True when API returned any lister contact field on detail */
export function hasListerContact(item: ListingItem): boolean {
  return !!(item.lister_name || item.lister_email || item.lister_phone);
}

/** Renew button enabled when listing is not already pending */
export function canRenewListing(item: ListingItem): boolean {
  return item.approval_status !== 'pending';
}
