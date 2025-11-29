// src/components/learner/ui/TestPMW.tsx
import { useState, useMemo } from "react";
import type { TestQuestionRes } from "../../../type/test";

type Pair = { leftOptionId: number; rightOptionId: number };

export default function TestPMW({
  q,
  pairs, // Danh sách cặp đã nối: [{left: 1, right: 2}, ...]
  onUpdate,
  disabled,
}: {
  q: TestQuestionRes;
  pairs: Pair[];
  onUpdate: (p: Pair[]) => void;
  disabled?: boolean;
}) {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);

  // Tách options trái/phải dựa vào field `side` từ API
  const { leftOpts, rightOpts } = useMemo(() => {
    const left = q.options.filter((o) => o.side === "LEFT");
    const right = q.options.filter((o) => o.side === "RIGHT");
    return { leftOpts: left, rightOpts: right };
  }, [q.options]);

  // Kiểm tra 1 option đã được nối chưa
  const isPaired = (id: number) => {
    return pairs.some((p) => p.leftOptionId === id || p.rightOptionId === id);
  };

  // Tìm ID đối tác đã nối (để highlight)
  const getPartnerId = (id: number) => {
    const pair = pairs.find((p) => p.leftOptionId === id || p.rightOptionId === id);
    if (!pair) return null;
    return pair.leftOptionId === id ? pair.rightOptionId : pair.leftOptionId;
  };

  const handleLeftClick = (id: number) => {
    if (disabled) return;
    // Nếu đã nối rồi -> Bỏ nối (Undo)
    if (isPaired(id)) {
      onUpdate(pairs.filter((p) => p.leftOptionId !== id));
      return;
    }
    // Chọn để chuẩn bị nối
    setSelectedLeft(id === selectedLeft ? null : id);
  };

  const handleRightClick = (id: number) => {
    if (disabled) return;
    // Nếu đã nối rồi -> Bỏ nối
    if (isPaired(id)) {
      onUpdate(pairs.filter((p) => p.rightOptionId !== id));
      return;
    }
    
    // Nếu đang chọn bên trái -> Tạo cặp mới
    if (selectedLeft) {
      const newPair = { leftOptionId: selectedLeft, rightOptionId: id };
      onUpdate([...pairs, newPair]);
      setSelectedLeft(null); // Reset selection
    }
  };

  return (
    <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
      {/* Cột Trái IMG */}
      <div style={{ width: "45%", display: "flex", flexDirection: "column", gap: "12px" }}>
        {leftOpts.map((opt) => {
          const paired = isPaired(opt.id);
          const selected = selectedLeft === opt.id;
          const partnerId = getPartnerId(opt.id);
          // Style logic
          let bg = "#fff";
          let border = "2px solid #e5e7eb";
          if (selected) { bg = "#e9f5ff"; border = "2px solid #3b82f6"; }
          if (paired) { bg = "#f0fdf4"; border = "2px solid #22c55e"; }

          return (
            <div
              key={opt.id}
              onClick={() => handleLeftClick(opt.id)}
              style={{
                padding: 16, borderRadius: 12, cursor: "pointer",
                background: bg, border: border, textAlign: "center",
                fontWeight: 600, height: 80, display:'flex', alignItems:'center', justifyContent:'center'
              }}
            >
               {/* {opt.optionText ? opt.optionText : <img src={q.mediaUrl} alt="img" style={{maxHeight:60}} />} 
        */}
               {opt.imgUrl ? <img src={opt.imgUrl} style={{maxHeight:60}}/> : opt.optionText}
            </div>
          );
        })}
      </div>

      {/* Cột Phải ( Chữ) */}
      <div style={{ width: "45%", display: "flex", flexDirection: "column", gap: "12px" }}>
        {rightOpts.map((opt) => {
          const paired = isPaired(opt.id);
          // Kiểm tra xem có phải đang được nối với selectedLeft không (để visual effect nếu cần)
          
          let bg = "#fff";
          let border = "2px solid #e5e7eb";
          if (paired) { bg = "#f0fdf4"; border = "2px solid #22c55e"; }

          return (
            <div
              key={opt.id}
              onClick={() => handleRightClick(opt.id)}
              style={{
                padding: 16, borderRadius: 12, cursor: "pointer",
                background: bg, border: border, textAlign: "center",
                fontWeight: 600, height: 80, display:'flex', alignItems:'center', justifyContent:'center'
              }}
            >
               {opt.optionText?opt.optionText:"error"}
            </div>
          );
        })}
      </div>
    </div>
  );
}