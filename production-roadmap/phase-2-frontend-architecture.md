# Phase 2: Frontend Architecture & Global State

## Goal
Solve UI rendering bottlenecks, duplicate API calls, and maintainability issues caused by massive "God Components."

## Detailed Plan of Action

### 1. Component Modularization
Massive files are difficult to test and maintain.

* **Deconstruct `frontend/src/pages/Admin.jsx`**:
  * Extract the inventory table to `frontend/src/components/features/admin/InventoryTable.jsx`.
  * Extract the sales chart to `frontend/src/components/features/admin/SalesChart.jsx`.
  * Extract the modal forms to `frontend/src/components/features/admin/AddSweetModal.jsx`. 
* **Deconstruct `frontend/src/pages/cart.jsx`**:
  * Extract individual cart items to `frontend/src/components/features/cart/CartItem.jsx`.
  * Extract checkout summary to `frontend/src/components/features/cart/CheckoutSummary.jsx`.
  * Rename the file to standard PascalCase: `frontend/src/pages/Cart.jsx` and update `App.jsx` imports.

### 2. Server State Management (React Query)
Currently, `useEffect` and `useState` are manually used for data fetching, causing redundant network calls.

* **Setup**: Wrap `frontend/src/main.jsx` with the `<QueryClientProvider>`.
* **Refactor Fetching**:
  * Remove generic `axios.get` calls from `useEffect` hooks.
  * Create custom hooks, e.g., `frontend/src/api/queries/useSweets.js`, containing `useQuery` to automatically cache identical data requests.
  * Use `useMutation` for POST/PUT/DELETE actions so the cache automatically invalidates and updates the UI instantly without manual page reloads.

### 3. Global Client State (Zustand)
Prop-drilling and scattered state make user sessions and cart data hard to track.

* **Create `frontend/src/store/useCartStore.js`**:
  * Manage cart additions, subtractions, and checkout clear logic globally.
  * Replace the local arrays or generic contexts currently managing the Cart.
* **Create `frontend/src/store/useAuthStore.js`**:
  * Track user login state globally.
  * Update `Navbar.jsx` and protected routes (like `Admin.jsx`) to read directly from this single global source.
