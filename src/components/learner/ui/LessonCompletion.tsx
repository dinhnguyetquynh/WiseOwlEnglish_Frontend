// src/components/learner/ui/LessonCompletion.tsx
import "../css/LessonCompletion.css";

type Props = {
  type: "vocab" | "sentence" |"pronunciation"; // Để xác định nội dung chữ
  totalItem: number;  
  correctCount?: number;        // Tổng số câu/từ đã học
  onRetry: () => void;        // Hàm xử lý nút "Học lại"
  onReview: () => void;       // Hàm xử lý nút "Ôn tập"
  onClose: () => void;
         
};

const DEFAULT_MASCOT = "https://res.cloudinary.com/dxhhluk84/image/upload/v1759137636/unit1_color_noBG_awzhqe.png"; 
// Bạn có thể thay URL mascot Giáng sinh nếu có

export default function LessonCompletion({ type, totalItem, correctCount, onRetry, onReview, onClose }: Props) {
  let titleText = "";
  let labelText = "";
  // const titleText = type === "vocab" 
  //   ? "CHÚC MỪNG, EM ĐÃ HOÀN THÀNH MỤC HỌC TỪ VỰNG"
  //   : "CHÚC MỪNG, EM ĐÃ HOÀN THÀNH MỤC HỌC CÂU";

  // const labelText = type === "vocab" ? "TỔNG TỪ VỰNG" : "TỔNG SỐ CÂU";
  switch (type) {
    case "vocab":
      titleText = "CHÚC MỪNG, EM ĐÃ HOÀN THÀNH MỤC HỌC TỪ VỰNG";
      labelText = "TỔNG TỪ VỰNG";
      break;
    case "sentence":
      titleText = "CHÚC MỪNG, EM ĐÃ HOÀN THÀNH MỤC HỌC CÂU";
      labelText = "TỔNG SỐ CÂU";
      break;
    case "pronunciation":
      // 👇 Nội dung bạn muốn thêm
      titleText = "CHÚC MỪNG, EM ĐÃ HOÀN THÀNH MỤC LUYỆN PHÁT ÂM TỪ VỰNG";
      labelText = "TỔNG TỪ VỰNG";
      break;
    default:
      titleText = "CHÚC MỪNG, EM ĐÃ HOÀN THÀNH BÀI HỌC";
      labelText = "TỔNG SỐ CÂU";
  }
  // Logic hiển thị điểm số (giữ nguyên hoặc cập nhật nếu có correctCount)
  const displayScore = (correctCount !== undefined) ? correctCount : totalItem;
  return (
    <div className="lc-overlay">
      <button className="lc-close-btn" onClick={onClose}>×</button>

      {/* Mascot */}
      <img src={DEFAULT_MASCOT} alt="Congrats" className="lc-mascot" />

      {/* Title */}
      <h2 className="lc-title">{titleText}</h2>

      {/* Progress Circle  */}
      <div className="lc-progress-box">
        <span className="lc-progress-label">{labelText}</span>
        <div className="lc-progress-val">
          <span style={{fontSize: '24px'}}>🎯</span> {displayScore}/{totalItem}
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