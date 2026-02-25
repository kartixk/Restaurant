# Phase 3: Security & Reliability

## Goal
Harden the application against attacks and prevent raw infrastructure/SQL errors from crashing the Node process or leaking to the client.

## Detailed Plan of Action

### 1. Global Error Handler Middleware
Uncaught errors currently crash the app or leak database structures.

* **Create `backend/src/utils/AppError.js`**: Define a custom class to standardize API errors (status code + message).
* **Create `backend/src/middleware/errorHandler.js`**: 
  * Intercept all `next(err)` calls.
  * Format Prisma/Node errors into safe, generic JSON (e.g., stripping stack traces in production).
* **Update `backend/src/server.js`**: Bind the global `errorHandler` as the very last middleware before `app.listen()`.

### 2. Secure Authentication (HttpOnly Cookies)
`localStorage` is completely visible to any JavaScript on the page, making JWTs highly vulnerable to Cross-Site Scripting (XSS).

* **Update `backend/src/controllers/userController.js`** (Login Route):
  * Stop sending the JWT in the JSON response body.
  * Send the JWT via `res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' })`.
* **Update `backend/src/middleware/auth.js`**:
  * Extract token from `req.cookies.token` instead of `req.headers.authorization`. (Requires installing `cookie-parser`).
* **Update Frontend `axios` configuration**:
  * Configure `axios` to include `withCredentials: true` so cookies are sent automatically with every backend request.
  * Remove all `localStorage.setItem('token')` or `getItem` calls across the frontend.

### 3. Rate Limiting
* **Update `backend/src/server.js`**:
  * Install `express-rate-limit`.
  * Instantiate the middleware to limit general API endpoints to 100 requests per IP per 15 minutes.
* **Protect Auth Routes**: Apply a stricter rate limiter (e.g., 5 requests per 15 minutes) specifically to `POST /api/users/login` and `POST /api/users/register`.

### 4. Structured Logging
* **Install Winston**: Add `winston` and `morgan` to `backend/package.json`.
* **Create `backend/src/utils/logger.js`**: Configure Winston to output JSON structured logs (essential for external monitoring dashboards).
* Replace generic `console.error` and `console.log` statements throughout all services and controllers with `logger.error` and `logger.info`.
