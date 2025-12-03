import { Box, Typography, Button, CircularProgress, MenuItem, Select, Snackbar, Alert } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { deleteSentence, deleteVocab, getLessonDetail, type LessonDetails, type LessonRes } from "../../../../api/admin";
import { useEffect, useState } from "react";
import { useHomeContext } from "../../../../context/AuthContext";
import AddContentModal from "./AddVocabModal";
import ConfirmDialog from "../../../../components/admin/ConfirmDialog";


interface LessonDetailProps {
    lesson: LessonRes;
    onBack: () => void;
}
// Định nghĩa kiểu dữ liệu cho trạng thái xác nhận xoá
interface DeleteState {
    open: boolean;
    id: number | null;
    type: "vocab" | "sentence" | null;
}
// Interface cho Toast (Snackbar)
interface ToastState {
    open: boolean;
    message: string;
    severity: "success" | "error";
}

export default function LessonDetail({ lesson, onBack }: LessonDetailProps) {
    const { selectedClass } = useHomeContext();

    const [detail, setDetail] = useState<LessonDetails | null>(null);
    const [loading, setLoading] = useState(false);

    const [openModal, setOpenModal] = useState(false);
    const [modalMode, setModalMode] = useState<"vocab" | "sentence">("vocab");

    // State cho Dialog xác nhận xoá
    const [deleteConfirm, setDeleteConfirm] = useState<DeleteState>({
        open: false,
        id: null,
        type: null
    });
    // --- STATE QUẢN LÝ TOAST/SNACKBAR ---
    const [toast, setToast] = useState<ToastState>({
        open: false,
        message: "",
        severity: "success"
    });
    // Hàm hiển thị Toast
    const showToast = (message: string, severity: "success" | "error" = "success") => {
        setToast({ open: true, message, severity });
    };

    // Hàm đóng Toast
    const handleCloseToast = () => {
        setToast({ ...toast, open: false });
    }
    const fetchDetail = async () => {
        setLoading(true);
        try {
            const data = await getLessonDetail(lesson.id);
            data.vocabResList.sort((a, b) => a.orderIndex - b.orderIndex);
            data.sentenceResList.sort((a, b) => a.orderIndex - b.orderIndex);
            setDetail(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [lesson.id]);

    // --- MỞ HỘP THOẠI XÁC NHẬN ---
    const handleRequestDelete = (id: number, type: "vocab" | "sentence") => {
        setDeleteConfirm({
            open: true,
            id: id,
            type: type
        });
    };

    // --- ĐÓNG HỘP THOẠI ---
    const handleCloseConfirm = () => {
        setDeleteConfirm({ ...deleteConfirm, open: false });
    };

    // --- THỰC HIỆN XOÁ KHI NGƯỜI DÙNG BẤM "ĐỒNG Ý" ---
    const handleConfirmDelete = async () => {
        if (!deleteConfirm.id || !deleteConfirm.type) return;
        handleCloseConfirm();
        setLoading(true); // Hiển thị loading toàn trang hoặc xử lý loading cục bộ

        try {
            let message = "";
            if (deleteConfirm.type === "vocab") {
                message = await deleteVocab(deleteConfirm.id);
            } else {
                message = await deleteSentence(deleteConfirm.id);
            }
            
            // Có thể dùng Toast/Snackbar thay vì alert để đẹp hơn, nhưng alert tạm thời ok
            showToast(message, "success");
            await fetchDetail(); // Load lại dữ liệu mới nhất
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Có lỗi xảy ra khi xoá.";
            showToast(errorMsg, "error");
        } finally {
            setLoading(false);
        }
    };

    if (loading || !detail) {
        return (
            <Box sx={{ p: 5, textAlign: "center" }}>
                <CircularProgress />
            </Box>
        );
    }
    if (loading || !detail) {
        return (
            <Box sx={{ p: 5, textAlign: "center" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: "white",
                boxShadow: "0 0 0 1px #ddd",
            }}
        >
            {/* SELECT CLASS */}
            <Box sx={{ mb: 3 }}>
                <Select
                    value={selectedClass}
                    disabled
                    sx={{
                        bgcolor: "#f5f5f5",
                        height: 40,
                        borderRadius: 1,
                        fontSize: 14,
                        "& .MuiSelect-select": {
                            display: "flex",
                            alignItems: "center",
                            color: "black",
                        },
                    }}
                >
                    <MenuItem value="1">Lớp 1</MenuItem>
                    <MenuItem value="2">Lớp 2</MenuItem>
                    <MenuItem value="3">Lớp 3</MenuItem>
                    <MenuItem value="4">Lớp 4</MenuItem>
                    <MenuItem value="5">Lớp 5</MenuItem>
                </Select>
            </Box>

            {/* BACK BUTTON */}
            <Box sx={{ mb: 2 }}>
                <Button
                    onClick={onBack}
                    sx={{
                        minWidth: 0,
                        p: 1,
                        borderRadius: "50%",
                        color: "black",
                    }}
                >
                    <ArrowBackIcon />
                </Button>
            </Box>

            {/* TITLE */}
            <Typography
                variant="h5"
                sx={{
                    textAlign: "center",
                    fontWeight: 700,
                    mb: 4,
                }}
            >
                UNIT {lesson.unitNumber}: {lesson.unitName.toUpperCase()}
            </Typography>

            {/* TWO COLUMN WRAPPER */}
            <Box
                sx={{
                    display: "flex",
                    gap: 4,
                }}
            >
                {/* LEFT – VOCAB */}
                <Box
                    sx={{
                        flex: 1,
                        border: "1px solid #ccc",
                        borderRadius: 2,
                        p: 2,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                        }}
                    >
                        <Typography sx={{ fontWeight: 700, color: "gray" }}>
                            Từ vựng
                        </Typography>

                        <Button
                            variant="contained"
                            sx={{ bgcolor: "#4CAF50", fontWeight: 700 }}
                            onClick={() => {
                                setModalMode("vocab");
                                setOpenModal(true);
                            }}
                        >
                            Thêm từ mới
                        </Button>
                    </Box>

                    {detail.vocabResList.map((v) => (
                        <Box
                            key={v.id}
                            sx={{
                                border: "1px solid #ccc",
                                borderRadius: 1,
                                p: 1.5,
                                mb: 1.5,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <Typography fontWeight={700}>{v.orderIndex}</Typography>
                                <Typography fontWeight={700}>{v.term_en}</Typography>
                                <Typography sx={{ color: "gray" }}>{v.phonetic}</Typography>
                                <Typography fontStyle="italic">({v.partOfSpeech})</Typography>
                            </Box>

                            <Box sx={{ display: "flex", gap: 1 }}>
                                <Button 
                                    variant="contained" 
                                    sx={{ bgcolor: "#ef5350", minWidth: 60, fontSize: 12 }}
                                    onClick={() => handleRequestDelete(v.id, "vocab")}
                                    >
                                    Xoá
                                </Button>
                                <Button variant="contained" sx={{ bgcolor: "#64b5f6", minWidth: 70, fontSize: 12 }}>
                                    Chi tiết
                                </Button>
                            </Box>
                        </Box>
                    ))}+
                </Box>

                {/* RIGHT – SENTENCES */}
                <Box
                    sx={{
                        flex: 1,
                        border: "1px solid #ccc",
                        borderRadius: 2,
                        p: 2,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                        }}
                    >
                        <Typography sx={{ fontWeight: 700, color: "gray" }}>
                            Câu
                        </Typography>

                        <Button
                            variant="contained"
                            sx={{ bgcolor: "#4CAF50", fontWeight: 700 }}
                            onClick={() => {
                                setModalMode("sentence");
                                setOpenModal(true);
                            }}
                        >
                            Thêm câu mới
                        </Button>
                    </Box>

                    {detail.sentenceResList.map((s) => (
                        <Box
                            key={s.id}
                            sx={{
                                border: "1px solid #ccc",
                                borderRadius: 1,
                                p: 1.5,
                                mb: 1.5,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <Typography fontWeight={700}>{s.orderIndex}</Typography>
                                <Typography fontWeight={700}>{s.sen_en}</Typography>
                            </Box>

                            <Box sx={{ display: "flex", gap: 1 }}>
                                <Button 
                                    variant="contained" 
                                    sx={{ bgcolor: "#ef5350", minWidth: 60, fontSize: 12 }}
                                    onClick={() => handleRequestDelete(s.id, "sentence")}
                                    >
                                    Xoá
                                </Button>
                                <Button variant="contained" sx={{ bgcolor: "#64b5f6", minWidth: 70, fontSize: 12 }}>
                                    Chi tiết
                                </Button>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* MODAL DÙNG CHUNG */}
            <AddContentModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                lessonId={lesson.id}
                onSuccess={() => {
                    setOpenModal(false);
                    fetchDetail();
                }}
                mode={modalMode}
            />
            {/* DIALOG XÁC NHẬN XOÁ */}
            <ConfirmDialog 
                open={deleteConfirm.open}
                onClose={handleCloseConfirm}
                onConfirm={handleConfirmDelete}
                title={deleteConfirm.type === "vocab" ? "Xoá từ vựng" : "Xoá câu mẫu"}
                content={
                    deleteConfirm.type === "vocab" 
                    ? "Bạn có chắc chắn muốn xoá từ vựng này không?"
                    : "Bạn có chắc chắn muốn xoá câu này không?"
                }
            />
            <Snackbar
                open={toast.open}
                autoHideDuration={4000} // Tự động đóng sau 4 giây
                onClose={handleCloseToast}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }} // Hiển thị ở góc trên bên phải
            >
                <Alert 
                    onClose={handleCloseToast} 
                    severity={toast.severity} 
                    variant="filled"
                    sx={{ width: '100%', boxShadow: 3 }}
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
