// src/routes/RouteGuards.tsx
import { Navigate, Outlet } from "react-router-dom";
import { getRole, isGuestMode, KEY_IS_GUEST } from "../store/storage";

// Tùy bạn đọc token từ đâu (localStorage, cookie, zustand...):
function hasToken() {
  return !!localStorage.getItem("accessToken");
}

export function ProtectedRoute() {
  // Chặn vào các trang cần đăng nhập
  // return hasToken() ? <Outlet /> : <Navigate to="/login" replace />;
  if (hasToken() || isGuestMode()) {
    return <Outlet />;
  }

  // Nếu không thỏa mãn cả 2, đá về login
  return <Navigate to="/login" replace />;
}

export function PublicRoute() {
  // Chặn vào /login, /register... nếu đã đăng nhập
  if (hasToken()) {
    const role = getRole();
    if (role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }
    // Mặc định là LEARNER
    return <Navigate to="/learn" replace />;
  }

  // Nếu chưa đăng nhập, cho phép vào (Login, Register...)
  return <Outlet />;
}
