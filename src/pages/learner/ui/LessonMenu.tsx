import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import "../css/LessonMenu.css";
import type { JSX } from "react";

type LessonMenuItem = {
  key: string;
  label: string;
  icon: JSX.Element;
  gradientClass: string;
  to: string;
};

type MenuState = {
  unitName?: string;   // "UNIT 1"
  unitTitle?: string;  // "COLOR"
  title?: string;      // "UNIT 1: COLOR"
};

export default function LessonMenu() {
  const navigate = useNavigate();
  const { unitId = "u1" } = useParams();
  const location = useLocation();
  const state = (location.state ?? {}) as MenuState;
  const [sp] = useSearchParams();

  // Ưu tiên state; nếu F5 mất state, lấy từ query; nếu vẫn thiếu thì fallback chữ "BÀI HỌC"
  const unitName = state.unitName ?? sp.get("unitName") ?? "";
  const unitTitle = state.unitTitle ?? sp.get("unitTitle") ?? "";
  const titleFromStateOrQuery = state.title ?? sp.get("title") ?? "";

  const headerText =
    (unitName && unitTitle && `${unitName}: ${unitTitle}`) ||
    titleFromStateOrQuery ||
    "BÀI HỌC";

  const items: LessonMenuItem[] = [
    { key: "learn-vocab",    label: "HỌC TỪ VỰNG",   icon: <span className="lm__icon-emoji">📖</span>, gradientClass: "lm__btn--yellow", to: `/learn/units/${unitId}/vocab/learn` },
    { key: "review-vocab",   label: "ÔN TỪ VỰNG",    icon: <span className="lm__icon-emoji">↻</span>, gradientClass: "lm__btn--green",  to: `/learn/units/${unitId}/vocab/review` },
    { key: "learn-sentence", label: "HỌC CÂU",       icon: <span className="lm__icon-emoji">💬</span>, gradientClass: "lm__btn--pink",  to: `/learn/units/${unitId}/sentence/learn` },
    { key: "review-sentence",label: "ÔN CÂU",        icon: <span className="lm__icon-emoji">✏️</span>, gradientClass: "lm__btn--lime",  to: `/learn/units/${unitId}/sentence/review` },
    { key: "test",           label: "KIỂM TRA",      icon: <span className="lm__icon-emoji">📋</span>, gradientClass: "lm__btn--blue",  to: `/learn/units/${unitId}/test` },
  ];

  return (
    <div className="lm">
      {/* Header full width */}
      <header className="lm__header">
        <button className="lm__back" onClick={() => navigate(-1)}>←</button>
        <div className="lm__title-inline">{headerText}</div>
      </header>

      {/* List center */}
      <section className="lm__list">
        {items.map((it) => (
          <button
            key={it.key}
            className={`lm__btn ${it.gradientClass}`}
            onClick={() => navigate(it.to)}
          >
            <span className="lm__icon">{it.icon}</span>
            <span className="lm__label">{it.label}</span>
          </button>
        ))}
      </section>
    </div>
  );
}
