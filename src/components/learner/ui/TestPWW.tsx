import type { TestQuestionRes } from "../../../type/test";
import { useEffect, useRef } from "react";

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
     className="pg-text-input" // Cần thêm CSS cho class này
     placeholder="Nhập đáp án..."
     value={currentValue}
     onChange={(e) => onWrite(e.target.value)}
     disabled={disabled}
     autoFocus
    />
   </div>
  </div>
 );
}