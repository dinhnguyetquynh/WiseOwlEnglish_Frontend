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
    Checkbox,
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
    hiddenWord?: string;
    rewardCore: number;
    optionReqs: OptionReq[];
    active: boolean;   // <---- thêm dòng này
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
//------------------------------------------------------
// TẠO TYPE THỐNG NHẤT CHO QUESTION
//------------------------------------------------------
type QuestionState = {
    maxScore: string;
    difficulty: string;
    contentType: string;
    content: string;
    preview: null;
    choices: string[];
    image: string;          // luôn có
    sound: string;          // luôn có
    images: string[];       // luôn có
    correctIndex: number;
    active: boolean;
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
    const [isActive, setIsActive] = useState(false);
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
    function extractWords(text: string): string[] {
        return text
            .split(/\s+/)
            .map(w => w.trim().replace(/[.,!?;:()"]/g, ""))
            .filter(w => w.length > 0);
    }
    const handleRightInput = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        index: number,
        q: QuestionState
    ) => {
        const value = e.target.value;

        // update giá trị
        const updated = [...questions];
        updated[index].choices[0] = value;
        setQuestions(updated);

        // lấy tất cả từ bên trái
        const leftWords = extractWords(q.content.toLowerCase());

        // lấy tất cả từ bên phải
        const rightWords = extractWords(value.toLowerCase());

        // tìm từ không tồn tại
        const notFound = rightWords.filter(w => !leftWords.includes(w));

        if (notFound.length > 0) {
            console.warn("Từ không tồn tại:", notFound);
        }
    };


    function validateGame() {
        if (!gameData) return false;

        for (const q of questions) {

            // ============================
            // BLOCK: SENTENCE_HIDDEN_WORD
            // ============================
            if (isSentenceHiddenGame) {

                // câu gốc
                if (!q.content.trim()) return false;

                // hình ảnh
                if (!q.image) return false;

                // từ cần kiểm tra
                if (!q.choices[0].trim()) return false;

                // so sánh từ
                const leftWords = extractWords(q.content.toLowerCase());
                const rightWords = extractWords(q.choices[0].toLowerCase());
                const notFound = rightWords.filter(w => !leftWords.includes(w));

                if (notFound.length > 0) return false;



                // Skip toàn bộ validate khác
                continue;
            }

            // ============================
            // BLOCK: PICTURE4 WORD4
            // ============================
            if (isPicture4Game) {
                if (!q.images || q.images.some((img) => !img)) return false;
                if (q.choices.some((c) => !c)) return false;
                continue;
            }

            // ============================
            // IMAGE GAME
            // ============================
            if (isImageGame) {
                if (!q.image) return false;
            }

            // ============================
            // VOICE GAME
            // ============================
            if (isVoiceGame) {
                if (!q.sound) return false;
            }

            // ============================
            // CHOICE CHECK FOR OTHER GAMES
            // ============================
            if (q.choices.some((c) => !c.trim())) return false;

            // SCORE cho các game khác
            if (!q.maxScore.trim()) return false;
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
    function createEmptyQuestion(): QuestionState {
        const choiceCount = getChoiceCount(gameType);

        return {
            maxScore: "",
            difficulty: "1",
            contentType:
                isImageGame || isSentenceHiddenGame
                    ? "IMAGE"
                    : isVoiceGame
                        ? "VOICE"
                        : "SENTENCE",

            content: "",
            preview: null,
            choices: Array(choiceCount).fill(""),

            // các field luôn tồn tại
            image: "",
            sound: "",
            images: ["", "", "", ""],

            correctIndex: -1,
            active: true,
        };
    }


    const [questions, setQuestions] = useState<QuestionState[]>([
        createEmptyQuestion(),
    ]);

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

            let promptType = q.contentType;
            let promptRefId = 0;

            // WORD_TO_SENTENCE
            if (gameType === "WORD_TO_SENTENCE") {
                const optionId = getOptionIdByTerm(q.choices[0] || "");
                return {
                    position,
                    promptType: "SENTENCE",
                    promptRefId: optionId || 0,
                    questionText: "",
                    rewardCore,
                    optionReqs: [],
                    active: q.active,
                };
            }

            // IMAGE
            if (isPicture4Game) {
                promptType = "IMAGE";
                promptRefId = getMediaAssetIdByUrl(q.images[0]) || 0;
            } else if (isImageGame) {
                promptType = "IMAGE";
                promptRefId = getMediaAssetIdByUrl(q.image) || 0;
            } else // SENTENCE_HIDDEN_WORD
                if (isSentenceHiddenGame) {
                    return {
                        position,
                        promptType: "IMAGE",
                        promptRefId: getMediaAssetIdByUrl(q.image) || 0,
                        questionText: q.content,
                        hiddenWord: q.choices[0],     // CHỈ 1 từ hoặc nhiều từ ghép?
                        rewardCore,
                        optionReqs: [],               // backend không cần → gửi mảng rỗng
                        active: q.active,
                    } as any;
                }




                // VOICE
                else if (isVoiceGame) {
                    promptType = "AUDIO";
                    promptRefId = getMediaAssetIdByUrl(q.sound) || 0;
                }

                // TEXT
                else {
                    promptType = "TEXT";
                    promptRefId = 0;
                }

            // BUILD optionReqs
            let optionReqs: OptionReq[] = [];

            if (isPicture4Game) {
                optionReqs = q.choices.flatMap((choice, i) => {
                    const vocabId = getOptionIdByTerm(choice) || 0;
                    const imageId = getMediaAssetIdByUrl(q.images[i]) || 0;

                    return [
                        {
                            contentType: "IMAGE",
                            contentRefId: imageId,
                            correct: true,
                            position: i * 2 + 1,
                        },
                        {
                            contentType: "VOCAB",
                            contentRefId: vocabId,
                            correct: true,
                            position: i * 2 + 2,
                        },
                    ];
                });
            } else {
                optionReqs = q.choices.map((choice, i) => ({
                    contentType: "VOCAB",
                    contentRefId: getOptionIdByTerm(choice) || 0,
                    correct: i === q.correctIndex,
                    position: i + 1,
                }));
            }

            return {
                position,
                promptType,
                promptRefId,
                questionText: q.content,
                rewardCore,
                optionReqs,
                active: q.active,
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
                    {/* LEFT: 50% */}
                    <Box sx={{ flex: 1 }}>
                        <TextField
                            fullWidth
                            label="Tiêu đề"
                            placeholder="Nhập tiêu đề trò chơi..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </Box>

                    {/* RIGHT: 50% */}
                    <Box
                        sx={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",  // căn chữ giữa theo chiều ngang
                            border: "1px solid #ccc",
                            borderRadius: 1,
                            px: 2,
                            bgcolor: "#f5f5f5",
                            height: 56,
                        }}
                    >
                        <Typography>{gameType}</Typography>
                    </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 4, mb: 2 }}>

                    {/* GROUP: LOẠI CÂU HỎI */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "50%" }}>
                        {!isPicture4Game && (
                            <>
                                {/* LEFT 10% */}
                                <Box sx={{ width: "120px", display: "flex", alignItems: "center" }}>
                                    <Typography fontWeight="medium">Loại câu hỏi:</Typography>
                                </Box>

                                {/* RIGHT 20% */}
                                <Box
                                    sx={{
                                        width: "160px",
                                        display: "flex",
                                        alignItems: "center",
                                        border: "1px solid #ccc",
                                        borderRadius: 1,
                                        px: 2,
                                        height: 50,
                                        bgcolor: "#f5f5f5",
                                    }}
                                >
                                    <Typography fontWeight="bold">
                                        {questions[0]?.contentType}
                                    </Typography>
                                </Box>
                            </>
                        )}
                    </Box>



                    {/* GROUP: CHECKBOX */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "50%" }}>
                        <Checkbox
                            checked={isActive}
                            onChange={(e) => {
                                const value = e.target.checked;
                                setIsActive(value);

                                setQuestions((prev) =>
                                    prev.map((q) => ({
                                        ...q,
                                        active: value,
                                    }))
                                );
                            }}
                        />


                        <Typography>Kích hoạt game</Typography>
                    </Box>

                </Box>

            </Paper >

            {
                questions.map((q, index) => (
                    <Paper key={index} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                            <Box sx={{ minWidth: 150 }}>
                                {!isPicture4Game && (
                                    <Typography fontWeight="bold">
                                        CÂU HỎI {index + 1}:
                                    </Typography>
                                )}
                            </Box>

                            <Button variant="outlined" color="error" onClick={() => removeQuestion(index)}>
                                XÓA CÂU HỎI
                            </Button>
                        </Box>









                        {/* RENDER UI CHỈ KHI KHÔNG PHẢI PICTURE4 VÀ SENTENCE_HIDDEN */}
                        {!isPicture4Game && !isSentenceHiddenGame && (
                            <Box>
                                {/* IMAGE GAME UI */}
                                {isImageGame && (
                                    <Box sx={{ display: "flex", gap: 2, mb: 3, justifyContent: "left", alignItems: "center" }}>
                                        <Select
                                            sx={{ width: "20%", height: "10%", justifyContent: "center", alignItems: "center" }}
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

                                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                                    <TextField
                                        sx={{ width: "20%" }}
                                        label="Điểm tối đa"
                                        value={q.maxScore}
                                        onChange={(e) => {
                                            const updated = [...questions];
                                            updated[index].maxScore = e.target.value;
                                            setQuestions(updated);
                                        }}
                                    />
                                </Box>
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

                                <Box sx={{ mb: 3 }}>


                                    <TextField
                                        sx={{ width: "20%" }}
                                        label="Điểm tối đa"
                                        value={q.maxScore}
                                        onChange={(e) => {
                                            const updated = [...questions];
                                            updated[index].maxScore = e.target.value;
                                            setQuestions(updated);
                                        }}
                                    />
                                </Box>
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
                                <Box sx={{ mb: 3 }}>
                                    <Typography fontWeight="bold" sx={{ mb: 2 }}>
                                        HÌNH ẢNH CHO CÂU HỎI:
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

                                <Box sx={{ display: "flex", gap: 4 }}>
                                    {/* LEFT */}
                                    <Box sx={{ flex: 1 }}>
                                        <Typography fontWeight="bold" sx={{ mb: 2 }}>
                                            Câu gốc:
                                        </Typography>

                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={3}
                                            label="Nhập câu chứa từ..."
                                            value={q.content}
                                            onChange={(e) => {
                                                const updated = [...questions];
                                                updated[index].content = e.target.value;
                                                setQuestions(updated);
                                            }}
                                        />
                                    </Box>

                                    {/* RIGHT */}
                                    <Box sx={{ flex: 1 }}>
                                        <Typography fontWeight="bold" sx={{ mb: 2 }}>
                                            Nhập các từ cần kiểm tra:
                                        </Typography>

                                        <TextField
                                            fullWidth
                                            label="Nhập từ, cách nhau bằng khoảng trắng"
                                            value={q.choices[0]}
                                            onChange={(e) => handleRightInput(e, index, q)}
                                        />


                                        {/* Gợi ý lỗi */}
                                        {extractWords(q.choices[0]).some(
                                            (w) => !extractWords(q.content.toLowerCase()).includes(w.toLowerCase())
                                        ) && (
                                                <Typography color="error" sx={{ mt: 1 }}>
                                                    Có từ không tồn tại trong câu gốc.
                                                </Typography>
                                            )}
                                    </Box>
                                </Box>


                            </Box>
                        )}

                    </Paper>
                ))
            }

            < Box sx={{ textAlign: "center" }}>
                <Button variant="outlined" onClick={addQuestion}>
                    + Thêm câu hỏi mới
                </Button>
            </Box >
        </Box >
    );
});

Game.displayName = "Game";

export default Game;
