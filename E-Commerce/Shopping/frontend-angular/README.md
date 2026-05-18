# Frontend — Angular

This is the **Angular** version of the Shopping frontend. It provides a modern, responsive UI for browsing products and checking out using Stripe.

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
   npm start
   ```
   The app will be available at `http://localhost:4200`

3. **Build for production:**
   ```bash
   npm run build
   ```

## Project Structure

### `src/`
Main application source code:

#### **`main.ts`**
Entry point of the Angular application. Bootstraps the root component.

#### **`index.html`**
HTML shell that hosts the Angular app. Contains the `<app-root>` element.

#### **`styles.css`**
Global styles applied across the entire application.

#### **`app/`**
Core application components and services:

##### **Components**

**`app.component.ts`**
- Root component that wraps all pages
- Contains the main router outlet where pages render

**`shop/shop.component.ts`**
- Main product listing page
- Displays all active products from the API
- Shows product cards with name, price, image, and stock
- "Add to Cart" button adds products to the shopping cart

**`product-detail/product-detail.component.ts`**
- Detailed view for a single product
- Shows full description, larger image, and detailed specs
- Route: `/products/:slug`

**`cart-panel/cart-panel.component.ts`**
- Shopping cart sidebar (or modal)
- Displays cart items, quantities, and total price
- "Checkout" button initiates Stripe payment flow
- Updates when items are added/removed

**`success/success.component.ts`**
- Confirmation page after successful payment
- Shows order confirmation message
- Route: `/success`

##### **Services**

**`services/shop-api.service.ts`**
Handles all HTTP communication with the Django backend:
- `getProducts()` — Fetch product list
- `getProductBySlug(slug)` — Fetch single product details
- `checkout(items, email)` — Send cart to backend and get Stripe checkout URL

**`services/cart.service.ts`**
Manages the shopping cart state:
- `addItem(product, quantity)` — Add item to cart
- `removeItem(productId)` — Remove item from cart
- `getCart()` — Get all items in cart
- `getTotal()` — Calculate cart total
- `clearCart()` — Empty the cart

##### **Models**

**`models/product.model.ts`**
- TypeScript interface for Product data
- Matches the backend Product model structure

##### **Routing & Config**

**`app.routes.ts`**
Defines all application routes:
- `/` — Shop page (product list)
- `/products/:slug` — Product detail page
- `/cart` — Shopping cart
- `/success` — Payment success page

**`app.config.ts`**
Application configuration (providers, settings).

### `assets/`
Static files (images, icons, etc.) served as-is.

### `environments/`
Environment-specific configuration:
- **`environment.ts`** — Development environment variables (API URL, etc.)

## Key Features

### Product Browsing
- List all active products with stock available
- Click to view detailed product information
- Filter/sort by category or price (if implemented)

### Shopping Cart
- Add products with custom quantities
- View cart total in real-time
- Remove items from cart
- Cart persists during session (or in localStorage)

### Secure Checkout
- Enter email address
- Click "Checkout" to redirect to Stripe
- All payment handling done securely by Stripe
- After payment, redirected to success page

### Responsive Design
- Works on desktop, tablet, and mobile
- CSS Grid/Flexbox layouts
- Touch-friendly buttons and inputs

## Component Tree
```
app.component (root)
├── shop.component (product list)
├── product-detail.component (product view)
├── cart-panel.component (cart sidebar)
└── success.component (order confirmation)
```

## Data Flow

### Loading Products
```
shop.component
  └─> shop-api.service.getProducts()
      └─> GET /api/products/ (backend)
          └─> [products displayed]
```

### Adding to Cart
```
product.component ("Add to Cart" click)
  └─> cart.service.addItem(product)
      └─> [cart updated, total recalculated]
```

### Checkout
```
cart-panel.component ("Checkout" click)
  └─> shop-api.service.checkout(items, email)
      └─> POST /api/checkout/ (backend)
          └─> Stripe session created
              └─> window.location = checkout_url (Stripe)
                  └─> Payment completed
                      └─> Redirect to /success
```

## Configuration

### API URL
Edit `environments/environment.ts` to set the backend API URL:
```typescript
export const environment = {
  apiUrl: 'http://localhost:8000/api'
};
```

### Stripe Key
Not needed in frontend — payment is handled securely by backend and Stripe.

## Styles

### `shop.component.css`
Styles for product listing (grid layout, cards).

### `product-detail.component.css`
Styles for product detail page.

### `cart-panel.component.css`
Styles for shopping cart sidebar/modal.

### `success.component.css`
Styles for success page.

### `styles.css`
Global styles (fonts, colors, utilities).

## Development

### Running the App
```bash
npm start
```

### Building Production
```bash
npm run build
```
Output goes to `dist/shopping-angular/`.

### Running Tests
```bash
npm test
```

### Debugging
- Use Angular DevTools browser extension
- Open browser DevTools (F12) and check Network tab for API calls
- Check Console for errors

## Connecting to Backend

1. Ensure backend is running: `python manage.py runserver` (port 8000)
2. Check `environment.ts` for correct API URL
3. Refresh the Angular app at `http://localhost:4200`
4. If you see CORS errors, verify backend's `CORS_ALLOWED_ORIGINS` includes `http://localhost:4200`

## Troubleshooting

### Products not loading
- Check browser console for errors
- Verify backend is running
- Check Network tab in DevTools for API response

### Checkout button not working
- Ensure backend has `STRIPE_SECRET_KEY` configured
- Check backend logs for errors

### Styling issues
- Clear browser cache (Ctrl+Shift+Del)
- Run `npm run build` and test production build

## Tech Stack
- **Framework:** Angular 16
- **Language:** TypeScript
- **Build Tool:** Angular CLI
- **HTTP:** HttpClient (RxJS)
- **Styling:** CSS
