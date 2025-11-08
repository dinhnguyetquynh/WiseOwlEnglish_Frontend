
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "../css/PictureGuessingGame.css";
import { getPictureGuessingGame, type PictureGuessingGameRes } from "../../../api/game";
import { gotoResult } from "../../../utils/gameResult";
import { getProfileId } from "../../../store/storage";
import { markItemAsCompleted, type LessonProgressReq } from "../../../api/lessonProgress";



export default function PictureGuessingGamePage() {
  const navigate = useNavigate();
  const { unitId = "" } = useParams();

  const [games, setGames] = useState<PictureGuessingGameRes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [idx, setIdx] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showResult, setShowResult] = useState<null | "correct" | "wrong">(null);
  const [earned, setEarned] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

    useEffect(() => {
      if (!unitId) return;
      let isMounted = true;
      (async () => {
        try {
          setLoading(true);
          // setErr("");
          const data = await getPictureGuessingGame(Number(unitId));
          if (!isMounted) return;
          // Ensure data is an array before sorting
          const gameList = Array.isArray(data) ? data : [data];
          // Sort theo orderIndex asc (phòng khi backend chưa order)
          gameList.sort((a, b) => a.position - b.position);
          setGames(gameList);
          setIdx(0);
        } catch (e: any) {
          if (isMounted) setError(e?.message ?? "Lỗi tải ôn tập từ vựng");
        } finally {
          if (isMounted) setLoading(false);
        }
      })();
      return () => { isMounted = false; };
    }, [unitId]);

  const total = games.length;
  const current = games[idx];

  const correctOption = useMemo(() => current?.options.find((o) => o.correct) || null, [current]);
  const canCheck = selectedId !== null && showResult === null;

  function handleCheck() {
    if (!current || selectedId === null) return;
    const selected = current.options.find((o) => o.id === selectedId);
    const isCorrect = !!selected?.correct;
    setShowResult(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setEarned((p) => p + (current.reward ?? 0));
    }
  }

  async function gotoNext() {

     const learnerProfileId = Number(getProfileId());
        const myPayload: LessonProgressReq = {
        learnerProfileId,
        lessonId: Number(unitId),
        itemType: "GAME_QUESTION", // Phải là chuỗi khớp với Enum
        itemRefId: Number(current.id)
        };
    
        try {
            await markItemAsCompleted(myPayload);
            console.log("FE: Đã cập nhật thành công!");
            const next = idx + 1;
            if (next >= total) {
      // ➜ HOÀN TẤT: điều hướng sang trang kết quả và truyền dữ liệu
              gotoResult(navigate, {
                from: "picture-guessing",  
                gameType:"vocab",     
                unitId,                   
                total,
                correct: correctCount,    
                points: earned,           
              });
            }else {
            // ➜ CHƯA HOÀN TẤT: Chuyển sang câu tiếp theo
            setIdx(next);
            setShowResult(null);
            setSelectedId(null);
            }
        } catch (error) {
            console.error("Lỗi khi đang lưu tiến độ:", error);
            if (error instanceof Error) {
                console.error(error.message); 
            } else {
                console.error("Một lỗi không xác định đã xảy ra:", error);
            }
        }
  }

  if (loading) {
    return (
      <div className="pg-wrap">
        <TopBar index={idx} total={total} />
        <div className="pg-skeleton" />
        <div className="pg-options pg-options--grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="pg-skeleton pg-skeleton--btn" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pg-wrap pg-center">
        <p className="pg-text-error">{error}</p>
        <button onClick={() => window.history.back()} className="pg-btn pg-btn--ghost">Quay lại</button>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="pg-wrap pg-center">
        <p className="pg-text-muted">Chưa có câu hỏi cho bài học này.</p>
      </div>
    );
  }

  const percent = Math.round((idx / Math.max(total, 1)) * 100);

  return (
    <div className="pg-wrap">
      <div className="pg-topbar">
        <button onClick={() => history.back()} className="pg-close" aria-label="Đóng">✕</button>
        <div className="pg-progress">
          <div className="pg-progress__track">
            <div className="pg-progress__bar" style={{ width: `${percent}%` }} />
          </div>
          <div className="pg-progress__text">{Math.min(idx + 1, Math.max(total, 1))}/{Math.max(total, 1)}</div>
        </div>
      </div>

      <h1 className="pg-title">Nhìn hình chọn từ</h1>

      <div className="pg-panel">
        {current.imageUrl ? (
          <img src={current.imageUrl} className="pg-img" alt="question" />
        ) : (
          <div className="pg-text-muted">(Chưa có ảnh)</div>
        )}
      </div>

      <div className="pg-options pg-options--grid">
        {current.options
          .slice()//tao ban sao
          .sort((a, b) => a.position - b.position)
          .map((opt) => {
            const isSelected = selectedId === opt.id;
            const wrongSelected = showResult === "wrong" && isSelected;
            const showCorrect = showResult !== null && opt.correct;
            const classes = ["pg-option"];
            if (isSelected && showResult === null) classes.push("pg-option--active");
            if (wrongSelected) classes.push("pg-option--wrong");
            if (showCorrect) classes.push("pg-option--correct");
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedId(opt.id)}
                disabled={showResult !== null}
                className={classes.join(" ")}
              >
                {opt.optionText}
              </button>
            );
          })}
      </div>

      <div className="pg-actions">
        <button onClick={gotoNext} className="pg-btn pg-btn--ghost">Bỏ qua</button>
        <button onClick={handleCheck} disabled={!canCheck} className={`pg-btn pg-btn--primary ${!canCheck ? "pg-btn--disabled" : ""}`}>KIỂM TRA</button>
      </div>

      {showResult && (
        <div className={`pg-result ${showResult === "wrong" ? "pg-result--wrong" : "pg-result--correct"}`}>
          <div className="pg-result__info">
            <div className="pg-result__icon">{showResult === "wrong" ? "✖" : "✔"}</div>
            <div>
              <div className="pg-result__title">{showResult === "wrong" ? "Đáp án đúng:" : "Đáp án đúng"}</div>
              <div className="pg-result__desc">
                {correctOption?.optionText}
                {showResult === "correct" && current.reward ? (
                  <span className="pg-reward">+{current.reward} điểm thưởng</span>
                ) : null}
              </div>
            </div>
          </div>
          <div>
            <button onClick={gotoNext} className={`pg-btn ${showResult === "wrong" ? "pg-btn--danger" : "pg-btn--success"}`}>
              {showResult === "wrong" ? "ĐÃ HIỂU" : "TIẾP TỤC"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
function TopBar({ index, total }: { index: number; total: number }) {
  const percent = Math.round((index / Math.max(total, 1)) * 100);
  return (
    <div className="pg-topbar">
      <button onClick={() => history.back()} className="pg-close" aria-label="Đóng">
        ✕
      </button>
      <div className="pg-progress">
        <div className="pg-progress__track">
          <div className="pg-progress__bar" style={{ width: `${percent}%` }} />
        </div>
        <div className="pg-progress__text">
          {Math.min(index + 1, Math.max(total, 1))}/{Math.max(total, 1)}
        </div>
      </div>
    </div>
  );
}



