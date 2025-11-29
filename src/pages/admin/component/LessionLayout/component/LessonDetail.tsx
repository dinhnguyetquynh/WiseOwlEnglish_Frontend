import {
    Box,
    Typography,
    Button,
    Switch,
    IconButton,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useEffect, useState } from "react";
import { updateTestStatus } from "../../../../../api/admin";

import { getTestsByLesson, type LessonDetailResponse } from "../../../../../api/admin";
import CreateLessonWithGame from "./CreateLessonWithGame";

interface LessonDetailProps {
    lessonId: number;
    onBack: () => void;
}

export default function LessonDetail({ lessonId, onBack }: LessonDetailProps) {
    const [tests, setTests] = useState<LessonDetailResponse | null>(null);
    const [openCreate, setOpenCreate] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState<{ [key: number]: boolean }>({});

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [lessonId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await getTestsByLesson(lessonId);  // res là OBJECT
            setTests(res);
        } finally {
            setLoading(false);
        }
    };
    const handleToggleStatus = async (testId: number, newStatus: boolean) => {
        // bật loading cho Switch này
        setLoadingStatus(prev => ({ ...prev, [testId]: true }));

        try {
            await updateTestStatus(testId, newStatus);

            // cập nhật UI local
            setTests(prev =>
                prev
                    ? {
                        ...prev,
                        testList: prev.testList.map(t =>
                            t.id === testId ? { ...t, active: newStatus } : t
                        )
                    }
                    : prev
            );
        } catch (err) {
            alert("Không thể cập nhật trạng thái");
            console.error(err);
        } finally {
            // tắt loading
            setLoadingStatus(prev => ({ ...prev, [testId]: false }));
        }
    };


    if (loading) {
        return (
            <Box display="flex" flexDirection="column" gap={3}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    sx={{ width: "fit-content" }}
                    onClick={onBack}
                >
                    Quay lại
                </Button>

                <Box sx={{ p: 4, textAlign: "center" }}>
                    <CircularProgress />
                </Box>
            </Box>
        );
    }

    return (
        <Box display="flex" flexDirection="column" gap={3}>
            {/* BACK */}
            <Button
                startIcon={<ArrowBackIcon />}
                sx={{ width: "fit-content" }}
                onClick={onBack}
            >
                Quay lại
            </Button>

            {/* HEADER */}
            <Box
                border="1px solid #ccc"
                borderRadius={2}
                px={3}
                py={2}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
            >
                <Typography fontWeight={700} fontSize="1.4rem">
                    {tests?.unitNumber} - {tests?.unitName}
                </Typography>
                <Typography fontWeight={700} fontSize="1.4rem">
                    QUẢN LÝ BÀI KIỂM TRA
                </Typography>

                <Button
                    variant="contained"
                    sx={{
                        bgcolor: "#ddd",
                        color: "#000",
                        textTransform: "none",
                        borderRadius: 2,
                        "&:hover": { bgcolor: "#ccc" },
                    }}
                    onClick={() => setOpenCreate(true)}
                >
                    TẠO BÀI KIỂM TRA
                </Button>

            </Box>

            {/* TABLE HEADER */}
            <Box
                border="1px solid #ccc"
                borderRadius={2}
                px={2}
                py={1.5}
                display="flex"
                fontWeight={600}
                bgcolor="#fafafa"
            >
                <Box flex={2}><Typography>Tên bài kiểm tra</Typography></Box>
                <Box flex={1}><Typography>Tổng số câu</Typography></Box>
                <Box flex={1}><Typography>Thời gian</Typography></Box>
                <Box flex={1}><Typography>Trạng thái</Typography></Box>
                <Box flex={1}><Typography>Chỉnh sửa</Typography></Box>
                <Box flex={1}><Typography>Xoá</Typography></Box>
            </Box>

            {/* TEST LIST */}
            {tests?.testList.map((t) => (
                <Box
                    key={t.id}
                    border="1px solid #ddd"
                    borderRadius={2}
                    px={3}
                    py={2}
                    display="flex"
                    alignItems="center"
                    gap={2}
                >
                    {/* Test Name */}
                    <Box flex={2}>
                        <Typography fontWeight={700}>{t.title}</Typography>
                    </Box>

                    {/* Total Questions */}
                    <Box flex={1}>
                        <Typography>{t.totalQuestion}</Typography>
                    </Box>

                    {/* Duration */}
                    <Box flex={1}>
                        <Typography fontWeight={700}>{t.durationMin} phút</Typography>
                    </Box>

                    {/* Status */}
                    <Box flex={1} display="flex" alignItems="center">
                        {loadingStatus[t.id] ? (
                            <CircularProgress size={22} />
                        ) : (
                            <Switch
                                checked={t.active}
                                onChange={(e) => handleToggleStatus(t.id, e.target.checked)}
                                disabled={loadingStatus[t.id]}
                            />
                        )}
                    </Box>


                    {/* Edit */}
                    <Box flex={1}>
                        <IconButton>
                            <EditIcon sx={{ color: "#222" }} />
                        </IconButton>
                    </Box>

                    {/* Delete */}
                    <Box flex={1}>
                        <IconButton disabled={t.hasAttempt}>
                            <DeleteIcon
                                sx={{ color: t.hasAttempt ? "grey" : "#222" }}
                            />
                        </IconButton>
                    </Box>
                </Box>
            ))}
            {/* MODAL TẠO BÀI KIỂM TRA */}
            <Dialog
                open={openCreate}
                onClose={() => setOpenCreate(false)}
                maxWidth={false}
                fullWidth
                PaperProps={{
                    sx: {
                        width: "100vw",
                        maxWidth: "1600px",   // set kích thước tối đa
                    }
                }}
            >

                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography fontWeight={700}>
                            Tạo bài kiểm tra mới
                        </Typography>

                        <Button
                            onClick={() => setOpenCreate(false)}
                            sx={{ textTransform: "none" }}
                        >
                            Đóng
                        </Button>
                    </Box>
                </DialogTitle>

                <DialogContent dividers sx={{ p: 2 }}>
                    <CreateLessonWithGame
                        lessonId={tests?.id ?? 0}
                        onBack={() => setOpenCreate(false)}
                        onSaved={() => {
                            setOpenCreate(false);                 // ← đóng modal
                            loadData();                           // ← refresh list
                        }}

                    />
                </DialogContent>
            </Dialog>

        </Box>

    );
}
