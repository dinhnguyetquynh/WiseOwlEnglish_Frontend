// src/components/learner/ui/TestSHW.tsx
import type { TestQuestionRes } from "../../../type/test";
import { useEffect, useMemo, useRef } from "react";

// Hàm chuẩn hóa để so sánh (bỏ khoảng trắng thừa, viết thường)
const normalize = (s: string) => s?.trim().toLowerCase() || "";
export default function TestSHW({
  q,
  currentValue,
  onWrite,
  disabled,
}: {
  q: TestQuestionRes;
  currentValue: string;
  onWrite: (text: string) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  // Auto focus khi mới vào câu hỏi
  useEffect(() => {
    inputRef.current?.focus();
  }, [q.id]);

  // Xử lý hiển thị câu hỏi đục lỗ
  const parts = (q.questionContent || "").split("___");

  // 1. Tìm đáp án đúng
  // (Với dạng điền từ, đáp án có thể nằm ở hiddenWord hoặc option đầu tiên)
  const correctAnswerText = useMemo(() => {
    // if (q.hiddenWord) return q.hiddenWord;
    const correctOpt = q.options?.find((o) => o.isCorrect);
    return correctOpt?.optionText || "";
  }, [q]);

  const isUserCorrect = useMemo(() => {
    if (!disabled) return null;
    return normalize(currentValue) === normalize(correctAnswerText);
  }, [currentValue, correctAnswerText, disabled]);
  const inputStyle = disabled
    ? {
        backgroundColor: isUserCorrect ? "#ecfdf5" : "#fef2f2", // Xanh / Đỏ nhạt
        borderColor: isUserCorrect ? "#22c55e" : "#ef4444",     // Viền Xanh / Đỏ
        color: isUserCorrect ? "#166534" : "#991b1b",           // Chữ Xanh / Đỏ
        textDecoration: !isUserCorrect ? "line-through" : "none", // Gạch ngang nếu sai
        fontWeight: "bold",
        cursor: "default",
      }
    : {};

  return (
    <div>
      <div className="pg-panel">
        {q.mediaUrl ? (
          <img className="pg-img" src={q.mediaUrl} alt="Điền từ" style={{maxHeight: 250}} />
        ) : (
          <div className="pg-text-muted">(Chưa có ảnh)</div>
        )}
      </div>

      <div className="pg-input-area" style={{fontSize: '22px', fontWeight: 600, textAlign: 'center', marginTop: 24}}>
        {parts.length > 1 ? (
            <>
                {parts[0]}
                <input
                ref={inputRef}
                type="text"
                className="pg-text-input"
                style={{width: '150px', display: 'inline-block', margin: '0 8px',textAlign: "center",...inputStyle,}}
                placeholder="..."
                value={currentValue}
                onChange={(e) => onWrite(e.target.value)}
                disabled={disabled}
                autoFocus
                />
                {parts[1]}
            </>
        ) : (
            // Fallback nếu không tìm thấy dấu ___
             <>
                <div style={{marginBottom: 10}}>{q.questionContent}</div>
                <input
                    ref={inputRef}
                    type="text"
                    className="pg-text-input"
                    placeholder="Nhập từ còn thiếu..."
                    value={currentValue}
                    onChange={(e) => onWrite(e.target.value)}
                    disabled={disabled}
                />
             </>
        )}
        {/* 👇 HIỂN THỊ ĐÁP ÁN ĐÚNG NẾU SAI */}
        {disabled && !isUserCorrect && (
          <div style={{ marginTop: 16, animation: "fadeIn 0.3s" }}>
            <div style={{ fontSize: "14px", color: "#6b7280" }}>
              Đáp án đúng:
            </div>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#22c55e" }}>
              {correctAnswerText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}