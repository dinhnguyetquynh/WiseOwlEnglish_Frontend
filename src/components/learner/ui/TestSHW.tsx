// src/components/learner/ui/TestSHW.tsx
import type { TestQuestionRes } from "../../../type/test";
import { useEffect, useRef } from "react";

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
                style={{width: '150px', display: 'inline-block', margin: '0 8px'}}
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
      </div>
    </div>
  );
}