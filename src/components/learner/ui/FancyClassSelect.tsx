// import { useEffect, useRef, useState } from "react";
// import "../css/FancyClassSelect.css";

// export type ClassOption = { value: number; label: string; emoji: string };

// const DEFAULT_OPTIONS: ClassOption[] = [
//   { value: 1, label: "Lớp 1", emoji: "⭐" },
//   { value: 2, label: "Lớp 2", emoji: "🍎" },
//   { value: 3, label: "Lớp 3", emoji: "✏️" },
//   { value: 4, label: "Lớp 4", emoji: "📖" },
//   { value: 5, label: "Lớp 5", emoji: "🎓" },
// ];

// type Props = {
//   value?: number | null;
//   onChange?: (v: number) => void;
//   options?: ClassOption[];
//   placeholder?: string;
//   disabled?: boolean; // [1] Thêm prop disabled
// };

// export default function FancyClassSelect({
//   value = null,
//   onChange,
//   options = DEFAULT_OPTIONS,
//   placeholder = "Chọn Lớp Học…",
//   disabled = false,
// }: Props) {
//   const [open, setOpen] = useState(false);
//   const wrapRef = useRef<HTMLDivElement>(null);

//   // đóng khi click ra ngoài
//   useEffect(() => {
//     const handler = (e: MouseEvent) => {
//       if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   const current = options.find(o => o.value === value) || null;

//   const handleSelect = (v: number) => {
//     if (disabled) return; // Chặn select nếu disabled
//     onChange?.(v);
//     setOpen(false);
//   };
//   const toggleOpen = () => {
//     if (disabled) return; // Chặn mở menu nếu disabled
//     setOpen(prev => !prev);
//   }

//   return (
//     <div className="fs" ref={wrapRef}>
//       {/* Trigger */}
//       <button
//         className={"fs__trigger" + (open ? " fs__trigger--open" : "")}
//         onClick={() => setOpen(o => !o)}
//         aria-haspopup="listbox"
//         aria-expanded={open}
//       >
//         <span className="fs__q">Chọn lớp: </span>
//         <span className={"fs__text" + (current ? " fs__text--set" : "")}>
//           {current ? `${current.label}` : placeholder}
//         </span>
//         <span className={"fs__chev" + (open ? " fs__chev--up" : "")}>▲</span>
//       </button>

//       {/* Menu */}
//       {open && (
//         <div className="fs__menu" role="listbox">
//           {options.map(opt => {
//             const selected = opt.value === value;
//             return (
//               <div
//                 key={opt.value}
//                 role="option"
//                 aria-selected={selected}
//                 className={"fs__item" + (selected ? " fs__item--selected" : "")}
//                 onClick={() => handleSelect(opt.value)}
//               >
//                 <span className="fs__emoji" aria-hidden>{opt.emoji}</span>
//                 <span className="fs__label">{opt.label}</span>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }
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
  disabled?: boolean; // [1] Thêm prop disabled
};

export default function FancyClassSelect({
  value = null,
  onChange,
  options = DEFAULT_OPTIONS,
  placeholder = "Chọn Lớp Học…",
  disabled = false, // Mặc định là cho phép chọn
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
    if (disabled) return; // Chặn select nếu disabled
    onChange?.(v);
    setOpen(false);
  };

  const toggleOpen = () => {
    if (disabled) return; // Chặn mở menu nếu disabled
    setOpen(prev => !prev);
  }

  return (
    // [2] Thêm class 'fs--disabled' để dễ CSS (nếu cần mờ đi)
    <div className={`fs ${disabled ? 'fs--disabled' : ''}`} ref={wrapRef}>
      {/* Trigger */}
      <button
        className={"fs__trigger" + (open ? " fs__trigger--open" : "")}
        onClick={toggleOpen}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled} // [3] Disable button HTML
        style={{ 
          cursor: disabled ? 'default' : 'pointer',
          opacity: disabled ? 1 : 1 // Giữ nguyên độ đậm để dễ đọc, hoặc chỉnh 0.7 nếu muốn mờ
        }}
      >
        <span className="fs__q">Lớp: </span>
        <span className={"fs__text" + (current ? " fs__text--set" : "")}>
          {current ? `${current.label}` : placeholder}
        </span>
        
        {/* [4] Chỉ hiện mũi tên nếu KHÔNG bị disabled */}
        {!disabled && (
            <span className={"fs__chev" + (open ? " fs__chev--up" : "")}>▲</span>
        )}
      </button>

      {/* Menu */}
      {open && !disabled && (
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