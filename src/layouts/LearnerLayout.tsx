// src/layouts/LearnerLayout.tsx
import { Outlet, useNavigate, useOutletContext } from "react-router-dom";
import Sidebar from "../components/learner/ui/Sidebar";
import "../styles/LearnerLayout.css";
import { useEffect, useState } from "react";
import UserBadge from "../components/learner/ui/UserBadge";
import { clearGuestMode, clearPrimaryGrade, clearProfile, clearRole, getCurrentViewingGrade, saveCurrentViewingGrade } from "../store/storage";
import FancyClassSelect from "../components/learner/ui/FancyClassSelect";

// Định nghĩa kiểu dữ liệu Context để truyền xuống con
export type LearnerLayoutContextType = {
  selectedGrade: number | null;
  setSelectedGrade: (grade: number) => void;
};
export default function LearnerLayout() {
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  // 1. CHUYỂN STATE TỪ HOMEPAGE SANG ĐÂY
  // Khởi tạo: Lấy từ storage (giống logic cũ ở HomePage)
  const [selectedGrade, setSelectedGrade] = useState<number | null>(() => {
    return getCurrentViewingGrade() || 1; // Mặc định là 1 nếu null
  });

  // 2. Lưu vào storage khi thay đổi
  useEffect(() => {
    if (selectedGrade) {
      saveCurrentViewingGrade(selectedGrade);
    }
  }, [selectedGrade]);

  
  function doLogout() {
    // Xoá dữ liệu đăng nhập
    localStorage.removeItem("accessToken");
    localStorage.removeItem("profileId");
    clearProfile();
    clearRole();
    clearPrimaryGrade();
    clearGuestMode();
    sessionStorage.clear();
    // Điều hướng về login và xóa history entry hiện tại
    navigate("/", { replace: true });
  }
  return (
    <div className="layout">
      <Sidebar onLogoutClick={() => setShowConfirm(true)}/>
      <main className="layout__main">
        {/* <div className="layout__header-bar" style={{
            display: 'flex', 
            justifyContent: 'flex-end', 
            // paddingBottom: '10px',
            marginBottom: '10px'
          }}>
            <UserBadge />
        </div> */}
        <div className="layout__header-bar">
            {/* Bên trái: Select lớp */}
            <div style={{ minWidth: '160px' }}>
              <FancyClassSelect 
                value={selectedGrade ?? 1} 
                onChange={setSelectedGrade} 
              />
            </div>

            {/* Bên phải: User Badge */}
            <UserBadge />
        </div>
        {/* <Outlet /> */}
        {/* Truyền state xuống các trang con (HomePage) qua context */}
        <Outlet context={{ selectedGrade, setSelectedGrade } satisfies LearnerLayoutContextType} />
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
// Hook tiện ích để các trang con dễ dàng lấy data (Optional nhưng khuyên dùng)
export function useLearnerLayoutContext() {
  return useOutletContext<LearnerLayoutContextType>();
}
