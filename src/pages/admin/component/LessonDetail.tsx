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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,

} from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import {
    Delete as DeleteIcon,
    Add as AddIcon,
    EditOutlined as EditIcon,
    QuizOutlined as QuizIcon,
    SchoolOutlined as LessonIcon,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { deleteGame, getDetailsGameOfLessons, getTypesByGrade } from "../../../api/admin";
import type { LessonDetail } from "../schemas/gamedetails.schema";
import { useHomeContext } from "../../../context/AuthContext";

type LessonDetailProps = {
    lessonId: number;
    onBack: () => void;
    onCreateGame: (gameType: string, lessonId: number, gameId?: number) => void;
    onUpdateGame: (gameType: string, lessonId: number, gameId: number) => void;
};

export default function LessonDetail({
    lessonId,
    onBack,
    onCreateGame,
    onUpdateGame,
}: LessonDetailProps) {
    console.log("LessonDetail props:", { lessonId, onCreateGame, onUpdateGame });
    const { setEditingGameInfo } = useHomeContext()
    const { selectedClass } = useHomeContext(); // ✅ lấy lớp học hiện tại
    const [lesson, setLesson] = useState<LessonDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null); // ✅ menu anchor

    const [gameTypes, setGameTypes] = useState<string[]>([]);
    const [loadingTypes, setLoadingTypes] = useState(false);

    // 👇 State cho Dialog xóa
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [gameToDelete, setGameToDelete] = useState<{ id: number; title: string } | null>(null);

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                setLoading(true);
                setError("");
                const data = await getDetailsGameOfLessons(lessonId);

                console.log("Lesson data:", data);
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
            const types = await getTypesByGrade(Number(selectedClass), lessonId);
            setGameTypes(types);
        } catch {
            setGameTypes([]);
        } finally {
            setLoadingTypes(false);
        }
    };
    // 👇 Hàm mở hộp thoại xác nhận xóa
    const handleClickDelete = (id: number, title: string) => {
        setGameToDelete({ id, title });
        setOpenDeleteDialog(true);
    };

    // 👇 Hàm thực hiện xóa khi user bấm "Đồng ý"
    const handleConfirmDelete = async () => {
        if (!gameToDelete) return;
        try {
            // Gọi API Backend
            const message = await deleteGame(gameToDelete.id);
            console.log(message); // Log message từ backend (Soft/Hard delete)

            // Cập nhật UI: Lọc bỏ game đã xóa khỏi state `lesson`
            if (lesson) {
                setLesson({
                    ...lesson,
                    games: lesson.games.filter(
                        (g) => (g.id ?? (g as any).gameId) !== gameToDelete.id
                    ),
                });
            }
            // Đóng dialog
            setOpenDeleteDialog(false);
            setGameToDelete(null);
        } catch (err: any) {
            console.error("Lỗi khi xóa game:", err);
            alert("Xóa thất bại: " + (err.response?.data?.message || err.message));
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
    console.log("LessonDetail → games:", lesson.games);
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
                    ← Quay lại OK
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
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        console.log("Tạo game:", type);
                                        setMenuAnchor(null);
                                        onCreateGame(type, lessonId); // Gửi enum + id bài học lên
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

            <Paper
                sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 1.5,
                    mb: 1,
                    bgcolor: "grey.200",
                    fontWeight: "bold",
                }}
            >
                <Box sx={{ flexBasis: "40%", pl: 1 }}>
                    <Typography variant="subtitle2">Tên game</Typography>
                </Box>

                <Box sx={{ flexBasis: "15%", textAlign: "center" }}>
                    <Typography variant="subtitle2">Loại</Typography>
                </Box>

                <Box sx={{ flexBasis: "10%", textAlign: "center" }}>
                    <Typography variant="subtitle2">Active</Typography>
                </Box>

                <Box sx={{ flexBasis: "10%", textAlign: "center" }}>
                    <Typography variant="subtitle2">Số câu</Typography>
                </Box>

                <Box sx={{ flexBasis: "15%", textAlign: "center" }}>
                    <Typography variant="subtitle2">Cập nhật</Typography>
                </Box>

                <Box sx={{ flexBasis: "10%", textAlign: "center" }}>
                    <Typography variant="subtitle2">Hành động</Typography>
                </Box>
            </Paper>


            {/* Danh sách game */}
            {/* {lesson.games.map((game) => (
                
                <Paper
                    key={game.id ?? (game as any).gameId}
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
                    <Box sx={{ flexBasis: "40%", pl: 1 }}>
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
                        <Typography variant="body2" color="text.secondary" fontStyle="italic">
                            {game.gameType}
                        </Typography>
                    </Box>

                    <Box sx={{ flexBasis: "10%", textAlign: "center" }}>
                        {game.active ? (
                            <CheckCircle sx={{ color: "green" }} />
                        ) : (
                            <Cancel sx={{ color: "red" }} />
                        )}
                    </Box>

                    <Box sx={{ flexBasis: "10%", textAlign: "center" }}>
                        <Typography variant="body1" fontWeight="bold">
                            {game.totalQuestion}
                        </Typography>
                    </Box>

                    <Box sx={{ flexBasis: "15%", textAlign: "center" }}>
                        <Typography variant="body2">
                            {new Date(game.updatedDate).toLocaleDateString("vi-VN")}
                        </Typography>
                    </Box>

                    <Box sx={{ flexBasis: "10%", textAlign: "center" }}>
                        <Tooltip title="Chỉnh sửa game">
                            <IconButton
                                color="primary"
                                size="small"
                                sx={{ mr: 1 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const resolvedId = game.id ?? (game as any).gameId;
                                    console.log("LessonDetail → Edit clicked. ID =", resolvedId);
                                    if (resolvedId === undefined) {
                                        console.warn("Không tìm thấy gameId cho game", game);
                                        return;
                                    }
                                    setEditingGameInfo({
                                        gameType: game.gameType,
                                        lessonId: lessonId,
                                        gameId: resolvedId,
                                    });
                                    onUpdateGame(game.gameType, lessonId, resolvedId);
                                }}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Xóa game">
                            <IconButton 
                                color="error" 
                                size="small"
                                onClick={(e) => {
                                        e.stopPropagation();
                                        if (resolvedId !== undefined) {
                                            handleClickDelete(resolvedId, game.title);
                                        }
                                    }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>

                </Paper>
            ))} */}
            {/* Danh sách game */}
            {lesson.games.map((game) => {
                const resolvedId = game.id ?? (game as any).gameId;
                return (
                    <Paper
                        key={resolvedId}
                        sx={{
                            display: "flex", alignItems: "center", p: 1.5, mb: 1,
                            border: "1px solid", borderColor: "grey.200", borderRadius: 1,
                            "&:hover": { bgcolor: "grey.100" },
                        }}
                    >
                        <Box sx={{ flexBasis: "40%", pl: 1 }}>
                            <Typography variant="body1" fontWeight="500" sx={{ mb: 0.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {game.title}
                            </Typography>
                        </Box>

                        <Box sx={{ flexBasis: "15%", textAlign: "center" }}>
                            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                {game.gameType}
                            </Typography>
                        </Box>

                        <Box sx={{ flexBasis: "10%", textAlign: "center" }}>
                            {game.active ? <CheckCircle sx={{ color: "green" }} /> : <Cancel sx={{ color: "red" }} />}
                        </Box>

                        <Box sx={{ flexBasis: "10%", textAlign: "center" }}>
                            <Typography variant="body1" fontWeight="bold">{game.totalQuestion}</Typography>
                        </Box>

                        <Box sx={{ flexBasis: "15%", textAlign: "center" }}>
                            <Typography variant="body2">{new Date(game.updatedDate).toLocaleDateString("vi-VN")}</Typography>
                        </Box>

                        <Box sx={{ flexBasis: "10%", textAlign: "center" }}>
                            <Tooltip title="Chỉnh sửa game">
                                <IconButton
                                    color="primary"
                                    size="small"
                                    sx={{ mr: 1 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (resolvedId === undefined) return;
                                        setEditingGameInfo({
                                            gameType: game.gameType,
                                            lessonId: lessonId,
                                            gameId: resolvedId,
                                        });
                                        onUpdateGame(game.gameType, lessonId, resolvedId);
                                    }}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>

                            {/* 👇 Nút Xóa Đã Được Gắn Sự Kiện */}
                            <Tooltip title="Xóa game">
                                <IconButton
                                    color="error"
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (resolvedId !== undefined) {
                                            handleClickDelete(resolvedId, game.title);
                                        }
                                    }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Paper>
                );
            })}
            {/* 👇 Dialog Xác Nhận Xóa */}
            <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
            >
                <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    Xác nhận xóa game?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bạn có chắc chắn muốn xóa game <strong>"{gameToDelete?.title}"</strong> không?
                        <br /><br />
                        <span style={{ fontSize: '0.9em', color: '#666' }}>
                            *Nếu bài học chưa active, game sẽ bị xóa vĩnh viễn.
                            <br />
                            *Nếu bài học đang active, game sẽ bị ẩn đi.
                        </span>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">
                        Hủy
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus>
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}
