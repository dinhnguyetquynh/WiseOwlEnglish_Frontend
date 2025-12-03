import { useMemo } from "react";
import type { TestQuestionRes } from "../../../type/test";

export default function TestPWM({
  q,
  selectedId,
  onPick,
  disabled,
}: {
  q: TestQuestionRes;
  selectedId: number | null;
  onPick: (id: number) => void;
  disabled?: boolean;
}) {
  const list = useMemo(
    () => (q.options ?? []).slice().sort((a, b) => a.position - b.position),
    [q.options]
  );

  return (
    <div>
      <div className="pg-panel">
        {q.mediaUrl ? (
          <img className="pg-img" src={q.mediaUrl} alt="" />
        ) : (
          <div className="pg-text-muted">(Chưa có ảnh)</div>
        )}
      </div>

      <div className="pg-options pg-options--grid">
        {/* {list.map((opt) => (
          

          <button
            key={opt.id}
            className={`pg-option ${selectedId === opt.id ? "pg-option--active" : ""}`}
            onClick={() => onPick(opt.id)}
            disabled={disabled}
          >
            {opt.optionText}
          </button>
        ))} */}
        {list.map((opt) => {
          const isSelected = selectedId === opt.id;
          
          // --- LOGIC REVIEW ---
          let reviewClass = "";
          if (disabled) {
            if (opt.isCorrect) {
              reviewClass = "pg-option--correct"; // Luôn xanh nếu là đáp án đúng
            } else if (isSelected && !opt.isCorrect) {
              reviewClass = "pg-option--wrong";   // Đỏ nếu chọn sai
            }
          }

          return (
            <button
              key={opt.id}
              // Kết hợp class cũ và class review
              className={`pg-option ${isSelected ? "pg-option--active" : ""} ${reviewClass}`}
              onClick={() => onPick(opt.id)}
              disabled={disabled}
            >
              {opt.optionText}
            </button>
          )
        })}

      </div>
    </div>
  );
}
