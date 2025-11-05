import React, { useEffect, useState } from "react"; // adjust path if needed
import type { AxiosError } from "axios";
import "../css/TestListByLesson.css";
import type { TestResByLesson } from "../../../type/test";
import { getTestsByLesson } from "../../../api/test";
import { useNavigate } from "react-router-dom";


type Props = {
  lessonId: number;
  onSelect?: (test: TestResByLesson) => void;
  className?: string;
};

export default function TestListByLesson({ lessonId, onSelect, className = "" }: Props) {
  const [tests, setTests] = useState<TestResByLesson[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!lessonId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setTests(null);

    (async () => {
      try {
        const data = await getTestsByLesson(lessonId);
        if (!cancelled) setTests(data || []);
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError(getErrorMessage(err as AxiosError));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  const handleSelect = (t: TestResByLesson) => {
    if (!t.active) return;
    if (onSelect) onSelect(t);
    else {
      navigate(`/learn/units/${t.id}/test`);
    }
  };

  return (
    <div className={`tl-wrapper ${className}`}>
      <header className="tl-header">
        <div className="tl-logo">🎒</div>
        <div>
          <h2 className="tl-title">Chọn bài kiểm tra</h2>
          <p className="tl-sub">Chọn một bài bạn muốn làm — hoàn thành để nhận sao 🌟</p>
        </div>
      </header>

      {loading && (
        <div className="tl-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="tl-card tl-skeleton" />
          ))}
        </div>
      )}

      {error && <div className="tl-error">{error}</div>}

      {!loading && tests && tests.length === 0 && (
        <div className="tl-empty">Chưa có bài kiểm tra cho bài học này.</div>
      )}

      {!loading && tests && tests.length > 0 && (
        <div className="tl-grid">
          {tests.map((t) => (
            <article
              key={t.id}
              className={`tl-card ${t.active ? "tl-card-active" : "tl-card-locked"}`}
              onClick={() => handleSelect(t)}
              role="button"
              aria-disabled={!t.active}
            >
              <div className="tl-card-head">
                <div className="tl-icon">🧩</div>
                <div className="tl-meta">
                  <h3 className="tl-card-title">{t.title}</h3>
                  <div className="tl-badge">{t.type}</div>
                </div>
              </div>

              <p className="tl-desc">{t.description || "Bài kiểm tra nhỏ để ôn tập."}</p>

              <div className="tl-footer">
                <div className="tl-duration">⏱ {t.durationMin ? `${t.durationMin} phút` : `~5 phút`}</div>
                <div className="tl-right">
                  <div className={`tl-status ${t.active ? "online" : "offline"}`}>{t.active ? "Sẵn sàng" : "Khóa"}</div>
                  <div className="tl-id">ID: {t.id}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <footer className="tl-footer-note">Gợi ý: khuyến khích bé làm bài cùng người lớn nếu cần — chúc bé học vui! 🎉</footer>
    </div>
  );
}

function getErrorMessage(err: AxiosError) {
  if (!err.response) return "Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng.";
  const status = err.response.status;
  if (status === 404) return "Không tìm thấy bài học hoặc bài kiểm tra.";
  if (status === 401) return "Bạn cần đăng nhập để xem danh sách này.";
  return "Có lỗi xảy ra. Vui lòng thử lại sau.";
}

