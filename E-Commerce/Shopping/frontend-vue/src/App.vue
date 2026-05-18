<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { createCheckout, fetchOrderStatus, fetchProduct, fetchProducts } from "./api.js";

/* ── routing ── */
const route = ref("shop");
const productSlug = ref("");

function readHash() {
  const h = window.location.hash.replace(/^#\/?/, "");
  if (h.startsWith("success")) {
    route.value = "success";
    productSlug.value = "";
    return;
  }
  if (h.startsWith("product/")) {
    route.value = "product";
    productSlug.value = decodeURIComponent(
      h.slice("product/".length).split("/")[0].split("?")[0] || ""
    );
    return;
  }
  route.value = "shop";
  productSlug.value = "";
}

/* ── data ── */
const allProducts = ref([]);
const loading = ref(true);
const error = ref("");

const detailProduct = ref(null);
const detailLoading = ref(false);
const detailError = ref("");

watch(
  () => [route.value, productSlug.value],
  async ([r, slug]) => {
    if (r !== "product" || !slug) {
      detailProduct.value = null;
      detailError.value = "";
      detailLoading.value = false;
      return;
    }
    detailLoading.value = true;
    detailError.value = "";
    detailProduct.value = null;
    try {
      detailProduct.value = await fetchProduct(slug);
    } catch (e) {
      detailError.value = e.message || "Could not load product";
    } finally {
      detailLoading.value = false;
    }
  },
  { immediate: true }
);

/* ── search ── */
const searchInput = ref("");
const searchQuery = ref("");
function doSearch() { searchQuery.value = searchInput.value.trim().toLowerCase(); }
function clearSearch() { searchInput.value = ""; searchQuery.value = ""; }

const products = computed(() => {
  if (!searchQuery.value) return allProducts.value;
  return allProducts.value.filter((p) => {
    const cat = (p.category?.name || "").toLowerCase();
    return (
      p.name.toLowerCase().includes(searchQuery.value) ||
      p.description.toLowerCase().includes(searchQuery.value) ||
      cat.includes(searchQuery.value)
    );
  });
});

/* ── cart ── */
const cart = ref({});
const cartItems = computed(() => {
  const ids = Object.keys(cart.value);
  return ids
    .map((id) => {
      const fromList = allProducts.value.find((p) => p.id === id);
      if (fromList) return { ...fromList, quantity: cart.value[id] };
      if (detailProduct.value && detailProduct.value.id === id) {
        return { ...detailProduct.value, quantity: cart.value[id] };
      }
      return null;
    })
    .filter(Boolean);
});
const cartTotal = computed(() =>
  cartItems.value.reduce((s, i) => s + Number(i.price) * i.quantity, 0)
);
const cartCount = computed(() =>
  cartItems.value.reduce((s, i) => s + i.quantity, 0)
);
const cartOpen = ref(false);

function addToCart(p) {
  cart.value = { ...cart.value, [p.id]: (cart.value[p.id] || 0) + 1 };
}
function setQty(id, q) {
  const next = { ...cart.value };
  if (q < 1) delete next[id];
  else next[id] = q;
  cart.value = next;
}

/* ── checkout ── */
const email = ref("");
const checkoutLoading = ref(false);
const checkoutError = ref("");

async function payWithStripe() {
  checkoutError.value = "";
  if (!email.value.trim()) { checkoutError.value = "Enter your email."; return; }
  if (!cartItems.value.length) { checkoutError.value = "Cart is empty."; return; }
  checkoutLoading.value = true;
  try {
    const origin = window.location.origin;
    const { checkout_url } = await createCheckout({
      customer_email: email.value.trim(),
      items: cartItems.value.map((i) => ({ product_id: i.id, quantity: i.quantity })),
      success_url: `${origin}/#/success`,
      cancel_url: `${origin}/#/`,
    });
    window.location.href = checkout_url;
  } catch (e) {
    checkoutError.value = e.message || "Checkout failed";
  } finally {
    checkoutLoading.value = false;
  }
}

/* ── order success ── */
function getSessionId() {
  const u = new URL(window.location.href);
  let sid = u.searchParams.get("session_id");
  if (!sid && u.hash) {
    const hash = u.hash.startsWith("#") ? u.hash.slice(1) : u.hash;
    const qi = hash.indexOf("?");
    if (qi !== -1) sid = new URLSearchParams(hash.slice(qi + 1)).get("session_id");
  }
  return sid || "";
}
const sessionId = computed(() => getSessionId());
const orderResult = ref(null);
const orderError = ref("");

watch(
  () => [route.value, sessionId.value],
  async ([r, sid]) => {
    if (r !== "success" || !sid) return;
    orderError.value = "";
    orderResult.value = null;
    try { orderResult.value = await fetchOrderStatus({ session_id: sid }); }
    catch (e) { orderError.value = e.message || "Could not load order"; }
  },
  { immediate: true }
);

onMounted(async () => {
  readHash();
  window.addEventListener("hashchange", readHash);
  try { allProducts.value = await fetchProducts(); }
  catch (e) { error.value = e.message || "Could not load catalog"; }
  finally { loading.value = false; }
});

onUnmounted(() => {
  window.removeEventListener("hashchange", readHash);
});
</script>

<template>
  <!-- ═══════════════════════  NAVBAR  ═══════════════════════ -->
  <nav class="navbar">
    <div class="nav-inner">
      <!-- Logo -->
      <a href="#/" class="logo" @click="clearSearch">
        <span class="logo-badge">Vue</span>
        <span class="logo-text">Demo<strong>Shop</strong></span>
      </a>

      <!-- Search bar -->
      <form class="search-bar" @submit.prevent="doSearch">
        <input
          v-model="searchInput"
          type="search"
          class="search-input"
          placeholder="Search products…"
          aria-label="Search products"
          @keyup.enter="doSearch"
        />
        <button type="submit" class="search-btn" aria-label="Search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>
      </form>

      <!-- Cart toggle -->
      <button type="button" class="cart-btn" @click="cartOpen = !cartOpen">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        <span v-if="cartCount > 0" class="cart-count">{{ cartCount }}</span>
        <span class="cart-label">Cart</span>
      </button>
    </div>

    <!-- Search results hint -->
    <div v-if="searchQuery" class="search-hint">
      Showing results for "<strong>{{ searchQuery }}</strong>"
      <button type="button" class="clear-search" @click="clearSearch">✕ Clear</button>
    </div>
  </nav>

  <!-- ═══════════════════════  SHOP / PRODUCT  ═══════════════════════ -->
  <div v-if="route === 'shop' || route === 'product'" class="page-wrap">
    <div class="content-area">
      <section v-if="route === 'shop'" class="catalog">
        <p v-if="loading" class="muted center">Loading products…</p>
        <p v-else-if="error && !allProducts.length" class="err center">{{ error }}</p>
        <p v-else-if="!products.length" class="muted center">
          No products match "{{ searchQuery }}".
        </p>
        <div v-else class="grid">
          <article v-for="p in products" :key="p.id" class="card">
            <a :href="`#/product/${p.slug}`" class="card-hit" :aria-label="`View ${p.name}`">
              <div class="img-wrap">
                <img v-if="p.image_url" :src="p.image_url" :alt="p.name" loading="lazy" />
                <div v-else class="ph" />
              </div>
            </a>
            <div class="card-body">
              <a :href="`#/product/${p.slug}`" class="card-title-link">
                <h2 class="card-title">{{ p.name }}</h2>
              </a>
              <span v-if="p.category" class="card-category">{{ p.category.name }}</span>
              <p class="card-desc">{{ p.description }}</p>
              <div class="star-row">
                <span class="stars">★★★★☆</span>
                <span class="review-count">({{ p.stock }} in stock)</span>
              </div>
              <div class="price-row">
                <span class="price">${{ Number(p.price).toFixed(2) }}</span>
              </div>
              <button type="button" class="add-btn" @click.prevent="addToCart(p)">
                Add to Cart
              </button>
            </div>
          </article>
        </div>
      </section>

      <section v-else class="catalog product-detail-wrap">
        <p v-if="detailLoading" class="muted center">Loading product…</p>
        <p v-else-if="detailError" class="err center">{{ detailError }}</p>
        <div v-else-if="detailProduct" class="product-detail">
          <a href="#/" class="back-link">← Back to shop</a>
          <div class="product-detail-grid">
            <div class="product-detail-media">
              <img
                v-if="detailProduct.image_url"
                :src="detailProduct.image_url"
                :alt="detailProduct.name"
              />
              <div v-else class="ph detail-ph" />
            </div>
            <div class="product-detail-info">
              <span v-if="detailProduct.category" class="detail-category">
                {{ detailProduct.category.name }}
              </span>
              <h1 class="product-detail-title">{{ detailProduct.name }}</h1>
              <p class="product-detail-desc">{{ detailProduct.description }}</p>
              <div class="star-row">
                <span class="stars">★★★★☆</span>
                <span class="review-count">({{ detailProduct.stock }} in stock)</span>
              </div>
              <p class="product-detail-price">
                ${{ Number(detailProduct.price).toFixed(2) }}
              </p>
              <button type="button" class="add-btn detail-add" @click="addToCart(detailProduct)">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </section>

      <aside :class="['cart-panel', { open: cartOpen }]">
        <div class="cart-header">
          <h3>Shopping Cart</h3>
          <button type="button" class="close-cart" @click="cartOpen = false">✕</button>
        </div>

        <p v-if="!cartItems.length" class="muted small">Your cart is empty.</p>

        <ul v-else class="cart-list">
          <li v-for="i in cartItems" :key="i.id" class="cart-item">
            <img v-if="i.image_url" :src="i.image_url" :alt="i.name" class="cart-thumb" />
            <div class="cart-item-info">
              <span class="cart-item-name">{{ i.name }}</span>
              <span class="cart-item-price">${{ Number(i.price).toFixed(2) }}</span>
              <div class="qty-row">
                <button type="button" class="qty-btn" @click="setQty(i.id, i.quantity - 1)">−</button>
                <span class="qty-val">{{ i.quantity }}</span>
                <button type="button" class="qty-btn" @click="setQty(i.id, i.quantity + 1)">+</button>
                <button type="button" class="del-btn" @click="setQty(i.id, 0)">Delete</button>
              </div>
            </div>
          </li>
        </ul>

        <div v-if="cartItems.length" class="cart-footer">
          <div class="subtotal">
            Subtotal ({{ cartCount }} item{{ cartCount !== 1 ? 's' : '' }}):
            <strong>${{ cartTotal.toFixed(2) }}</strong>
          </div>
          <label class="lbl">Email for receipt</label>
          <input
            v-model="email"
            type="email"
            class="input"
            placeholder="you@example.com"
            autocomplete="email"
          />
          <p v-if="checkoutError" class="err small">{{ checkoutError }}</p>
          <button
            type="button"
            class="checkout-btn"
            :disabled="checkoutLoading"
            @click="payWithStripe"
          >
            {{ checkoutLoading ? "Redirecting…" : "Proceed to Checkout" }}
          </button>
        </div>
      </aside>
    </div>
  </div>

  <!-- ═══════════════════════  SUCCESS PAGE  ═══════════════════════ -->
  <div v-else class="page-wrap">
    <div class="success-box">
      <div class="success-icon">✓</div>
      <h2>Order Placed!</h2>
      <p v-if="orderError" class="err">{{ orderError }}</p>
      <template v-else-if="orderResult">
        <p>Status: <strong :class="orderResult.status === 'paid' ? 'paid' : ''">{{ orderResult.status }}</strong></p>
        <p>Email: {{ orderResult.customer_email }}</p>
        <p>Total: <strong>${{ Number(orderResult.total).toFixed(2) }}</strong></p>
        <ul class="order-items">
          <li v-for="it in orderResult.items" :key="it.product">
            {{ it.product_name }} × {{ it.quantity }}
          </li>
        </ul>
        <p v-if="orderResult.status === 'pending'" class="muted small">
          Order will be marked <em>paid</em> once Stripe confirms via webhook.
          Refresh in a moment if testing with the Stripe CLI.
        </p>
      </template>
      <p v-else class="muted">Loading order details…</p>
      <a href="#/" class="back-btn">← Continue Shopping</a>
    </div>
  </div>
</template>

<style scoped>
/* ── Navbar ── */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--navbar-bg);
  color: #fff;
}
.nav-inner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.55rem 1rem;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  text-decoration: none;
  color: #fff;
  white-space: nowrap;
}
.logo:hover { text-decoration: none; color: var(--accent); }
.logo-badge {
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border: 1px solid var(--accent);
  padding: 0.15rem 0.4rem;
  border-radius: 3px;
  color: var(--accent);
}
.logo-text {
  font-size: 1.15rem;
  letter-spacing: -0.02em;
}

