# Frontend — Vue

This is the **Vue 3** version of the Shopping frontend. It provides a progressive, component-based UI for browsing products and checking out using Stripe.

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
   The app will be available at `http://localhost:5173`

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

#### **`main.js`**
Entry point that creates the Vue 3 app and mounts it to the DOM:
```javascript
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

#### **`index.html`**
HTML shell hosting the Vue app. Contains the `<div id="app">` element where Vue renders.

#### **`App.vue`**
Root component written in Vue Single File Component (`.vue`) format:
- Contains `<template>` (HTML structure)
- Contains `<script>` (JavaScript logic)
- Contains `<style>` (component styles)
- Defines application routes and page navigation
- Manages global state (if using Pinia or composition API)

#### **`api.js`**
HTTP utility for communicating with the Django backend:
- `getProducts()` — Fetch all products
- `getProductBySlug(slug)` — Fetch single product details
- `checkout(items, email)` — Send cart to backend and get Stripe checkout URL
- Uses `fetch()` API for HTTP requests

#### **Page/Component Files** (if structured by feature)
- **`Shop.vue`** — Product listing page
  - Displays grid of product cards
  - Shows product name, price, image, stock
  - "Add to Cart" button for each product
  
- **`ProductDetail.vue`** — Product detail view
  - Full product information
  - Larger image and complete description
  - Add to cart with custom quantity selector
  
- **`Cart.vue`** — Shopping cart page
  - Lists all cart items
  - Shows quantity and subtotal for each item
  - "Checkout" button to proceed to payment
  
- **`Success.vue`** — Order confirmation page
  - Displays after successful Stripe payment
  - Shows order confirmation message

### `style.css` and `App.css` (or scoped styles)
Application styles:
- **`style.css`** — Global reset styles, utilities, custom properties
- **`App.css`** or scoped `<style>` — Layout and component-specific styles

## Key Features

### Product Browsing
- Display all active products with available stock
- Responsive product grid layout
- Click to view full product details with description
- Real-time stock availability display

### Shopping Cart
- Add products with custom quantities
- View cart total and item count
- Remove items from cart
- Cart state managed via Vue composition API or Pinia
- Cart persists in session (or localStorage for recovery)

### Secure Checkout
- Input customer email address
- Review complete cart before purchase
- Click "Checkout" to securely redirect to Stripe
- Backend handles all payment processing
- Redirect to success page upon payment completion

### Responsive Design
- Mobile-first CSS approach
- Flexbox and CSS Grid layouts
- Touch-friendly UI
- Works seamlessly on desktop, tablet, mobile

## Component Structure

### Single File Components (`.vue`)
Each component has three sections:

```vue
<template>
  <!-- HTML structure -->
</template>

<script>
import { ref, computed } from 'vue'
// JavaScript logic
</script>

<style scoped>
/* Scoped styles for this component only */
</style>
```

### Component Hierarchy
```
App.vue (root)
├── Shop.vue (product list)
├── ProductDetail.vue (product view)
├── Cart.vue (shopping cart)
└── Success.vue (confirmation)
```

## Reactivity & State

### Composition API (Recommended)
```javascript
import { ref, computed } from 'vue'

const products = ref([])
const cart = ref([])

const total = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
})
```

### Lifecycle Hooks
- **`onMounted()`** — Run after component is rendered (fetch data)
- **`onUnmounted()`** — Cleanup when component is removed
- **`watch()`** — React to state changes

## Data Flow

### Loading Products
```javascript
onMounted(() => {
  api.getProducts().then(data => {
    products.value = data
  })
})
```

### Adding to Cart
```javascript
const addToCart = (product, quantity) => {
  cart.value.push({ ...product, quantity })
}
```

### Checkout Flow
```javascript
const handleCheckout = async () => {
  const response = await api.checkout(cart.value, email.value)
  window.location.href = response.checkout_url // Redirect to Stripe
}
```

## API Integration

### `api.js` Functions

**`getProducts()`**
```javascript
export async function getProducts() {
  const response = await fetch(`${API_URL}/products/`)
  return response.json()
}
```

**`getProductBySlug(slug)`**
```javascript
export async function getProductBySlug(slug) {
  const response = await fetch(`${API_URL}/products/${slug}/`)
  return response.json()
}
```

**`checkout(items, email)`**
```javascript
export async function checkout(items, email) {
  const response = await fetch(`${API_URL}/checkout/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, customer_email: email, ... })
  })
  return response.json()
}
```

## Configuration

### Backend API URL
Edit `api.js` to configure the backend URL:
```javascript
const API_URL = 'http://localhost:8000/api'
```

### Environment Variables (Optional)
Create `.env.local`:
```
VITE_API_URL=http://localhost:8000/api
```

Then in `api.js`:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
```

## Development

### Running Dev Server
```bash
npm run dev
```
Vite provides instant Hot Module Replacement (HMR) for real-time updates.

### Building for Production
```bash
npm run build
```
Creates optimized production bundle in `dist/` directory.

### Preview Production Build
```bash
npm run preview
```
Test production build locally before deployment.

## Styling

### Scoped Styles
Each component can have `<style scoped>` to apply styles only to that component:
```vue
<style scoped>
.product-card {
  border: 1px solid #ccc;
  padding: 1rem;
}
</style>
```

### Global Styles
Global styles in `style.css` available to all components.

### CSS Features
- CSS Variables for theming
- Flexbox and CSS Grid for layouts
- Media queries for responsiveness
- Consider Tailwind CSS or UnoCSS for larger projects

## Connecting to Backend

1. Ensure backend is running: `python manage.py runserver` (port 8000)
2. Verify API URL in `api.js` is `http://localhost:8000/api`
3. Start Vue dev server: `npm run dev`
4. Open `http://localhost:5173` in browser
5. If CORS errors appear, check backend's `CORS_ALLOWED_ORIGINS` includes `http://localhost:5173`

## Troubleshooting

### Products not loading
- Check browser console (F12) for errors
- Open Network tab to inspect API request/response
- Verify backend is running on port 8000
- Confirm API URL is correct in `api.js`

### Checkout button not responding
- Verify backend has `STRIPE_SECRET_KEY` configured
- Check backend console for error logs
- Ensure checkout endpoint returns valid Stripe session URL

### Styles not applying
- Clear browser cache (Ctrl+Shift+Del)
- Restart dev server
- Check for typos in CSS class names
- Ensure CSS is imported correctly

### Hot reload not working
- Restart dev server: `npm run dev`
- Check Vite config (`vite.config.js`)
- Verify file paths are correct

## Debugging

### Vue DevTools
Install Vue DevTools browser extension to:
- Inspect component hierarchy
- View reactive state in real-time
- Track component props and events
- Profile performance

### Network Inspection
- Open browser DevTools (F12)
- Go to Network tab
- Filter by "Fetch/XHR" to see API calls
- Click requests to view headers, body, response

## Tech Stack
- **Framework:** Vue 3
- **Build Tool:** Vite 2.9
- **Language:** JavaScript (ES6+)
- **HTTP:** Fetch API
- **Styling:** CSS
- **State Management:** Vue Composition API (or Pinia optional)

## Performance Optimization
- Use `<script setup>` syntax for cleaner component code
- Lazy load heavy components with `defineAsyncComponent()`
- Memoize expensive calculations with `computed()`
- Monitor performance with Vue DevTools Profiler
