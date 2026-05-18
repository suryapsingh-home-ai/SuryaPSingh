# Frontend — React

This is the **React** version of the Shopping frontend. It provides a lightweight, fast UI for browsing products and checking out using Stripe.

## Quick Start

### Prerequisites
- Node.js 14+ and npm

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5174`

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## Project Structure

### `src/`
Main application source code:

#### **`main.jsx`**
Entry point that mounts the React app to the DOM. Bootstraps the root `App` component.

#### **`index.html`**
HTML shell hosting the React app. Contains the `<div id="root">` element where React renders.

#### **`App.jsx`**
Root component that orchestrates the entire application:
- Defines routes and page navigation
- Manages global state (if using context or state management)
- Renders page components based on current route

#### **`api.js`**
HTTP client utility for communicating with the Django backend:
- `getProducts()` — Fetch all products
- `getProductBySlug(slug)` — Fetch single product details
- `checkout(items, email)` — Send cart to backend and get Stripe checkout URL
- Uses `fetch()` API for HTTP requests

#### **Page/Component Files** (if structured by feature)
- **`Shop.jsx`** — Product listing page (if split into components)
- **`ProductDetail.jsx`** — Product detail view (if split into components)
- **`Cart.jsx`** — Shopping cart page (if split into components)
- **`Success.jsx`** — Order confirmation page (if split into components)

### `style.css` and `App.css`
Application styles:
- **`style.css`** — Global styles, resets, utilities
- **`App.css`** — Component-specific and layout styles

## Key Features

### Product Browsing
- Display all active products with available stock
- Product cards show name, price, image, and stock quantity
- Click to view full product details
- Responsive grid layout

### Shopping Cart
- Add products with custom quantities
- View cart total in real-time
- Remove items from cart
- Cart state managed via React hooks (useState/useContext)
- Cart may persist in localStorage for session recovery

### Secure Checkout
- Input customer email
- Review cart items and total
- Click "Checkout" to redirect to Stripe Checkout
- Backend and Stripe handle all sensitive payment data
- Redirect to success page after payment

### Responsive Design
- Mobile-first approach
- CSS Grid/Flexbox layouts
- Touch-friendly UI elements
- Works on all screen sizes

## Component Architecture

### Functional Components with Hooks
```jsx
// Example structure
App
├── Shop (page)
│   └── ProductCard components
├── ProductDetail (page)
├── Cart (page)
└── Success (page)
```

### State Management
- **`useState()`** for component-level state (products, cart items)
- **`useContext()`** for shared state (cart globally across app)
- **`useEffect()`** for API calls and side effects

## Data Flow

### Loading Products
```jsx
useEffect(() => {
  api.getProducts().then(products => setProducts(products));
}, []);
```

### Adding to Cart
```jsx
const addToCart = (product, quantity) => {
  // Add to cart state
  setCart([...cart, { product, quantity }]);
};
```

### Checkout Flow
```jsx
const handleCheckout = async () => {
  const response = await api.checkout(cart, email);
  window.location.href = response.checkout_url; // Redirect to Stripe
};
```

## API Integration

### `api.js` Functions

**`getProducts()`**
```javascript
async getProducts() {
  const response = await fetch(`${API_URL}/products/`);
  return response.json();
}
```

**`getProductBySlug(slug)`**
```javascript
async getProductBySlug(slug) {
  const response = await fetch(`${API_URL}/products/${slug}/`);
  return response.json();
}
```

**`checkout(items, email)`**
```javascript
async checkout(items, email) {
  const response = await fetch(`${API_URL}/checkout/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, customer_email: email, ... })
  });
  return response.json();
}
```

## Configuration

### Backend API URL
Edit `api.js` to set the correct backend URL:
```javascript
const API_URL = 'http://localhost:8000/api';
```

### Environment Variables
Create a `.env` file (optional):
```
VITE_API_URL=http://localhost:8000/api
```

Then in `api.js`:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
```

## Development

### Running Dev Server
```bash
npm run dev
```
Vite provides hot module replacement (HMR) for instant updates.

### Building for Production
```bash
npm run build
```
Output in `dist/` directory. Optimized and minified for deployment.

### Previewing Production Build
```bash
npm run preview
```
Test the production bundle locally.

## Styling

### CSS Approach
- Plain CSS with optional CSS modules for scoping
- Consider using Tailwind CSS or CSS-in-JS libraries for larger projects
- Global styles in `style.css`
- Component-specific styles in `App.css` or dedicated `.css` files

## Connecting to Backend

1. Ensure backend is running: `python manage.py runserver` (port 8000)
2. Check `api.js` for correct API URL (`http://localhost:8000/api`)
3. Start React dev server: `npm run dev`
4. Open `http://localhost:5174` in browser
5. If CORS errors appear, verify backend's `CORS_ALLOWED_ORIGINS` includes `http://localhost:5174`

## Troubleshooting

### Products not loading
- Check browser console (F12) for error messages
- Open Network tab to inspect API request and response
- Verify backend is running
- Check API URL in `api.js`

### Checkout not working
- Ensure backend has `STRIPE_SECRET_KEY` in `.env`
- Check backend console for errors
- Verify checkout API returns `checkout_url`

### Styling not applying
- Clear browser cache (Ctrl+Shift+Del)
- Restart dev server
- Check CSS file imports in components

### Hot reload not working
- Restart dev server
- Check Vite config (`vite.config.js`)

## Tech Stack
- **Framework:** React 18
- **Build Tool:** Vite 2.9
- **Language:** JavaScript (ES6+)
- **HTTP:** Fetch API
- **Styling:** CSS

## Performance Tips
- Use React DevTools Profiler to identify slow components
- Lazy load components with `React.lazy()` and `Suspense`
- Memoize expensive computations with `useMemo()`
- Use `useCallback()` to optimize re-renders
