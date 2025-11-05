import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/SoundWordGamePage.css";
import {
  getSoundWordGames,
  type SoundWordOptionRes,
  type SoundWordQuestionRes,
} from "../../../api/game";
import { gotoResult } from "../../../utils/gameResult";

export default function SoundWordGamePage() {
  const navigate = useNavigate();
  const { unitId = "" } = useParams();

  const [questions, setQuestions] = useState<SoundWordQuestionRes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState<null | "correct" | "wrong">(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // fetch data
  useEffect(() => {
    if (!unitId) return;
    setLoading(true);
    getSoundWordGames(Number(unitId))
      .then((data) => {
        // sort theo position nếu cần
        const sorted = [...data].sort((a, b) => a.position - b.position);
        setQuestions(sorted);
        console.log("sample option", data?.[0]?.options?.[0]);
      })
      .catch((e) => setError(e?.message ?? "Lỗi tải dữ liệu"))
      .finally(() => setLoading(false));
      
  }, [unitId]);

  const total = questions.length;
  const q = questions[idx];

    const correctOption = useMemo(
    () => q?.options.find((o) => o.isCorrect),
    [q]
  );

  const progressPercent = useMemo(() => {
    if (total === 0) return 0;
    return Math.round(((idx) / total) * 100);
  }, [idx, total]);

  const handlePlay = () => {
    if (!q?.urlSound) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(q.urlSound);
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = q.urlSound;
    }
    audioRef.current.play().catch(() => {});
  };

  const handleSelect = (op: SoundWordOptionRes) => {
    if (checked) return; // đã kiểm tra thì không đổi
    setSelected(op.id);
  };

  const handleCheck = () => {
    if (!q || selected == null) return;
    const isCorrect = q.options.find((o) => o.id === selected)?.isCorrect;
    if (isCorrect) {
      setChecked("correct");
      setScore((s) => s + (q.rewardPoint ?? 0));
      setCorrectCount((c) => c + 1);
    } else {
      setChecked("wrong");
    }
  };

  const goNext = () => {
    if (idx + 1 < total) {
      setIdx((i) => i + 1);
      setSelected(null);
      setChecked(null);
      // preload âm thanh tiếp theo
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current.src = questions[idx + 1]?.urlSound || "";
        }
      }, 0);
    } else {
        //chuyển qua trang kết quả
        gotoResult(navigate, {
          from: "sound-word",  
          gameType:"vocab",     // <— TÊN GAME THỐNG NHẤT
          unitId,                   // giữ nguyên
          total,
          correct: correctCount,    // map từ state nội bộ -> schema chuẩn
          points: score,            // map từ state nội bộ -> schema chuẩn
        });
    }
  };

  const handleSkip = () => {
    setChecked(null);
    setSelected(null);
    goNext();
  };

  if (loading) return <div className="swg__wrap"><div className="swg__loading">Đang tải...</div></div>;
  if (error) return <div className="swg__wrap"><div className="swg__error">{error}</div></div>;
  if (!q) return <div className="swg__wrap"><div className="swg__empty">Không có câu hỏi</div></div>;

  return (
    <div className="swg__wrap">
      {/* Top bar */}
      <div className="swg__top">
        <div className="swg__progress">
          <div className="swg__progress-bar">
            <div className="swg__progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="swg__progress-text">{idx + 1}/{total}</div>
        </div>
      </div>

      <h2 className="swg__title">Nghe âm thanh chọn chữ</h2>

      {/* Speaker button */}
      <button className="swg__speaker" onClick={handlePlay} aria-label="Phát âm thanh">
        <span className="swg__speaker-icon" />
      </button>

      {/* Options */}
      <div className="swg__options">
        {q.options
          .slice()
          .sort((a, b) => a.position - b.position)
          .map((op) => {
            const isSelected = selected === op.id;
            const showCorrect = checked && op.isCorrect;
            const showWrong = checked === "wrong" && isSelected && !op.isCorrect;

            return (
              <button
                key={op.id}
                className={[
                  "swg__option",
                  isSelected ? "is-selected" : "",
                  showCorrect ? "is-correct" : "",
                  showWrong ? "is-wrong" : "",
                ].join(" ").trim()}
                onClick={() => handleSelect(op)}
                disabled={!!checked}
              >
                {op.optionText}
              </button>
            );
          })}
      </div>

{/* Footer (trước khi kiểm tra) */}
      {!checked && (
        <div className="swg__footer">
          <button className="swg__btn swg__btn--ghost" onClick={handleSkip}>
            Bỏ qua
          </button>
          <button
            className="swg__btn swg__btn--primary"
            onClick={handleCheck}
            disabled={selected == null}
          >
            Kiểm tra
          </button>
        </div>
      )}


     
      {checked && (
  <div
    className={[
      "swg__feedback",
      checked === "correct" ? "swg__feedback--ok" : "swg__feedback--bad",
    ].join(" ")}
  >
    <div className="swg__feedback-inner">
      <div className="swg__fb-left">
        <div
          className={
            checked === "correct" ? "swg__fb-icon ok" : "swg__fb-icon bad"
          }
          aria-hidden
        />
        <div className="swg__fb-text">
          <div className="swg__fb-title">
            {checked === "correct" ? "Đáp án đúng" : "Đáp án đúng:"}
          </div>
          <div className="swg__fb-answer">{correctOption?.optionText}</div>
          {checked === "correct" && (
            <div className="swg__fb-reward">
              Bạn nhận được <b>+{q.rewardPoint}</b> điểm thưởng
            </div>
          )}
        </div>
      </div>

      <div className="swg__fb-right">
        <button
          className="swg__btn swg__btn--primary"
          onClick={goNext}
          autoFocus
        >
          {checked === "correct" ? "Tiếp tục" : "Đã hiểu"}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
