import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getProfileId } from "../../../store/storage";
import { getLessonProgressDetail, type LessonProgressDetail, type TestAttemptHistory } from "../../../api/gradeProgress";
import "../css/LessonProgressDetailPage.css"; // 👈 File CSS mới (Bước 2.5)

// Component biểu đồ cột (Bar Chart)
const TestHistoryChart = ({ history }: { history: TestAttemptHistory }) => {
  const maxScore = 10; // Giả sử điểm tối đa là 10
  
  return (
    <div className="lpd-test">
      <h4 className="lpd-test-title">{history.testTitle}</h4>
      <div className="lpd-chart-wrap">
        <div className="lpd-chart-y-axis">
          <span>{maxScore}đ</span>
          <span>{maxScore / 2}đ</span>
          <span>0đ</span>
        </div>
        <div className="lpd-chart">
          {history.attempts.map((att, index) => (
            <div className="lpd-chart-col" key={att.attemptId}>
              <div 
                className="lpd-chart-bar" 
                style={{ height: `${(att.score / maxScore) * 100}%` }}
              >
                <span className="lpd-chart-score">{att.score.toFixed(1)}đ</span>
              </div>
              <span className="lpd-chart-label">Lần {index + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Component chính của trang
export default function LessonProgressDetailPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const profileId = getProfileId();
  const navigate = useNavigate();

  const [data, setData] = useState<LessonProgressDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profileId || !lessonId) {
      setError("Không tìm thấy thông tin bài học hoặc hồ sơ.");
      setLoading(false);
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const detailData = await getLessonProgressDetail(Number(lessonId), profileId);
        if (isMounted) {
          setData(detailData);
        }
      } catch (e: any) {
        if (isMounted) {
          setError(e.message || "Không thể tải dữ liệu chi tiết");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => { isMounted = false; };
  }, [lessonId, profileId]);

  return (
    <div className="lpd-wrapper">
      {/* 1. Header */}
      <header className="lpd-header">
        <Link to="/learn/progress" className="lpd-back-link">
          ← Quay lại tổng quan tiến độ
        </Link>
        <h1 className="lpd-title">
          {data ? `${data.unitName}: ${data.lessonName}` : "Chi tiết Bài học"}
        </h1>
      </header>

      {/* 2. Loading/Error States */}
      {loading && <div className="lpd-loading">Đang tải chi tiết...</div>}
      {error && <div className="lpd-error">{error}</div>}

      {/* 3. Content */}
      {!loading && !error && data && (
        <div className="lpd-grid">
          {/* 3.1 Cột "Cần ôn tập" */}
          <section className="lpd-card">
            <h3 className="lpd-card-title">Cần ôn tập 🧠</h3>
            
            {/* <h4 className="lpd-sub-title">Từ vựng sai nhiều nhất</h4>
            <div className="lpd-review-list">
              {data.incorrectVocabularies.length > 0 ? (
                data.incorrectVocabularies.map((item, i) => (
                  <div className="lpd-review-item" key={`v-${i}`}>
                    <div>
                      <div className="lpd-item-en">{item.itemEn}</div>
                      <div className="lpd-item-vi">{item.itemVi}</div>
                    </div>
                    <span className="lpd-item-count">{item.wrongCount} lần sai</span>
                  </div>
                ))
              ) : (
                <p className="lpd-no-data-item">🎉 Tuyệt vời! Bé không sai từ vựng nào.</p>
              )}
            </div>

            <h4 className="lpd-sub-title">Câu sai nhiều nhất</h4>
            <div className="lpd-review-list">
              {data.incorrectSentences.length > 0 ? (
                data.incorrectSentences.map((item, i) => (
                  <div className="lpd-review-item" key={`s-${i}`}>
                    <div className="lpd-item-en">{item.itemEn}</div>
                    <span className="lpd-item-count">{item.wrongCount} lần sai</span>
                  </div>
                ))
              ) : (
                 <p className="lpd-no-data-item">🎉 Hoan hô! Bé không sai câu nào.</p>
              )} */}
              <div className="lpd-review-grid">

    {/* Cột 1: Từ vựng */}
    <div>
      <h4 className="lpd-sub-title">TỪ VỰNG SAI NHIỀU NHẤT</h4>
      <div className="lpd-review-list">
        {data.incorrectVocabularies.length > 0 ? (
          data.incorrectVocabularies.map((item, i) => (
            <div className="lpd-review-item" key={`v-${i}`}>
              <div>
                <div className="lpd-item-en">{item.itemEn}</div>
                <div className="lpd-item-vi">{item.itemVi}</div>
              </div>
              <span className="lpd-item-count">{item.wrongCount} lần sai</span>
            </div>
          ))
        ) : (
          <p className="lpd-no-data-item">🎉 Tuyệt vời! Bé không sai từ vựng nào.</p>
        )}
      </div>
    </div>

    {/* Cột 2: Câu */}
    <div>
      <h4 className="lpd-sub-title">CÂU SAI NHIỀU NHẤT</h4>
      <div className="lpd-review-list">
        {data.incorrectSentences.length > 0 ? (
          data.incorrectSentences.map((item, i) => (
            <div className="lpd-review-item" key={`s-${i}`}>
              {/* (Đối với câu, chúng ta có thể chỉ hiển thị lpd-item-en) */}
              <div className="lpd-item-en">{item.itemEn}</div>
              <span className="lpd-item-count">{item.wrongCount} lần sai</span>
            </div>
          ))
        ) : (
            <p className="lpd-no-data-item">🎉 Hoan hô! Bé không sai câu nào.</p>
        )}
      </div>
    </div>
            </div>
          </section>

          {/* 3.2 Cột "Lịch sử kiểm tra" */}
          <section className="lpd-card">
            <h3 className="lpd-card-title">Lịch sử kiểm tra 📊</h3>
            <div className="lpd-tests-list">
              {data.testHistories.length > 0 ? (
                data.testHistories.map(history => (
                  <TestHistoryChart key={history.testId} history={history} />
                ))
              ) : (
                <p className="lpd-no-data">Bé chưa làm bài kiểm tra nào cho lesson này.</p>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}