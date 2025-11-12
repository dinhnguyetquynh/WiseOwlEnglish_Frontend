import {
    Box,
    Typography,
    Button,
    Paper,
    Grid,
    Select,
    MenuItem,
    CircularProgress,
} from "@mui/material";
import { KeyboardArrowDown as ArrowDownIcon } from "@mui/icons-material";
import { useHomeContext } from "../../../context/AuthContext";
import { useEffect, useState } from "react";
import { getLessonsGameByGrade } from "../../../api/admin";
import type { Lesson } from "../schemas/game.schema";
import LessonDetail from "./LessonDetail";

export default function GameLayout() {
    const { selectedClass, setSelectedClass, setLessons, lessons } = useHomeContext();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

    useEffect(() => {
        if (!selectedClass) return;
        const fetchData = async () => {
            try {
                setLoading(true);
                setError("");
                const data = await getLessonsGameByGrade(Number(selectedClass));
                setLessons(data);
            } catch (err: any) {
                setError(err.message || "Không thể tải danh sách bài học");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedClass]);

    // --- Dropdown lớp (disable khi xem chi tiết) ---
    const renderHeader = (
        <Box sx={{ mb: 3, width: 200 }}>
            <Select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                displayEmpty
                IconComponent={ArrowDownIcon}
                disabled={!!selectedLesson} // ✅ disable khi đang ở trang chi tiết
                sx={{
                    bgcolor: "white",
                    fontSize: 14,
                    borderRadius: 1,
                    height: 40,
                    "& .MuiSelect-select": { display: "flex", alignItems: "center" },
                    "&.Mui-disabled": {
                        bgcolor: "grey.100",
                        color: "text.disabled",
                    },
                }}
            >
                <MenuItem value="" disabled>
                    Chọn lớp
                </MenuItem>
                {[1, 2, 3, 4, 5].map((grade) => (
                    <MenuItem key={grade} value={String(grade)}>
                        Lớp {grade}
                    </MenuItem>
                ))}
            </Select>
        </Box>
    );

    // --- Trang chi tiết ---
    if (selectedLesson) {
        return (
            <>
                {renderHeader}
                <LessonDetail
                    lessonId={selectedLesson.lessonId}
                    onBack={() => setSelectedLesson(null)}
                />
            </>
        );
    }

    // --- Trang danh sách ---
    return (
        <>
            {renderHeader}

            <Paper elevation={1} sx={{ overflow: "hidden" }}>
                {/* Header bảng */}
                <Grid
                    container
                    sx={{
                        bgcolor: "grey.50",
                        p: 2,
                        borderBottom: 1,
                        borderColor: "grey.200",
                        textTransform: "uppercase",
                        color: "text.secondary",
                        fontWeight: "bold",
                    }}
                >
                    <Grid container sx={{ flex: 1 }}>
                        <Typography variant="body2">Unit</Typography>
                    </Grid>
                    <Grid container sx={{ flex: 1 }}>
                        <Typography variant="body2">Unit Name</Typography>
                    </Grid>
                    <Grid container sx={{ flex: 1 }}>
                        <Typography variant="body2">Games</Typography>
                    </Grid>
                    <Grid container sx={{ flex: 1 }} />
                </Grid>

                {/* Nội dung */}
                {loading ? (
                    <Box sx={{ p: 4, textAlign: "center" }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography sx={{ p: 2, color: "red" }}>{error}</Typography>
                ) : (
                    lessons.map((lesson) => (
                        <Grid
                            key={lesson.lessonId}
                            container
                            alignItems="center"
                            sx={{
                                p: 2,
                                borderBottom: 1,
                                borderColor: "grey.100",
                                "&:hover": { bgcolor: "grey.50" },
                            }}
                        >
                            <Grid container sx={{ flex: 1 }}>
                                <Typography variant="body1" fontWeight="medium">
                                    {lesson.unitName}
                                </Typography>
                            </Grid>

                            <Grid container sx={{ flex: 1 }}>
                                <Typography variant="body1">
                                    {lesson.lessonName}
                                </Typography>
                            </Grid>

                            <Grid container sx={{ flex: 1 }}>
                                {lesson.games?.length ? (
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                        {lesson.games.map((g) => (
                                            <Typography
                                                key={g.gameId}
                                                sx={{
                                                    border: "1px solid",
                                                    borderColor: "grey.300",
                                                    borderRadius: "4px",
                                                    px: 1.5,
                                                    py: 0.5,
                                                    fontSize: "0.75rem",
                                                    color: "text.secondary",
                                                }}
                                            >
                                                {g.gameType}
                                            </Typography>
                                        ))}
                                    </Box>
                                ) : (
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        fontStyle="italic"
                                    >
                                        Chưa có game nào
                                    </Typography>
                                )}
                            </Grid>

                            <Grid container sx={{ flex: 1, justifyContent: "flex-end" }}>
                                <Button
                                    variant="contained"
                                    size="small"
                                    sx={{
                                        bgcolor: "grey.300",
                                        color: "text.primary",
                                        "&:hover": { bgcolor: "grey.400" },
                                    }}
                                    onClick={() => setSelectedLesson(lesson)}
                                >
                                    Xem chi tiết
                                </Button>
                            </Grid>
                        </Grid>
                    ))
                )}
            </Paper>
        </>
    );
}
