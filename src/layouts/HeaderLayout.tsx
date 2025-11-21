// src/layouts/HeaderLayout.tsx
import { Outlet, Link } from "react-router-dom";
import UserBadge from "../components/learner/ui/UserBadge";
import "./HeaderLayout.css"; // 👈 Import file CSS vừa tạo
import Breadcrumbs from "../components/learner/ui/Breadcrumbs";

export default function HeaderLayout() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#f9fafb" }}>
      
      {/* --- HEADER (Wrapper full width) --- */}
      <div className="header-bar-wrapper">
        
        <div className="header-bar-content">
          
          {/* 1. Logo / Tên thương hiệu */}
          <Link to="/learn" className="header-brand">
             {/* <img src="/path/to/logo.png" alt="Logo" width="32" /> */}
            <span className="header-brand-text">
              WiseOwl English
            </span>
          </Link>

          {/* 2. Thẻ người dùng */}
          <div>
            <UserBadge />
          </div>

  

        </div>
      </div>
              {/* --- BREADCRUMBS BAR (Thanh dấu vết) --- */}
      <div >
         <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
            <Breadcrumbs />
         </div>
      </div>

      {/* --- BODY CONTENT --- */}
      <div style={{ flex: 1, position: "relative" }}>
        <Outlet />
      </div>
    </div>
  );
}