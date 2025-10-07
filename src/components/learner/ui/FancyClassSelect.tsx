import { useEffect, useRef, useState } from "react";
import "../css/FancyClassSelect.css";

export type ClassOption = { value: number; label: string; emoji: string };

const DEFAULT_OPTIONS: ClassOption[] = [
  { value: 1, label: "Lớp 1", emoji: "⭐" },
  { value: 2, label: "Lớp 2", emoji: "🍎" },
  { value: 3, label: "Lớp 3", emoji: "✏️" },
  { value: 4, label: "Lớp 4", emoji: "📖" },
  { value: 5, label: "Lớp 5", emoji: "🎓" },
];

type Props = {
  value?: number | null;
  onChange?: (v: number) => void;
  options?: ClassOption[];
  placeholder?: string;
};

export default function FancyClassSelect({
  value = null,
  onChange,
  options = DEFAULT_OPTIONS,
  placeholder = "Chọn Lớp Học…",
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // đóng khi click ra ngoài
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = options.find(o => o.value === value) || null;

  const handleSelect = (v: number) => {
    onChange?.(v);
    setOpen(false);
  };

  return (
    <div className="fs" ref={wrapRef}>
      {/* Trigger */}
      <button
        className={"fs__trigger" + (open ? " fs__trigger--open" : "")}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="fs__q">Chọn lớp: </span>
        <span className={"fs__text" + (current ? " fs__text--set" : "")}>
          {current ? `${current.label}` : placeholder}
        </span>
        <span className={"fs__chev" + (open ? " fs__chev--up" : "")}>▲</span>
      </button>

      {/* Menu */}
      {open && (
        <div className="fs__menu" role="listbox">
          {options.map(opt => {
            const selected = opt.value === value;
            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={selected}
                className={"fs__item" + (selected ? " fs__item--selected" : "")}
                onClick={() => handleSelect(opt.value)}
              >
                <span className="fs__emoji" aria-hidden>{opt.emoji}</span>
                <span className="fs__label">{opt.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
