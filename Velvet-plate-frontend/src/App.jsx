import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import useAuthStore from "./store/useAuthStore";

const Landing = lazy(() => import("./pages/Landing"));
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
const Orders = lazy(() => import("./pages/Orders"));
const AdminPendingRequests = lazy(() => import("./pages/AdminPendingRequests"));
const Cart = lazy(() => import("./pages/Cart"));


// Redirects ADMIN/MANAGER away from customer pages to their respective dashboards
// Unauthenticated users see the Landing page, logged-in USERs go to Products
function HomeGuard() {
  const { role, isAuthenticated } = useAuthStore();
  const upperRole = role?.toUpperCase();
  if (upperRole === "ADMIN") return <Navigate to="/admin" replace />;
  if (upperRole === "MANAGER") return <Navigate to="/manager/dashboard" replace />;
  if (!isAuthenticated) return <Landing />;
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
      <Suspense fallback={<div className="flex items-center justify-center h-screen text-lg font-black text-slate-400 bg-slate-50">Loading Velvet Plate...</div>}>
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
          <Route path="/menu" element={<Products />} />
          <Route path="/products" element={<Navigate to="/menu" replace />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order/:orderId" element={<OrderTracking />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;