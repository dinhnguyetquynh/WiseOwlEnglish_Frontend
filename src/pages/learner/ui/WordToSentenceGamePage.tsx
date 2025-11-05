import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { gotoResult } from "../../../utils/gameResult";
import "../css/WordToSentenceGame.css"; // Đổi tên file CSS
// Import các DTO từ file API của bạn
import { getWordToSentenceGames, type WordToSentenceRes, type WordToSentenceOptsRes } from "../../../api/game";

// Định nghĩa kiểu dữ liệu cho token để dễ quản lý trạng thái
interface Token extends WordToSentenceOptsRes {
    key: string; // key duy nhất để React render và dễ dàng di chuyển
}

export default function WordToSentenceGamePage() {
    const navigate = useNavigate();
    const { unitId: lessonId = "" } = useParams(); 

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [games, setGames] = useState<WordToSentenceRes[]>([]);// Mảng câu hỏi
    
    const [idx, setIdx] = useState(0);// Chỉ số câu hiện tại
    const [availableTokens, setAvailableTokens] = useState<Token[]>([]);// Ngân hàng từ (chưa sắp xếp)
    const [selectedTokens, setSelectedTokens] = useState<Token[]>([]);// Vùng trả lời (đã chọn)
    
    const [judge, setJudge] = useState<null | "correct" | "wrong">(null);// Trạng thái đã chấm
    const [earned, setEarned] = useState(0); // Tổng điểm kiếm được
    const [correctCount, setCorrectCount] = useState(0); // Số câu đúng. 

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

    // --- 3. Xử lý Kiểm tra ---
    // const handleCheck = useCallback(() => {
    //     if (!current || selectedTokens.length === 0) return;

    //     // Xây dựng câu trả lời của người chơi
    //     const playerSentence = selectedTokens.map(t => t.answerText).join('');
        
    //     // Chuẩn hóa và so sánh với câu gốc từ BE
    //     // Logic so sánh: loại bỏ khoảng trắng dư thừa, đảm bảo dấu câu dính liền với từ trước đó
    //     const normalizedPlayer = playerSentence
    //         .replace(/\s+/g, ' ') // Thay nhiều khoảng trắng thành 1
    //         .trim()
    //         .toLowerCase(); 

    //     const normalizedCorrect = current.questionText
    //         .replace(/\s+/g, ' ') 
    //         .trim()
    //         .toLowerCase();

    //     // So sánh trực tiếp chuỗi đã được chuẩn hóa
    //     const isRight = normalizedPlayer === normalizedCorrect;
        
    //     if (isRight) {
    //         setCorrectCount((x) => x + 1);
    //         setEarned((x) => x + (current.rewardCore ?? 0));
    //         setJudge("correct");
    //     } else {
    //         setJudge("wrong");
    //     }
    // }, [current, selectedTokens]);

    // --- 3. Xử lý Kiểm tra (Đã Sửa) ---
    const handleCheck = useCallback(() => {
    if (!current || selectedTokens.length === 0) return;

    // BƯỚC 1: Xây dựng câu trả lời của người chơi BẰNG CÁCH NỐI CÁC TOKEN BẰNG KHOẢNG TRẮNG
    // Giả định rằng mỗi token (kể cả dấu câu) được cách nhau bằng một khoảng trắng.
    // Dữ liệu mẫu của bạn ("It", "is", "red", "?") nối bằng " " sẽ ra "It is red ?" (giống hệt questionText)
    const playerSentence = selectedTokens.map(t => t.answerText).join(' ');
    
    // BƯỚC 2: Chuẩn hóa (chỉ cần chuyển về chữ thường và cắt khoảng trắng đầu cuối)

    // Chuỗi đáp án gốc từ BE
    const correctSentence = current.questionText;

    // So sánh: Loại bỏ khoảng trắng thừa đầu/cuối và chuyển về chữ thường để tránh sai sót
    const normalizedPlayer = playerSentence.trim().toLowerCase(); 
    const normalizedCorrect = correctSentence.trim().toLowerCase();

    // Logic so sánh cuối cùng
    const isRight = normalizedPlayer === normalizedCorrect;
    
    if (isRight) {
        setCorrectCount((x) => x + 1);
        setEarned((x) => x + (current.rewardCore ?? 0));
        setJudge("correct");
    } else {
        setJudge("wrong");
    }
}, [current, selectedTokens]);

    // --- 4. Chuyển câu hoặc Hoàn thành ---
    const nextOrFinish = useCallback(() => {
        if (idx + 1 < total) {
            setIdx((x) => x + 1); // useEffect sẽ reset trạng thái
        } else {
            gotoResult(navigate, {
                from: "word-to-sentence",
                gameType:"sentence",
                unitId: lessonId,
                total,
                correct: correctCount,
                points: earned,
            });
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
                            disabled={judge !== null}
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
                        disabled={judge !== null}
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
                            // Logic gợi ý/undo đơn giản: trả lại hết về word bank
                            setSelectedTokens([]);
                            const tokens: Token[] = current.opts.map((opt, index) => ({
                                ...opt,
                                key: `${opt.id}-${index}-${Math.random()}`,
                            }));
                            const shuffledTokens = [...tokens].sort(() => Math.random() - 0.5);
                            setAvailableTokens(shuffledTokens);
                        }}
                        disabled={selectedTokens.length === 0}
                    >
                        Hoàn tác
                    </button>
                    <button
                        className="wtsg__primary"
                        disabled={selectedTokens.length === 0}
                        onClick={handleCheck}
                    >
                        KIỂM TRA
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
                                <div className="wtsg__fb-answer">{current.questionText}</div> 
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