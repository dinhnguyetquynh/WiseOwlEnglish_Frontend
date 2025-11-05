import { useMemo, useRef } from "react";
import type { TestQuestionRes } from "../../../type/test";

export default function TestSWM({
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const list = useMemo(
    () => (q.options ?? []).slice().sort((a, b) => a.position - b.position),
    [q.options]
  );

  return (
    <div>
      <div className="pg-audio">
        {q.mediaUrl ? (
          <>
            <audio ref={audioRef} src={q.mediaUrl} preload="auto" />
            <button className="pg-btn" onClick={() => audioRef.current?.play()}>
              ▶️ Nghe lại
            </button>
          </>
        ) : (
          <div className="pg-text-muted">(Chưa có audio)</div>
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
