// // src/layouts/HeaderLayout.tsx
// import { Outlet, Link } from "react-router-dom";
// import UserBadge from "../components/learner/ui/UserBadge";
// import "./HeaderLayout.css"; // 👈 Import file CSS vừa tạo
// import Breadcrumbs from "../components/learner/ui/Breadcrumbs";


// export default function HeaderLayout() {
//   return (
//     <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#f9fafb" }}>
      
//       {/* --- HEADER (Wrapper full width) --- */}
//       <div className="header-bar-wrapper">
        
//         <div className="header-bar-content">
          
//           {/* 1. Logo / Tên thương hiệu */}
//           <Link to="/learn" className="header-brand">
//              {/* <img src="/path/to/logo.png" alt="Logo" width="32" /> */}
//             <span className="header-brand-text">
//               WiseOwl English
//             </span>
//           </Link>

//           {/* 2. Thẻ người dùng */}
//           <div>
//             <UserBadge />
//           </div>

  

//         </div>
//       </div>
//               {/* --- BREADCRUMBS BAR (Thanh dấu vết) --- */}
//       <div >
//          <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
//             <Breadcrumbs />
//          </div>

//       </div>

//       {/* --- BODY CONTENT --- */}
//       <div style={{ flex: 1, position: "relative" }}>
//         <Outlet />
//       </div>
//     </div>
//   );
// }
// src/layouts/HeaderLayout.tsx
import { useEffect, useState } from "react";
import { Outlet, Link } from "react-router-dom";
import UserBadge from "../components/learner/ui/UserBadge";
import "./HeaderLayout.css";
import Breadcrumbs from "../components/learner/ui/Breadcrumbs";
import FancyClassSelect from "../components/learner/ui/FancyClassSelect";

// Import API để lấy thông tin lớp học (giống HomePage)
import { getProfileId } from "../store/storage";
import { fetchLessonsForHomePage } from "../api/learn";

export default function HeaderLayout() {
  // State lưu lớp học để hiển thị
  const [displayGrade, setDisplayGrade] = useState<number>(1);

  // Logic lấy dữ liệu lớp học hiện tại của User
  useEffect(() => {
    const profileId = getProfileId();
    if (!profileId) return;

    const fetchGrade = async () => {
      try {
        // Gọi API lấy thông tin bài học (trong đó có gradeOrderIndex)
        const data = await fetchLessonsForHomePage(profileId);
        if (data && data.gradeOrderIndex) {
          setDisplayGrade(data.gradeOrderIndex);
        }
      } catch (error) {
        console.error("Không thể lấy thông tin lớp học cho Header:", error);
      }
    };

    fetchGrade();
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#f9fafb" }}>
      
      {/* --- HEADER --- */}
      <div className="header-bar-wrapper">
        <div className="header-bar-content">
          <Link to="/learn" className="header-brand">
            <span className="header-brand-text">
              WiseOwl English
            </span>
          </Link>
          <div><UserBadge /></div>
        </div>
      </div>

      {/* --- ACTION BAR (Select Lớp & Breadcrumbs) --- */}
      {/* --- ACTION BAR --- */}
      <div>
         <div style={{ 
            maxWidth: "1100px", 
            margin: "0 auto", 
            padding: "16px 24px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between", // [1] Đẩy 2 phần tử ra 2 góc
            gap: "16px" 
         }}>
            
            {/* 1. Breadcrumbs nằm bên TRÁI */}
            <Breadcrumbs />

            {/* 2. FancyClassSelect nằm bên PHẢI */}
            <div style={{ minWidth: "180px" }}>
              <FancyClassSelect 
                value={displayGrade} 
                disabled={true} 
              />
            </div>

         </div>
      </div>

      {/* --- BODY CONTENT --- */}
      <div style={{ flex: 1, position: "relative" }}>
        <Outlet />
      </div>
    </div>
  );
}