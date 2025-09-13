import { useEffect, useState } from "react";
import { createLesson, listLessonsByClass } from "../../services/lessonService";
import type { Lesson } from "../../type/lesson";  // nhớ đúng path
import CreateLessonForm from "../../components/admin/CreateLessonForm";
import LessonCard from "../../components/admin/LessonCard";
import Sidebar from "../../components/admin/Sidebar";

export default function LearningPage() {
  // ---- trạng thái dữ liệu ----
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number>(1);

  // ---- load danh sách theo class ----
  async function load(classId: number) {
    setLoading(true);
    const data = await listLessonsByClass(classId);
    setLessons(data);
    setLoading(false);
  }

  useEffect(() => { load(selectedClassId); }, [selectedClassId]);

  // ---- tạo bài học ----
  async function handleCreate(data: { title: string; position: number; isActive: boolean; classId: number }) {
    await createLesson(data);
    setOpenForm(false);
    load(selectedClassId); // refresh
  }

  // helper: tính màu card theo index (giống hình: xanh → xanh dương → đỏ → lặp lại)
  function cardVariantByIndex(i: number): "green" | "blue" | "red" {
    const r = i % 3;
    return r === 0 ? "green" : r === 1 ? "blue" : "red";
    // Bạn có thể thay bằng logic theo trạng thái nếu muốn.
  }

  // ---- giao diện ----
  return (
    <div className="admin-shell">
      <Sidebar active="learning" />

      <main className="content">
        <div className="content-inner">
          {/* Top bar: bộ lọc lớp + nút tạo */}
          <div className="topbar">
            <select
              className="select"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(Number(e.target.value))}
            >
              {/* Tạm hardcode demo, sau kết nối API lớp */}
              <option value={1}>Lớp 1</option>
              <option value={2}>Lớp 2</option>
              <option value={3}>Lớp 3</option>
            </select>

            <button className="btn" onClick={() => setOpenForm(true)}>
              Tạo bài học
            </button>
          </div>

          {/* Tiêu đề có đường kẻ hai bên */}
          <div className="section-title">
            DANH SÁCH BÀI HỌC
          </div>

          {/* Danh sách lesson */}
          {loading && <p>Đang tải...</p>}
          {!loading && lessons.length === 0 && <p>Chưa có bài học nào.</p>}

          {!loading && lessons.map((l, idx) => (
            <LessonCard key={l.id} lesson={l} variant={cardVariantByIndex(idx)} />
          ))}
        </div>
      </main>

      {/* Modal tạo bài học (dùng lại component bạn đã có) */}
      {openForm && (
        <div className="modal-backdrop" onClick={() => setOpenForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Tạo bài học</h3>
            <CreateLessonForm
              defaultClassId={selectedClassId}
              onCancel={() => setOpenForm(false)}
              onSubmit={handleCreate}
            />
          </div>
        </div>
      )}
    </div>
  );
}
