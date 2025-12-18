import { useNavigate } from "react-router-dom";
import "../css/WelcomePage.css";
import { useState } from "react";
import { saveCurrentViewingGrade, saveGuestMode, savePrimaryGrade } from "../../../store/storage";

export default function WelcomePage() {
  const navigate = useNavigate();
  // State để bật/tắt popup chọn lớp
  const [showGradePopup, setShowGradePopup] = useState(false);

  // Hàm xử lý khi chọn lớp xong
  const handleSelectGrade = (grade: number) => {
   // 1. Lưu cờ Guest
    saveGuestMode(true);
    // 2. Lưu lớp khách chọn làm lớp chính tạm thời
    savePrimaryGrade(grade);
    saveCurrentViewingGrade(grade);
    navigate(`/learn`);
  };

  return (
    <div className="welcome-screen">
      <div className="welcome-left">
        <img
          src="https://res.cloudinary.com/dxhhluk84/image/upload/v1759382382/welcome_ekfpjr.png"
          alt="characters"
          className="welcome-img"
        />
      </div>

      <div className="welcome-right">
        <h1 className="welcome-title">
          Học tiếng anh cùng  <br /> WiseOwl English nha!
        </h1>
        {/* Nút HỌC THỬ MỚI */}
        <button
          className="welcome-btn trial" // Bạn nhớ thêm CSS cho class này nhé (vd: màu cam)
          style={{ backgroundColor: "#FFA500", color: "#fff", marginBottom: "10px" }}
          onClick={() => setShowGradePopup(true)}
        >
          HỌC THỬ NGAY
        </button>

        <button
          className="welcome-btn start"
          onClick={() => navigate("/register")}
        >
          ĐĂNG KÍ
        </button>

        <button
          className="welcome-btn login"
          onClick={() => navigate("/login")}
        >
          TÔI ĐÃ CÓ TÀI KHOẢN
        </button>
      </div>
      {/* POPUP CHỌN LỚP (Code giao diện nhanh tại chỗ) */}
      {showGradePopup && (
        <div className="popup-overlay" style={overlayStyle}>
          <div className="popup-content" style={popupStyle}>
            <h3>Bé học lớp mấy nào?</h3>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", margin: "20px 0" }}>
              {[1, 2, 3, 4, 5].map((g) => (
                <button
                  key={g}
                  onClick={() => handleSelectGrade(g)}
                  style={gradeBtnStyle}
                >
                  {g}
                </button>
              ))}
            </div>
            <button onClick={() => setShowGradePopup(false)} style={{ color: "red", background: "none", border: "none", cursor: "pointer" }}>
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
const overlayStyle: React.CSSProperties = {
  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
};
const popupStyle: React.CSSProperties = {
  backgroundColor: "white", padding: "30px", borderRadius: "15px", textAlign: "center", minWidth: "300px", boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
};
const gradeBtnStyle: React.CSSProperties = {
  width: "40px", height: "40px", borderRadius: "50%", border: "1px solid #ccc",
  backgroundColor: "#f0f0f0", cursor: "pointer", fontWeight: "bold"
};