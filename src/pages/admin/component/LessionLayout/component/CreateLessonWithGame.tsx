import { useRef, useState } from "react";
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
import type { GameTypeEnum } from "../../../schemas/game.schema";
import Game, { type GameHandle, type TestQuestionPayload } from "../../GameComponent/Game";
import axiosClient from "../../../../../api/axiosClient";
interface Props {
    lessonId: number;
    onBack: () => void;
    onSaved?: () => void;
}
// 1. Define Request Payload Structure
interface CreateTestRequest {
    lessonId: number;
    title: string;
    type: string;
    description: string;
    durationMin: number;
    active: boolean;
    questions: TestQuestionPayload[];
}
export default function CreateLessonWithGame({
    lessonId,
    onBack,
    onSaved
}: Props) {

    const [gameType, setGameType] = useState<GameTypeEnum | "">("");

    // ====== MẢNG GAME ĐÃ CHỌN ======
    const [games, setGames] = useState<GameTypeEnum[]>([]);
    const gameRefs = useRef<{ [key: number]: GameHandle | null }>({});
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [duration, setDuration] = useState(15);

    const handleSelectGame = (value: any) => {
        if (!value) return;

        // THÊM GAME VÀO MẢNG
        setGames(prev => [...prev, value]);

        // RESET select cho lần chọn tiếp theo
        setGameType("");
    };
    const removeGame = (index: number) => {
        setGames(prev => prev.filter((_, i) => i !== index));
        // Xóa ref tương ứng (optional, để tránh memory leak nhẹ)
        delete gameRefs.current[index];
    };
    const handleSaveLesson = async () => {
        if (!title.trim()) return alert("Vui lòng nhập tên bài kiểm tra");
        if (games.length === 0) return alert("Vui lòng chọn ít nhất 1 game");

        // A. Thu thập questions từ tất cả các Game con
        let allQuestions: TestQuestionPayload[] = [];

        games.forEach((_, index) => {
            const ref = gameRefs.current[index];
            if (ref) {
                // Gọi hàm mapping từ Game.tsx
                const questionsFromGame = ref.getTestQuestions();
                allQuestions = [...allQuestions, ...questionsFromGame];
            }
        });

        // B. Tạo Payload đúng cấu trúc "JSON Đúng"
        const payload: CreateTestRequest = {
            lessonId: lessonId,
            title: title,
            type: "ENGLISH",
            description: description,
            durationMin: duration, // Field này giờ là durationMin
            active: true,
            questions: allQuestions // Gán mảng câu hỏi đã map vào đây
        };

        console.log("FINAL PAYLOAD:", JSON.stringify(payload, null, 2));

        // C. Gọi API thật
        try {
            await axiosClient.post("/api/test-admin/create", payload);
            alert("Tạo bài kiểm tra thành công!");
            onSaved?.();
            onBack();
        } catch (error: any) {
            console.error("Lỗi save test:", error);
            alert("Lỗi khi lưu bài kiểm tra: " + (error.response?.data?.message || error.message));
        }
    };

    return (
        <Box display="flex" flexDirection="column" gap={3}>

            {/* HEADER */}
            <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography fontWeight={700} fontSize="1.4rem" mb={2}>
                    Thông tin chung
                </Typography>

                <Box display="flex" gap={3}>
                    {/* CỘT TRÁI */}
                    <Box flex={1}>
                        <Box sx={{ mb: 2 }}>
                            <TextField
                                fullWidth
                                label="Tiêu đề bài kiểm tra"
                                placeholder="Nhập tên bài kiểm tra..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Thời gian làm bài (phút)"
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                            />
                        </Box>
                    </Box>

                    {/* CỘT PHẢI */}
                    <Box flex={1}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Mô tả"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Box>
                </Box>
            </Paper>

            {/* ======= DANH SÁCH CÁC GAME ĐÃ CHỌN ======= */}
            {games.map((g, index) => (
                <Paper key={index} sx={{ p: 3, borderRadius: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography fontWeight={700}>

                        </Typography>

                        <IconButton onClick={() => removeGame(index)} color="error">
                            <Typography>Xóa câu hỏi</Typography>
                        </IconButton>
                    </Box>

                    <Game
                        ref={(el) => { gameRefs.current[index] = el; }}
                        gameType={g}
                        lessonId={lessonId}
                        onValidate={() => { }}
                        type="lession"
                    />
                </Paper>
            ))}

            {/* ======= SELECT THÊM GAME ======= */}
            <Box sx={{ mb: 2, textAlign: "center" }}>
                <Typography fontWeight={600} mb={1}>
                    Thêm loại game:
                </Typography>

                <Box display="flex" justifyContent="center">
                    <Select
                        value={gameType}
                        displayEmpty
                        onChange={(e) => handleSelectGame(e.target.value)}
                        sx={{ width: 300 }}   // căn giữa cần width cố định
                    >
                        <MenuItem value="">
                            <i>-- Chọn loại game --</i>
                        </MenuItem>

                        <MenuItem value="PICTURE4_WORD4_MATCHING">Picture 4 - Word 4</MenuItem>
                        <MenuItem value="PICTURE_WORD_MATCHING">Picture - Word</MenuItem>
                        <MenuItem value="PICTURE_SENTENCE_MATCHING">Picture - Sentence</MenuItem>
                        <MenuItem value="PICTURE_WORD_WRITING">Picture - Writing</MenuItem>
                        <MenuItem value="SOUND_WORD_MATCHING">Sound - Word</MenuItem>
                        <MenuItem value="WORD_TO_SENTENCE">Word To Sentence</MenuItem>
                        <MenuItem value="SENTENCE_HIDDEN_WORD">Sentence Hidden Word</MenuItem>
                    </Select>
                </Box>
            </Box>


            {/* SAVE BUTTON */}
            <Box textAlign="center" mb={4}>
                <Button
                    variant="contained"
                    sx={{ bgcolor: "#ddd", color: "#000", width: 240 }}
                    onClick={handleSaveLesson}
                >
                    LƯU BÀI KIỂM TRA
                </Button>
            </Box>
        </Box>
    );
}
