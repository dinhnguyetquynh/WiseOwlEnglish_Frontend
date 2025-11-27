// src/components/learner/ui/LessonCompletion.tsx
import "../css/LessonCompletion.css";

type Props = {
  type: "vocab" | "sentence"; // Để xác định nội dung chữ
  totalItem: number;          // Tổng số câu/từ đã học
  onRetry: () => void;        // Hàm xử lý nút "Học lại"
  onReview: () => void;       // Hàm xử lý nút "Ôn tập"
  onClose: () => void;        // Hàm xử lý nút X (Thường là quay về menu)
};

const DEFAULT_MASCOT = "https://res.cloudinary.com/dxhhluk84/image/upload/v1759137636/unit1_color_noBG_awzhqe.png"; 
// Bạn có thể thay URL mascot Giáng sinh nếu có

export default function LessonCompletion({ type, totalItem, onRetry, onReview, onClose }: Props) {
  
  const titleText = type === "vocab" 
    ? "CHÚC MỪNG, EM ĐÃ HOÀN THÀNH MỤC HỌC TỪ VỰNG"
    : "CHÚC MỪNG, EM ĐÃ HOÀN THÀNH MỤC HỌC CÂU";

  const labelText = type === "vocab" ? "TỔNG TỪ VỰNG" : "TỔNG SỐ CÂU";

  return (
    <div className="lc-overlay">
      <button className="lc-close-btn" onClick={onClose}>×</button>

      {/* Mascot */}
      <img src={DEFAULT_MASCOT} alt="Congrats" className="lc-mascot" />

      {/* Title */}
      <h2 className="lc-title">{titleText}</h2>

      {/* Progress Circle (Giả lập UI giống hình) */}
      <div className="lc-progress-box">
        <span className="lc-progress-label">{labelText}</span>
        <div className="lc-progress-val">
          <span style={{fontSize: '24px'}}>🎯</span> {totalItem}/{totalItem}
        </div>
      </div>

      {/* Buttons */}
      <div className="lc-actions">
        <button className="lc-btn lc-btn-ghost" onClick={onRetry}>
          HỌC LẠI
        </button>
        <button className="lc-btn lc-btn-primary" onClick={onReview}>
          ÔN TẬP
        </button>
      </div>
    </div>
  );
}