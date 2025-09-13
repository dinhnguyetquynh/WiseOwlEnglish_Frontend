import { useState } from "react";


export default function CreateLessonForm({
  defaultClassId,
  onCancel,
  onSubmit,
}: {
  defaultClassId: number;
  onCancel: () => void;
  onSubmit: (data: { title: string; position: number; isActive: boolean; classId: number }) => void;
}) {
  const [title, setTitle] = useState("");
  const [position, setPosition] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { alert("Vui lòng nhập tiêu đề"); return; }
    onSubmit({ title, position, isActive, classId: defaultClassId });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <label>Tiêu đề</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Getting started..." />
      </div>

      <div className="row">
        <label>Thứ tự</label>
        <input type="number" min={1} value={position} onChange={e => setPosition(Number(e.target.value))} />
      </div>

      <div className="row">
        <label>Trạng thái</label>
        <select value={isActive ? "1" : "0"} onChange={e => setIsActive(e.target.value === "1")}>
          <option value="1">Hoạt động</option>
          <option value="0">Không hoạt động</option>
        </select>
      </div>

      <div className="actions">
        <button type="button" className="btn secondary" onClick={onCancel}>Hủy</button>
        <button type="submit" className="btn">Tạo</button>
      </div>
    </form>
  );
}