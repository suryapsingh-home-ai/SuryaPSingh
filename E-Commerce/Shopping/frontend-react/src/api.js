const base = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function fetchProducts() {
  const r = await fetch(`${base}/api/products/`);
  if (!r.ok) throw new Error("Failed to load products");
  return r.json();
}

export async function fetchProduct(slug) {
  const enc = encodeURIComponent(slug);
  const r = await fetch(`${base}/api/products/${enc}/`);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.detail || "Failed to load product");
  return data;
}

export async function createCheckout(payload) {
  const r = await fetch(`${base}/api/checkout/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.detail || "Checkout failed");
  return data;
}

export async function fetchOrderStatus(params) {
  const q = new URLSearchParams(params).toString();
  const r = await fetch(`${base}/api/orders/status/?${q}`);
  if (!r.ok) throw new Error("Order not found");
  return r.json();
}
