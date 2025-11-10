import React from "react";
import type { LessonByGradeRes } from "../../api/adminLessonApi";
import "./UnitRowCard.css"; // CSS riêng cho component này

// Icon SVG cho nút Edit và Delete
const EditIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4L18.5 2.5z"></path>
  </svg>
);

const DeleteIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

// Helper định dạng ngày
function formatDate(isoString: string) {
  if (!isoString) return "N/A";
  try {
    return new Date(isoString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (e) {
    return "Invalid Date";
  }
}

type Props = {
  lesson: LessonByGradeRes;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
};

export default function UnitRowCard({ lesson, onEdit, onDelete }: Props) {
  const statusText = lesson.active ? "Hoạt động" : "Đóng";
  const statusClass = lesson.active ? "status-active" : "status-inactive";

  // Dùng mascot làm ảnh, nếu không có thì dùng placeholder
  const imageUrl =
    lesson.mascot ??
    "https://res.cloudinary.com/dxhhluk84/image/upload/v1759733260/NormalSound_c5nhfv.png"; // Placeholder Speaker Icon

  return (
    <div className="unit-row-card">
      <div className="unit-col-name">
        {lesson.unitName}: {lesson.lessonName}
      </div>
      <div className={`unit-col-status ${statusClass}`}>{statusText}</div>
      <div className="unit-col-date">{formatDate(lesson.updatedAt)}</div>
      <div className="unit-col-image">
        <div className="image-box">
          <img src={imageUrl} alt={lesson.lessonName} />
        </div>
      </div>
      <div className="unit-col-actions">
        <button
          className="action-btn"
          aria-label="Sửa"
          onClick={() => onEdit(lesson.id)}
        >
          <EditIcon />
        </button>
        <button
          className="action-btn btn-delete"
          aria-label="Xóa"
          onClick={() => onDelete(lesson.id)}
        >
          <DeleteIcon />
        </button>
      </div>
    </div>
  );
}