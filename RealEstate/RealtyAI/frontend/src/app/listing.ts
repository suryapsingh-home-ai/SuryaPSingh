export interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area_sqft?: number;
  property_type: string;
  status: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  image_url?: string;
}
