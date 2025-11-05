import "../css/UnitCard.css";

// KHÔNG có "LOCKED" nữa
export type UnitStatus = "ACTIVE" | "COMPLETE";

export type Unit = {
  id: string;
  title: string;                        // ví dụ: "Unit A: Bài 1"
  lessonCount: number;                  // số hiển thị phụ (tuỳ nghi)
  progress: { done: number; total: number }; // dùng progress bar
  status: UnitStatus;                   // ACTIVE | COMPLETE
  mascot?: string;     // ảnh minh hoạ (optional)
  unitName?: string;   // "UNIT 1"
  unitTitle?: string;
};

export default function UnitCard({
  unit,
  onContinue,
}: {
  unit: Unit;
  onContinue?: (unit: Unit) => void;
}) {
  const pct = Math.round((unit.progress.done / Math.max(1, unit.progress.total)) * 100);
  const isDone = unit.status === "COMPLETE";

  return (
    <article className={"uc " + (isDone ? "uc--done" : "uc--active")}>
      <div className="uc__left">
        <h3 className="uc__title">{unit.title}</h3>

        {/* Progress */}
        <div className="uc__progress">
          <div className="uc__progress-bar" style={{ width: `${pct}%` }} />
          <div className="uc__progress-text">
            {unit.progress.done} / {unit.progress.total}
          </div>
        </div>

        {/* CTA — KHÔNG bao giờ disabled */}
        <button className="uc__cta" onClick={() => onContinue?.(unit)}>
          {isDone ? "HỌC LẠI" : "HỌC BÀI NÀY"}
        </button>
      </div>

      <div className="uc__right">
        <img
          className="uc__owl"
          alt="owl"
          src={
            unit.mascot ??
            "https://res.cloudinary.com/dxhhluk84/image/upload/v1759137636/unit1_color_noBG_awzhqe.png"
          }
        />
      </div>
    </article>
  );
}
