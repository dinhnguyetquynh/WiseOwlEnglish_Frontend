import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/SoundWordGamePage.css";
import {
  getSoundWordGames,
  submitGameAnswer,
  type GameAnswerReq,
  type SoundWordOptionRes,
  type SoundWordQuestionRes,
} from "../../../api/game";
import { gotoResult } from "../../../utils/gameResult";
import { getProfileId } from "../../../store/storage";
import { markItemAsCompleted, type LessonProgressReq } from "../../../api/lessonProgress";

export default function SoundWordGamePage() {
  const navigate = useNavigate();
  const { unitId = "" } = useParams();
  const profileId = getProfileId(); // 👈 Lấy profileId

  const [questions, setQuestions] = useState<SoundWordQuestionRes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [judge, setJudge] = useState<null | "correct" | "wrong">(null);
  const [earned, setEarned] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // State mới
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [correctAnswerText, setCorrectAnswerText] = useState("");

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
  const current = q; // Dùng tên 'current' cho nhất quán

  //   const correctOption = useMemo(
  //   () => q?.options.find((o) => o.isCorrect),
  //   [q]
  // );

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
    if (judge) return; // đã kiểm tra thì không đổi
    setSelected(op.id);
  };

  const handleCheck = async () => {
    if (!current || selected == null || !profileId || isSubmitting) {
      if (!profileId) setError("Lỗi: Không tìm thấy Profile ID.");
      return;
    }
    
    setIsSubmitting(true);

    const answerPayload: GameAnswerReq = {
        profileId: profileId,
        gameId: current.gameId, 
        gameQuestionId: current.id,
        optionId: selected
    };

    const progressPayload: LessonProgressReq = {
        learnerProfileId: profileId,
        lessonId: Number(unitId),
        itemType: "GAME_QUESTION",
        itemRefId: Number(current.id)
    };

    try {
        const [answerResult] = await Promise.all([
            submitGameAnswer(answerPayload),
            markItemAsCompleted(progressPayload).catch(e => {
                console.error("Lỗi ngầm khi lưu tiến độ:", e.message);
            })
        ]);

        if (answerResult.isCorrect) {
            setJudge("correct");
            setCorrectCount((c) => c + 1);
            setEarned((p) => p + answerResult.rewardEarned);
        } else {
            setJudge("wrong");
        }
        setCorrectAnswerText(answerResult.correctAnswerText);

    } catch (err: any) {
        setError(err.message || "Lỗi khi nộp câu trả lời");
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const goNext = () => {
    const next = idx + 1;
    if (next >= total) {
      gotoResult(navigate, {
        from: "sound-word",  
        gameType:"vocab",
        unitId,
        total,
        correct: correctCount,
        points: earned, // 👈 Đổi tên
      });
    } else {
      setIdx(next);
      setSelected(null);
      setJudge(null); // 👈 Đổi tên
      setCorrectAnswerText(""); // 👈 Reset
      // preload âm thanh tiếp theo
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current.src = questions[idx + 1]?.urlSound || "";
        }
      }, 0);
    }
  };
const handleSkip = () => {
    setJudge(null);
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
            // 💥 SỬA LOGIC HIỂN THỊ (Giống PictureGuessingGame) 💥
            const isCorrectAnswer = normalize(op.optionText) === normalize(correctAnswerText);
            
            let cls = "swg__option";
            if (!judge) {
              if (isSelected) cls += " is-selected";
            } else {
              if (judge === 'correct' && isSelected) {
                cls += " is-correct";
              } else if (judge === 'wrong') {
                if (isSelected) cls += " is-wrong";
                if (isCorrectAnswer) cls += " is-correct";
              }
            }
            
            return (
              <button
                key={op.id}
                className={cls}
                onClick={() => handleSelect(op)}
                disabled={!!judge || isSubmitting} // 👈 Khóa khi đã chấm hoặc đang submit
              >
                {op.optionText}
              </button>
            );
          })}
      </div>

{/* Footer (trước khi kiểm tra) */}
        {!judge && ( // 👈 Đổi tên
        <div className="swg__footer">
          <button className="swg__btn swg__btn--ghost" onClick={handleSkip}>
            Bỏ qua
          </button>
          <button
            className="swg__btn swg__btn--primary"
            onClick={handleCheck}
            disabled={selected == null || isSubmitting} // 👈 Thêm isSubmitting
          >
            {isSubmitting ? "Đang chấm..." : "Kiểm tra"}
          </button>
        </div>
      )}


     
      {/* 💥 SỬA LẠI FEEDBACK PANEL 💥 */}
      {judge && (
        <div
          className={[
            "swg__feedback",
            judge === "correct" ? "swg__feedback--ok" : "swg__feedback--bad",
          ].join(" ")}
        >
          <div className="swg__feedback-inner">
            <div className="swg__fb-left">
              <div
                className={
                  judge === "correct" ? "swg__fb-icon ok" : "swg__fb-icon bad"
                }
                aria-hidden
              />
              <div className="swg__fb-text">
                <div className="swg__fb-title">
                  {judge === "correct" ? "Đáp án đúng" : "Đáp án đúng:"}
                </div>
                {/* 💥 Hiển thị correctAnswerText từ API 💥 */}
                <div className="swg__fb-answer">{correctAnswerText}</div>
                {judge === "correct" && (
                  <div className="swg__fb-reward">
                    Bạn nhận được <b>+{current.rewardPoint ?? 0}</b> điểm thưởng
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
                {judge === "correct" ? "Tiếp tục" : "Đã hiểu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function normalize(s: string) {
    if (!s) return "";
    return s.trim().toLowerCase();
}