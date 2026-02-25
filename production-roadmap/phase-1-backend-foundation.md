# Phase 1: Backend Foundation & Data Integrity

## Goal
Establish a single source of truth for the database and separate business logic from routing, making the backend modular, readable, and ready to scale.

## Detailed Plan of Action

### 1. ORM Standardization (Remove Mongoose)
* **`backend/package.json`**: Uninstall `mongoose`.
* **`backend/src/models/*`**: Delete all Mongoose schemas (`User.js`, `Sweet.js`, `Sales.js`, `Notification.js`).
* **`backend/prisma/schema.prisma`**: Establish the ultimate source of truth here. Ensure all relations are correctly mapped.

### 2. Implement N-Tier Architecture (Controllers & Services)
Currently, routes contain all business logic. We will decompose them:

#### Refactoring `sweets.js` (Example Pattern)
* **Create `backend/src/services/sweetService.js`**:
  * Move the Prisma `findMany()`, `create()`, and `update()` logic here.
  * Handle business logic like formatting names to Title Case here.
* **Create `backend/src/controllers/sweetController.js`**:
  * Extract `req.body` and `req.params`.
  * Call `sweetService.js`.
  * Return standard HTTP responses (e.g., `res.status(200).json()`).
* **Update `backend/src/routes/sweets.js`**:
  * Make this file purely declarative routing: `router.get('/', sweetController.getAllSweets)`.

*Repeat this pattern for:*
* `users.js` -> `userService.js` / `userController.js`
* `sales.js` -> `saleService.js` / `saleController.js`
* `notifications.js` -> `notificationService.js` / `notificationController.js`

### 3. Data Validation
* **Install Zod**: Add `zod` to `backend/package.json`.
* **Create `backend/src/validators/*`**:
  * E.g., `sweetValidator.js` to enforce strict types (e.g., `price` must be a positive number, `name` must be a string).
* **Create Validation Middleware `backend/src/middleware/validate.js`**:
  * Intercept incoming requests and validate them against the Zod schema before they reach the Controller.
