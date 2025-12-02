// src/components/learner/ui/TestWTS.tsx
import { useMemo } from "react";
import type { TestQuestionRes } from "../../../type/test";

// 1. Hàm xáo trộn mảng (Fisher-Yates Shuffle)
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export default function TestWTS({
  q,
  sequence, // Mảng chứa các optionID đã chọn theo thứ tự người dùng click
  onUpdate,
  disabled,
}: {
  q: TestQuestionRes;
  sequence: number[];
  onUpdate: (seq: number[]) => void;
  disabled?: boolean;
}) {
  
  // 2. Tạo danh sách gốc (để tham chiếu hiển thị từ đã chọn)
  const allOptions = useMemo(() => q.options ?? [], [q.options]);

  // 3. Tạo danh sách ĐÃ XÁO TRỘN (để hiển thị ở ngân hàng từ bên dưới)
  // Quan trọng: Chỉ xáo trộn 1 lần khi q.id thay đổi (câu hỏi mới) để tránh nút bị nhảy lung tung khi click
  const shuffledAllOptions = useMemo(
    () => shuffleArray(q.options ?? []),
    [q.id] 
  );

  // 4. Lọc ra các Options ĐÃ CHỌN (Hiển thị ở vùng trả lời trên cùng)
  // Map từ ID trong sequence sang object option
  const selectedOptions = sequence
    .map((id) => allOptions.find((opt) => opt.id === id))
    .filter((opt) => opt !== undefined);

  // 5. Lọc ra các Options CÒN LẠI (Hiển thị ở ngân hàng từ bên dưới)
  // Lấy từ danh sách đã xáo trộn
  const availableOptions = shuffledAllOptions.filter(
    (opt) => !sequence.includes(opt.id)
  );

  // Xử lý chọn từ (từ dưới lên trên)
  const handleSelect = (id: number) => {
    if (disabled) return;
    onUpdate([...sequence, id]); // Thêm ID vào cuối mảng sequence
  };

  // Xử lý bỏ chọn (từ trên xuống dưới)
  const handleDeselect = (id: number) => {
    if (disabled) return;
    // Loại bỏ ID này khỏi mảng sequence
    onUpdate(sequence.filter((sid) => sid !== id)); 
  };

  return (
    <div>
      {/* --- PHẦN ĐỀ BÀI --- */}
      <div className="pg-panel" style={{ minHeight: "100px", flexDirection: 'column', alignItems: "center", display: "flex", justifyContent: "center", gap: 10 }}>
        
        {/* Nếu có ảnh/audio thì hiện, nếu không thì hiện hướng dẫn */}
        {q.mediaUrl ? (
           <img src={q.mediaUrl} alt="illustration" style={{maxHeight: 180, objectFit: 'contain'}} />
        ) : (
           // SỬA LỖI: Không hiển thị q.questionContent (vì nó là đáp án "It is green")
           // Thay bằng text hướng dẫn
           <h3 style={{ margin: 0, color: "#666", textAlign: 'center' }}>
             Sắp xếp các từ bên dưới thành câu hoàn chỉnh
           </h3>
        )}

      </div>

      {/* --- VÙNG TRẢ LỜI (Hiển thị các từ đã chọn) --- */}
      <div 
        style={{
            minHeight: 80, 
            border: '2px dashed #b2d9ff', 
            borderRadius: 14, 
            background: '#f8fbff',
            margin: '20px 0', 
            padding: 16, 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 10,
            justifyContent: 'center',
            alignItems: 'center'
        }}
      >
        {selectedOptions.length === 0 && (
            <span style={{color:'#999', fontStyle: 'italic'}}>Chọn từ bên dưới...</span>
        )}

        {selectedOptions.map((opt) => (
          <button
            key={`sel-${opt!.id}`}
            // Tái sử dụng class CSS của game nếu có, hoặc style trực tiếp
            style={{
                background: '#e9f5ff', 
                border: '2px solid #74c0fc', 
                color: '#007bff', 
                padding: '8px 16px', 
                borderRadius: 12, 
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 600,
                boxShadow: '0 2px 0 #74c0fc'
            }}
            onClick={() => handleDeselect(opt!.id)}
            disabled={disabled}
          >
            {opt!.optionText}
          </button>
        ))}
      </div>

      {/* --- NGÂN HÀNG TỪ (Hiển thị các từ chưa chọn - Đã xáo trộn) --- */}
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center'}}>
        {availableOptions.map((opt) => (
          <button
            key={`av-${opt.id}`}
            style={{
                background: '#fff', 
                border: '2px solid #e5e7eb', 
                color: '#4b5563', 
                padding: '8px 16px', 
                borderRadius: 12, 
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 600,
                boxShadow: '0 4px 0 #e5e7eb',
                transition: 'transform 0.1s'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'translateY(2px)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            onClick={() => handleSelect(opt.id)}
            disabled={disabled}
          >
            {opt.optionText?opt.optionText:"error"}
          </button>
        ))}
      </div>
    </div>
  );
}