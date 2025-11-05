// src/routes/RouteGuards.tsx
import { Navigate, Outlet } from "react-router-dom";

// Tùy bạn đọc token từ đâu (localStorage, cookie, zustand...):
function hasToken() {
  return !!localStorage.getItem("accessToken");
}

export function ProtectedRoute() {
  // Chặn vào các trang cần đăng nhập
  return hasToken() ? <Outlet /> : <Navigate to="/login" replace />;
}

export function PublicRoute() {
  // Chặn vào /login, /register... nếu đã đăng nhập
  return hasToken() ? <Navigate to="/learn" replace /> : <Outlet />;
}
