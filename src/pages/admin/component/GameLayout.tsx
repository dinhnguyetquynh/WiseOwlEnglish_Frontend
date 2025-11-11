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
import { getLessonsGameByGrade } from "../../../api/admin"; // ✅ chỉ cần 1 API
import type { Lesson, Lessons } from "../schemas/game.schema";

export default function GameLayout() {
    const { selectedClass, setSelectedClass } = useHomeContext();
    const [lessons, setLessons] = useState<Lessons>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // --- Gọi API theo lớp ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError("");
                const data = await getLessonsGameByGrade(Number(selectedClass));
                console.log("DATA:", data);
                setLessons(data);
            } catch (err: any) {
                setError(err.message || "Không thể tải danh sách bài học");
            } finally {
                setLoading(false);
            }
        };

        if (selectedClass) fetchData();
    }, [selectedClass]);

    return (
        <>
            {/* Select lớp học */}
            <Box sx={{ mb: 3, width: 200 }}>
                <Select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    displayEmpty
                    IconComponent={ArrowDownIcon}
                    sx={{
                        bgcolor: "white",
                        fontSize: 14,
                        borderRadius: 1,
                        height: 40,
                        "& .MuiSelect-select": { display: "flex", alignItems: "center" },
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

            {/* Bảng hiển thị */}
            <Paper elevation={1} sx={{ overflow: "hidden" }}>
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
                        <Typography variant="body2" fontWeight="bold">
                            Unit
                        </Typography>
                    </Grid>
                    <Grid container sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight="bold">
                            Unit Name
                        </Typography>
                    </Grid>
                    <Grid container sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight="bold">
                            Games
                        </Typography>
                    </Grid>
                    <Grid container sx={{ flex: 1 }} />
                </Grid>

                {/* Hiển thị trạng thái */}
                {loading ? (
                    <Box sx={{ p: 4, textAlign: "center" }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography sx={{ p: 2, color: "red" }}>{error}</Typography>
                ) : (
                    lessons.map((lesson) => (
                        <LessonRow key={lesson.lessonId} lesson={lesson} />
                    ))
                )}
            </Paper>
        </>
    );
}

/* --------------------------
 * Component hiển thị từng hàng Lesson
 * -------------------------- */
function LessonRow({ lesson }: { lesson: Lesson }) {
    return (
        <Grid
            container
            alignItems="center"
            sx={{
                p: 2,
                borderBottom: 1,
                borderColor: "grey.100",
                "&:hover": { bgcolor: "grey.50" },
            }}
        >
            {/* Unit Name */}
            <Grid container sx={{ flex: 1 }}>
                <Typography variant="body1" fontWeight="medium">
                    {lesson.unitName}
                </Typography>
            </Grid>

            {/* Lesson Name */}
            <Grid container sx={{ flex: 1 }}>
                <Typography variant="body1">{lesson.lessonName}</Typography>
            </Grid>

            {/* Games */}
            <Grid container sx={{ flex: 1 }}>
                {lesson.games && lesson.games.length > 0 ? (
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

            {/* Nút xem chi tiết */}
            <Grid container sx={{ flex: 1, justifyContent: "flex-end" }}>
                <Button
                    variant="contained"
                    size="small"
                    sx={{
                        bgcolor: "grey.300",
                        color: "text.primary",
                        "&:hover": { bgcolor: "grey.400" },
                    }}
                >
                    Xem chi tiết
                </Button>
            </Grid>
        </Grid>
    );
}
