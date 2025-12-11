import { useLocation, useNavigate } from "react-router-dom";
import type { SubmitTestRes, QuestionResultRes } from "../../../type/test";
import "../css/TestResultPage.css";

export default function TestResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const result: SubmitTestRes = location.state;

  const goHome = () => navigate("/learn"); // hoặc quay về trang menu bài học
  const handleReview = () => {
    navigate("/learn/test-review", { state: { result } });
  };
  return (
    <div className="result-wrap">
    
      <h1 className="result-title">KẾT QUẢ KIỂM TRA</h1>

      <div className="result-summary">
        <p><strong>Điểm:</strong> {result.score.toFixed(2)} / 10</p>
        <p><strong>Đúng:</strong> {result.correctCount} câu</p>
        <p><strong>Sai:</strong> {result.wrongCount} câu</p>
        <p><strong>Thời gian làm bài:</strong> {Math.floor(result.durationSec / 60)} phút {result.durationSec % 60} giây</p>
      </div>

      {/* <div className="result-questions">
        <h2>Chi tiết từng câu:</h2>
        {result.questionResults.map((qr, index) => (
          <div key={qr.questionId} className={`result-question ${qr.correct ? "ok" : "no"}`}>
            <div className="rq-head">
              <span className="rq-index">Câu {index + 1}:</span>
              <span className="rq-type">({qr.questionType})</span>
              <span className="rq-score">+{qr.earnedScore}đ</span>
            </div>
            <div className="rq-detail">
              {qr.correct ? (
                <p className="rq-correct">✅ Trả lời đúng</p>
              ) : (
                <>
                  <p className="rq-wrong">❌ Trả lời sai</p>
                  <p className="rq-ans">Đáp án đúng: {qr.correctOptionIds?.join(", ")}</p>
                </>
              )}
            </div>
          </div>
        ))}
      </div> */}

      <div className="result-actions">
        <button onClick={handleReview} className="pg-btn pg-btn--ghost" style={{ marginRight: 10 }}>
          XEM LẠI BÀI LÀM
        </button>
        <button onClick={goHome} className="pg-btn pg-btn--primary">
          VỀ TRANG CHÍNH
        </button>
      </div>
    </div>
  );
} 



