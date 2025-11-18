import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Select,
    MenuItem,
    IconButton,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import type { GameTypeEnum } from "../../schemas/game.schema";
import type { DataGameRespon } from "../../schemas/dataGameResponse";
import { createGame, getDataGame } from "../../../../api/admin";

// Type definition for payload
export type OptionReq = {
    contentType: string;
    contentRefId: number;
    correct: boolean;
    position: number;
};

export type QuestionPayload = {
    position: number;
    promptType: string;
    promptRefId: number;
    questionText: string;
    rewardCore: number;
    optionReqs: OptionReq[];
};

export type GamePayload = {
    title: string;
    type: string;
    difficulty: number;
    lessonId: number;
    correctAudioId?: number;
    wrongAudioId?: number;
    questions: QuestionPayload[];
};

export type GameHandle = {
    handleSave: () => void;
};

type GameProps = {
    gameType: GameTypeEnum;
    lessonId: number;
    onValidate: (valid: boolean) => void;
    onSaved?: () => void;

};

const Game = forwardRef<GameHandle, GameProps>(({
    gameType,
    lessonId,
    onValidate,
    onSaved
}, ref) => {
    const [gameData, setGameData] = useState<DataGameRespon | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [title, setTitle] = useState("");

    // === DEFINE FLAGS SỚM (fix lỗi dùng trước khi khai báo)
    const isPicture4Game = gameType === "PICTURE4_WORD4_MATCHING";
    const isImageGame =
        gameType === "PICTURE_WORD_MATCHING" ||
        gameType === "PICTURE_SENTENCE_MATCHING" ||
        gameType === "PICTURE_WORD_WRITING";
    const isVoiceGame =
        gameType === "SOUND_WORD_MATCHING" ||
        gameType === "PRONUNCIATION";
    const isSentenceHiddenGame = gameType === "SENTENCE_HIDDEN_WORD";

    // === VALIDATE ============================================
    function validateGame() {
        if (!gameData) return false;

        for (const q of questions) {
            if (!q.maxScore.trim()) return false;
            if (!q.difficulty.trim()) return false;

            // --- CASE 1: NORMAL GAMES ---
            if (!isPicture4Game && !isSentenceHiddenGame) {
                if (!q.content.trim()) return false;

                if (isImageGame && !q.image) return false;
                if (isVoiceGame && !q.sound) return false;
                if (q.choices.some((c) => !c)) return false;
            }

            // --- CASE 2: PICTURE4_WORD4 ---
            if (isPicture4Game) {
                if (!q.images) return false;
                if (q.images.some((img) => !img)) return false;
                if (q.choices.some((c) => !c)) return false;
            }

            // --- CASE 3: SENTENCE_HIDDEN_WORD ---
            if (isSentenceHiddenGame) {
                if (!q.content.trim()) return false;
                if (!q.image) return false;
                if (!q.choices[0]) return false;
            }
        }

        return true;
    }



    // === CHOICE COUNT ============================================
    const getChoiceCount = (type: string) => {
        if (type === "PICTURE4_WORD4_MATCHING") return 4;
        if (type === "PICTURE_WORD_MATCHING") return 4;
        if (type === "PICTURE_SENTENCE_MATCHING") return 4;
        if (type === "PICTURE_WORD_WRITING") return 1;
        if (type === "SOUND_WORD_MATCHING") return 4;
        if (type === "PRONUNCIATION") return 1;
        if (type === "SENTENCE_HIDDEN_WORD") return 1;
        if (type === "WORD_TO_SENTENCE") return 1;
        return 1;
    };

    // === CREATE EMPTY QUESTION ==================================
    function createEmptyQuestion() {
        const choiceCount = getChoiceCount(gameType);

        const baseQuestion: {
            maxScore: string;
            difficulty: string;
            contentType: string;
            content: string;
            preview: null;
            choices: string[];
            image?: string;
            sound?: string;
            images?: string[];
            correctIndex?: number;
        } = {
            maxScore: "",
            difficulty: "1",
            contentType: isImageGame || isSentenceHiddenGame ? "IMAGE" : isVoiceGame ? "VOICE" : "SENTENCE",
            content: "",
            sound: "",      // THÊM FIELD RIÊNG
            preview: null,
            choices: Array(choiceCount).fill(""),
            correctIndex: -1,
        };

        if (isPicture4Game) {
            return {
                ...baseQuestion,
                images: ["", "", "", ""],
            };
        }

        return {
            ...baseQuestion,
            image: "",
        };
    }

    const [questions, setQuestions] = useState([createEmptyQuestion()]);
    // Khi questions thay đổi → báo cho parent biết state hợp lệ
    useEffect(() => {
        const isValid = validateGame();
        onValidate(isValid);   // parent chỉ nhận true/false
    }, [questions]); // CHỈ phụ thuộc questions

    // === FETCH DATA =============================================
    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const res = await getDataGame(gameType, lessonId);
                setGameData(res);

                setQuestions([createEmptyQuestion()]);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [gameType]);

    const addQuestion = () => {
        setQuestions([...questions, createEmptyQuestion()]);
    };

    const removeQuestion = (idx: number) => {
        const updated = [...questions];
        updated.splice(idx, 1);
        setQuestions(updated);
    };

    // === HELPER FUNCTIONS ==========================================
    // Map từ URL/image sang mediaAsset ID
    const getMediaAssetIdByUrl = (url: string): number | undefined => {
        if (!gameData || !url) return undefined;
        const asset = gameData.mediaAssets.find((m) => m.url === url);
        return asset?.id;
    };

    // Map từ term_en sang option ID
    const getOptionIdByTerm = (term: string): number | undefined => {
        if (!gameData || !term) return undefined;
        const option = gameData.options.find((o) => o.term_en === term);
        return option?.id;
    };

    // === BUILD PAYLOAD ==========================================
    function buildPayload(): GamePayload {
        const questionPayloads: QuestionPayload[] = questions.map((q, index) => {
            const position = index + 1;
            const rewardCore = Number(q.maxScore) || 0;

            // Xác định promptType và promptRefId
            let promptType = q.contentType; // IMAGE, VOICE, TEXT
            let promptRefId = 0;

            if (gameType === "WORD_TO_SENTENCE") {
                promptType = "SENTENCE";

                // User chọn 1 câu → q.choices[0]
                const optionId = getOptionIdByTerm(q.choices[0] || "");

                promptRefId = optionId || 0;

                return {
                    position,
                    promptType,
                    promptRefId,
                    questionText: "",
                    rewardCore,
                    optionReqs: [],
                };
            }
            // --- CASE 1: PICTURE4_WORD4_MATCHING ---
            if (isPicture4Game) {
                promptType = "IMAGE";
                if (q.images && q.images[0]) {
                    promptRefId = getMediaAssetIdByUrl(q.images[0]) || 0;
                }
            }
            // --- CASE 2: IMAGE GAMES ---
            else if (isImageGame || isSentenceHiddenGame) {
                promptType = "IMAGE";
                if (q.image) {
                    promptRefId = getMediaAssetIdByUrl(q.image) || 0;
                }
            }
            // --- CASE 3: VOICE GAMES ---
            else if (isVoiceGame) {
                promptType = "AUDIO";
                if (q.sound) {
                    promptRefId = getMediaAssetIdByUrl(q.sound) || 0;
                }
            }

            // --- CASE 4: TEXT GAMES ---
            else {
                promptType = "TEXT";
                promptRefId = 0;
            }

            let optionReqs: OptionReq[] = [];
            // Xác định đáp án đúng cho từng game type

            if (isPicture4Game) {
                // Tạo 8 option: 4 IMAGE + 4 VOCAB
                optionReqs = q.choices.flatMap((choice, i) => {
                    const vocabId = getOptionIdByTerm(choice) || 0;
                    const imageId = getMediaAssetIdByUrl(q.images?.[i] || "") || 0;

                    const base = i * 2; // 0,2,4,6

                    return [
                        {
                            contentType: "IMAGE",
                            contentRefId: imageId,
                            correct: true,
                            position: base + 1, // 1,3,5,7
                            pairKey: `P${i + 1}`,
                        },
                        {
                            contentType: "VOCAB",
                            contentRefId: vocabId,
                            correct: true,
                            position: base + 2, // 2,4,6,8
                            pairKey: `P${i + 1}`,
                        },
                    ];
                });
            } else {
                // Build optionReqs từ choices cho các game khác
                optionReqs = q.choices
                    .filter((c) => c.trim() !== "")
                    .map((choice, i) => {
                        const optionId = getOptionIdByTerm(choice);
                        return {
                            contentType: "VOCAB",
                            contentRefId: optionId || 0,
                            correct: false, // Sẽ được set sau
                            position: i + 1,
                        };
                    });

                // Xác định đáp án đúng: sử dụng correctIndex nếu có, nếu không thì mặc định là index 0
                if (optionReqs.length > 0) {
                    const correctIdx = q.correctIndex !== undefined && q.correctIndex >= 0
                        ? q.correctIndex
                        : 0; // Mặc định là option đầu tiên

                    optionReqs.forEach((opt, idx) => {
                        opt.correct = idx === correctIdx;
                    });
                }
            }

            return {
                position,
                promptType,
                promptRefId,
                questionText: q.content || "",
                rewardCore,
                optionReqs,
            };
        });

        return {
            title: title || gameData?.title || gameType.replaceAll("_", " "),
            type: gameType,
            difficulty: questions.length > 0 ? Number(questions[0].difficulty) || 1 : 1,
            lessonId,
            questions: questionPayloads,
        };
    }

    // Handle save action
    const handleSave = async () => {
        const payload = buildPayload();
        const isValid = validateGame();
        if (!isValid) {
            alert("Game chưa hợp lệ. Vui lòng kiểm tra lại!");
            return;
        }

        try {
            const res = await createGame(payload);
            console.log("Game tạo thành công:", res);

            alert("Tạo game thành công!");

            onSaved?.(); // báo cho màn cha

        } catch (err) {
            console.log("Lỗi tạo game:", err);
            alert("Tạo game thất bại!");
        }
    };





    // Expose handleSave to parent component
    useImperativeHandle(ref, () => ({
        handleSave,
    }));

    // === LOADING / ERROR ========================================
    if (loading) return <Typography>Đang tải dữ liệu...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box>
            <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                <Typography sx={{ fontWeight: "bold", mb: 2 }}>
                    {gameData?.title}
                </Typography>

                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <TextField
                        fullWidth
                        label="Tiêu đề"
                        placeholder="Nhập tiêu đề trò chơi..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <TextField fullWidth label="Mô tả" placeholder="Nhập mô tả trò chơi..." />
                </Box>

                <Box sx={{ display: "flex", gap: 2 }}>
                    <TextField fullWidth label="Loại trò chơi" value={gameType} InputProps={{ readOnly: true }} />
                    <TextField fullWidth label="Thời lượng (phút)" placeholder="10" />
                </Box>
            </Paper>

            {questions.map((q, index) => (
                <Paper key={index} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                        <Typography fontWeight="bold">CÂU HỎI {index + 1}:</Typography>
                        <Button variant="outlined" color="error" onClick={() => removeQuestion(index)}>
                            XÓA CÂU HỎI
                        </Button>
                    </Box>

                    {/* SCORE + DIFFICULTY */}
                    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                        <TextField
                            fullWidth
                            label="Điểm tối đa"
                            value={q.maxScore}
                            onChange={(e) => {
                                const updated = [...questions];
                                updated[index].maxScore = e.target.value;
                                setQuestions(updated);
                            }}
                        />

                        <Select
                            fullWidth
                            value={q.difficulty}
                            onChange={(e) => {
                                const updated = [...questions];
                                updated[index].difficulty = String(e.target.value);
                                setQuestions(updated);
                            }}
                        >
                            {[1, 2, 3, 4, 5].map((v) => (
                                <MenuItem key={v} value={String(v)}>
                                    {v}
                                </MenuItem>
                            ))}
                        </Select>
                    </Box>

                    {/* CONTENT TYPE + TEXT */}
                    {!isSentenceHiddenGame && (
                        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Typography fontWeight="medium">Loại câu hỏi: </Typography>
                                <Typography fontWeight="bold">{q.contentType}</Typography>
                            </Box>

                            <TextField
                                sx={{ flex: 1 }}
                                label="Nội dung câu hỏi"
                                value={q.content}
                                onChange={(e) => {
                                    const updated = [...questions];
                                    updated[index].content = e.target.value;
                                    setQuestions(updated);
                                }}
                            />
                        </Box>
                    )}

                    {/* CONTENT TYPE ONLY FOR SENTENCE HIDDEN */}
                    {isSentenceHiddenGame && (
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 3 }}>
                            <Typography fontWeight="bold">{q.contentType}</Typography>
                        </Box>
                    )}

                    {/* RENDER UI CHỈ KHI KHÔNG PHẢI PICTURE4 VÀ SENTENCE_HIDDEN */}
                    {!isPicture4Game && !isSentenceHiddenGame && (
                        <Box>
                            {/* IMAGE GAME UI */}
                            {isImageGame && (
                                <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                                    <Select
                                        sx={{ width: "50%" }}
                                        fullWidth
                                        value={q.image || ""}
                                        onChange={(e) => {
                                            const updated = [...questions];
                                            updated[index].image = String(e.target.value);
                                            setQuestions(updated);
                                        }}
                                        displayEmpty
                                    >
                                        <MenuItem value="">-Chọn hình ảnh-</MenuItem>

                                        {gameData?.mediaAssets?.map((m) => (
                                            <MenuItem key={m.id} value={m.url}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <img
                                                        src={m.url}
                                                        alt={m.altText}
                                                        style={{
                                                            width: 60,
                                                            height: 60,
                                                            objectFit: "contain",
                                                            borderRadius: 4,
                                                        }}
                                                    />
                                                    <Typography sx={{ fontSize: 18, fontWeight: 500 }}>
                                                        {m.altText}
                                                    </Typography>
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>

                                    <Box
                                        sx={{
                                            width: "60%",
                                            border: "1px solid #ccc",
                                            borderRadius: 2,
                                            height: 120,
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        {q.image ? (
                                            <img
                                                src={q.image}
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "contain",
                                                }}
                                            />
                                        ) : (
                                            "+"
                                        )}
                                    </Box>
                                </Box>
                            )}

                            {/* VOICE GAME UI */}
                            {isVoiceGame && (
                                <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                                    <Select
                                        fullWidth
                                        value={q.sound}
                                        onChange={(e) => {
                                            const updated = [...questions];
                                            updated[index].sound = String(e.target.value);
                                            setQuestions(updated);
                                        }}
                                    >

                                        <MenuItem value="">-Chọn âm thanh-</MenuItem>

                                        {gameData?.mediaAssets
                                            ?.filter((m) => m.tag === "normal")
                                            .map((m) => (
                                                <MenuItem key={m.id} value={m.url}>
                                                    {m.altText}
                                                </MenuItem>
                                            ))}
                                    </Select>

                                    <audio controls src={q.sound} style={{ width: "100%" }} />
                                </Box>
                            )}

                            {/* TEXT GAME UI */}
                            {!isImageGame && !isVoiceGame && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography color="text.secondary" fontStyle="italic">
                                        Loại TEXT không yêu cầu hình ảnh hoặc âm thanh.
                                    </Typography>
                                </Box>
                            )}

                            {/* CHOICES */}
                            <Typography fontWeight="bold" sx={{ mb: 2 }}>
                                CÁC LỰA CHỌN:
                            </Typography>

                            {q.choices.map((choice, i) => (
                                <Box
                                    key={i}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2,
                                        mb: 2,
                                        border: "1px solid #ddd",
                                        p: 2,
                                        borderRadius: 1,
                                    }}
                                >
                                    <Select
                                        fullWidth
                                        value={choice}
                                        onChange={(e) => {
                                            const updated = [...questions];
                                            updated[index].choices[i] = String(e.target.value);
                                            setQuestions(updated);
                                        }}
                                        displayEmpty
                                    >
                                        <MenuItem value="">
                                            {gameType === "WORD_TO_SENTENCE"
                                                ? "-Chọn câu cần sắp xếp-"
                                                : "-Chọn từ vựng-"}
                                        </MenuItem>
                                        {gameData?.options?.map((opt) => (
                                            <MenuItem key={opt.id} value={opt.term_en}>
                                                {opt.term_en}
                                            </MenuItem>
                                        ))}
                                    </Select>


                                    {!isPicture4Game && q.choices.length === 4 && (
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <Typography variant="body2" sx={{ mr: 1 }}>
                                                Đúng
                                            </Typography>
                                            <input
                                                type="checkbox"
                                                checked={q.correctIndex === i}
                                                onChange={(e) => {
                                                    const updated = [...questions];

                                                    if (e.target.checked) {
                                                        updated[index].correctIndex = i;
                                                    } else {
                                                        // Nếu uncheck option đúng → reset
                                                        if (updated[index].correctIndex === i) {
                                                            updated[index].correctIndex = -1;
                                                        }
                                                    }
                                                    setQuestions(updated);
                                                }}
                                            />
                                        </Box>
                                    )}


                                    <IconButton
                                        color="error"
                                        onClick={() => {
                                            const updated = [...questions];
                                            updated[index].choices[i] = "";
                                            setQuestions(updated);
                                        }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>
                    )}
                    {isPicture4Game && (
                        <Box sx={{ mt: 3 }}>
                            <Typography fontWeight="bold" sx={{ mb: 2 }}>
                                4 HÌNH ẢNH & 4 TỪ GHÉP ĐÚNG:
                            </Typography>

                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(2, 1fr)",
                                    gap: 3,
                                }}
                            >
                                {q.choices.map((choice, i) => (
                                    <Box
                                        key={i}
                                        sx={{
                                            border: "1px solid #ddd",
                                            p: 2,
                                            borderRadius: 2,
                                        }}
                                    >
                                        {/* CHỌN HÌNH */}
                                        <Select
                                            fullWidth
                                            value={q.images?.[i] || ""}
                                            onChange={(e) => {
                                                const updated = [...questions];
                                                if (!updated[index].images) updated[index].images = ["", "", "", ""];
                                                updated[index].images[i] = String(e.target.value);
                                                setQuestions(updated);
                                            }}
                                            displayEmpty
                                            sx={{ mb: 2 }}
                                        >
                                            <MenuItem value="">-Chọn hình ảnh-</MenuItem>

                                            {gameData?.mediaAssets?.map((m) => (
                                                <MenuItem key={m.id} value={m.url}>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                        <img
                                                            src={m.url}
                                                            alt={m.altText}
                                                            style={{ width: 50, height: 50, objectFit: "contain" }}
                                                        />
                                                        <Typography sx={{ fontSize: 16, fontWeight: 500 }}>
                                                            {m.altText}
                                                        </Typography>
                                                    </Box>
                                                </MenuItem>
                                            ))}
                                        </Select>

                                        {/* PREVIEW HÌNH */}
                                        <Box
                                            sx={{
                                                width: "100%",
                                                height: 120,
                                                border: "1px solid #ccc",
                                                borderRadius: 2,
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                mb: 2,
                                            }}
                                        >
                                            {q.images?.[i] ? (
                                                <img
                                                    src={q.images[i]}
                                                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                                />
                                            ) : (
                                                "+"
                                            )}
                                        </Box>

                                        {/* CHỌN TỪ */}
                                        <Select
                                            fullWidth
                                            value={choice}
                                            onChange={(e) => {
                                                const updated = [...questions];
                                                updated[index].choices[i] = String(e.target.value);
                                                setQuestions(updated);
                                            }}
                                            displayEmpty
                                        >
                                            <MenuItem value="">-Chọn từ vựng-</MenuItem>
                                            {gameData?.options?.map((opt) => (
                                                <MenuItem key={opt.id} value={opt.term_en}>
                                                    {opt.term_en}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* SENTENCE HIDDEN WORD GAME UI */}
                    {isSentenceHiddenGame && (
                        <Box sx={{ mt: 3 }}>
                            <Typography fontWeight="bold" sx={{ mb: 2 }}>
                                CÂU VỚI TỪ BỊ ẨN:
                            </Typography>

                            <Box sx={{ mb: 3 }}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Nhập câu (sử dụng ___ hoặc ... để đánh dấu vị trí từ bị ẩn)"
                                    placeholder="Ví dụ: The cat is sitting on the ___."
                                    value={q.content}
                                    onChange={(e) => {
                                        const updated = [...questions];
                                        updated[index].content = e.target.value;
                                        setQuestions(updated);
                                    }}
                                    sx={{ mb: 2 }}
                                />

                                {q.content && (
                                    <Box
                                        sx={{
                                            p: 2,
                                            bgcolor: "#f5f5f5",
                                            borderRadius: 2,
                                            border: "1px solid #ddd",
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            Preview:
                                        </Typography>
                                        <Box
                                            sx={{
                                                fontSize: "1.1rem",
                                                fontWeight: 500,
                                                color: "primary.main",
                                            }}
                                        >
                                            {q.content.split(/(___|\.\.\.)/g).map((part, idx) => {
                                                if (part === "___" || part === "...") {
                                                    const answer = q.choices[0] || "_____";
                                                    return (
                                                        <Box
                                                            key={idx}
                                                            component="span"
                                                            sx={{
                                                                backgroundColor: "#fff3cd",
                                                                padding: "2px 6px",
                                                                borderRadius: "4px",
                                                                fontWeight: "bold",
                                                                display: "inline-block",
                                                                mx: 0.5,
                                                            }}
                                                        >
                                                            {answer}
                                                        </Box>
                                                    );
                                                }
                                                return <span key={idx}>{part}</span>;
                                            })}
                                        </Box>
                                    </Box>
                                )}
                            </Box>

                            {/* CHỌN HÌNH ẢNH */}
                            <Box sx={{ mb: 3 }}>
                                <Typography fontWeight="bold" sx={{ mb: 2 }}>
                                    CHỌN HÌNH ẢNH:
                                </Typography>

                                <Box sx={{ display: "flex", gap: 2 }}>
                                    <Select
                                        sx={{ width: "50%" }}
                                        fullWidth
                                        value={q.image || ""}
                                        onChange={(e) => {
                                            const updated = [...questions];
                                            updated[index].image = String(e.target.value);
                                            setQuestions(updated);
                                        }}
                                        displayEmpty
                                    >
                                        <MenuItem value="">-Chọn hình ảnh-</MenuItem>

                                        {gameData?.mediaAssets?.map((m) => (
                                            <MenuItem key={m.id} value={m.url}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <img
                                                        src={m.url}
                                                        alt={m.altText}
                                                        style={{
                                                            width: 60,
                                                            height: 60,
                                                            objectFit: "contain",
                                                            borderRadius: 4,
                                                        }}
                                                    />
                                                    <Typography sx={{ fontSize: 18, fontWeight: 500 }}>
                                                        {m.altText}
                                                    </Typography>
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>

                                    <Box
                                        sx={{
                                            width: "50%",
                                            border: "1px solid #ccc",
                                            borderRadius: 2,
                                            height: 120,
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        {q.image ? (
                                            <img
                                                src={q.image}
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "contain",
                                                }}
                                            />
                                        ) : (
                                            <Typography color="text.secondary">+</Typography>
                                        )}
                                    </Box>
                                </Box>
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Typography fontWeight="bold" sx={{ mb: 2 }}>
                                    CHỌN TỪ BỊ ẨN (ĐÁP ÁN ĐÚNG):
                                </Typography>

                                <Select
                                    fullWidth
                                    value={q.choices[0] || ""}
                                    onChange={(e) => {
                                        const updated = [...questions];
                                        updated[index].choices[0] = String(e.target.value);
                                        setQuestions(updated);
                                    }}
                                    displayEmpty
                                >
                                    <MenuItem value="">-Chọn từ vựng-</MenuItem>
                                    {gameData?.options?.map((opt) => (
                                        <MenuItem key={opt.id} value={opt.term_en}>
                                            {opt.term_en}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Box>

                            {q.choices[0] && (
                                <Box
                                    sx={{
                                        p: 2,
                                        bgcolor: "#e8f5e9",
                                        borderRadius: 2,
                                        border: "1px solid #4caf50",
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        Đáp án đúng:
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: "1.2rem",
                                            fontWeight: "bold",
                                            color: "#2e7d32",
                                        }}
                                    >
                                        {q.choices[0]}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    )}

                </Paper>
            ))}

            <Box sx={{ textAlign: "center" }}>
                <Button variant="outlined" onClick={addQuestion}>
                    + Thêm câu hỏi mới
                </Button>
            </Box>
        </Box>
    );
});

Game.displayName = "Game";

export default Game;
