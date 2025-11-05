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
        {list.map((opt) => (
          <button
            key={opt.id}
            className={`pg-option ${selectedId === opt.id ? "pg-option--active" : ""}`}
            onClick={() => onPick(opt.id)}
            disabled={disabled}
          >
            {opt.optionText}
          </button>
        ))}
      </div>
    </div>
  );
}
