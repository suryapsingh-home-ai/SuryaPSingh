export interface CategoryRef {
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  image_url: string;
  stock: number;
  is_active: boolean;
  category: CategoryRef | null;
}

export interface CartLine {
  product: Product;
  quantity: number;
}

export interface CheckoutPayload {
  customer_email: string;
  items: { product_id: string; quantity: number }[];
  success_url: string;
  cancel_url: string;
}

export interface OrderItemRow {
  product: string;
  product_name: string;
  quantity: number;
  unit_price: string;
}

export interface OrderResult {
  id: string;
  customer_email: string;
  status: string;
  total: string;
  items: OrderItemRow[];
}
