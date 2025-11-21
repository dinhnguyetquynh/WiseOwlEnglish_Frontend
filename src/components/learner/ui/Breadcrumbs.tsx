// src/components/learner/ui/Breadcrumbs.tsx
import { Link, useLocation, useParams } from "react-router-dom";
import "../css/Breadcrumbs.css";

// Bản đồ định nghĩa tên hiển thị cho các từ khóa trong URL
const PAGE_NAMES: Record<string, string> = {
  // Học & Ôn tập
  "vocab/learn": "Học từ vựng",
  "sentence/learn": "Học mẫu câu",
  "vocab/review": "Ôn tập từ vựng (Game)",
  "sentence/review": "Ôn tập câu (Game)",
  "vocab/pronounce": "Luyện phát âm",
  
  // Các Game cụ thể
  "picture-guessing": "Nhìn hình đoán chữ",
  "sound-word": "Nghe âm chọn từ",
  "picture-word": "Viết từ vựng",
  "picture-match-word": "Nối hình và từ",
  "picture-sentence": "Chọn câu đúng",
  "sentence-word-hidden": "Điền từ còn thiếu",
  "word-to-sentence": "Sắp xếp câu",
  
  // Kiểm tra
  "testlist": "Danh sách kiểm tra",
  "test": "Làm bài kiểm tra",
  "test-result": "Kết quả kiểm tra",
  
  // Khác
  "game-result": "Kết quả trò chơi"
};

export default function Breadcrumbs() {
  const location = useLocation();
  const { unitId, lessonId } = useParams(); 
  
  // Lấy ID dùng chung (vì route bạn lúc thì dùng unitId, lúc dùng lessonId)
  const currentId = unitId || lessonId;

  const path = location.pathname;

  // 1. Mặc định luôn có Trang chủ
  const crumbs = [
    { label: "Trang chủ", to: "/learn", active: false }
  ];

  // 2. Nếu có unitId/lessonId trong URL -> Thêm "Menu bài học"
  // (Chỉ thêm nếu chúng ta KHÔNG ĐANG Ở trang menu chính nó)
  if (currentId && !path.endsWith(`/units/${currentId}`)) {
    crumbs.push({
      label: "Menu bài học",
      to: `/learn/units/${currentId}`,
      active: false
    });
  }

  // 3. Xác định trang hiện tại dựa trên từ khóa trong URL
  let currentPageLabel = "";

  // Duyệt qua map để tìm tên trang tương ứng
  for (const [key, label] of Object.entries(PAGE_NAMES)) {
    if (path.includes(key)) {
      currentPageLabel = label;
      break;
    }
  }

  // Nếu tìm thấy tên trang, thêm vào cuối breadcrumb
  if (currentPageLabel) {
    crumbs.push({
      label: currentPageLabel,
      to: "", // Trang hiện tại không cần link
      active: true
    });
  } 
  // Trường hợp đặc biệt: Nếu đang ở chính trang Menu bài học
  else if (currentId && path.endsWith(`/units/${currentId}`)) {
     crumbs.push({
      label: "Menu bài học",
      to: "",
      active: true
    });
  }

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <li key={index} className="breadcrumb-item">
              {/* Dấu phân cách (trừ phần tử đầu tiên) */}
              {index > 0 && <span className="breadcrumb-separator">/</span>}

              {/* Nếu là trang cuối hoặc active -> Text thường */}
              {isLast || crumb.active ? (
                <span className="breadcrumb-current" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                /* Nếu không -> Link quay về */
                <Link to={crumb.to} className="breadcrumb-link">
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}