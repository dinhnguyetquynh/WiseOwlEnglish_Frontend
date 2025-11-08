import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPictureSentenceGames, type PictureSentenceQuesRes } from "../../../api/game";
import { gotoResult } from "../../../utils/gameResult";
import "../css/PictureSentenceGame.css";
import { getProfileId } from "../../../store/storage";
import { markItemAsCompleted, type LessonProgressReq } from "../../../api/lessonProgress";

export default function PictureSentenceGamePage() {
  const navigate = useNavigate();
  const { unitId = "" } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [games, setGames] = useState<PictureSentenceQuesRes[]>([]);// mảng câu hỏi lấy dc từ api

  const [idx, setIdx] = useState(0);//chỉ số câu hiện tại
  const [selectedOptId, setSelectedOptId] = useState<number | null>(null);//id option mà người chơi đang chọn
  const [judge, setJudge] = useState<null | "correct" | "wrong">(null);//trạng thái đã chấm
  const [earned, setEarned] = useState(0); //tổng điểm kiếm được trong lượt chơi
  const [correctCount, setCorrectCount] = useState(0); // số câu đúng. 

  const total = games.length;
  const current = games[idx];

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

  const progressPct = useMemo(() => (total ? Math.round((idx / total) * 100) : 0), [idx, total]);

  const correctAnswerText =
    current?.options.find((o) => o.isCorrect)?.sentenceAnswer ?? "";

  function handleCheck() {
    if (!current || selectedOptId == null) return;
    const isRight = !!current.options.find((o) => o.id === selectedOptId)?.isCorrect;
    if (isRight) {
      setCorrectCount((x) => x + 1);
      setEarned((x) => x + (current.rewardPoint ?? 0));
      setJudge("correct");
    } else {
      setJudge("wrong");
    }
  }

  async function nextOrFinish() {
    // if (idx + 1 < total) {
    //   setJudge(null);
    //   setIdx((x) => x + 1);
    // } else {
    //   gotoResult(navigate, {
    //     from: "picture-sentence",
    //     gameType:"sentence",
    //     unitId,
    //     total,
    //     correct: correctCount,
    //     points: earned,
    //   });
    // }

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
                  from: "picture-sentence",  
                  gameType:"sentence",     
                  unitId,                   
                  total,
                  correct: correctCount,    
                  points: earned,           
                });
              }else {
              // ➜ CHƯA HOÀN TẤT: Chuyển sang câu tiếp theo
              setIdx(next);
              setJudge(null);
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

  if (loading) return <div className="psg__wrap"><div className="psg__loader">Đang tải...</div></div>;
  if (error) return <div className="psg__wrap"><div className="psg__error">{error}</div></div>;
  if (!current) return <div className="psg__wrap"><div className="psg__empty">Không có dữ liệu.</div></div>;

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
            const isRight = opt.isCorrect;
            return (
              <button
                key={opt.id}
                className={
                  "psg__opt" +
                  (isSelected ? " selected" : "") +
                  (judged && isRight ? " correct" : "") +
                  (judged && isSelected && !isRight ? " wrong" : "")
                }
                disabled={judged}
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
          <button className="psg__ghost" onClick={() => setIdx((x) => Math.min(total - 1, x + 1))}>Bỏ qua</button>
          <button
            className="psg__primary"
            disabled={selectedOptId == null}
            onClick={handleCheck}
          >
            KIỂM TRA
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
                    Bạn nhận được <b>+{current.rewardPoint ?? 0}</b> điểm thưởng
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
