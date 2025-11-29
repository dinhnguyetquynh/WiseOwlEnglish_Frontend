// src/components/learner/ui/TestPSM.tsx
import { useMemo } from "react";
import type { TestQuestionRes } from "../../../type/test";

export default function TestPSM({
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
          <img className="pg-img" src={q.mediaUrl} alt="" style={{maxHeight: 250}} />
        ) : (
          <div className="pg-text-muted">(Chưa có ảnh)</div>
        )}
      </div>

      {/* Dùng grid 1 cột cho câu dài dễ đọc hơn */}
      <div className="pg-options" style={{display: 'grid', gap: '12px', marginTop: '20px'}}>
        {list.map((opt) => (
          <button
            key={opt.id}
            className={`pg-option ${selectedId === opt.id ? "pg-option--active" : ""}`}
            onClick={() => onPick(opt.id)}
            disabled={disabled}
            style={{height: 'auto', minHeight: '56px', padding: '12px'}}
          >
            {opt.optionText}
          </button>
        ))}
      </div>
    </div>
  );
}