import type { TestQuestionRes } from "../../../type/test";
import { useEffect, useMemo, useRef } from "react";

// Component này nhận vào giá trị text hiện tại và hàm để cập nhật nó
export default function TestPWW({
 q,
 currentValue,
 onWrite,
 disabled,
}: {
 q: TestQuestionRes;
 currentValue: string; // Giá trị text người dùng đã nhập
 onWrite: (text: string) => void; // Hàm callback khi người dùng gõ
 disabled?: boolean;
}) {
 // Tự động focus vào ô input khi chuyển câu hỏi
 const inputRef = useRef<HTMLInputElement>(null);
 useEffect(() => {
  inputRef.current?.focus();
 }, [q.id]); // Focus lại khi ID câu hỏi thay đổi

 const correctOption = useMemo(() => q.options?.find(o => o.isCorrect), [q.options]);
 const correctAnswerText = correctOption?.optionText || "N/A";

 const isUserCorrect = useMemo(() => {
    if (!disabled) return false;
    const user = (currentValue || "").trim().toLowerCase();
    const correct = (correctAnswerText || "").trim().toLowerCase();
    return user === correct;
  }, [currentValue, correctAnswerText, disabled]);

  
// 3. Style động cho ô input khi Review
  const inputStyle = useMemo(() => {
    if (!disabled) return {}; // Style mặc định
    
    if (isUserCorrect) {
      return {
        backgroundColor: "#ecfdf5", // Xanh nhạt
        borderColor: "#22c55e",     // Viền xanh
        color: "#166534",           // Chữ xanh
        fontWeight: "bold"
      };
    } else {
      return {
        backgroundColor: "#fef2f2", // Đỏ nhạt
        borderColor: "#ef4444",     // Viền đỏ
        color: "#991b1b",           // Chữ đỏ
        fontWeight: "bold",
        textDecoration: "line-through" // (Tuỳ chọn) Gạch ngang chữ sai
      };
    }
  }, [disabled, isUserCorrect]);
 return (
  <div>
 {/* 1. Hiển thị Hình ảnh (tái sử dụng style cũ) */}
 <div className="pg-panel">
    {q.mediaUrl ? (
     <img className="pg-img" src={q.mediaUrl} alt="Nhập từ vựng" />
   ) : (
     <div className="pg-text-muted">(Chưa có ảnh)</div>
    )}
   </div>

   {/* 2. Hiển thị Ô Nhập liệu (Input) */}
   <div className="pg-input-area">
    <input
    ref={inputRef}
     type="text"
     className={`pg-text-input ${disabled ? (isUserCorrect ? "correct-input" : "wrong-input") : ""}`}
     placeholder="Nhập đáp án..."
     value={currentValue}
     onChange={(e) => onWrite(e.target.value)}
     disabled={disabled}
     style={inputStyle}
     autoFocus
    />
    {/* {disabled && !isUserCorrect && (
          <div style={{ marginTop: "12px", textAlign: "center", animation: "fadeIn 0.3s" }}>
            <span style={{ color: "#6b7280", fontSize: "14px", marginRight: "6px" }}>
              Đáp án đúng:
            </span>
            <span style={{ color: "#22c55e", fontWeight: "800", fontSize: "18px" }}>
              {correctAnswerText}
            </span>
          </div>
        )} */}
   </div>
  </div>
 );
}