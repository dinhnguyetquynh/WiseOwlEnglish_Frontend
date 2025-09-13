import React from "react";
import "../../styles/admin.css"; // phòng khi bạn import Sidebar độc lập

type NavKey = "home" | "list" | "learning" | "games" | "tests" | "settings";

export default function Sidebar({ active = "learning" }: { active?: NavKey }) {
  return (
    <aside className="sidebar">
      <div className="logo">
        <span style={{filter:"drop-shadow(0 1px 0 #0002)"}}>WiseOwl</span>
      </div>

      <nav className="nav">
        <a className={`nav-item ${active==="home" ? "active":""}`} href="#">
          <span className="nav-ico">🏠</span> <span>Trang chủ</span>
        </a>
        <a className={`nav-item ${active==="list" ? "active":""}`} href="#">
          <span className="nav-ico">📋</span> <span>Danh sách</span>
        </a>
        <a className={`nav-item ${active==="learning" ? "active":""}`} href="#">
          <span className="nav-ico">📁</span> <span>Học tập</span>
        </a>
        <a className={`nav-item ${active==="games" ? "active":""}`} href="#">
          <span className="nav-ico">🎮</span> <span>Trò chơi</span>
        </a>
        <a className={`nav-item ${active==="tests" ? "active":""}`} href="#">
          <span className="nav-ico">🧪</span> <span>Bài kiểm tra</span>
        </a>
        <a className={`nav-item ${active==="settings" ? "active":""}`} href="#">
          <span className="nav-ico">⚙️</span> <span>Cài đặt</span>
        </a>
      </nav>

      <div className="user-card">
        <div className="user-avatar">🦉</div>
        <div>
          <div><strong>Nguyễn Văn A</strong></div>
          <div style={{fontSize:12, opacity:.7}}>Admin</div>
        </div>
      </div>
    </aside>
  );
}
