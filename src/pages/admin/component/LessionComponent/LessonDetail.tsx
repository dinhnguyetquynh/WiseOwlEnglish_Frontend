import { Box, Typography, Button, CircularProgress, MenuItem, Select } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getLessonDetail, type LessonDetails, type LessonRes } from "../../../../api/admin";
import { useEffect, useState } from "react";
import { useHomeContext } from "../../../../context/AuthContext";
import AddContentModal from "./AddVocabModal";


interface LessonDetailProps {
    lesson: LessonRes;
    onBack: () => void;
}

export default function LessonDetail({ lesson, onBack }: LessonDetailProps) {
    const { selectedClass } = useHomeContext();

    const [detail, setDetail] = useState<LessonDetails | null>(null);
    const [loading, setLoading] = useState(false);

    const [openModal, setOpenModal] = useState(false);
    const [modalMode, setModalMode] = useState<"vocab" | "sentence">("vocab");

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
                                <Button variant="contained" sx={{ bgcolor: "#ef5350", minWidth: 60, fontSize: 12 }}>
                                    Xoá
                                </Button>
                                <Button variant="contained" sx={{ bgcolor: "#64b5f6", minWidth: 70, fontSize: 12 }}>
                                    Chi tiết
                                </Button>
                            </Box>
                        </Box>
                    ))}
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
                                <Button variant="contained" sx={{ bgcolor: "#ef5350", minWidth: 60, fontSize: 12 }}>
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
        </Box>
    );
}
