# Phase 4: Performance & Deployment

## Goal
Optimize front-end payload delivery, query speed, and ensure the system is heavily tested before live deployments.

## Detailed Plan of Action

### 1. Frontend Route-Level Code Splitting
Loading the entire application (including Admin charts) immediately is bad for load times.

* **Update `frontend/src/App.jsx`**:
  * Wrap the routing logic in `<Suspense fallback={<Loader />}>`.
  * Convert static imports (e.g., `import Admin from './pages/Admin'`) to dynamic lazy imports (e.g., `const Admin = lazy(() => import('./pages/Admin'))`).
  * Do this for `Admin.jsx`, `Cart.jsx`, and any other heavy pages.

### 2. Database Performance Indexing
* **Update `backend/prisma/schema.prisma`**:
  * Add standard indexes for frequently queried parameters. 
  * Add `@@index([category])` to the `Sweet` model.
  * Add `@@index([date])` and `@@index([sweetName])` to the `Sales` model to ensure Admin reporting remains fast at scale.
  * Run `npx prisma db push` or `npx prisma migrate dev` to apply.

### 3. Automated Backend Testing Setup
If it isn't tested, it's easily broken during future updates.

* **Configure Jest**: Update `backend/jest.config.js` with configurations for node testing.
* **Create `backend/tests/integration/*`**:
  * Use `supertest` in files like `sweets.test.js` to automatically hit endpoints (e.g., `/api/sweets/purchase`) and assert response numbers, stock levels, and correct status codes without manually clicking the UI.
* **Create `backend/tests/unit/*`**:
  * Mock `prisma` clients and write direct unit tests targeting business logic within `backend/src/services/`.

### 4. Containerization and Env Setup (Deployment Ready)
* **Create `backend/Dockerfile` & `frontend/Dockerfile`**: Establish standard multi-stage Node build files for both architectures to ensure consistency across any hosting provider.
* **Create `docker-compose.yml`**: Allow the entire stack (Frontend, Backend, Postgres) to run in a single terminal command for smooth developer onboarding.
* **Clean Environments**: Audit `.env.example` to ensure new engineers know what variables to configure without leaking live secrets.
