import { useCallback, useEffect, useMemo, useState } from "react";
import { createCheckout, fetchOrderStatus, fetchProduct, fetchProducts } from "./api.js";
import "./App.css";

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

function parseHash() {
  const h = window.location.hash.replace(/^#\/?/, "");
  if (h.startsWith("success")) return { page: "success", slug: "" };
  if (h.startsWith("product/")) {
    const slug = decodeURIComponent(
      h.slice("product/".length).split("/")[0].split("?")[0] || ""
    );
    return { page: slug ? "product" : "shop", slug };
  }
  return { page: "shop", slug: "" };
}

export default function App() {
  const [{ page, slug }, setNav] = useState(parseHash);
  useEffect(() => {
    const onHash = () => setNav(parseHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  /* ── data ── */
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchProducts();
        if (!cancelled) setAllProducts(data);
      } catch (e) {
        if (!cancelled) setError(e.message || "Could not load catalog");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* ── product detail ── */
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  useEffect(() => {
    if (page !== "product" || !slug) {
      setDetail(null);
      setDetailError("");
      setDetailLoading(false);
      return;
    }
    let cancelled = false;
    setDetail(null);
    setDetailError("");
    setDetailLoading(true);
    (async () => {
      try {
        const d = await fetchProduct(slug);
        if (!cancelled) setDetail(d);
      } catch (e) {
        if (!cancelled) setDetailError(e.message || "Could not load product");
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [page, slug]);

  /* ── search ── */
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  function doSearch(e) {
    if (e) e.preventDefault();
    setSearchQuery(searchInput.trim().toLowerCase());
  }
  function clearSearch() { setSearchInput(""); setSearchQuery(""); }

  const products = useMemo(() => {
    if (!searchQuery) return allProducts;
    return allProducts.filter((p) => {
      const cat = (p.category?.name || "").toLowerCase();
      return (
        p.name.toLowerCase().includes(searchQuery) ||
        p.description.toLowerCase().includes(searchQuery) ||
        cat.includes(searchQuery)
      );
    });
  }, [allProducts, searchQuery]);

  /* ── cart ── */
  const [cart, setCart] = useState({});
  const cartItems = useMemo(() => {
    const ids = Object.keys(cart);
    return ids
      .map((id) => {
        const fromList = allProducts.find((p) => p.id === id);
        if (fromList) return { ...fromList, quantity: cart[id] };
        if (detail && detail.id === id) return { ...detail, quantity: cart[id] };
        return null;
      })
      .filter(Boolean);
  }, [allProducts, cart, detail]);
  const cartTotal = useMemo(
    () => cartItems.reduce((s, i) => s + Number(i.price) * i.quantity, 0),
    [cartItems]
  );
  const cartCount = useMemo(
    () => cartItems.reduce((s, i) => s + i.quantity, 0),
    [cartItems]
  );
  const [cartOpen, setCartOpen] = useState(false);

  const addToCart = useCallback((p) => {
    setCart((c) => ({ ...c, [p.id]: (c[p.id] || 0) + 1 }));
  }, []);
  const setQty = useCallback((id, q) => {
    setCart((c) => {
      const next = { ...c };
      if (q < 1) delete next[id];
      else next[id] = q;
      return next;
    });
  }, []);

  /* ── checkout ── */
  const [email, setEmail] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  async function payWithStripe() {
    setCheckoutError("");
    if (!email.trim()) { setCheckoutError("Enter your email."); return; }
    if (!cartItems.length) { setCheckoutError("Cart is empty."); return; }
    setCheckoutLoading(true);
    try {
      const origin = window.location.origin;
      const { checkout_url } = await createCheckout({
        customer_email: email.trim(),
        items: cartItems.map((i) => ({ product_id: i.id, quantity: i.quantity })),
        success_url: `${origin}/#/success`,
        cancel_url: `${origin}/#/`,
      });
      window.location.href = checkout_url;
    } catch (e) {
      setCheckoutError(e.message || "Checkout failed");
    } finally {
      setCheckoutLoading(false);
    }
  }

  /* ── order success ── */
  const sessionId = getSessionId();
  const [orderResult, setOrderResult] = useState(null);
  const [orderError, setOrderError] = useState("");
  useEffect(() => {
    if (page !== "success" || !sessionId) return;
    let cancelled = false;
    setOrderError(""); setOrderResult(null);
    (async () => {
      try {
        const o = await fetchOrderStatus({ session_id: sessionId });
        if (!cancelled) setOrderResult(o);
      } catch (e) {
        if (!cancelled) setOrderError(e.message || "Could not load order");
      }
    })();
    return () => { cancelled = true; };
  }, [page, sessionId]);

  const cartAside = (
    <aside className={`cart-panel${cartOpen ? " open" : ""}`}>
      <div className="cart-header">
        <h3>Shopping Cart</h3>
        <button type="button" className="close-cart" onClick={() => setCartOpen(false)}>✕</button>
      </div>

      {!cartItems.length && <p className="muted small">Your cart is empty.</p>}

      {cartItems.length > 0 && (
        <ul className="cart-list">
          {cartItems.map((i) => (
            <li key={i.id} className="cart-item">
              {i.image_url && (
                <img src={i.image_url} alt={i.name} className="cart-thumb" />
              )}
              <div className="cart-item-info">
                <span className="cart-item-name">{i.name}</span>
                <span className="cart-item-price">${Number(i.price).toFixed(2)}</span>
                <div className="qty-row">
                  <button type="button" className="qty-btn" onClick={() => setQty(i.id, i.quantity - 1)}>−</button>
                  <span className="qty-val">{i.quantity}</span>
                  <button type="button" className="qty-btn" onClick={() => setQty(i.id, i.quantity + 1)}>+</button>
                  <button type="button" className="del-btn" onClick={() => setQty(i.id, 0)}>Delete</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {cartItems.length > 0 && (
        <div className="cart-footer">
          <div className="subtotal">
            Subtotal ({cartCount} item{cartCount !== 1 ? "s" : ""}):&nbsp;
            <strong>${cartTotal.toFixed(2)}</strong>
          </div>
          <label className="lbl">Email for receipt</label>
          <input
            type="email"
            className="input"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {checkoutError && <p className="err small">{checkoutError}</p>}
          <button
            type="button"
            className="checkout-btn"
            disabled={checkoutLoading}
            onClick={payWithStripe}
          >
            {checkoutLoading ? "Redirecting…" : "Proceed to Checkout"}
          </button>
        </div>
      )}
    </aside>
  );

  /* ── render ── */
  return (
    <>
      <nav className="navbar">
        <div className="nav-inner">
          <a href="#/" className="logo" onClick={clearSearch}>
            <span className="logo-badge">React</span>
            <span className="logo-text">Demo<strong>Shop</strong></span>
          </a>

          <form className="search-bar" onSubmit={doSearch}>
            <input
              type="search"
              className="search-input"
              placeholder="Search products…"
              aria-label="Search products"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="search-btn" aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          </form>

          <button type="button" className="cart-btn" onClick={() => setCartOpen((o) => !o)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            <span className="cart-label">Cart</span>
          </button>
        </div>

        {searchQuery && (
          <div className="search-hint">
            Showing results for "<strong>{searchQuery}</strong>"
            <button type="button" className="clear-search" onClick={clearSearch}>✕ Clear</button>
          </div>
        )}
      </nav>

      {page === "success" ? (
        <div className="page-wrap">
          <div className="success-box">
            <div className="success-icon">✓</div>
            <h2>Order Placed!</h2>
            {orderError && <p className="err">{orderError}</p>}
            {!orderError && orderResult && (
              <>
                <p>Status: <strong className={orderResult.status === "paid" ? "paid" : ""}>{orderResult.status}</strong></p>
                <p>Email: {orderResult.customer_email}</p>
                <p>Total: <strong>${Number(orderResult.total).toFixed(2)}</strong></p>
                <ul className="order-items">
                  {orderResult.items.map((it) => (
                    <li key={it.product}>{it.product_name} × {it.quantity}</li>
                  ))}
                </ul>
                {orderResult.status === "pending" && (
                  <p className="muted small">
                    Order will be marked <em>paid</em> once Stripe confirms via webhook.
                    Refresh in a moment if testing with the Stripe CLI.
                  </p>
                )}
              </>
            )}
            {!orderError && !orderResult && <p className="muted">Loading order details…</p>}
            <a href="#/" className="back-btn">← Continue Shopping</a>
          </div>
        </div>
      ) : (
        <div className="page-wrap">
          <div className="content-area">
            {page === "shop" ? (
              <section className="catalog">
                {loading && <p className="muted center">Loading products…</p>}
                {!loading && error && !allProducts.length && <p className="err center">{error}</p>}
                {!loading && !error && products.length === 0 && (
                  <p className="muted center">No products match "{searchQuery}".</p>
                )}
                {!loading && products.length > 0 && (
                  <div className="grid">
                    {products.map((p) => (
                      <article key={p.id} className="card">
                        <a href={`#/product/${p.slug}`} className="card-hit" aria-label={`View ${p.name}`}>
                          <div className="img-wrap">
                            {p.image_url
                              ? <img src={p.image_url} alt={p.name} loading="lazy" />
                              : <div className="ph" />}
                          </div>
                        </a>
                        <div className="card-body">
                          <a href={`#/product/${p.slug}`} className="card-title-link">
                            <h2 className="card-title">{p.name}</h2>
                          </a>
                          {p.category && (
                            <span className="card-category">{p.category.name}</span>
                          )}
                          <p className="card-desc">{p.description}</p>
                          <div className="star-row">
                            <span className="stars">★★★★☆</span>
                            <span className="review-count">({p.stock} in stock)</span>
                          </div>
                          <div className="price-row">
                            <span className="price">${Number(p.price).toFixed(2)}</span>
                          </div>
                          <button
                            type="button"
                            className="add-btn"
                            onClick={(e) => { e.preventDefault(); addToCart(p); }}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            ) : (
              <section className="catalog product-detail-wrap">
                {detailLoading && <p className="muted center">Loading product…</p>}
                {detailError && <p className="err center">{detailError}</p>}
                {!detailLoading && detail && (
                  <div className="product-detail">
                    <a href="#/" className="back-link">← Back to shop</a>
                    <div className="product-detail-grid">
                      <div className="product-detail-media">
                        {detail.image_url
                          ? <img src={detail.image_url} alt={detail.name} />
                          : <div className="ph detail-ph" />}
                      </div>
                      <div className="product-detail-info">
                        {detail.category && (
                          <span className="detail-category">{detail.category.name}</span>
                        )}
                        <h1 className="product-detail-title">{detail.name}</h1>
                        <p className="product-detail-desc">{detail.description}</p>
                        <div className="star-row">
                          <span className="stars">★★★★☆</span>
                          <span className="review-count">({detail.stock} in stock)</span>
                        </div>
                        <p className="product-detail-price">${Number(detail.price).toFixed(2)}</p>
                        <button
                          type="button"
                          className="add-btn detail-add"
                          onClick={() => addToCart(detail)}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}
            {cartAside}
          </div>
        </div>
      )}
    </>
  );
}
