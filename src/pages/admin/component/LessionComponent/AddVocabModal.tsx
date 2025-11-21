import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    TextField,
    Button,
    Checkbox,
    CircularProgress,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { uploadAudio, uploadVocabImage, createVocab, createSentences } from "../../../../api/admin";

interface AddContentModalProps {
    open: boolean;
    onClose: () => void;
    lessonId: number;
    onSuccess: () => void;
    mode: "vocab" | "sentence";
}

export default function AddContentModal({
    open,
    onClose,
    lessonId,
    onSuccess,
    mode,
}: AddContentModalProps) {
    const isVocab = mode === "vocab";


    const [loading, setLoading] = useState(false);

    const [isUsed, setIsUsed] = useState(true);




    useEffect(() => {
        // Reset tất cả field khi đổi mode
        setTermEn("");
        setTermVi("");
        setPhonetic("");
        setPartOfSpeech("");

        setIsUsed(true);

        setImageFile(null);
        setPreviewImage("");

        setAudioNormal(null);
        setAudioSlow(null);

    }, [mode, open]);



    const [termEn, setTermEn] = useState("");
    const [termVi, setTermVi] = useState("");

    const [phonetic, setPhonetic] = useState("");
    const [partOfSpeech, setPartOfSpeech] = useState("");

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState("");

    const [audioNormal, setAudioNormal] = useState<File | null>(null);
    const [audioSlow, setAudioSlow] = useState<File | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!termEn.trim() || !termVi.trim()) {
            enqueueSnackbar("Vui lòng nhập đầy đủ thông tin", { variant: "warning" });
            return;
        }

        try {
            setLoading(true);

            let imgUrl = "";
            let audioNormalUrl = "";
            let audioSlowUrl = "";

            if (imageFile) imgUrl = await uploadVocabImage(imageFile);
            if (audioNormal) audioNormalUrl = await uploadAudio(audioNormal);
            if (audioSlow) audioSlowUrl = await uploadAudio(audioSlow);

            if (isVocab) {
                await createVocab({
                    term_en: termEn,
                    term_vn: termVi,
                    phonetic,
                    partOfSpeech,
                    lessonId,
                    isForLearning: isUsed,
                    urlImg: imgUrl,
                    urlAudioNormal: audioNormalUrl,
                    durationSecNormal: 2,
                    urlAudioSlow: audioSlowUrl,
                    durationSecSlow: 2,
                });
            } else {
                await createSentences({
                    sen_en: termEn,
                    sen_vn: termVi,
                    lessonId,
                    isForLearning: isUsed,
                    urlImg: imgUrl,
                    urlAudioNormal: audioNormalUrl,
                    durationSecNormal: 2,
                    urlAudioSlow: audioSlowUrl,
                    durationSecSlow: 2,
                });
            }

            enqueueSnackbar(isVocab ? "Tạo từ vựng thành công!" : "Tạo câu thành công!", {
                variant: "success",
            });

            onSuccess();
            onClose();
        } catch (e) {
            console.error(e);
            enqueueSnackbar("Lỗi tạo dữ liệu!", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
            PaperProps={{ sx: { height: "95vh" } }}
        >
            <DialogTitle sx={{ fontWeight: 700, fontSize: 22 }}>
                {isVocab ? "Tạo từ vựng mới" : "Tạo câu mới"}
            </DialogTitle>

            <DialogContent>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2, // optional: khoảng cách giữa các dòng
                    }}
                >
                    <Box>

                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                gap: 2,
                                mt: 2,
                            }}
                        >
                            <Box sx={{ flex: 1 }}>
                                <Typography sx={{ mb: 1 }}>
                                    {isVocab ? "Từ tiếng Anh" : "Câu tiếng Anh"}
                                </Typography>
                                <TextField
                                    fullWidth
                                    value={termEn}
                                    onChange={(e) => setTermEn(e.target.value)}
                                />
                            </Box>

                            <Box sx={{ flex: 1 }}>
                                <Typography sx={{ mb: 1 }}>
                                    {isVocab ? "Từ tiếng Việt" : "Câu tiếng Việt"}
                                </Typography>
                                <TextField
                                    fullWidth
                                    value={termVi}
                                    onChange={(e) => setTermVi(e.target.value)}
                                />
                            </Box>
                        </Box>
                        {/* Chỉ từ vựng mới có phiên âm + loại từ */}
                        {isVocab && (
                            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ mb: 1 }}>Phiên âm</Typography>
                                    <TextField fullWidth value={phonetic} onChange={(e) => setPhonetic(e.target.value)} />
                                </Box>

                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ mb: 1 }}>Loại từ</Typography>
                                    <TextField fullWidth value={partOfSpeech} onChange={(e) => setPartOfSpeech(e.target.value)} />
                                </Box>
                            </Box>
                        )}


                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mt: 1,
                                }}
                            >
                                <Checkbox
                                    checked={isUsed}
                                    onChange={(e) => setIsUsed(e.target.checked)}
                                />
                                <Typography sx={{ mb: 0 }}>Dùng cho bài học</Typography>

                            </Box>
                        </Box>




                    </Box>


                    <Box sx={{ display: "flex", gap: 4, mt: 2 }}>

                        {/* LEFT */}
                        <Box sx={{ flex: 1 }}>


                            <Box sx={{ mt: 2 }}>
                                <Typography sx={{ mb: 1 }}>Ảnh minh hoạ</Typography>
                                <Button variant="outlined" component="label" fullWidth sx={{ height: 50, fontWeight: 700 }}>
                                    THÊM ẢNH +
                                    <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                                </Button>
                            </Box>

                            {previewImage && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography sx={{ mb: 1 }}>Xem trước</Typography>
                                    <Box
                                        component="img"
                                        src={previewImage}
                                        sx={{
                                            width: "100%",
                                            height: 180,
                                            objectFit: "contain",
                                            border: "1px solid #ccc",
                                            borderRadius: 2,
                                        }}
                                    />
                                </Box>
                            )}
                        </Box>

                        {/* RIGHT – AUDIO */}
                        <Box sx={{ flex: 1 }}>
                            <Box>
                                <Typography sx={{ mb: 1 }}>Âm thanh tốc độ thường</Typography>
                                <Button variant="outlined" component="label" fullWidth sx={{ height: 50, fontWeight: 700 }}>
                                    THÊM ÂM THANH +
                                    <input type="file" hidden accept="audio/*"
                                        onChange={(e) => setAudioNormal(e.target.files?.[0] ?? null)} />
                                </Button>

                                {audioNormal && (
                                    <Box sx={{ mt: 1 }}>
                                        <Typography sx={{ mb: 1 }}>Preview:</Typography>
                                        <audio controls src={URL.createObjectURL(audioNormal)} style={{ width: "100%" }} />
                                    </Box>
                                )}
                            </Box>

                            <Box sx={{ mt: 4 }}>
                                <Typography sx={{ mb: 1 }}>Âm thanh tốc độ chậm</Typography>
                                <Button variant="outlined" component="label" fullWidth sx={{ height: 50, fontWeight: 700 }}>
                                    THÊM ÂM THANH +
                                    <input type="file" hidden accept="audio/*"
                                        onChange={(e) => setAudioSlow(e.target.files?.[0] ?? null)} />
                                </Button>

                                {audioSlow && (
                                    <Box sx={{ mt: 1 }}>
                                        <Typography sx={{ mb: 1 }}>Preview:</Typography>
                                        <audio controls src={URL.createObjectURL(audioSlow)} style={{ width: "100%" }} />
                                    </Box>
                                )}
                            </Box>
                        </Box>

                    </Box>
                </Box>

            </DialogContent >

            <DialogActions sx={{ justifyContent: "center", mt: 2 }}>
                <Button onClick={onClose} variant="outlined" sx={{ width: 120 }}>
                    Hủy
                </Button>

                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    sx={{ width: 160, bgcolor: "#4CAF50", fontWeight: 700 }}
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> :
                        isVocab ? "Tạo từ vựng" : "Tạo câu"}
                </Button>
            </DialogActions>
        </Dialog >
    );
}
