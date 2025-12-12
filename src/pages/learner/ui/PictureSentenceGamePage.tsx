import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPictureSentenceGames, submitGameAnswer, type GameAnswerReq, type PictureSentenceQuesRes } from "../../../api/game";
import { gotoResult } from "../../../utils/gameResult";
import "../css/PictureSentenceGame.css";
import { getProfileId } from "../../../store/storage";
import { markItemAsCompleted, type LessonProgressReq } from "../../../api/lessonProgress";

// Helper (Lấy từ file PictureGuessingGame)
function normalize(s: string) {
    if (!s) return "";
    return s.trim().toLowerCase();
}

const SOUND_CORRECT = "/sounds/correct_sound.mp3";
const SOUND_WRONG = "/sounds/wrong_sound.mp3";
export default function PictureSentenceGamePage() {
  const navigate = useNavigate();
  const { unitId = "" } = useParams();
  const profileId = getProfileId(); // 👈 Lấy profileId


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [games, setGames] = useState<PictureSentenceQuesRes[]>([]);// mảng câu hỏi lấy dc từ api

  const [idx, setIdx] = useState(0);//chỉ số câu hiện tại
  const [selectedOptId, setSelectedOptId] = useState<number | null>(null);//id option mà người chơi đang chọn
  const [judge, setJudge] = useState<null | "correct" | "wrong">(null);//trạng thái đã chấm
  const [earned, setEarned] = useState(0); //tổng điểm kiếm được trong lượt chơi
  const [correctCount, setCorrectCount] = useState(0); // số câu đúng. 

    // State mới
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [correctAnswerText, setCorrectAnswerText] = useState("");

  const total = games.length;
  const current = games[idx];
  
  // --- HÀM PHÁT ÂM THANH (MỚI) ---
    const playAudio = (type: "correct" | "wrong") => {
        try {
            const audioSrc = type === "correct" ? SOUND_CORRECT : SOUND_WRONG;
            const audio = new Audio(audioSrc);
            // Giảm âm lượng một chút nếu cần (0.0 đến 1.0)
            audio.volume = 0.8; 
            audio.play().catch((err) => {
                console.warn("Không thể phát âm thanh (có thể do trình duyệt chặn hoặc sai đường dẫn):", err);
            });
        } catch (e) {
            console.error("Lỗi khởi tạo âm thanh:", e);
        }
    };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getPictureSentenceGames(Number(unitId));
        if (!alive) return;
        data.sort((a, b) => a.position - b.position);
        setGames(data);
        setError(null);
      } catch (e: any) {
        setError(e?.message ?? "Load data failed");
      } finally {
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [unitId]);

  useEffect(() => {
    setSelectedOptId(null);
    setJudge(null);
  }, [idx]);

  // const progressPct = useMemo(() => (total ? Math.round((idx / total) * 100) : 0), [idx, total]);
    // --- GAMEPLAY LOGIC ---
  const progressPct = useMemo(() => {
    if (total === 0) return 0;
    return Math.round(((idx + 1) / total) * 100);
  }, [idx, total]);

  // const correctAnswerText =
  //   current?.options.find((o) => o.isCorrect)?.sentenceAnswer ?? "";

  async function handleCheck() {
    if (!current || selectedOptId == null || !profileId || isSubmitting) {
      if (!profileId) setError("Lỗi: Không tìm thấy Profile ID.");
      return;
    }

    setIsSubmitting(true);

    const answerPayload: GameAnswerReq = {
        profileId: profileId,
        gameId: current.gameId,
        gameQuestionId: current.id,
        optionId: selectedOptId
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
            playAudio("correct");
            setJudge("correct");
            setCorrectCount((c) => c + 1);
            setEarned((p) => p + answerResult.rewardEarned);
            window.dispatchEvent(new Event("EVENT_UPDATE_POINTS"));
        } else {
            playAudio("wrong");
            setJudge("wrong");
        }
        setCorrectAnswerText(answerResult.correctAnswerText);

    } catch (err: any) {
        setError(err.message || "Lỗi khi nộp câu trả lời");
    } finally {
        setIsSubmitting(false);
    }
  }

  async function nextOrFinish() {
          const next = idx + 1;
    if (next >= total) {
      gotoResult(navigate, {
        from: "picture-sentence",
        gameType:"sentence",
        unitId,
        total,
        correct: correctCount,
        points: earned,
      });
    } else {
      setIdx(next);
      // setJudge(null); // Đã reset trong useEffect[idx]
      // setSelectedOptId(null); // Đã reset trong useEffect[idx]
    }
  }
  // Hàm skip
  async function handleSkip() {
      // Bỏ qua và sang câu tiếp
      const next = idx + 1;
      if (next >= total) {
        gotoResult(navigate, {
          from: "picture-sentence",
          gameType:"sentence",
          unitId,
          total,
          correct: correctCount,
          points: earned,
        });
      } else {
         setIdx(next);
      }
  }

  if (loading) return <div className="psg__wrap"><div className="psg__loader">Đang tải...</div></div>;
  if (error) return <div className="psg__wrap"><div className="psg__error">{error}</div></div>;
  if (!current) return <div className="psg__wrap"><div className="psg__empty">Đang tải...</div></div>;

  return (
    <div className="psg__wrap">
      <div className="psg__topbar">
        <button className="psg__close" onClick={() => navigate(-1)} aria-label="close">×</button>
        <div className="psg__progress">
          <div className="psg__progress-bar">
            <div className="psg__progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="psg__progress-text">{idx + 1}/{total}</div>
        </div>
      </div>

      <h1 className="psg__title">{current.sentenceQues}</h1>

      <div className={`psg__image-box ${judge === "correct" ? "ok" : ""} ${judge === "wrong" ? "no" : ""}`}>
        <img src={current.imageUrl} alt="question" />
      </div>

      <div className="psg__options">
        {current.options
          .slice()
          .sort((a, b) => a.position - b.position)
          .map((opt) => {
            const isSelected = selectedOptId === opt.id;
            const judged = judge !== null;
            const isCorrectAnswer = normalize(opt.sentenceAnswer) === normalize(correctAnswerText);
            
            let cls = "psg__opt";
            if (!judged) {
              if (isSelected) cls += " selected";
            } else {
              if (judge === 'correct' && isSelected) {
                cls += " correct";
              } else if (judge === 'wrong') {
                if (isSelected) cls += " wrong";
                if (isCorrectAnswer) cls += " correct";
              }
            }
            return (
              <button
                key={opt.id}
                className={cls}
                disabled={judged || isSubmitting} // 👈 Thêm isSubmitting
                onClick={() => setSelectedOptId(opt.id)}
              >
                {opt.sentenceAnswer}
              </button>
            );
          })}
      </div>

      {/* Footer khi CHƯA kiểm tra */}
      {judge === null && (
        <div className="psg__actions">
          <button className="psg__ghost" onClick={handleSkip}>Bỏ qua</button>
          <button
            className="psg__primary"
            disabled={selectedOptId == null || isSubmitting} // 👈 Thêm isSubmitting
            onClick={handleCheck}
          >
            {isSubmitting ? "Đang chấm..." : "KIỂM TRA"}
          </button>
        </div>
      )}

      {/* === FEEDBACK BANNER DÍNH ĐÁY, GIỐNG SOUND WORD === */}
      {judge !== null && (
        <div className={`psg__feedback ${judge === "correct" ? "psg__feedback--ok" : "psg__feedback--bad"}`}>
          <div className="psg__feedback-inner">
            <div className="psg__fb-left">
              <div className={judge === "correct" ? "psg__fb-icon ok" : "psg__fb-icon bad"} aria-hidden />
              <div className="psg__fb-text">
                <div className="psg__fb-title">
                  {judge === "correct" ? "Đáp án đúng" : "Đáp án đúng:"}
                </div>
                <div className="psg__fb-answer">{correctAnswerText}</div>
                {judge === "correct" && (
                  <div className="psg__fb-reward">
                    {/* Bạn nhận được <b>+{current.rewardPoint ?? 0}</b> điểm thưởng */}
                    Bạn nhận được <b>+{current.rewardPoint ?? 0}</b> điểm thưởng ⭐  và <b>+{current.rewardPoint?? 0}</b> kim cương 💎
                  </div>
                )}
              </div>
            </div>

            <div className="psg__fb-right">
              <button
                className={`psg__primary ${judge === "correct" ? "ok" : "no"}`}
                onClick={nextOrFinish}
                autoFocus
              >
                {judge === "correct" ? "TIẾP TỤC" : "ĐÃ HIỂU"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
