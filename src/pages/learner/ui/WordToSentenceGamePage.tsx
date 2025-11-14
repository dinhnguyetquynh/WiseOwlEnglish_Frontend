import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { gotoResult } from "../../../utils/gameResult";
import "../css/WordToSentenceGame.css"; // Đổi tên file CSS
// Import các DTO từ file API của bạn
import { getWordToSentenceGames, type WordToSentenceRes, type WordToSentenceOptsRes, type GameAnswerReq, submitGameAnswer } from "../../../api/game";
import { getProfileId } from "../../../store/storage";
import { markItemAsCompleted, type LessonProgressReq } from "../../../api/lessonProgress";

// Định nghĩa kiểu dữ liệu cho token để dễ quản lý trạng thái
interface Token extends WordToSentenceOptsRes {
    key: string; // key duy nhất để React render và dễ dàng di chuyển
}

export default function WordToSentenceGamePage() {
    const navigate = useNavigate();
    const { unitId: lessonId = "" } = useParams(); 
    const profileId = getProfileId(); // 👈 Lấy profileId

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [games, setGames] = useState<WordToSentenceRes[]>([]);// Mảng câu hỏi
    
    const [idx, setIdx] = useState(0);// Chỉ số câu hiện tại
    const [availableTokens, setAvailableTokens] = useState<Token[]>([]);// Ngân hàng từ (chưa sắp xếp)
    const [selectedTokens, setSelectedTokens] = useState<Token[]>([]);// Vùng trả lời (đã chọn)
    
    const [judge, setJudge] = useState<null | "correct" | "wrong">(null);// Trạng thái đã chấm
    const [earned, setEarned] = useState(0); // Tổng điểm kiếm được
    const [correctCount, setCorrectCount] = useState(0); // Số câu đúng. 

    // State mới
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [correctAnswerText, setCorrectAnswerText] = useState("");

    const total = games.length;
    const current = games[idx];

    // Tạo Ngân hàng từ ngẫu nhiên khi câu hỏi thay đổi
    useEffect(() => {
        if (current) {
            // Lấy các options (tokens) từ BE
            const tokens: Token[] = current.opts.map((opt, index) => ({
                ...opt,
                key: `${opt.id}-${index}-${Math.random()}`, // Tạo key duy nhất
            }));
            
            // Xáo trộn tokens cho Ngân hàng từ
            const shuffledTokens = [...tokens].sort(() => Math.random() - 0.5);
            
            setAvailableTokens(shuffledTokens);
            setSelectedTokens([]);
        }
        setJudge(null);
        setCorrectAnswerText("");
    }, [idx, current]);


    // --- 1. Fetch Dữ liệu ---
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                setLoading(true);
                // Gọi API mới
                const data = await getWordToSentenceGames(Number(lessonId));
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
    }, [lessonId]);

    const progressPct = useMemo(() => (total ? Math.round((idx / total) * 100) : 0), [idx, total]);

    // --- 2. Xử lý logic chuyển từ ---

    // Chuyển từ từ Ngân hàng từ vào Vùng trả lời
    const handleSelectToken = useCallback((token: Token) => {
        if (judge !== null) return;
        setAvailableTokens(prev => prev.filter(t => t.key !== token.key));
        setSelectedTokens(prev => [...prev, token]);
    }, [judge]);

    // Chuyển từ từ Vùng trả lời trở lại Ngân hàng từ
    const handleUnselectToken = useCallback((token: Token) => {
        if (judge !== null) return;
        setSelectedTokens(prev => prev.filter(t => t.key !== token.key));
        setAvailableTokens(prev => [...prev, token]);
    }, [judge]);



    // --- 3. Xử lý Kiểm tra (Đã Sửa) ---
   const handleCheck = useCallback(async () => {
        if (!current || selectedTokens.length === 0 || !profileId || isSubmitting) {
             if (!profileId) setError("Lỗi: Không tìm thấy Profile ID.");
             return;
        }

        setIsSubmitting(true);

        //  Gửi mảng các ID theo đúng thứ tự
        const sequenceIds = selectedTokens.map(t => t.id); 

        const answerPayload: GameAnswerReq = {
            profileId: profileId,
            gameId: current.gameId,
            gameQuestionId: current.id,
            sequence: sequenceIds // 👈 Gửi sequence
        };

        const progressPayload: LessonProgressReq = {
            learnerProfileId: profileId,
            lessonId: Number(lessonId),
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
                setCorrectCount((x) => x + 1);
                setEarned((x) => x + (answerResult.rewardEarned ?? 0));
            } else {
                setJudge("wrong");
            }
            setCorrectAnswerText(answerResult.correctAnswerText); 

        } catch (err: any) {
            setError(err.message || "Lỗi khi nộp câu trả lời");
        } finally {
            setIsSubmitting(false);
        }
    }, [current, selectedTokens, profileId, isSubmitting, lessonId]);

    // --- 4. Chuyển câu hoặc Hoàn thành ---
    const nextOrFinish = useCallback(async () => {
        const next = idx + 1;
        if (next >= total) {
            gotoResult(navigate, {
                from: "word-to-sentence",
                gameType:"sentence",
                unitId: lessonId,
                total,
                correct: correctCount,
                points: earned,
            });
        } else {
            setIdx(next);
            // State khác đã reset trong useEffect[idx]
        }
    }, [idx, total, navigate, lessonId, correctCount, earned]);
    

    if (loading) return <div className="wtsg__wrap"><div className="wtsg__loader">Đang tải...</div></div>;
    if (error) return <div className="wtsg__wrap"><div className="wtsg__error">{error}</div></div>;
    if (!current) return <div className="wtsg__wrap"><div className="wtsg__empty">Không có dữ liệu.</div></div>;

    return (
        <div className="wtsg__wrap">
            <div className="wtsg__topbar">
                <button className="wtsg__close" onClick={() => navigate(-1)} aria-label="close">×</button>
                <div className="wtsg__progress">
                    <div className="wtsg__progress-bar">
                        <div className="wtsg__progress-fill" style={{ width: `${progressPct}%` }} />
                    </div>
                    <div className="wtsg__progress-text">{idx + 1}/{total}</div>
                </div>
            </div>

            <h1 className="wtsg__title">Sắp xếp từ để tạo thành câu</h1>
            <p className="wtsg__instruction">Sắp xếp các từ thành câu có nghĩa</p>


            {/* Vùng trả lời */}
            <div 
                className={`wtsg__answer-zone ${selectedTokens.length > 0 ? 'active' : ''} ${judge === "correct" ? "ok" : ""} ${judge === "wrong" ? "no" : ""}`}
            >
                {selectedTokens.length === 0 ? (
                    <span className="wtsg__placeholder">Nhấp vào các từ bên dưới để bắt đầu sắp xếp câu</span>
                ) : (
                    selectedTokens.map((token) => (
                        <button
                            key={token.key}
                            className="wtsg__token selected"
                            onClick={() => handleUnselectToken(token)}
                            disabled={judge !== null|| isSubmitting}
                        >
                            {token.answerText}
                        </button>
                    ))
                )}
            </div>

            {/* Ngân hàng từ */}
            <div className="wtsg__word-bank">
                {availableTokens.map((token) => (
                    <button
                        key={token.key}
                        className="wtsg__token available"
                        onClick={() => handleSelectToken(token)}
                        disabled={judge !== null|| isSubmitting}
                    >
                        {token.answerText}
                    </button>
                ))}
            </div>

            {/* Footer khi CHƯA kiểm tra */}
            {judge === null && (
                <div className="wtsg__actions">
                    <button 
                        className="wtsg__ghost" 
                        onClick={() => {
                           handleUnselectToken(selectedTokens[selectedTokens.length - 1]);
                            
                        }}
                        disabled={selectedTokens.length === 0|| isSubmitting}
                    >
                        Hoàn tác
                    </button>
                    <button
                        className="wtsg__primary"
                        disabled={selectedTokens.length === 0|| isSubmitting}
                        onClick={handleCheck}
                    >
                        {isSubmitting ? "Đang chấm..." : "KIỂM TRA"}
                    </button>
                </div>
            )}

            {/* === FEEDBACK BANNER DÍNH ĐÁY === */}
            {judge !== null && (
                <div className={`wtsg__feedback ${judge === "correct" ? "wtsg__feedback--ok" : "wtsg__feedback--bad"}`}>
                    <div className="wtsg__feedback-inner">
                        <div className="wtsg__fb-left">
                            <div className={judge === "correct" ? "wtsg__fb-icon ok" : "wtsg__fb-icon bad"} aria-hidden />
                            <div className="wtsg__fb-text">
                                <div className="wtsg__fb-title">
                                    {judge === "correct" ? "Tuyệt vời! Đáp án đúng" : "Đáp án đúng:"}
                                </div>
                                {/* Hiển thị câu đúng từ BE */}
                                <div className="wtsg__fb-answer">{correctAnswerText}</div> 
                                {judge === "correct" && (
                                    <div className="wtsg__fb-reward">
                                        Bạn nhận được <b>+{current.rewardCore ?? 0}</b> điểm thưởng
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="wtsg__fb-right">
                            <button
                                className={`wtsg__primary ${judge === "correct" ? "ok" : "no"}`}
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