// src/components/learner/ui/TestWTS.tsx
import { useMemo } from "react";
import type { TestQuestionRes } from "../../../type/test";

export default function TestWTS({
  q,
  sequence, // Mảng chứa các optionID đã chọn theo thứ tự: [101, 103, 102]
  onUpdate,
  disabled,
}: {
  q: TestQuestionRes;
  sequence: number[];
  onUpdate: (seq: number[]) => void;
  disabled?: boolean;
}) {
  // Danh sách tất cả options gốc
  const allOptions = useMemo(
    () => (q.options ?? []).slice().sort((a, b) => a.id - b.id), // Sort stable
    [q.options]
  );

  // 1. Options đã chọn (Map từ ID sang Object để hiển thị)
  const selectedOptions = sequence
    .map((id) => allOptions.find((opt) => opt.id === id))
    .filter((opt) => opt !== undefined);

  // 2. Options còn lại (chưa chọn)
  const availableOptions = allOptions.filter(
    (opt) => !sequence.includes(opt.id)
  );

  const handleSelect = (id: number) => {
    if (disabled) return;
    onUpdate([...sequence, id]); // Thêm vào cuối danh sách chọn
  };

  const handleDeselect = (id: number) => {
    if (disabled) return;
    onUpdate(sequence.filter((sid) => sid !== id)); // Xóa khỏi danh sách chọn
  };

  return (
    <div>
      <div className="pg-panel" style={{ minHeight: "100px", alignItems: "center", display: "flex", justifyContent: "center" }}>
        <h3 style={{ margin: 0, color: "#666" }}>{q.questionContent || "Sắp xếp các từ thành câu hoàn chỉnh"}</h3>
      </div>

      {/* Vùng hiển thị câu trả lời */}
      <div 
        style={{
            minHeight: 80, border: '2px dashed #b2d9ff', borderRadius: 14, background: '#f8fbff',
            margin: '20px 0', padding: 16, display: 'flex', flexWrap: 'wrap', gap: 10
        }}
      >
        {selectedOptions.length === 0 && <span style={{color:'#999'}}>Chọn từ bên dưới...</span>}
        {selectedOptions.map((opt) => (
          <button
            key={`sel-${opt!.id}`}
            className="wtsg__token selected" // Tận dụng class từ game CSS
            style={{background: '#e9f5ff', border: '1px solid #74c0fc', color: '#007bff', padding: '8px 14px', borderRadius: 8, cursor: 'pointer'}}
            onClick={() => handleDeselect(opt!.id)}
          >
            {opt.optionText}
          </button>
        ))}
      </div>

      {/* Ngân hàng từ */}
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center'}}>
        {availableOptions.map((opt) => (
          <button
            key={`av-${opt.id}`}
            className="wtsg__token available"
            style={{background: '#f8f9fa', border: '1px solid #ced4da', color: '#495057', padding: '8px 14px', borderRadius: 8, cursor: 'pointer'}}
            onClick={() => handleSelect(opt.id)}
          >
            {opt.optionText?opt.optionText:"none"}
          </button>
        ))}
      </div>
    </div>
  );
}