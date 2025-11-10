import { useEffect, useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import CreateLessonForm from "../../components/admin/CreateLessonForm"; // Tái sử dụng form
import UnitRowCard from "../../components/admin/UnitRowCard"; // Component mới
import {
  getLessonsByGrade,
  type LessonByGradeRes,
} from "../../api/adminLessonApi"; // API mới

// Tái sử dụng CSS shell của bạn
import "../../styles/admin.css"; 
// Import CSS riêng cho trang này
import "./AdminLessonListPage.css"; 

export default function AdminLessonListPage() {
  // ---- trạng thái dữ liệu ----
  const [lessons, setLessons] = useState<LessonByGradeRes[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number>(1);

  // ---- load danh sách theo class ----
  async function load(gradeId: number) {
    setLoading(true);
    setError(null);
    try {
      const data = await getLessonsByGrade(gradeId);
      setLessons(data);
    } catch (err: any) {
      setError(err.message || "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(selectedClassId);
  }, [selectedClassId]);

  // ---- Xử lý actions (Tạm thời chỉ log) ----
  function handleEdit(id: number) {
    console.log("Edit lesson:", id);
    alert("Chức năng Sửa bài học " + id);
    // TODO: Mở modal sửa
  }

  function handleDelete(id: number) {
    console.log("Delete lesson:", id);
    if (window.confirm("Bạn có chắc chắn muốn xóa bài học " + id + "?")) {
      // TODO: Gọi API xóa
    }
  }
  
  // ---- Hàm xử lý tạo (tạm thời) ----
  // (Bạn có thể thay thế bằng logic gọi API tạo bài học thật)
  async function handleCreate(data: {
    title: string;
    position: number;
    isActive: boolean;
    classId: number;
  }) {
    console.log("Creating:", data);
    alert("Chức năng tạo bài học (xem console log)");
    // await createLesson(data); // (Tạm ẩn)
    setOpenForm(false);
    load(selectedClassId); // Tải lại danh sách
  }

  // ---- giao diện ----
  return (
    <div className="admin-shell">
      {/* 1. Sidebar (Tái sử dụng) */}
      <Sidebar active="learning" />

      {/* 2. Content (Tái sử dụng shell) */}
      <main className="content">
        <div className="content-inner">
          {/* Top bar: (Tái sử dụng) */}
          <div className="topbar">
            <select
              className="select"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(Number(e.target.value))}
            >
              {/* Hardcode 5 lớp */}
              <option value={1}>Lớp 1</option>
              <option value={2}>Lớp 2</option>
              <option value={3}>Lớp 3</option>
              <option value={4}>Lớp 4</option>
              <option value={5}>Lớp 5</option>
            </select>

            <button className="btn" onClick={() => setOpenForm(true)}>
              TẠO BÀI HỌC
            </button>
          </div>

          {/* Tiêu đề (Tái sử dụng) */}
          <div className="section-title">QUẢN LÝ BÀI HỌC</div>

          {/* 3. Danh sách (Giao diện mới) */}
          <div className="list-container">
            {/* Header của danh sách */}
            <div className="list-header">
              <div className="header-col">Tên Unit</div>
              <div className="header-col">Trạng thái</div>
              <div className="header-col">Ngày cập nhật</div>
              <div className="header-col">Hình ảnh</div>
              <div className="header-col" style={{ textAlign: "right" }}>
                Hành động
              </div>
            </div>

            {/* Nội dung danh sách */}
            <div className="list-body">
              {loading && <p className="list-message">Đang tải...</p>}
              {error && <p className="list-message error">{error}</p>}
              {!loading && !error && lessons.length === 0 && (
                <p className="list-message">Chưa có bài học nào cho lớp này.</p>
              )}

              {!loading &&
                !error &&
                lessons.map((lesson) => (
                  <UnitRowCard
                    key={lesson.id}
                    lesson={lesson}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
            </div>
          </div>
        </div>
      </main>

      {/* Modal tạo bài học (Tái sử dụng) */}
      {openForm && (
        <div className="modal-backdrop" onClick={() => setOpenForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Tạo bài học mới</h3>
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