/* Search */
.search-bar {
  flex: 1;
  display: flex;
  border-radius: var(--radius);
  overflow: hidden;
  border: 2px solid var(--accent);
  max-width: 700px;
}
.search-input {
  flex: 1;
  padding: 0.52rem 0.75rem;
  border: none;
  outline: none;
  font-size: 0.95rem;
  background: #fff;
  color: #111;
  min-width: 0;
}
.search-input::-webkit-search-cancel-button { cursor: pointer; }
.search-btn {
  background: var(--accent);
  border: none;
  padding: 0 0.9rem;
  color: #111;
  display: flex;
  align-items: center;
  transition: background 0.15s;
}
.search-btn:hover { background: var(--accent-hover); color: #fff; }

/* Cart button */
.cart-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: transparent;
  border: 1px solid transparent;
  color: #fff;
  padding: 0.4rem 0.6rem;
  border-radius: var(--radius);
  position: relative;
  white-space: nowrap;
}
.cart-btn:hover { border-color: #fff; }
.cart-count {
  position: absolute;
  top: 0;
  right: 2.2rem;
  background: var(--accent);
  color: #111;
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cart-label { font-size: 0.85rem; font-weight: 600; }

/* Search hint bar */
.search-hint {
  background: #232f3e;
  color: #ccc;
  font-size: 0.85rem;
  padding: 0.35rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.clear-search {
  background: transparent;
  border: none;
  color: var(--accent);
  cursor: pointer;
  font-size: 0.82rem;
  padding: 0;
}
.clear-search:hover { text-decoration: underline; }

/* ── Page layout ── */
.page-wrap {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
}
.content-area {
  display: grid;
  gap: 1.25rem;
}
@media (min-width: 960px) {
  .content-area {
    grid-template-columns: 1fr 300px;
    align-items: start;
  }
}

/* ── Product grid ── */
.catalog { min-width: 0; }
.grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.15s;
}
.card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.12); }

