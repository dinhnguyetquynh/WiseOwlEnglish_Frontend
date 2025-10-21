import type { ReactNode } from "react";
import "../css/GameCard.css";

export type GameCardProps = {
  title: string;
  description: string;
  ctaLabel: string;
  onClick: () => void;
  icon?: ReactNode;       // có thể truyền SVG/ảnh
  accent?: "green" | "purple" | "blue"; // phối màu nhanh
  disabled?: boolean;     // nếu game chưa mở
};

export default function GameCard({
  title, description, ctaLabel, onClick, icon, accent = "green", disabled
}: GameCardProps) {
  return (
    <article className={`gc-card gc-${accent} ${disabled ? "gc-disabled" : ""}`}>
      <div className="gc-left">
        {icon ? <div className="gc-icon">{icon}</div> : null}
        <div className="gc-text">
          <h3 className="gc-title">{title}</h3>
          <p className="gc-desc">{description}</p>
        </div>
      </div>
      <div className="gc-right">
        <button
          className="gc-cta"
          onClick={onClick}
          disabled={disabled}
          aria-label={title}
        >
          {ctaLabel}
        </button>
      </div>
    </article>
  );
}
