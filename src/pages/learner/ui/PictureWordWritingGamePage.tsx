// src/pages/game/PictureWordWritingGamePage.tsx
import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPictureWordGames, type PictureWordRes } from "../../../api/game";
import { gotoResult } from "../../../utils/gameResult";
import "../css/PictureWordWriting.css"; // tận dụng css hiện có (class giống nhau)

export default function PictureWordWritingGamePage() {
  const navigate = useNavigate();
  const { unitId = "" } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [games, setGames] = useState<PictureWordRes[]>([]);

  const [idx, setIdx] = useState(0);
  const [inputText, setInputText] = useState("");
  const [judge, setJudge] = useState<null | "correct" | "wrong">(null);
  const [earned, setEarned] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const total = games.length;
  const current = games[idx];
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        console.log("Đã vào được trang word-writing");
        setLoading(true);
        const data = await getPictureWordGames(Number(unitId));
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
    return () => {
      alive = false;
    };
  }, [unitId]);

  useEffect(() => {
    // reset input & judge when moving to a new question
    setInputText("");
    setJudge(null);
    // focus input when new question loads
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [idx]);

  const progressPct = useMemo(() => (total ? Math.round((idx / total) * 100) : 0), [idx, total]);

  // normalize function: trim, lowercase, remove diacritics (for robustness)
  function normalizeAnswer(s = "") {
    return s
      .trim()
      .toLowerCase()
      // remove diacritics (accents)
      .normalize?.("NFD")
      .replace(/\p{Diacritic}/gu, "") ?? s.trim().toLowerCase();
  }

  const correctAnswerText = current?.optsRes?.find((o) => o.isCorrect)?.answerText ?? current?.optsRes?.[0]?.answerText ?? "";

  function handleCheck() {
    if (!current) return;
    const user = normalizeAnswer(inputText);
    const correct = normalizeAnswer(correctAnswerText);

    const isRight = user.length > 0 && user === correct;

    if (isRight) {
      setCorrectCount((x) => x + 1);
      setEarned((x) => x + (current.rewardCore ?? 0));
      setJudge("correct");
    } else {
      setJudge("wrong");
    }
  }

  function nextOrFinish() {
    if (idx + 1 < total) {
      setJudge(null);
      setIdx((x) => x + 1);
    } else {
      gotoResult(navigate, {
        from: "picture-word",
        unitId,
        total,
        correct: correctCount,
        points: earned,
      });
    }
  }

  function handleSkip() {
    // skip to next (but if last, finish)
    if (idx + 1 < total) {
      setIdx((x) => Math.min(total - 1, x + 1));
    } else {
      gotoResult(navigate, {
        from: "word-writing",
        gameType:"vocab",
        unitId,
        total,
        correct: correctCount,
        points: earned,
      });
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

      <h1 className="psg__title">Viết từ mô tả hình</h1>

      <div className={`psg__image-box ${judge === "correct" ? "ok" : ""} ${judge === "wrong" ? "no" : ""}`}>
        <img src={current.imgURL} alt="question" />
      </div>

      <div className="psg__write-area">
        <label htmlFor="pw-input" className="visually-hidden">Nhập từ</label>
        <input
          id="pw-input"
          ref={inputRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && inputText.trim().length > 0 && judge === null) {
              handleCheck();
            }
            if (e.key === "Enter" && judge !== null) {
              nextOrFinish();
            }
          }}
          placeholder="Gõ từ vựng vào đây..."
          className="psg__text-input"
          disabled={judge !== null}
          autoComplete="off"
          autoFocus
        />
        <div className="psg__hint">Nhập chính xác từ (không phân biệt hoa thường)</div>
      </div>

      {/* Footer khi CHƯA kiểm tra */}
      {judge === null && (
        <div className="psg__actions">
          <button className="psg__ghost" onClick={handleSkip}>Bỏ qua</button>
          <button
            className="psg__primary"
            disabled={inputText.trim().length === 0}
            onClick={handleCheck}
          >
            KIỂM TRA
          </button>
        </div>
      )}

      {/* Feedback banner */}
      {judge !== null && (
        <div className={`psg__feedback ${judge === "correct" ? "psg__feedback--ok" : "psg__feedback--bad"}`}>
          <div className="psg__feedback-inner">
            <div className="psg__fb-left">
              <div className={judge === "correct" ? "psg__fb-icon ok" : "psg__fb-icon bad"} aria-hidden />
              <div className="psg__fb-text">
                <div className="psg__fb-title">
                  {judge === "correct" ? "Chính xác" : "Đáp án đúng:"}
                </div>
                <div className="psg__fb-answer">{correctAnswerText}</div>
                {judge === "correct" && (
                  <div className="psg__fb-reward">Bạn nhận được <b>+{current.rewardCore ?? 0}</b> điểm thưởng</div>
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
