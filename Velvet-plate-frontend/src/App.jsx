import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from "./components/Navbar";
import CartDrawer from "./components/CartDrawer";
import ProtectedRoute from "./components/ProtectedRoute";
import useAuthStore from "./store/useAuthStore";

const Products = lazy(() => import("./pages/Products"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Admin = lazy(() => import("./pages/Admin"));
const ManagerDashboard = lazy(() => import("./pages/ManagerDashboard"));
const ManagerStore = lazy(() => import("./pages/ManagerStore"));
const ManagerMenu = lazy(() => import("./pages/ManagerMenu"));
const ManagerOrders = lazy(() => import("./pages/ManagerOrders"));
const ManagerPayouts = lazy(() => import("./pages/ManagerPayouts"));
const ManagerOnboarding = lazy(() => import("./pages/ManagerOnboarding"));
const ManagerStatus = lazy(() => import("./pages/ManagerStatus"));
const ManagerSettings = lazy(() => import("./pages/ManagerSettings"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const AdminPendingRequests = lazy(() => import("./pages/AdminPendingRequests"));


// Redirects ADMIN/MANAGER away from customer pages to their respective dashboards
function HomeGuard() {
  const role = useAuthStore((s) => s.user?.role)?.toUpperCase();
  if (role === "ADMIN") return <Navigate to="/admin" replace />;
  if (role === "MANAGER") return <Navigate to="/manager/dashboard" replace />;
  return <Products />;
}

function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <Navbar />
      <CartDrawer />
      <Suspense fallback={<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: "1.2rem", color: "#64748b" }}>Loading...</div>}>
        <Routes>
          <Route path="/" element={<HomeGuard />} />

          {/* Unified Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/register" element={<Navigate to="/signup" replace />} />

          {/* Admin Routes - ADMIN role only */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Admin />
            </ProtectedRoute>
          } />
          <Route path="/admin/pending-requests" element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminPendingRequests />
            </ProtectedRoute>
          } />

          {/* Manager Routes - MANAGER role only */}
          <Route path="/manager/dashboard" element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <ManagerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/manager/store" element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <ManagerStore />
            </ProtectedRoute>
          } />
          <Route path="/manager/menu" element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <ManagerMenu />
            </ProtectedRoute>
          } />
          <Route path="/manager/orders" element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <ManagerOrders />
            </ProtectedRoute>
          } />
          <Route path="/manager/payouts" element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <ManagerPayouts />
            </ProtectedRoute>
          } />
          <Route path="/manager/settings" element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <ManagerSettings />
            </ProtectedRoute>
          } />
          <Route path="/manager/onboarding" element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <ManagerOnboarding />
            </ProtectedRoute>
          } />
          <Route path="/manager/status" element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <ManagerStatus />
            </ProtectedRoute>
          } />
          {/* /manager shortcut → handled by ProtectedRoute inside, redirects appropriately */}
          <Route path="/manager" element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <Navigate to="/manager/dashboard" replace />
            </ProtectedRoute>
          } />

          {/* Customer Routes */}
          <Route path="/order/:orderId" element={<OrderTracking />} />
          {/* We've replaced the /cart page entirely with CartDrawer */}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;