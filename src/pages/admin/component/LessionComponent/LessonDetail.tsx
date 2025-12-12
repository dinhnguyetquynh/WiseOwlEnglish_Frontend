
import { Box, Typography, Button, CircularProgress, MenuItem, Select, Snackbar, Alert, IconButton, Tooltip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete"; // Icon Xoá
import EditIcon from "@mui/icons-material/Edit";     // Icon Sửa
import VisibilityIcon from "@mui/icons-material/Visibility"; // Icon Chi tiết
import { deleteSentence, deleteVocab, getLessonDetail, type LessonDetails, type LessonRes, type SentenceFullRes, type VocabRes } from "../../../../api/admin";
import { useHomeContext } from "../../../../context/AuthContext";
import { useEffect, useState } from "react";
import AddContentModal from "./AddVocabModal";
import UpdateVocabModal from "./UpdateVocabModal";
import ConfirmDialog from "../../../../components/admin/ConfirmDialog";
import UpdateSentenceModal from "./UpdateSentenceModal";




interface LessonDetailProps {
    lesson: LessonRes;
    onBack: () => void;
}

interface DeleteState {
    open: boolean;
    id: number | null;
    type: "vocab" | "sentence" | null;
}

interface ToastState {
    open: boolean;
    message: string;
    severity: "success" | "error";
}

// Interface cho dữ liệu cần Update
interface VocabToUpdate {
    id: number;
    term_en: string;
    term_vi: string; // Cần backend trả về trường này trong API getLessonDetail nếu chưa có
    phonetic: string;
    partOfSpeech: string;
    isForLearning: boolean;
}

export default function LessonDetail({ lesson, onBack }: LessonDetailProps) {
    const { selectedClass } = useHomeContext();

    const [detail, setDetail] = useState<LessonDetails | null>(null);
    const [loading, setLoading] = useState(false);

    

    // State cho Modal Thêm mới
    const [openAddModal, setOpenAddModal] = useState(false);
    const [modalMode, setModalMode] = useState<"vocab" | "sentence">("vocab");

    // State cho Modal Update
    const [openUpdateModal, setOpenUpdateModal] = useState(false);
    const [selectedVocab, setSelectedVocab] = useState<VocabRes | null>(null);

    // State quản lý việc sửa câu
    const [openUpdateSentence, setOpenUpdateSentence] = useState(false);
    const [selectedSentence, setSelectedSentence] = useState<SentenceFullRes | null>(null);
    
    const handleEditSentence = (sentence: any) => {
    setSelectedSentence(sentence);
    setOpenUpdateSentence(true);
    };

    const [deleteConfirm, setDeleteConfirm] = useState<DeleteState>({
        open: false,
        id: null,
        type: null
    });

    const [toast, setToast] = useState<ToastState>({
        open: false,
        message: "",
        severity: "success"
    });

    const showToast = (message: string, severity: "success" | "error" = "success") => {
        setToast({ open: true, message, severity });
    };

    const handleCloseToast = () => {
        setToast({ ...toast, open: false });
    }

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const data = await getLessonDetail(lesson.id);
            // Sắp xếp
            data.vocabResList?.sort((a: any, b: any) => a.orderIndex - b.orderIndex);
            data.sentenceResList?.sort((a: any, b: any) => a.orderIndex - b.orderIndex);
            setDetail(data);
        } catch (error) {
            console.error(error);
            showToast("Không thể tải chi tiết bài học", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [lesson.id]);

    // --- XỬ LÝ XOÁ ---
    const handleRequestDelete = (id: number, type: "vocab" | "sentence") => {
        setDeleteConfirm({ open: true, id, type });
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirm.id || !deleteConfirm.type) return;
        setDeleteConfirm({ ...deleteConfirm, open: false }); // Đóng dialog ngay để UI mượt hơn
        
        // Hiển thị loading nhẹ hoặc giữ nguyên UI
        try {
            let message = "";
            if (deleteConfirm.type === "vocab") {
                message = await deleteVocab(deleteConfirm.id);
            } else {
                message = await deleteSentence(deleteConfirm.id);
            }
            showToast(typeof message === 'string' ? message : "Xoá thành công", "success");
            await fetchDetail();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Có lỗi xảy ra khi xoá.";
            showToast(errorMsg, "error");
        }
    };

    // --- XỬ LÝ UPDATE TỪ VỰNG ---
// --- XỬ LÝ UPDATE TỪ VỰNG ---
    const handleOpenUpdateVocab = (vocab: VocabRes) => {
        // Bây giờ vocab đã có đầy đủ các trường mới trả về từ backend
        // Set trực tiếp vào state để truyền sang modal
        setSelectedVocab(vocab);
        setOpenUpdateModal(true);
    };
    if (loading && !detail) {
        return <Box sx={{ p: 5, textAlign: "center" }}><CircularProgress /></Box>;
    }

    if (!detail) return null;

    return (
        
        <Box sx={{ p: 3, borderRadius: 3, bgcolor: "white", boxShadow: "0 0 0 1px #ddd" }}>
           
            {/* ... (Phần Select Class và Back Button giữ nguyên) ... */}
            <Box sx={{ mb: 3 }}>
               <Select value={selectedClass} disabled sx={{ bgcolor: "#f5f5f5", height: 40, borderRadius: 1 }}>
                   <MenuItem value="1">Lớp 1</MenuItem>
                   {/* ... */}
               </Select>
            </Box>
            
            <Box sx={{ mb: 2 }}>
                <Button onClick={onBack} sx={{ minWidth: 0, p: 1, borderRadius: "50%", color: "black" }}>
                    <ArrowBackIcon />
                </Button>
            </Box>

            <Typography variant="h5" sx={{ textAlign: "center", fontWeight: 700, mb: 4 }}>
                UNIT {lesson.unitNumber}: {lesson.unitName.toUpperCase()}
            </Typography>

            <Box sx={{ display: "flex", gap: 4 }}>
                {/* --- LEFT: VOCABULARY --- */}
                <Box sx={{ flex: 1, border: "1px solid #ccc", borderRadius: 2, p: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Typography sx={{ fontWeight: 700, color: "gray" }}>Từ vựng</Typography>
                        <Button
                            variant="contained"
                            sx={{ bgcolor: "#4CAF50", fontWeight: 700 }}
                            onClick={() => {
                                setModalMode("vocab");
                                setOpenAddModal(true);
                            }}
                        >
                            Thêm từ mới
                        </Button>
                    </Box>

                    {detail.vocabResList.map((v: any) => (
                        <Box key={v.id} sx={{
                            border: "1px solid #eee", borderRadius: 1, p: 1.5, mb: 1.5,
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            "&:hover": { bgcolor: "#f9f9f9" } // Hiệu ứng hover nhẹ
                        }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <Typography fontWeight={700} color="primary">{v.orderIndex}</Typography>
                                <Box>
                                    <Typography fontWeight={700}>{v.term_en}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {v.phonetic} • {v.partOfSpeech}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* --- ACTION ICONS --- */}
                            <Box>
                                <Tooltip title="Chi tiết">
                                    <IconButton size="small" color="info">
                                        <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                
                                <Tooltip title="Sửa">
                                    <IconButton 
                                        size="small" 
                                        color="primary" 
                                        onClick={() => handleOpenUpdateVocab(v)}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title="Xoá">
                                    <IconButton 
                                        size="small" 
                                        color="error"
                                        onClick={() => handleRequestDelete(v.id, "vocab")}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                    ))}
                </Box>

                {/* --- RIGHT: SENTENCES --- */}
                <Box sx={{ flex: 1, border: "1px solid #ccc", borderRadius: 2, p: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Typography sx={{ fontWeight: 700, color: "gray" }}>Câu</Typography>
                        <Button
                            variant="contained"
                            sx={{ bgcolor: "#4CAF50", fontWeight: 700 }}
                            onClick={() => {
                                setModalMode("sentence");
                                setOpenAddModal(true);
                            }}
                        >
                            Thêm câu mới
                        </Button>
                    </Box>

                    {detail.sentenceResList.map((s: any) => (
                        <Box key={s.id} sx={{
                            border: "1px solid #eee", borderRadius: 1, p: 1.5, mb: 1.5,
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            "&:hover": { bgcolor: "#f9f9f9" }
                        }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <Typography fontWeight={700} color="primary">{s.orderIndex}</Typography>
                                <Typography fontWeight={500}>{s.sen_en}</Typography>
                            </Box>

                            <Box>
                                <Tooltip title="Chi tiết">
                                    <IconButton size="small" color="info">
                                        <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                {/* Thêm nút Edit cho câu nếu cần sau này */}
                                <Tooltip title="Sửa">
                                    <IconButton 
                                        size="small" 
                                        color="primary" 
                                        onClick={() => handleEditSentence(s)}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Xoá">
                                    <IconButton 
                                        size="small" 
                                        color="error"
                                        onClick={() => handleRequestDelete(s.id, "sentence")}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* MODAL THÊM MỚI */}
            <AddContentModal
                open={openAddModal}
                onClose={() => setOpenAddModal(false)}
                lessonId={lesson.id}
                onSuccess={() => {
                    setOpenAddModal(false);
                    showToast("Thêm thành công!");
                    fetchDetail();
                }}
                mode={modalMode}
            />

            {/* MODAL CẬP NHẬT TỪ VỰNG */}
            <UpdateVocabModal 
                open={openUpdateModal}
                onClose={() => setOpenUpdateModal(false)}
                vocabData={selectedVocab}
                onSuccess={(msg) => {
                    showToast(msg);
                    fetchDetail();
                }}
            />
            <UpdateSentenceModal
                open={openUpdateSentence}
                onClose={() => setOpenUpdateSentence(false)}
                data={selectedSentence}
                onSuccess={(msg) => {
                    showToast(msg, "success");
                    fetchDetail(); // Load lại dữ liệu mới nhất
                }}
                onError={(msg) => {
                    showToast(msg, "error");
                    // Lưu ý: Không đóng modal để admin sửa lỗi rồi lưu lại
                }}
            />

            {/* DIALOG XÁC NHẬN XOÁ */}
            <ConfirmDialog 
                open={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ ...deleteConfirm, open: false })}
                onConfirm={handleConfirmDelete}
                title={deleteConfirm.type === "vocab" ? "Xoá từ vựng" : "Xoá câu mẫu"}
                content="Hành động này không thể hoàn tác. Bạn chắc chắn chứ?"
            />

            {/* TOAST MESSAGE */}
            <Snackbar
                open={toast.open}
                autoHideDuration={4000}
                onClose={handleCloseToast}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseToast} severity={toast.severity} variant="filled" sx={{ width: '100%', boxShadow: 3 }}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