.card-hit {
  display: block;
  text-decoration: none;
  color: inherit;
}
.card-title-link {
  text-decoration: none;
  color: inherit;
}
.card-title-link:hover .card-title {
  color: #c45500;
  text-decoration: underline;
}
.card-category {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted);
  font-weight: 600;
}

.img-wrap {
  aspect-ratio: 4/3;
  background: #f8f8f8;
  overflow: hidden;
}
.img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.2s;
}
.card:hover .img-wrap img { transform: scale(1.03); }
.ph { width: 100%; height: 100%; background: #eee; }

.card-body {
  padding: 0.85rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.card-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #0066c0;
  cursor: pointer;
}
.card-title:hover { color: #c45500; text-decoration: underline; }
.card-desc { font-size: 0.8rem; color: var(--muted); margin: 0; }

.star-row { display: flex; align-items: center; gap: 0.35rem; margin-top: 0.15rem; }
.stars { color: #f90; font-size: 0.85rem; letter-spacing: 1px; }
.review-count { font-size: 0.75rem; color: #0066c0; }

.price-row { margin-top: auto; padding-top: 0.4rem; }
.price { font-size: 1.1rem; font-weight: 700; color: #b12704; }

.add-btn {
  margin-top: 0.5rem;
  width: 100%;
  padding: 0.5rem;
  background: var(--accent);
  border: 1px solid #c8a908;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #111;
  transition: background 0.15s;
}
.add-btn:hover { background: var(--accent-hover); color: #fff; }

/* ── Cart panel ── */
.cart-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
  position: sticky;
  top: 70px;
}
@media (max-width: 959px) {
  .cart-panel {
    position: fixed;
    top: 0; right: -340px;
    width: 320px; height: 100vh;
    overflow-y: auto;
    z-index: 200;
    transition: right 0.25s ease;
    border-radius: 0;
    box-shadow: -4px 0 20px rgba(0,0,0,0.2);
  }
  .cart-panel.open { right: 0; }
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.5rem;
}
.cart-header h3 { margin: 0; font-size: 1rem; color: #b12704; }
.close-cart {
  background: transparent;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: var(--muted);
  display: none;
}
@media (max-width: 959px) { .close-cart { display: block; } }

.cart-list {
  list-style: none;
  padding: 0;
  margin: 0 0 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.cart-item {
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
}
.cart-thumb {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border: 1px solid var(--border);
  border-radius: 3px;
  flex-shrink: 0;
}
.cart-item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.cart-item-name { font-size: 0.85rem; font-weight: 600; }
.cart-item-price { font-size: 0.9rem; color: #b12704; font-weight: 700; }
.qty-row {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.qty-btn {
  width: 24px; height: 24px;
  border: 1px solid var(--border);
  background: #f0f2f2;
  border-radius: 3px;
  font-size: 0.9rem;
}
.qty-btn:hover { background: #e3e6e6; }
.qty-val { font-size: 0.85rem; min-width: 18px; text-align: center; }
.del-btn {
  background: transparent;
  border: none;
  color: #0066c0;
  font-size: 0.78rem;
  cursor: pointer;
  padding: 0;
}
.del-btn:hover { text-decoration: underline; color: #c45500; }

.cart-footer {
  border-top: 1px solid var(--border);
  padding-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.subtotal { font-size: 0.9rem; }

.lbl {
  display: block;
  font-size: 0.78rem;
  color: var(--muted);
}
.input {
  width: 100%;
  padding: 0.45rem 0.6rem;
  border: 1px solid #aaa;
  border-radius: var(--radius);
  font-size: 0.9rem;
  background: #fff;
  color: #111;
}
.input:focus { outline: 2px solid #e47911; border-color: #e47911; }

.checkout-btn {
  width: 100%;
  padding: 0.6rem;
  background: var(--accent);
  border: 1px solid #c8a908;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #111;
  margin-top: 0.25rem;
}
.checkout-btn:hover:not(:disabled) { background: var(--accent-hover); color: #fff; }
.checkout-btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── Success page ── */
.success-box {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 2rem;
  max-width: 520px;
  margin: 2rem auto;
}
.success-icon {
  width: 52px; height: 52px;
  background: #067d62;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}
.success-box h2 { margin: 0 0 0.75rem; }
.paid { color: #067d62; text-transform: uppercase; letter-spacing: 0.05em; }
.order-items {
  padding-left: 1.1rem;
  font-size: 0.9rem;
  margin: 0.5rem 0;
}
.back-btn {
  display: inline-block;
  margin-top: 1.25rem;
  padding: 0.5rem 1.1rem;
  background: var(--accent);
  border: 1px solid #c8a908;
  border-radius: 20px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  color: #111;
}
.back-btn:hover { background: var(--accent-hover); color: #fff; text-decoration: none; }

/* ── Utilities ── */
.muted { color: var(--muted); }
.small { font-size: 0.82rem; }
.err { color: #b12704; font-size: 0.9rem; }
.center { text-align: center; padding: 2rem; }

.product-detail-wrap { min-height: 280px; }
.product-detail { max-width: 900px; }
.back-link {
  display: inline-block;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #0066c0;
  text-decoration: none;
}
.back-link:hover { text-decoration: underline; color: #c45500; }
.product-detail-grid {
  display: grid;
  gap: 1.5rem;
  align-items: start;
}
@media (min-width: 720px) {
  .product-detail-grid {
    grid-template-columns: 1fr 1fr;
  }
}
.product-detail-media {
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--border);
  background: #f8f8f8;
}
.product-detail-media img {
  width: 100%;
  display: block;
  aspect-ratio: 4/3;
  object-fit: cover;
}
.detail-ph { min-height: 240px; }
.detail-category {
  display: inline-block;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
  font-weight: 600;
  margin-bottom: 0.35rem;
}
.product-detail-title {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  color: #111;
}
.product-detail-desc {
  margin: 0 0 0.75rem;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #333;
}
.product-detail-price {
  font-size: 1.75rem;
  font-weight: 700;
  color: #b12704;
  margin: 0.5rem 0 0;
}
.detail-add { max-width: 280px; }
</style>
