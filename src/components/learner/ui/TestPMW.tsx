// src/components/learner/ui/TestPMW.tsx
import { useState, useMemo } from "react";
import type { TestQuestionRes } from "../../../type/test";

type Pair = { leftOptionId: number; rightOptionId: number };

export default function TestPMW({
  q,
  pairs, // Danh sách các cặp người dùng đã nối
  onUpdate,
  disabled,
}: {
  q: TestQuestionRes;
  pairs: Pair[];
  onUpdate: (p: Pair[]) => void;
  disabled?: boolean;
}) {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  
  // State dùng cho Review: Click để xem đáp án đúng của cặp sai
  const [hintId, setHintId] = useState<number | null>(null); 

  const { leftOpts, rightOpts } = useMemo(() => {
    const left = q.options?.filter((o) => o.side === "LEFT") || [];
    const right = q.options?.filter((o) => o.side === "RIGHT") || [];
    return { leftOpts: left, rightOpts: right };
  }, [q.options]);

  // --- LOGIC HELPERS ---

  // 1. Kiểm tra xem item (id) đã được user nối chưa
  const getUserPair = (id: number) => {
    return pairs.find((p) => p.leftOptionId === id || p.rightOptionId === id);
  };

  // 2. Kiểm tra cặp nối của user có đúng không (dựa vào pairKey)
  const checkUserPairCorrectness = (pair: Pair) => {
    const left = q.options?.find((o) => o.id === pair.leftOptionId);
    const right = q.options?.find((o) => o.id === pair.rightOptionId);
    return left && right && left.pairKey === right.pairKey;
  };

  // 3. Tìm ID của đối tác ĐÚNG (Correct Partner) cho item này (dùng để hint)
  const getCorrectPartnerId = (itemId: number) => {
    const item = q.options?.find((o) => o.id === itemId);
    if (!item) return null;
    // Tìm item ở phía bên kia có cùng pairKey
    const partner = q.options?.find(
      (o) => o.side !== item.side && o.pairKey === item.pairKey
    );
    return partner?.id || null;
  };

  // --- HANDLERS ---

  const handleLeftClick = (id: number) => {
    if (disabled) {
      // Logic Review: Click để xem hint
      setHintId(id);
      return;
    }
    // Logic Game: Undo hoặc Select
    const existingPair = getUserPair(id);
    if (existingPair) {
      onUpdate(pairs.filter((p) => p !== existingPair));
      return;
    }
    setSelectedLeft(id === selectedLeft ? null : id);
  };

  const handleRightClick = (id: number) => {
    if (disabled) {
      // Logic Review
      setHintId(id);
      return;
    }
    // Logic Game
    const existingPair = getUserPair(id);
    if (existingPair) {
      onUpdate(pairs.filter((p) => p !== existingPair));
      return;
    }
    if (selectedLeft) {
      const newPair = { leftOptionId: selectedLeft, rightOptionId: id };
      onUpdate([...pairs, newPair]);
      setSelectedLeft(null);
    }
  };

  // Hàm render item chung cho cả Left và Right
  const renderItem = (opt: any, side: "LEFT" | "RIGHT") => {
    const userPair = getUserPair(opt.id);
    const isSelected = selectedLeft === opt.id;
    
    // -- Logic Style --
    let bg = "#fff";
    let border = "2px solid #e5e7eb";
    let opacity = 1;
    let color = "#374151";

    if (!disabled) {
      // Mode: Làm bài
      if (isSelected) { bg = "#e9f5ff"; border = "2px solid #3b82f6";color = "#1d4ed8"; }
      else if (userPair) { bg = "#f0fdf4"; border = "2px solid #22c55e"; }
    } else {
      // Mode: Review
      if (userPair) {
        const isCorrect = checkUserPairCorrectness(userPair);
        if (isCorrect) {
          // Đúng: Xanh
          bg = "#ecfdf5"; border = "2px solid #22c55e"; color = "#166534";;
        } else {
          // Sai: Đỏ
          bg = "#fef2f2"; border = "2px solid #ef4444";color = "#991b1b";
        }
      } else {
         // Chưa nối: Xám mờ
         opacity = 0.6;
      }

      // Hiệu ứng Hint: Nếu item này là Partner đúng của item đang được click (hintId)
      // thì tô viền Vàng để highlight
      if (hintId) {
        const correctPartnerOfHint = getCorrectPartnerId(hintId);
        if (opt.id === correctPartnerOfHint || opt.id === hintId) {
             border = "3px solid #f59e0b"; // Vàng cam
             bg = "#fffbeb";
             opacity = 1;
             color = "#b45309";
        }
      }
    }

    return (
      <div
        key={opt.id}
        onClick={() => (side === "LEFT" ? handleLeftClick(opt.id) : handleRightClick(opt.id))}
        style={{
          padding: 8,
          borderRadius: 12,
          cursor: disabled ? "help" : "pointer", // Cursor help khi review
          background: bg,
          border: border,
          color: color,
          textAlign: "center",
          fontWeight: 600,
          height: 90,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: opacity,
          transition: "all 0.2s",
          position: "relative"
        }}
      >
        {opt.imgUrl ? (
          <img src={opt.imgUrl} style={{ maxHeight: 70, maxWidth: "100%" }} alt="img" />
        ) : (
          <span style={{fontSize: '15px'}}>{opt.optionText}</span>
        )}
        
        {/* Icon chỉ thị đúng sai nhỏ ở góc */}
        {disabled && userPair && (
           <div style={{position: 'absolute', top: -8, right: -8, fontSize: 16}}>
              {checkUserPairCorrectness(userPair) ? "✅" : "❌"}
           </div>
        )}
      </div>
    );
  };

  return (
    <div>
       {disabled && (
         <div style={{textAlign:'center', marginBottom: 15, fontSize: 14, color: '#6b7280'}}>
           💡 Click vào ô sai (❌) để xem cặp đúng tương ứng
         </div>
       )}

      <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
        {/* Cột Trái */}
        <div style={{ width: "48%", display: "flex", flexDirection: "column", gap: "12px" }}>
          {leftOpts.map((opt) => renderItem(opt, "LEFT"))}
        </div>

        {/* Cột Phải */}
        <div style={{ width: "48%", display: "flex", flexDirection: "column", gap: "12px" }}>
          {rightOpts.map((opt) => renderItem(opt, "RIGHT"))}
        </div>
      </div>
    </div>
  );
}