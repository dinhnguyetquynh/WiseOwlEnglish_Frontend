import {
    Box,
    Typography,
    Button,
    Paper,
    IconButton,
    CircularProgress,
    Tooltip,
    Menu,
    MenuItem,
    Divider,
} from "@mui/material";
import {
    Delete as DeleteIcon,
    Add as AddIcon,
    EditOutlined as EditIcon,
    QuizOutlined as QuizIcon,
    SchoolOutlined as LessonIcon,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { getDetailsGameOfLessons, getTypesByGrade } from "../../../api/admin";
import type { LessonDetail } from "../schemas/gamedetails.schema";
import { useHomeContext } from "../../../context/AuthContext";

export default function LessonDetail({
    lessonId,
    onBack,
}: {
    lessonId: number;
    onBack: () => void;
}) {
    const { selectedClass } = useHomeContext(); // ✅ lấy lớp học hiện tại
    const [lesson, setLesson] = useState<LessonDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null); // ✅ menu anchor




    const [gameTypes, setGameTypes] = useState<string[]>([]);
    const [loadingTypes, setLoadingTypes] = useState(false);
    useEffect(() => {
        const fetchLesson = async () => {
            try {
                setLoading(true);
                setError("");
                const data = await getDetailsGameOfLessons(lessonId);
                setLesson(data);
            } catch (err: any) {
                setError(err.message || "Không thể tải dữ liệu bài học");
            } finally {
                setLoading(false);
            }
        };
        fetchLesson();
    }, [lessonId]);
    // --- Gọi API lấy danh sách loại game ---
    const handleOpenMenu = async (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        setMenuAnchor(e.currentTarget);
        if (!selectedClass) return;
        try {
            setLoadingTypes(true);
            const types = await getTypesByGrade(Number(selectedClass));
            setGameTypes(types);
        } catch {
            setGameTypes([]);
        } finally {
            setLoadingTypes(false);
        }
    };
    if (loading)
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "60vh",
                }}
            >
                <CircularProgress />
            </Box>
        );

    if (error)
        return (
            <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography color="error" sx={{ mb: 2 }}>
                    {error}
                </Typography>
                <Button variant="outlined" onClick={onBack}>
                    ← Quay lại
                </Button>
            </Box>
        );

    if (!lesson) return null;

    return (
        <Box sx={{ bgcolor: "grey.50", p: 3, borderRadius: 2 }}>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={onBack}
                    sx={{ textTransform: "none" }}
                >
                    ← Quay lại
                </Button>

                <Typography
                    variant="h6"
                    fontWeight="bold"
                    textAlign="center"
                    sx={{ flexGrow: 1 }}
                >
                    {lesson.unitName.toUpperCase()} : {lesson.lessonName.toUpperCase()}
                </Typography>

                {/* ✅ Nút mở menu “Tạo Game” */}
                <Box sx={{ position: "relative" }}>
                    <Button
                        startIcon={<AddIcon />}
                        variant="contained"
                        size="small"
                        sx={{
                            bgcolor: "#1976d2",
                            textTransform: "none",
                            borderRadius: 2,
                            "&:hover": { bgcolor: "#1565c0" },
                        }}
                        onClick={handleOpenMenu}
                    >
                        Tạo Game
                    </Button>


                    <Menu
                        anchorEl={menuAnchor}
                        open={Boolean(menuAnchor)}
                        onClose={() => setMenuAnchor(null)}
                        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                        transformOrigin={{ vertical: "top", horizontal: "right" }}
                    >
                        {loadingTypes ? (
                            <MenuItem disabled>
                                <CircularProgress size={18} sx={{ mr: 1 }} /> Đang tải...
                            </MenuItem>
                        ) : gameTypes.length === 0 ? (
                            <MenuItem disabled>Không có loại game phù hợp</MenuItem>
                        ) : (
                            gameTypes.map((type) => (
                                <MenuItem
                                    key={type}
                                    onClick={() => {
                                        console.log("Tạo game:", type);
                                        setMenuAnchor(null);
                                    }}
                                >
                                    <QuizIcon fontSize="small" sx={{ mr: 1 }} />
                                    {type.replaceAll("_", " ")}
                                </MenuItem>
                            ))
                        )}
                    </Menu>
                </Box>
            </Box>

            {/* Danh sách game */}
            {lesson.games.map((game) => (
                <Paper
                    key={game.id}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 1.5,
                        mb: 1,
                        border: "1px solid",
                        borderColor: "grey.200",
                        borderRadius: 1,
                        "&:hover": { bgcolor: "grey.100" },
                    }}
                >
                    <Box sx={{ flexBasis: "55%", pl: 1 }}>
                        <Typography
                            variant="body1"
                            fontWeight="500"
                            sx={{
                                mb: 0.3,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {game.title}
                        </Typography>
                    </Box>

                    <Box sx={{ flexBasis: "15%", textAlign: "center" }}>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            fontStyle="italic"
                        >
                            {game.gameType}
                        </Typography>
                    </Box>

                    <Box sx={{ flexBasis: "15%", textAlign: "center" }}>
                        <Typography variant="body1" fontWeight="bold">
                            {game.totalQuestion}
                        </Typography>
                    </Box>

                    <Box sx={{ flexBasis: "15%", textAlign: "center" }}>
                        <Typography variant="body2">
                            {new Date(game.updatedDate).toLocaleDateString("vi-VN")}
                        </Typography>
                    </Box>

                    <Box sx={{ width: 50, textAlign: "center" }}>
                        <Tooltip title="Xóa game">
                            <IconButton color="error" size="small">
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Paper>
            ))}
        </Box>
    );
}
