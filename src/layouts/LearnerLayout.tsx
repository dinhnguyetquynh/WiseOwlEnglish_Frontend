// src/layouts/LearnerLayout.tsx
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/learner/ui/Sidebar";
import "../styles/LearnerLayout.css";
import { useState } from "react";
import UserBadge from "../components/learner/ui/UserBadge";
import { clearProfile, clearRole } from "../store/storage";
export default function LearnerLayout() {
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  
  function doLogout() {
    // Xoá dữ liệu đăng nhập
    localStorage.removeItem("accessToken");
    localStorage.removeItem("profileId");
    clearProfile();
    clearRole();
    sessionStorage.clear();
    // Điều hướng về login và xóa history entry hiện tại
    navigate("/login", { replace: true });
  }
  return (
    <div className="layout">
      <Sidebar onLogoutClick={() => setShowConfirm(true)}/>
      <main className="layout__main">
        <div className="layout__header-bar" style={{
            display: 'flex', 
            justifyContent: 'flex-end', 
            // paddingBottom: '10px',
            marginBottom: '10px'
          }}>
            <UserBadge />
        </div>
        <Outlet />
      </main>
      {showConfirm && (
        <div className="confirm__overlay" role="dialog" aria-modal="true">
          <div className="confirm__box">
            <p className="confirm__title">Bạn có chắc chắn muốn đăng xuất không?</p>
            <div className="confirm__actions">
              <button
                className="btn btn--danger"
                onClick={() => {
                  setShowConfirm(false);
                  doLogout();
                }}
              >
                Có
              </button>
              <button
                className="btn btn--ghost"
                onClick={() => setShowConfirm(false)}
              >
                Không
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
